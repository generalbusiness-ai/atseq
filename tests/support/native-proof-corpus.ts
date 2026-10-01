import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';
import { writeCarStream, fromUint8Array as readCar } from '@atcute/car';
import {
  NodeStore,
  NodeWalker,
  MissingBlockError,
  NodeWrangler,
  MemoryBlockStore,
  getKeyHeight,
  findRpathAndBuildProof,
} from '@atcute/mst';
import { P256PrivateKeyExportable, Secp256k1PrivateKeyExportable, type PrivateKeyExportable } from '@atcute/crypto';
import { Point } from '@noble/secp256k1';
import { toBase58Btc } from '@atcute/multibase';
import {
  authenticateRepo,
  VerifiedRepoBlocks,
  normalizeRepoSigningKey,
  assertAuthenticatedRepo,
  type AuthenticateRepoOptions,
} from '../../src/protocol/native-proof.ts';
import { decodeBlock } from '../../src/protocol/wire.ts';
import { ProtocolError } from '../../src/core/errors.ts';

const DID = 'did:plc:aaaaaaaaaaaaaaaaaaaaaaaa';
const COLLECTION = 'ai.generalbusiness.atseq.probe';
const path = (n: number) => `${COLLECTION}/${String(n).padStart(8, '0')}`;
function check(value: unknown, message: string): asserts value {
  if (!value) throw Error(message);
}
async function rejects(run: () => unknown | Promise<unknown>, name: string, input = false) {
  let threw = false;
  try {
    await run();
  } catch (error) {
    threw = true;
    if (input)
      check(
        error instanceof ProtocolError && error.code === 'input' && error.kind === 'invalid_input',
        `${name} did not produce ProtocolError(input): ${String(error)}`,
      );
  }
  check(threw, `${name} accepted`);
}
const rejectsInput = (run: () => unknown | Promise<unknown>, name: string) => rejects(run, name, true);
async function rejectsLimit(run: () => unknown | Promise<unknown>, name: string) {
  let caught: unknown;
  try {
    await run();
  } catch (error) {
    caught = error;
  }
  check(
    caught instanceof ProtocolError && caught.code === 'native_proof_limit' && caught.kind === 'transient',
    `${name} did not produce transient native_proof_limit: ${String(caught)}`,
  );
}
export async function car(
  root: string,
  blocks: Map<string, Uint8Array>,
  roots: string[] = [root],
): Promise<Uint8Array<ArrayBuffer>> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of writeCarStream(
    roots.map((root) => ({ $link: root })),
    [...blocks].map(([cid, data]) => ({ cid: CID.fromString(cid).bytes, data })),
  ))
    chunks.push(chunk);
  const output = new Uint8Array(chunks.reduce((size, bytes) => size + bytes.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}
async function commit(key: PrivateKeyExportable, data: string, blocks: Map<string, Uint8Array>, sig?: Uint8Array) {
  const unsigned = { did: DID, version: 3, rev: '2222222222222', data: { $link: data }, prev: null };
  const raw = CBOR.encode({ ...unsigned, sig: CBOR.toBytes(sig ?? (await key.sign(CBOR.encode(unsigned)))) });
  const root = CID.toString(CID.createSync(CID.CODEC_DCBOR, raw));
  blocks.set(root, raw);
  return root;
}
export async function nativeFixture(type: 'p256' | 'secp256k1' = 'p256', tag = '') {
  const key = await (type === 'p256' ? P256PrivateKeyExportable : Secp256k1PrivateKeyExportable).createKeypair();
  const store = new MemoryBlockStore(),
    ns = new NodeStore(store),
    writer = new NodeWrangler(ns);
  let data: string | null = null;
  for (let n = 1; n <= 40; n++) {
    const raw = CBOR.encode({ $type: COLLECTION, n, tag }),
      cid = CID.toCidLink(CID.createSync(CID.CODEC_DCBOR, raw));
    await store.put(cid.$link, raw);
    data = await writer.putRecord(data, path(n), cid);
  }
  check(data, 'fixture tree missing');
  const blocks = new Map(store.blocks),
    root = await commit(key, data, blocks);
  const options: AuthenticateRepoOptions = {
    carBytes: await car(root, blocks),
    expectedDid: DID,
    trustedSigningKeyDid: await key.exportPublicKey('did'),
    expectedRoot: root,
  };
  return { key, root, data, blocks, options, ns };
}
export async function nativeProofCorpus() {
  const results: string[] = [];
  const passed = (name: string) => results.push(name);
  const fixture = await nativeFixture(),
    { options, root, data, blocks, key, ns } = fixture;
  const cache = new VerifiedRepoBlocks();
  const verified = await authenticateRepo({ ...options, blocks: cache });
  assertAuthenticatedRepo(verified);
  check(
    verified.root === root &&
      verified.did === DID &&
      verified.data === data &&
      verified.rev === '2222222222222' &&
      verified.version === 3,
    'authenticated fields differ',
  );
  const found = await verified.lookup(path(1));
  check(found.kind === 'found', 'record missing');
  check((decodeBlock(found.bytes) as Record<string, unknown>).n === 1, 'record bytes differ');
  check((await verified.lookup(path(99))).kind === 'absent', 'absence not proved');
  check((await verified.validateTree()).kind === 'complete', 'full tree incomplete');
  passed('root fields, raw membership, absence and whole-tree checks');
  await rejectsInput(() => assertAuthenticatedRepo({ ...verified }), 'copied capability');
  await rejectsInput(() => assertAuthenticatedRepo({}), 'forged capability');
  passed('non-forgeable capability');
  for (const [name, change] of [
    ['wrong DID', { expectedDid: 'did:plc:bbbbbbbbbbbbbbbbbbbbbbbb' }],
    [
      'wrong key',
      { trustedSigningKeyDid: await (await P256PrivateKeyExportable.createKeypair()).exportPublicKey('did') },
    ],
    ['wrong root', { expectedRoot: found.cid }],
    ['truncated CAR', { carBytes: options.carBytes.slice(0, -1) }],
  ] as const) {
    await rejectsInput(() => authenticateRepo({ ...options, ...change }), name);
    passed(name);
  }
  for (const [name, limits] of [
    ['CAR byte budget', { carBytes: 10 }],
    ['block count budget', { carBlocks: 1 }],
    ['block byte budget', { blockBytes: 10 }],
    ['header budget', { headerBytes: 10 }],
    ['native header depth budget', { depth: 1 }],
  ] as const) {
    await rejectsLimit(() => authenticateRepo({ ...options, limits }), name);
    check(
      (await (await authenticateRepo(options)).validateTree()).kind === 'complete',
      'raised budget did not recover',
    );
    passed(`${name}: resource limit and sufficient-budget recovery`);
  }
  await rejectsInput(
    () => authenticateRepo({ ...options, carBytes: 'not bytes' as unknown as Uint8Array }),
    'CAR type',
  );
  await rejectsInput(
    () => authenticateRepo({ ...options, carBytes: new Uint8Array([64, 0xf6]), limits: { headerBytes: 1 } }),
    'truncated oversized header',
  );
  await rejectsInput(() => authenticateRepo({ ...options, carBytes: new Uint8Array([0]) }), 'zero header');
  passed('CAR type and truncated/zero header are input before local header policy');
  for (const value of [0, -1, 0.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1]) {
    await rejectsInput(() => authenticateRepo({ ...options, limits: { carBytes: value } }), 'invalid proof budget');
    await rejectsInput(() => new VerifiedRepoBlocks({ bytes: value }), 'invalid cache budget');
  }
  await rejectsInput(
    () => authenticateRepo({ ...options, limits: { unknown: 1 } as AuthenticateRepoOptions['limits'] }),
    'unknown proof budget',
  );
  await rejectsInput(
    () => new VerifiedRepoBlocks({ unknown: 1 } as unknown as { bytes: number }),
    'unknown cache budget',
  );
  passed('unknown and nonpositive/fractional/nonfinite/unsafe bounds remain caller input errors');
  const damaged = new Uint8Array(options.carBytes);
  damaged[damaged.length - 1]! ^= 1;
  await rejectsInput(() => authenticateRepo({ ...options, carBytes: damaged }), 'corrupt block');
  passed('corrupt block');
  await rejectsInput(() => verified.lookup(path(1), root), 'wrong record CID');
  passed('wrong record CID');
  await rejectsInput(() => verified.lookup('bad/path/extra'), 'invalid path');
  await rejectsInput(() => verified.lookup('a/' + 'x'.repeat(1023)), '1025-character protocol-invalid path');
  const shortPath = await authenticateRepo({ ...options, limits: { pathCharacters: 1 } });
  await rejectsInput(() => shortPath.lookup('bad/path/extra'), 'invalid path before stricter character budget');
  await rejectsInput(() => shortPath.lookup(1 as unknown as string), 'path type before budget');
  await rejectsLimit(() => shortPath.lookup(path(1)), 'protocol-valid path exceeds stricter character budget');
  check((await verified.lookup(path(1))).kind === 'found', 'sufficient character policy did not recover');
  passed('path protocol syntax/1024 maximum precede stricter local character policy');
  const bounded = await authenticateRepo({ ...options, limits: { pathLoads: 1, treeLoads: 1 } });
  await rejectsLimit(() => bounded.lookup(path(1)), 'path node budget');
  await rejectsLimit(() => bounded.validateTree(), 'whole-tree node budget');
  const depthBounded = await authenticateRepo({ ...options, limits: { pathLoads: 1 } });
  await rejectsLimit(() => depthBounded.validateTree(), 'full-tree walker path-depth budget');
  check((await verified.validateTree()).kind === 'complete', 'sufficient traversal policy did not recover');
  passed('path node, full-tree node and walker-depth budgets are resource limits');
  const limitedEntries = await authenticateRepo({ ...options, limits: { nodeEntries: 1 } });
  await rejectsLimit(() => limitedEntries.lookup(path(1)), 'lookup node-entry budget');
  await rejectsLimit(() => limitedEntries.validateTree(), 'full-tree node-entry budget');
  check((await verified.validateTree()).kind === 'complete', 'sufficient node policy did not recover');
  passed('node-entry policy yields resource limit and sufficient-budget recovery');
  const commitOnly = await car(root, new Map([[root, blocks.get(root)!]]));
  const shallow = await authenticateRepo({ ...options, blocks: cache, carBytes: commitOnly, limits: { depth: 2 } });
  await rejectsLimit(() => shallow.lookup(path(1)), 'native node framing depth');
  passed('native cached-node depth is local policy distinct from Atseq wire depth');
  check(
    blocks.get(data)!.length > blocks.get(root)!.length,
    'root node must exceed commit bytes for cached block control',
  );
  const smallBlock = await authenticateRepo({
    ...options,
    blocks: cache,
    carBytes: commitOnly,
    limits: { blockBytes: blocks.get(root)!.length },
  });
  await rejectsLimit(() => smallBlock.lookup(path(1)), 'cached native block byte budget');
  passed('cached native block bytes obey resource policy');
  const mutableOptions = { ...options, carBytes: new Uint8Array(options.carBytes) },
    mutable = await authenticateRepo(mutableOptions);
  mutableOptions.carBytes.fill(0);
  mutableOptions.expectedDid = 'wrong';
  found.bytes.fill(0);
  const again = await mutable.lookup(path(1));
  check(
    again.kind === 'found' && (decodeBlock(again.bytes) as Record<string, unknown>).n === 1,
    'caller mutation changed evidence',
  );
  passed('caller CAR, options and returned-byte mutation isolation');
  const [recordCid, proofNodes] = await findRpathAndBuildProof(ns, data, path(1));
  check(recordCid, 'proof record missing');
  const sparse = new Map([...blocks].filter(([cid]) => cid === root || cid === recordCid.$link || proofNodes.has(cid)));
  const sparseRoot = await authenticateRepo({ ...options, carBytes: await car(root, sparse) });
  check((await sparseRoot.lookup(path(1))).kind === 'found', 'sparse membership missing');
  let missingPath: string | undefined;
  for (let n = 2; n <= 40; n++)
    if ((await sparseRoot.lookup(path(n))).kind === 'missing') {
      missingPath = path(n);
      break;
    }
  check(missingPath, 'sparse proof unexpectedly complete');
  passed('sparse missing evidence distinct from absence');
  sparse.delete(recordCid.$link);
  const missingRecord = await authenticateRepo({ ...options, carBytes: await car(root, sparse) });
  check((await missingRecord.lookup(path(1))).kind === 'missing', 'missing record misclassified');
  passed('missing record bytes');
  const recoveryCache = new VerifiedRepoBlocks(),
    partial = await authenticateRepo({ ...options, carBytes: await car(root, sparse), blocks: recoveryCache });
  check((await partial.lookup(path(1))).kind === 'missing', 'partial unexpectedly complete');
  await authenticateRepo({ ...options, blocks: recoveryCache });
  check((await partial.lookup(path(1))).kind === 'found', 'full export did not recover');
  passed('full-export cache recovery');
  const cacheBudget = new VerifiedRepoBlocks({ bytes: options.carBytes.length, blocks: blocks.size });
  const before = await authenticateRepo({ ...options, blocks: cacheBudget }),
    size = cacheBudget.size,
    bytes = cacheBudget.bytes;
  await rejects(
    () => authenticateRepo({ ...options, expectedDid: 'wrong', blocks: cacheBudget }),
    'failed cache authentication',
  );
  check(
    cacheBudget.size === size && cacheBudget.bytes === bytes && (await before.lookup(path(1))).kind === 'found',
    'failed auth evicted prior blocks',
  );
  passed('failed admission preserves prior evidence');
  await rejectsLimit(
    () => authenticateRepo({ ...options, blocks: new VerifiedRepoBlocks({ bytes: 1 }) }),
    'single-CAR cache budget',
  );
  await rejectsLimit(
    () => authenticateRepo({ ...options, blocks: new VerifiedRepoBlocks({ blocks: 1 }) }),
    'single-CAR cache block budget',
  );
  passed('single-CAR cache byte/count budgets are resource limits');
  const other = await nativeFixture('p256', 'eviction'),
    small = new VerifiedRepoBlocks({
      bytes: Math.max(options.carBytes.length, other.options.carBytes.length),
      blocks: Math.max(blocks.size, other.blocks.size),
    });
  const old = await authenticateRepo({ ...options, blocks: small });
  await authenticateRepo({ ...other.options, blocks: small });
  check((await old.lookup(path(1))).kind === 'missing', 'eviction must yield missing');
  passed('LRU eviction yields missing evidence');
  const optional = await authenticateRepo({ ...options, expectedRoot: undefined });
  check(optional.root === root, 'optional selected root differs');
  passed('optional expected root');
  const multipleCar = await car(root, blocks, [root, root]);
  await rejects(() => authenticateRepo({ ...options, carBytes: multipleCar }), 'multiple CAR roots');
  const emptyCar = await car(root, blocks, []);
  await rejects(() => authenticateRepo({ ...options, carBytes: emptyCar }), 'empty CAR roots');
  passed('exactly one selected CAR root');
  const oversizedFixture = await nativeFixture('p256', 'x'.repeat(2000));
  await rejectsLimit(
    () => authenticateRepo({ ...oversizedFixture.options, blocks: cacheBudget }),
    'oversized cache admission',
  );
  check(
    cacheBudget.size === size && cacheBudget.bytes === bytes && (await before.lookup(path(1))).kind === 'found',
    'oversized admission evicted prior evidence',
  );
  passed('oversized authenticated admission is atomic');

  for (const type of ['p256', 'secp256k1'] as const) {
    const f = await nativeFixture(type),
      curveKey = f.key,
      raw = await curveKey.exportPublicKey('raw');
    let uncompressed: Uint8Array;
    if (type === 'secp256k1') uncompressed = Point.fromBytes(raw).toBytes(false);
    else {
      const jwk = await curveKey.exportPublicKey('jwk'),
        imported = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, true, ['verify']);
      uncompressed = new Uint8Array(await crypto.subtle.exportKey('raw', imported));
    }
    check(
      (await normalizeRepoSigningKey({ type, publicKeyBytes: raw })) === (await curveKey.exportPublicKey('did')),
      'compressed key normalization differs',
    );
    check(
      (await normalizeRepoSigningKey({ type, publicKeyBytes: uncompressed })) ===
        (await curveKey.exportPublicKey('did')),
      'legacy key normalization differs',
    );
    const uncompressedDid = `did:key:z${toBase58Btc(new Uint8Array([...(type === 'secp256k1' ? [0xe7, 0x01] : [0x80, 0x24]), ...uncompressed]))}`;
    await rejects(
      () => authenticateRepo({ ...f.options, trustedSigningKeyDid: uncompressedDid }),
      'uncompressed retained did:key',
    );
    await rejects(() => normalizeRepoSigningKey({ type, publicKeyBytes: new Uint8Array(65).fill(4) }), 'off-curve key');
    await rejects(() => normalizeRepoSigningKey({ type, publicKeyBytes: new Uint8Array(34) }), 'noncanonical key');
    check((await (await authenticateRepo(f.options)).lookup(path(1))).kind === 'found', 'curve commit rejected');
    const commitValue = CBOR.decode(f.blocks.get(f.root)!),
      original = CBOR.fromBytes(commitValue.sig),
      s = BigInt(
        '0x' +
          Array.from(original.slice(32))
            .map((v) => v.toString(16).padStart(2, '0'))
            .join(''),
      );
    const order =
      type === 'secp256k1'
        ? 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n
        : 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n;
    const high = new Uint8Array(original),
      hex = (order - s).toString(16).padStart(64, '0');
    for (let n = 0; n < 32; n++) high[32 + n] = parseInt(hex.slice(n * 2, n * 2 + 2), 16);
    const altered = new Map(f.blocks),
      highRoot = await commit(curveKey, f.data, altered, high);
    const highCar = await car(highRoot, altered);
    await rejects(
      () => authenticateRepo({ ...f.options, expectedRoot: highRoot, carBytes: highCar }),
      'high-S signature',
    );
    const shortRoot = await commit(curveKey, f.data, altered, original.slice(0, 63));
    const shortCar = await car(shortRoot, altered);
    await rejects(
      () => authenticateRepo({ ...f.options, expectedRoot: shortRoot, carBytes: shortCar }),
      'noncompact signature',
    );
    passed(`${type} legacy/compressed/off-curve keys and compact low-S signatures`);
  }
  // Signed hostile trees use real record CIDs and intentionally malformed node placement.
  const heights = new Map<number, string[]>();
  for (let n = 1; n <= 500; n++) {
    const p = path(n),
      h = await getKeyHeight(p);
    const names = heights.get(h) ?? [];
    names.push(p);
    heights.set(h, names);
  }
  const entry = (key: string, previous = '') => {
    let p = 0;
    while (previous[p] === key[p] && p < previous.length) p++;
    return { p, k: CBOR.toBytes(new TextEncoder().encode(key.slice(p))), v: { $link: recordCid.$link }, t: null };
  };
  const node = (e: unknown[], l: string | null = null) => {
    const raw = CBOR.encode({ l: l ? { $link: l } : null, e }),
      cid = CID.toString(CID.createSync(CID.CODEC_DCBOR, raw));
    return { raw, cid };
  };
  const hostile = async (n: { raw: Uint8Array; cid: string }, extra: Map<string, Uint8Array> = new Map()) => {
    const b = new Map([[recordCid.$link, blocks.get(recordCid.$link)!], ...extra, [n.cid, n.raw]]),
      r = await commit(key, n.cid, b);
    return authenticateRepo({ ...options, expectedRoot: r, carBytes: await car(r, b) });
  };
  const zero = heights.get(0)!,
    one = heights.get(1)!;
  const wrongLayer = await hostile(
    node([
      entry(zero[0]!),
      entry(
        one.find((p) => p > zero[0]!)!,
        zero[0]!,
      ),
    ]),
  );
  await rejectsInput(() => wrongLayer.lookup(zero[0]!), 'wrong-layer node');
  await rejectsInput(() => wrongLayer.validateTree(), 'wrong-layer full tree');
  passed('wrong-layer signed MST node');
  const a = zero[0]!,
    b = zero[1]!,
    unordered = await hostile(node([entry(b), entry(a, b)]));
  await rejectsInput(() => unordered.lookup(a), 'unordered keys');
  await rejectsInput(() => unordered.validateTree(), 'unordered full tree');
  passed('unordered signed MST keys');
  const parent = one.find((p) => p > zero[0]!)!,
    child = node([entry(one.find((p) => p < parent)!)]),
    badChild = await hostile(node([entry(parent)], child.cid), new Map([[child.cid, child.raw]]));
  await rejectsInput(() => badChild.lookup(zero[0]!), 'child wrong height');
  await rejectsInput(() => badChild.validateTree(), 'child-height full tree');
  passed('wrong child layer');
  const overlap = node([entry(zero.find((p) => p > parent)!)]),
    overlapRoot = await hostile(node([entry(parent)], overlap.cid), new Map([[overlap.cid, overlap.raw]]));
  await rejectsInput(() => overlapRoot.lookup(zero[0]!), 'overlap path');
  await rejectsInput(() => overlapRoot.validateTree(), 'overlap full tree');
  passed('overlapping child interval');
  const extraRaw = CBOR.encode({ ...CBOR.decode(blocks.get(data)!), unexpected: true }),
    extraCid = CID.toString(CID.createSync(CID.CODEC_DCBOR, extraRaw));
  const unknown = await hostile({ raw: extraRaw, cid: extraCid }, blocks);
  await rejectsInput(() => unknown.lookup(path(1)), 'unknown node field');
  await rejectsInput(() => unknown.validateTree(), 'unknown full-tree field');
  passed('canonical MST fields');

  const invalidNodeRaw = CBOR.encode({ l: null, e: 'not an entry array' });
  const invalidNodeBlocks = new Map([[recordCid.$link, blocks.get(recordCid.$link)!]]);
  const invalidNodeCid = CID.toString(CID.createSync(CID.CODEC_DCBOR, invalidNodeRaw));
  invalidNodeBlocks.set(invalidNodeCid, invalidNodeRaw);
  const invalidNodeRoot = await commit(key, invalidNodeCid, invalidNodeBlocks);
  const invalidNode = await authenticateRepo({
    ...options,
    expectedRoot: invalidNodeRoot,
    carBytes: await car(invalidNodeRoot, invalidNodeBlocks),
    limits: { nodeEntries: 1 },
  });
  await rejectsInput(() => invalidNode.lookup(path(1)), 'wrong node shape before entry budget');
  await rejectsInput(() => invalidNode.validateTree(), 'wrong full-tree node shape before entry budget');
  passed('invalid node shape precedes local node-entry policy');
  const empty = node([]),
    emptyRoot = await hostile(empty);
  check((await emptyRoot.lookup(path(1))).kind === 'absent', 'canonical empty root did not prove absence');
  const emptyTree = await emptyRoot.validateTree();
  check(emptyTree.kind === 'complete' && emptyTree.records === 0, 'canonical empty root rejected');
  passed('canonical empty repository root');
  for (const [name, parentKey] of [
    ['height-one', parent],
    ['leaf', zero[1]!],
  ] as const) {
    const emptyChild = await hostile(node([entry(parentKey)], empty.cid), new Map([[empty.cid, empty.raw]]));
    await rejectsInput(() => emptyChild.lookup(zero[0]!), `${name} empty-child lookup`);
    await rejectsInput(() => emptyChild.validateTree(), `${name} empty-child full tree`);
    passed(`${name} signed empty non-root MST node`);
  }
  const leaf = node([entry(zero[0]!)]),
    untrimmed = await hostile(node([], leaf.cid), new Map([[leaf.cid, leaf.raw]]));
  await rejectsInput(() => untrimmed.lookup(zero[0]!), 'untrimmed root lookup');
  await rejectsInput(() => untrimmed.validateTree(), 'untrimmed root full tree');
  passed('untrimmed keyless root is invalid input');
  const noncanonicalRaw = new Uint8Array([0xa2, 0x61, 0x6c, 0xf6, 0x61, 0x65, 0x80]),
    noncanonical = await hostile({
      raw: noncanonicalRaw,
      cid: CID.toString(CID.createSync(CID.CODEC_DCBOR, noncanonicalRaw)),
    });
  await rejectsInput(() => noncanonical.lookup(zero[0]!), 'noncanonical node lookup');
  await rejectsInput(() => noncanonical.validateTree(), 'noncanonical full tree');
  passed('noncanonical signed MST CBOR is invalid input');
  const malformedEntry = { ...entry(zero[0]!), p: -1 },
    malformed = await hostile(node([malformedEntry]));
  await rejectsInput(() => malformed.lookup(zero[0]!), 'malformed prefix lookup');
  await rejectsInput(() => malformed.validateTree(), 'malformed prefix full tree');
  passed('maintained MST deserialization errors are invalid input');
  const malformedCommit = new Uint8Array([0xa2, 0x61, 0x62, 0xf6, 0x61, 0x61, 0xf6]),
    malformedCommitCid = CID.toString(CID.createSync(CID.CODEC_DCBOR, malformedCommit));
  await rejectsInput(
    async () =>
      authenticateRepo({
        ...options,
        expectedRoot: malformedCommitCid,
        carBytes: await car(malformedCommitCid, new Map([[malformedCommitCid, malformedCommit]])),
      }),
    'noncanonical commit CBOR',
  );
  passed('noncanonical commit CBOR is invalid input');
  // An incomplete walk used to run ranges() in its catch path, which could
  // replace the observed failure with a second depth-budget error.
  const createBeforeCleanupProbe = NodeWalker.create;
  try {
    for (const primary of [
      new Error('primary walker runtime failure'),
      new ProtocolError('native_proof_limit', 'primary node-load resource limit'),
      new ProtocolError('input', 'primary malformed node'),
      new MissingBlockError(data, 'MST node'),
    ]) {
      NodeWalker.create = async (...args) => {
        const walker = await createBeforeCleanupProbe(...args);
        let failed = false;
        const originalSize = walker.stack.size;
        Object.defineProperty(walker.stack, 'size', { get: () => (failed ? 65 : originalSize) });
        walker.findRpath = async () => {
          failed = true;
          throw primary;
        };
        walker.entries = async function* () {
          failed = true;
          throw primary;
        };
        return walker;
      };
      for (const run of [() => verified.lookup(path(1)), () => verified.validateTree()]) {
        let caught: unknown;
        try {
          const result = await run();
          check(
            primary instanceof MissingBlockError && result.kind === 'missing' && result.cid === data,
            'cleanup changed missing evidence',
          );
        } catch (error) {
          caught = error;
        }
        if (primary instanceof MissingBlockError) check(caught === undefined, 'cleanup replaced missing evidence');
        else if (primary instanceof ProtocolError && primary.code === 'input')
          check(
            caught instanceof ProtocolError && caught.code === 'input' && caught.message === primary.message,
            'cleanup replaced observed malformed input',
          );
        else check(caught === primary, 'cleanup replaced the original runtime/resource error');
      }
    }
  } finally {
    NodeWalker.create = createBeforeCleanupProbe;
  }
  passed('lookup/tree preserve observed runtime/resource/input/missing failures instead of cleanup depth error');
  const originalCreate = NodeWalker.create,
    sentinel = new Error('unexpected walker runtime failure');
  try {
    NodeWalker.create = async () => {
      throw sentinel;
    };
    for (const operation of [() => verified.lookup(path(1)), () => verified.validateTree()]) {
      let caught: unknown;
      try {
        await operation();
      } catch (error) {
        caught = error;
      }
      check(caught === sentinel, 'genuine runtime fault changed classification');
    }
  } finally {
    NodeWalker.create = originalCreate;
  }
  passed('genuine walker runtime faults retain identity');

  const deepRaw = new Uint8Array([...Array(80).fill(0x81), 0xf6]),
    deepCid = CID.toString(CID.createSync(CID.CODEC_DCBOR, deepRaw));
  const deepCar = await car(deepCid, new Map([[deepCid, deepRaw]]));
  await rejectsLimit(
    () => authenticateRepo({ ...options, expectedRoot: deepCid, carBytes: deepCar }),
    'deep native framing',
  );
  await rejectsInput(
    () => authenticateRepo({ ...options, expectedRoot: deepCid, carBytes: deepCar, limits: { depth: 81 } }),
    'deep non-commit within raised native depth policy',
  );
  passed('native depth limit does not claim validity; raised policy detects malformed commit');
  const largeRecord = CBOR.encode({ $type: COLLECTION, pad: 'x'.repeat(70 * 1024) }),
    largeCid = CID.toCidLink(CID.createSync(CID.CODEC_DCBOR, largeRecord));
  const largeStore = new MemoryBlockStore();
  await largeStore.put(largeCid.$link, largeRecord);
  const largeTree = await new NodeWrangler(new NodeStore(largeStore)).putRecord(null, path(1), largeCid),
    largeBlocks = new Map(largeStore.blocks);
  const largeRoot = await commit(key, largeTree, largeBlocks),
    largeRepo = await authenticateRepo({
      ...options,
      expectedRoot: largeRoot,
      carBytes: await car(largeRoot, largeBlocks),
    });
  const largeFound = await largeRepo.lookup(path(1));
  check(largeFound.kind === 'found', 'general native record missing');
  await rejects(() => decodeBlock(largeFound.bytes), 'Atseq64KiBrecordgate');
  passed('native membership cannot bypass strict Atseq record limits');

  check(readCar(options.carBytes).roots.length === 1, 'fixtureCARrootwrong');
  return results;
}
