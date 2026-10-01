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
      /^(input is not valid utf-8|The encoded data was not valid for encoding utf-8|The encoded data is not valid.|non-canonical argument encoding|expected map to only have string keys; got type \d+|expected cid-link to be type 2 \(bytes\); got type \d+|unsupported tag; got \d+|invalid type; got \d+|map keys are not in canonical order or contain duplicates)$/,
    ],
    [SyntaxError, /^invalid binary cid$/],
    [Error, /^(invalid argument encoding; got \d+|invalid simple value; got \d+|decoded value contains remainder)$/],
  ];
  return expected.some(([constructor, pattern]) => error.constructor === constructor && pattern.test(error.message));
}
/** Preserve the exact canonical block; a decode/re-encode equality check is mandatory. */
export function decodeBlock(raw: Uint8Array): Json {
  if (raw.length > WIRE.blockBytes) throw new ProtocolError('wire_size', 'Block exceeds 64 KiB');
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
