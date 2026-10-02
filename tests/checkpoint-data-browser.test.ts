import test from 'node:test';
import assert from 'node:assert/strict';
import { gunzipSync } from 'node:zlib';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { build } from 'vite';
import { chromium } from '@playwright/test';
import { checkpointDataCorpus } from './support/checkpoint-data-corpus.ts';

test('Chromium runs exact shared checkpoint DATA corpus without admission', async () => {
  await mkdir('.atseq-local', { recursive: true });
  const fixtureBytes = gunzipSync(await readFile(new URL('./vectors/checkpoint-data.json.gz', import.meta.url)));
  const fixture = JSON.parse(fixtureBytes.toString());
  const built = await build({
    configFile: false,
    logLevel: 'error',
    build: {
      write: false,
      minify: true,
      lib: { entry: new URL('./support/checkpoint-data-browser.ts', import.meta.url).pathname, formats: ['es'] },
    },
  });
  const chunks = (Array.isArray(built) ? built : [built])
    .flatMap((result) => ('output' in result ? result.output : []))
    .filter((file) => file.type === 'chunk');
  assert.equal(chunks.length, 1);
  const code = chunks[0]!.code;
  assert.ok(!/from\s*['"]node:/.test(code));
  const server = createServer((request, response) => {
    response.setHeader('content-type', request.url === '/checkpoint-data.js' ? 'text/javascript' : 'text/html');
    response.end(
      request.url === '/checkpoint-data.js' ? code : '<!doctype html><title>Checkpoint data fixtures</title>',
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
    const cases = await page.evaluate(async (fixture) => {
      const path = '/checkpoint-data.js',
        programme = await import(path);
      return programme.checkpointDataCorpus(fixture);
    }, fixture);
    const nodeCases = await checkpointDataCorpus(fixture);
    assert.deepEqual(cases, nodeCases);
    const evidence = {
      node: process.version,
      chromium: browser.version(),
      cases,
      fixtureBytes: fixtureBytes.length,
      fixtureSha256: createHash('sha256').update(fixtureBytes).digest('hex'),
      bundleBytes: Buffer.byteLength(code),
      bundleSha256: createHash('sha256').update(code).digest('hex'),
      exactSharedCasesAgree: true,
      noAdmission: true,
    };
    await writeFile('.atseq-local/p4-data-browser.json', JSON.stringify(evidence, null, 2) + '\n');
    console.log(JSON.stringify(evidence));
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
