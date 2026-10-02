import * as CAR from '@atcute/car';
import * as CID from '@atcute/cid';
import { NodeStore, NodeWalker, MemoryBlockStore, findRpathAndBuildProof } from '@atcute/mst';
import { P256PublicKey, Secp256k1PublicKey } from '@atcute/crypto';
import {
  authenticateRepo,
  extractNativeRepoPaths,
  VerifiedRepoBlocks,
  NATIVE_CACHE_HOST,
  type AuthenticatedRepo,
} from '../../src/protocol/native-proof.ts';
import * as supported from '../../src/protocol/index.ts';
import { ProtocolError } from '../../src/core/errors.ts';
import { car, nativeFixture } from './native-proof-corpus.ts';
import {
  extractionPath as path,
  extractionBlocks,
  extractionOptions,
  type ExtractionFixture,
} from './native-proof-extraction-fixture.ts';

function check(value: unknown, message: string): asserts value {
  if (!value) throw Error(message);
}
async function refusal(run: () => unknown | Promise<unknown>, code: string) {
  let caught: unknown;
  try {
    await run();
  } catch (error) {
    caught = error;
  }
  check(caught instanceof ProtocolError && caught.code === code, `Expected ${code}, got ${String(caught)}`);
  return caught.message;
}
async function identity(run: () => unknown | Promise<unknown>, expected: unknown) {
  let caught: unknown;
  try {
    await run();
  } catch (error) {
    caught = error;
  }
  check(caught === expected, 'Error identity changed');
}
function parsed(raw: Uint8Array) {
  const reader = CAR.fromUint8Array(raw),
    rows = [...reader];
  return { root: reader.roots.map((root) => root.$link), rows, names: rows.map((row) => CID.toString(row.cid)) };
}
function equalBytes(a: Uint8Array, b: Uint8Array) {
  return a.length === b.length && a.every((n, i) => n === b[i]);
}
export async function nativeProofExtractionCorpus(packet: {
  fixtures: Record<string, ExtractionFixture>;
  hostilePath: string;
  hostileRootPath: string;
  receiptPaths: string[];
}) {
  const cases: { id: string; name: string }[] = [],
    metrics: Record<string, unknown>[] = [];
  const pass = (id: string, name: string) => cases.push({ id, name });
  const f = packet.fixtures.p256!,
    options = await extractionOptions(f),
    cache = new VerifiedRepoBlocks(),
    repo = await authenticateRepo({ ...options, blocks: cache });
  check(!Object.hasOwn(supported, 'extractNativeRepoPaths'), 'Internal extractor leaked through supported barrel');
  check(
    Object.isFrozen(repo) &&
      Object.keys(repo).sort().join() === 'data,did,lookup,rev,root,signingKey,validateTree,version',
    'Supported capability shape changed',
  );
  for (const forged of [{ ...repo }, {}, Object.create(Object.getPrototypeOf(repo)), JSON.parse(JSON.stringify(repo))])
    await refusal(() => extractNativeRepoPaths(forged as AuthenticatedRepo, []), 'input');
  let callbackCalls = 0;
  await (repo.lookup as (...args: unknown[]) => Promise<unknown>)(path(1), undefined, () => callbackCalls++);
  check(callbackCalls === 0, 'Public lookup exposed private collector');
  pass('PX1', 'Genuine issuer and unchanged supported shape; clone/DATA/prototype and caller collector refused');

  for (const type of ['p256', 'secp256k1']) {
    const o = await extractionOptions(packet.fixtures[type]!),
      original = await authenticateRepo(o);
    const raw = await extractNativeRepoPaths(original, [{ path: path(1) }, { path: path(40) }, { path: path(99) }]);
    const offline = await authenticateRepo({ ...o, carBytes: raw, blocks: new VerifiedRepoBlocks() });
    for (const target of [path(1), path(40), path(99)]) {
      const a = await original.lookup(target),
        b = await offline.lookup(target);
      check(a.kind === b.kind, 'Offline path verdict differs');
      if (a.kind === 'found')
        check(b.kind === 'found' && a.cid === b.cid && equalBytes(a.bytes, b.bytes), 'Offline record differs');
    }
  }
  pass('PX2', 'Fresh offline P256/secp256k1 membership/raw bytes and absence');
  const rows = [{ path: path(1) }, { path: path(40) }, { path: path(99) }, { path: path(1) }];
  const raw = await extractNativeRepoPaths(repo, rows),
    p = parsed(raw);
  check(
    p.root.length === 1 && p.root[0] === repo.root && p.names.includes(repo.root),
    'Original selected commit/root omitted',
  );
  check(
    new Set(p.names).size === p.names.length && p.names.join() === [...p.names].sort().join(),
    'CAR order/dedup differs',
  );
  check(equalBytes(raw, await extractNativeRepoPaths(repo, rows)), 'Repeated output not deterministic');
  pass('PX3', 'Original root, exact commit, canonical lexical CID dedup and deterministic output');

  const beforeGet = NodeStore.prototype.get,
    encountered = new Set<string>();
  NodeStore.prototype.get = async function (cid) {
    if (cid !== null) encountered.add(cid);
    return beforeGet.call(this, cid);
  };
  let traced: Uint8Array;
  try {
    traced = await extractNativeRepoPaths(repo, rows);
  } finally {
    NodeStore.prototype.get = beforeGet;
  }
  const expected = new Set([repo.root, ...encountered]);
  const memory = new MemoryBlockStore();
  for (const [cid, bytes] of extractionBlocks(f)) await memory.put(cid, bytes);
  for (const row of rows) {
    const [record, final] = await findRpathAndBuildProof(new NodeStore(memory), f.data, row.path);
    for (const cid of final) check(encountered.has(cid), 'Maintained final-stack proof missing from actual encounters');
    if (record) expected.add(record.$link);
  }
  const observed = parsed(traced!);
  check(
    [...expected].sort().join() === observed.names.join(),
    'CAR does not equal all encountered checked nodes plus records/commit',
  );
  for (const block of observed.rows)
    check(
      equalBytes(block.bytes, extractionBlocks(f).get(CID.toString(block.cid))!),
      'Captured bytes differ from genuine fixture',
    );
  pass('PX4', 'Real found/absence all-encountered closure; pinned1.1.1 has no natural retreat');
  const sparse = await authenticateRepo({
    ...options,
    carBytes: await extractNativeRepoPaths(repo, [{ path: path(1) }]),
  });
  const tree = await sparse.validateTree();
  check(tree.kind === 'missing', 'Sparse extraction silently established complete tree');
  const unseenOptions = await extractionOptions(packet.fixtures.intervalMissing!),
    unseen = await authenticateRepo(unseenOptions);
  const unseenCar = await extractNativeRepoPaths(unseen, [{ path: packet.hostileRootPath }]);
  check(
    (await (await authenticateRepo({ ...unseenOptions, carBytes: unseenCar })).lookup(packet.hostileRootPath)).kind ===
      'found',
    'Unvisited hostile branch blocked genuine selected-root record',
  );
  await refusal(() => extractNativeRepoPaths(unseen, [{ path: packet.hostilePath }]), 'input');
  pass('PX5', 'Sparse evidence creates no complete-tree claim; original hostile corpus remains required');

  const mutable = [{ path: path(1) }],
    pending = extractNativeRepoPaths(repo, mutable);
  mutable[0]!.path = path(40);
  mutable.push({ path: path(99) });
  const owned = await pending,
    ownedOffline = await authenticateRepo({ ...options, carBytes: owned });
  check((await ownedOffline.lookup(path(1))).kind === 'found', 'Request mutation retargeted extraction');
  const repeated = await extractNativeRepoPaths(repo, [{ path: path(1) }]);
  owned.fill(0);
  check(
    equalBytes(repeated, await extractNativeRepoPaths(repo, [{ path: path(1) }])),
    'Returned CAR mutation changed cache',
  );
  pass('PX6', 'Request and output-byte ownership across first await');

  const small = new VerifiedRepoBlocks({ bytes: 100000, blocks: 2 }),
    empty = packet.fixtures.empty!,
    emptyOptions = await extractionOptions(empty);
  const old = await authenticateRepo({ ...emptyOptions, blocks: small });
  check((await old.lookup(path(1))).kind === 'absent', 'Empty positive failed');
  const replacement = new Map([[f.options.expectedRoot, extractionBlocks(f).get(f.options.expectedRoot)!]]);
  await authenticateRepo({ ...options, carBytes: await car(f.options.expectedRoot, replacement), blocks: small });
  check((await old.lookup(path(1))).kind === 'absent', 'Surviving cached root-node unexpectedly missing');
  await refusal(() => extractNativeRepoPaths(old, []), 'content_unavailable');
  pass('PX7', 'Evicted selected commit is unavailable while online absence survives');
  const missingBlocks = extractionBlocks(f),
    record = await repo.lookup(path(1));
  check(record.kind === 'found', 'Record positive failed');
  missingBlocks.delete(record.cid);
  const missing = await authenticateRepo({ ...options, carBytes: await car(repo.root, missingBlocks) });
  await refusal(() => extractNativeRepoPaths(missing, [{ path: path(40) }, { path: path(1) }]), 'content_unavailable');
  const commitOnly = await authenticateRepo({
    ...options,
    carBytes: await car(repo.root, new Map([[repo.root, missingBlocks.get(repo.root)!]])),
  });
  await refusal(() => extractNativeRepoPaths(commitOnly, [{ path: path(1) }]), 'content_unavailable');
  const oneProof = parsed(await extractNativeRepoPaths(repo, [{ path: path(1) }])),
    evicting = new VerifiedRepoBlocks({ bytes: 100000, blocks: oneProof.rows.length });
  const successful = await authenticateRepo({
    ...options,
    blocks: evicting,
    carBytes: await car(repo.root, new Map(oneProof.rows.map((row) => [CID.toString(row.cid), row.bytes]))),
  });
  check((await successful.lookup(path(1))).kind === 'found', 'Eviction positive missing');
  await authenticateRepo({
    ...options,
    blocks: evicting,
    carBytes: await car(
      repo.root,
      new Map(
        oneProof.rows
          .filter((row) => CID.toString(row.cid) !== record.cid)
          .map((row) => [CID.toString(row.cid), row.bytes]),
      ),
    ),
  });
  await authenticateRepo({
    ...emptyOptions,
    blocks: evicting,
    carBytes: await car(
      emptyOptions.expectedRoot,
      new Map([[emptyOptions.expectedRoot, extractionBlocks(empty).get(emptyOptions.expectedRoot)!]]),
    ),
  });
  check((await successful.lookup(path(1))).kind === 'missing', 'Actual post-success record eviction not observed');
  await refusal(() => extractNativeRepoPaths(successful, [{ path: path(1) }]), 'content_unavailable');
  pass('PX8', 'Missing record/node withholds complete output after earlier successful requested path');

  for (const requests of [
    [{ path: 'bad/path/extra' }],
    [{ path: path(1), expectedCid: 'bad' }],
    [{ path: path(1), extra: true }],
    [{ path: 1 }],
    [null],
    [{ path: path(1), expectedCid: repo.root }],
  ])
    await refusal(
      () => extractNativeRepoPaths(repo, requests as Parameters<typeof extractNativeRepoPaths>[1]),
      'input',
    );
  await refusal(() => extractNativeRepoPaths(repo, [], {} as AbortSignal), 'input');
  await refusal(() => extractNativeRepoPaths(repo, [], Object.create(AbortSignal.prototype)), 'input');
  const short = await authenticateRepo({ ...options, limits: { pathCharacters: 1 } });
  await refusal(() => extractNativeRepoPaths(short, [{ path: 'bad/path/extra' }]), 'input');
  await refusal(() => extractNativeRepoPaths(short, [{ path: path(1) }]), 'native_proof_limit');
  pass('PX9', 'Closed rows, canonical expected CID, mismatch, signal and syntax-before-local-character policy');

  const two = await authenticateRepo({ ...emptyOptions, limits: { carBlocks: 2 } });
  check(
    parsed(await extractNativeRepoPaths(two, [{ path: path(1) }, { path: path(1) }])).rows.length === 2,
    'Exact duplicate-row cap failed',
  );
  await refusal(
    () => extractNativeRepoPaths(two, [{ path: path(1) }, { path: path(1) }, { path: path(1) }]),
    'native_proof_limit',
  );
  check(
    parsed(await extractNativeRepoPaths(repo, [])).rows.length === 1,
    'Zero-row diagnostic omitted commit or added claim',
  );
  const aborted = new AbortController(),
    reason = new Error('request-byte-boundary probe');
  aborted.abort(reason);
  function byteRequests(bytes: number) {
    const count = Math.ceil((bytes - 1) / 1034),
      lengths = Array(count).fill(1024) as number[];
    lengths[count - 1] = bytes - 1 - count * 10 - (count - 1) * 1024;
    if (lengths[count - 1]! < 3) {
      const difference = 3 - lengths[count - 1]!;
      lengths[count - 2]! -= difference;
      lengths[count - 1] = 3;
    }
    const result = lengths.map((length) => ({ path: 'a/' + 'x'.repeat(length - 2) }));
    check(
      new TextEncoder().encode(JSON.stringify(result.map((row) => [row.path, null]))).length === bytes,
      'Input accounting fixture differs',
    );
    return result;
  }
  await identity(() => extractNativeRepoPaths(repo, byteRequests(16 * 1024 * 1024), aborted.signal), reason);
  await refusal(
    () => extractNativeRepoPaths(repo, byteRequests(16 * 1024 * 1024 + 1), aborted.signal),
    'native_proof_limit',
  );
  const growth = [{ path: path(1) }];
  Object.defineProperty(growth[0], 'path', {
    get() {
      growth.push({ path: path(99) });
      return path(1);
    },
  });
  growth[Symbol.iterator] = () => {
    throw Error('Caller iterator must not run');
  };
  check(
    parsed(await extractNativeRepoPaths(repo, growth)).names.join() ===
      parsed(await extractNativeRepoPaths(repo, [{ path: path(1) }])).names.join(),
    'Caller iterator/growth changed captured count',
  );
  pass(
    'PX10',
    'Duplicate row count before dedup; zero diagnostic; exact16MiB request tuple framing and one-byte refusal',
  );

  const exact = await extractNativeRepoPaths(repo, [{ path: path(1) }]);
  const strict = await authenticateRepo({
    ...options,
    blocks: cache,
    carBytes: await car(repo.root, new Map([[repo.root, extractionBlocks(f).get(repo.root)!]])),
    limits: { carBytes: exact.length },
  });
  check(
    (await extractNativeRepoPaths(strict, [{ path: path(1) }])).length === exact.length,
    'Exact framed output cap failed',
  );
  const tooShort = await authenticateRepo({
    ...options,
    blocks: cache,
    carBytes: await car(repo.root, new Map([[repo.root, extractionBlocks(f).get(repo.root)!]])),
    limits: { carBytes: exact.length - 1 },
  });
  await refusal(() => extractNativeRepoPaths(tooShort, [{ path: path(1) }]), 'native_proof_limit');
  pass('PX11', 'Actual CAR header/CID/varint bytes at exact issuer cap and one-byte refusal');

  const interval = await extractionOptions(packet.fixtures.intervalMissing!),
    validMissing = await extractionOptions(packet.fixtures.validMissing!);
  const intervalCache = new VerifiedRepoBlocks(),
    fullInterval = await authenticateRepo({ ...interval, blocks: intervalCache });
  const shallowInterval = await authenticateRepo({
    ...interval,
    blocks: intervalCache,
    carBytes: await car(
      fullInterval.root,
      new Map([[fullInterval.root, extractionBlocks(packet.fixtures.intervalMissing!).get(fullInterval.root)!]]),
    ),
    limits: { carBlocks: 1 },
  });
  await refusal(() => extractNativeRepoPaths(shallowInterval, [{ path: packet.hostilePath }]), 'input');
  const constrained = await authenticateRepo({
    ...options,
    blocks: cache,
    carBytes: await car(repo.root, new Map([[repo.root, extractionBlocks(f).get(repo.root)!]])),
    limits: { carBlocks: 1 },
  });
  let walks = 0;
  const originalCreate = NodeWalker.create;
  NodeWalker.create = async (...args) => {
    walks++;
    return originalCreate(...args);
  };
  try {
    await refusal(() => extractNativeRepoPaths(constrained, [{ path: path(1) }]), 'native_proof_limit');
  } finally {
    NodeWalker.create = originalCreate;
  }
  check(walks === 1, 'Overflow started another path or skipped current walk');
  pass('PX12', 'Collector overflow preserves actual hostile interval cleanup and valid-path resource refusal');
  const validCache = new VerifiedRepoBlocks(),
    valid = await authenticateRepo({ ...validMissing, blocks: validCache });
  const overflowingMissing = await authenticateRepo({
    ...validMissing,
    blocks: validCache,
    carBytes: await car(
      valid.root,
      new Map([[valid.root, extractionBlocks(packet.fixtures.validMissing!).get(valid.root)!]]),
    ),
    limits: { carBlocks: 1 },
  });
  await refusal(
    () => extractNativeRepoPaths(overflowingMissing, [{ path: packet.hostilePath }]),
    'content_unavailable',
  );
  pass('PX13', 'Real missing descendant remains unavailable despite prior collector overflow');

  const controller = new AbortController(),
    cancelReason = new Error('cancel at bounded local unit');
  NodeWalker.create = async (...args) => {
    const walker = await originalCreate(...args);
    controller.abort(cancelReason);
    return walker;
  };
  try {
    await identity(
      () => extractNativeRepoPaths(repo, [{ path: path(1) }, { path: path(40) }], controller.signal),
      cancelReason,
    );
  } finally {
    NodeWalker.create = originalCreate;
  }
  const sentinel = new Error('genuine unexpected walker failure');
  NodeWalker.create = async () => {
    throw sentinel;
  };
  try {
    await identity(() => extractNativeRepoPaths(repo, [{ path: path(1) }]), sentinel);
  } finally {
    NodeWalker.create = originalCreate;
  }
  const writing = new AbortController(),
    writingReason = new Error('cancel between maintained writer chunks'),
    throwIfAborted = AbortSignal.prototype.throwIfAborted;
  let activeCalls = 0;
  AbortSignal.prototype.throwIfAborted = function () {
    if (++activeCalls === 6) writing.abort(writingReason);
    return throwIfAborted.call(this);
  };
  try {
    await identity(() => extractNativeRepoPaths(repo, [{ path: path(1) }], writing.signal), writingReason);
  } finally {
    AbortSignal.prototype.throwIfAborted = throwIfAborted;
  }
  check(activeCalls === 6, 'Writer cancellation probe did not reach chunk boundary');
  pass('PX14', 'Cancellation withholds output and foreign walker error retains exact identity');

  const refill = new VerifiedRepoBlocks(),
    partial = await authenticateRepo({
      ...options,
      blocks: refill,
      carBytes: await car(repo.root, new Map([[repo.root, extractionBlocks(f).get(repo.root)!]])),
    });
  await refusal(() => extractNativeRepoPaths(partial, [{ path: path(1) }]), 'content_unavailable');
  await authenticateRepo({ ...options, blocks: refill });
  check(
    (
      await (
        await authenticateRepo({ ...options, carBytes: await extractNativeRepoPaths(partial, [{ path: path(1) }]) })
      ).lookup(path(1))
    ).kind === 'found',
    'Original capability did not see same-cache fill',
  );
  pass('PX15', 'Original genuine capability identity retained across verified same-cache fill');
  check(
    (
      await (
        await authenticateRepo({
          ...options,
          carBytes: await extractNativeRepoPaths(repo, [{ path: path(1) }, { path: path(40) }]),
        })
      ).validateTree()
    ).kind === 'missing',
    'Requested proof inflated into complete replay claim',
  );
  const appOptions = await extractionOptions(packet.fixtures.application!),
    appRepo = await authenticateRepo(appOptions);
  const appProof = await extractNativeRepoPaths(
      appRepo,
      packet.receiptPaths.map((path) => ({ path })),
    ),
    offlineApp = await authenticateRepo({ ...appOptions, carBytes: appProof });
  for (const target of packet.receiptPaths) {
    const a = await appRepo.lookup(target),
      b = await offlineApp.lookup(target);
    check(
      a.kind === 'found' && b.kind === 'found' && a.cid === b.cid && equalBytes(a.bytes, b.bytes),
      'Genuine genesis/head/entry receipt path failed offline',
    );
  }
  pass(
    'PX16',
    'Genuine signed genesis/head/entry receipt paths offline; participant/source/full receipt closure remains unavailable',
  );

  const previousP256 = P256PublicKey.prototype.verify,
    previousSecp = Secp256k1PublicKey.prototype.verify;
  let signatures = 0,
    nodeLoads = 0;
  P256PublicKey.prototype.verify = async function (...args) {
    signatures++;
    return previousP256.apply(this, args);
  };
  Secp256k1PublicKey.prototype.verify = async function (...args) {
    signatures++;
    return previousSecp.apply(this, args);
  };
  NodeStore.prototype.get = async function (cid) {
    nodeLoads++;
    return beforeGet.call(this, cid);
  };
  const started = performance.now();
  let measured: Uint8Array;
  try {
    measured = await extractNativeRepoPaths(repo, rows);
  } finally {
    NodeStore.prototype.get = beforeGet;
    P256PublicKey.prototype.verify = previousP256;
    Secp256k1PublicKey.prototype.verify = previousSecp;
  }
  metrics.push({
    name: 'four-request warm extraction',
    requestRows: rows.length,
    nodeStoreGets: nodeLoads,
    signatureVerifications: signatures,
    carBytes: measured!.length,
    uniqueBlocks: parsed(measured!).rows.length,
    elapsedMs: performance.now() - started,
    hashes: null,
    keyNormalization: null,
    peakHeap: null,
    collectorCopiedBlockBytes: parsed(measured!).rows.reduce((n, row) => n + row.bytes.length, 0),
  });
  pass('PX18', 'Actual maintained node loads/signatures/output bytes/time; uninstrumented work remains null');

  const large = await nativeFixture('p256', 'x'.repeat(700000)),
    host = await authenticateRepo({ ...large.options, blocks: new VerifiedRepoBlocks(NATIVE_CACHE_HOST) });
  const within = await extractNativeRepoPaths(
    host,
    Array.from({ length: 23 }, (_, n) => ({ path: path(n + 1) })),
  );
  check(within.length <= 16 * 1024 * 1024, 'Portable positive exceeded bound');
  await refusal(
    () =>
      extractNativeRepoPaths(
        host,
        Array.from({ length: 24 }, (_, n) => ({ path: path(n + 1) })),
      ),
    'native_proof_limit',
  );
  metrics.push({
    name: 'portable host-cache bound',
    cacheBudgetBytes: NATIVE_CACHE_HOST.bytes,
    passedRequestRows: 23,
    refusedRequestRows: 24,
    passedFramedCarBytes: within.length,
    portableCapBytes: 16 * 1024 * 1024,
  });
  return {
    cases,
    metrics,
    executedPX: cases.map((row) => row.id).sort(),
    PX17: 'caller must record actual source/emitted/runtime/browser gates',
    naturalRetreat: false,
    claimScopesNotEstablished: [
      'complete application replay',
      'participant/source/receipt closure',
      'current identity',
      'P4 asserted-origin upgrade',
      'observer registry/cursor',
      'real PDS',
      'durable restart/restore',
    ],
  };
}
