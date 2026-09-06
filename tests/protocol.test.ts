import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build, preview } from 'vite';
import { chromium } from '@playwright/test';
import { runProtocolCorpus } from '../experiments/protocol-corpus.ts';
import { runtimeDescriptor } from '../src/protocol/log.ts';
import { frameworkLexicons } from '../src/protocol/schemas.ts';

test('protocol vectors and rejection corpus agree in Node and Chromium', async t => {
  for (const doc of frameworkLexicons.filter(d => ['test.atseq.genesis', 'test.atseq.head'].includes(d.id))) {
    assert.deepEqual(doc.defs.value, (doc.defs.main as any).record, `${doc.id} method value must mirror its record shape`);
  }
  for (const [path, hash] of Object.entries(runtimeDescriptor.sources)) {
    assert.equal(createHash('sha256').update(await readFile(path)).digest('hex'), hash, `Runtime source changed: ${path}; issue a new profile identity`);
  }
  const node = await runProtocolCorpus();
  for (const result of node) await t.test(result.name, () => assert.equal(result.passed, true, result.detail ?? result.name));
  const root = resolve('experiments/protocol-browser'), outDir = resolve('experiments/generated/protocol-browser');
  await build({ root, logLevel: 'warn', build: { outDir, emptyOutDir: true } });
  const server = await preview({ root, logLevel: 'warn', build: { outDir }, preview: { host: '127.0.0.1', port: 0 } });
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(server.resolvedUrls!.local[0]!);
    await page.waitForFunction(() => (window as any).protocolResults || (window as any).protocolFailure, undefined, { timeout: 30_000 });
    assert.equal(await page.evaluate(() => (window as any).protocolFailure), undefined);
    const browserResults = await page.evaluate(() => (window as any).protocolResults);
    assert.deepEqual(browserResults, node); assert.deepEqual(errors, []);
    assert.equal(node.every(r => r.passed), true);
    await mkdir('experiments/generated', { recursive: true });
    const paths = ['package.json', 'package-lock.json', 'tests/protocol.test.ts', 'tests/vectors/protocol-v0.json', 'scripts/vectors/generate.mjs', 'experiments/protocol-corpus.ts'];
    for (const dir of ['src/protocol', 'lexicons/test/atseq', 'experiments/protocol-browser']) for (const name of await readdir(dir)) paths.push(`${dir}/${name}`);
    const sourceHashes = Object.fromEntries(await Promise.all(paths.map(async path => [path, createHash('sha256').update(await readFile(path)).digest('hex')])));
    await writeFile('experiments/generated/protocol-results.json', JSON.stringify({ passed: true, measuredAt: new Date().toISOString(), nodeVersion: process.version, browserVersion: browser.version(), node, browser: browserResults, sourceHashes }, null, 2) + '\n');
  } finally {
    await browser?.close();
    await new Promise<void>(done => server.httpServer.close(() => done()));
  }
});
