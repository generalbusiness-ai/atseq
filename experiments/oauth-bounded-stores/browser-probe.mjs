import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { resolve, relative } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
const root = resolve('.atseq-local/oauth-d2-browser');
const built = await build({
  entryPoints: ['experiments/oauth-bounded-stores/browser-entry.mjs'],
  bundle: true,
  splitting: true,
  format: 'esm',
  platform: 'browser',
  conditions: ['browser'],
  target: 'es2022',
  write: false,
  outdir: root,
  metafile: true,
  logLevel: 'silent',
});
const sessionGetter = Object.entries(built.metafile.inputs).find(([path]) =>
  path.endsWith('/@atproto/oauth-client/dist/session-getter.js'),
);
const selectedStore = sessionGetter?.[1].imports.find((edge) => edge.original === '@atproto-labs/simple-store')?.path;
assert.ok(selectedStore?.includes('/@atproto/oauth-client/node_modules/@atproto-labs/simple-store/'));
await mkdir('experiments/post-spike-evidence/2026-10-01/oauth-bounded-stores', { recursive: true });
await writeFile(
  'experiments/post-spike-evidence/2026-10-01/oauth-bounded-stores/browser-metafile.json',
  JSON.stringify(built.metafile, null, 2) + '\n',
);
const files = new Map(built.outputFiles.map((file) => ['/' + relative(root, file.path), file.contents]));
const browser = await chromium.launch();
const context = await browser.newContext();
await context.route('https://custody.atseq-d2.invalid/**', async (route) => {
  const content = files.get(new URL(route.request().url()).pathname);
  await route.fulfill({
    status: 200,
    contentType: content ? 'text/javascript' : 'text/html',
    body: content ? Buffer.from(content) : '<!doctype html><title>Public SDK custody experiment</title>',
  });
});
const page = await context.newPage();
const other = await context.newPage();
const initialize = async (target) => {
  await target.goto('https://custody.atseq-d2.invalid/');
  await target.evaluate(async () => {
    globalThis.probe = await import('/browser-entry.js');
  });
};
try {
  await initialize(page);
  const hooks = await page.evaluate(() => globalThis.probe.runPublicHookCases(true));
  const expiry = await page.evaluate(() => globalThis.probe.expiryIndexPremise());
  const created = await page.evaluate(() => globalThis.probe.persistentSession('atseq-core-reload', true));
  assert.equal(created.privateExtractable, false);
  await page.reload();
  await initialize(page);
  const restored = await page.evaluate(() => globalThis.probe.persistentSession('atseq-core-reload'));
  assert.equal(restored.privateExtractable, false);
  assert.equal(restored.subjectMatches, true);
  assert.equal(restored.refreshRequests, 1);
  await initialize(other);
  const lockName = '@atproto-oauth-client-did:plc:aaaaaaaaaaaaaaaaaaaaaaaa';
  await page.evaluate(async (name) => {
    let acquired;
    const ready = new Promise((resolve) => {
      acquired = resolve;
    });
    globalThis.heldLock = navigator.locks.request(name, () => {
      acquired();
      return new Promise((resolve) => {
        globalThis.releaseLock = resolve;
      });
    });
    await ready;
  }, lockName);
  const pendingRestore = other.evaluate(() => globalThis.probe.persistentSession('atseq-core-reload'));
  await other.waitForFunction(
    async (name) => (await navigator.locks.query()).pending.some((lock) => lock.name === name),
    lockName,
  );
  const blocked = await other.evaluate(async (name) => {
    const state = await navigator.locks.query();
    return {
      sdkLockHeld: state.held.some((lock) => lock.name === name),
      sdkLockPending: state.pending.some((lock) => lock.name === name),
    };
  }, lockName);
  assert.equal(blocked.sdkLockHeld, true);
  assert.equal(blocked.sdkLockPending, true);
  await page.evaluate(() => globalThis.releaseLock());
  const afterRelease = await pendingRestore;
  assert.equal(afterRelease.subjectMatches, true);
  console.log(
    JSON.stringify(
      {
        browser: browser.version(),
        hooks,
        expiry,
        created,
        restored,
        selectedStore,
        crossDocumentLock: { ...blocked, restoreCompletedAfterRelease: true },
        syntheticOnly: true,
        providerSuccess: false,
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.log(JSON.stringify({ failed: true, errorType: error?.name ?? 'unknown' }));
  process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
}
