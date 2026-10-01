import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build, preview } from 'vite';
import { chromium } from '@playwright/test';
import { runNativeWireCorpus } from './support/native-wire-corpus.ts';
test('isolated native foundation agrees with independent fixtures in Node and Chromium', async (t) => {
  const node = await runNativeWireCorpus();
  for (const result of node)
    await t.test(result.name, () => assert.equal(result.passed, true, result.detail ?? result.name));
  const root = resolve('tests/support/native-wire-browser'),
    outDir = resolve('experiments/generated/native-wire-browser');
  await build({ root, logLevel: 'warn', build: { outDir, emptyOutDir: true } });
  const server = await preview({ root, logLevel: 'warn', build: { outDir }, preview: { host: '127.0.0.1', port: 0 } });
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage(),
      errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(server.resolvedUrls!.local[0]!);
    await page.waitForFunction(
      () => (window as any).nativeWireResults || (window as any).nativeWireFailure,
      undefined,
      { timeout: 30000 },
    );
    assert.equal(await page.evaluate(() => (window as any).nativeWireFailure), undefined);
    const browserResults = await page.evaluate(() => (window as any).nativeWireResults);
    assert.deepEqual(browserResults, node);
    assert.deepEqual(errors, []);
    assert.ok(node.every((r) => r.passed));
    const paths = [
      'src/protocol/native-schema.ts',
      'src/protocol/native-wire.ts',
      'src/protocol/native-contract.ts',
      'scripts/vectors/native-foundation.mjs',
      'tests/vectors/native-foundation.json',
      'tests/native-wire.test.ts',
      'tests/support/native-wire-corpus.ts',
      'tests/support/native-wire-browser/index.html',
      'tests/support/native-wire-browser/main.ts',
      'package.json',
      'npm-shrinkwrap.json',
    ];
    const sourceHashes = Object.fromEntries(
      await Promise.all(
        paths.map(async (path) => [
          path,
          createHash('sha256')
            .update(await readFile(path))
            .digest('hex'),
        ]),
      ),
    );
    await mkdir('experiments/generated', { recursive: true });
    await writeFile(
      'experiments/generated/native-wire-results.json',
      JSON.stringify(
        {
          passed: true,
          measuredAt: new Date().toISOString(),
          nodeVersion: process.version,
          browserVersion: browser.version(),
          node,
          browser: browserResults,
          sourceHashes,
        },
        null,
        2,
      ) + '\n',
    );
  } finally {
    await browser?.close();
    await new Promise<void>((done) => server.httpServer.close(() => done()));
  }
});
