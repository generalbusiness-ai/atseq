import test from 'node:test';
import { recordFlowEvidence, type MeasuredCase } from './helpers/evidence.ts';
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { bytes } from '../src/protocol/wire.ts';
import { SourceBundle } from '../src/definition/source.ts';
import { chromium, expect } from '@playwright/test';
import { build } from 'vite';
import { startEnvironment, resetDisposable } from '../experiments/pds/environment.mjs';
import { ApplicationHost } from '../src/host/application.ts';
import { LocalAccounts } from '../src/host/accounts.ts';
import { startApplicationService } from '../src/host/http.ts';
import { AtseqClient } from '../src/client/api.ts';
import { guitarFixture } from '../testdata/apps/fixtures.ts';
import { cli } from './helpers/cli.ts';

test('two browser identities and the JSON CLI use generic participation flows', async t => {
  const results: MeasuredCase[] = [];
  const check = async (name: string, run: () => Promise<void>) => {
    let fault: unknown;
    await t.test(name, async () => { const started = performance.now(); let passed = false; try { await run(); passed = true; } catch (error) { fault = error; throw error; } finally { results.push({ name, passed, elapsedMs: Math.round(performance.now() - started) }); } });
    if (fault) throw fault;
  };
  const env = await startEnvironment(), directory = join(env.dir, 'apps'), root = resolve('experiments/generated/participation-app');
  await build({ root: resolve('src/browser'), logLevel: 'silent', build: { outDir: root, emptyOutDir: true } });
  const host = new ApplicationHost(directory, new LocalAccounts(env.url, directory)), service = await startApplicationService(host, { staticRoot: root });
  const browser = await chromium.launch(), first = await browser.newContext(), second = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const a = await first.newPage(), b = await second.newPage(), api = new AtseqClient(service.url);
  a.setDefaultTimeout(5000); b.setDefaultTimeout(5000);
  const errors: string[] = []; a.on('pageerror', e => errors.push(e.message)); b.on('pageerror', e => errors.push(e.message));
  const fixture = await guitarFixture(), sourcePath = join(env.dir, 'guitar.car'); await writeFile(sourcePath, await fixture.bundle.write());
  let invitation: { app: string; genesis: string };
  try {
    await check('CLI preview opens the same source in the browser without publication', async () => {
      const preview = await cli({ operation: 'preview', host: service.url, source: sourcePath });
      await a.goto(preview.previewUrl); await expect(a.getByRole('heading', { name: 'Weekend guitar search', exact: true })).toBeVisible();
      assert.equal((await api.call('list')).apps.length, 0);
      await expect(a.getByText('Draft · only here')).toBeVisible();
      await a.getByRole('button', { name: 'Try sample action', exact: true }).count();
    });
    await check('explicit identity and publication create an app once', async () => {
      await a.getByRole('button', { name: 'Start this app', exact: true }).click();
      await expect(a.getByRole('dialog')).toBeVisible();
      await a.getByRole('textbox', { name: 'Display name' }).fill('Alice'); await a.getByRole('button', { name: 'Continue', exact: true }).click();
      await first.setOffline(true); await a.getByRole('button', { name: 'Start this app', exact: true }).click();
      await expect(a.getByRole('status')).toContainText('Draft retained'); assert.equal((await api.call('list')).apps.length, 0);
      await first.setOffline(false);
      let lost = false;
      await a.route('**/xrpc/test.atseq.create', async route => { if (lost) { await route.continue(); return; } lost = true; const reply = await route.fetch(); assert.equal(reply.status(), 200); await route.abort(); });
      await a.getByRole('button', { name: 'Start this app', exact: true }).click();
      await expect.poll(async () => (await api.call('list')).apps.length).toBe(1); await expect(a.getByRole('status')).toContainText('Draft retained');
      await a.getByRole('button', { name: 'Start this app', exact: true }).click();
      await expect(a.getByRole('heading', { name: 'Participate', exact: true })).toBeVisible(); await a.unroute('**/xrpc/test.atseq.create');
      const apps = (await api.call('list')).apps; assert.equal(apps.length, 1); invitation = { app: apps[0].app, genesis: apps[0].genesis };
      assert.equal((await api.call('sync', invitation)).entries.length, 0);
    });
    const url = `${service.url}/#${new URLSearchParams(invitation!)}`;
    await check('another browser can read before creating a distinct signing identity', async () => {
      await b.goto(url); await expect(b.getByRole('heading', { name: 'Participate', exact: true })).toBeVisible();
      await expect(b.getByRole('button', { name: 'Create identity', exact: true })).toBeVisible();
      assert.equal((await api.call('sync', invitation!)).entries.length, 0);
      await b.getByRole('button', { name: 'candidate', exact: true }).click(); await b.getByRole('textbox', { name: 'Display name' }).fill('Bob');
      await b.getByRole('button', { name: 'Continue', exact: true }).click();
      await expect(b.getByRole('textbox', { name: 'id', exact: true })).toBeVisible();
    });
    await check('offline double click retains one signed intent across reload and reconnect', async () => {
      await second.setOffline(true);
      await b.getByRole('textbox', { name: 'id', exact: true }).fill('one'); await b.getByRole('textbox', { name: 'title', exact: true }).fill('First guitar'); await b.getByRole('spinbutton', { name: 'pricePence', exact: true }).fill('25000');
      await b.getByRole('button', { name: 'Save action', exact: true }).dblclick();
      await expect(b.getByText('Queued on device', { exact: true })).toBeVisible();
      assert.equal((await api.call('sync', invitation!)).entries.length, 0);
      // The page itself comes from the host in S4; cached inputs are persisted.
      // Reopen online, block submission, and inspect retained queue before retry.
      await b.route('**/xrpc/test.atseq.submit', route => route.abort()); await second.setOffline(false);
      await b.reload(); await expect(b.getByText('Queued on device', { exact: true })).toBeVisible();
      await b.unroute('**/xrpc/test.atseq.submit'); await b.getByRole('button', { name: 'Retry pending actions', exact: true }).click();
      await expect(b.getByText('Applied', { exact: true })).toBeVisible();
      assert.equal((await api.call('sync', invitation!)).entries.length, 1);
    });
    await check('a competing browser action is recorded with an honest ineffective outcome', async () => {
      await a.getByRole('button', { name: 'candidate', exact: true }).click();
      await a.getByRole('textbox', { name: 'id', exact: true }).fill('one'); await a.getByRole('textbox', { name: 'title', exact: true }).fill('Concurrent duplicate'); await a.getByRole('spinbutton', { name: 'pricePence', exact: true }).fill('26000');
      await a.getByRole('button', { name: 'Save action', exact: true }).click();
      await expect(a.getByText('Not applied', { exact: true })).toBeVisible(); await expect(a.getByText('already_listed', { exact: true })).toBeVisible();
      const history = await api.call('sync', invitation!); assert.equal(history.entries.length, 2); assert.notEqual(history.entries[0].signedIntent.intent.actorKey, history.entries[1].signedIntent.intent.actorKey);
    });
    await check('CLI uses a third private key and keeps exact retry bytes in a file', async () => {
      const keyFile = join(env.dir, 'cli-key.json'), intentFile = join(env.dir, 'cli-intent.json');
      const identity = await cli({ operation: 'identity', keyFile, name: 'Agent' }); assert.equal((await stat(keyFile)).mode & 0o777, 0o600);
      const input = { operation: 'submit', host: service.url, ...invitation!, definition: fixture.bundle.root, keyFile, intentFile, action: fixture.action, payload: { id: 'two', title: 'CLI guitar', pricePence: 30000 } };
      const invalidPath = join(env.dir, 'invalid-intent.json');
      await assert.rejects(() => cli({ ...input, intentFile: invalidPath, payload: { id: 'bad' } }));
      await assert.rejects(() => stat(invalidPath), { code: 'ENOENT' });
      const submitted = await cli(input), retained = await readFile(intentFile); assert.equal(submitted.receipt.position, 3);
      assert.equal((await cli(input)).receipt.position, 3); assert.deepEqual(await readFile(intentFile), retained);
      const receipt = await cli({ operation: 'outcome', host: service.url, ...invitation!, intent: submitted.intent }); assert.equal(receipt.outcome.$type, 'test.atseq.defs#effective');
      const history = await api.call('sync', invitation!); assert.ok(history.entries.slice(0, 2).every((e: any) => e.signedIntent.intent.actorKey !== identity.publicKey));
    });
    await check('narrow layout remains usable with keyboard focus and no script errors', async () => {
      await b.getByRole('button', { name: 'Refresh', exact: true }).click(); await expect(b.getByText('Entry 3 · Applied', { exact: true })).toBeVisible();
      assert.equal(await b.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await b.getByRole('button', { name: 'candidate', exact: true }).focus(); await b.keyboard.press('Enter'); await expect(b.getByRole('textbox', { name: 'id', exact: true })).toBeFocused();
      assert.deepEqual(errors, []);
      await mkdir('experiments/generated/participation-evidence', { recursive: true });
      await a.screenshot({ path: 'experiments/generated/participation-evidence/desktop.png', fullPage: true });
      await b.screenshot({ path: 'experiments/generated/participation-evidence/mobile.png', fullPage: true });
    });
    await check('lost submit reply reconciles the retained intent without a second append', async () => {
      let lost = false;
      await a.route('**/xrpc/test.atseq.submit', async route => {
        if (lost) { await route.continue(); return; }
        lost = true; const response = await route.fetch(); assert.equal(response.status(), 200); await route.abort();
      });
      await a.getByRole('button', { name: 'candidate', exact: true }).click();
      await a.getByRole('textbox', { name: 'id', exact: true }).fill('three'); await a.getByRole('textbox', { name: 'title', exact: true }).fill('Lost response'); await a.getByRole('spinbutton', { name: 'pricePence', exact: true }).fill('35000');
      await a.getByRole('button', { name: 'Save action', exact: true }).click();
      await expect(a.getByText('Applied', { exact: true })).toBeVisible(); assert.equal(lost, true);
      await a.unroute('**/xrpc/test.atseq.submit'); await a.getByRole('button', { name: 'Retry pending actions', exact: true }).click();
      assert.equal((await api.call('sync', invitation!)).entries.length, 4);
    });
    await check('transport refusal retains the original signed work and invents no entry', async () => {
      await a.route('**/xrpc/test.atseq.submit', route => route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'InvalidRequest', message: 'Fixture transport refusal' }) }));
      await a.getByRole('button', { name: 'candidate', exact: true }).click();
      await a.getByRole('textbox', { name: 'id', exact: true }).fill('four'); await a.getByRole('textbox', { name: 'title', exact: true }).fill('Refused transport'); await a.getByRole('spinbutton', { name: 'pricePence', exact: true }).fill('36000');
      const refreshed = a.waitForResponse(response => new URL(response.url()).pathname === '/xrpc/test.atseq.sync'); await a.getByRole('button', { name: 'Refresh', exact: true }).click(); await refreshed;
      await expect(a.getByRole('textbox', { name: 'title', exact: true })).toHaveValue('Refused transport');
      await a.getByRole('button', { name: 'Save action', exact: true }).click();
      await expect(a.getByText('Transport refused · retained on device', { exact: true })).toBeVisible();
      assert.equal((await api.call('sync', invitation!)).entries.length, 4); await a.unroute('**/xrpc/test.atseq.submit');
    });
    await check('hostile template text stays text and rendering cannot sign or fetch external resources', async () => {
      const script = '<img src="https://outside.example.test/steal" onerror="window.hostileRan=true"><script>window.hostileRan=true</script>';
      const view = JSON.parse(new TextDecoder().decode(fixture.files['view.json']));
      const template = Object.values(view.records).find((record: any) => record.body) as any;
      template.body.node.props.children[0].props.children[0] = script;
      const files = { ...fixture.files, 'view.json': new TextEncoder().encode(JSON.stringify(view)) };
      const source = await SourceBundle.pack(fixture.manifest, files), original = await api.call('sync', invitation!);
      const created = await api.call('create', { source: bytes(await source.write()), activationKeys: original.genesis.activationKeys }, randomUUID());
      const hostile = { app: created.genesis.app, genesis: created.genesisCid.$link }, external: string[] = [];
      const reader = await browser.newContext(); const page = await reader.newPage(); page.setDefaultTimeout(5000);
      await page.addInitScript(() => { const original = crypto.subtle.sign.bind(crypto.subtle); (window as any).signatures = 0; crypto.subtle.sign = ((...args: any[]) => { (window as any).signatures++; return (original as any)(...args); }) as any; });
      page.on('request', request => { if (new URL(request.url()).origin !== service.url) external.push(request.url()); });
      try {
        await page.goto(`${service.url}/#${new URLSearchParams(hostile)}`); await expect(page.getByText(script, { exact: false })).toBeVisible();
        await page.getByRole('button', { name: 'Create identity', exact: true }).click();
        await page.getByRole('textbox', { name: 'Display name' }).fill('Hostile-view reader'); await page.getByRole('button', { name: 'Continue', exact: true }).click();
        await page.reload(); await expect(page.getByText(script, { exact: false })).toBeVisible();
        assert.equal(await page.evaluate(() => (window as any).hostileRan), undefined); assert.equal(await page.evaluate(() => (window as any).signatures), 0);
        assert.deepEqual(external, []); assert.equal((await api.call('sync', hostile)).entries.length, 0);
        // Unknown auto-submit properties cannot acquire the controller's signer.
        template.body.node.props.children[1].props.autoSubmit = true;
        const automatic = await SourceBundle.pack(fixture.manifest, { ...files, 'view.json': new TextEncoder().encode(JSON.stringify(view)) });
        const auto = await api.call('create', { source: bytes(await automatic.write()), activationKeys: original.genesis.activationKeys }, randomUUID());
        const target = { app: auto.genesis.app, genesis: auto.genesisCid.$link };
        await page.goto(`${service.url}/#${new URLSearchParams(target)}`); await expect(page.getByText(/View unavailable: Unsupported properties/)).toBeVisible();
        assert.equal(await page.evaluate(() => (window as any).signatures), 0); assert.equal((await api.call('sync', target)).entries.length, 0); assert.deepEqual(external, []);
      } finally { await reader.close(); }
    });
  } finally { await recordFlowEvidence('participation', results, { expectedCases: 10, browserVersion: browser.version(), isolatedBrowserIdentities: 2, separateCliKey: true }); await browser.close(); await service.close(); await env.close(); await resetDisposable(env.dir); }
});
