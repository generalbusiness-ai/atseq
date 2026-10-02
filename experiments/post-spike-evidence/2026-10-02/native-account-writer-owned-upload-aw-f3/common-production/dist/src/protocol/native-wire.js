/** Native-format foundation. Content checks do not authenticate repository publication. */
import { fromBytes } from '@atcute/cbor';
import { fromString, toString, create, CODEC_RAW, CID_VERSION, HASH_SHA256 } from '@atcute/cid';
import { parseDidKey, verifySigWithDidKey } from '@atcute/crypto';
import { fromBase32, toBase32 } from '@atcute/multibase';
import { deepFreeze } from '../core/freeze.js';
import { canonicalJson } from '../core/values.js';
import { PROFILE } from '../core/profile.js';
import { normalizeRepoSigningKey } from './native-proof.js';
import { NATIVE_NSID, nativeRef, validateNativeShape } from './native-schema.js';
export { validateNativeAccountDid } from './native-schema.js';
import { bytes, contentCid, decodeBlock, encodeBlock, link, ProtocolError } from './wire.js';
function fail(code, message) {
    throw new ProtocolError(code, message);
}
function copy(value) {
    return decodeBlock(encodeBlock(value));
}
function ordered(values, label) {
    if (values.some((value, index) => index > 0 && values[index - 1] >= value))
        fail('envelope', `${label} must be sorted and unique`);
}
function pairId(pair) {
    return JSON.stringify([pair.principal, pair.actorKey]);
}
function pairs(values) {
    ordered(values.map(pairId), 'Control pairs');
}
function role(value) {
    if (!/^[a-z][a-z0-9_]{0,63}$/.test(value) || ['govern', 'recover', 'certify', 'owner'].includes(value))
        fail('envelope', 'Expected a domain participation role');
}
function grantId(value) {
    if (!/^[a-z2-7]{26}$/.test(value))
        fail('envelope', 'Grant ID must be canonical 16-byte base32');
    const raw = fromBase32(value);
    if (raw.length !== 16 || toBase32(raw) !== value)
        fail('envelope', 'Noncanonical grant ID');
}
function action(value) {
    const [collection, definition, extra] = value.split('#');
    if (!collection || !definition || extra !== undefined || !/^[A-Za-z][A-Za-z0-9_]*$/.test(definition))
        fail('envelope', 'Expected a complete action/schema reference');
    // The ecosystem validates the NSID portion; the framework bounds the full ref.
    validateNativeShape(nativeRef('path'), { $type: nativeRef('path'), collection, rkey: 'self' });
}
function rawCid(value) {
    let parsed;
    try {
        parsed = fromString(value);
    }
    catch {
        fail('envelope', 'Expected canonical raw CID');
    }
    if (parsed.codec !== CODEC_RAW ||
        toString(parsed) !== value ||
        parsed.digest.contents.length !== 32 ||
        parsed.version !== CID_VERSION ||
        parsed.digest.codec !== HASH_SHA256)
        fail('envelope', 'Expected canonical raw SHA-256 CIDv1');
}
function origin(value) {
    let url;
    try {
        url = new URL(value);
    }
    catch {
        fail('envelope', 'Expected HTTPS origin');
    }
    if (url.protocol !== 'https:' ||
        url.username ||
        url.password ||
        url.search ||
        url.hash ||
        url.pathname !== '/' ||
        url.origin !== value)
        fail('envelope', 'Expected canonical credential-free HTTPS origin');
}
function timestamp(value) {
    const date = new Date(value);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) ||
        !Number.isFinite(date.getTime()) ||
        date.toISOString() !== value)
        fail('envelope', 'Expected exact diagnostic UTC timestamp');
}
/** Key representation only; grants and appointed powers are separate authority checks. */
export async function validateNativeDeviceKey(value) {
    let parsed;
    try {
        parsed = parseDidKey(value);
    }
    catch (error) {
        if (error instanceof SyntaxError || (error instanceof TypeError && /^unsupported key type /.test(error.message)))
            fail('key', 'Expected canonical P-256 device/control key');
        throw error;
    }
    if (parsed.type !== 'p256' || parsed.publicKeyBytes.length !== 33)
        fail('key', 'Device/control signing requires compressed P-256');
    let canonical;
    try {
        canonical = await normalizeRepoSigningKey(parsed);
    }
    catch (error) {
        if (error instanceof DOMException && error.name === 'DataError')
            fail('key', 'Invalid device/control point');
        throw error;
    }
    if (canonical !== value)
        fail('key', 'Noncanonical device/control key');
}
async function repoKey(value) {
    let parsed;
    try {
        parsed = parseDidKey(value);
    }
    catch (error) {
        if (error instanceof SyntaxError || (error instanceof TypeError && /^unsupported key type /.test(error.message)))
            fail('key', 'Expected repository signing key');
        throw error;
    }
    if (parsed.publicKeyBytes.length !== 33)
        fail('key', 'Repository key must be compressed');
    if ((await normalizeRepoSigningKey(parsed)) !== value)
        fail('key', 'Noncanonical repository key');
}
/** Returns owned, strictly shaped content; no authority outcome is inferred. */
export async function readNativeValue(ref, value) {
    validateNativeShape(ref, value);
    const owned = copy(value);
    async function appointments(values) {
        pairs(values);
        for (const pair of values) {
            ordered(pair.powers, 'Control powers');
            await validateNativeDeviceKey(pair.actorKey);
        }
    }
    const name = ref === NATIVE_NSID.content ? owned.body.$type : ref;
    const data = ref === NATIVE_NSID.content ? owned.body : owned;
    switch (name) {
        case NATIVE_NSID.genesis:
            await appointments(data.control);
            ordered(data.roles.map((r) => JSON.stringify([r.principal, r.role])), 'Initial roles');
            data.roles.forEach((r) => role(r.role));
            break;
        case nativeRef('intent'):
            await validateNativeDeviceKey(data.actorKey);
            await readNativeValue(data.operation.$type, data.operation);
            break;
        case nativeRef('signedRequest'):
            await readNativeValue(nativeRef('intent'), data.intent);
            break;
        case nativeRef('act'):
            grantId(data.grant.id);
            action(data.action);
            if (!data.payload || Array.isArray(data.payload) || typeof data.payload !== 'object')
                fail('payload', 'Expected action object');
            canonicalJson(data.payload, PROFILE.actionBytes);
            break;
        case nativeRef('assignRole'):
            grantId(data.grant.id);
            role(data.role);
            break;
        case nativeRef('setRole'):
        case nativeRef('requiredRole'):
            role(data.role);
            break;
        case nativeRef('setControl'):
            await appointments(data.control);
            break;
        case nativeRef('setRecovery'):
        case nativeRef('recoverGovernance'):
            pairs(data.recovery ?? data.governance);
            for (const pair of data.recovery ?? data.governance)
                await validateNativeDeviceKey(pair.actorKey);
            break;
        case nativeRef('activate'):
            ordered(data.closure, 'Activation closure');
            if (!data.closure.includes(data.definition.$link))
                fail('envelope', 'Activation closure omits its definition');
            for (const id of data.closure) {
                const parsed = fromString(id);
                if (parsed.codec === CODEC_RAW)
                    rawCid(id);
                else
                    link(id);
            }
            break;
        case nativeRef('accountOperation'):
            await readNativeValue(data.operation.$type, data.operation);
            break;
        case nativeRef('admitGrant'):
        case nativeRef('revokeGrant'):
            grantId((data.grant ?? data.revoke).id);
            break;
        case NATIVE_NSID.entry:
            await readNativeValue(data.request.$type, data.request);
            break;
        case NATIVE_NSID.grant:
            grantId(data.id);
            await validateNativeDeviceKey(data.actorKey);
            if (!data.actions.length && !data.assignRoles.length)
                fail('envelope', 'Empty grant scope');
            ordered(data.actions.map((scope) => JSON.stringify([scope.action, scope.execution.$link])), 'Grant action scopes');
            data.actions.forEach((scope) => action(scope.action));
            ordered(data.assignRoles, 'Grant role scopes');
            data.assignRoles.forEach(role);
            break;
        case NATIVE_NSID.revoke:
            grantId(data.id);
            break;
        case NATIVE_NSID.file:
            rawCid(data.cid);
            break;
        case NATIVE_NSID.definition:
            if (new Set(data.files.map((f) => f.path)).size !== data.files.length)
                fail('envelope', 'Duplicate source paths');
            data.files.forEach((f) => rawCid(f.cid));
            for (const a of data.actions) {
                action(a.ref);
                await readNativeValue(a.authorization.$type, a.authorization);
            }
            break;
        case nativeRef('byteManifest'):
            if (data.chunks.length !== Math.ceil(data.byteLength / (32 * 1024)))
                fail('envelope', 'Manifest count/length mismatch');
            break;
        case nativeRef('observationPolicy'):
            origin(data.plcDirectory);
            break;
        case nativeRef('observation'):
        case nativeRef('appBinding'):
            origin(data.binding.pdsOrigin);
            await repoKey(data.binding.signingKeyDid);
            if (data.before.$type !== data.after.$type)
                fail('envelope', 'Mixed identity evidence methods');
            if (name === nativeRef('observation')) {
                timestamp(data.observedAt);
                ordered(data.records.map((r) => r.path), 'Observed record paths');
                for (const r of data.records) {
                    const [collection, rkey, extra] = r.path.split('/');
                    if (extra !== undefined)
                        fail('path', 'Expected two native path components');
                    nativePath(collection, rkey);
                }
            }
            break;
        case nativeRef('actionContract'):
            action(data.schemas.stateRoot);
            action(data.schemas.actionRoot);
            rawCid(data.fold);
            await readNativeValue(data.authorization.$type, data.authorization);
            break;
    }
    return deepFreeze(owned);
}
export function nativePath(collection, rkey) {
    validateNativeShape(nativeRef('path'), { $type: nativeRef('path'), collection, rkey });
    return `${collection}/${rkey}`;
}
export function nativePositionKey(position) {
    if (!Number.isSafeInteger(position) || position < 1)
        fail('position', 'Expected positive safe position');
    return String(position).padStart(16, '0');
}
export function parseNativePositionKey(value) {
    if (!/^[0-9]{16}$/.test(value))
        fail('position', 'Expected exactly 16 decimal digits');
    const position = Number(value);
    if (nativePositionKey(position) !== value)
        fail('position', 'Noncanonical position');
    return position;
}
export function nativeEntryPath(genesis, position) {
    return nativePath(NATIVE_NSID.entry, `${link(genesis).$link}.${nativePositionKey(position)}`);
}
export function nativeGenesisPath(genesis) {
    return nativePath(NATIVE_NSID.genesis, link(genesis).$link);
}
export function nativeHeadPath(genesis) {
    return nativePath(NATIVE_NSID.head, link(genesis).$link);
}
/** Strict record and key derivation. The caller must separately verify native membership. */
export async function readNativeRecord(collection, rkey, raw) {
    nativePath(collection, rkey);
    const value = await readNativeValue(collection, decodeBlock(raw));
    let expected;
    switch (collection) {
        case NATIVE_NSID.genesis:
        case NATIVE_NSID.epoch:
        case NATIVE_NSID.content:
        case NATIVE_NSID.definition:
            expected = await contentCid(value);
            break;
        case NATIVE_NSID.head:
            expected = value.genesis.$link;
            break;
        case NATIVE_NSID.entry:
            expected = `${value.genesis.$link}.${nativePositionKey(value.position)}`;
            break;
        case NATIVE_NSID.epochCurrent:
            expected = 'self';
            break;
        case NATIVE_NSID.grant:
        case NATIVE_NSID.revoke:
            expected = value.id;
            break;
        case NATIVE_NSID.file:
            expected = value.cid;
            break;
        default:
            fail('path', 'Not a native Atseq record collection');
    }
    if (rkey !== expected)
        fail('path', 'Record differs from canonical native key');
    return value;
}
/** Exact external pin, not native-root authentication or supported-semantic admission. */
export class NativeAnchor {
    genesis;
    cid;
    constructor(genesis, cid) {
        this.genesis = genesis;
        this.cid = cid;
        Object.freeze(this);
    }
    static async from(value, expected) {
        const pinned = copy(expected);
        if (!pinned || Object.keys(pinned).sort().join(',') !== 'app,genesis')
            fail('target', 'Expected exact app/genesis pin');
        const genesis = await readNativeValue(NATIVE_NSID.genesis, value);
        if (genesis.app !== pinned.app || (await contentCid(genesis)) !== link(pinned.genesis).$link)
            fail('target', 'Genesis differs from external pin');
        return new NativeAnchor(genesis, pinned.genesis);
    }
}
function target(app, genesis, anchor) {
    if (app !== anchor.genesis.app || genesis.$link !== anchor.cid)
        fail('target', 'Wrong native application scope');
}
export async function nativeHeadAt(anchor, position = 0, entry = anchor.cid) {
    return readNativeHead({
        $type: NATIVE_NSID.head,
        version: 2,
        app: anchor.genesis.app,
        genesis: link(anchor.cid),
        position,
        entry: link(entry),
    }, anchor);
}
export async function readNativeHead(value, anchor) {
    const head = await readNativeValue(NATIVE_NSID.head, value);
    target(head.app, head.genesis, anchor);
    if ((head.position === 0) !== (head.entry.$link === anchor.cid))
        fail('envelope', 'Position zero must name genesis');
    return head;
}
export async function signNativeIntent(value, signer) {
    const intent = await readNativeValue(nativeRef('intent'), value);
    if (signer.type !== 'p256' || (await signer.exportPublicKey('did')) !== intent.actorKey)
        fail('key', 'Signer differs from intent');
    return readNativeValue(nativeRef('signedRequest'), {
        $type: nativeRef('signedRequest'),
        intent,
        sig: bytes(await signer.sign(encodeBlock(intent))),
    });
}
export async function verifyNativeSigned(value, anchor) {
    const signed = await readNativeValue(nativeRef('signedRequest'), value);
    target(signed.intent.app, signed.intent.genesis, anchor);
    if (!(await verifySigWithDidKey(signed.intent.actorKey, new Uint8Array(fromBytes(signed.sig)), encodeBlock(signed.intent), { allowMalleableSig: false })))
        fail('signature', 'Invalid native device/control signature');
    return { signed, requestCid: await contentCid(signed.intent) };
}
/** Pure R0 tuple encoding. A host must verify shape/signature before lookup. */
export function nativeRetryIdentity(intent) {
    validateNativeShape(nativeRef('intent'), intent);
    return JSON.stringify([intent.app, intent.genesis.$link, intent.actorKey, intent.nonce.$bytes]);
}
/** Entry contents only: no native commit proof, prefix uniqueness, or authority outcome. */
export async function verifyNativeEntryContents(value, anchor) {
    const entry = await readNativeValue(NATIVE_NSID.entry, value);
    target(entry.app, entry.genesis, anchor);
    let requestCid;
    if (entry.request.$type === nativeRef('signedRequest'))
        requestCid = (await verifyNativeSigned(entry.request, anchor)).requestCid;
    else {
        const op = entry.request;
        target(op.app, op.genesis, anchor);
        if (op.position !== entry.position || op.prev.$link !== entry.prev.$link)
            fail('envelope', 'Account operation outer context mismatch');
        requestCid = await contentCid(op);
    }
    return { entry, requestCid, entryCid: await contentCid(entry) };
}
export async function createNativeEntry(request, anchor, previous) {
    const head = await readNativeHead(previous, anchor);
    if (head.position === Number.MAX_SAFE_INTEGER)
        fail('position', 'Native append would overflow');
    return (await verifyNativeEntryContents({
        $type: NATIVE_NSID.entry,
        version: 2,
        app: head.app,
        genesis: head.genesis,
        position: head.position + 1,
        prev: head.entry,
        request,
    }, anchor)).entry;
}
export async function nativeObservationSubject(value) {
    const owned = copy(await readNativeValue(value.$type, value));
    if (owned.$type === nativeRef('accountOperation'))
        delete owned.observation;
    else if (owned.$type === nativeRef('intent') && owned.operation.$type === nativeRef('recoverParticipant'))
        delete owned.operation.observation;
    else
        fail('envelope', 'Only account imports or participant recovery consume observations');
    return contentCid({ $type: nativeRef('observationSubject'), request: owned });
}
/** Five-field owned JSON, intentionally independent of device/grant/epoch enrolment. */
export function nativeFoldMetadata(entry) {
    if (entry.request.$type !== nativeRef('signedRequest'))
        fail('envelope', 'Account imports do not execute domain folds');
    const intent = entry.request.intent;
    if (intent.operation.$type !== nativeRef('act'))
        fail('envelope', 'Only ordinary actions execute domain folds');
    return deepFreeze(copy({
        app: entry.app,
        genesis: entry.genesis.$link,
        position: entry.position,
        principal: intent.principal,
        execution: intent.operation.execution.$link,
    }));
}
/** Local budget failures remain transient, separate from protocol shape failures. */
export async function reconstructNativeBytes(manifest, reader, maximumBytes) {
    if (!Number.isSafeInteger(maximumBytes) || maximumBytes < 0)
        throw new ProtocolError('input', 'Invalid local byte budget');
    const owned = await readNativeValue(NATIVE_NSID.content, manifest);
    if (owned.body.$type !== nativeRef('byteManifest'))
        fail('envelope', 'Expected byte manifest');
    if (owned.body.byteLength > maximumBytes)
        throw new ProtocolError('native_proof_limit', 'Retained bytes exceed local budget');
    const result = new Uint8Array(owned.body.byteLength);
    let offset = 0;
    for (const id of owned.body.chunks) {
        const raw = await reader.get(id.$link);
        const chunk = await readNativeRecord(NATIVE_NSID.content, id.$link, raw);
        if (chunk.body.$type !== nativeRef('byteChunk'))
            fail('envelope', 'Manifest references non-chunk content');
        const bytes = new Uint8Array(fromBytes(chunk.body.bytes));
        if (bytes.length !== Math.min(32 * 1024, result.length - offset))
            fail('envelope', 'Noncanonical chunk size/manifest length');
        result.set(bytes, offset);
        offset += bytes.length;
    }
    return result;
}
export async function reconstructNativeFile(file, reader, maximumBytes) {
    const owned = await readNativeValue(NATIVE_NSID.file, file);
    const manifest = await readNativeRecord(NATIVE_NSID.content, owned.bytes.$link, await reader.get(owned.bytes.$link));
    const raw = await reconstructNativeBytes(manifest, reader, maximumBytes);
    if (toString(await create(CODEC_RAW, raw)) !== owned.cid)
        throw new ProtocolError('content_corrupt', 'File bytes differ from raw identity');
    return raw;
}
//# sourceMappingURL=native-wire.js.map