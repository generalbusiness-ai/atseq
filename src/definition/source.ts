import { fromUint8Array, writeCarStream } from '@atcute/car';
import { create, fromString, toString, CODEC_DCBOR, CODEC_RAW } from '@atcute/cid';
import { decodeBlock, encodeBlock } from '../protocol/wire.ts';
import { InterpretationError, PROFILE } from '../runtime/profile.ts';

export interface SourceReader { get(cid: string): Promise<Uint8Array> }
export async function readSource(reader: SourceReader, cid: string): Promise<Uint8Array> {
  let raw: Uint8Array;
  try { raw = new Uint8Array(await reader.get(cid)); }
  catch (error) {
    if (['content', 'content_corrupt'].includes((error as any)?.code)) throw new InterpretationError('content_corrupt', `Source reader reported corruption: ${cid}`);
    throw new InterpretationError('content_missing', `Required source is unavailable: ${cid}`);
  }
  try {
    const parsed = fromString(cid);
    if ((parsed.codec !== CODEC_RAW && parsed.codec !== CODEC_DCBOR) || raw.length > PROFILE.definitionBytes || toString(await create(parsed.codec, raw)) !== cid) throw new Error('CID or size mismatch');
    if (parsed.codec === CODEC_DCBOR) decodeBlock(raw);
  } catch { throw new InterpretationError('content_corrupt', `Source does not match its content identity: ${cid}`); }
  return raw;
}

/** Standard CAR transport; owned blocks, bounded parsing, no network resolver. */
export class SourceBundle implements SourceReader {
  private constructor(readonly root: string, private readonly blocks: Map<string, Uint8Array>) {}
  static async read(carBytes: Uint8Array): Promise<SourceBundle> {
    if (carBytes.length > PROFILE.definitionBytes) throw new InterpretationError('definition_size', 'Import exceeds 512 KiB including CAR framing');
    try {
      const car = fromUint8Array(new Uint8Array(carBytes));
      if (car.roots.length !== 1) throw new Error('Expected one definition root');
      const root = car.roots[0]!.$link; const blocks = new Map<string, Uint8Array>();
      for (const block of car) {
        const cid = toString(block.cid);
        if (blocks.has(cid) || blocks.size >= PROFILE.definitionFiles) throw new Error('Duplicate or excessive source blocks');
        blocks.set(cid, new Uint8Array(block.bytes));
      }
      const bundle = new SourceBundle(root, blocks);
      for (const cid of blocks.keys()) await readSource(bundle, cid);
      if (!blocks.has(root)) throw new Error('Missing root');
      return bundle;
    } catch (error) {
      if (error instanceof InterpretationError) throw error;
      throw new InterpretationError('source_car', String((error as Error).message));
    }
  }
  static async collect(root: string, ids: string[], reader: SourceReader): Promise<SourceBundle> {
    const blocks = new Map<string, Uint8Array>();
    for (const cid of ids) blocks.set(cid, await readSource(reader, cid));
    return SourceBundle.read(await new SourceBundle(root, blocks).write());
  }
  async get(cid: string): Promise<Uint8Array> {
    const block = this.blocks.get(cid);
    if (!block) throw new InterpretationError('content_missing', `Source is not in the retained bundle: ${cid}`);
    return new Uint8Array(block);
  }
  identities(): string[] { return [...this.blocks.keys()]; }
  async write(): Promise<Uint8Array> {
    const blocks = [...this.blocks].map(([cid, data]) => ({ cid: fromString(cid).bytes, data }));
    const chunks = []; let size = 0;
    for await (const chunk of writeCarStream([{ $link: this.root }], blocks)) { chunks.push(chunk); size += chunk.length; }
    if (size > PROFILE.definitionBytes) throw new InterpretationError('definition_size', 'Import exceeds 512 KiB including CAR framing');
    const car = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { car.set(chunk, offset); offset += chunk.length; }
    return car;
  }
  static async pack(manifest: Record<string, unknown>, files: Record<string, Uint8Array>): Promise<SourceBundle> {
    const blocks = new Map<string, Uint8Array>(); const entries = [];
    for (const [path, value] of Object.entries(files).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) {
      const raw = new Uint8Array(value), cid = toString(await create(CODEC_RAW, raw));
      blocks.set(cid, raw); entries.push({ path, cid });
    }
    const rootBytes = encodeBlock({ ...manifest, files: entries });
    const root = toString(await create(CODEC_DCBOR, rootBytes)); blocks.set(root, rootBytes);
    const bundle = new SourceBundle(root, blocks);
    // Apply the same transport checks to author-created and imported bundles.
    return SourceBundle.read(await bundle.write());
  }
}

/** One stable reader per app; new verified source bundles can arrive after opening. */
export class SourcePool implements SourceReader {
  private readonly blocks = new Map<string, Uint8Array>();
  async add(bundle: SourceBundle): Promise<void> {
    const next = new Map(this.blocks);
    for (const cid of bundle.identities()) next.set(cid, await bundle.get(cid));
    if (next.size > 2048 || [...next.values()].reduce((size, block) => size + block.length, 0) > 16 * 1024 * 1024) throw new InterpretationError('source_pool_limit', 'Retained application source exceeds the local 16 MiB / 2048-block limit');
    this.blocks.clear(); for (const [cid, bytes] of next) this.blocks.set(cid, bytes);
  }
  async get(cid: string): Promise<Uint8Array> {
    const value = this.blocks.get(cid);
    if (!value) throw new InterpretationError('content_missing', `Retained source is unavailable: ${cid}`);
    return new Uint8Array(value);
  }
}
