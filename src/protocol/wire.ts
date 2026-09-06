import { encode, decode, BytesWrapper, CidLinkWrapper, fromBytes, type Bytes, type CidLink } from '@atcute/cbor';
import { create, fromString, toString, CODEC_DCBOR } from '@atcute/cid';
import { canonicalJson, type Json } from '../runtime/values.ts';

export const WIRE = Object.freeze({ version: 0, blockBytes: 64 * 1024, jsonBytes: 128 * 1024, depth: 32 });
export class ProtocolError extends Error {
  constructor(public readonly code: string, message: string) { super(message); this.name = 'ProtocolError'; }
}
export function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
export function link(cid: string): CidLink {
  try { const parsed = fromString(cid); if (parsed.codec !== CODEC_DCBOR || toString(parsed) !== cid) throw new Error('Expected canonical CBOR CID'); }
  catch { throw new ProtocolError('wire_cid', 'Expected a base32 CIDv1 with CBOR codec and SHA-256'); }
  return { $link: cid };
}
export function bytes(raw: Uint8Array): Bytes {
  return { $bytes: btoa(String.fromCharCode(...raw)).replace(/=+$/, '') };
}
/** Plain Lexicon JSON is the API boundary. No coercion or omitted undefined values. */
function validate(value: unknown): asserts value is Json {
  canonicalJson(value, WIRE.jsonBytes, WIRE.depth);
  function walk(v: any): void {
    if (!v || typeof v !== 'object') return;
    if (Array.isArray(v)) { v.forEach(walk); return; }
    if (Object.hasOwn(v, '$bytes')) {
      if (Object.keys(v).length !== 1 || typeof v.$bytes !== 'string' || !/^[A-Za-z0-9+/]*$/.test(v.$bytes) || bytes(fromBytes(v)).$bytes !== v.$bytes) throw new ProtocolError('wire_bytes', 'Bytes use one $bytes field with canonical unpadded base64');
      return;
    }
    if (Object.hasOwn(v, '$link')) {
      if (Object.keys(v).length !== 1) throw new ProtocolError('wire_cid', 'A link has exactly one $link field');
      link(v.$link); return;
    }
    for (const [key, item] of Object.entries(v)) {
      if (key.startsWith('$') && key !== '$type') throw new ProtocolError('wire_key', `Reserved data-model key ${key}`);
      walk(item);
    }
  }
  walk(value);
}
export function encodeBlock(value: unknown): Uint8Array<ArrayBuffer> {
  try {
    validate(value);
    const encoded = new Uint8Array(encode(value));
    if (encoded.length > WIRE.blockBytes) throw new ProtocolError('wire_size', 'Block exceeds 64 KiB');
    return encoded;
  } catch (error) {
    if (error instanceof ProtocolError) throw error;
    throw new ProtocolError('wire_value', String((error as Error).message));
  }
}
/** Preserve the exact canonical block; a decode/re-encode equality check is mandatory. */
export function decodeBlock(raw: Uint8Array): Json {
  if (raw.length > WIRE.blockBytes) throw new ProtocolError('wire_size', 'Block exceeds 64 KiB');
  try {
    function plain(value: any, depth: number): Json {
      if (depth > WIRE.depth) throw new ProtocolError('wire_depth', 'Block nesting exceeds the profile');
      if (value instanceof BytesWrapper || value instanceof CidLinkWrapper) return value.toJSON() as unknown as Json;
      if (Array.isArray(value)) return value.map(v => plain(v, depth + 1));
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, plain(v, depth + 1)]));
      return value;
    }
    const value = plain(decode(new Uint8Array(raw)), 0);
    if (!sameBytes(raw, encodeBlock(value))) throw new ProtocolError('noncanonical', 'Block has a different canonical encoding');
    return value;
  } catch (error) {
    if (error instanceof ProtocolError) throw error;
    throw new ProtocolError('noncanonical', String((error as Error).message));
  }
}
export async function blockCid(raw: Uint8Array): Promise<string> {
  decodeBlock(raw);
  return toString(await create(CODEC_DCBOR, raw));
}
export async function contentCid(value: unknown): Promise<string> {
  return toString(await create(CODEC_DCBOR, encodeBlock(value)));
}
