/** Owned proof bytes; header roots in exact-block responses supply no authority. */
import * as CAR from '@atcute/car';
import * as CID from '@atcute/cid';
import { decode as decodeVarint } from '@atcute/varint';
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
function read(raw: Uint8Array, maximumBlocks: number) {
  try {
    if (!(raw instanceof Uint8Array)) invalid('Expected observation CAR bytes');
    if (raw.length > NATIVE_PROOF_LIMITS.carBytes) limited('Observation CAR exceeds input budget');
    const owned = new Uint8Array(raw);
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

/** No signing key or authenticated-root brand is minted by this byte owner. */
export class NativeObserverCar {
  #blocks: Map<string, Uint8Array<ArrayBuffer>>;
  readonly root: string;
  constructor(raw: Uint8Array) {
    const parsed = read(raw, NATIVE_PROOF_LIMITS.carBlocks);
    if (parsed.roots.length !== 1) invalid('Selected observation CAR must contain one root');
    this.root = parsed.roots[0]!;
    if (!parsed.blocks.has(this.root)) invalid('Selected observation commit is missing');
    this.#blocks = parsed.blocks;
    this.#budget(this.#blocks);
  }
  #budget(blocks: Map<string, Uint8Array>) {
    if (blocks.size > NATIVE_CACHE_BROWSER.blocks) limited('Observation unique block count exceeds portable budget');
    let bytes = 0;
    for (const raw of blocks.values()) bytes += raw.length;
    if (bytes > NATIVE_CACHE_BROWSER.bytes) limited('Observation unique bytes exceed portable budget');
  }
  addExact(raw: Uint8Array, requested: readonly string[]): void {
    if (!requested.length || requested.length > 64 || new Set(requested).size !== requested.length)
      invalid('Expected one unique bounded block request');
    const parsed = read(raw, 64); // Roots are bounded syntax only; never choose authority.
    const expected = new Set(requested);
    for (const cid of parsed.blocks.keys())
      if (!expected.has(cid)) invalid('Observation block response contains unrequested CID');
    for (const cid of expected)
      if (!parsed.blocks.has(cid)) unavailable('Observation block response omits requested CID');
    const next = new Map(this.#blocks);
    for (const [cid, bytes] of parsed.blocks) next.set(cid, bytes);
    this.#budget(next);
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
