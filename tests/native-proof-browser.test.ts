import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { build } from 'vite';
import { chromium } from '@playwright/test';
import { Point } from '@noble/secp256k1';
import { formatDidKey } from '@atproto/crypto';
import { nativeFixture } from './support/native-proof-corpus.ts';

test('Chromium executes native hostile cases and shared Node key/commit fixtures', async () => {
  const built = await build({
    configFile: false,
    logLevel: 'error',
    build: {
      write: false,
      minify: true,
      lib: { entry: new URL('./support/native-proof-browser.ts', import.meta.url).pathname, formats: ['es'] },
    },
  });
  const chunks = (Array.isArray(built) ? built : [built])
    .flatMap((result) => ('output' in result ? result.output : []))
    .filter((file) => file.type === 'chunk');
  assert.equal(chunks.length, 1);
  const code = chunks[0]!.code;
  assert.ok(!/from\s*['"]node:/.test(code));
  const fixtures = [];
  for (const type of ['p256', 'secp256k1'] as const) {
    const fixture = await nativeFixture(type),
      raw = await fixture.key.exportPublicKey('raw');
    let legacy: Uint8Array;
    if (type === 'secp256k1') legacy = Point.fromBytes(raw).toBytes(false);
    else {
      const jwk = await fixture.key.exportPublicKey('jwk'),
        key = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, true, ['verify']);
      legacy = new Uint8Array(await crypto.subtle.exportKey('raw', key));
    }
    assert.equal(formatDidKey(type === 'p256' ? 'ES256' : 'ES256K', legacy), fixture.options.trustedSigningKeyDid);
    fixtures.push({
      type,
      legacy: [...legacy],
      options: { ...fixture.options, carBytes: [...fixture.options.carBytes] },
    });
  }
  const server = createServer((request, response) => {
    if (request.url === '/probe.js') {
      response.setHeader('content-type', 'text/javascript');
      response.end(code);
    } else {
      response.setHeader('content-type', 'text/html');
      response.end('<!doctype html><title>Native proof corpus</title>');
    }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${address.port}`);
    const result = await page.evaluate(async (fixtures) => {
      const path = '/probe.js';
      const probe = await import(path);
      return { cases: await probe.nativeProofCorpus(), shared: await probe.sharedNativeFixtures(fixtures) };
    }, fixtures);
    assert.ok(result.cases.length >= 25);
    assert.deepEqual(result.shared, ['p256', 'secp256k1']);
    await mkdir('experiments/generated/native-proof', { recursive: true });
    await writeFile(
      'experiments/generated/native-proof/browser.json',
      JSON.stringify(
        {
          browser: 'Chromium',
          version: browser.version(),
          cases: result.cases,
          sharedNodeFixtures: result.shared,
          bundleBytes: Buffer.byteLength(code),
          bundleSha256: createHash('sha256').update(code).digest('hex'),
          executionTested: true,
        },
        null,
        2,
      ) + '\n',
    );
    console.log(
      JSON.stringify({
        browserCases: result.cases.length,
        bundleBytes: Buffer.byteLength(code),
        shared: result.shared,
      }),
    );
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
