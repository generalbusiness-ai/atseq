import { NSID } from '../core/nsids.ts';
import type { ErrorCode } from '../core/errors.ts';
import { parseDidKey, P256PublicKey, verifySigWithDidKey, type PrivateKey } from '@atcute/crypto';
import { fromBytes, type Bytes, type CidLink } from '@atcute/cbor';
import { canonicalJson, type Json } from '../core/values.ts';
import { PROFILE } from '../core/profile.ts';
import { engineDescriptor } from '../core/contracts.ts';
import { deepFreeze } from '../core/freeze.ts';
import { bytes, contentCid, decodeBlock, encodeBlock, link, ProtocolError } from './wire.ts';
import { validateFramework } from './schemas.ts';

export const runtimeDescriptor = deepFreeze(engineDescriptor);
export const runtimeCid = () => contentCid(runtimeDescriptor);
export interface Genesis {
  $type: typeof NSID.genesis;
  version: 1;
  app: string;
  profile: CidLink;
  definition: CidLink;
  sequencerKey: string;
  activationKeys: string[];
}
export interface Intent {
  $type: typeof NSID.defsIntent;
  version: 1;
  app: string;
  genesis: CidLink;
  definition: CidLink;
  actorKey: string;
  nonce: Bytes;
  action: string;
  payload: Record<string, Json>;
}
export interface SignedIntent {
  $type: typeof NSID.defsSignedIntent;
  intent: Intent;
  sig: Bytes;
}
export interface Entry {
  $type: typeof NSID.entry;
  version: 1;
  app: string;
  genesis: CidLink;
  position: number;
  prev: CidLink;
  signedIntent: SignedIntent;
  sequencerKey: string;
  sig: Bytes;
}
export interface Head {
  $type: typeof NSID.head;
  version: 1;
  app: string;
  genesis: CidLink;
  position: number;
  entry: CidLink;
}
export interface Receipt {
  $type: typeof NSID.defsReceipt;
  app: string;
  genesis: CidLink;
  intent: CidLink;
  position: number;
  entry: CidLink;
}
function copy<T>(value: T): T {
  return decodeBlock(encodeBlock(value)) as T;
}
function fail(code: ErrorCode, message: string): never {
  throw new ProtocolError(code, message);
}
async function key(value: string): Promise<void> {
  let parsed;
  try {
    parsed = parseDidKey(value);
  } catch (error) {
    // These are the pinned did:key parser's explicit input diagnostics.
    if (
      !(error instanceof SyntaxError) &&
      !(error instanceof TypeError && /^unsupported key type \(0x[0-9a-f]+\)$/.test(error.message))
    )
      throw error;
    fail('key', 'Expected a canonical compressed P-256 did:key');
  }
  if (parsed.type !== 'p256' || parsed.publicKeyBytes.length !== 33 || ![2, 3].includes(parsed.publicKeyBytes[0]!))
    fail('key', 'Expected a canonical compressed P-256 did:key');
  let pub;
  try {
    pub = await P256PublicKey.importRaw(parsed.publicKeyBytes);
  } catch (error) {
    if (!(error instanceof DOMException) || error.name !== 'DataError') throw error;
    fail('key', 'Invalid P-256 point');
  }
  if ((await pub.exportPublicKey('did')) !== value) fail('key', 'Noncanonical key');
}
async function proof(keyId: string, signature: Bytes, data: unknown): Promise<void> {
  await key(keyId);
  if (
    !(await verifySigWithDidKey(keyId, new Uint8Array(fromBytes(signature)), encodeBlock(data), {
      allowMalleableSig: false,
    }))
  )
    fail('signature', 'Invalid P-256 low-S signature');
}

export interface Invitation {
  app: string;
  genesis: string;
}
/** An invitation pins both the application DID and genesis CID. */
export class Anchor {
  private constructor(
    readonly genesis: Genesis,
    readonly cid: string,
  ) {
    Object.freeze(genesis.activationKeys);
    Object.freeze(genesis.profile);
    Object.freeze(genesis.definition);
    Object.freeze(genesis);
    Object.freeze(this);
  }
  static async from(value: unknown, expected: Invitation): Promise<Anchor> {
    if (typeof expected?.app !== 'string' || !expected.app || typeof expected.genesis !== 'string' || !expected.genesis)
      fail('anchor', 'Invitation requires both app and genesis pins');
    const pinned = { app: expected.app, genesis: expected.genesis };
    validateFramework(NSID.genesis, value);
    const genesis = copy(value) as Genesis;
    if (genesis.app !== pinned.app || (await contentCid(genesis)) !== link(pinned.genesis).$link)
      fail('anchor', 'Genesis differs from the pinned invitation');
    await key(genesis.sequencerKey);
    for (const actor of genesis.activationKeys) await key(actor);
    if (new Set(genesis.activationKeys).size !== genesis.activationKeys.length)
      fail('anchor', 'Duplicate initial activation key');
    return new Anchor(genesis, pinned.genesis);
  }
}
function intentShape(value: unknown): asserts value is Intent {
  validateFramework(NSID.defsIntent, value);
  const intent = value as Intent;
  if (!/^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*){2,}(?:#[A-Za-z][A-Za-z0-9_]*)?$/.test(intent.action))
    fail('envelope', 'Action must name a Lexicon definition');
  if (!intent.payload || Array.isArray(intent.payload) || typeof intent.payload !== 'object')
    fail('envelope', 'Action payload must be an object');
  try {
    canonicalJson(intent.payload, PROFILE.actionBytes);
  } catch {
    fail('payload', 'Action payload is outside the JSON value/size profile');
  }
}
function targets(intent: Intent, anchor: Anchor): void {
  if (intent.app !== anchor.genesis.app || intent.genesis.$link !== anchor.cid)
    fail('target', 'Intent targets a different application or genesis');
}
export function randomNonce(): Bytes {
  return bytes(crypto.getRandomValues(new Uint8Array(16)));
}
export async function signIntent(value: Intent, signer: PrivateKey): Promise<SignedIntent> {
  intentShape(value);
  const intent = copy(value);
  if (signer.type !== 'p256' || (await signer.exportPublicKey('did')) !== intent.actorKey)
    fail('key', 'Signing key differs from the intent actor');
  return { $type: NSID.defsSignedIntent, intent, sig: bytes(await signer.sign(encodeBlock(intent))) };
}
export async function verifyIntent(
  value: unknown,
  anchor: Anchor,
): Promise<{ signed: SignedIntent; intentCid: string }> {
  validateFramework(NSID.defsSignedIntent, value);
  const signed = copy(value) as SignedIntent;
  intentShape(signed.intent);
  targets(signed.intent, anchor);
  await proof(signed.intent.actorKey, signed.sig, signed.intent);
  return { signed, intentCid: await contentCid(signed.intent) };
}
export function headAt(anchor: Anchor, position = 0, entryCid = anchor.cid): Head {
  const head: Head = {
    $type: NSID.head,
    version: 1,
    app: anchor.genesis.app,
    genesis: link(anchor.cid),
    position,
    entry: link(entryCid),
  };
  validateHead(head, anchor);
  return head;
}
export function validateHead(value: unknown, anchor: Anchor): asserts value is Head {
  validateFramework(NSID.head, value);
  const head = value as Head;
  if (head.app !== anchor.genesis.app || head.genesis.$link !== anchor.cid)
    fail('target', 'Head targets another anchor');
  if ((head.position === 0) !== (head.entry.$link === anchor.cid))
    fail('head', 'Position zero must point to genesis; other positions must point to entries');
}
export function positionKey(position: number): string {
  if (!Number.isSafeInteger(position) || position < 1)
    fail('position', 'Entry position must be a positive safe integer');
  return String(position).padStart(16, '0');
}
export async function sequence(value: unknown, anchor: Anchor, previous: Head, signer: PrivateKey): Promise<Entry> {
  validateHead(previous, anchor);
  const head = copy(previous);
  const { signed } = await verifyIntent(value, anchor);
  if (signer.type !== 'p256' || (await signer.exportPublicKey('did')) !== anchor.genesis.sequencerKey)
    fail('key', 'Sequencer differs from genesis');
  const position = head.position + 1;
  positionKey(position);
  const unsigned = {
    $type: NSID.entry,
    version: 1 as const,
    app: anchor.genesis.app,
    genesis: link(anchor.cid),
    position,
    prev: head.entry,
    signedIntent: signed,
    sequencerKey: anchor.genesis.sequencerKey,
  };
  const entry = { ...unsigned, sig: bytes(await signer.sign(encodeBlock(unsigned))) };
  validateFramework(NSID.entry, entry);
  return entry;
}
export async function verifyEntry(value: unknown, anchor: Anchor): Promise<{ entry: Entry; receipt: Receipt }> {
  validateFramework(NSID.entry, value);
  const entry = copy(value) as Entry;
  if (
    entry.app !== anchor.genesis.app ||
    entry.genesis.$link !== anchor.cid ||
    entry.sequencerKey !== anchor.genesis.sequencerKey
  )
    fail('target', 'Entry differs from the pinned sequencer/application');
  const { sig, ...unsigned } = entry;
  await proof(entry.sequencerKey, sig, unsigned);
  const { intentCid } = await verifyIntent(entry.signedIntent, anchor);
  return {
    entry,
    receipt: {
      $type: NSID.defsReceipt,
      app: entry.app,
      genesis: entry.genesis,
      intent: link(intentCid),
      position: entry.position,
      entry: link(await contentCid(entry)),
    },
  };
}
/** Transport identity excludes signature bytes. Domain effectiveness is irrelevant. */
export function retryKey(intent: Intent): string {
  return JSON.stringify([intent.app, intent.actorKey, intent.nonce.$bytes]);
}
export class RetryIndex {
  #items = new Map<string, Receipt>();
  #byIntent = new Map<string, Receipt>();
  #sealed = false;
  async lookup(intent: Intent): Promise<Receipt | undefined> {
    intentShape(intent);
    const owned = copy(intent),
      existing = this.#items.get(retryKey(owned));
    if (existing && existing.intent.$link !== (await contentCid(owned)))
      fail('retry_conflict', 'Nonce already binds different intent content');
    return existing && copy(existing);
  }
  lookupCid(cid: string): Receipt | undefined {
    link(cid);
    const receipt = this.#byIntent.get(cid);
    return receipt && copy(receipt);
  }
  seal(): this {
    this.#sealed = true;
    return Object.freeze(this);
  }
  record(entry: Entry, receipt: Receipt): void {
    if (this.#sealed) throw new Error('Verified retry index is immutable');
    const identity = retryKey(entry.signedIntent.intent);
    if (this.#items.has(identity)) fail('duplicate_retry', 'History records one retry identity more than once');
    const owned = copy(receipt);
    this.#items.set(identity, owned);
    this.#byIntent.set(receipt.intent.$link, owned);
  }
}
export interface VerifiedHistory {
  head: Head;
  entries: Entry[];
  retries: RetryIndex;
}
const histories = new WeakMap<object, { genesis: string; entryCids: readonly string[] }>();
/** Only verifyHistory can issue this immutable capability; copies are unverified. */
export function assertVerifiedHistory(history: VerifiedHistory, anchor: Anchor): void {
  if (histories.get(history)?.genesis !== anchor.cid)
    fail('missing_history', 'History must be verified for this pinned genesis');
}
export function verifiedEntryCid(history: VerifiedHistory, anchor: Anchor, position: number): string {
  assertVerifiedHistory(history, anchor);
  if (position === 0) return anchor.cid;
  const cid = histories.get(history)!.entryCids[position - 1];
  if (!Number.isSafeInteger(position) || !cid) fail('position', 'Position is outside the verified prefix');
  return cid;
}
/** Verify a complete chosen prefix, independent of record/page arrival order. */
export async function verifyHistory(anchor: Anchor, value: Head, records: unknown[]): Promise<VerifiedHistory> {
  validateHead(value, anchor);
  const head = copy(value);
  if (head.position !== records.length) fail('missing_history', 'Chosen head requires a complete prefix from genesis');
  const verified = [];
  for (const record of records) verified.push(await verifyEntry(record, anchor));
  verified.sort((a, b) => a.entry.position - b.entry.position);
  const retries = new RetryIndex();
  let prev = anchor.cid;
  for (const [i, { entry, receipt }] of verified.entries()) {
    if (entry.position !== i + 1) fail('position', 'Duplicate or skipped entry position');
    if (entry.prev.$link !== prev) fail('predecessor', 'Entry predecessor differs from the verified prefix');
    retries.record(entry, receipt);
    prev = receipt.entry.$link;
  }
  if (prev !== head.entry.$link) fail('head', 'Head does not name the verified final entry');
  const owned = deepFreeze({ head, entries: verified.map((v) => v.entry) });
  const history = Object.freeze({ ...owned, retries: retries.seal() });
  histories.set(history, { genesis: anchor.cid, entryCids: Object.freeze(verified.map((v) => v.receipt.entry.$link)) });
  return history;
}
