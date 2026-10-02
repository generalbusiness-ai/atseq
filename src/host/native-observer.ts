/** Host observation assertions. No observer signature, authority verdict or public support registration. */
import { didWebToUrl, isDidWeb } from '@atproto/did';
import { AtseqError, ProtocolError } from '../core/errors.ts';
import { deepFreeze } from '../core/freeze.ts';
import { deriveIdentityBinding, sameIdentityObservation, type IdentityEvidence } from '../protocol/identity-binding.ts';
import { identityObject, parseIdentityJson } from '../protocol/identity-json.ts';
import { PLC_EVIDENCE_LIMITS } from '../protocol/identity-plc.ts';
import { NativeObserverCar } from '../protocol/native-observer-car.ts';
import type { AuthenticatedRepo } from '../protocol/native-proof.ts';
import { NATIVE_NSID, nativeRef } from '../protocol/native-schema.ts';
import {
  NativeAnchor,
  nativePath,
  nativeGenesisPath,
  nativeEntryPath,
  nativeObservationSubject,
  nativeRetryIdentity,
  readNativeRecord,
  readNativeValue,
  verifyNativeEntryContents,
  type ByteContentReader,
  type NativeAccountOperation,
  type NativeIntent,
  type NativeEpoch,
  type NativeEpochCurrent,
  type NativeObservation,
  type NativeMethodEvidence,
} from '../protocol/native-wire.ts';
import { contentCid, encodeBlock, bytes, link } from '../protocol/wire.ts';
import {
  nativeAuthoritySnapshot,
  type NativeAuthorityState,
  type NativeAuthoritySnapshot,
} from '../application/native-authority.ts';
import { IdentityFetch } from './identity-fetch.ts';

interface Policy {
  $type: string;
  algorithm: string;
  plcDirectory: string;
  allowWeb: boolean;
  checkpoint: string;
}
declare const preparationBrand: unique symbol;
export interface NativeObservationPreparation {
  readonly [preparationBrand]: true;
}
declare const captureBrand: unique symbol;
export interface NativeObservationCapture {
  readonly [captureBrand]: true;
}
export type NativeSubjectRefusal =
  | {
      readonly code: 'subject_absent';
      readonly path: string;
      readonly expectedCid: string | null;
      readonly observedCid: null;
      readonly root: string;
    }
  | {
      readonly code: 'subject_replaced';
      readonly path: string;
      readonly expectedCid: string;
      readonly observedCid: string;
      readonly root: string;
    };
export type NativeObservationResult =
  { kind: 'captured'; capture: NativeObservationCapture } | { kind: 'refused'; refusal: NativeSubjectRefusal };
interface Preparation {
  owner: NativeObserver;
  prior: NativeAuthorityState;
  snapshot: NativeAuthoritySnapshot;
  subject: NativeAccountOperation | NativeIntent;
  principal: string;
}
export interface NativeObservationCaptureData {
  kind: 'account' | 'app';
  principal: string;
  root: string;
  rev: string;
  assuranceClass: 'plc-audit-v1' | 'web-observation-v1';
  policy: string;
  descriptor: string;
  proofs: string[];
  completed: NativeAccountOperation | NativeIntent | null;
  blocks: Map<string, Uint8Array<ArrayBuffer>>;
}
interface Capture extends NativeObservationCaptureData {
  owner: NativeObserver;
  prior: NativeAuthorityState | null;
}
const preparations = new WeakMap<object, Preparation>(),
  captures = new WeakMap<object, Capture>();
function invalid(message: string): never {
  throw new ProtocolError('envelope', message);
}
function unavailable(message: string): never {
  throw new AtseqError('content_unavailable', message);
}
class SubjectFailure {
  constructor(readonly refusal: NativeSubjectRefusal) {}
}
class Restart {}
type Method = {
  evidence: IdentityEvidence;
  raw: Uint8Array;
  source: string;
  binding: Awaited<ReturnType<typeof deriveIdentityBinding>>;
};
type Recovery = Extract<NativeIntent['operation'], { $type: 'ai.generalbusiness.atseq.defs#recoverParticipant' }>;
type Selection = { car: NativeObserverCar; repo: AuthenticatedRepo; recovered: boolean };
function ownedSubject(value: unknown): Record<string, any> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('Expected omitted-observation subject');
  return structuredClone(value) as Record<string, any>;
}
function cancellation(signal?: AbortSignal) {
  if (signal !== undefined && !(signal instanceof AbortSignal)) invalid('Expected cancellation signal');
  if (signal?.aborted) unavailable('Observation canceled');
}
function timestamp(value?: string) {
  const result = value ?? new Date().toISOString();
  if (
    typeof result !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(result) ||
    !Number.isFinite(new Date(result).getTime()) ||
    new Date(result).toISOString() !== result
  )
    invalid('Invalid observation diagnostic timestamp');
  return result;
}

export class NativeObserver {
  #anchor: NativeAnchor;
  #policy: Policy;
  private constructor(anchor: NativeAnchor, policy: Policy) {
    this.#anchor = anchor;
    this.#policy = policy;
  }
  static async fromAnchor(anchor: NativeAnchor, reader: ByteContentReader): Promise<NativeObserver> {
    const checked = await NativeAnchor.from(anchor.genesis, { app: anchor.genesis.app, genesis: anchor.cid });
    const cid = checked.genesis.observationPolicy.$link;
    const content = await readNativeRecord<{ body: Policy }>(NATIVE_NSID.content, cid, await reader.get(cid));
    if (
      content.body.$type !== nativeRef('observationPolicy') ||
      content.body.algorithm !== 'atseq-account-observation-v1' ||
      content.body.checkpoint !== 'native-publication-v1'
    )
      unavailable('Unsupported appointed observation policy');
    return new NativeObserver(checked, content.body);
  }
  #prepare(
    prior: NativeAuthorityState,
    subject: NativeAccountOperation | NativeIntent,
    principal: string,
  ): NativeObservationPreparation {
    const snapshot = nativeAuthoritySnapshot(prior);
    if (
      snapshot.app !== this.#anchor.genesis.app ||
      snapshot.genesis !== this.#anchor.cid ||
      subject.app !== snapshot.app ||
      subject.genesis.$link !== snapshot.genesis
    )
      invalid('Observation subject differs from captured scope');
    const account = subject.$type === nativeRef('accountOperation') ? (subject as NativeAccountOperation) : null;
    const intent = account ? null : (subject as NativeIntent);
    const context = account ?? (intent!.operation as Recovery);
    if (
      snapshot.frontier.position === Number.MAX_SAFE_INTEGER ||
      context.position !== snapshot.frontier.position + 1 ||
      context.prev.$link !== snapshot.frontier.entry
    )
      invalid('Observation subject differs from captured frontier');
    const expected = snapshot.principals.find((row) => row.principal === principal);
    if (
      (context.expectedEpoch?.$link ?? null) !== (expected?.epoch ?? null) ||
      (context.expectedObservation?.$link ?? null) !== (expected?.observation?.cid ?? null)
    )
      invalid('Observation subject differs from captured epoch or floor');
    if (intent && snapshot.retries.includes(nativeRetryIdentity(intent)))
      invalid('Actor nonce already occurs in accepted history');
    const preparation = Object.freeze({}) as NativeObservationPreparation;
    preparations.set(preparation, { owner: this, prior, snapshot, subject, principal });
    return preparation;
  }
  async prepareAccount(prior: NativeAuthorityState, value: unknown): Promise<NativeObservationPreparation> {
    const subject = ownedSubject(value);
    if (Object.hasOwn(subject, 'observation')) invalid('Fresh preparation requires omitted observation');
    const checked = await readNativeValue<NativeAccountOperation>(nativeRef('accountOperation'), {
      ...subject,
      observation: link(this.#anchor.cid),
    });
    return this.#prepare(prior, checked, checked.principal);
  }
  async prepareRecovery(prior: NativeAuthorityState, value: unknown): Promise<NativeObservationPreparation> {
    const subject = ownedSubject(value),
      operation = subject.operation;
    if (
      !identityObject(operation) ||
      operation.$type !== nativeRef('recoverParticipant') ||
      Object.hasOwn(operation, 'observation')
    )
      invalid('Expected fresh omitted-observation recovery intent');
    const checked = await readNativeValue<NativeIntent>(nativeRef('intent'), {
      ...subject,
      operation: { ...operation, observation: link(this.#anchor.cid) },
    });
    const recovery = checked.operation as Recovery;
    return this.#prepare(prior, checked, recovery.target);
  }
  #preparation(preparation: NativeObservationPreparation): Preparation {
    const data = preparation && typeof preparation === 'object' ? preparations.get(preparation) : undefined;
    if (!data || data.owner !== this) invalid('Expected owned observation preparation');
    return data;
  }
  #capture(capture: NativeObservationCapture): Capture {
    const data = capture && typeof capture === 'object' ? captures.get(capture) : undefined;
    if (!data || data.owner !== this) invalid('Expected owned observation capture');
    return data;
  }
  readCapture(capture: NativeObservationCapture): NativeObservationCaptureData {
    const data = this.#capture(capture);
    return {
      kind: data.kind,
      principal: data.principal,
      root: data.root,
      rev: data.rev,
      assuranceClass: data.assuranceClass,
      policy: data.policy,
      descriptor: data.descriptor,
      proofs: [...data.proofs],
      completed: structuredClone(data.completed),
      blocks: new Map([...data.blocks].map(([cid, raw]) => [cid, new Uint8Array(raw)])),
    };
  }
  assertCapturePrior(capture: NativeObservationCapture, current: NativeAuthorityState): void {
    const data = this.#capture(capture);
    nativeAuthoritySnapshot(current); // Reject snapshots and reconstructed capability lookalikes.
    if (data.prior === null || data.prior !== current)
      invalid('Observation capture differs from current accepted prior');
  }
  async #method(principal: string, fetch: IdentityFetch, signal?: AbortSignal): Promise<Method> {
    cancellation(signal);
    fetch.assertActive(signal);
    let evidence: IdentityEvidence, source: string, raw: Uint8Array;
    if (principal.startsWith('did:plc:')) {
      source = this.#policy.plcDirectory + '/' + principal + '/log/audit';
      raw = await fetch.bytesFrom(source, PLC_EVIDENCE_LIMITS.bytes, signal);
      const parsed = parseIdentityJson(raw, PLC_EVIDENCE_LIMITS.bytes);
      if (!Array.isArray(parsed) || !parsed.length) invalid('Expected nonempty PLC audit');
      if (parsed.length > PLC_EVIDENCE_LIMITS.rows) unavailable('PLC audit row budget exceeded');
      const last = parsed.at(-1);
      if (!identityObject(last) || typeof last.cid !== 'string') invalid('PLC audit lacks candidate tip');
      evidence = { assuranceClass: 'plc-audit-v1', auditBytes: raw, selectedTipCid: last.cid };
    } else {
      if (!this.#policy.allowWeb || !isDidWeb(principal))
        unavailable('Appointed policy does not support this principal');
      source = didWebToUrl(principal).href;
      raw = await fetch.bytesFrom(source, 32 * 1024, signal);
      evidence = { assuranceClass: 'web-observation-v1', documentBytes: raw };
    }
    return { evidence, raw, source, binding: await deriveIdentityBinding(principal, evidence) };
  }
  #endpoint(method: Method, name: string, parameters: [string, string][]) {
    const url = new URL('/xrpc/com.atproto.sync.' + name, method.binding.pdsOrigin);
    for (const [key, value] of parameters) url.searchParams.append(key, value);
    return url;
  }
  async #selection(method: Method, fetch: IdentityFetch, path: string, signal?: AbortSignal): Promise<Selection> {
    fetch.assertActive(signal);
    const [collection, rkey] = path.split('/');
    let raw: Uint8Array,
      recovered = false;
    try {
      raw = await fetch.bytesFrom(
        this.#endpoint(method, 'getRecord', [
          ['did', method.binding.principal],
          ['collection', collection!],
          ['rkey', rkey!],
        ]),
        32 * 1024 * 1024,
        signal,
      );
    } catch (error) {
      if (!(error instanceof AtseqError) || error.code !== 'content_unavailable' || signal?.aborted) throw error;
      fetch.assertActive(signal);
      recovered = true;
      raw = await fetch.bytesFrom(
        this.#endpoint(method, 'getRepo', [['did', method.binding.principal]]),
        32 * 1024 * 1024,
        signal,
      );
    }
    const car = new NativeObserverCar(raw);
    return { car, repo: await car.authenticate(method.binding.principal, method.binding.signingKeyDid), recovered };
  }
  async #recover(selection: Selection, method: Method, fetch: IdentityFetch, signal?: AbortSignal): Promise<Selection> {
    fetch.assertActive(signal);
    if (selection.recovered) unavailable('Selected observation proof remains incomplete');
    const raw = await fetch.bytesFrom(
      this.#endpoint(method, 'getRepo', [['did', method.binding.principal]]),
      32 * 1024 * 1024,
      signal,
    );
    const car = new NativeObserverCar(raw),
      repo = await car.authenticate(method.binding.principal, method.binding.signingKeyDid);
    if (repo.root !== selection.repo.root) throw new Restart();
    return { car, repo, recovered: true };
  }
  async #paths(
    selection: Selection,
    method: Method,
    fetch: IdentityFetch,
    paths: readonly string[],
    signal?: AbortSignal,
  ): Promise<Selection> {
    if (new Set(paths).size > 16) unavailable('Observation requires more than sixteen subject records');
    for (;;) {
      cancellation(signal);
      fetch.assertActive(signal);
      const missing = new Set<string>();
      for (const path of paths) {
        const found = await selection.repo.lookup(path);
        if (found.kind === 'missing') missing.add(found.cid);
      }
      if (!missing.size) return selection;
      try {
        const requested = [...missing].sort();
        for (let offset = 0; offset < requested.length; offset += 64) {
          const round = requested.slice(offset, offset + 64);
          const raw = await fetch.bytesFrom(
            this.#endpoint(method, 'getBlocks', [
              ['did', method.binding.principal],
              ...round.map((cid) => ['cids[]', cid] as [string, string]),
            ]),
            32 * 1024 * 1024,
            signal,
          );
          selection.car.addExact(raw, round);
        }
        selection.repo = await selection.car.authenticate(method.binding.principal, method.binding.signingKeyDid);
      } catch (error) {
        if (!(error instanceof AtseqError) || error.code !== 'content_unavailable' || signal?.aborted) throw error;
        selection = await this.#recover(selection, method, fetch, signal);
      }
    }
  }
  async #record<T>(
    selection: Selection,
    path: string,
    expectedCid: string | null,
    selected: Map<string, string>,
  ): Promise<T> {
    const found = await selection.repo.lookup(path);
    if (found.kind === 'missing') unavailable('Required observation proof block is missing');
    if (found.kind === 'absent')
      throw new SubjectFailure(
        deepFreeze({ code: 'subject_absent', path, expectedCid, observedCid: null, root: selection.repo.root }),
      );
    if (expectedCid !== null && found.cid !== expectedCid)
      throw new SubjectFailure(
        deepFreeze({ code: 'subject_replaced', path, expectedCid, observedCid: found.cid, root: selection.repo.root }),
      );
    const [collection, rkey] = path.split('/');
    const value = await readNativeRecord<T>(collection!, rkey!, found.bytes);
    selected.set(path, found.cid);
    return value;
  }
  async #accountProof(preparation: Preparation, before: Method, fetch: IdentityFetch, signal?: AbortSignal) {
    const subject = preparation.subject,
      account = subject.$type === nativeRef('accountOperation') ? (subject as NativeAccountOperation) : null;
    const recovery = account ? null : ((subject as NativeIntent).operation as Recovery);
    const operation = account?.operation;
    const pointerPath = nativePath(NATIVE_NSID.epochCurrent, 'self');
    const primary =
      operation?.$type === nativeRef('admitGrant')
        ? nativePath(NATIVE_NSID.grant, operation.grant.id)
        : operation?.$type === nativeRef('revokeGrant')
          ? nativePath(NATIVE_NSID.revoke, operation.revoke.id)
          : pointerPath;
    let selection = await this.#selection(before, fetch, primary, signal);
    const selected = new Map<string, string>();
    if (operation?.$type === nativeRef('revokeGrant')) {
      selection = await this.#paths(selection, before, fetch, [primary], signal);
      await this.#record(selection, primary, operation.revoke.cid.$link, selected);
    } else {
      // D3-1: prove and compare the pointer before any target absence/replacement diagnostic.
      selection = await this.#paths(
        selection,
        before,
        fetch,
        [pointerPath, ...(operation?.$type === nativeRef('admitGrant') ? [primary] : [])],
        signal,
      );
      const current = await this.#record<NativeEpochCurrent>(selection, pointerPath, null, selected);
      const target =
        recovery?.epoch.$link ?? (operation?.$type === nativeRef('advanceEpoch') ? operation.epoch.$link : null);
      if (target !== null && target !== current.epoch.$link)
        invalid(
          recovery
            ? 'Recovery epoch differs from selected pointer'
            : 'Advance epoch differs from selected current pointer',
        );
      const expected = account?.expectedEpoch?.$link ?? null;
      let next = current.epoch.$link;
      const visited = new Set<string>();
      for (;;) {
        if (visited.has(next)) invalid('Cyclic observation epoch evidence');
        visited.add(next);
        const path = nativePath(NATIVE_NSID.epoch, next);
        // Batch known grant + all discovered epoch paths; shared missing nodes deduplicate.
        const paths = [...selected.keys(), path, ...(operation?.$type === nativeRef('admitGrant') ? [primary] : [])];
        selection = await this.#paths(selection, before, fetch, paths, signal);
        const epoch = await this.#record<NativeEpoch>(selection, path, next, selected);
        if (visited.size === 1 && epoch.id.$bytes !== current.id.$bytes)
          invalid('Current epoch pointer ID differs from transition');
        if (
          recovery ||
          expected === null ||
          next === expected ||
          epoch.previous === null ||
          epoch.previous.$link === expected
        )
          break;
        next = epoch.previous.$link;
      }
      if (operation?.$type === nativeRef('admitGrant'))
        await this.#record(selection, primary, operation.grant.cid.$link, selected);
    }
    return { selection, selected };
  }
  async #retain(raw: Uint8Array, blocks: Map<string, Uint8Array<ArrayBuffer>>) {
    const chunks = [];
    for (let offset = 0; offset < raw.length; offset += 32 * 1024)
      chunks.push(
        link(
          await this.#stash(
            { $type: nativeRef('byteChunk'), bytes: bytes(raw.slice(offset, offset + 32 * 1024)) },
            blocks,
          ),
        ),
      );
    return this.#stash({ $type: nativeRef('byteManifest'), byteLength: raw.length, chunks }, blocks);
  }
  async #stash(body: unknown, blocks: Map<string, Uint8Array<ArrayBuffer>>) {
    const value = await readNativeValue(NATIVE_NSID.content, { $type: NATIVE_NSID.content, version: 1, body });
    const cid = await contentCid(value);
    blocks.set(cid, encodeBlock(value));
    return cid;
  }
  async #methodRef(method: Method, blocks: Map<string, Uint8Array<ArrayBuffer>>): Promise<NativeMethodEvidence> {
    const retained = link(await this.#retain(method.raw, blocks));
    return method.evidence.assuranceClass === 'plc-audit-v1'
      ? {
          $type: nativeRef('plcAudit'),
          bytes: retained,
          source: method.source,
          selectedTip: link(method.evidence.selectedTipCid),
        }
      : { $type: nativeRef('webDocument'), bytes: retained, source: method.source };
  }
  #mint(data: Omit<Capture, 'owner'>): NativeObservationCapture {
    const capability = Object.freeze({}) as NativeObservationCapture;
    captures.set(capability, { ...data, owner: this });
    return capability;
  }
  async observePrepared(
    preparation: NativeObservationPreparation,
    options: { signal?: AbortSignal; observedAt?: string } = {},
  ): Promise<NativeObservationResult> {
    const data = this.#preparation(preparation),
      observedAt = timestamp(options.observedAt);
    cancellation(options.signal);
    const fetch = new IdentityFetch();
    for (let attempt = 0; attempt < 3; attempt++) {
      const before = await this.#method(data.principal, fetch, options.signal);
      let proof: { selection: Selection; selected: Map<string, string> } | undefined;
      let failure: unknown;
      try {
        proof = await this.#accountProof(data, before, fetch, options.signal);
      } catch (error) {
        if (error instanceof Restart) continue;
        if (!(error instanceof SubjectFailure) && !(error instanceof AtseqError && error.kind === 'invalid_input'))
          throw error;
        failure = error;
      }
      const after = await this.#method(data.principal, fetch, options.signal);
      if (!sameIdentityObservation(before.binding, after.binding)) continue;
      fetch.assertActive(options.signal);
      if (failure instanceof SubjectFailure) return { kind: 'refused', refusal: failure.refusal };
      if (failure !== undefined) throw failure;
      if (!proof) throw new AtseqError('runtime_fault', 'Observation proof result is missing');
      cancellation(options.signal);
      const blocks = new Map<string, Uint8Array<ArrayBuffer>>();
      const beforeRef = await this.#methodRef(before, blocks),
        afterRef = await this.#methodRef(after, blocks);
      const proofCid = await this.#retain(await proof.selection.car.bytes(), blocks);
      const subject = data.subject,
        account = subject.$type === nativeRef('accountOperation') ? (subject as NativeAccountOperation) : null;
      const context = account ?? ((subject as NativeIntent).operation as Recovery);
      const descriptor = await this.#stash(
        {
          $type: nativeRef('observation'),
          policy: this.#anchor.genesis.observationPolicy,
          principal: data.principal,
          context: {
            app: subject.app,
            genesis: subject.genesis,
            position: context.position,
            prev: context.prev,
            subject: link(await nativeObservationSubject(subject)),
          },
          binding: { signingKeyDid: before.binding.signingKeyDid, pdsOrigin: before.binding.pdsOrigin },
          before: beforeRef,
          after: afterRef,
          repositoryRoot: link(proof.selection.repo.root),
          records: [...proof.selected]
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
            .map(([path, cid]) => ({ path, cid: link(cid) })),
          proofs: [link(proofCid)],
          observedAt,
        } satisfies NativeObservation,
        blocks,
      );
      const completed = structuredClone(subject);
      if (account) (completed as NativeAccountOperation).observation = link(descriptor);
      else
        (completed as NativeIntent).operation = {
          ...(completed as NativeIntent).operation,
          observation: link(descriptor),
        } as NativeIntent['operation'];
      if (
        data.snapshot.consumedObservations.includes(descriptor) ||
        (account && data.snapshot.requests.includes(await contentCid(completed)))
      )
        invalid('Completed observation or account request occurs twice in accepted history');
      fetch.assertActive(options.signal);
      return {
        kind: 'captured',
        capture: this.#mint({
          kind: 'account',
          prior: data.prior,
          principal: data.principal,
          root: proof.selection.repo.root,
          rev: proof.selection.repo.rev,
          assuranceClass: before.binding.assuranceClass,
          policy: this.#anchor.genesis.observationPolicy.$link,
          descriptor,
          proofs: [proofCid],
          completed,
          blocks,
        }),
      };
    }
    unavailable('Observation binding or selected root kept changing');
  }
  async observeApp(entry?: unknown, options: { signal?: AbortSignal } = {}): Promise<NativeObservationResult> {
    const checked = entry === undefined ? null : await verifyNativeEntryContents(entry, this.#anchor);
    const genesisPath = nativeGenesisPath(this.#anchor.cid),
      entryPath = checked ? nativeEntryPath(this.#anchor.cid, checked.entry.position) : null;
    const fetch = new IdentityFetch();
    cancellation(options.signal);
    for (let attempt = 0; attempt < 3; attempt++) {
      const before = await this.#method(this.#anchor.genesis.app, fetch, options.signal);
      let selection: Selection | undefined, failure: unknown;
      try {
        selection = await this.#selection(before, fetch, entryPath ?? genesisPath, options.signal);
        selection = await this.#paths(
          selection,
          before,
          fetch,
          [genesisPath, ...(entryPath ? [entryPath] : [])],
          options.signal,
        );
        const selected = new Map<string, string>();
        await this.#record(selection, genesisPath, this.#anchor.cid, selected);
        if (entryPath) await this.#record(selection, entryPath, checked!.entryCid, selected);
      } catch (error) {
        if (error instanceof Restart) continue;
        if (!(error instanceof SubjectFailure) && !(error instanceof AtseqError && error.kind === 'invalid_input'))
          throw error;
        failure = error;
      }
      const after = await this.#method(this.#anchor.genesis.app, fetch, options.signal);
      if (!sameIdentityObservation(before.binding, after.binding)) continue;
      fetch.assertActive(options.signal);
      if (failure instanceof SubjectFailure) return { kind: 'refused', refusal: failure.refusal };
      if (failure !== undefined) throw failure;
      if (!selection) throw new AtseqError('runtime_fault', 'App observation proof result is missing');
      cancellation(options.signal);
      const blocks = new Map<string, Uint8Array<ArrayBuffer>>();
      const beforeRef = await this.#methodRef(before, blocks),
        afterRef = await this.#methodRef(after, blocks);
      const proofCid = await this.#retain(await selection.car.bytes(), blocks);
      const descriptor = await this.#stash(
        {
          $type: nativeRef('appBinding'),
          policy: this.#anchor.genesis.observationPolicy,
          principal: this.#anchor.genesis.app,
          binding: { signingKeyDid: before.binding.signingKeyDid, pdsOrigin: before.binding.pdsOrigin },
          before: beforeRef,
          after: afterRef,
          repositoryRoot: link(selection.repo.root),
        },
        blocks,
      );
      fetch.assertActive(options.signal);
      return {
        kind: 'captured',
        capture: this.#mint({
          kind: 'app',
          prior: null,
          principal: this.#anchor.genesis.app,
          root: selection.repo.root,
          rev: selection.repo.rev,
          assuranceClass: before.binding.assuranceClass,
          policy: this.#anchor.genesis.observationPolicy.$link,
          descriptor,
          proofs: [proofCid],
          completed: null,
          blocks,
        }),
      };
    }
    unavailable('App observation binding or selected root kept changing');
  }
}
