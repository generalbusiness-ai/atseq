import test from 'node:test';
import assert from 'node:assert/strict';
import { gunzipSync } from 'node:zlib';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { build } from 'vite';
import { chromium } from '@playwright/test';
import { nativeCheckpointProducerOwnedInputCorpus } from './support/native-checkpoint-producer-owned-input-corpus.ts';

test('Chromium rejects hostile checkpoint byte and count overrides', async () => {
  await mkdir('.atseq-local/native-checkpoint-producer-owned-input', { recursive: true });
  const fixtureBytes = gunzipSync(await readFile(new URL('./vectors/checkpoint-data.json.gz', import.meta.url)));
  const fixture = JSON.parse(fixtureBytes.toString());
  const literal = JSON.parse(
    await readFile(new URL('./vectors/native-checkpoint-producer.json', import.meta.url), 'utf8'),
  );
  const built = await build({
    configFile: false,
    logLevel: 'error',
    build: {
      write: false,
      minify: true,
      lib: {
        entry: new URL('./support/native-checkpoint-producer-owned-input-browser.ts', import.meta.url).pathname,
        formats: ['es'],
      },
    },
  });
  const chunks = (Array.isArray(built) ? built : [built])
    .flatMap((result) => ('output' in result ? result.output : []))
    .filter((file) => file.type === 'chunk');
  assert.equal(chunks.length, 1);
  const code = chunks[0]!.code;
  assert.ok(!/from\s*['"]node:/.test(code));
  await writeFile('.atseq-local/native-checkpoint-producer-owned-input/browser-bundle.js', code);
  const server = createServer((request, response) => {
    response.setHeader(
      'content-type',
      request.url === '/native-checkpoint-producer-owned-input.js' ? 'text/javascript' : 'text/html',
    );
    response.end(
      request.url === '/native-checkpoint-producer-owned-input.js'
        ? code
        : '<!doctype html><title>Checkpoint data fixtures</title>',
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
    const cases = await page.evaluate(
      async ({ fixture, literal }) => {
        const path = '/native-checkpoint-producer-owned-input.js',
          programme = await import(path);
        return programme.nativeCheckpointProducerOwnedInputCorpus(fixture, literal);
      },
      { fixture, literal },
    );
    const nodeCases = await nativeCheckpointProducerOwnedInputCorpus(fixture, literal);
    assert.deepEqual(cases, nodeCases);
    const evidence = {
      node: process.version,
      chromium: browser.version(),
      chromiumBinary: chromium.executablePath(),
      chromiumBinarySha256: createHash('sha256')
        .update(await readFile(chromium.executablePath()))
        .digest('hex'),
      cases,
      fixtureBytes: fixtureBytes.length,
      fixtureSha256: createHash('sha256').update(fixtureBytes).digest('hex'),
      bundleBytes: Buffer.byteLength(code),
      bundleSha256: createHash('sha256').update(code).digest('hex'),
      exactSharedCasesAgree: true,
      noAdmission: true,
    };
    await writeFile(
      process.env.ATSEQ_P4F1_OWNED_BROWSER_CAPTURE_PATH ??
        '.atseq-local/native-checkpoint-producer-owned-input/browser.json',
      JSON.stringify(evidence, null, 2) + '\n',
    );
    console.log(JSON.stringify(evidence));
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
