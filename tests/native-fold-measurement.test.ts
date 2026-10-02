import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { build } from 'vite';
import { chromium } from '@playwright/test';
import { nativeFoldMeasurements } from './support/native-fold-measurement.ts';
test('internal measured fold preserves public results and real counters in Node and Chromium', async () => {
  const node = await nativeFoldMeasurements();
  const built = await build({
    configFile: false,
    logLevel: 'error',
    build: {
      write: false,
      minify: true,
      lib: { entry: new URL('./support/native-fold-measurement.ts', import.meta.url).pathname, formats: ['es'] },
    },
  });
  const chunks = (Array.isArray(built) ? built : [built])
    .flatMap((item) => ('output' in item ? item.output : []))
    .filter((item) => item.type === 'chunk');
  assert.equal(chunks.length, 1);
  const code = chunks[0]!.code;
  const server = createServer((request, response) => {
    response.setHeader('content-type', request.url === '/measure.js' ? 'text/javascript' : 'text/html');
    response.end(request.url === '/measure.js' ? code : '<!doctype html><title>Internal fold measurements</title>');
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${address.port}`);
    const actual = await page.evaluate(async () => {
      const path = '/measure.js';
      return (await import(path)).nativeFoldMeasurements();
    });
    assert.deepEqual(actual, node);
    const evidence = {
      node: process.version,
      chromium: browser.version(),
      cases: actual,
      bundleBytes: Buffer.byteLength(code),
      bundleSha256: createHash('sha256').update(code).digest('hex'),
    };
    const directory = process.env.ATSEQ_NATIVE_FOLD_MEASUREMENT_CAPTURE_DIR ?? '.atseq-local/native-fold-measurement';
    await mkdir(directory, { recursive: true });
    await writeFile(directory + '/result.json', JSON.stringify(evidence, null, 2) + '\n');
    await writeFile(directory + '/bundle.mjs', code);
    console.log(JSON.stringify(evidence));
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
