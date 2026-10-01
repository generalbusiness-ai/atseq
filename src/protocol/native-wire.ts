/** Native-format foundation. Content checks do not authenticate repository publication. */
import { fromBytes, type Bytes, type CidLink } from '@atcute/cbor';
import { fromString, toString, create, CODEC_RAW, CID_VERSION, HASH_SHA256 } from '@atcute/cid';
import { parseDidKey, verifySigWithDidKey, type PrivateKey } from '@atcute/crypto';
import { fromBase32, toBase32 } from '@atcute/multibase';
import { deepFreeze } from '../core/freeze.ts';
import { canonicalJson, type Json } from '../core/values.ts';
import { PROFILE } from '../core/profile.ts';
import { normalizeRepoSigningKey } from './native-proof.ts';
import { NATIVE_NSID, nativeRef, validateNativeShape } from './native-schema.ts';
import { bytes, contentCid, decodeBlock, encodeBlock, link, ProtocolError } from './wire.ts';

type Tag<T extends string> = `ai.generalbusiness.atseq.defs#${T}`;
export type ControlPower = 'certify' | 'govern' | 'recover';
export interface ControlPair { principal: string; actorKey: string }
export interface ControlAppointment extends ControlPair { powers: ControlPower[] }
export interface NativeGenesis {
  $type: string; version: 2; app: string; creation: Bytes; semantics: CidLink; definition: CidLink;
  observationPolicy: CidLink; control: ControlAppointment[]; recoverGovernance: boolean;
  owner: string | null; roles: { principal: string; role: string }[];
}
export interface NativePin { app: string; genesis: string }
export interface NativeHead { $type: string; version: 2; app: string; genesis: CidLink; position: number; entry: CidLink }
export interface GrantReference { id: string; cid: CidLink }
export interface GrantContext { grant: GrantReference; epoch: CidLink }
export interface NativeAct extends GrantContext {
  $type: Tag<'act'>; action: string; execution: CidLink; payload: Record<string, Json>;
}
export interface NativeAssignRole extends GrantContext {
  $type: Tag<'assignRole'>; target: string; role: string; enabled: boolean; expectedAssignment: CidLink | null;
}
export interface ControlContext { position: number; prev: CidLink; controlTip: CidLink }
export type NativeControl = ControlContext & (
  | { $type: Tag<'setControl'>; control: ControlAppointment[] }
  | { $type: Tag<'setRecovery'>; recovery: ControlPair[] }
  | { $type: Tag<'setOwner'>; owner: string | null }
  | { $type: Tag<'setRole'>; target: string; role: string; enabled: boolean; expectedAssignment: CidLink | null }
  | { $type: Tag<'activate'>; expected: CidLink; definition: CidLink; closure: string[] }
  | { $type: Tag<'recoverParticipant'>; target: string; expectedEpoch: CidLink | null;
      expectedObservation: CidLink | null; epoch: CidLink; observation: CidLink }
  | { $type: Tag<'recoverGovernance'>; governance: ControlPair[] }
);
export interface NativeIntent {
  $type: Tag<'intent'>; version: 2; app: string; genesis: CidLink; principal: string;
  actorKey: string; nonce: Bytes; operation: NativeAct | NativeAssignRole | NativeControl;
}
export interface NativeSignedRequest { $type: Tag<'signedRequest'>; intent: NativeIntent; sig: Bytes }
export interface NativeAccountOperation {
  $type: Tag<'accountOperation'>; app: string; genesis: CidLink; position: number; prev: CidLink;
  principal: string; expectedEpoch: CidLink | null; expectedObservation: CidLink | null;
  operation: { $type: Tag<'admitGrant'>; grant: GrantReference }
    | { $type: Tag<'advanceEpoch'>; epoch: CidLink }
    | { $type: Tag<'revokeGrant'>; revoke: GrantReference };
  observation: CidLink;
}
export type NativeRequest = NativeSignedRequest | NativeAccountOperation;
export interface NativeEntry {
  $type: string; version: 2; app: string; genesis: CidLink; position: number; prev: CidLink; request: NativeRequest;
}
export interface NativeFile { $type: string; version: 1; cid: string; bytes: CidLink }
export interface NativeEpoch { $type: string; version: 1; id: Bytes; previous: CidLink | null }
export interface NativeEpochCurrent { $type: string; version: 1; id: Bytes; epoch: CidLink }
export interface NativeGrant {
  $type: string; version: 1; id: string; app: string; genesis: CidLink; epoch: CidLink;
  actorKey: string; actions: { action: string; execution: CidLink }[]; assignRoles: string[];
}
export interface NativeRevoke { $type: string; version: 1; id: string; app: string; genesis: CidLink }
export type NativeMethodEvidence =
  | { $type: Tag<'plcAudit'>; bytes: CidLink; source: string; selectedTip: CidLink }
  | { $type: Tag<'webDocument'>; bytes: CidLink; source: string };
export interface NativeObservation {
  $type: Tag<'observation'>; policy: CidLink; principal: string;
  context: { app: string; genesis: CidLink; position: number; prev: CidLink; subject: CidLink };
  binding: { signingKeyDid: string; pdsOrigin: string }; before: NativeMethodEvidence; after: NativeMethodEvidence;
  repositoryRoot: CidLink; records: { path: string; cid: CidLink }[]; proofs: CidLink[]; observedAt: string;
}
export interface ByteChunk { $type: Tag<'byteChunk'>; bytes: Bytes }
export interface ByteManifest { $type: Tag<'byteManifest'>; byteLength: number; chunks: CidLink[] }
export interface NativeContent<B = Record<string, unknown>> { $type: string; version: 1; body: B }
export interface ByteContentReader { get(cid: string): Promise<Uint8Array> }

function fail(code: 'envelope' | 'position' | 'target' | 'key' | 'signature' | 'path' | 'payload', message: string): never {
  throw new ProtocolError(code, message);
}
function copy<T>(value: T): T { return decodeBlock(encodeBlock(value)) as T; }
function ordered(values: string[], label: string): void {
  if (values.some((value, index) => index > 0 && values[index - 1]! >= value))
    fail('envelope', `${label} must be sorted and unique`);
}
function pairId(pair: ControlPair) { return JSON.stringify([pair.principal, pair.actorKey]); }
function pairs(values: ControlPair[]) { ordered(values.map(pairId), 'Control pairs'); }
function role(value: string): void {
  if (!/^[a-z][a-z0-9_]{0,63}$/.test(value) || ['govern', 'recover', 'certify', 'owner'].includes(value))
    fail('envelope', 'Expected a domain participation role');
}
function grantId(value: string): void {
  if (!/^[a-z2-7]{26}$/.test(value)) fail('envelope', 'Grant ID must be canonical 16-byte base32');
  const raw = fromBase32(value);
  if (raw.length !== 16 || toBase32(raw) !== value) fail('envelope', 'Noncanonical grant ID');
}
function action(value: string): void {
  const [collection, definition, extra] = value.split('#');
  if (!collection || !definition || extra !== undefined || !/^[A-Za-z][A-Za-z0-9_]*$/.test(definition))
    fail('envelope', 'Expected a complete action/schema reference');
  // The ecosystem validates the NSID portion; the framework bounds the full ref.
  validateNativeShape(nativeRef('path'), { $type: nativeRef('path'), collection, rkey: 'self' });
}
function rawCid(value: string): void {
  let parsed;
  try { parsed = fromString(value); } catch { fail('envelope', 'Expected canonical raw CID'); }
  if (parsed.codec !== CODEC_RAW || toString(parsed) !== value || parsed.digest.contents.length !== 32 || parsed.version !== CID_VERSION || parsed.digest.codec !== HASH_SHA256)
    fail('envelope', 'Expected canonical raw SHA-256 CIDv1');
}
function origin(value: string): void {
  let url;
  try { url = new URL(value); } catch { fail('envelope', 'Expected HTTPS origin'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash ||
      url.pathname !== '/' || url.origin !== value) fail('envelope', 'Expected canonical credential-free HTTPS origin');
}
function timestamp(value: string): void {
  const date = new Date(value);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) || !Number.isFinite(date.getTime()) || date.toISOString() !== value)
    fail('envelope', 'Expected exact diagnostic UTC timestamp');
}

/** Key representation only; grants and appointed powers are separate authority checks. */
export async function validateNativeDeviceKey(value: string): Promise<void> {
  let parsed;
  try { parsed = parseDidKey(value); } catch (error) {
    if (error instanceof SyntaxError || (error instanceof TypeError && /^unsupported key type /.test(error.message)))
      fail('key', 'Expected canonical P-256 device/control key');
    throw error;
  }
  if (parsed.type !== 'p256' || parsed.publicKeyBytes.length !== 33)
    fail('key', 'Device/control signing requires compressed P-256');
  let canonical;
  try { canonical = await normalizeRepoSigningKey(parsed); } catch (error) {
    if (error instanceof DOMException && error.name === 'DataError') fail('key', 'Invalid device/control point');
    throw error;
  }
  if (canonical !== value) fail('key', 'Noncanonical device/control key');
}
async function repoKey(value: string): Promise<void> {
  let parsed;
  try { parsed = parseDidKey(value); } catch (error) {
    if (error instanceof SyntaxError || (error instanceof TypeError && /^unsupported key type /.test(error.message))) fail('key', 'Expected repository signing key');
    throw error;
  }
  if (parsed.publicKeyBytes.length !== 33) fail('key', 'Repository key must be compressed');
  if ((await normalizeRepoSigningKey(parsed)) !== value) fail('key', 'Noncanonical repository key');
}

/** Returns owned, strictly shaped content; no authority outcome is inferred. */
export async function readNativeValue<T = unknown>(ref: string, value: unknown): Promise<T> {
  validateNativeShape(ref, value);
  const owned: any = copy(value);
  async function appointments(values: ControlAppointment[]) {
    pairs(values);
    for (const pair of values) { ordered(pair.powers, 'Control powers'); await validateNativeDeviceKey(pair.actorKey); }
  }
  const name = ref === NATIVE_NSID.content ? owned.body.$type : ref;
  const data = ref === NATIVE_NSID.content ? owned.body : owned;
  switch (name) {
    case NATIVE_NSID.genesis:
      await appointments(data.control);
      ordered(data.roles.map((r: any) => JSON.stringify([r.principal, r.role])), 'Initial roles');
      data.roles.forEach((r: any) => role(r.role));
      break;
    case nativeRef('intent'):
      await validateNativeDeviceKey(data.actorKey);
      await readNativeValue(data.operation.$type, data.operation);
      break;
    case nativeRef('signedRequest'):
      await readNativeValue(nativeRef('intent'), data.intent);
      break;
    case nativeRef('act'):
      grantId(data.grant.id); action(data.action);
      if (!data.payload || Array.isArray(data.payload) || typeof data.payload !== 'object') fail('payload', 'Expected action object');
      canonicalJson(data.payload, PROFILE.actionBytes);
      break;
    case nativeRef('assignRole'):
      grantId(data.grant.id); role(data.role); break;
    case nativeRef('setRole'): case nativeRef('requiredRole'):
      role(data.role); break;
    case nativeRef('setControl'):
      await appointments(data.control); break;
    case nativeRef('setRecovery'): case nativeRef('recoverGovernance'):
      pairs(data.recovery ?? data.governance);
      for (const pair of data.recovery ?? data.governance) await validateNativeDeviceKey(pair.actorKey);
      break;
    case nativeRef('activate'):
      ordered(data.closure, 'Activation closure');
      if (!data.closure.includes(data.definition.$link)) fail('envelope', 'Activation closure omits its definition');
      for (const id of data.closure) { const parsed = fromString(id); if (parsed.codec === CODEC_RAW) rawCid(id); else link(id); }
      break;
    case nativeRef('accountOperation'):
      await readNativeValue(data.operation.$type, data.operation); break;
    case nativeRef('admitGrant'): case nativeRef('revokeGrant'):
      grantId((data.grant ?? data.revoke).id); break;
    case NATIVE_NSID.entry:
      await readNativeValue(data.request.$type, data.request); break;
    case NATIVE_NSID.grant:
      grantId(data.id); await validateNativeDeviceKey(data.actorKey);
      if (!data.actions.length && !data.assignRoles.length) fail('envelope', 'Empty grant scope');
      ordered(data.actions.map((scope: any) => JSON.stringify([scope.action, scope.execution.$link])), 'Grant action scopes');
      data.actions.forEach((scope: any) => action(scope.action));
      ordered(data.assignRoles, 'Grant role scopes'); data.assignRoles.forEach(role); break;
    case NATIVE_NSID.revoke: grantId(data.id); break;
    case NATIVE_NSID.file: rawCid(data.cid); break;
    case NATIVE_NSID.definition:
      if (new Set(data.files.map((f: any) => f.path)).size !== data.files.length) fail('envelope', 'Duplicate source paths');
      data.files.forEach((f: any) => rawCid(f.cid));
      for (const a of data.actions) { action(a.ref); await readNativeValue(a.authorization.$type, a.authorization); }
      break;
    case nativeRef('byteManifest'):
      if (data.chunks.length !== Math.ceil(data.byteLength / (32 * 1024))) fail('envelope', 'Manifest count/length mismatch');
      break;
    case nativeRef('observationPolicy'): origin(data.plcDirectory); break;
    case nativeRef('observation'): case nativeRef('appBinding'):
      origin(data.binding.pdsOrigin); await repoKey(data.binding.signingKeyDid);
      if (data.before.$type !== data.after.$type) fail('envelope', 'Mixed identity evidence methods');
      if (name === nativeRef('observation')) {
        timestamp(data.observedAt);
        ordered(data.records.map((r: any) => r.path), 'Observed record paths');
        for (const r of data.records) { const [collection, rkey, extra] = r.path.split('/');
          if (extra !== undefined) fail('path', 'Expected two native path components'); nativePath(collection, rkey); }
      }
      break;
    case nativeRef('actionContract'):
      action(data.schemas.stateRoot); action(data.schemas.actionRoot); rawCid(data.fold);
      await readNativeValue(data.authorization.$type, data.authorization); break;
  }
  return deepFreeze(owned) as T;
}

export function nativePath(collection: string, rkey: string): string {
  validateNativeShape(nativeRef('path'), { $type: nativeRef('path'), collection, rkey });
  return `${collection}/${rkey}`;
}
export function nativePositionKey(position: number): string {
  if (!Number.isSafeInteger(position) || position < 1) fail('position', 'Expected positive safe position');
  return String(position).padStart(16, '0');
}
export function parseNativePositionKey(value: string): number {
  if (!/^[0-9]{16}$/.test(value)) fail('position', 'Expected exactly 16 decimal digits');
  const position = Number(value);
  if (nativePositionKey(position) !== value) fail('position', 'Noncanonical position');
  return position;
}
export function nativeEntryPath(genesis: string, position: number): string {
  return nativePath(NATIVE_NSID.entry, `${link(genesis).$link}.${nativePositionKey(position)}`);
}
export function nativeGenesisPath(genesis: string): string { return nativePath(NATIVE_NSID.genesis, link(genesis).$link); }
export function nativeHeadPath(genesis: string): string { return nativePath(NATIVE_NSID.head, link(genesis).$link); }

/** Strict record and key derivation. The caller must separately verify native membership. */
export async function readNativeRecord<T = unknown>(collection: string, rkey: string, raw: Uint8Array): Promise<T> {
  nativePath(collection, rkey);
  const value: any = await readNativeValue(collection, decodeBlock(raw));
  let expected: string;
  switch (collection) {
    case NATIVE_NSID.genesis: case NATIVE_NSID.epoch: case NATIVE_NSID.content: case NATIVE_NSID.definition:
      expected = await contentCid(value); break;
    case NATIVE_NSID.head: expected = value.genesis.$link; break;
    case NATIVE_NSID.entry: expected = `${value.genesis.$link}.${nativePositionKey(value.position)}`; break;
    case NATIVE_NSID.epochCurrent: expected = 'self'; break;
    case NATIVE_NSID.grant: case NATIVE_NSID.revoke: expected = value.id; break;
    case NATIVE_NSID.file: expected = value.cid; break;
    default: fail('path', 'Not a native Atseq record collection');
  }
  if (rkey !== expected) fail('path', 'Record differs from canonical native key');
  return value as T;
}

/** Exact external pin, not native-root authentication or supported-semantic admission. */
export class NativeAnchor {
  private constructor(readonly genesis: NativeGenesis, readonly cid: string) { Object.freeze(this); }
  static async from(value: unknown, expected: NativePin): Promise<NativeAnchor> {
    const pinned = copy(expected);
    if (!pinned || Object.keys(pinned).sort().join(',') !== 'app,genesis') fail('target', 'Expected exact app/genesis pin');
    const genesis = await readNativeValue<NativeGenesis>(NATIVE_NSID.genesis, value);
    if (genesis.app !== pinned.app || await contentCid(genesis) !== link(pinned.genesis).$link)
      fail('target', 'Genesis differs from external pin');
    return new NativeAnchor(genesis, pinned.genesis);
  }
}
function target(app: string, genesis: CidLink, anchor: NativeAnchor): void {
  if (app !== anchor.genesis.app || genesis.$link !== anchor.cid) fail('target', 'Wrong native application scope');
}
export async function nativeHeadAt(anchor: NativeAnchor, position = 0, entry = anchor.cid): Promise<NativeHead> {
  return readNativeHead({ $type: NATIVE_NSID.head, version: 2, app: anchor.genesis.app,
    genesis: link(anchor.cid), position, entry: link(entry) }, anchor);
}
export async function readNativeHead(value: unknown, anchor: NativeAnchor): Promise<NativeHead> {
  const head = await readNativeValue<NativeHead>(NATIVE_NSID.head, value);
  target(head.app, head.genesis, anchor);
  if ((head.position === 0) !== (head.entry.$link === anchor.cid)) fail('envelope', 'Position zero must name genesis');
  return head;
}
export async function signNativeIntent(value: unknown, signer: PrivateKey): Promise<NativeSignedRequest> {
  const intent = await readNativeValue<NativeIntent>(nativeRef('intent'), value);
  if (signer.type !== 'p256' || await signer.exportPublicKey('did') !== intent.actorKey) fail('key', 'Signer differs from intent');
  return readNativeValue(nativeRef('signedRequest'), { $type: nativeRef('signedRequest'), intent,
    sig: bytes(await signer.sign(encodeBlock(intent))) });
}
export async function verifyNativeSigned(value: unknown, anchor: NativeAnchor): Promise<{ signed: NativeSignedRequest; requestCid: string }> {
  const signed = await readNativeValue<NativeSignedRequest>(nativeRef('signedRequest'), value);
  target(signed.intent.app, signed.intent.genesis, anchor);
  if (!await verifySigWithDidKey(signed.intent.actorKey, new Uint8Array(fromBytes(signed.sig)), encodeBlock(signed.intent),
    { allowMalleableSig: false })) fail('signature', 'Invalid native device/control signature');
  return { signed, requestCid: await contentCid(signed.intent) };
}
/** Pure R0 tuple encoding. A host must verify shape/signature before lookup. */
export function nativeRetryIdentity(intent: NativeIntent): string {
  validateNativeShape(nativeRef('intent'), intent);
  return JSON.stringify([intent.app, intent.genesis.$link, intent.actorKey, intent.nonce.$bytes]);
}
/** Entry contents only: no native commit proof, prefix uniqueness, or authority outcome. */
export async function verifyNativeEntryContents(value: unknown, anchor: NativeAnchor): Promise<{ entry: NativeEntry; requestCid: string; entryCid: string }> {
  const entry = await readNativeValue<NativeEntry>(NATIVE_NSID.entry, value);
  target(entry.app, entry.genesis, anchor);
  let requestCid: string;
  if (entry.request.$type === nativeRef('signedRequest')) requestCid = (await verifyNativeSigned(entry.request, anchor)).requestCid;
  else {
    const op = entry.request as NativeAccountOperation;
    target(op.app, op.genesis, anchor);
    if (op.position !== entry.position || op.prev.$link !== entry.prev.$link) fail('envelope', 'Account operation outer context mismatch');
    requestCid = await contentCid(op);
  }
  return { entry, requestCid, entryCid: await contentCid(entry) };
}
export async function createNativeEntry(request: NativeRequest, anchor: NativeAnchor, previous: NativeHead): Promise<NativeEntry> {
  const head = await readNativeHead(previous, anchor);
  if (head.position === Number.MAX_SAFE_INTEGER) fail('position', 'Native append would overflow');
  return (await verifyNativeEntryContents({ $type: NATIVE_NSID.entry, version: 2, app: head.app, genesis: head.genesis,
    position: head.position + 1, prev: head.entry, request }, anchor)).entry;
}

export async function nativeObservationSubject(value: NativeIntent | NativeAccountOperation): Promise<string> {
  const owned: any = copy(await readNativeValue(value.$type, value));
  if (owned.$type === nativeRef('accountOperation')) delete owned.observation;
  else if (owned.$type === nativeRef('intent') && owned.operation.$type === nativeRef('recoverParticipant'))
    delete owned.operation.observation;
  else fail('envelope', 'Only account imports or participant recovery consume observations');
  return contentCid({ $type: nativeRef('observationSubject'), request: owned });
}

/** Five-field owned JSON, intentionally independent of device/grant/epoch enrolment. */
export function nativeFoldMetadata(entry: NativeEntry): Record<string, Json> {
  if (entry.request.$type !== nativeRef('signedRequest')) fail('envelope', 'Account imports do not execute domain folds');
  const intent = (entry.request as NativeSignedRequest).intent;
  if (intent.operation.$type !== nativeRef('act')) fail('envelope', 'Only ordinary actions execute domain folds');
  return deepFreeze(copy({ app: entry.app, genesis: entry.genesis.$link, position: entry.position,
    principal: intent.principal, execution: (intent.operation as NativeAct).execution.$link }));
}

/** Local budget failures remain transient, separate from protocol shape failures. */
export async function reconstructNativeBytes(manifest: NativeContent<ByteManifest>, reader: ByteContentReader, maximumBytes: number): Promise<Uint8Array> {
  if (!Number.isSafeInteger(maximumBytes) || maximumBytes < 0) throw new ProtocolError('input', 'Invalid local byte budget');
  const owned = await readNativeValue<NativeContent<ByteManifest>>(NATIVE_NSID.content, manifest);
  if (owned.body.$type !== nativeRef('byteManifest')) fail('envelope', 'Expected byte manifest');
  if (owned.body.byteLength > maximumBytes) throw new ProtocolError('native_proof_limit', 'Retained bytes exceed local budget');
  const result = new Uint8Array(owned.body.byteLength);
  let offset = 0;
  for (const id of owned.body.chunks) {
    const raw = await reader.get(id.$link);
    const chunk = await readNativeRecord<NativeContent<ByteChunk>>(NATIVE_NSID.content, id.$link, raw);
    if (chunk.body.$type !== nativeRef('byteChunk')) fail('envelope', 'Manifest references non-chunk content');
    const bytes = new Uint8Array(fromBytes(chunk.body.bytes));
    if (bytes.length !== Math.min(32 * 1024, result.length - offset)) fail('envelope', 'Noncanonical chunk size/manifest length');
    result.set(bytes, offset); offset += bytes.length;
  }
  return result;
}
export async function reconstructNativeFile(file: NativeFile, reader: ByteContentReader, maximumBytes: number): Promise<Uint8Array> {
  const owned = await readNativeValue<NativeFile>(NATIVE_NSID.file, file);
  const manifest = await readNativeRecord<NativeContent<ByteManifest>>(NATIVE_NSID.content, owned.bytes.$link, await reader.get(owned.bytes.$link));
  const raw = await reconstructNativeBytes(manifest, reader, maximumBytes);
  if (toString(await create(CODEC_RAW, raw)) !== owned.cid) throw new ProtocolError('content_corrupt', 'File bytes differ from raw identity');
  return raw;
}
