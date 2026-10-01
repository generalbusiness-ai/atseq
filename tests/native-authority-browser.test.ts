import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { build } from 'vite';
import { chromium } from '@playwright/test';
import type { AuthorityPublicFixture } from './support/native-authority-fixture.ts';

test('Chromium replays exact Node-produced authenticated authority vectors and complete snapshots', async () => {
  await mkdir('.atseq-local', { recursive: true });
  const capture = '.atseq-local/i2-browser-input.json';
  const childEnv: Record<string, string | undefined> = { ...process.env, ATSEQ_I2_CAPTURE_PATH: capture };
  delete childEnv.NODE_TEST_CONTEXT;
  execFileSync(process.execPath, ['scripts/source-run.mjs', '--test', 'tests/native-authority.test.ts'], {
    env: childEnv,
    timeout: 30_000,
    maxBuffer: 1024 * 1024,
  });
  const fixtureBytes = await readFile(capture),
    fixtures: AuthorityPublicFixture[] = JSON.parse(fixtureBytes.toString());
  const built = await build({
    configFile: false,
    logLevel: 'error',
    build: {
      write: false,
      minify: true,
      lib: { entry: new URL('./support/native-authority-browser.ts', import.meta.url).pathname, formats: ['es'] },
    },
  });
  const chunks = (Array.isArray(built) ? built : [built])
    .flatMap((result) => ('output' in result ? result.output : []))
    .filter((file) => file.type === 'chunk');
  assert.equal(chunks.length, 1);
  const code = chunks[0]!.code;
  assert.ok(!/from\s*['"]node:/.test(code));
  const server = createServer((request, response) => {
    response.setHeader('content-type', request.url === '/authority.js' ? 'text/javascript' : 'text/html');
    response.end(request.url === '/authority.js' ? code : '<!doctype html><title>Native authority fixtures</title>');
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${address.port}`);
    const cases = await page.evaluate(async (fixtures) => {
      const path = '/authority.js',
        programme = await import(path);
      return programme.replayAuthorityFixtures(fixtures);
    }, fixtures);
    assert.equal(
      cases.length,
      fixtures.reduce((sum, fixture) => sum + fixture.vectors.length + fixture.hostile.length, 0),
    );
    const evidence = {
      node: process.version,
      chromium: browser.version(),
      cases,
      fixtureBytes: fixtureBytes.length,
      fixtureSha256: createHash('sha256').update(fixtureBytes).digest('hex'),
      bundleBytes: Buffer.byteLength(code),
      bundleSha256: createHash('sha256').update(code).digest('hex'),
      exactWholeSnapshotsAgree: true,
    };
    await writeFile('.atseq-local/i2-browser.json', JSON.stringify(evidence, null, 2) + '\n');
    console.log(JSON.stringify(evidence));
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
