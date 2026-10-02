/** Complete-byte facts only. The caller must separately authenticate selection of this closed set. */
import { create, fromDigest, fromString, toString, CODEC_DCBOR, CODEC_RAW, type Cid } from '@atcute/cid';
import { writeCarStream } from '@atcute/car';
import { encodingLength } from '@atcute/varint';
import { sha256 } from '@noble/hashes/sha2';
import { assertDependencies } from '../core/dependencies.ts';
import { InterpretationError, PROFILE } from '../core/profile.ts';
import { decodeBlock, isCidInputError } from '../protocol/wire.ts';
import { WIRE_LIMITS } from '../core/limits.ts';

export interface NativeSourceReader {
  get(cid: string): Promise<Uint8Array | AsyncIterable<Uint8Array>>;
}
export interface NativeSourceReadOptions {
  /** Operational retention budget, not a replicated validity rule. Root scratch is at most 64 KiB. */
  maximumRetainedBytes?: number;
  /** Operational cap on all delivered bytes; reaching it cannot prove normative invalidity. */
  maximumReadBytes?: number;
}
interface VerifiedBlock {
  cid: Cid;
  size: number;
  raw?: Uint8Array;
}
const typedArrayPrototype = Object.getPrototypeOf(Uint8Array.prototype);
const byteLength = Object.getOwnPropertyDescriptor(typedArrayPrototype, 'byteLength')!.get!;
const byteOffset = Object.getOwnPropertyDescriptor(typedArrayPrototype, 'byteOffset')!.get!;
const backingBuffer = Object.getOwnPropertyDescriptor(typedArrayPrototype, 'buffer')!.get!;
export interface NativeSourceClosure {
  root: unknown;
  rootBytes: Uint8Array;
  identities: string[];
  files: Map<string, Uint8Array>;
  logicalCarBytes: number;
  decodedOccurrenceBytes: number;
}
function invalid(message: string): never {
  throw new InterpretationError('invalid_activation', message);
}
function unavailable(message: string): never {
  throw new InterpretationError('content_unavailable', message);
}
function parseCid(value: string, codec?: number): Cid {
  let parsed;
  try {
    parsed = fromString(value);
  } catch (error) {
    if (!isCidInputError(error)) throw error;
    return invalid('Source closure contains an invalid CID');
  }
  if (toString(parsed) !== value || (codec !== undefined && parsed.codec !== codec))
    invalid('Source closure contains an unexpected CID codec');
  return parsed;
}
function budget(value: number | undefined, fallback: number): number {
  const chosen = value ?? fallback;
  if (!Number.isSafeInteger(chosen) || chosen < 0) throw new TypeError('Expected a nonnegative local byte budget');
  return chosen;
}

/** Hash the entire supplied stream before interpreting length as an authenticated fact. */
export async function readNativeSourceClosure(
  rootCid: string,
  closure: readonly string[],
  reader: NativeSourceReader,
  options: NativeSourceReadOptions = {},
): Promise<NativeSourceClosure> {
  assertDependencies();
  const retainBudget = Math.min(PROFILE.definitionBytes, budget(options.maximumRetainedBytes, PROFILE.definitionBytes));
  const readBudget = budget(options.maximumReadBytes, 16 * 1024 * 1024);
  const rootIdentity = parseCid(rootCid, CODEC_DCBOR);
  // These are authenticated-set/count facts only once the later authority owner binds this result.
  if (!Array.isArray(closure) || closure.length < 1 || closure.length > 64)
    invalid('Source closure must contain 1–64 distinct blocks');
  const identities = [...closure];
  if (new Set(identities).size !== identities.length || !identities.includes(rootCid))
    invalid('Source closure must contain its single root without duplicates');
  const parsed = new Map(identities.map((cid) => [cid, parseCid(cid, cid === rootCid ? CODEC_DCBOR : CODEC_RAW)]));
  let delivered = 0;
  let deliveredChunks = 0;
  let retained = 0;
  async function read(cid: string, maximumRetained: number): Promise<VerifiedBlock> {
    const expected = parsed.get(cid)!;
    const input = await reader.get(cid);
    const stream = input instanceof Uint8Array ? [input] : input;
    const hash = sha256.create();
    let size = 0;
    let buffer: Uint8Array | undefined = new Uint8Array(maximumRetained);
    for await (const chunk of stream) {
      if (!(chunk instanceof Uint8Array)) unavailable('Source reader did not supply bytes');
      const length = byteLength.call(chunk) as number;
      const offsetInBuffer = byteOffset.call(chunk) as number;
      const underlying = backingBuffer.call(chunk) as ArrayBufferLike;
      // Empty chunks must neither accumulate retained objects nor make the read budget unbounded.
      if (++deliveredChunks > Math.max(64, readBudget)) unavailable('Local source chunk budget exhausted');
      delivered += length;
      if (!Number.isSafeInteger(delivered) || delivered > readBudget)
        unavailable('Local source read budget exhausted before complete verification');
      if (!length) continue;
      // Hash exactly the owned snapshot we retain, even if a caller supplied shared/mutable storage.
      // Fixed-size scratch also avoids copying a whole oversized delivered chunk.
      for (let offset = 0; offset < length; offset += 32 * 1024) {
        const owned = new Uint8Array(
          new Uint8Array(underlying, offsetInBuffer + offset, Math.min(32 * 1024, length - offset)),
        );
        size += owned.length;
        hash.update(owned);
        if (size > maximumRetained) buffer = undefined;
        else buffer?.set(owned, size - owned.length);
      }
    }
    const actual = toString(fromDigest(expected.codec as typeof CODEC_RAW | typeof CODEC_DCBOR, hash.digest()));
    if (actual !== cid) throw new InterpretationError('content_corrupt', 'Source bytes do not match the listed CID');
    const raw = buffer?.slice(0, size);
    return { cid: expected, size, ...(raw ? { raw } : {}) };
  }
  const root = await read(rootCid, WIRE_LIMITS.blockBytes);
  if (!root.raw) invalid('Definition root exceeds the canonical wire block limit');
  const value = decodeBlock(root.raw) as any;
  if (!value || !Array.isArray(value.files) || value.files.length > 63)
    invalid('Definition root must declare at most 63 named files');
  const declared: { path: string; cid: string }[] = value.files;
  // A malformed root cannot name an interpretable dependency set. Full manifest validation follows closure verification.
  for (const file of declared) {
    if (!file || typeof file.path !== 'string' || typeof file.cid !== 'string')
      invalid('Definition root contains an invalid file binding');
    parseCid(file.cid, CODEC_RAW);
  }
  const verified = new Map<string, VerifiedBlock>([[rootCid, root]]);
  retained = root.size;
  for (const cid of identities) {
    if (cid === rootCid) continue;
    const block = await read(cid, Math.max(0, retainBudget - retained));
    if (block.raw) retained += block.size;
    verified.set(cid, block);
  }
  const expected = new Set([rootCid, ...declared.map((file) => file.cid)]);
  if (expected.size !== verified.size || [...expected].some((cid) => !verified.has(cid)))
    invalid('Signed source closure differs from the complete declared file set');
  // Use the maintained CAR writer for the canonical header and maintained varint sizing for entries.
  const header = await writeCarStream([{ $link: toString(rootIdentity) }], []).next();
  if (header.done) throw new Error('CAR writer did not produce its header');
  let logicalCarBytes = header.value.length;
  for (const block of verified.values()) {
    const entrySize = block.cid.bytes.length + block.size;
    logicalCarBytes += encodingLength(entrySize) + entrySize;
  }
  const decodedOccurrenceBytes = root.size + declared.reduce((sum, file) => sum + verified.get(file.cid)!.size, 0);
  if (logicalCarBytes > PROFILE.definitionBytes || decodedOccurrenceBytes > PROFILE.definitionBytes)
    invalid('Verified source exceeds a 512 KiB normative closure limit');
  if (retained > retainBudget || [...verified.values()].some((block) => !block.raw))
    unavailable('Complete legal source exceeds the local retention budget');
  const files = new Map(declared.map((file) => [file.path, new Uint8Array(verified.get(file.cid)!.raw!)]));
  return {
    root: value,
    rootBytes: new Uint8Array(root.raw),
    identities,
    files,
    logicalCarBytes,
    decodedOccurrenceBytes,
  };
}

/** Independent maintained one-shot equivalent, used by conformance callers. */
export async function nativeSourceBytesCid(raw: Uint8Array): Promise<string> {
  assertDependencies();
  return toString(await create(CODEC_RAW, raw));
}
