import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { mkdtemp, rm, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { build } from 'vite';
import { chromium } from '@playwright/test';

test('real Chromium IndexedDB shares storage corpus, physical quota and renderer crashes', async () => {
  const built = await build({
    configFile: false,
    logLevel: 'error',
    build: {
      write: false,
      minify: true,
      lib: { entry: new URL('./support/local-generations-browser.ts', import.meta.url).pathname, formats: ['es'] },
    },
  });
  const chunks = (Array.isArray(built) ? built : [built])
    .flatMap((r) => ('output' in r ? r.output : []))
    .filter((f) => f.type === 'chunk');
  assert.equal(chunks.length, 1);
  const code = chunks[0]!.code;
  const serve = (request: import('node:http').IncomingMessage, response: import('node:http').ServerResponse) => {
    response.setHeader('content-type', request.url === '/probe.js' ? 'text/javascript' : 'text/html');
    response.end(request.url === '/probe.js' ? code : '<!doctype html><title>Local generation storage</title>');
  };
  const server = createServer(serve),
    quotaServer = createServer(serve);
  server.listen(0, '127.0.0.1');
  quotaServer.listen(0, '127.0.0.1');
  await Promise.all([once(server, 'listening'), once(quotaServer, 'listening')]);
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const origin = `http://127.0.0.1:${address.port}`,
    profile = await mkdtemp(join(tmpdir(), 'atseq-local-idb-'));
  const context = await chromium.launchPersistentContext(profile);
  try {
    let page = await context.newPage();
    await page.goto(origin);
    const corpus = await page.evaluate(async () => {
      const path = '/probe.js';
      return (await import(path)).browserCorpus();
    });
    assert.equal(corpus.cases.length, 24);
    const quotaAddress = quotaServer.address();
    assert.ok(quotaAddress && typeof quotaAddress === 'object');
    const quotaOrigin = `http://127.0.0.1:${quotaAddress.port}`;
    const quotaPage = await context.newPage();
    await quotaPage.goto(quotaOrigin);
    let cdp = await context.newCDPSession(quotaPage);
    await cdp.send('Storage.overrideQuotaForOrigin', { origin: quotaOrigin, quotaSize: 1024 * 1024 });
    const override = await cdp.send('Storage.getUsageAndQuota', { origin: quotaOrigin });
    assert.equal(override.overrideActive, true);
    assert.equal(override.quota, 1024 * 1024);
    await quotaPage.evaluate(async () => {
      const path = '/probe.js';
      await (await import(path)).seedQuota();
    });
    const quota = {
      ...(await quotaPage.evaluate(async () => {
        const path = '/probe.js';
        return (await import(path)).exhaustQuota();
      })),
      override,
    };
    await cdp.send('Storage.overrideQuotaForOrigin', { origin: quotaOrigin });
    await quotaPage.close();
    const crashes = [];
    for (const phase of ['before', 'after'] as const) {
      await page.evaluate(async (phase) => {
        const path = '/probe.js';
        await (await import(path)).armCrash(phase);
      }, phase);
      await page.waitForFunction((phase) => {
        const state = globalThis as typeof globalThis & { crashArmed?: string; crashRequests?: number };
        return state.crashArmed === phase && (phase === 'after' || (state.crashRequests ?? 0) >= 2);
      }, phase);
      const observed = await page.evaluate(() => ({
        requests: (globalThis as typeof globalThis & { crashRequests?: number }).crashRequests ?? 0,
      }));
      cdp = await context.newCDPSession(page);
      const crashed = new Promise<void>((resolve) => page.once('crash', () => resolve()));
      void cdp.send('Page.crash').catch(() => {});
      await crashed;
      await page.close();
      page = await context.newPage();
      await page.goto(origin);
      const result = await page.evaluate(async (phase) => {
        const path = '/probe.js';
        return (await import(path)).verifyCrash(phase);
      }, phase);
      crashes.push({ ...result, observedRequests: observed.requests });
    }
    const sources: Record<string, string> = {};
    for (const path of [
      'src/core/local-generations.ts',
      'src/browser/local-generations.ts',
      'tests/support/local-generations-corpus.ts',
      'tests/support/local-generations-browser.ts',
      'tests/local-generations-browser.test.ts',
    ])
      sources[path] = createHash('sha256')
        .update(await readFile(path))
        .digest('hex');
    await mkdir('experiments/generated/local-generations', { recursive: true });
    const capture = {
      browser: context.browser()!.version(),
      ...corpus,
      quota,
      crashes,
      sources,
      bundleBytes: Buffer.byteLength(code),
      bundleSha256: createHash('sha256').update(code).digest('hex'),
    };
    await writeFile('experiments/generated/local-generations/chromium.json', JSON.stringify(capture, null, 2) + '\n');
    console.log(JSON.stringify({ cases: corpus.cases.length, metrics: corpus.metrics, quota, crashes }));
  } finally {
    await context.close();
    await Promise.all(
      [server, quotaServer].map(
        (s) => new Promise<void>((resolve, reject) => s.close((e) => (e ? reject(e) : resolve()))),
      ),
    );
    await rm(profile, { recursive: true });
  }
});
