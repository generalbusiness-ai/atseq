import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { createHash } from 'node:crypto';
import { build } from 'vite';
import { chromium } from '@playwright/test';
import type { ApplicationFixture } from './support/native-application-fixture.ts';
test('actual Chromium replays exact genuine native application publications and hostile producer probes', async () => {
  const directory = '.atseq-local/native-application-browser';
  const env = { ...process.env, ATSEQ_NATIVE_APPLICATION_CAPTURE_DIR: directory };
  delete (env as NodeJS.ProcessEnv).NODE_TEST_CONTEXT;
  execFileSync(process.execPath, ['scripts/source-run.mjs', '--test', 'tests/native-application.test.ts'], {
    env,
    timeout: 60000,
    maxBuffer: 1024 * 1024,
  });
  const raw = await readFile(directory + '/fixture.json'),
    fixture: ApplicationFixture = JSON.parse(raw.toString());
  const faults = await readFile(directory + '/fault-bundle.mjs', 'utf8');
  const expectedFaults = JSON.parse(await readFile(directory + '/faults.json', 'utf8'));
  const built = await build({
    configFile: false,
    logLevel: 'error',
    build: {
      write: false,
      minify: true,
      lib: { entry: new URL('./support/native-application-corpus.ts', import.meta.url).pathname, formats: ['es'] },
    },
  });
  const chunks = (Array.isArray(built) ? built : [built])
    .flatMap((item) => ('output' in item ? item.output : []))
    .filter((item) => item.type === 'chunk');
  assert.equal(chunks.length, 1);
  const code = chunks[0]!.code;
  assert.ok(!/from\s*['"]node:/.test(code));
  const server = createServer((request, response) => {
    response.setHeader(
      'content-type',
      request.url === '/corpus.js' || request.url === '/faults.js' ? 'text/javascript' : 'text/html',
    );
    response.end(
      request.url === '/corpus.js'
        ? code
        : request.url === '/faults.js'
          ? faults
          : '<!doctype html><title>Native application corpus</title>',
    );
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${address.port}`);
    const result = await page.evaluate(async (raw) => {
      const fixture = JSON.parse(raw);
      const corpusPath = '/corpus.js',
        faultPath = '/faults.js';
      const corpus = await import(corpusPath),
        probe = await import(faultPath);
      return {
        cases: await corpus.nativeApplicationCorpus(fixture),
        faults: await probe.nativeApplicationFaultProbe(fixture),
      };
    }, raw.toString());
    assert.deepEqual(result.faults, expectedFaults);
    const evidence = {
      node: process.version,
      chromium: browser.version(),
      ...result,
      fixtureBytes: raw.length,
      fixtureSha256: createHash('sha256').update(raw).digest('hex'),
      bundleBytes: Buffer.byteLength(code),
      bundleSha256: createHash('sha256').update(code).digest('hex'),
      faultBundleBytes: Buffer.byteLength(faults),
      faultBundleSha256: createHash('sha256').update(faults).digest('hex'),
    };
    await writeFile('.atseq-local/native-application-chromium.json', JSON.stringify(evidence, null, 2) + '\n');
    console.log(JSON.stringify(evidence));
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
