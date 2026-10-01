/** Offline authentication only. No resolver, observer signature or delegated permission. */
import { didWebToUrl, isDidWeb } from '@atproto/did';
import type { CidLink } from '@atcute/cbor';
import { deepFreeze } from '../core/freeze.ts';
import { AtseqError, ProtocolError } from '../core/errors.ts';
import { deriveIdentityBinding, sameIdentityObservation, type IdentityEvidence } from '../protocol/identity-binding.ts';
import { assertAuthenticatedRepo, VerifiedRepoBlocks, type AuthenticatedRepo } from '../protocol/native-proof.ts';
import { NATIVE_NSID, nativeRef } from '../protocol/native-schema.ts';
import {
  NativeAnchor,
  nativeEntryPath,
  nativeGenesisPath,
  nativePath,
  nativeObservationSubject,
  readNativeRecord,
  reconstructNativeBytes,
  verifyNativeEntryContents,
  type ByteContentReader,
  type ByteManifest,
  type NativeContent,
  type NativeEntry,
  type NativeAccountOperation,
  type NativeSignedRequest,
  type NativeGrant,
  type NativeEpoch,
  type NativeEpochCurrent,
  type NativeRevoke,
  type NativeObservation,
  type NativeMethodEvidence,
} from '../protocol/native-wire.ts';
import { encodeBlock, sameBytes } from '../protocol/wire.ts';
import { assertNativeAuthorityContext, type NativeAuthorityState } from './native-authority.ts';

export interface AuthorityObservation {
  cid: string;
  principal: string;
  root: string;
  rev: string;
  signingKeyDid: string;
  pdsOrigin: string;
  assuranceClass: 'plc-audit-v1' | 'web-observation-v1';
  /** Current-to-predecessor order, stopping before the operation's expected anchor. */
  epochs: { cid: string; record: NativeEpoch }[];
  current: NativeEpochCurrent | null;
  grant: NativeGrant | null;
  revoke: NativeRevoke | null;
}
interface AuthenticatedAuthorityEntryData {
  entry: NativeEntry;
  requestCid: string;
  entryCid: string;
  observation: AuthorityObservation | null;
  publicationAssurance: 'plc-audit-v1' | 'web-observation-v1';
}
const authenticated = new WeakMap<object, Readonly<AuthenticatedAuthorityEntryData>>();
declare const entryBrand: unique symbol;
export interface AuthenticatedAuthorityEntry {
  readonly [entryBrand]: true;
}
function invalid(message: string): never {
  throw new ProtocolError('envelope', message);
}
function unavailable(message: string): never {
  throw new AtseqError('content_unavailable', message);
}
export function authenticatedAuthorityEntry(
  value: AuthenticatedAuthorityEntry,
): Readonly<AuthenticatedAuthorityEntryData> {
  const data = value && typeof value === 'object' ? authenticated.get(value) : undefined;
  if (!data) invalid('Expected authenticated authority entry capability');
  return data;
}
async function membership(repo: AuthenticatedRepo, path: string, cid: string): Promise<Uint8Array> {
  const result = await repo.lookup(path, cid);
  if (result.kind === 'missing') unavailable('Required native proof block is missing');
  if (result.kind === 'absent') invalid('Selected native root proves required authority record absent');
  return result.bytes;
}
async function content<T>(reader: ByteContentReader, cid: string): Promise<NativeContent<T>> {
  return readNativeRecord(NATIVE_NSID.content, cid, await reader.get(cid));
}
async function retainedBytes(reader: ByteContentReader, cid: string, maximumBytes: number) {
  return reconstructNativeBytes(await content<ByteManifest>(reader, cid), reader, maximumBytes);
}

/** Authenticates publication and retained evidence before deterministic interpretation. */
export async function authenticateAuthorityEntry(options: {
  anchor: NativeAnchor;
  appRepo: AuthenticatedRepo;
  entry: unknown;
  reader: ByteContentReader;
  prior: NativeAuthorityState;
  appIdentity: { before: IdentityEvidence; after: IdentityEvidence };
}): Promise<AuthenticatedAuthorityEntry> {
  const { anchor, appRepo, reader } = options;
  assertAuthenticatedRepo(appRepo);
  if (appRepo.did !== anchor.genesis.app) invalid('Publication repository differs from pinned application');
  const checked = await verifyNativeEntryContents(options.entry, anchor);
  assertNativeAuthorityContext(options.prior, checked.entry, checked.requestCid);
  const configuredPolicy = await content<{
    $type: string;
    algorithm: string;
    plcDirectory: string;
    allowWeb: boolean;
    checkpoint: string;
  }>(reader, anchor.genesis.observationPolicy.$link);
  if (
    configuredPolicy.body.$type !== nativeRef('observationPolicy') ||
    configuredPolicy.body.algorithm !== 'atseq-account-observation-v1' ||
    configuredPolicy.body.checkpoint !== 'native-publication-v1'
  )
    unavailable('Unsupported appointed observation policy');
  const appBefore = await deriveIdentityBinding(anchor.genesis.app, options.appIdentity.before);
  const appAfter = await deriveIdentityBinding(anchor.genesis.app, options.appIdentity.after);
  if (
    !sameIdentityObservation(appBefore, appAfter) ||
    appBefore.signingKeyDid !== appRepo.signingKey ||
    (appBefore.assuranceClass === 'web-observation-v1' && !configuredPolicy.body.allowWeb)
  )
    invalid('Application publication key differs from retained appointed method binding');
  const genesisBytes = await membership(appRepo, nativeGenesisPath(anchor.cid), anchor.cid);
  if (!sameBytes(genesisBytes, encodeBlock(anchor.genesis))) invalid('Published genesis differs from external pin');
  const entryBytes = await membership(appRepo, nativeEntryPath(anchor.cid, checked.entry.position), checked.entryCid);
  if (!sameBytes(entryBytes, encodeBlock(checked.entry))) invalid('Published entry differs from supplied content');
  const request = checked.entry.request;
  const account = request.$type === nativeRef('accountOperation') ? (request as NativeAccountOperation) : null;
  const intent = account ? null : (request as NativeSignedRequest).intent;
  const recovery = intent?.operation.$type === nativeRef('recoverParticipant') ? intent.operation : null;
  let observation: AuthorityObservation | null = null;
  if (account || recovery) {
    const descriptorCid = (account?.observation ?? recovery!.observation).$link;
    const raw = await membership(appRepo, nativePath(NATIVE_NSID.content, descriptorCid), descriptorCid);
    const descriptor = await readNativeRecord<NativeContent<NativeObservation>>(
      NATIVE_NSID.content,
      descriptorCid,
      raw,
    );
    const observed = descriptor.body;
    if (observed.$type !== nativeRef('observation')) invalid('Expected retained account observation');
    const principal = account?.principal ?? recovery!.target;
    const context = account ?? recovery!;
    if (
      observed.policy.$link !== anchor.genesis.observationPolicy.$link ||
      observed.principal !== principal ||
      observed.context.app !== anchor.genesis.app ||
      observed.context.genesis.$link !== anchor.cid ||
      observed.context.position !== context.position ||
      observed.context.prev.$link !== context.prev.$link ||
      observed.context.subject.$link !== (await nativeObservationSubject(account ?? intent!))
    )
      invalid('Observation does not bind the exact authority operation/context');
    const policy = configuredPolicy;
    if (
      policy.body.$type !== nativeRef('observationPolicy') ||
      policy.body.algorithm !== 'atseq-account-observation-v1' ||
      policy.body.checkpoint !== 'native-publication-v1'
    )
      unavailable('Unsupported appointed observation policy');
    async function method(ref: NativeMethodEvidence): Promise<IdentityEvidence> {
      if (ref.$type === nativeRef('plcAudit')) {
        if (
          !principal.startsWith('did:plc:') ||
          ref.source !== `${policy.body.plcDirectory}/${principal}/log/audit` ||
          !ref.selectedTip
        )
          invalid('PLC evidence routing/method differs from appointed policy');
        return {
          assuranceClass: 'plc-audit-v1',
          auditBytes: await retainedBytes(reader, ref.bytes.$link, 1024 * 1024),
          selectedTipCid: ref.selectedTip.$link,
        };
      }
      if (
        ref.$type !== nativeRef('webDocument') ||
        !policy.body.allowWeb ||
        !isDidWeb(principal) ||
        ref.source !== didWebToUrl(principal).href
      )
        invalid('Web evidence routing/method differs from appointed policy');
      return {
        assuranceClass: 'web-observation-v1',
        documentBytes: await retainedBytes(reader, ref.bytes.$link, 32 * 1024),
      };
    }
    const before = await deriveIdentityBinding(principal, await method(observed.before));
    const after = await deriveIdentityBinding(principal, await method(observed.after));
    if (
      !sameIdentityObservation(before, after) ||
      before.signingKeyDid !== observed.binding.signingKeyDid ||
      before.pdsOrigin !== observed.binding.pdsOrigin
    )
      invalid('Retained binding changed or differs from descriptor');
    const blocks = new VerifiedRepoBlocks();
    let participant: AuthenticatedRepo | undefined,
      proofBytes = 0;
    for (const proof of observed.proofs) {
      const bytes = await retainedBytes(reader, proof.$link, 32 * 1024 * 1024 - proofBytes);
      proofBytes += bytes.length;
      participant = await blocks.authenticate({
        carBytes: bytes,
        expectedDid: principal,
        trustedSigningKeyDid: before.signingKeyDid,
        expectedRoot: observed.repositoryRoot.$link,
      });
    }
    if (!participant) invalid('Observation lacks native proof');
    const selected = new Map(observed.records.map((row) => [row.path, row.cid.$link]));
    const required = new Set<string>();
    async function record<T>(collection: string, key: string): Promise<T> {
      const path = nativePath(collection, key),
        cid = selected.get(path);
      if (!cid) invalid('Observation omits an exact required subject record');
      required.add(path);
      return readNativeRecord(collection, key, await membership(participant!, path, cid));
    }
    let current: NativeEpochCurrent | null = null,
      grant: NativeGrant | null = null,
      revoke: NativeRevoke | null = null;
    const epochs: { cid: string; record: NativeEpoch }[] = [];
    if (account?.operation.$type === nativeRef('revokeGrant')) {
      const reference = account.operation.revoke;
      const path = nativePath(NATIVE_NSID.revoke, reference.id);
      if (selected.get(path) !== reference.cid.$link) invalid('Revoke subject CID differs from operation');
      revoke = await record(NATIVE_NSID.revoke, reference.id);
    } else {
      current = await record<NativeEpochCurrent>(NATIVE_NSID.epochCurrent, 'self');
      let next: string = current.epoch.$link;
      const expected = account?.expectedEpoch?.$link ?? null;
      const visited = new Set<string>();
      // An initial import/recovery needs only the exact current transition.
      for (;;) {
        if (visited.has(next)) invalid('Cyclic epoch evidence');
        visited.add(next);
        const epoch: NativeEpoch = await record<NativeEpoch>(NATIVE_NSID.epoch, next);
        epochs.push({ cid: next, record: epoch });
        if (epochs.length === 1 && epoch.id.$bytes !== current.id.$bytes)
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
      if (account?.operation.$type === nativeRef('admitGrant')) {
        const reference = account.operation.grant;
        if (selected.get(nativePath(NATIVE_NSID.grant, reference.id)) !== reference.cid.$link)
          invalid('Grant subject CID differs from operation');
        grant = await record(NATIVE_NSID.grant, reference.id);
      } else if (
        (account?.operation as { epoch: CidLink } | undefined)?.epoch?.$link !== current.epoch.$link &&
        !recovery
      )
        invalid('Advance epoch differs from selected current pointer');
      if (recovery && recovery.epoch.$link !== current.epoch.$link)
        invalid('Recovery epoch differs from selected pointer');
    }
    if (required.size !== selected.size) invalid('Observation includes unrelated subject records');
    observation = deepFreeze({
      cid: descriptorCid,
      principal,
      root: participant.root,
      rev: participant.rev,
      signingKeyDid: before.signingKeyDid,
      pdsOrigin: before.pdsOrigin,
      assuranceClass: before.assuranceClass,
      epochs,
      current,
      grant,
      revoke,
    });
  }
  const capability = Object.freeze({}) as AuthenticatedAuthorityEntry;
  authenticated.set(
    capability,
    deepFreeze({ ...checked, observation, publicationAssurance: appBefore.assuranceClass }),
  );
  return capability;
}
