import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { chromium } from '@playwright/test';
import { build } from 'vite';
test('actual Chromium consumes the exact Node-produced verified-prefix and compact authority corpus', async () => {
  const directory = '.atseq-local/native-prefix-browser';
  await mkdir(directory, { recursive: true });
  const env = { ...process.env, ATSEQ_NATIVE_PREFIX_CAPTURE_DIR: directory };
  delete (env as NodeJS.ProcessEnv).NODE_TEST_CONTEXT;
  execFileSync(process.execPath, ['scripts/source-run.mjs', '--test', 'tests/native-prefix.test.ts'], {
    env,
    timeout: 90_000,
    maxBuffer: 1024 * 1024,
  });
  const raw = await readFile(directory + '/fixture.json'),
    expected = JSON.parse(await readFile(directory + '/result.json', 'utf8'));
  const built = await build({
    configFile: false,
    logLevel: 'error',
    build: {
      write: false,
      minify: true,
      lib: { entry: new URL('./support/native-prefix-corpus.ts', import.meta.url).pathname, formats: ['es'] },
    },
  });
  const chunks = (Array.isArray(built) ? built : [built])
    .flatMap((result) => ('output' in result ? result.output : []))
    .filter((file) => file.type === 'chunk');
  assert.equal(chunks.length, 1);
  const code = chunks[0]!.code;
  assert.ok(!/from\s*['"]node:/.test(code));
  const server = createServer((request, response) => {
    response.setHeader('content-type', request.url === '/corpus.js' ? 'text/javascript' : 'text/html');
    response.end(request.url === '/corpus.js' ? code : '<!doctype html><title>Verified prefix corpus</title>');
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
      const path = '/corpus.js';
      return (await import(path)).nativePrefixCorpus(JSON.parse(raw));
    }, raw.toString());
    assert.deepEqual(result.cases, expected.cases);
    assert.deepEqual(result.work, expected.work);
    const capture = {
      node: process.version,
      chromium: browser.version(),
      ...result,
      fixtureBytes: raw.length,
      fixtureSha256: createHash('sha256').update(raw).digest('hex'),
      bundleBytes: Buffer.byteLength(code),
      bundleSha256: createHash('sha256').update(code).digest('hex'),
    };
    await writeFile(directory + '/chromium.json', JSON.stringify(capture, null, 2) + '\n');
    console.log(JSON.stringify(capture));
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
