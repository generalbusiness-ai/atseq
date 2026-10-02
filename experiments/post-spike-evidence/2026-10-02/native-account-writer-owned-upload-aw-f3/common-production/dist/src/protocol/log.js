import { NSID } from '../core/nsids.js';
import { parseDidKey, P256PublicKey, verifySigWithDidKey } from '@atcute/crypto';
import { fromBytes } from '@atcute/cbor';
import { canonicalJson } from '../core/values.js';
import { PROFILE } from '../core/profile.js';
import { engineDescriptor } from '../core/contracts.js';
import { deepFreeze } from '../core/freeze.js';
import { bytes, contentCid, decodeBlock, encodeBlock, link, ProtocolError } from './wire.js';
import { validateFramework } from './schemas.js';
export const runtimeDescriptor = deepFreeze(engineDescriptor);
export const runtimeCid = () => contentCid(runtimeDescriptor);
function copy(value) {
    return decodeBlock(encodeBlock(value));
}
function fail(code, message) {
    throw new ProtocolError(code, message);
}
async function key(value) {
    let parsed;
    try {
        parsed = parseDidKey(value);
    }
    catch (error) {
        // These are the pinned did:key parser's explicit input diagnostics.
        if (!(error instanceof SyntaxError) &&
            !(error instanceof TypeError && /^unsupported key type \(0x[0-9a-f]+\)$/.test(error.message)))
            throw error;
        fail('key', 'Expected a canonical compressed P-256 did:key');
    }
    if (parsed.type !== 'p256' || parsed.publicKeyBytes.length !== 33 || ![2, 3].includes(parsed.publicKeyBytes[0]))
        fail('key', 'Expected a canonical compressed P-256 did:key');
    let pub;
    try {
        pub = await P256PublicKey.importRaw(parsed.publicKeyBytes);
    }
    catch (error) {
        if (!(error instanceof DOMException) || error.name !== 'DataError')
            throw error;
        fail('key', 'Invalid P-256 point');
    }
    if ((await pub.exportPublicKey('did')) !== value)
        fail('key', 'Noncanonical key');
}
async function proof(keyId, signature, data) {
    await key(keyId);
    if (!(await verifySigWithDidKey(keyId, new Uint8Array(fromBytes(signature)), encodeBlock(data), {
        allowMalleableSig: false,
    })))
        fail('signature', 'Invalid P-256 low-S signature');
}
/** An invitation pins both the application DID and genesis CID. */
export class Anchor {
    genesis;
    cid;
    constructor(genesis, cid) {
        this.genesis = genesis;
        this.cid = cid;
        Object.freeze(genesis.activationKeys);
        Object.freeze(genesis.profile);
        Object.freeze(genesis.definition);
        Object.freeze(genesis);
        Object.freeze(this);
    }
    static async from(value, expected) {
        if (typeof expected?.app !== 'string' || !expected.app || typeof expected.genesis !== 'string' || !expected.genesis)
            fail('anchor', 'Invitation requires both app and genesis pins');
        const pinned = { app: expected.app, genesis: expected.genesis };
        validateFramework(NSID.genesis, value);
        const genesis = copy(value);
        if (genesis.app !== pinned.app || (await contentCid(genesis)) !== link(pinned.genesis).$link)
            fail('anchor', 'Genesis differs from the pinned invitation');
        await key(genesis.sequencerKey);
        for (const actor of genesis.activationKeys)
            await key(actor);
        if (new Set(genesis.activationKeys).size !== genesis.activationKeys.length)
            fail('anchor', 'Duplicate initial activation key');
        return new Anchor(genesis, pinned.genesis);
    }
}
function intentShape(value) {
    validateFramework(NSID.defsIntent, value);
    const intent = value;
    if (!/^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*){2,}(?:#[A-Za-z][A-Za-z0-9_]*)?$/.test(intent.action))
        fail('envelope', 'Action must name a Lexicon definition');
    if (!intent.payload || Array.isArray(intent.payload) || typeof intent.payload !== 'object')
        fail('envelope', 'Action payload must be an object');
    try {
        canonicalJson(intent.payload, PROFILE.actionBytes);
    }
    catch {
        fail('payload', 'Action payload is outside the JSON value/size profile');
    }
}
function targets(intent, anchor) {
    if (intent.app !== anchor.genesis.app || intent.genesis.$link !== anchor.cid)
        fail('target', 'Intent targets a different application or genesis');
}
export function randomNonce() {
    return bytes(crypto.getRandomValues(new Uint8Array(16)));
}
export async function signIntent(value, signer) {
    intentShape(value);
    const intent = copy(value);
    if (signer.type !== 'p256' || (await signer.exportPublicKey('did')) !== intent.actorKey)
        fail('key', 'Signing key differs from the intent actor');
    return { $type: NSID.defsSignedIntent, intent, sig: bytes(await signer.sign(encodeBlock(intent))) };
}
export async function verifyIntent(value, anchor) {
    validateFramework(NSID.defsSignedIntent, value);
    const signed = copy(value);
    intentShape(signed.intent);
    targets(signed.intent, anchor);
    await proof(signed.intent.actorKey, signed.sig, signed.intent);
    return { signed, intentCid: await contentCid(signed.intent) };
}
export function headAt(anchor, position = 0, entryCid = anchor.cid) {
    const head = {
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
export function validateHead(value, anchor) {
    validateFramework(NSID.head, value);
    const head = value;
    if (head.app !== anchor.genesis.app || head.genesis.$link !== anchor.cid)
        fail('target', 'Head targets another anchor');
    if ((head.position === 0) !== (head.entry.$link === anchor.cid))
        fail('head', 'Position zero must point to genesis; other positions must point to entries');
}
export function positionKey(position) {
    if (!Number.isSafeInteger(position) || position < 1)
        fail('position', 'Entry position must be a positive safe integer');
    return String(position).padStart(16, '0');
}
export async function sequence(value, anchor, previous, signer) {
    validateHead(previous, anchor);
    const head = copy(previous);
    const { signed } = await verifyIntent(value, anchor);
    if (signer.type !== 'p256' || (await signer.exportPublicKey('did')) !== anchor.genesis.sequencerKey)
        fail('key', 'Sequencer differs from genesis');
    const position = head.position + 1;
    positionKey(position);
    const unsigned = {
        $type: NSID.entry,
        version: 1,
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
export async function verifyEntry(value, anchor) {
    validateFramework(NSID.entry, value);
    const entry = copy(value);
    if (entry.app !== anchor.genesis.app ||
        entry.genesis.$link !== anchor.cid ||
        entry.sequencerKey !== anchor.genesis.sequencerKey)
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
export function retryKey(intent) {
    return JSON.stringify([intent.app, intent.actorKey, intent.nonce.$bytes]);
}
export class RetryIndex {
    #items = new Map();
    #byIntent = new Map();
    #sealed = false;
    async lookup(intent) {
        intentShape(intent);
        const owned = copy(intent), existing = this.#items.get(retryKey(owned));
        if (existing && existing.intent.$link !== (await contentCid(owned)))
            fail('retry_conflict', 'Nonce already binds different intent content');
        return existing && copy(existing);
    }
    lookupCid(cid) {
        link(cid);
        const receipt = this.#byIntent.get(cid);
        return receipt && copy(receipt);
    }
    seal() {
        this.#sealed = true;
        return Object.freeze(this);
    }
    record(entry, receipt) {
        if (this.#sealed)
            throw new Error('Verified retry index is immutable');
        const identity = retryKey(entry.signedIntent.intent);
        if (this.#items.has(identity))
            fail('duplicate_retry', 'History records one retry identity more than once');
        const owned = copy(receipt);
        this.#items.set(identity, owned);
        this.#byIntent.set(receipt.intent.$link, owned);
    }
}
const histories = new WeakMap();
/** Only verifyHistory can issue this immutable capability; copies are unverified. */
export function assertVerifiedHistory(history, anchor) {
    if (histories.get(history)?.genesis !== anchor.cid)
        fail('missing_history', 'History must be verified for this pinned genesis');
}
export function verifiedEntryCid(history, anchor, position) {
    assertVerifiedHistory(history, anchor);
    if (position === 0)
        return anchor.cid;
    const cid = histories.get(history).entryCids[position - 1];
    if (!Number.isSafeInteger(position) || !cid)
        fail('position', 'Position is outside the verified prefix');
    return cid;
}
/** Verify a complete chosen prefix, independent of record/page arrival order. */
export async function verifyHistory(anchor, value, records) {
    validateHead(value, anchor);
    const head = copy(value);
    if (head.position !== records.length)
        fail('missing_history', 'Chosen head requires a complete prefix from genesis');
    const verified = [];
    for (const record of records)
        verified.push(await verifyEntry(record, anchor));
    verified.sort((a, b) => a.entry.position - b.entry.position);
    const retries = new RetryIndex();
    let prev = anchor.cid;
    for (const [i, { entry, receipt }] of verified.entries()) {
        if (entry.position !== i + 1)
            fail('position', 'Duplicate or skipped entry position');
        if (entry.prev.$link !== prev)
            fail('predecessor', 'Entry predecessor differs from the verified prefix');
        retries.record(entry, receipt);
        prev = receipt.entry.$link;
    }
    if (prev !== head.entry.$link)
        fail('head', 'Head does not name the verified final entry');
    const owned = deepFreeze({ head, entries: verified.map((v) => v.entry) });
    const history = Object.freeze({ ...owned, retries: retries.seal() });
    histories.set(history, { genesis: anchor.cid, entryCids: Object.freeze(verified.map((v) => v.receipt.entry.$link)) });
    return history;
}
//# sourceMappingURL=log.js.map