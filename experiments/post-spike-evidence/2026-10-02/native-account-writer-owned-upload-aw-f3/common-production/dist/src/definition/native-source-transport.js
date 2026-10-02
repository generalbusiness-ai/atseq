/** Complete-byte facts only. The caller must separately authenticate selection of this closed set. */
import { create, fromDigest, fromString, toString, CODEC_DCBOR, CODEC_RAW } from '@atcute/cid';
import { writeCarStream } from '@atcute/car';
import { encodingLength } from '@atcute/varint';
import { sha256 } from '@noble/hashes/sha2';
import { assertDependencies } from '../core/dependencies.js';
import { InterpretationError, PROFILE } from '../core/profile.js';
import { ProtocolError } from '../core/errors.js';
import { decodeBlock, isCidInputError } from '../protocol/wire.js';
import { WIRE_LIMITS } from '../core/limits.js';
const typedArrayPrototype = Object.getPrototypeOf(Uint8Array.prototype);
const byteLength = Object.getOwnPropertyDescriptor(typedArrayPrototype, 'byteLength').get;
const byteOffset = Object.getOwnPropertyDescriptor(typedArrayPrototype, 'byteOffset').get;
const backingBuffer = Object.getOwnPropertyDescriptor(typedArrayPrototype, 'buffer').get;
function invalid(message) {
    return { ok: false, error: new InterpretationError('invalid_activation', message) };
}
function unavailable(message) {
    throw new InterpretationError('content_unavailable', message);
}
function parseCid(value, codec) {
    let parsed;
    try {
        parsed = fromString(value);
    }
    catch (error) {
        if (!isCidInputError(error))
            throw error;
        return invalid('Source closure contains an invalid CID');
    }
    if (toString(parsed) !== value || (codec !== undefined && parsed.codec !== codec))
        return invalid('Source closure contains an unexpected CID codec');
    return parsed;
}
function budget(value, fallback) {
    const chosen = value ?? fallback;
    if (!Number.isSafeInteger(chosen) || chosen < 0)
        throw new TypeError('Expected a nonnegative local byte budget');
    return chosen;
}
/** Activation preserves the exact supplied signed vector. */
export function collectNativeSourceClosure(rootCid, closure, reader, options = {}) {
    if (!Array.isArray(closure))
        return Promise.resolve(invalid('Expected a source closure vector'));
    return collectSource(rootCid, [...closure], reader, { ...options });
}
/** Genesis derives its set from the pinned, verified root; no caller vector or trusted mode. */
export function collectNativeGenesisSource(rootCid, reader, options = {}) {
    return collectSource(rootCid, null, reader, { ...options });
}
/** Hash the entire supplied stream before interpreting length as an authenticated fact. */
async function collectSource(rootCid, closure, reader, options) {
    assertDependencies();
    const retainBudget = Math.min(PROFILE.definitionBytes, budget(options.maximumRetainedBytes, PROFILE.definitionBytes));
    const readBudget = budget(options.maximumReadBytes, 16 * 1024 * 1024);
    const rootIdentity = parseCid(rootCid, CODEC_DCBOR);
    if ('ok' in rootIdentity)
        return rootIdentity;
    // These are authenticated-set/count facts only once the later authority owner binds this result.
    if (closure !== null && (!Array.isArray(closure) || closure.length < 1 || closure.length > 64))
        return invalid('Source closure must contain 1–64 distinct blocks');
    let identities = closure === null ? [rootCid] : [...closure];
    if (new Set(identities).size !== identities.length || !identities.includes(rootCid))
        return invalid('Source closure must contain its single root without duplicates');
    const parsed = new Map();
    for (const cid of identities) {
        const identity = parseCid(cid, cid === rootCid ? CODEC_DCBOR : CODEC_RAW);
        if ('ok' in identity)
            return identity;
        parsed.set(cid, identity);
    }
    let delivered = 0;
    let deliveredChunks = 0;
    let retained = 0;
    async function read(cid, maximumRetained) {
        const expected = parsed.get(cid);
        const input = await reader.get(cid);
        if (!(input instanceof Uint8Array) && (!input || typeof input[Symbol.asyncIterator] !== 'function'))
            unavailable('Source reader did not supply bytes or a byte stream');
        const stream = input instanceof Uint8Array ? [input] : input;
        const hash = sha256.create();
        let size = 0;
        let buffer = new Uint8Array(maximumRetained);
        for await (const chunk of stream) {
            if (!(chunk instanceof Uint8Array))
                unavailable('Source reader did not supply bytes');
            const length = byteLength.call(chunk);
            const offsetInBuffer = byteOffset.call(chunk);
            const underlying = backingBuffer.call(chunk);
            // Empty chunks must neither accumulate retained objects nor make the read budget unbounded.
            if (++deliveredChunks > Math.max(64, readBudget))
                unavailable('Local source chunk budget exhausted');
            delivered += length;
            if (!Number.isSafeInteger(delivered) || delivered > readBudget)
                unavailable('Local source read budget exhausted before complete verification');
            if (!length)
                continue;
            // Hash exactly the owned snapshot we retain, even if a caller supplied shared/mutable storage.
            // Fixed-size scratch also avoids copying a whole oversized delivered chunk.
            for (let offset = 0; offset < length; offset += 32 * 1024) {
                const owned = new Uint8Array(new Uint8Array(underlying, offsetInBuffer + offset, Math.min(32 * 1024, length - offset)));
                size += owned.length;
                hash.update(owned);
                if (size > maximumRetained)
                    buffer = undefined;
                else
                    buffer?.set(owned, size - owned.length);
            }
        }
        const actual = toString(fromDigest(expected.codec, hash.digest()));
        if (actual !== cid)
            throw new InterpretationError('content_corrupt', 'Source bytes do not match the listed CID');
        const raw = buffer?.slice(0, size);
        return { cid: expected, size, ...(raw ? { raw } : {}) };
    }
    const root = await read(rootCid, WIRE_LIMITS.blockBytes);
    if (!root.raw)
        return invalid('Definition root exceeds the canonical wire block limit');
    let value;
    try {
        value = decodeBlock(root.raw);
    }
    catch (error) {
        // This scope receives only owned, hash-verified root bytes, never a reader callback.
        const codes = [
            'noncanonical',
            'wire_depth',
            'wire_size',
            'wire_value',
            'wire_bytes',
            'wire_cid',
            'wire_key',
            'wire_number',
            'value_bytes',
            'value_depth',
            'reserved_key',
            'unicode',
        ];
        if (!(error instanceof InterpretationError || error instanceof ProtocolError) ||
            ![InterpretationError, ProtocolError].includes(error.constructor) ||
            !codes.includes(error.code))
            throw error;
        return { ok: false, error };
    }
    if (!value || !Array.isArray(value.files) || value.files.length > 63)
        return invalid('Definition root must declare at most 63 named files');
    const declared = value.files;
    // A malformed root cannot name an interpretable dependency set. Full manifest validation follows closure verification.
    for (const file of declared) {
        if (!file || typeof file.path !== 'string' || typeof file.cid !== 'string')
            return invalid('Definition root contains an invalid file binding');
        const identity = parseCid(file.cid, CODEC_RAW);
        if ('ok' in identity)
            return identity;
    }
    if (closure === null) {
        identities = [...new Set([rootCid, ...declared.map((file) => file.cid)])].sort();
        for (const cid of identities) {
            const identity = parseCid(cid, cid === rootCid ? CODEC_DCBOR : CODEC_RAW);
            if ('ok' in identity)
                return identity;
            parsed.set(cid, identity);
        }
    }
    const verified = new Map([[rootCid, root]]);
    retained = root.size;
    for (const cid of identities) {
        if (cid === rootCid)
            continue;
        const block = await read(cid, Math.max(0, retainBudget - retained));
        if (block.raw)
            retained += block.size;
        verified.set(cid, block);
    }
    const expected = new Set([rootCid, ...declared.map((file) => file.cid)]);
    if (expected.size !== verified.size || [...expected].some((cid) => !verified.has(cid)))
        return invalid('Signed source closure differs from the complete declared file set');
    // Use the maintained CAR writer for the canonical header and maintained varint sizing for entries.
    const header = await writeCarStream([{ $link: toString(rootIdentity) }], []).next();
    if (header.done)
        throw new Error('CAR writer did not produce its header');
    let logicalCarBytes = header.value.length;
    for (const block of verified.values()) {
        const entrySize = block.cid.bytes.length + block.size;
        logicalCarBytes += encodingLength(entrySize) + entrySize;
    }
    const decodedOccurrenceBytes = root.size + declared.reduce((sum, file) => sum + verified.get(file.cid).size, 0);
    if (logicalCarBytes > PROFILE.definitionBytes || decodedOccurrenceBytes > PROFILE.definitionBytes)
        return invalid('Verified source exceeds a 512 KiB normative closure limit');
    if (retained > retainBudget || [...verified.values()].some((block) => !block.raw))
        unavailable('Complete legal source exceeds the local retention budget');
    const files = new Map(declared.map((file) => [file.path, new Uint8Array(verified.get(file.cid).raw)]));
    return {
        ok: true,
        value: {
            root: value,
            rootBytes: new Uint8Array(root.raw),
            identities,
            files,
            logicalCarBytes,
            decodedOccurrenceBytes,
        },
    };
}
/** Diagnostic convenience only; thrown errors are not owner-returned source facts. */
export async function readNativeSourceClosure(root, closure, reader, options = {}) {
    const result = await collectNativeSourceClosure(root, closure, reader, options);
    if (!result.ok)
        throw result.error;
    return result.value;
}
/** Independent maintained one-shot equivalent, used by conformance callers. */
export async function nativeSourceBytesCid(raw) {
    assertDependencies();
    return toString(await create(CODEC_RAW, raw));
}
//# sourceMappingURL=native-source-transport.js.map