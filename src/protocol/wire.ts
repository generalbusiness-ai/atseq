import {
  encode,
  decode,
  BytesWrapper,
  CidLinkWrapper,
  fromBytes,
  toBytes,
  type Bytes,
  type CidLink,
} from '@atcute/cbor';
import { create, fromString, toString, CODEC_DCBOR } from '@atcute/cid';
import { canonicalJson, type Json } from '../core/values.ts';
import { assertDependencies } from '../core/dependencies.ts';
import { isUtf8 } from '../core/utf8.ts';

export const WIRE = Object.freeze({ version: 1, blockBytes: 64 * 1024, jsonBytes: 128 * 1024, depth: 32 });
import { AtseqError, ProtocolError } from '../core/errors.ts';
export { ProtocolError } from '../core/errors.ts';
export function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
export function isCidInputError(error: unknown): error is Error {
  return (
    error instanceof Error &&
    ((error.constructor === SyntaxError && /^(not a valid cid string|invalid binary cid)$/.test(error.message)) ||
      (error.constructor === RangeError &&
        /^(cid too short|incorrect cid (version|codec|digest codec|digest size) \(got .+\)|cid bytes includes remainder|invalid digest length)$/.test(
          error.message,
        )))
  );
}
export function link(cid: string): CidLink {
  if (typeof cid !== 'string') throw new ProtocolError('wire_cid', 'Expected a CID string');
  let parsed;
  try {
    parsed = fromString(cid);
  } catch (error) {
    if (!isCidInputError(error)) throw error;
    throw new ProtocolError('wire_cid', 'Expected a base32 CIDv1 with CBOR codec and SHA-256');
  }
  if (parsed.codec !== CODEC_DCBOR || toString(parsed) !== cid)
    throw new ProtocolError('wire_cid', 'Expected canonical CBOR CID');
  return { $link: cid };
}
export function bytes(raw: Uint8Array): Bytes {
  return { $bytes: toBytes(raw).$bytes };
}
/** Plain Lexicon JSON is the API boundary. No coercion or omitted undefined values. */
function validate(value: unknown): asserts value is Json {
  canonicalJson(value, WIRE.jsonBytes, WIRE.depth);
  function walk(v: any): void {
    if (!v || typeof v !== 'object') return;
    if (Array.isArray(v)) {
      v.forEach(walk);
      return;
    }
    if (Object.hasOwn(v, '$bytes')) {
      if (
        Object.keys(v).length !== 1 ||
        typeof v.$bytes !== 'string' ||
        !/^[A-Za-z0-9+/]*$/.test(v.$bytes) ||
        v.$bytes.length % 4 === 1 ||
        bytes(fromBytes(v)).$bytes !== v.$bytes
      )
        throw new ProtocolError('wire_bytes', 'Bytes use one $bytes field with canonical unpadded base64');
      return;
    }
    if (Object.hasOwn(v, '$link')) {
      if (Object.keys(v).length !== 1) throw new ProtocolError('wire_cid', 'A link has exactly one $link field');
      link(v.$link);
      return;
    }
    for (const [key, item] of Object.entries(v)) {
      if (key.startsWith('$') && key !== '$type') throw new ProtocolError('wire_key', `Reserved data-model key ${key}`);
      walk(item);
    }
  }
  walk(value);
}
export function encodeBlock(value: unknown): Uint8Array<ArrayBuffer> {
  assertDependencies();
  validate(value);
  const encoded = new Uint8Array(encode(value));
  if (encoded.length > WIRE.blockBytes) throw new ProtocolError('wire_size', 'Block exceeds 64 KiB');
  return encoded;
}
/** Inspect only CBOR framing and text bytes; the decoder still checks canonicality. */
function validateTextBytes(raw: Uint8Array): void {
  let offset = 0;
  const fail = (): never => {
    throw new ProtocolError('noncanonical', 'Invalid CBOR framing or UTF-8 text');
  };
  function take(count: number): Uint8Array {
    if (count > raw.length - offset) fail();
    const result = raw.subarray(offset, offset + count);
    offset += count;
    return result;
  }
  function argument(info: number): number {
    let argument = info;
    if (info >= 24) {
      if (info > 27) fail();
      argument = 0;
      for (const byte of take(2 ** (info - 24))) argument = argument * 256 + byte;
      if (!Number.isSafeInteger(argument)) fail();
    }
    return argument;
  }
  function item(depth: number): void {
    if (depth > WIRE.depth) throw new ProtocolError('wire_depth', 'Block nesting exceeds the profile');
    const first = take(1)[0]!,
      type = first >> 5,
      info = first & 31;
    if (type === 7) {
      if (info === 27) take(8);
      else if (![20, 21, 22].includes(info)) fail();
      return;
    }
    const arg = argument(info);
    if (type === 2 || type === 3) {
      const value = take(arg);
      if (type === 3 && !isUtf8(value)) fail();
    } else if (type === 4 || type === 5) {
      const count = arg * (type === 5 ? 2 : 1);
      if (count > raw.length - offset) fail();
      for (let i = 0; i < count; i++) item(depth + 1);
    } else if (type === 6) {
      // DAG-CBOR has one tag: a CID directly wrapping bytes. Never recurse
      // through tags; malformed chains must not consume the engine stack.
      if (arg !== 42) fail();
      const payload = take(1)[0]!;
      if (payload >> 5 !== 2) fail();
      take(argument(payload & 31));
    }
  }
  item(0);
  if (offset !== raw.length) fail();
}
/** These messages come from the pinned @atcute/cbor decoder and its CID reader. */
export function isCborInputError(error: unknown): error is Error {
  if (!(error instanceof Error)) return false;
  const expected: [Function, RegExp][] = [
    [
      RangeError,
      /^(could not decode varint|unexpected end of input|NaN and Infinity values not supported|can't decode integers beyond safe integer range|cid too short|incorrect cid version \(got v\d+\)|incorrect cid codec \(got 0x[0-9a-f]+\)|incorrect cid digest codec \(got 0x[0-9a-f]+\)|incorrect cid digest size \(got \d+\)|cid bytes includes remainder)$/,
    ],
    [
      TypeError,
      /^(non-canonical argument encoding|expected map to only have string keys; got type \d+|expected cid-link to be type 2 \(bytes\); got type \d+|unsupported tag; got \d+|invalid type; got \d+|map keys are not in canonical order or contain duplicates)$/,
    ],
    [SyntaxError, /^invalid binary cid$/],
    [Error, /^(invalid argument encoding; got \d+|invalid simple value; got \d+|decoded value contains remainder)$/],
  ];
  return expected.some(([constructor, pattern]) => error.constructor === constructor && pattern.test(error.message));
}
/** Preserve the exact canonical block; a decode/re-encode equality check is mandatory. */
export function decodeBlock(raw: Uint8Array): Json {
  if (raw.length > WIRE.blockBytes) throw new ProtocolError('wire_size', 'Block exceeds 64 KiB');
  validateTextBytes(raw);
  try {
    function plain(value: any, depth: number): Json {
      if (depth > WIRE.depth) throw new ProtocolError('wire_depth', 'Block nesting exceeds the profile');
      if (value instanceof BytesWrapper || value instanceof CidLinkWrapper) return value.toJSON() as unknown as Json;
      if (Array.isArray(value)) return value.map((v) => plain(v, depth + 1));
      if (value && typeof value === 'object')
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, plain(v, depth + 1)]));
      return value;
    }
    const value = plain(decode(new Uint8Array(raw)), 0);
    if (!sameBytes(raw, encodeBlock(value)))
      throw new ProtocolError('noncanonical', 'Block has a different canonical encoding');
    return value;
  } catch (error) {
    if (error instanceof AtseqError || !isCborInputError(error)) throw error;
    throw new ProtocolError('noncanonical', error.message);
  }
}
export async function blockCid(raw: Uint8Array): Promise<string> {
  decodeBlock(raw);
  return toString(await create(CODEC_DCBOR, raw));
}
export async function contentCid(value: unknown): Promise<string> {
  return toString(await create(CODEC_DCBOR, encodeBlock(value)));
}
