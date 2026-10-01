import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build, preview } from 'vite';
import { chromium } from '@playwright/test';
import { runRuntimeCorpus } from '../tests/support/runtime-corpus.ts';
import { runSourceDocumentCorpus } from './support/source-document-corpus.ts';
import { runtimeCid } from '../src/protocol/log.ts';
import { applicationRuntimeDescriptor } from '../src/protocol/identity.ts';

test('application interpretation agrees in Node and a Chromium worker', async (t) => {
  const node = [...(await runRuntimeCorpus()), ...(await runSourceDocumentCorpus())];
  for (const result of node)
    await t.test(result.name, () => assert.equal(result.passed, true, result.detail ?? result.name));
  const root = resolve('tests/support/runtime-browser'),
    outDir = resolve('experiments/generated/runtime-browser');
  await build({ root, logLevel: 'warn', build: { outDir, emptyOutDir: true } });
  const server = await preview({ root, logLevel: 'warn', build: { outDir }, preview: { host: '127.0.0.1', port: 0 } });
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(server.resolvedUrls!.local[0]!);
    await page.waitForFunction(() => (window as any).runtimeResults || (window as any).runtimeFailure, undefined, {
      timeout: 30_000,
    });
    assert.equal(await page.evaluate(() => (window as any).runtimeFailure), undefined);
    const browserResults = await page.evaluate(() => (window as any).runtimeResults);
    assert.deepEqual(browserResults, node);
    assert.deepEqual(errors, []);
    assert.equal(
      node.every((r) => r.passed),
      true,
    );
    const paths = [
      'src/core/contracts.ts',
      'src/core/dependencies-approved.json',
      'src/core/profile.ts',
      'src/core/values.ts',
      'src/runtime/evaluator.ts',
      'src/application/folder.ts',
      'src/protocol/identity.ts',
      'tests/runtime.test.ts',
      'tests/support/runtime-corpus.ts',
      'tests/support/source-document-corpus.ts',
      'src/definition/document.ts',
      'testdata/source-documents/taskboard.atseq.json',
      'testdata/source-documents/guitar.atseq.json',
      'testdata/source-documents/ledger.atseq.json',
      'testdata/apps/fixtures.ts',
      'tests/support/runtime-browser/main.ts',
      'tests/support/runtime-browser/worker.ts',
      'tests/support/runtime-browser/index.html',
      'package.json',
      'npm-shrinkwrap.json',
    ];
    const sourceHashes = Object.fromEntries(
      await Promise.all(
        paths.map(async (p) => [
          p,
          createHash('sha256')
            .update(await readFile(p))
            .digest('hex'),
        ]),
      ),
    );
    await mkdir('experiments/generated', { recursive: true });
    await writeFile(
      'experiments/generated/runtime-results.json',
      JSON.stringify(
        {
          passed: true,
          measuredAt: new Date().toISOString(),
          nodeVersion: process.version,
          browserVersion: browser.version(),
          browserWorker: true,
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
