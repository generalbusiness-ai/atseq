import { SOURCE_LIMITS } from '../core/limits.js';
import { fromUint8Array, writeCarStream } from '@atcute/car';
import { create, fromString, toString, CODEC_DCBOR, CODEC_RAW } from '@atcute/cid';
import { AtseqError } from '../core/errors.js';
import { decodeBlock, encodeBlock, isCborInputError } from '../protocol/wire.js';
import { InterpretationError, PROFILE } from '../core/profile.js';
export class SourceSizeError extends InterpretationError {
    bytes;
    constructor(bytes) {
        super('source_size', 'Source object exceeds the definition bound');
        this.bytes = new Uint8Array(bytes);
    }
}
export const SOURCE_POOL_BYTES = SOURCE_LIMITS.bytes;
export async function readSource(reader, cid) {
    let raw;
    try {
        raw = new Uint8Array(await reader.get(cid));
    }
    catch (error) {
        if (error instanceof SourceSizeError)
            raw = new Uint8Array(error.bytes);
        else if (['content', 'content_corrupt'].includes(error?.code))
            throw new InterpretationError('content_corrupt', `Source reader reported corruption: ${cid}`);
        else {
            if (error instanceof AtseqError && (error.kind !== 'invalid_input' || error.code === 'content_missing'))
                throw error;
            throw new InterpretationError('content_unavailable', `Source reader could not establish availability: ${cid}`);
        }
    }
    try {
        const parsed = fromString(cid);
        if ((parsed.codec !== CODEC_RAW && parsed.codec !== CODEC_DCBOR) ||
            toString(await create(parsed.codec, raw)) !== cid)
            throw new Error('CID mismatch');
    }
    catch {
        throw new InterpretationError('content_corrupt', `Source does not match its content identity: ${cid}`);
    }
    if (raw.length > PROFILE.definitionBytes)
        throw new InterpretationError('source_size', `Verified source object exceeds ${PROFILE.definitionBytes} bytes`);
    if (fromString(cid).codec === CODEC_DCBOR)
        decodeBlock(raw);
    return raw;
}
/** Standard CAR transport; owned blocks, bounded parsing, no network resolver. */
export class SourceBundle {
    root;
    blocks;
    constructor(root, blocks) {
        this.root = root;
        this.blocks = blocks;
    }
    static async read(carBytes) {
        return SourceBundle.readWithin(carBytes, PROFILE.definitionBytes);
    }
    /** Transport evidence for an activation attempt, including oversized definitions. */
    static async readClosure(carBytes) {
        return SourceBundle.readWithin(carBytes, SOURCE_POOL_BYTES);
    }
    static async readWithin(carBytes, limit) {
        if (carBytes.length > limit)
            throw new InterpretationError('definition_size', `Source CAR exceeds its ${limit}-byte bound including framing`);
        try {
            const car = fromUint8Array(new Uint8Array(carBytes));
            if (car.roots.length !== 1)
                throw new InterpretationError('source_car', 'Expected one definition root');
            const root = car.roots[0].$link;
            const blocks = new Map();
            for (const block of car) {
                const cid = toString(block.cid);
                if (blocks.has(cid) || blocks.size >= PROFILE.definitionFiles)
                    throw new InterpretationError('source_car', 'Duplicate or excessive source blocks');
                blocks.set(cid, new Uint8Array(block.bytes));
            }
            const bundle = new SourceBundle(root, blocks);
            for (const cid of blocks.keys())
                await readSource(bundle, cid);
            if (!blocks.has(root))
                throw new InterpretationError('source_car', 'Missing root');
            return bundle;
        }
        catch (error) {
            if (error instanceof AtseqError)
                throw error;
            const carInput = error instanceof Error &&
                ((error.constructor === RangeError &&
                    /^(invalid car (block|header); length=\d+|unexpected end of data|incorrect cid digest type \(got 0x[0-9a-f]+\))$/.test(error.message)) ||
                    (error.constructor === TypeError && error.message === 'expected a car v1 archive'));
            if (!carInput && !isCborInputError(error))
                throw error;
            throw new InterpretationError('source_car', error.message);
        }
    }
    static async collect(root, ids, reader) {
        const blocks = new Map();
        for (const cid of ids)
            blocks.set(cid, await readSource(reader, cid));
        return SourceBundle.read(await new SourceBundle(root, blocks).write());
    }
    static async collectClosure(root, ids, reader) {
        if (ids.length > PROFILE.definitionFiles)
            throw new InterpretationError('source_car', 'Excessive closure blocks');
        const blocks = new Map();
        let size = 0;
        for (const cid of ids) {
            const block = await readSource(reader, cid);
            size += block.length;
            if (size > SOURCE_POOL_BYTES)
                throw new InterpretationError('source_pool_limit', 'Closure exceeds the 16 MiB source transport bound');
            blocks.set(cid, block);
        }
        return SourceBundle.readClosure(await new SourceBundle(root, blocks).writeClosure());
    }
    async get(cid) {
        const block = this.blocks.get(cid);
        if (!block)
            throw new InterpretationError('content_missing', `Source is not in the retained bundle: ${cid}`);
        return new Uint8Array(block);
    }
    identities() {
        return [...this.blocks.keys()];
    }
    async write() {
        return this.writeWithin(PROFILE.definitionBytes);
    }
    async writeClosure() {
        return this.writeWithin(SOURCE_POOL_BYTES);
    }
    async writeWithin(limit) {
        const blocks = [...this.blocks].map(([cid, data]) => ({ cid: fromString(cid).bytes, data }));
        const chunks = [];
        let size = 0;
        for await (const chunk of writeCarStream([{ $link: this.root }], blocks)) {
            size += chunk.length;
            if (size > limit)
                throw new InterpretationError('definition_size', `Source CAR exceeds its ${limit}-byte bound including framing`);
            chunks.push(chunk);
        }
        const car = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) {
            car.set(chunk, offset);
            offset += chunk.length;
        }
        return car;
    }
    static async pack(manifest, files) {
        const blocks = new Map();
        const entries = [];
        for (const [path, value] of Object.entries(files).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
            const raw = new Uint8Array(value), cid = toString(await create(CODEC_RAW, raw));
            blocks.set(cid, raw);
            entries.push({ path, cid });
        }
        const rootBytes = encodeBlock({ ...manifest, files: entries });
        const root = toString(await create(CODEC_DCBOR, rootBytes));
        blocks.set(root, rootBytes);
        const bundle = new SourceBundle(root, blocks);
        // Apply the same transport checks to author-created and imported bundles.
        return SourceBundle.read(await bundle.write());
    }
}
/** One stable reader per app; new verified source bundles can arrive after opening. */
export class SourcePool {
    blocks = new Map();
    async add(bundle) {
        const next = new Map(this.blocks);
        for (const cid of bundle.identities())
            next.set(cid, await bundle.get(cid));
        if (next.size > SOURCE_LIMITS.blocks ||
            [...next.values()].reduce((size, block) => size + block.length, 0) > SOURCE_POOL_BYTES)
            throw new InterpretationError('source_pool_limit', `Retained application source exceeds the local ${SOURCE_LIMITS.bytes}-byte / ${SOURCE_LIMITS.blocks}-block limit`);
        this.blocks.clear();
        for (const [cid, bytes] of next)
            this.blocks.set(cid, bytes);
    }
    async get(cid) {
        const value = this.blocks.get(cid);
        if (!value)
            throw new InterpretationError('content_missing', `Retained source is unavailable: ${cid}`);
        return new Uint8Array(value);
    }
}
//# sourceMappingURL=source.js.map