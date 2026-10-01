import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import os from 'node:os';
import { gzipSync } from 'node:zlib';
import { fromBytes, type Bytes } from '@atcute/cbor';
import { Lexicons } from '@atproto/lexicon';
import { Folder } from '../src/application/folder.ts';
import { ACTIVATE } from '../src/definition/control.ts';
import { Schemas } from '../src/definition/schemas.ts';
import { SourceBundle, SourcePool, type SourceReader } from '../src/definition/source.ts';
import { acquireWriterLease } from '../src/host/lease.ts';
import { Anchor, headAt, verifyHistory, type Entry, type Genesis, type Head } from '../src/protocol/log.ts';
import { bytes, contentCid } from '../src/protocol/wire.ts';
import { guitarEvolution } from '../testdata/apps/evolution.ts';
import { fixtureApp, fixtureHistory } from '../tests/support/runtime-corpus.ts';
import { observeCrypto } from './performance-observer.ts';
import { observeInterpretation } from './performance-interpretation-observer.ts';

const output = 'experiments/generated/performance-dimensions';
const fixtures = process.env.ATSEQ_DIMENSION_FIXTURE_DIR ?? join(output, 'fixtures');
const sizes = (process.env.ATSEQ_DIMENSION_SIZES ?? '100,1000,10000').split(',').map(Number);
const actors = (process.env.ATSEQ_DIMENSION_ACTORS ?? '1,16').split(',').map(Number);
const deltas = (process.env.ATSEQ_DIMENSION_DELTAS ?? '0,1,100,1000').split(',').map(Number);
const repeats = Number(process.env.ATSEQ_DIMENSION_REPEATS ?? 3);
assert.ok(sizes.length && sizes.every((n) => [100, 1000, 10000].includes(n)));
assert.ok(actors.length && actors.every((n) => [1, 16].includes(n)));
assert.ok(deltas.length && deltas.every((n) => [0, 1, 100, 1000].includes(n)));
assert.ok(Number.isSafeInteger(repeats) && repeats >= 1 && repeats <= 20);
for (const values of [sizes, actors, deltas]) assert.equal(new Set(values).size, values.length);
const hash = (raw: Uint8Array) => createHash('sha256').update(raw).digest('hex');
const text = (value: unknown) => Buffer.from(JSON.stringify(value));
await mkdir(join(output, 'public-inputs'), { recursive: true });
await mkdir(join(output, 'storage'), { recursive: true });

interface Fixture {
  genesis: Genesis;
  genesisCid: string;
  head: Head;
  entries: Entry[];
  source: Bytes;
}

// Check restoration of nested observers, including inherited prototype methods.
function observerDescriptors() {
  return [
    Object.getOwnPropertyDescriptor(globalThis, 'structuredClone'),
    Object.getOwnPropertyDescriptor(Schemas.prototype, 'validate'),
    Object.getOwnPropertyDescriptor(Lexicons.prototype, 'validate'),
    ...(['importKey', 'exportKey', 'verify', 'digest'] as const).map((name) =>
      Object.getOwnPropertyDescriptor(globalThis.crypto.subtle, name),
    ),
  ];
}
async function observed(folder: Folder, run: () => ReturnType<Folder['catchUp']>) {
  const before = observerDescriptors();
  try {
    return await observeCrypto(() => observeInterpretation(folder, run));
  } finally {
    assert.deepEqual(observerDescriptors(), before, 'All nested observation methods must be restored');
  }
}

async function prepareActivation() {
  const path = join(output, 'fixtures', 'activation.json');
  try {
    return JSON.parse((await readFile(path)).toString());
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  const next = await guitarEvolution();
  const app = await fixtureApp(next.old.bundle);
  const candidate = { id: 'one', title: 'Synthetic activation', pricePence: 12300 };
  const log = await fixtureHistory(app, [
    { action: next.old.action, payload: candidate },
    {
      action: ACTIVATE,
      payload: {
        expected: next.old.bundle.root,
        definition: next.bundle.root,
        closure: next.bundle.identities().sort(),
      },
    },
    { action: next.action, payload: { id: 'one' }, definition: next.bundle.root },
  ]);
  const fixture = {
    genesis: app.anchor.genesis,
    genesisCid: app.anchor.cid,
    ...log,
    oldSource: bytes(await next.old.bundle.write()),
    nextSource: bytes(await next.bundle.write()),
    candidate,
  };
  await mkdir(join(output, 'fixtures'), { recursive: true });
  await writeFile(path, text(fixture), { flag: 'wx' });
  return fixture;
}
const activation = await prepareActivation();
if (process.argv.includes('--prepare')) {
  console.log(
    'Prepared separate public activation fixture; no timing run. Existing bounded fixtures were not changed.',
  );
  process.exit(0);
}

const sourcePaths = [
  'scripts/performance-dimensions.ts',
  'scripts/performance-observer.ts',
  'scripts/performance-interpretation-observer.ts',
  'src/application/folder.ts',
  'src/protocol/log.ts',
  'src/definition/activation.ts',
  'src/definition/schemas.ts',
  'src/runtime/evaluator.ts',
  'src/host/lease.ts',
  'package.json',
  'npm-shrinkwrap.json',
];
const results = {
  metadata: {
    version: 1,
    measuredAt: new Date().toISOString(),
    exactHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    trackedWorktreeDirty: !!execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], {
      encoding: 'utf8',
    }).trim(),
    runtime: process.version,
    sourceHashes: Object.fromEntries(
      await Promise.all(sourcePaths.map(async (path) => [path, hash(await readFile(path))])),
    ),
    hardware: {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      cpu: os.cpus()[0]?.model,
      logicalCpus: os.cpus().length,
      totalMemory: os.totalmem(),
    },
    sizes,
    actors,
    deltas,
    repeats,
    limitations: [
      'Retained bounded baseline fixtures; no regenerated actions, signatures or source bytes',
      'Cold reference and warm prefix verification/folding are preparation outside each timed delta scope',
      'Timed baseline Folder.catchUp still receives and verifies the complete prefix, including delta zero',
      'Separate Folder.catchUpVerified run measures interpretation using an already verified full history; its timings are not additive decomposition of Folder.catchUp',
      'Interpretation spans are nested/inclusive and summed crypto durations are not exclusive attribution',
      'Fold region reports only successful ordinary actions; activation/stall observations are not fold attribution',
      'Snapshot clone, JSON serialization, flushed file write and lease-head save are separate kernels, not additive replay stages',
      'Full-projection persistence is optional; the actual ApplicationHost does not supply Folder a persistence callback',
      'SQLite lease storage saves only a bounded head, not interpreted state/outcome history',
      'Boundary heap/RSS are not peak memory; no network/browser transfer measured here',
    ],
  },
  inputs: [] as unknown[],
  captures: [] as unknown[],
  activation: [] as unknown[],
};
async function save() {
  await writeFile(join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n');
}

for (const count of actors)
  for (const size of sizes) {
    const name = `bounded-${count}-${size}`;
    const raw = await readFile(join(fixtures, `${name}.json`));
    const fixture = JSON.parse(raw.toString()) as Fixture;
    assert.equal(fixture.entries.length, size);
    assert.equal(fixture.head.position, size);
    assert.equal(new Set(fixture.entries.map((entry) => entry.signedIntent.intent.actorKey)).size, count);
    const sourceBytes = fromBytes(fixture.source);
    const source = await SourceBundle.read(sourceBytes);
    const anchor = await Anchor.from(fixture.genesis, { app: fixture.genesis.app, genesis: fixture.genesisCid });
    const verified = await verifyHistory(anchor, fixture.head, fixture.entries);
    const cold = await Folder.open(anchor, source);
    const expected = await cold.catchUpVerified(verified);
    assert.equal(expected.stalled, undefined);
    assert.deepEqual(expected.projection.state, { candidates: [], selected: String(size) });
    const compressed = gzipSync(raw);
    await writeFile(join(output, 'public-inputs', `${name}.json.gz`), compressed);
    await writeFile(join(output, 'public-inputs', `${name}.source.car`), sourceBytes);
    results.inputs.push({
      name,
      fixtureSha256: hash(raw),
      sourceCarSha256: hash(sourceBytes),
      sourceCid: source.root,
      historyBytes: raw.length,
      compressedFixtureSha256: hash(compressed),
      sourceCarBytes: sourceBytes.length,
    });
    const lease = acquireWriterLease(join(output, 'storage', name), fixture.genesis.app);
    try {
      for (const delta of deltas) {
        if (delta > size) continue;
        const floor = size - delta;
        const floorHead = headAt(anchor, floor, floor ? await contentCid(fixture.entries[floor - 1]!) : anchor.cid);
        const floorHistory =
          floor === size ? verified : await verifyHistory(anchor, floorHead, fixture.entries.slice(0, floor));
        for (let sample = 0; sample < repeats; sample++) {
          const folder = await Folder.open(anchor, source);
          await folder.catchUpVerified(floorHistory);
          assert.equal(folder.snapshot().projection.frontier.position, floor);
          const memoryBefore = process.memoryUsage();
          const start = performance.now();
          const measured = await observed(folder, () => folder.catchUp(fixture.head, fixture.entries));
          const catchUpMs = performance.now() - start;
          const actual = measured.result.result;
          assert.deepEqual(actual.projection, expected.projection);
          assert.equal(actual.stalled, undefined);
          assert.equal(measured.crypto.verify.calls, 2 * size);
          assert.equal(measured.result.stages.actionValidation.calls, delta);
          assert.equal(measured.result.stages.stateValidation.calls, delta);
          assert.equal(measured.result.stages.foldRegion.calls, delta);
          const interpreter = await Folder.open(anchor, source);
          await interpreter.catchUpVerified(floorHistory);
          const interpretationStart = performance.now();
          const interpretation = await observed(interpreter, () => interpreter.catchUpVerified(verified));
          const verifiedInterpretationMs = performance.now() - interpretationStart;
          assert.deepEqual(interpretation.result.result.projection, expected.projection);
          assert.equal(interpretation.result.result.stalled, undefined);
          assert.equal(interpretation.crypto.verify.calls, 0);
          assert.equal(interpretation.result.stages.actionValidation.calls, delta);
          assert.equal(interpretation.result.stages.stateValidation.calls, delta);
          assert.equal(interpretation.result.stages.foldRegion.calls, delta);
          const kernels: Record<string, number> = {};
          async function kernel<T>(key: string, operation: () => T | Promise<T>) {
            const started = performance.now();
            const value = await operation();
            kernels[key] = performance.now() - started;
            return value;
          }
          const snapshot = await kernel('folderSnapshotCopyMs', () => folder.snapshot());
          const owned = await kernel('optionalOwnedProjectionCloneMs', () => structuredClone(snapshot.projection));
          const serialized = await kernel('optionalProjectionJsonMs', () => JSON.stringify(owned));
          await kernel('optionalProjectionFileWriteFlushMs', () =>
            writeFile(join(output, 'storage', `${name}.projection.json`), serialized, { flush: true }),
          );
          // Set the retained floor outside the kernel. Delta zero rewrites the
          // same head; other deltas measure one real head-value change.
          lease.saveHead(floorHead);
          await kernel('actualLeaseHeadSaveMs', () => lease.saveHead(fixture.head));
          assert.deepEqual(lease.readHead(), fixture.head);
          assert.deepEqual(
            JSON.parse(await readFile(join(output, 'storage', `${name}.projection.json`), 'utf8')),
            expected.projection,
          );
          const capture = {
            name,
            size,
            actors: count,
            delta,
            floor,
            sample,
            catchUpMs,
            crypto: measured.crypto,
            interpretationStages: measured.result.stages,
            verifiedInterpretationMs,
            verifiedInterpretationCrypto: interpretation.crypto,
            verifiedInterpretationStages: interpretation.result.stages,
            kernels,
            projectionJsonBytes: Buffer.byteLength(serialized),
            leaseHeadJsonBytes: Buffer.byteLength(JSON.stringify(fixture.head)),
            memoryBefore,
            memoryAfter: process.memoryUsage(),
            correctness:
              'complete state, outcomes, definition and frontier equal cold replay; no stall; copies/storage agree',
          };
          results.captures.push(capture);
          console.log(JSON.stringify(capture));
          await save();
        }
      }
    } finally {
      lease.close();
    }
  }

// Separate signed public fixture: it does not extend or replace the retained bounded inputs.
const activationRaw = await readFile(join(output, 'fixtures', 'activation.json'));
const oldBytes = fromBytes(activation.oldSource),
  nextBytes = fromBytes(activation.nextSource);
await writeFile(join(output, 'public-inputs', 'activation.json'), activationRaw);
await writeFile(join(output, 'public-inputs', 'activation-old.car'), oldBytes);
await writeFile(join(output, 'public-inputs', 'activation-next.car'), nextBytes);
results.inputs.push({
  name: 'activation',
  fixtureSha256: hash(activationRaw),
  oldSourceSha256: hash(oldBytes),
  nextSourceSha256: hash(nextBytes),
});
const old = await SourceBundle.read(oldBytes),
  next = await SourceBundle.read(nextBytes);
const pool = new SourcePool();
await pool.add(old);
await pool.add(next);
const anchor = await Anchor.from(activation.genesis, { app: activation.genesis.app, genesis: activation.genesisCid });
const healthy = await Folder.open(anchor, pool);
const reference = await healthy.catchUp(activation.head, activation.entries);
assert.equal(reference.stalled, undefined);
assert.equal(reference.projection.definition, next.root);
for (const mode of ['unavailable', 'corrupt'] as const) {
  let broken = true;
  const reader: SourceReader = {
    get: async (cid) => {
      if (cid === next.root && broken) {
        if (mode === 'unavailable') throw new Error('Synthetic unavailable source');
        return new Uint8Array([0]);
      }
      return pool.get(cid);
    },
  };
  const folder = await Folder.open(anchor, reader);
  const before = await observed(folder, () => folder.catchUp(activation.head, activation.entries));
  assert.equal(before.result.result.stalled?.position, 2);
  assert.equal(before.result.result.stalled?.code, mode === 'unavailable' ? 'content_unavailable' : 'content_corrupt');
  assert.equal(before.result.result.projection.frontier.position, 1);
  assert.equal(before.result.result.projection.definition, old.root);
  assert.equal(before.result.result.projection.outcomes.length, 1);
  broken = false;
  const resumed = await observed(folder, () => folder.catchUp(activation.head, activation.entries));
  assert.equal(resumed.result.result.stalled, undefined);
  assert.deepEqual(resumed.result.result.projection, reference.projection);
  results.activation.push({
    mode,
    stalled: before.result.result.stalled,
    frontierBefore: before.result.result.projection.frontier,
    cryptoBefore: before.crypto,
    cryptoResumed: resumed.crypto,
    stagesBefore: before.result.stages,
    stagesResumed: resumed.result.stages,
    correctness: 'same exact entries/source restored; resumed complete projection equals healthy replay',
    limitation:
      'stage observations on activation/stall paths are inclusive calls, not ordinary-fold timing attribution',
  });
  await save();
}
await save();
