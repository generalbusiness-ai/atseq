import { P256PrivateKeyExportable, Secp256k1PrivateKeyExportable } from '@atcute/crypto';
import { fromBytes } from '@atcute/cbor';
import { Lexicons, jsonToLex } from '@atproto/lexicon';
import vectors from '../tests/vectors/protocol-v0.json';
import { Anchor, headAt, positionKey, randomNonce, runtimeCid, sequence, signIntent, verifyEntry, verifyHistory, verifyIntent, type Entry, type Genesis, type Intent, type SignedIntent } from '../src/protocol/log.ts';
import { bytes, contentCid, decodeBlock, encodeBlock, link } from '../src/protocol/wire.ts';
import { frameworkLexicons, validateFramework } from '../src/protocol/schemas.ts';
import type { FixtureResult } from './corpus.ts';

const clone = <T>(v: T): T => structuredClone(v);
function equal(actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
}
function hex(raw: Uint8Array): string { return Array.from(raw, v => v.toString(16).padStart(2, '0')).join(''); }
function unhex(raw: string): Uint8Array { return Uint8Array.from(raw.match(/../g) ?? [], v => parseInt(v, 16)); }
async function rejects(run: () => unknown, code?: string) {
  try { await run(); } catch (error) { if (code && (error as any).code !== code) throw error; return; }
  throw new Error(`Expected ${code ?? 'rejection'}`);
}
export async function runProtocolCorpus(): Promise<FixtureResult[]> {
  const results: FixtureResult[] = [];
  const check = async (name: string, run: () => unknown) => {
    try { await run(); results.push({ name, passed: true }); }
    catch (error) { results.push({ name, passed: false, detail: `${(error as any).code ?? 'error'}: ${(error as Error).message}` }); }
  };
  const anchor = await Anchor.from(vectors.genesis.value, vectors.genesis.cid);
  const signed = vectors.signed.value as SignedIntent;
  const first = vectors.entry.value as Entry;
  for (const name of ['profile', 'definition', 'genesis', 'intent', 'signed', 'entry', 'head'] as const) {
    await check(`independent CBOR and CID: ${name}`, async () => {
      const vector = vectors[name];
      equal(hex(encodeBlock(vector.value)), vector.cborHex);
      equal(await contentCid(vector.value), vector.cid);
      equal(hex(encodeBlock(decodeBlock(unhex(vector.cborHex)))), vector.cborHex);
    });
  }
  await check('runtime descriptor CID matches independent vector', async () => equal(await runtimeCid(), vectors.profile.cid));
  await check('independent actor signature verifies', async () => equal((await verifyIntent(signed, anchor)).intentCid, vectors.intent.cid));
  await check('independent sequencer signature verifies', async () => equal((await verifyEntry(first, anchor)).receipt.entry.$link, vectors.entry.cid));
  await check('two valid signature encodings share content identity and receipt', async () => {
    if (signed.sig.$bytes === vectors.alternateActorSignature.$bytes) throw new Error('Fixture must contain distinct signatures');
    const alternate = { ...signed, sig: vectors.alternateActorSignature };
    const history = await verifyHistory(anchor, vectors.head.value as any, [first]);
    equal((await verifyIntent(alternate, anchor)).intentCid, vectors.intent.cid);
    equal(await history.retries.lookup(alternate.intent), await history.retries.lookup(signed.intent));
  });
  for (const [name, mutate, code] of [
    ['app', (i: Intent) => { i.app = 'did:plc:bbbbbbbbbbbbbbbbbbbbbbbb'; }, 'target'],
    ['genesis', (i: Intent) => { i.genesis = link(vectors.definition.cid); }, 'target'],
    ['definition', (i: Intent) => { i.definition = link(vectors.genesis.cid); }, 'signature'],
    ['payload', (i: Intent) => { i.payload.delta = 4; }, 'signature'],
    ['extra payload field', (i: Intent) => { i.payload.another = true; }, 'signature'],
    ['nonce', (i: Intent) => { i.nonce = bytes(new Uint8Array(16).fill(5)); }, 'signature'],
    ['action', (i: Intent) => { i.action = 'test.atseq.totals#other'; }, 'signature'],
    ['actor key', (i: Intent) => { i.actorKey = anchor.genesis.sequencerKey; }, 'signature'],
    ['version', (i: Intent) => { (i as any).version = 1; }, 'envelope'],
    ['domain', (i: Intent) => { (i as any).$type = 'test.other.defs#intent'; }, 'envelope'],
  ] as const) {
    await check(`changed intent ${name} rejected`, () => { const bad = clone(signed); mutate(bad.intent); return rejects(() => verifyIntent(bad, anchor), code); });
  }
  await check('unknown framework fields are refused, never stripped', () => rejects(() => verifyIntent({ ...signed, ignored: true }, anchor), 'envelope'));
  await check('genesis anchor cannot be replaced', () => rejects(() => Anchor.from({ ...anchor.genesis, definition: anchor.genesis.profile }, anchor.cid), 'anchor'));
  await check('duplicate genesis activation keys rejected', async () => {
    const bad = { ...anchor.genesis, activationKeys: [signed.intent.actorKey, signed.intent.actorKey] };
    await rejects(async () => Anchor.from(bad, await contentCid(bad)), 'anchor');
  });
  await check('signature bit flip rejected', () => { const bad = clone(signed); const sig = new Uint8Array(fromBytes(bad.sig)); sig[0]! ^= 1; bad.sig = bytes(sig); return rejects(() => verifyIntent(bad, anchor), 'signature'); });
  await check('high-S variant rejected', () => {
    const bad = clone(signed), sig = new Uint8Array(fromBytes(bad.sig));
    const n = BigInt('0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551');
    const high = (n - BigInt('0x' + hex(sig.slice(32)))).toString(16).padStart(64, '0');
    sig.set(unhex(high), 32); bad.sig = bytes(sig); return rejects(() => verifyIntent(bad, anchor), 'signature');
  });
  for (const [name, data] of [
    ['duplicate map key', 'a2616101616102'], ['noncanonical key order', 'a2616201616102'],
    ['long integer encoding', '1817'], ['float encoding of integer', 'fb3ff0000000000000'],
    ['negative zero', 'fb8000000000000000'], ['indefinite array', '9f01ff'],
    ['trailing bytes', '0100'], ['non-string map key', 'a10102'], ['unsupported tag', 'c001'],
    ['invalid UTF-8', '61ff'], ['truncated string', '6478'], ['huge truncated array', '9affffffff'],
  ]) await check(`wire rejects ${name}`, () => rejects(() => decodeBlock(unhex(data!))));
  await check('wire rejects deep nesting', () => rejects(() => decodeBlock(unhex('81'.repeat(33) + '01'))));
  await check('wire block byte boundary', async () => {
    equal(encodeBlock('x'.repeat(65533)).length, 65536);
    await rejects(() => encodeBlock('x'.repeat(65534)), 'wire_size');
    await rejects(() => decodeBlock(new Uint8Array(65537)), 'wire_size');
  });
  for (const [name, value] of [
    ['undefined field', { x: undefined }], ['negative zero value', { x: -0 }],
    ['malformed Unicode key', { ['\ud800']: 1 }], ['malformed Unicode value', '\ud800'],
    ['extra bytes member', { $bytes: 'AA', extra: 1 }], ['noncanonical base64', { $bytes: 'AB' }],
    ['padded base64', { $bytes: 'AA==' }], ['extra CID member', { $link: vectors.genesis.cid, extra: 1 }],
    ['reserved data-model field', { $future: 1 }], ['unsafe integer', Number.MAX_SAFE_INTEGER + 1],
    ['float value', 0.5], ['invalid CID', { $link: 'not-a-cid' }],
  ] as const) await check(`wire input rejects ${name}`, () => rejects(() => encodeBlock(value)));
  await check('UTF-8 map ordering and absent/null remain distinct', () => {
    equal(hex(encodeBlock({ 'aa': 1, 'é': 2, '𐀀': 3 })), 'a36261610162c3a90264f090808003');
    if (hex(encodeBlock({})) === hex(encodeBlock({ value: null }))) throw new Error('Absence collapsed');
  });
  const actor = await P256PrivateKeyExportable.importRaw(new Uint8Array([...Array(31).fill(0), 1]));
  const sequencer = await P256PrivateKeyExportable.importRaw(new Uint8Array([...Array(31).fill(0), 2]));
  await check('live signing verifies without a second SHA-256', async () => { const generated = await signIntent(signed.intent, actor); equal((await verifyIntent(generated, anchor)).intentCid, vectors.intent.cid); });
  await check('wrong signing key rejected', () => rejects(() => signIntent(signed.intent, sequencer), 'key'));
  await check('wrong curve rejected', async () => {
    const wrong = await Secp256k1PrivateKeyExportable.createKeypair();
    await rejects(async () => signIntent({ ...signed.intent, actorKey: await wrong.exportPublicKey('did') }, wrong), 'key');
  });
  const secondSigned = await signIntent({ ...signed.intent, nonce: bytes(new Uint8Array(16).fill(1)) }, actor);
  const second = await sequence(secondSigned, anchor, vectors.head.value as any, sequencer);
  const head = headAt(anchor, 2, await contentCid(second));
  await check('history follows signed positions, not arrival order', async () => equal((await verifyHistory(anchor, head, [second, first])).entries.map(e => e.position), [1, 2]));
  await check('empty genesis prefix', async () => equal((await verifyHistory(anchor, headAt(anchor), [])).entries.length, 0));
  await check('missing history cannot appear current', () => rejects(() => verifyHistory(anchor, head, [first]), 'missing_history'));
  await check('duplicate positions rejected', () => rejects(() => verifyHistory(anchor, head, [first, first]), 'position'));
  await check('altered predecessor invalidates proof', () => rejects(() => verifyEntry({ ...second, prev: link(vectors.definition.cid) }, anchor), 'signature'));
  await check('valid signature on wrong predecessor still rejected', async () => {
    const wrong = await sequence(secondSigned, anchor, headAt(anchor, 1, vectors.definition.cid), sequencer);
    await rejects(async () => verifyHistory(anchor, headAt(anchor, 2, await contentCid(wrong)), [first, wrong]), 'predecessor');
  });
  await check('valid signature on skipped position still rejected', async () => {
    const wrong = await sequence(secondSigned, anchor, headAt(anchor, 2, vectors.entry.cid), sequencer);
    await rejects(async () => verifyHistory(anchor, headAt(anchor, 2, await contentCid(wrong)), [first, wrong]), 'position');
  });
  await check('altered chosen head rejected', () => rejects(() => verifyHistory(anchor, { ...head, entry: link(vectors.definition.cid) }, [first, second]), 'head'));
  await check('position zero is genesis only', () => rejects(() => headAt(anchor, 0, vectors.entry.cid), 'head'));
  await check('entry keys have fixed width and safe bounds', async () => {
    equal(positionKey(1), '0000000000000001'); equal(positionKey(Number.MAX_SAFE_INTEGER), '9007199254740991');
    for (const n of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) await rejects(() => positionKey(n), 'position');
  });
  await check('conflicting content under retained nonce is rejected', async () => {
    const history = await verifyHistory(anchor, head, [first, second]);
    await rejects(() => history.retries.lookup({ ...signed.intent, payload: { delta: 999 } }), 'retry_conflict');
  });
  await check('same retry identity cannot be recorded twice', async () => {
    const duplicate = await sequence(signed, anchor, vectors.head.value as any, sequencer);
    await rejects(async () => verifyHistory(anchor, headAt(anchor, 2, await contentCid(duplicate)), [first, duplicate]), 'duplicate_retry');
  });
  await check('nonce exact width', async () => {
    equal(fromBytes(randomNonce()).length, 16);
    for (const n of [15, 17]) await rejects(() => signIntent({ ...signed.intent, nonce: bytes(new Uint8Array(n)) }, actor), 'envelope');
  });
  await check('signature exact width', async () => {
    for (const n of [63, 65]) await rejects(() => verifyIntent({ ...signed, sig: bytes(new Uint8Array(n)) }, anchor), 'envelope');
  });
  await check('action payload exact JSON byte boundary', async () => {
    const intent = { ...signed.intent, payload: { s: 'x'.repeat(32768 - 8) } };
    await signIntent(intent, actor);
    await rejects(() => signIntent({ ...intent, payload: { s: intent.payload.s + 'x' } }, actor), 'payload');
  });
  await check('framework validation retains unknown action content', async () => {
    const other = await signIntent({ ...signed.intent, definition: link(vectors.profile.cid), action: 'test.unknown.act#custom', payload: { untouched: true } }, actor);
    validateFramework('test.atseq.defs#signedIntent', other);
    equal((await verifyIntent(other, anchor)).signed.intent.payload, { untouched: true });
  });
  await check('fixed XRPC schemas load and validate through Lexicon', () => {
    const schemas = new Lexicons(structuredClone(frameworkLexicons));
    const targets = { app: anchor.genesis.app, genesis: anchor.cid };
    schemas.assertValidXrpcInput('test.atseq.submit', jsonToLex({ block: bytes(encodeBlock(signed)) } as any));
    schemas.assertValidXrpcInput('test.atseq.create', jsonToLex({ source: bytes(new TextEncoder().encode('{}')), activationKeys: [signed.intent.actorKey] } as any));
    schemas.assertValidXrpcParams('test.atseq.describe', targets);
    schemas.assertValidXrpcParams('test.atseq.query', { ...targets, name: 'summary', params: '{}' });
    schemas.assertValidXrpcParams('test.atseq.receipt', { ...targets, intent: vectors.intent.cid });
    schemas.assertValidXrpcOutput('test.atseq.query', jsonToLex({ head: vectors.head.value, frontier: null, result: { $type: 'test.atseq.defs#queryUnavailable', code: 'content_missing', message: 'Definition is not available' } } as any));
  });
  return results;
}
