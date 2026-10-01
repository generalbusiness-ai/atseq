import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { build } from 'vite';
import { chromium } from '@playwright/test';
import { plcIdentityFixture } from './support/identity-corpus.ts';

test('Chromium runs retained identity corpus and shared Node signed PLC fixtures', async () => {
  const built = await build({
    configFile: false,
    logLevel: 'error',
    build: {
      write: false,
      minify: true,
      lib: { entry: new URL('./support/identity-browser.ts', import.meta.url).pathname, formats: ['es'] },
    },
  });
  const chunks = (Array.isArray(built) ? built : [built])
    .flatMap((result) => ('output' in result ? result.output : []))
    .filter((file) => file.type === 'chunk');
  assert.equal(chunks.length, 1);
  const code = chunks[0]!.code;
  assert.ok(!/from\s*['"]node:/.test(code));
  const hostRuntimeModules = chunks
    .flatMap((chunk) => chunk.moduleIds)
    .filter((path) => /\/(fetch-node|undici_v[678])\//.test(path) && !path.endsWith('/package.json'));
  assert.deepEqual(hostRuntimeModules, []);
  const fixtures = [];
  for (const type of ['p256', 'secp256k1'] as const) {
    const fixture = await plcIdentityFixture(type);
    fixtures.push({
      principal: fixture.principal,
      key: fixture.signing,
      audit: [...new TextEncoder().encode(JSON.stringify(fixture.rows))],
      selectedTipCid: fixture.selectedTipCid,
    });
  }
  const server = createServer((request, response) => {
    response.setHeader('content-type', request.url === '/identity.js' ? 'text/javascript' : 'text/html');
    response.end(request.url === '/identity.js' ? code : '<!doctype html><title>Identity evidence corpus</title>');
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
      const path = '/identity.js';
      const probe = await import(path);
      return { cases: await probe.identityCorpus(), shared: await probe.sharedIdentityFixtures(fixtures) };
    }, fixtures);
    assert.ok(result.cases.length >= 35);
    assert.deepEqual(
      result.shared,
      fixtures.map((fixture) => fixture.principal),
    );
    console.log(JSON.stringify({ chromium: browser.version(), identityCases: result.cases, shared: result.shared }));
    await mkdir('.atseq-local', { recursive: true });
    await writeFile(
      '.atseq-local/i1-browser.json',
      JSON.stringify(
        {
          chromium: browser.version(),
          node: process.version,
          bundleBytes: Buffer.byteLength(code),
          bundleSha256: createHash('sha256').update(code).digest('hex'),
          hostRuntimeModules,
          cases: result.cases,
          publicSharedFixtures: fixtures,
          verifiedSharedPrincipals: result.shared,
        },
        null,
        2,
      ) + '\n',
    );
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
