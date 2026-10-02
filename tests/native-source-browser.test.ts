import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { build } from 'vite';
import { chromium } from '@playwright/test';
import { nativeSourceCorpus } from './support/native-source-corpus.ts';

test('Chromium runs the same complete native source corpus and approved maintained streaming hash', async () => {
  const node = await nativeSourceCorpus();
  const built = await build({
    configFile: false,
    logLevel: 'error',
    build: {
      write: false,
      minify: true,
      lib: { entry: new URL('./support/native-source-corpus.ts', import.meta.url).pathname, formats: ['es'] },
    },
  });
  const chunks = (Array.isArray(built) ? built : [built])
    .flatMap((result) => ('output' in result ? result.output : []))
    .filter((file) => file.type === 'chunk');
  assert.equal(chunks.length, 1);
  const code = chunks[0]!.code;
  assert.ok(!/from\s*['"]node:/.test(code));
  const maintainedHashModules = chunks[0]!.moduleIds.filter((path) =>
    /\/node_modules\/@noble\/hashes\/esm\/(sha2|_md|utils)\.js$/.test(path),
  );
  assert.ok(maintainedHashModules.some((path) => path.endsWith('/sha2.js')));
  const server = createServer((request, response) => {
    response.setHeader('content-type', request.url === '/source.js' ? 'text/javascript' : 'text/html');
    response.end(request.url === '/source.js' ? code : '<!doctype html><title>Native source conformance</title>');
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${address.port}`);
    const result = await page.evaluate(async () => {
      const path = '/source.js';
      const probe = await import(path);
      return probe.nativeSourceCorpus();
    });
    assert.deepEqual(result, node);
    assert.deepEqual(errors, []);
    const capture = {
      chromium: browser.version(),
      node: process.version,
      bundleBytes: Buffer.byteLength(code),
      bundleSha256: createHash('sha256').update(code).digest('hex'),
      maintainedHashModules,
      passed: result,
    };
    await mkdir('.atseq-local', { recursive: true });
    await writeFile('.atseq-local/native-source-browser.json', JSON.stringify(capture, null, 2) + '\n');
    console.log(JSON.stringify(capture));
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
