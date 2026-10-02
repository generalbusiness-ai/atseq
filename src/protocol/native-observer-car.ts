/** Owned proof bytes; header roots in exact-block responses supply no authority. */
import * as CAR from '@atcute/car';
import * as CID from '@atcute/cid';
import { decode as decodeVarint, encodingLength } from '@atcute/varint';
import { AtseqError, ProtocolError } from '../core/errors.ts';
import { isCborInputError, validateCborFraming } from './wire.ts';
import {
  NATIVE_PROOF_LIMITS,
  NATIVE_CACHE_BROWSER,
  VerifiedRepoBlocks,
  type AuthenticatedRepo,
} from './native-proof.ts';

function invalid(message: string): never {
  throw new ProtocolError('input', message);
}
function limited(message: string): never {
  throw new ProtocolError('native_proof_limit', message);
}
function unavailable(message: string): never {
  throw new AtseqError('content_unavailable', message);
}
function rethrow(error: unknown): never {
  if (error instanceof AtseqError) throw error;
  if (error instanceof CAR.CarBlockMismatchError || isCborInputError(error)) invalid('Invalid observation CAR');
  if (
    error instanceof Error &&
    ((error.constructor === RangeError &&
      /^(invalid car block; length=\d+|invalid car header; length=0|unexpected end of data|incorrect cid (version|codec|digest type|digest size) \(got .+\))$/.test(
        error.message,
      )) ||
      (error.constructor === TypeError && error.message === 'expected a car v1 archive'))
  )
    invalid('Invalid observation CAR');
  throw error;
}
// Capture intrinsics once. Caller properties cannot understate the input budget or
// dispatch custom copying code. This owns DATA only, before parser classification.
const OwnedBytes = Uint8Array,
  typedArrayPrototype = Object.getPrototypeOf(OwnedBytes.prototype),
  byteKind = Object.getOwnPropertyDescriptor(typedArrayPrototype, Symbol.toStringTag)!.get!,
  byteLength = Object.getOwnPropertyDescriptor(typedArrayPrototype, 'length')!.get!,
  copyBytes = OwnedBytes.prototype.set;
function ownBytes(raw: Uint8Array, maximum: number, expected: string, budget: string) {
  if (Reflect.apply(byteKind, raw, []) !== 'Uint8Array' || !(raw instanceof OwnedBytes)) invalid(expected);
  const length: number = Reflect.apply(byteLength, raw, []);
  if (length > maximum) limited(budget);
  const owned = new OwnedBytes(length);
  Reflect.apply(copyBytes, owned, [raw]);
  return owned;
}
function read(raw: Uint8Array, maximumBlocks: number) {
  const owned = ownBytes(
    raw,
    NATIVE_PROOF_LIMITS.carBytes,
    'Expected observation CAR bytes',
    'Observation CAR exceeds input budget',
  );
  try {
    const header = decodeVarint(owned, 0, 8);
    if (!Number.isSafeInteger(header.value) || header.value < 1 || header.value > owned.length - header.nextOffset)
      invalid('Invalid observation CAR header');
    if (header.value > NATIVE_PROOF_LIMITS.headerBytes) limited('Observation CAR header exceeds budget');
    try {
      validateCborFraming(
        owned.subarray(header.nextOffset, header.nextOffset + header.value),
        NATIVE_PROOF_LIMITS.depth,
      );
    } catch (error) {
      if (error instanceof ProtocolError && error.code === 'wire_depth')
        limited('Observation CAR header depth exceeds budget');
      throw error;
    }
    const car = CAR.fromUint8Array(owned, { verifyBlocks: false });
    const blocks = new Map<string, Uint8Array<ArrayBuffer>>();
    let count = 0;
    for (const block of car) {
      if (++count > maximumBlocks) limited('Observation CAR returned block count exceeds budget');
      if (block.bytes.length > NATIVE_PROOF_LIMITS.blockBytes) limited('Observation CAR block exceeds budget');
      CAR.verifyBlock(block.cid, block.bytes);
      blocks.set(CID.toString(block.cid), new Uint8Array(block.bytes));
    }
    return { roots: car.roots.map((root) => root.$link), blocks };
  } catch (error) {
    rethrow(error);
  }
}

function portableBudget(blocks: Map<string, Uint8Array>) {
  if (blocks.size > NATIVE_CACHE_BROWSER.blocks) limited('Observation unique block count exceeds portable budget');
  let bytes = 0;
  for (const raw of blocks.values()) bytes += raw.length;
  if (bytes > NATIVE_CACHE_BROWSER.bytes) limited('Observation unique bytes exceed portable budget');
}
function selected(raw: Uint8Array) {
  const parsed = read(raw, NATIVE_PROOF_LIMITS.carBlocks);
  if (parsed.roots.length !== 1) invalid('Selected observation CAR must contain one root');
  const root = parsed.roots[0]!;
  if (!parsed.blocks.has(root)) invalid('Selected observation commit is missing');
  portableBudget(parsed.blocks);
  return { root, blocks: parsed.blocks };
}
function exactBlocks(raw: Uint8Array, requested: readonly string[]) {
  if (!requested.length || requested.length > 64 || new Set(requested).size !== requested.length)
    invalid('Expected one unique bounded block request');
  const parsed = read(raw, 64); // Roots are bounded syntax only; never choose authority.
  const expected = new Set(requested);
  for (const cid of parsed.blocks.keys())
    if (!expected.has(cid)) invalid('Observation block response contains unrequested CID');
  for (const cid of expected)
    if (!parsed.blocks.has(cid)) unavailable('Observation block response omits requested CID');
  return parsed.blocks;
}
function canonicalCid(value: string, cbor = false) {
  if (typeof value !== 'string' || !/^b[a-z2-7]{57}[aeimquy4]$/.test(value))
    invalid('Expected canonical observation CID');
  try {
    const cid = CID.fromString(value);
    if (CID.toString(cid) !== value || (cbor && cid.codec !== CID.CODEC_DCBOR))
      invalid('Expected canonical CBOR observation CID');
    return cid;
  } catch (error) {
    rethrow(error);
  }
}
/** Owned selected-commit DATA only; P1 still authenticates its DID, key and signed root. */
export function selectNativeObservationCommit(raw: Uint8Array): { root: string; bytes: Uint8Array<ArrayBuffer> } {
  const parsed = selected(raw);
  return { root: parsed.root, bytes: new Uint8Array(parsed.blocks.get(parsed.root)!) };
}
/** Serialize only the owned selected commit and a fully checked exact response, never retained cache contents. */
export async function exactAdmissionCar(
  raw: Uint8Array,
  requested: readonly string[],
  selectedCommit: { root: string; bytes: Uint8Array },
): Promise<Uint8Array<ArrayBuffer>> {
  if (!Array.isArray(requested)) invalid('Expected one unique bounded block request');
  const count = requested.length,
    captured: string[] = [];
  if (!Number.isSafeInteger(count) || count < 1 || count > 64) invalid('Expected one unique bounded block request');
  for (let i = 0; i < count; i++) {
    const cid = requested[i]!;
    canonicalCid(cid, true);
    captured.push(cid);
  }
  if (!selectedCommit || typeof selectedCommit !== 'object') invalid('Expected selected observation commit DATA');
  const root = selectedCommit.root,
    cid = canonicalCid(root),
    source = selectedCommit.bytes;
  const commit = ownBytes(
    source,
    NATIVE_PROOF_LIMITS.blockBytes,
    'Expected selected observation commit bytes',
    'Observation CAR block exceeds budget',
  );
  try {
    CAR.verifyBlock(cid, commit);
  } catch (error) {
    rethrow(error);
  }
  const blocks = exactBlocks(raw, captured);
  blocks.set(root, commit);
  const entries = [...blocks]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([cid, data]) => ({ cid: CID.fromString(cid).bytes, data }));
  // Everything above is owned before the first await. The maintained writer's
  // first yield is its small header; no framed entry or final output is allocated yet.
  const writer = CAR.writeCarStream([{ $link: root }], entries);
  try {
    const header = await writer.next();
    if (header.done) throw new Error('Native CAR writer omitted its header');
    let size = header.value.length;
    for (const entry of entries) {
      const length = entry.cid.length + entry.data.length;
      size += encodingLength(length) + length;
      if (size > NATIVE_CACHE_BROWSER.bytes) limited('Composed observation CAR exceeds portable byte budget');
    }
    const output = new Uint8Array(size);
    output.set(header.value);
    let offset = header.value.length;
    for await (const part of writer) {
      output.set(part, offset);
      offset += part.length;
    }
    if (offset !== size) throw new Error('Native CAR writer size differs from its framing');
    return output;
  } finally {
    await writer.return(undefined);
  }
}

/** No signing key or authenticated-root brand is minted by this byte owner. */
export class NativeObserverCar {
  #blocks: Map<string, Uint8Array<ArrayBuffer>>;
  readonly root: string;
  constructor(raw: Uint8Array) {
    const parsed = selected(raw);
    this.root = parsed.root;
    this.#blocks = parsed.blocks;
  }
  addExact(raw: Uint8Array, requested: readonly string[]): void {
    const parsed = exactBlocks(raw, requested);
    const next = new Map(this.#blocks);
    for (const [cid, bytes] of parsed) next.set(cid, bytes);
    portableBudget(next);
    this.#blocks = next;
  }
  async bytes(): Promise<Uint8Array<ArrayBuffer>> {
    const parts: Uint8Array[] = [];
    let size = 0;
    const entries = [...this.#blocks]
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([cid, bytes]) => ({ cid: CID.fromString(cid).bytes, data: bytes }));
    for await (const part of CAR.writeCarStream([{ $link: this.root }], entries)) {
      size += part.length;
      if (size > NATIVE_CACHE_BROWSER.bytes) limited('Composed observation CAR exceeds portable byte budget');
      parts.push(part);
    }
    const result = new Uint8Array(size);
    let offset = 0;
    for (const part of parts) {
      result.set(part, offset);
      offset += part.length;
    }
    return result;
  }
  async authenticate(principal: string, signingKeyDid: string): Promise<AuthenticatedRepo> {
    return new VerifiedRepoBlocks().authenticate({
      carBytes: await this.bytes(),
      expectedDid: principal,
      trustedSigningKeyDid: signingKeyDid,
      expectedRoot: this.root,
    });
  }
}
