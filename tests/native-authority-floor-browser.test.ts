import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { build } from 'vite';
import { chromium } from '@playwright/test';
import { floorHistoryCorpus, type FloorHistoryFixture } from './support/native-authority-floor-corpus.ts';

test('Chromium checks the exact genuine exported RV1 floor-history DATA', async () => {
  await mkdir('.atseq-local', { recursive: true });
  const fixturePath = '.atseq-local/r1-floor-browser-fixture.json';
  const childEnv: Record<string, string | undefined> = { ...process.env, ATSEQ_R1_FLOOR_FIXTURE: fixturePath };
  delete childEnv.NODE_TEST_CONTEXT;
  execFileSync(process.execPath, ['scripts/source-run.mjs', '--test', 'tests/native-authority-floor.test.ts'], {
    env: childEnv,
    timeout: 30_000,
  });
  const fixtureBytes = await readFile(fixturePath);
  const fixture: FloorHistoryFixture = JSON.parse(fixtureBytes.toString());
  const built = await build({
    configFile: false,
    logLevel: 'error',
    build: {
      write: false,
      minify: true,
      lib: { entry: new URL('./support/native-authority-floor-corpus.ts', import.meta.url).pathname, formats: ['es'] },
    },
  });
  const chunks = (Array.isArray(built) ? built : [built])
    .flatMap((result) => ('output' in result ? result.output : []))
    .filter((file) => file.type === 'chunk');
  assert.equal(chunks.length, 1);
  const code = chunks[0]!.code;
  assert.ok(!/from\s*['"]node:/.test(code));
  const server = createServer((request, response) => {
    response.setHeader('content-type', request.url === '/floor.js' ? 'text/javascript' : 'text/html');
    response.end(request.url === '/floor.js' ? code : '<!doctype html><title>RV1 floor history</title>');
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${address.port}`);
    const cases = await page.evaluate(async (fixture) => {
      const path = '/floor.js';
      const programme = await import(path);
      return programme.floorHistoryCorpus(fixture);
    }, fixture);
    assert.deepEqual(cases, await floorHistoryCorpus(fixture));
    assert.equal(cases.length, 4);
    const evidence = {
      node: process.version,
      chromium: browser.version(),
      cases,
      fixtureBytes: fixtureBytes.length,
      fixtureSha256: createHash('sha256').update(fixtureBytes).digest('hex'),
      bundleBytes: Buffer.byteLength(code),
      bundleSha256: createHash('sha256').update(code).digest('hex'),
      exactSharedCasesAgree: true,
      dataOnly: true,
    };
    await writeFile(
      process.env.ATSEQ_R1_FLOOR_BROWSER_CAPTURE ?? '.atseq-local/r1-floor-browser.json',
      JSON.stringify(evidence, null, 2) + '\n',
    );
    await writeFile('.atseq-local/r1-floor-browser-bundle.mjs', code);
    console.log(JSON.stringify(evidence));
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
