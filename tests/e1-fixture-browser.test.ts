import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { build } from 'vite';
import { chromium } from '@playwright/test';
import { prepareFixture, type E1Fixture } from '../experiments/e1-native/fixtures.ts';
import { replaySmall, verifyFixture } from '../experiments/e1-native/validate.ts';
import { canonicalJson } from '../src/core/values.ts';
test('E1 actual Chromium validates the same genuine roots and independent workload oracles', async () => {
  const directory = '.atseq-local/e1-preparation/browser';
  await mkdir(directory, { recursive: true });
  const fixtures: E1Fixture[] = [];
  for (const workload of [
    { n: 100, actors: 1 as const, growing: false, activation: false, invalidAction: false },
    { n: 100, actors: 16 as const, growing: true, activation: true, invalidAction: true },
  ]) {
    const name = workload.actors === 1 ? 'bounded-one-actor' : 'growing-many-actors-activation-invalid-action';
    fixtures.push(
      process.env.ATSEQ_E1_FIXTURE_DIRECTORY
        ? JSON.parse(
            gunzipSync(await readFile(`${process.env.ATSEQ_E1_FIXTURE_DIRECTORY}/${name}-100.json.gz`)).toString(),
          )
        : await prepareFixture(workload),
    );
  }
  const expected = await Promise.all(
    fixtures.map(async (fixture) => ({
      validation: await verifyFixture(fixture),
      snapshot: await replaySmall(fixture),
    })),
  );
  const built = await build({
    configFile: false,
    logLevel: 'error',
    build: {
      write: false,
      minify: true,
      lib: { entry: new URL('../experiments/e1-native/validate.ts', import.meta.url).pathname, formats: ['es'] },
    },
  });
  const chunks = (Array.isArray(built) ? built : [built])
    .flatMap((item) => ('output' in item ? item.output : []))
    .filter((item) => item.type === 'chunk');
  assert.equal(chunks.length, 1);
  const code = chunks[0]!.code;
  assert.ok(!/from\s*['"]node:/.test(code));
  await writeFile(directory + '/validation-bundle.mjs', code);
  const server = createServer((request, response) => {
    response.setHeader('content-type', request.url === '/validate.js' ? 'text/javascript' : 'text/html');
    response.end(request.url === '/validate.js' ? code : '<!doctype html><title>E1 fixture correctness</title>');
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${address.port}`);
    const observed = await page.evaluate(async (raw) => {
      const path = '/validate.js',
        module = await import(path),
        fixtures = JSON.parse(raw),
        results = [];
      for (const fixture of fixtures)
        results.push({ validation: await module.verifyFixture(fixture), snapshot: await module.replaySmall(fixture) });
      return results;
    }, JSON.stringify(fixtures));
    assert.deepEqual(observed, expected);
    const capture = {
      chromium: browser.version(),
      node: process.version,
      scope: 'same small fixture correctness; no reader timing',
      fixtureSha256: createHash('sha256').update(JSON.stringify(fixtures)).digest('hex'),
      bundleSha256: createHash('sha256').update(code).digest('hex'),
      bundleBytes: Buffer.byteLength(code),
      snapshotSha256: observed.map((row) => createHash('sha256').update(canonicalJson(row.snapshot)).digest('hex')),
      validation: observed.map((row) => row.validation),
    };
    await writeFile(directory + '/results.json', JSON.stringify(capture, null, 2) + '\n');
    console.log(JSON.stringify(capture));
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
