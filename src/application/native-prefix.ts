/** Private complete-from-genesis publication owner. Checkpoints and restore do not mint views here. */
import { createSync, CODEC_DCBOR, toString } from '@atcute/cid';
import { assertNativeSourceContract, NATIVE_SOURCE_CONTRACT } from '../definition/native-source-contract.ts';
import { AtseqError, ProtocolError } from '../core/errors.ts';
import { deepFreeze } from '../core/freeze.ts';
import { deriveIdentityBinding, sameIdentityObservation, type IdentityEvidence } from '../protocol/identity-binding.ts';
import { assertAuthenticatedRepo, type AuthenticatedRepo } from '../protocol/native-proof.ts';
import { NATIVE_NSID, nativeRef } from '../protocol/native-schema.ts';
import {
  NativeAnchor,
  nativeGenesisPath,
  nativeHeadPath,
  nativeEntryPath,
  nativePath,
  readNativeHead,
  readNativeRecord,
  readNativeValue,
  verifyNativeEntryContents,
  verifyNativeSigned,
  nativeRetryIdentity,
  nativeObservationSubject,
  type ByteContentReader,
  type NativeContent,
  type NativeObservation,
  type NativeAccountOperation,
  type NativeSignedRequest,
  type NativeHead,
} from '../protocol/native-wire.ts';
import { decodeBlock, encodeBlock, sameBytes, contentCid } from '../protocol/wire.ts';

declare const prefixBrand: unique symbol;
declare const extensionBrand: unique symbol;
export interface NativePrefix {
  readonly [prefixBrand]: true;
}
export interface NativePrefixExtension {
  readonly [extensionBrand]: true;
}
export interface NativePrefixPolicy {
  $type: string;
  algorithm: string;
  plcDirectory: string;
  allowWeb: boolean;
  checkpoint: string;
}
interface Row extends Awaited<ReturnType<typeof verifyNativeEntryContents>> {
  descriptor: NativeObservation | null;
  descriptorCid: string | null;
  retry: string | null;
  publicationAssurance: 'plc-audit-v1' | 'web-observation-v1';
  root: string;
  rev: string;
}
interface Owner {
  anchor: NativeAnchor;
  rows: Row[];
  requests: Map<string, number>;
  retries: Map<string, number>;
  descriptors: Map<string, number>;
  current: NativePrefix;
  observedFloor: { position: number; entry: string };
  provenance: Map<string, { rev: string; binding: View['binding']; appIdentity: View['appIdentity'] }>;
  contradiction: { position: number; code: string } | null;
  pendingFault: NativePrefix | null;
}
interface View {
  owner: Owner;
  head: Readonly<NativeHead>;
  repo: AuthenticatedRepo;
  policy: Readonly<NativePrefixPolicy>;
  binding: Awaited<ReturnType<typeof deriveIdentityBinding>>;
  appIdentity: { before: IdentityEvidence; after: IdentityEvidence };
  staged?: { start: number; rows: Row[] };
  contradiction?: { position: number; code: string };
  accepted?: boolean;
}
interface Extension {
  base: NativePrefix;
  target: View;
  rows: Row[];
  proposed?: NativePrefix;
  counts: {
    signatureChecks: number;
    entryLoads: number;
    reusedEntries: number;
    descriptorLoads: number;
    indexReads: number;
    stagedIndexWrites: number;
    indexWrites: number;
    publicationLookups: number;
  };
}
const views = new WeakMap<object, View>(),
  extensions = new WeakMap<object, Extension>();
function invalid(message: string): never {
  throw new ProtocolError('envelope', message);
}
function unavailable(message: string): never {
  throw new AtseqError('content_unavailable', message);
}
function view(prefix: NativePrefix): View {
  const value = prefix && typeof prefix === 'object' ? views.get(prefix) : undefined;
  if (!value) invalid('Expected genuine verified native prefix');
  return value;
}
function extension(value: NativePrefixExtension): Extension {
  const data = value && typeof value === 'object' ? extensions.get(value) : undefined;
  if (!data) invalid('Expected genuine staged native prefix extension');
  return data;
}
function mint(value: View): NativePrefix {
  const handle = Object.freeze({}) as NativePrefix;
  views.set(handle, value);
  return handle;
}
async function membership(repo: AuthenticatedRepo, path: string, cid?: string) {
  const result = await repo.lookup(path, cid);
  if (result.kind === 'missing') unavailable('Required native prefix proof block is missing');
  if (result.kind === 'absent') invalid('Selected native root proves required prefix record absent');
  return result;
}
export interface NativePrefixPublication {
  anchor: NativeAnchor;
  appRepo: AuthenticatedRepo;
  reader: ByteContentReader;
  appIdentity: { before: IdentityEvidence; after: IdentityEvidence };
  maximumDelta?: number;
}
async function publication(input: NativePrefixPublication, owner: Owner): Promise<View> {
  const repo = input.appRepo,
    identity = structuredClone(input.appIdentity);
  assertAuthenticatedRepo(repo);
  const anchor = owner.anchor;
  if (repo.did !== anchor.genesis.app) invalid('Publication repository differs from pinned application');
  const cid = anchor.genesis.observationPolicy.$link;
  const policyBytes = await input.reader.get(cid);
  if (toString(createSync(CODEC_DCBOR, policyBytes)) !== cid) unavailable('Fetched policy differs from appointed CID');
  const policy = (await readNativeRecord<NativeContent<NativePrefixPolicy>>(NATIVE_NSID.content, cid, policyBytes))
    .body;
  if (
    policy.$type !== nativeRef('observationPolicy') ||
    policy.algorithm !== 'atseq-account-observation-v1' ||
    policy.checkpoint !== 'native-publication-v1'
  )
    unavailable('Unsupported appointed observation policy');
  const before = await deriveIdentityBinding(anchor.genesis.app, identity.before),
    after = await deriveIdentityBinding(anchor.genesis.app, identity.after);
  if (
    !sameIdentityObservation(before, after) ||
    before.signingKeyDid !== repo.signingKey ||
    (before.assuranceClass === 'web-observation-v1' && !policy.allowWeb)
  )
    invalid('Application publication key differs from retained appointed method binding');
  const genesis = await membership(repo, nativeGenesisPath(anchor.cid), anchor.cid);
  if (!sameBytes(genesis.bytes, encodeBlock(anchor.genesis))) invalid('Published genesis differs from external pin');
  const rawHead = await membership(repo, nativeHeadPath(anchor.cid));
  const head = await readNativeHead(decodeBlock(rawHead.bytes), anchor);
  return { owner, repo, head: deepFreeze(head), policy: deepFreeze(policy), binding: before, appIdentity: identity };
}
function identityAt(index: Map<string, number>, key: string, boundary: number): number | null {
  const position = index.get(key);
  return position !== undefined && position <= boundary ? position : null;
}
async function stageRows(target: View, base: View | null, maximumDelta = 10_000): Promise<Extension> {
  if (!Number.isSafeInteger(maximumDelta) || maximumDelta < 0) invalid('Invalid native prefix delta budget');
  const owner = target.owner,
    anchor = owner.anchor,
    priorHead = base?.head;
  if (owner.contradiction || owner.pendingFault)
    invalid('Native prefix has exposed contradictory interpretation evidence');
  const start = priorHead?.position ?? 0;
  if (target.head.position < owner.observedFloor.position)
    invalid('Selected native head lowers observed application floor');
  if (target.head.position < start) invalid('Selected native head lowers retained application floor');
  const delta = target.head.position - start;
  if (delta > maximumDelta) unavailable('Native prefix suffix exceeds local delta budget');
  const counts = {
    signatureChecks: 0,
    entryLoads: 0,
    reusedEntries: 0,
    descriptorLoads: 0,
    indexReads: 0,
    stagedIndexWrites: 0,
    indexWrites: 0,
    publicationLookups: 2,
  };
  if (start) {
    const boundary = await membership(target.repo, nativeEntryPath(anchor.cid, start), priorHead!.entry.$link);
    if (!sameBytes(boundary.bytes, encodeBlock(owner.rows[start - 1]!.entry)))
      invalid('Selected boundary changes retained entry');
    counts.reusedEntries++;
    counts.publicationLookups++;
  }
  // Revision is only an account cursor. Recovery audits the retained app floor rather than discarding it.
  if (
    base &&
    (target.repo.rev < base.repo.rev || (target.repo.rev === base.repo.rev && target.repo.root !== base.repo.root))
  ) {
    for (let position = 1; position < start; position++) {
      const row = owner.rows[position - 1]!;
      await membership(target.repo, nativeEntryPath(anchor.cid, position), row.entryCid);
      counts.reusedEntries++;
      counts.publicationLookups++;
    }
  }
  const rows: Row[] = [],
    requests = new Set<string>(),
    retries = new Set<string>(),
    descriptors = new Set<string>();
  let predecessor = priorHead?.entry.$link ?? anchor.cid;
  for (let position = start + 1; position <= target.head.position; position++) {
    const raw = await membership(target.repo, nativeEntryPath(anchor.cid, position));
    counts.entryLoads++;
    counts.publicationLookups++;
    const checked = await verifyNativeEntryContents(decodeBlock(raw.bytes), anchor);
    if (checked.entry.position !== position || checked.entry.prev.$link !== predecessor || checked.entryCid !== raw.cid)
      invalid('Native prefix entry does not extend selected chain');
    const signed =
      checked.entry.request.$type === nativeRef('signedRequest')
        ? (checked.entry.request as NativeSignedRequest)
        : null;
    const account = signed ? null : (checked.entry.request as NativeAccountOperation);
    if (signed) counts.signatureChecks++;
    const retry = signed ? nativeRetryIdentity(signed.intent) : null;
    const recovery =
      signed?.intent.operation.$type === nativeRef('recoverParticipant') ? signed.intent.operation : null;
    const descriptorCid = account?.observation.$link ?? recovery?.observation.$link ?? null;
    counts.indexReads += 2 * (1 + Number(retry !== null) + Number(descriptorCid !== null));
    if (identityAt(owner.requests, checked.requestCid, start) !== null || requests.has(checked.requestCid))
      invalid('A request occurs twice in ordered history');
    if (retry && (identityAt(owner.retries, retry, start) !== null || retries.has(retry)))
      invalid('Actor nonce occurs twice in ordered history');
    if (
      descriptorCid &&
      (identityAt(owner.descriptors, descriptorCid, start) !== null || descriptors.has(descriptorCid))
    )
      invalid('An observation descriptor is consumed twice');
    let descriptor: NativeObservation | null = null;
    if (descriptorCid) {
      const rawDescriptor = await membership(
        target.repo,
        nativePath(NATIVE_NSID.content, descriptorCid),
        descriptorCid,
      );
      counts.descriptorLoads++;
      counts.publicationLookups++;
      descriptor = (
        await readNativeRecord<NativeContent<NativeObservation>>(
          NATIVE_NSID.content,
          descriptorCid,
          rawDescriptor.bytes,
        )
      ).body;
      const context = account ?? recovery!;
      if (
        descriptor.$type !== nativeRef('observation') ||
        descriptor.policy.$link !== anchor.genesis.observationPolicy.$link ||
        descriptor.principal !== (account?.principal ?? recovery!.target) ||
        descriptor.context.app !== anchor.genesis.app ||
        descriptor.context.genesis.$link !== anchor.cid ||
        descriptor.context.position !== context.position ||
        descriptor.context.prev.$link !== context.prev.$link ||
        descriptor.context.subject.$link !== (await nativeObservationSubject(account ?? signed!.intent))
      )
        invalid('Observation does not bind the exact authority operation/context');
    }
    rows.push(
      deepFreeze({
        ...checked,
        retry,
        descriptorCid,
        descriptor,
        publicationAssurance: target.binding.assuranceClass,
        root: target.repo.root,
        rev: target.repo.rev,
      }),
    );
    requests.add(checked.requestCid);
    if (retry) retries.add(retry);
    if (descriptorCid) descriptors.add(descriptorCid);
    predecessor = checked.entryCid;
    counts.stagedIndexWrites += 1 + Number(retry !== null) + Number(descriptorCid !== null);
  }
  if (predecessor !== target.head.entry.$link) invalid('Selected native head differs from verified chain end');
  assertObservedFloor(target, rows, start);
  if (target.head.position > owner.observedFloor.position)
    owner.observedFloor = Object.freeze({ position: target.head.position, entry: target.head.entry.$link });
  return { base: owner.current, target, rows, counts };
}
/** One negative-only in-memory floor; it does not publish staged rows or coverage. */
function assertObservedFloor(target: View, rows: Row[], start: number): void {
  const floor = target.owner.observedFloor;
  if (target.head.position < floor.position) invalid('Selected native head lowers observed application floor');
  const actual =
    floor.position === 0
      ? target.owner.anchor.cid
      : floor.position <= start
        ? target.owner.rows[floor.position - 1]?.entryCid
        : rows[floor.position - start - 1]?.entryCid;
  if (actual !== floor.entry) invalid('Selected native prefix changes observed application floor');
}
/** Cold admission checks actual genesis and head; no synthetic zero-head proof. */
export async function openNativePrefix(input: NativePrefixPublication): Promise<NativePrefix> {
  const captured = { ...input, appIdentity: structuredClone(input.appIdentity) };
  const anchor = await NativeAnchor.from(structuredClone(input.anchor.genesis), {
    app: input.anchor.genesis.app,
    genesis: input.anchor.cid,
  });
  await assertNativeSourceContract();
  if (anchor.genesis.semantics.$link !== NATIVE_SOURCE_CONTRACT.native)
    unavailable('Unsupported native ordering semantics');
  const owner: Owner = {
    anchor,
    rows: [],
    requests: new Map(),
    retries: new Map(),
    descriptors: new Map(),
    current: null as unknown as NativePrefix,
    observedFloor: Object.freeze({ position: 0, entry: anchor.cid }),
    provenance: new Map(),
    contradiction: null,
    pendingFault: null,
  };
  const target = await publication(captured, owner),
    staged = await stageRows(target, null, input.maximumDelta);
  for (const row of staged.rows) insert(owner, row);
  retainProvenance(target);
  target.accepted = true;
  const result = mint(target);
  owner.current = result;
  return result;
}
function retainProvenance(target: View) {
  if (!target.owner.provenance.has(target.repo.root))
    target.owner.provenance.set(target.repo.root, {
      rev: target.repo.rev,
      binding: target.binding,
      appIdentity: target.appIdentity,
    });
}
function insert(owner: Owner, row: Row) {
  owner.rows.push(row);
  owner.requests.set(row.requestCid, row.entry.position);
  if (row.retry) owner.retries.set(row.retry, row.entry.position);
  if (row.descriptorCid) owner.descriptors.set(row.descriptorCid, row.entry.position);
}
export async function stageNativePrefix(
  base: NativePrefix,
  input: NativePrefixPublication,
): Promise<NativePrefixExtension> {
  const prior = view(base),
    owner = prior.owner;
  if (owner.current !== base) invalid('Stale native prefix base; stage from current accepted view');
  if (input.anchor.cid !== owner.anchor.cid || input.anchor.genesis.app !== owner.anchor.genesis.app)
    invalid('Native extension differs from base scope');
  const target = await publication(input, owner);
  if (owner.current !== base) invalid('Native prefix base changed while checking publication');
  const staged = await stageRows(target, prior, input.maximumDelta);
  staged.base = base;
  const handle = Object.freeze({}) as NativePrefixExtension;
  extensions.set(handle, staged);
  return handle;
}
/** Exact-base check is synchronous and is repeated after a caller's atomic local persistence. */
export function assertNativePrefixExtension(base: NativePrefix, candidate: NativePrefixExtension): void {
  const prior = view(base),
    staged = extension(candidate);
  if (staged.base !== base || prior.owner.current !== base || staged.target.owner !== prior.owner)
    invalid('Stale native prefix extension; stage again from current base');
  if (prior.owner.contradiction || (prior.owner.pendingFault && staged.proposed !== prior.owner.pendingFault))
    invalid('Native prefix has exposed contradictory interpretation evidence');
  assertObservedFloor(staged.target, staged.rows, prior.head.position);
}
export function nativePrefixCandidate(candidate: NativePrefixExtension): NativePrefix {
  const data = extension(candidate);
  if (!data.proposed)
    data.proposed = mint({ ...data.target, staged: { start: view(data.base).head.position, rows: data.rows } });
  return data.proposed;
}
export function acceptNativePrefix(base: NativePrefix, candidate: NativePrefixExtension): NativePrefix {
  assertNativePrefixExtension(base, candidate);
  const staged = extension(candidate),
    owner = view(base).owner;
  for (const row of staged.rows) {
    insert(owner, row);
    staged.counts.indexWrites += 1 + Number(row.retry !== null) + Number(row.descriptorCid !== null);
  }
  retainProvenance(staged.target);
  const result = nativePrefixCandidate(candidate);
  view(result).accepted = true;
  owner.current = result;
  if (view(result).contradiction && !owner.contradiction) owner.contradiction = view(result).contradiction!;
  if (owner.pendingFault === result) owner.pendingFault = null;
  return result;
}
export function nativePrefixEntry(prefix: NativePrefix, position: number) {
  const data = view(prefix);
  if (!Number.isSafeInteger(position) || position < 1 || position > data.head.position)
    unavailable('Position is outside verified native prefix');
  const row =
    data.staged && position > data.staged.start
      ? data.staged.rows[position - data.staged.start - 1]!
      : data.owner.rows[position - 1]!;
  return { anchor: data.owner.anchor, policy: data.policy, row };
}
/** A compact interpreted state may know a larger publication floor than its frontier. */
export function assertNativePrefixPrior(prefix: NativePrefix, retained: NativePrefix): void {
  const next = view(prefix),
    prior = view(retained);
  if (next.owner !== prior.owner || next.head.position < prior.head.position)
    invalid('Evidence prefix differs from retained lineage or lowers known ordering floor');
}
export function nativePrefixStatus(prefix: NativePrefix) {
  const data = view(prefix);
  return structuredClone({
    app: data.owner.anchor.genesis.app,
    genesis: data.owner.anchor.cid,
    head: data.head,
    root: data.repo.root,
    rev: data.repo.rev,
    coverage: 'complete-from-genesis' as const,
    contradiction: data.contradiction ?? data.owner.contradiction,
  });
}
export function nativePrefixHas(
  prefix: NativePrefix,
  kind: 'requests' | 'retries' | 'descriptors',
  identity: string,
  boundary?: number,
) {
  const data = view(prefix),
    end = boundary ?? data.head.position;
  if (!Number.isSafeInteger(end) || end < 0 || end > data.head.position) invalid('Invalid bounded prefix lookup');
  if (
    identityAt(data.owner[kind], identity, Math.min(end, !data.accepted ? (data.staged?.start ?? end) : end)) !== null
  )
    return true;
  return (
    (!data.accepted ? data.staged?.rows : undefined)?.some(
      (row) =>
        row.entry.position <= end &&
        (kind === 'requests' ? row.requestCid : kind === 'retries' ? row.retry : row.descriptorCid) === identity,
    ) ?? false
  );
}
/** Explicit historical diagnostic; normal lookups never copy these inventories. */
export function nativePrefixInventory(prefix: NativePrefix, boundary?: number) {
  const data = view(prefix),
    end = boundary ?? data.head.position;
  nativePrefixHas(prefix, 'requests', '', end);
  const rows = Array.from({ length: end }, (_, index) => nativePrefixEntry(prefix, index + 1).row);
  return {
    requests: rows.map((row) => row.requestCid).sort(),
    retries: rows.flatMap((row) => (row.retry ? [row.retry] : [])).sort(),
    consumedObservations: rows.flatMap((row) => (row.descriptorCid ? [row.descriptorCid] : [])).sort(),
  };
}
/** Explicit provenance export, with owned original I1 method bytes. It is not a new receipt proof packet. */
export function nativePrefixProvenance(prefix: NativePrefix, position: number) {
  const data = view(prefix),
    row = nativePrefixEntry(prefix, position).row;
  const original = data.owner.provenance.get(row.root);
  if (!original) unavailable('Original publication method provenance is not retained');
  return structuredClone({ root: row.root, ...original });
}
export function nativePrefixWork(candidate: NativePrefixExtension) {
  return { ...extension(candidate).counts };
}
export function contradictNativePrefix(prefix: NativePrefix, position: number, code: string) {
  const data = view(prefix);
  nativePrefixEntry(prefix, position);
  if (!data.contradiction) data.contradiction = Object.freeze({ position, code });
  if (data.owner.current === prefix && !data.owner.contradiction) data.owner.contradiction = data.contradiction;
  else if (!data.owner.pendingFault) data.owner.pendingFault = prefix;
}
/** Verify incoming signed bytes before CID lookup, then tuple conflict. Original stored entry is never replaced. */
export async function lookupNativeRetry(prefix: NativePrefix, request: unknown) {
  const data = view(prefix),
    anchor = data.owner.anchor;
  let requestCid: string,
    retry: string | null = null;
  const copied = structuredClone(request) as NativeSignedRequest | NativeAccountOperation;
  if (copied?.$type === nativeRef('signedRequest')) {
    const checked = await verifyNativeSigned(copied, anchor);
    requestCid = checked.requestCid;
    retry = nativeRetryIdentity(checked.signed.intent);
  } else {
    const checked = await readNativeValue<NativeAccountOperation>(nativeRef('accountOperation'), copied);
    if (checked.app !== anchor.genesis.app || checked.genesis.$link !== anchor.cid)
      invalid('Retry differs from pinned application');
    requestCid = await contentCid(checked);
  }
  const position = identityAt(data.owner.requests, requestCid, data.head.position);
  if (position !== null) {
    const row = data.owner.rows[position - 1]!;
    return structuredClone({
      app: anchor.genesis.app,
      genesis: anchor.cid,
      requestCid,
      entryCid: row.entryCid,
      position,
      entry: row.entry,
      root: row.root,
      rev: row.rev,
      assurance: 'publication-only',
    });
  }
  if (retry && identityAt(data.owner.retries, retry, data.head.position) !== null)
    throw new ProtocolError('retry_conflict', 'Actor nonce already names different signed content');
  return null;
}
