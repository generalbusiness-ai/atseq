import * as CAR from '@atcute/car';
import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';
import { decode as decodeVarint } from '@atcute/varint';
import { isCommit } from '@atcute/repo';
import {
  NodeStore,
  NodeWalker,
  MissingBlockError,
  InvalidMstKeyError,
  BlockMismatchError,
  isNodeData,
  assertMstKey,
  type BlockStore,
  type MSTNode,
} from '@atcute/mst';
import { parseDidKey, Secp256k1PublicKey, P256PublicKey, type DidKeyString } from '@atcute/crypto';
import { Point } from '@noble/secp256k1';
import { toBase58Btc } from '@atcute/multibase';
import { assertDependencies } from '../core/dependencies.ts';
import { AtseqError, ProtocolError } from '../core/errors.ts';
import { isCborInputError, sameBytes, validateCborFraming } from './wire.ts';

/** Resource budgets, not a wire contract or an ATproto protocol maximum. */
export const NATIVE_PROOF_LIMITS = Object.freeze({
  carBytes: 32 * 1024 * 1024,
  blockBytes: 1024 * 1024,
  carBlocks: 100_000,
  headerBytes: 16 * 1024,
  nodeEntries: 4096,
  pathLoads: 64,
  treeLoads: 100_000,
  pathCharacters: 1024,
  depth: 64,
});
export const NATIVE_CACHE_BROWSER = Object.freeze({ bytes: 16 * 1024 * 1024, blocks: 50_000 });
export const NATIVE_CACHE_HOST = Object.freeze({ bytes: 128 * 1024 * 1024, blocks: 400_000 });
type ProofLimits = { [K in keyof typeof NATIVE_PROOF_LIMITS]: number };
type CacheLimits = { [K in keyof typeof NATIVE_CACHE_BROWSER]: number };
function fail(message: string): never {
  throw new ProtocolError('input', message);
}
function limit(message: string): never {
  throw new ProtocolError('native_proof_limit', message);
}
/** Structural input failures are permanent; local resource limits are not. */
function rethrowNativeInput(error: unknown): never {
  if (error instanceof AtseqError) {
    if (error instanceof ProtocolError && error.kind === 'invalid_input') fail(error.message);
    throw error;
  }
  if (
    error instanceof InvalidMstKeyError ||
    error instanceof BlockMismatchError ||
    error instanceof CAR.CarBlockMismatchError ||
    isCborInputError(error)
  )
    fail(error.message);
  if (error instanceof Error) {
    const expected: [Function, RegExp][] = [
      [
        RangeError,
        /^(invalid car block; length=\d+|invalid car header; length=0|unexpected end of data|incorrect cid digest type \(got 0x[0-9a-f]+\))$/,
      ],
      [SyntaxError, /^not a valid cid string$/],
      [
        TypeError,
        /^(expected a car v1 archive|malformed MST node; (invalid subtree count|mismatched keys\/values lengths|inconsistent key heights|invalid structure|unexpected key prefix length|suboptimal key prefix length|invalid key sort order)|The encoded data was not valid(?: for encoding utf-8)?\.?)$/,
      ],
      [
        Error,
        /^(indeterminate node height(?:; provide rootHeight if known)?|inconsistent subtree height; got=-?\d+ expected=-?\d+)$/,
      ],
    ];
    if (expected.some(([constructor, pattern]) => error.constructor === constructor && pattern.test(error.message)))
      fail(error.message);
  }
  // Missing blocks are handled by the capability; genuine runtime faults retain
  // their identity instead of becoming a replicated invalid-input verdict.
  throw error;
}
function budget<T extends Record<string, number>>(defaults: T, input: Partial<T> = {}): T {
  if (Object.keys(input).some((key) => !Object.hasOwn(defaults, key))) fail('Unknown native proof budget');
  const result = { ...defaults, ...input };
  for (const value of Object.values(result))
    if (!Number.isSafeInteger(value) || value < 1) fail('Native proof budgets must be positive safe integers');
  return Object.freeze(result);
}
function cborCid(value: string): string {
  if (typeof value !== 'string' || value.length > 128) fail('Expected canonical CBOR CID');
  const parsed = CID.fromString(value);
  if (parsed.codec !== CID.CODEC_DCBOR || CID.toString(parsed) !== value) fail('Expected canonical CBOR CID');
  return value;
}
function nativeFraming(raw: Uint8Array, depth: number): void {
  try {
    validateCborFraming(raw, depth);
  } catch (error) {
    if (error instanceof ProtocolError && error.code === 'wire_depth') limit('Native CBOR depth exceeds budget');
    throw error;
  }
}
function decode(raw: Uint8Array, limits: ProofLimits): unknown {
  if (raw.length > limits.blockBytes) limit('Native block bytes exceed budget');
  nativeFraming(raw, limits.depth);
  const value: unknown = CBOR.decode(raw);
  if (!sameBytes(raw, CBOR.encode(value))) fail('Noncanonical native CBOR block');
  return value;
}
/** Normalizes representation only. This neither observes nor trusts an account binding. */
export async function normalizeRepoSigningKey(input: {
  type: 'secp256k1' | 'p256';
  publicKeyBytes: Uint8Array;
}): Promise<DidKeyString> {
  assertDependencies();
  const { type } = input;
  if (!(input.publicKeyBytes instanceof Uint8Array) || ![33, 65].includes(input.publicKeyBytes.length))
    fail('Invalid repository public key size');
  const raw = new Uint8Array(input.publicKeyBytes);
  if (![33, 65].includes(raw.length) || (raw.length === 33 ? ![2, 3].includes(raw[0]!) : raw[0] !== 4))
    fail('Invalid repository public key encoding');
  if (type === 'secp256k1') {
    const normalized = Point.fromBytes(raw).assertValidity().toBytes(true);
    // atcute's Node export assumes an uncompressed OpenSSL SPKI key even
    // after compressed import. Encode only the validated compressed point.
    return `did:key:z${toBase58Btc(new Uint8Array([0xe7, 0x01, ...normalized]))}`;
  }
  if (type === 'p256') return (await P256PublicKey.importRaw(raw)).exportPublicKey('did');
  return fail('Unsupported repository public key type');
}
async function signingKey(did: string) {
  if (typeof did !== 'string' || did.length > 128) fail('Expected canonical repository signing did:key');
  const parsed = parseDidKey(did as DidKeyString);
  if (parsed.publicKeyBytes.length !== 33) fail('Retained repository keys must be compressed');
  if ((await normalizeRepoSigningKey(parsed)) !== did) fail('Noncanonical repository signing did:key');
  return (parsed.type === 'secp256k1' ? Secp256k1PublicKey : P256PublicKey).importRaw(
    new Uint8Array(parsed.publicKeyBytes),
  );
}
export type NativeLookup =
  | { kind: 'found'; cid: string; bytes: Uint8Array<ArrayBuffer> }
  | { kind: 'absent' }
  | { kind: 'missing'; cid: string };
export type NativeTree = { kind: 'complete'; records: number; nodeLoads: number } | { kind: 'missing'; cid: string };
const brand: unique symbol = Symbol('authenticated native root');
const authenticatedRoots = new WeakSet<object>();
export function assertAuthenticatedRepo(value: unknown): asserts value is AuthenticatedRepo {
  if (!value || typeof value !== 'object' || !authenticatedRoots.has(value))
    fail('Repository capability must be issued by root authentication');
}
export interface AuthenticatedRepo {
  readonly [brand]: true;
  readonly root: string;
  readonly did: string;
  readonly version: 3;
  readonly rev: string;
  readonly data: string;
  readonly signingKey: string;
  /** A sparse result says nothing about canonicality of unvisited branches. */
  lookup(path: string, expectedCid?: string): Promise<NativeLookup>;
  /** Checks every MST node and requires the corresponding record bytes. */
  validateTree(): Promise<NativeTree>;
}
export interface AuthenticateRepoOptions {
  carBytes: Uint8Array;
  expectedDid: string;
  trustedSigningKeyDid: string;
  expectedRoot?: string;
  blocks?: VerifiedRepoBlocks;
  limits?: Partial<ProofLimits>;
}
/** Private copied bytes; eviction produces missing evidence, never proven absence. */
export class VerifiedRepoBlocks {
  #blocks = new Map<string, Uint8Array<ArrayBuffer>>();
  #bytes = 0;
  #limits: CacheLimits;
  constructor(limits: Partial<CacheLimits> = {}) {
    this.#limits = budget<CacheLimits>(NATIVE_CACHE_BROWSER, limits);
  }
  get size() {
    return this.#blocks.size;
  }
  get bytes() {
    return this.#bytes;
  }
  #get(cid: string): Uint8Array<ArrayBuffer> | null {
    const bytes = this.#blocks.get(cid);
    if (bytes) {
      this.#blocks.delete(cid);
      this.#blocks.set(cid, bytes);
    }
    return bytes ?? null;
  }
  #admit(staged: Map<string, Uint8Array<ArrayBuffer>>) {
    const stagedBytes = [...staged.values()].reduce((total, bytes) => total + bytes.length, 0);
    if (stagedBytes > this.#limits.bytes) limit('One CAR exceeds retained cache byte budget');
    if (staged.size > this.#limits.blocks) limit('One CAR exceeds retained cache block budget');
    // No await: failed authentication cannot evict anything; admitted blocks are
    // all verified, and this whole cache transaction completes synchronously.
    for (const [cid, bytes] of staged) {
      const old = this.#blocks.get(cid);
      if (old) {
        this.#bytes -= old.length;
        this.#blocks.delete(cid);
      }
      this.#blocks.set(cid, bytes);
      this.#bytes += bytes.length;
    }
    while (this.#bytes > this.#limits.bytes || this.#blocks.size > this.#limits.blocks) {
      const cid = this.#blocks.keys().next().value!;
      this.#bytes -= this.#blocks.get(cid)!.length;
      this.#blocks.delete(cid);
    }
  }
  async authenticate(options: Omit<AuthenticateRepoOptions, 'blocks'>): Promise<AuthenticatedRepo> {
    assertDependencies();
    try {
      const limits = budget<ProofLimits>(NATIVE_PROOF_LIMITS, options.limits),
        expectedDid = options.expectedDid,
        trustedKey = options.trustedSigningKeyDid;
      const expectedRoot = options.expectedRoot === undefined ? undefined : cborCid(options.expectedRoot);
      if (typeof expectedDid !== 'string' || expectedDid.length > 2048 || !expectedDid.startsWith('did:'))
        fail('Expected repository DID');
      if (!(options.carBytes instanceof Uint8Array)) fail('Expected CAR bytes');
      if (options.carBytes.length > limits.carBytes) limit('CAR bytes exceed budget');
      const raw = new Uint8Array(options.carBytes);
      const header = decodeVarint(raw, 0, 8);
      if (!Number.isSafeInteger(header.value) || header.value < 1 || header.value > raw.length - header.nextOffset)
        fail('Invalid or truncated CAR header');
      if (header.value > limits.headerBytes) limit('CAR header bytes exceed budget');
      nativeFraming(raw.subarray(header.nextOffset, header.nextOffset + header.value), limits.depth);
      const car = CAR.fromUint8Array(raw, { verifyBlocks: false });
      if (car.roots.length !== 1) fail('Native CAR must select exactly one root');
      const root = cborCid(car.roots[0]!.$link);
      if (expectedRoot !== undefined && expectedRoot !== root) fail('Native CAR root differs from expected root');
      const staged = new Map<string, Uint8Array<ArrayBuffer>>();
      let count = 0;
      for (const block of car) {
        if (++count > limits.carBlocks) limit('CAR block count exceeds budget');
        if (block.bytes.length > limits.blockBytes) limit('CAR block bytes exceed budget');
        CAR.verifyBlock(block.cid, block.bytes);
        staged.set(CID.toString(block.cid), new Uint8Array(block.bytes));
      }
      const commitRaw = staged.get(root);
      if (!commitRaw) fail('Selected commit is missing from CAR');
      const commit = decode(commitRaw, limits);
      if (
        !isCommit(commit) ||
        Object.keys(commit).some((key) => !['did', 'version', 'rev', 'data', 'prev', 'sig'].includes(key))
      )
        fail('Invalid native repository commit');
      if (commit.did !== expectedDid) fail('Repository DID differs from trusted binding');
      if (!/^[234567abcdefghij][234567a-z]{12}$/.test(commit.rev)) fail('Invalid native repository revision');
      const data = cborCid(commit.data.$link),
        signature = CBOR.fromBytes(commit.sig);
      if (signature.length !== 64) fail('Native signature must use 64-byte compact encoding');
      const { sig: _sig, ...unsigned } = commit;
      const key = await signingKey(trustedKey);
      if (!(await key.verify(signature, CBOR.encode(unsigned), { allowMalleableSig: false })))
        fail('Invalid native repository signature');
      this.#admit(staged);
      const cache = this;
      const store: BlockStore = {
        get: async (cid) => cache.#get(cborCid(cid)),
        getMany: async (cids) => {
          const found = new Map<string, Uint8Array<ArrayBuffer>>(),
            missing: string[] = [];
          for (const cid of cids) {
            const bytes = cache.#get(cborCid(cid));
            if (bytes) found.set(cid, bytes);
            else missing.push(cid);
          }
          return { found, missing };
        },
        has: async (cid) => cache.#blocks.has(cid),
        put: async () => fail('Native proof store is read-only'),
        putMany: async () => fail('Native proof store is read-only'),
        delete: async () => fail('Native proof store is read-only'),
        deleteMany: async () => fail('Native proof store is read-only'),
      };
      class BoundedNodes extends NodeStore {
        loads = 0;
        constructor(
          readonly maximum: number,
          readonly scope: 'path' | 'tree',
        ) {
          super(store);
        }
        override async get(cid: string | null): Promise<MSTNode> {
          if (++this.loads > this.maximum) limit(`MST ${this.scope} node loads exceed budget`);
          if (cid === null) return super.get(cid);
          const bytes = cache.#get(cborCid(cid));
          if (!bytes) throw new MissingBlockError(cid, 'MST node');
          const value = decode(bytes, limits);
          if (!isNodeData(value)) fail('Invalid MST node');
          if (value.e.length > limits.nodeEntries) limit('MST node entries exceed budget');
          if (value.e.length === 0 && value.l === null && cid !== data)
            fail('Empty MST node is only canonical as the repository data root');
          if (
            Object.keys(value).some((key) => !['l', 'e'].includes(key)) ||
            value.e.some((entry) => Object.keys(entry).some((key) => !['p', 'k', 'v', 't'].includes(key)))
          )
            fail('Unknown canonical MST node field');
          return super.get(cid);
        }
      }
      function ranges(walker: NodeWalker) {
        if (walker.stack.size > limits.pathLoads) limit('MST path depth exceeds budget');
        for (const frame of walker.stack)
          for (const path of frame.node.keys)
            if (path <= frame.lpath || path >= frame.rpath) fail('MST child overlaps its key interval');
      }
      const capability: AuthenticatedRepo = {
        [brand]: true,
        root,
        did: commit.did,
        version: commit.version,
        rev: commit.rev,
        data,
        signingKey: trustedKey,
        async lookup(path, expectedCid) {
          if (typeof path !== 'string') fail('Expected repository path');
          let walker: NodeWalker | undefined;
          try {
            // Protocol syntax/maxima precede stricter local resource policy.
            assertMstKey(path);
            if (path.length > limits.pathCharacters) limit('Repository path characters exceed budget');
            if (expectedCid !== undefined) expectedCid = cborCid(expectedCid);
            walker = await NodeWalker.create(new BoundedNodes(limits.pathLoads, 'path'), data);
            const found = await walker.findRpath(path);
            ranges(walker);
            if (found === null) return { kind: 'absent' };
            const cid = cborCid(found.$link);
            if (expectedCid !== undefined && cid !== expectedCid) fail('Record CID differs from expected record');
            const bytes = cache.#get(cid);
            return bytes ? { kind: 'found', cid, bytes: new Uint8Array(bytes) } : { kind: 'missing', cid };
          } catch (error) {
            // Preserve the observed failure; cleanup must not overwrite it
            // with a second range/depth failure on an incomplete walk.
            if (error instanceof MissingBlockError) return { kind: 'missing', cid: error.cid };
            rethrowNativeInput(error);
          }
        },
        async validateTree() {
          const nodes = new BoundedNodes(limits.treeLoads, 'tree');
          let walker: NodeWalker | undefined,
            records = 0;
          try {
            walker = await NodeWalker.create(nodes, data);
            ranges(walker);
            for await (const [_path, value] of walker.entries()) {
              ranges(walker);
              const cid = cborCid(value.$link);
              if (!cache.#get(cid)) return { kind: 'missing', cid };
              records++;
            }
            return { kind: 'complete', records, nodeLoads: nodes.loads };
          } catch (error) {
            // Preserve the observed failure; cleanup must not overwrite it
            // with a second range/depth failure on an incomplete walk.
            if (error instanceof MissingBlockError) return { kind: 'missing', cid: error.cid };
            rethrowNativeInput(error);
          }
        },
      };
      authenticatedRoots.add(capability);
      return Object.freeze(capability);
    } catch (error) {
      rethrowNativeInput(error);
    }
  }
}
export function authenticateRepo(options: AuthenticateRepoOptions): Promise<AuthenticatedRepo> {
  const blocks = options.blocks ?? new VerifiedRepoBlocks();
  // Invoke the issuing implementation even when a caller supplies a subclass.
  return VerifiedRepoBlocks.prototype.authenticate.call(blocks, options);
}
