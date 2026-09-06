import { parseDidKey, P256PublicKey, verifySigWithDidKey, type PrivateKey } from '@atcute/crypto';
import { fromBytes, type Bytes, type CidLink } from '@atcute/cbor';
import { canonicalJson, type Json } from '../runtime/values.ts';
import { PROFILE } from '../runtime/profile.ts';
import descriptor from './runtime-descriptor.json';
import { bytes, contentCid, decodeBlock, encodeBlock, link, ProtocolError } from './wire.ts';
import { validateFramework } from './schemas.ts';

export const runtimeDescriptor = descriptor;
export const runtimeCid = () => contentCid(descriptor);
export interface Genesis {
  $type: 'test.atseq.genesis'; version: 0; app: string; profile: CidLink;
  definition: CidLink; sequencerKey: string; activationKeys: string[];
}
export interface Intent {
  $type: 'test.atseq.defs#intent'; version: 0; app: string; genesis: CidLink;
  definition: CidLink; actorKey: string; nonce: Bytes; action: string; payload: Record<string, Json>;
}
export interface SignedIntent { $type: 'test.atseq.defs#signedIntent'; intent: Intent; sig: Bytes }
export interface Entry {
  $type: 'test.atseq.entry'; version: 0; app: string; genesis: CidLink; position: number;
  prev: CidLink; signedIntent: SignedIntent; sequencerKey: string; sig: Bytes;
}
export interface Head {
  $type: 'test.atseq.head'; version: 0; app: string; genesis: CidLink; position: number; entry: CidLink;
}
export interface Receipt {
  $type: 'test.atseq.defs#receipt'; app: string; genesis: CidLink; intent: CidLink; position: number; entry: CidLink;
}
function copy<T>(value: T): T { return decodeBlock(encodeBlock(value)) as T; }
function fail(code: string, message: string): never { throw new ProtocolError(code, message); }
async function key(value: string): Promise<void> {
  try {
    const parsed = parseDidKey(value);
    if (parsed.type !== 'p256') throw new Error('Expected P-256');
    const pub = await P256PublicKey.importRaw(parsed.publicKeyBytes);
    if (await pub.exportPublicKey('did') !== value) throw new Error('Noncanonical key');
  } catch { fail('key', 'Expected a canonical compressed P-256 did:key'); }
}
async function proof(keyId: string, signature: Bytes, data: unknown): Promise<void> {
  await key(keyId);
  try {
    if (!await verifySigWithDidKey(keyId, new Uint8Array(fromBytes(signature)), encodeBlock(data), { allowMalleableSig: false })) throw new Error('Signature rejected');
  } catch { fail('signature', 'Invalid P-256 low-S signature'); }
}

/** An invitation pins this CID. PDS/DID discovery cannot replace it. */
export class Anchor {
  private constructor(readonly genesis: Genesis, readonly cid: string) {
    Object.freeze(genesis.activationKeys); Object.freeze(genesis.profile); Object.freeze(genesis.definition);
    Object.freeze(genesis); Object.freeze(this);
  }
  static async from(value: unknown, expectedCid: string): Promise<Anchor> {
    validateFramework('test.atseq.genesis', value);
    const genesis = copy(value) as Genesis;
    if (await contentCid(genesis) !== link(expectedCid).$link) fail('anchor', 'Genesis differs from the pinned invitation');
    await key(genesis.sequencerKey);
    for (const actor of genesis.activationKeys) await key(actor);
    if (new Set(genesis.activationKeys).size !== genesis.activationKeys.length) fail('anchor', 'Duplicate initial activation key');
    return new Anchor(genesis, expectedCid);
  }
}
function intentShape(value: unknown): asserts value is Intent {
  validateFramework('test.atseq.defs#intent', value);
  const intent = value as Intent;
  if (!/^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*){2,}(?:#[A-Za-z][A-Za-z0-9_]*)?$/.test(intent.action)) fail('envelope', 'Action must name a Lexicon definition');
  if (!intent.payload || Array.isArray(intent.payload) || typeof intent.payload !== 'object') fail('envelope', 'Action payload must be an object');
  try { canonicalJson(intent.payload, PROFILE.actionBytes); }
  catch { fail('payload', 'Action payload is outside the JSON value/size profile'); }
}
function targets(intent: Intent, anchor: Anchor): void {
  if (intent.app !== anchor.genesis.app || intent.genesis.$link !== anchor.cid) fail('target', 'Intent targets a different application or genesis');
}
export function randomNonce(): Bytes { return bytes(crypto.getRandomValues(new Uint8Array(16))); }
export async function signIntent(value: Intent, signer: PrivateKey): Promise<SignedIntent> {
  intentShape(value);
  const intent = copy(value);
  if (signer.type !== 'p256' || await signer.exportPublicKey('did') !== intent.actorKey) fail('key', 'Signing key differs from the intent actor');
  return { $type: 'test.atseq.defs#signedIntent', intent, sig: bytes(await signer.sign(encodeBlock(intent))) };
}
export async function verifyIntent(value: unknown, anchor: Anchor): Promise<{ signed: SignedIntent; intentCid: string }> {
  validateFramework('test.atseq.defs#signedIntent', value);
  const signed = copy(value) as SignedIntent;
  intentShape(signed.intent); targets(signed.intent, anchor);
  await proof(signed.intent.actorKey, signed.sig, signed.intent);
  return { signed, intentCid: await contentCid(signed.intent) };
}
export function headAt(anchor: Anchor, position = 0, entryCid = anchor.cid): Head {
  const head: Head = { $type: 'test.atseq.head', version: 0, app: anchor.genesis.app, genesis: link(anchor.cid), position, entry: link(entryCid) };
  validateHead(head, anchor); return head;
}
export function validateHead(value: unknown, anchor: Anchor): asserts value is Head {
  validateFramework('test.atseq.head', value);
  const head = value as Head;
  if (head.app !== anchor.genesis.app || head.genesis.$link !== anchor.cid) fail('target', 'Head targets another anchor');
  if ((head.position === 0) !== (head.entry.$link === anchor.cid)) fail('head', 'Position zero must point to genesis; other positions must point to entries');
}
export function positionKey(position: number): string {
  if (!Number.isSafeInteger(position) || position < 1) fail('position', 'Entry position must be a positive safe integer');
  return String(position).padStart(16, '0');
}
export async function sequence(value: unknown, anchor: Anchor, previous: Head, signer: PrivateKey): Promise<Entry> {
  validateHead(previous, anchor);
  const head = copy(previous);
  const { signed } = await verifyIntent(value, anchor);
  if (signer.type !== 'p256' || await signer.exportPublicKey('did') !== anchor.genesis.sequencerKey) fail('key', 'Sequencer differs from genesis');
  const position = head.position + 1; positionKey(position);
  const unsigned = { $type: 'test.atseq.entry' as const, version: 0 as const, app: anchor.genesis.app, genesis: link(anchor.cid), position, prev: head.entry, signedIntent: signed, sequencerKey: anchor.genesis.sequencerKey };
  const entry = { ...unsigned, sig: bytes(await signer.sign(encodeBlock(unsigned))) };
  validateFramework('test.atseq.entry', entry); return entry;
}
export async function verifyEntry(value: unknown, anchor: Anchor): Promise<{ entry: Entry; receipt: Receipt }> {
  validateFramework('test.atseq.entry', value);
  const entry = copy(value) as Entry;
  if (entry.app !== anchor.genesis.app || entry.genesis.$link !== anchor.cid || entry.sequencerKey !== anchor.genesis.sequencerKey) fail('target', 'Entry differs from the pinned sequencer/application');
  const { sig, ...unsigned } = entry;
  await proof(entry.sequencerKey, sig, unsigned);
  const { intentCid } = await verifyIntent(entry.signedIntent, anchor);
  return { entry, receipt: { $type: 'test.atseq.defs#receipt', app: entry.app, genesis: entry.genesis, intent: link(intentCid), position: entry.position, entry: link(await contentCid(entry)) } };
}
/** Transport identity excludes signature bytes. Domain effectiveness is irrelevant. */
export function retryKey(intent: Intent): string {
  return JSON.stringify([intent.app, intent.actorKey, intent.nonce.$bytes]);
}
export class RetryIndex {
  private readonly items = new Map<string, Receipt>();
  async lookup(intent: Intent): Promise<Receipt | undefined> {
    intentShape(intent);
    const owned = copy(intent), existing = this.items.get(retryKey(owned));
    if (existing && existing.intent.$link !== await contentCid(owned)) fail('retry_conflict', 'Nonce already binds different intent content');
    return existing && copy(existing);
  }
  record(entry: Entry, receipt: Receipt): void {
    const identity = retryKey(entry.signedIntent.intent);
    if (this.items.has(identity)) fail('duplicate_retry', 'History records one retry identity more than once');
    this.items.set(identity, copy(receipt));
  }
}
/** Verify a complete chosen prefix, independent of record/page arrival order. */
export async function verifyHistory(anchor: Anchor, value: Head, records: unknown[]): Promise<{ head: Head; entries: Entry[]; retries: RetryIndex }> {
  validateHead(value, anchor); const head = copy(value);
  if (head.position !== records.length) fail('missing_history', 'Chosen head requires a complete prefix from genesis');
  const verified = [];
  for (const record of records) verified.push(await verifyEntry(record, anchor));
  verified.sort((a, b) => a.entry.position - b.entry.position);
  const retries = new RetryIndex(); let prev = anchor.cid;
  for (const [i, { entry, receipt }] of verified.entries()) {
    if (entry.position !== i + 1) fail('position', 'Duplicate or skipped entry position');
    if (entry.prev.$link !== prev) fail('predecessor', 'Entry predecessor differs from the verified prefix');
    retries.record(entry, receipt); prev = receipt.entry.$link;
  }
  if (prev !== head.entry.$link) fail('head', 'Head does not name the verified final entry');
  return { head, entries: verified.map(v => v.entry), retries };
}
