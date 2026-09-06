import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build, preview } from 'vite';
import { chromium } from '@playwright/test';
import { runRuntimeCorpus } from '../experiments/runtime-corpus.ts';
import { runtimeCid } from '../src/protocol/log.ts';
import { applicationRuntimeDescriptor } from '../src/runtime/identity.ts';

test('application interpretation agrees in Node and a Chromium worker', async t => {
  assert.equal(applicationRuntimeDescriptor.engine.$link, await runtimeCid(), 'Application runtime must name the installed immutable engine');
  const packageInfo = JSON.parse(await readFile('package.json', 'utf8'));
  for (const [name, version] of Object.entries(applicationRuntimeDescriptor.libraries)) assert.equal(packageInfo.dependencies[name], version, `Application runtime dependency changed: ${name}`);
  assert.ok(Object.keys(applicationRuntimeDescriptor.sources).length > 0, 'Freeze application runtime sources before reporting a gate pass');
  for (const [path, hash] of Object.entries(applicationRuntimeDescriptor.sources)) {
    assert.equal(createHash('sha256').update(await readFile(path)).digest('hex'), hash, `Application runtime source changed: ${path}; refresh its profile identity`);
  }
  const node = await runRuntimeCorpus();
  for (const result of node) await t.test(result.name, () => assert.equal(result.passed, true, result.detail ?? result.name));
  const root = resolve('experiments/runtime-browser'), outDir = resolve('experiments/generated/runtime-browser');
  await build({ root, logLevel: 'warn', build: { outDir, emptyOutDir: true } });
  const server = await preview({ root, logLevel: 'warn', build: { outDir }, preview: { host: '127.0.0.1', port: 0 } });
  let browser;
  try {
    browser = await chromium.launch(); const page = await browser.newPage();
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(server.resolvedUrls!.local[0]!);
    await page.waitForFunction(() => (window as any).runtimeResults || (window as any).runtimeFailure, undefined, { timeout: 30_000 });
    assert.equal(await page.evaluate(() => (window as any).runtimeFailure), undefined);
    const browserResults = await page.evaluate(() => (window as any).runtimeResults);
    assert.deepEqual(browserResults, node); assert.deepEqual(errors, []);
    assert.equal(node.every(r => r.passed), true);
    const paths = [...Object.keys(applicationRuntimeDescriptor.sources), 'src/runtime/application-profile.json', 'tests/runtime.test.ts', 'experiments/runtime-corpus.ts', 'testdata/apps/fixtures.ts', 'experiments/runtime-browser/main.ts', 'experiments/runtime-browser/worker.ts', 'experiments/runtime-browser/index.html', 'package.json', 'package-lock.json'];
    const sourceHashes = Object.fromEntries(await Promise.all(paths.map(async p => [p, createHash('sha256').update(await readFile(p)).digest('hex')])));
    await mkdir('experiments/generated', { recursive: true });
    await writeFile('experiments/generated/runtime-results.json', JSON.stringify({ passed: true, measuredAt: new Date().toISOString(), nodeVersion: process.version, browserVersion: browser.version(), browserWorker: true, node, browser: browserResults, sourceHashes }, null, 2) + '\n');
  } finally { await browser?.close(); await new Promise<void>(done => server.httpServer.close(() => done())); }
});
