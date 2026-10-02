import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { gunzipSync, gzipSync } from 'node:zlib';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
const [mode, fixturePath, directory, r1RootArg] = process.argv.slice(2);
if (!r1RootArg || !['source', 'compiled'].includes(mode))
  throw Error('Usage: node-run.mjs source|compiled FIXTURE OUTPUT_DIRECTORY EXACT_R1_ROOT');
const root = process.cwd(),
  r1Root = resolve(r1RootArg);
const r1Head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: r1Root, encoding: 'utf8' }).trim();
if (r1Head !== '5bb836a0522bd075cff513d4aaf4766bcbea5b97') throw Error('Wrong R1 source');
const load = (base, path) =>
  import(
    pathToFileURL(join(base, mode === 'compiled' ? 'dist/src' : 'src', path + (mode === 'compiled' ? '.js' : '.ts')))
  );
const r1 = {
  prefix: await load(r1Root, 'application/native-prefix'),
  wire: await load(r1Root, 'protocol/native-wire'),
  proof: await load(r1Root, 'protocol/native-proof'),
  identity: await load(r1Root, 'protocol/identity-binding'),
  authority: await load(r1Root, 'application/native-authority'),
};
const { openLocalGenerations } = await load(root, 'host/local-generations');
const { probe } = await import(
  pathToFileURL(
    join(
      root,
      mode === 'compiled'
        ? '.atseq-local/r0-native/compiled/experiments/r0-native/probe.js'
        : 'experiments/r0-native/probe.ts',
    ),
  )
);
await mkdir(directory, { recursive: true });
const inputStart = performance.now();
const input = gunzipSync(await readFile(fixturePath));
const fixtureReadAndGunzipMs = performance.now() - inputStart;
const decodeStart = performance.now();
const fixture = JSON.parse(input);
const fixtureJsonDecodeMs = performance.now() - decodeStart;
const producer = JSON.parse(await readFile(fixturePath.replace(/\.json\.gz$/, '-producer.json')));
if (createHash('sha256').update(input).digest('hex') !== producer.fixtureSha256)
  throw Error('Fixture differs from captured producer');
const stores = new Map();
const open = async (name) => {
  const path = join(directory, name + '.sqlite');
  stores.set(name, path);
  return openLocalGenerations(path, fixture.genesis.app + '/' + fixture.genesisCid + '/' + name);
};
const started = new Date().toISOString();
let peakObserved = process.memoryUsage();
const memory = () => {
  const value = process.memoryUsage();
  for (const key of Object.keys(value)) peakObserved[key] = Math.max(peakObserved[key], value[key]);
  return value;
};
try {
  const result = await probe(fixture, r1, open, memory);
  result.runtime = {
    node: process.version,
    mode,
    sourceHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    r1Head,
    fixtureSha256: createHash('sha256').update(input).digest('hex'),
    started,
    finished: new Date().toISOString(),
    peakObservedAtPhaseBoundaries: peakObserved,
    resourceUsage: process.resourceUsage(),
    fixtureReadAndGunzipMs,
    fixtureJsonDecodeMs,
    fixtureProducer: producer.producer,
  };
  result.storage = {};
  for (const [name, path] of stores) {
    const db = new DatabaseSync(path, { readOnly: true });
    try {
      const accounting = db.prepare('SELECT * FROM local_state').get();
      const rows = db.prepare('SELECT COUNT(*) as count, SUM(size) as logicalRowBytes FROM local_rows').get();
      const generations = db
        .prepare('SELECT COUNT(*) as count, SUM(length(metadata)+8) as metadataBytes FROM local_generations')
        .get();
      const pins = db.prepare('SELECT COUNT(*) as count, SUM(length(reference)+8) as pinBytes FROM local_pins').get();
      if (
        accounting.bytes !==
        accounting.scope.length + (rows.logicalRowBytes ?? 0) + (generations.metadataBytes ?? 0) + (pins.pinBytes ?? 0)
      )
        throw Error('SQLite exact accounting mismatch');
      result.storage[name] = { accounting, rows, generations, pins, sqliteFileBytes: (await stat(path)).size };
    } finally {
      db.close();
    }
  }
  await writeFile(join(directory, 'result.json.gz'), gzipSync(Buffer.from(JSON.stringify(result) + '\n')));
  console.log(
    JSON.stringify({
      actions: fixture.actions,
      pattern: fixture.pattern,
      runtime: result.runtime,
      costs: result.costs,
      times: result.times,
      failures: result.failures,
      persistence: result.persistence,
      receiptStatus: result.receipts.status,
      storage: result.storage,
    }),
  );
} catch (error) {
  await writeFile(
    join(directory, 'failure.json'),
    JSON.stringify(
      {
        actions: fixture.actions,
        pattern: fixture.pattern,
        node: process.version,
        mode,
        stage: 'probe',
        code: error?.code ?? null,
        message: String(error),
        stack: error?.stack,
        fixtureSha256: createHash('sha256').update(input).digest('hex'),
      },
      null,
      2,
    ) + '\n',
  );
  throw error;
}
