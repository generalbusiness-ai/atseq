import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { gunzipSync, gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { resolve, join } from 'node:path';
import { build } from 'vite';
import { chromium } from '@playwright/test';
const [fixturePath, directory, r1RootArg] = process.argv.slice(2);
if (!r1RootArg) throw Error('Usage: browser-run.mjs FIXTURE OUTPUT_DIRECTORY EXACT_R1_ROOT');
const root = process.cwd(),
  r1Root = resolve(r1RootArg);
const r1Head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: r1Root, encoding: 'utf8' }).trim();
if (r1Head !== '5bb836a0522bd075cff513d4aaf4766bcbea5b97') throw Error('Wrong R1 source');
await mkdir(directory, { recursive: true });
await mkdir('.atseq-local/r0-native', { recursive: true });
const entry = join(root, '.atseq-local/r0-native/browser-entry.ts');
await writeFile(
  entry,
  `export {probe} from ${JSON.stringify(join(root, 'experiments/r0-native/probe.ts'))};\n` +
    `export {openLocalGenerations} from ${JSON.stringify(join(root, 'src/browser/local-generations.ts'))};\n` +
    [
      'prefix:application/native-prefix',
      'wire:protocol/native-wire',
      'proof:protocol/native-proof',
      'identity:protocol/identity-binding',
      'authority:application/native-authority',
    ]
      .map((row) => {
        const [name, path] = row.split(':');
        return `import * as ${name} from ${JSON.stringify(join(r1Root, 'src', path + '.ts'))};`;
      })
      .join('\n') +
    '\nexport const r1={prefix,wire,proof,identity,authority};\n',
);
const built = await build({
  configFile: false,
  logLevel: 'error',
  resolve: { conditions: ['atseq-source', 'browser', 'import', 'default'] },
  build: { write: false, minify: true, lib: { entry, formats: ['es'] } },
});
const chunks = (Array.isArray(built) ? built : [built])
  .flatMap((result) => ('output' in result ? result.output : []))
  .filter((file) => file.type === 'chunk');
if (chunks.length !== 1 || /from\s*['"]node:/.test(chunks[0].code)) throw Error('Unexpected browser output');
const bundle = chunks[0].code,
  input = gunzipSync(await readFile(fixturePath));
const producer = JSON.parse(await readFile(fixturePath.replace(/\.json\.gz$/, '-producer.json')));
if (createHash('sha256').update(input).digest('hex') !== producer.fixtureSha256)
  throw Error('Fixture differs from captured producer');
await writeFile(join(directory, 'bundle.mjs.gz'), gzipSync(Buffer.from(bundle)));
const server = createServer((request, response) => {
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  response.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  response.setHeader(
    'content-type',
    request.url === '/probe.js' ? 'text/javascript' : request.url === '/fixture' ? 'application/json' : 'text/html',
  );
  response.end(
    request.url === '/probe.js'
      ? bundle
      : request.url === '/fixture'
        ? input
        : '<!doctype html><title>R0 native DATA costs</title>',
  );
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const browser = await chromium.launch();
try {
  const context = await browser.newContext(),
    page = await context.newPage();
  page.setDefaultTimeout(0);
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const cdp = await context.newCDPSession(page),
    heapBefore = await cdp.send('Runtime.getHeapUsage');
  const result = await page.evaluate(async () => {
    const programme = await import('/probe.js');
    const transferStart = performance.now(),
      input = await (await fetch('/fixture')).arrayBuffer(),
      transferMs = performance.now() - transferStart;
    const decodeStart = performance.now(),
      fixture = JSON.parse(new TextDecoder().decode(input)),
      decodeMs = performance.now() - decodeStart;
    const before = await navigator.storage.estimate();
    const names = new Map();
    const open = async (name) => {
      const actual = 'r0-' + name;
      names.set(name, actual);
      return programme.openLocalGenerations(actual, fixture.genesis.app + '/' + fixture.genesisCid + '/' + name);
    };
    const memory = () =>
      performance.memory
        ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          }
        : null;
    const result = await programme.probe(fixture, programme.r1, open, memory);
    const request = (value) =>
      new Promise((resolve, reject) => {
        value.onsuccess = () => resolve(value.result);
        value.onerror = () => reject(value.error);
      });
    result.storage = {};
    for (const [name, actual] of names) {
      const db = await request(indexedDB.open(actual, 1));
      try {
        const tx = db.transaction(['state', 'rows', 'values', 'generations', 'pins'], 'readonly');
        const state = await request(tx.objectStore('state').get('state'));
        const rows = await request(tx.objectStore('rows').getAll());
        const generations = await request(tx.objectStore('generations').getAll());
        const pins = await request(tx.objectStore('pins').getAll());
        const accounted =
          state.scope.length +
          rows.reduce((n, row) => n + row.size, 0) +
          generations.reduce((n, row) => n + row.metadata.byteLength + 8, 0) +
          pins.reduce((n, pin) => n + pin.reference.length + 8, 0);
        if (state.bytes !== accounted) throw Error('IndexedDB exact accounting mismatch');
        result.storage[name] = {
          accounting: state,
          physicalRowVersions: rows.length,
          generations: generations.length,
          pins: pins.length,
          values: await request(tx.objectStore('values').count()),
          logicalRowBytes: rows.reduce((n, row) => n + row.size, 0),
        };
      } finally {
        db.close();
      }
    }
    result.transfer = { fixtureHttpBodyBytes: input.byteLength, transferMs, jsonDecodeMs: decodeMs };
    result.originStorage = {
      before,
      after: await navigator.storage.estimate(),
      scope: 'fresh isolated browser context; origin estimate is not exact database file size',
    };
    return result;
  });
  result.runtime = {
    nodeDriver: process.version,
    chromium: browser.version(),
    mode: 'compiled-browser',
    r1Head,
    sourceHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    fixtureSha256: createHash('sha256').update(input).digest('hex'),
    fixtureProducer: producer.producer,
    bundleSha256: createHash('sha256').update(bundle).digest('hex'),
    bundleBytes: Buffer.byteLength(bundle),
    heapBefore,
    heapAfter: await cdp.send('Runtime.getHeapUsage'),
  };
  await writeFile(join(directory, 'result.json.gz'), gzipSync(Buffer.from(JSON.stringify(result) + '\n')));
  console.log(
    JSON.stringify({
      actions: result.actions,
      pattern: result.pattern,
      runtime: result.runtime,
      costs: result.costs,
      times: result.times,
      failures: result.failures,
      receiptStatus: result.receipts.status,
      persistence: result.persistence,
      transfer: result.transfer,
      storage: result.storage,
      originStorage: result.originStorage,
    }),
  );
  await context.close();
} catch (error) {
  await writeFile(
    join(directory, 'failure.json'),
    JSON.stringify({ stage: 'compiled-browser', message: String(error), stack: error?.stack }, null, 2) + '\n',
  );
  throw error;
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
