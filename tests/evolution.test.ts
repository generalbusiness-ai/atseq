import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { chromium, expect } from '@playwright/test';
import { fromBytes } from '@atcute/cbor';
import { build } from 'vite';
import { startEnvironment, resetDisposable } from '../experiments/pds/environment.mjs';
import { ApplicationHost } from '../src/host/application.ts';
import { LocalAccounts } from '../src/host/accounts.ts';
import { startApplicationService } from '../src/host/http.ts';
import { AtseqClient } from '../src/client/api.ts';
import { createIdentity, prepareIntent } from '../src/client/identity.ts';
import { bytes, encodeBlock } from '../src/protocol/wire.ts';
import { ACTIVATE } from '../src/definition/control.ts';
import { SourceBundle, SourcePool } from '../src/definition/source.ts';
import { Anchor } from '../src/protocol/log.ts';
import { Folder } from '../src/runtime/folder.ts';
import { guitarEvolution, oversizedClosure } from '../testdata/apps/evolution.ts';
import { cli } from './helpers/cli.ts';
import { recordFlowEvidence, type MeasuredCase } from './helpers/evidence.ts';

test('evolve a real app and explicitly replace its stale pending work', async t => {
  const results: MeasuredCase[] = [];
  const check = async (name: string, run: () => Promise<void>) => {
    let fault: unknown;
    await t.test(name, async () => { const started = performance.now(); let passed = false; try { await run(); passed = true; } catch (error) { fault = error; throw error; } finally { results.push({ name, passed, elapsedMs: Math.round(performance.now() - started) }); } });
    if (fault) throw fault;
  };
  const env = await startEnvironment(), directory = join(env.dir, 'apps'), root = resolve('experiments/generated/evolution-app');
  await build({ root: resolve('src/browser'), logLevel: 'silent', build: { outDir: root, emptyOutDir: true } });
  const accounts = new LocalAccounts(env.url, directory), host = new ApplicationHost(directory, accounts);
  let service = await startApplicationService(host, { staticRoot: root }), api = new AtseqClient(service.url);
  const browser = await chromium.launch(), ownerContext = await browser.newContext(), guestContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const owner = await ownerContext.newPage(), guest = await guestContext.newPage(); owner.setDefaultTimeout(5000); guest.setDefaultTimeout(5000);
  const errors: string[] = []; owner.on('pageerror', e => errors.push(e.message)); guest.on('pageerror', e => errors.push(e.message));
  const fixture = await guitarEvolution(), nextPath = join(env.dir, 'next.car'); await writeFile(nextPath, await fixture.bundle.write());
  const keyFile = join(env.dir, 'update-key.json'), intentFile = join(env.dir, 'waiting-update.json');
  let oldPending: any, originalPrepared: Buffer, prepared: any;
  try {
    await owner.goto(service.url); await owner.getByRole('button', { name: 'Create identity', exact: true }).click();
    await owner.getByRole('textbox', { name: 'Display name' }).fill('App author'); await owner.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(owner.getByText('App author · this device', { exact: true })).toBeVisible();
    const browserKey = await owner.evaluate(() => new Promise<string>((done, reject) => {
      const request = indexedDB.open('atseq-device-v0'); request.onerror = () => reject(request.error);
      request.onsuccess = () => { const db = request.result, read = db.transaction('values').objectStore('values').get('identity'); read.onsuccess = () => { done(read.result.publicKey); db.close(); }; };
    }));
    const cliIdentity = await cli({ operation: 'identity', keyFile, name: 'Update agent' }); assert.notEqual(cliIdentity.publicKey, browserKey);
    // Two explicit initial grants; neither actor obtains authority merely by creating an account.
    const creationId = randomUUID();
    const created = await api.call('create', { source: bytes(await fixture.old.bundle.write()), activationKeys: [browserKey, cliIdentity.publicKey] }, creationId);
    const invitation = { app: created.genesis.app, genesis: created.genesisCid.$link }, url = `${service.url}/#${new URLSearchParams(invitation)}`;
    await owner.goto(url); await expect(owner.getByRole('heading', { name: 'Participate', exact: true })).toBeVisible();
    await check('ordinary state is retained while another browser queues an old-definition act', async () => {
      await owner.getByRole('button', { name: 'Add candidate', exact: true }).click();
      await owner.getByRole('textbox', { name: 'id', exact: true }).fill('one'); await owner.getByRole('textbox', { name: 'title', exact: true }).fill('First candidate'); await owner.getByRole('spinbutton', { name: 'pricePence', exact: true }).fill('10000');
      await owner.getByRole('button', { name: 'Save action', exact: true }).click(); await expect(owner.getByText('Applied', { exact: true })).toBeVisible();
      await guest.goto(url); await guest.getByRole('button', { name: 'Add candidate', exact: true }).click();
      await guest.getByRole('textbox', { name: 'Display name' }).fill('Participant'); await guest.getByRole('button', { name: 'Continue', exact: true }).click();
      await guestContext.setOffline(true);
      await guest.getByRole('textbox', { name: 'id', exact: true }).fill('two'); await guest.getByRole('textbox', { name: 'title', exact: true }).fill('Queued before update'); await guest.getByRole('spinbutton', { name: 'pricePence', exact: true }).fill('20000');
      await guest.getByRole('button', { name: 'Save action', exact: true }).click(); await expect(guest.getByText('Queued on device', { exact: true })).toBeVisible();
      oldPending = await guest.evaluate(() => new Promise<any>((done, reject) => {
        const request = indexedDB.open('atseq-device-v0'); request.onerror = () => reject(request.error);
        request.onsuccess = () => { const db = request.result, read = db.transaction('values').objectStore('values').openCursor(); read.onsuccess = () => { const cursor = read.result; if (!cursor) { reject(new Error('No outbox item')); db.close(); return; } if (String(cursor.key).startsWith('outbox:')) { done(cursor.value); db.close(); } else cursor.continue(); }; };
      }));
      assert.equal(oldPending.signed.intent.definition.$link, fixture.old.bundle.root); assert.equal((await api.call('sync', invitation)).entries.length, 1);
    });
    await check('comparison works locally and an ungranted browser cannot apply', async () => {
      await guest.getByLabel('Import updated definition CAR', { exact: true }).setInputFiles(nextPath);
      await expect(guest.getByText('State schema matches · existing prefix replays · current data is preserved', { exact: true })).toBeVisible();
      await expect(guest.getByRole('button', { name: 'Apply change', exact: true })).toBeDisabled();
      await owner.getByLabel('Import updated definition CAR', { exact: true }).setInputFiles(nextPath);
      await expect(owner.getByRole('button', { name: 'Apply change', exact: true })).toBeEnabled();
      assert.equal((await api.call('describe', invitation)).definition.cid, fixture.old.bundle.root);
    });
    const activation = { expected: fixture.old.bundle.root, definition: fixture.bundle.root, closure: fixture.bundle.identities().sort() };
    const submitOld = { operation: 'submit', host: service.url, ...invitation, definition: fixture.old.bundle.root, keyFile, intentFile, action: ACTIVATE, payload: activation };
    await check('CLI staging and preparing an activation do not activate it', async () => {
      const staged = await cli({ operation: 'stage', host: service.url, ...invitation, expected: fixture.old.bundle.root, source: nextPath }); assert.equal(staged.candidate.cid, fixture.bundle.root);
      prepared = await cli({ ...submitOld, operation: 'prepare' }); originalPrepared = await readFile(intentFile);
      assert.equal((await api.call('sync', invitation)).entries.length, 1); assert.equal((await api.call('describe', invitation)).definition.cid, fixture.old.bundle.root);
    });
    await check('explicit Apply records the boundary and preserves existing data', async () => {
      await owner.getByRole('button', { name: 'Apply change', exact: true }).click();
      await expect(owner.getByRole('heading', { name: 'Weekend guitar shortlist', exact: true })).toBeVisible();
      const current = await api.call('describe', invitation); assert.equal(current.definition.cid, fixture.bundle.root); assert.equal(current.frontier.position, 2);
      const summary = await api.call('query', { ...invitation, name: 'summary', params: '{}' }); assert.deepEqual(summary.result.value, { count: 1, selected: '' });
      const query = await api.call('query', { ...invitation, name: 'selection', params: '{}' }); assert.deepEqual(query.result.value, { selected: '' });
    });
    await check('a prepared activation racing from the same old definition is ineffective', async () => {
      const submitted = await cli(submitOld); assert.equal(submitted.intent, prepared.intent); assert.equal(submitted.receipt.position, 3); assert.deepEqual(await readFile(intentFile), originalPrepared);
      const receipt = await api.call('receipt', { ...invitation, intent: submitted.intent }); assert.deepEqual(receipt.outcome, { $type: 'test.atseq.defs#ineffective', reason: 'definition_changed' });
      assert.equal((await api.call('describe', invitation)).definition.cid, fixture.bundle.root);
    });
    await check('reconnecting delivers the old signed intent unchanged exactly once', async () => {
      await guestContext.setOffline(false); await expect(guest.getByText('Not applied', { exact: true })).toBeVisible();
      await expect(guest.getByText('definition_changed', { exact: true })).toBeVisible();
      const history = await api.call('sync', invitation); assert.equal(history.entries.length, 4);
      assert.deepEqual([...encodeBlock(history.entries[3].signedIntent)], oldPending.block);
      await guest.getByRole('button', { name: 'Retry pending actions', exact: true }).click(); assert.equal((await api.call('sync', invitation)).entries.length, 4);
    });
    await check('review preserves entered values and signs a replacement only on Save', async () => {
      await guest.getByRole('button', { name: 'Review with updated form', exact: true }).click();
      await expect(guest.getByRole('textbox', { name: 'title', exact: true })).toHaveValue('Queued before update'); assert.equal((await api.call('sync', invitation)).entries.length, 4);
      await guest.getByRole('button', { name: 'Save action', exact: true }).click(); await expect(guest.getByText('Applied', { exact: true })).toBeVisible();
      const history = await api.call('sync', invitation); assert.equal(history.entries.length, 5); assert.equal(history.entries[4].signedIntent.intent.definition.$link, fixture.bundle.root);
      assert.notDeepEqual(history.entries[4].signedIntent.intent.nonce, oldPending.signed.intent.nonce);
      assert.equal(history.entries.filter((e: any) => JSON.stringify(e.signedIntent.intent.nonce) === JSON.stringify(oldPending.signed.intent.nonce)).length, 1);
    });
    await check('the new action, query and view use the preserved state', async () => {
      await owner.getByRole('button', { name: 'Refresh', exact: true }).click(); await expect(owner.getByText('Entry 5 · Applied', { exact: true })).toBeVisible();
      await owner.getByRole('button', { name: 'Select a candidate', exact: true }).click(); await owner.getByRole('textbox', { name: 'id', exact: true }).fill('two');
      await owner.getByRole('button', { name: 'Save action', exact: true }).click(); await expect(owner.getByText('Selected: two', { exact: true })).toBeVisible();
      const query = await api.call('query', { ...invitation, name: 'selection', params: '{}' }); assert.deepEqual(query.result.value, { selected: 'two' }); assert.equal(query.frontier.position, 6);
    });
    await check('offline queue order preserves add-then-select dependencies', async () => {
      await guest.getByRole('button', { name: 'Refresh', exact: true }).click(); await expect(guest.getByText('Selected: two', { exact: true })).toBeVisible();
      await guestContext.setOffline(true);
      await guest.getByRole('button', { name: 'candidate', exact: true }).click();
      await guest.getByRole('textbox', { name: 'id', exact: true }).fill('three'); await guest.getByRole('textbox', { name: 'title', exact: true }).fill('Queued in order'); await guest.getByRole('spinbutton', { name: 'pricePence', exact: true }).fill('30000');
      await guest.getByRole('button', { name: 'Save action', exact: true }).click(); await expect(guest.getByText('Queued on device', { exact: true })).toBeVisible();
      await guest.getByRole('button', { name: 'Select a candidate', exact: true }).click(); await guest.getByRole('textbox', { name: 'id', exact: true }).fill('three'); await guest.getByRole('button', { name: 'Save action', exact: true }).click();
      await expect(guest.getByRole('heading', { name: 'Pending preview', exact: true }).locator('..').locator('pre')).toContainText('"selected": "three"');
      assert.equal((await api.call('sync', invitation)).entries.length, 6);
      await guestContext.setOffline(false); await expect(guest.getByText('Selected: three', { exact: true })).toBeVisible();
      const history = await api.call('sync', invitation); assert.equal(history.entries.length, 8);
      assert.equal(history.entries[6].signedIntent.intent.action, fixture.old.action); assert.equal(history.entries[7].signedIntent.intent.action, fixture.action);
    });
    await check('a recorded unauthorized activation is refused under the fixed grant', async () => {
      const outsider = await createIdentity('Ungrantable by proposal'), intent = await prepareIntent(outsider, invitation, fixture.bundle.root, ACTIVATE, { expected: fixture.bundle.root, definition: fixture.old.bundle.root, closure: fixture.old.bundle.identities().sort() });
      const submitted = await api.call('submit', { block: bytes(new Uint8Array(intent.block)) }); assert.equal(submitted.receipt.position, 9);
      const receipt = await api.call('receipt', { ...invitation, intent: intent.cid }); assert.deepEqual(receipt.outcome, { $type: 'test.atseq.defs#ineffective', reason: 'unauthorized_activation' });
      assert.equal((await api.call('describe', invitation)).definition.cid, fixture.bundle.root);
    });
    await check('an incompatible proposal preserves the app and current data', async () => {
      const schema = JSON.parse(new TextDecoder().decode(fixture.files['schemas/data.json'])); schema.defs.state.properties.selected.maxLength = 119;
      const source = await SourceBundle.pack(fixture.manifest, { ...fixture.files, 'schemas/data.json': new TextEncoder().encode(JSON.stringify(schema)) });
      const path = join(env.dir, 'incompatible.car'); await writeFile(path, await source.write());
      await owner.getByLabel('Import updated definition CAR', { exact: true }).setInputFiles(path);
      await expect(owner.getByRole('status')).toContainText('same runtime and complete state schema');
      assert.equal((await api.call('sync', invitation)).entries.length, 9); assert.equal((await api.call('query', { ...invitation, name: 'selection', params: '{}' })).result.value.selected, 'three');
      assert.deepEqual(errors, []);
      await mkdir('experiments/generated/evolution-evidence', { recursive: true }); await owner.screenshot({ path: 'experiments/generated/evolution-evidence/updated.png', fullPage: true }); await guest.screenshot({ path: 'experiments/generated/evolution-evidence/reviewed.png', fullPage: true });
    });
    await check('sync delivers an oversized closure so host, CLI and fresh browser agree and continue', async () => {
      const { first, second, closure } = await oversizedClosure(fixture);
      for (const [index, bundle] of [first, second].entries()) {
        const path = join(env.dir, `large-${index}.car`); await writeFile(path, await bundle.write());
        await cli({ operation: 'stage', host: service.url, ...invitation, expected: fixture.bundle.root, source: path });
      }
      const bad = await cli({ operation: 'activate', host: service.url, ...invitation, definition: fixture.bundle.root, candidate: first.root, closure, keyFile, intentFile: join(env.dir, 'oversized-intent.json') });
      assert.equal((await api.call('receipt', { ...invitation, intent: bad.intent })).outcome.reason, 'invalid_activation');
      const good = await cli({ operation: 'submit', host: service.url, ...invitation, definition: fixture.bundle.root, action: fixture.action, payload: { id: 'one' }, keyFile, intentFile: join(env.dir, 'after-oversized.json') });
      assert.equal(good.receipt.position, 11);
      const retained = await api.call('sync', invitation);
      assert.ok(retained.candidates.some((c: any) => fromBytes(c.source).length > 512 * 1024));
      const pool = new SourcePool(); await pool.add(await SourceBundle.read(fromBytes(retained.source)));
      for (const candidate of retained.candidates) await pool.add(await SourceBundle.readClosure(fromBytes(candidate.source)));
      const replay = await Folder.open(await Anchor.from(retained.genesis, retained.genesisCid), pool);
      const snapshot = await replay.catchUp(retained.head, retained.entries);
      assert.equal(snapshot.stalled, undefined);
      assert.deepEqual(snapshot.projection, JSON.parse(await readFile(join(directory, creationId, 'projection.json'), 'utf8')));
      assert.deepEqual(snapshot.projection.outcomes.slice(-2).map(o => o.outcome), [
        { $type: 'test.atseq.defs#ineffective', reason: 'invalid_activation' }, { $type: 'test.atseq.defs#effective' },
      ]);
      const fresh = await browser.newPage();
      try {
        await fresh.goto(url);
        await expect(fresh.getByText('Selected: one', { exact: true })).toBeVisible();
        await expect(fresh.getByText('Entry 11 · Applied', { exact: true })).toBeVisible();
        const failed = fresh.getByText('Entry 10 · Not applied', { exact: true }).locator('..');
        await failed.locator('summary').click();
        await expect(failed.locator('pre')).toContainText('"reason": "invalid_activation"');
        await expect(fresh.getByRole('button', { name: 'Create identity', exact: true })).toBeVisible();
      } finally { await fresh.close(); }
    });
    await check('restarting the host rebuilds the active definition and every outcome', async () => {
      await service.close(); const restored = new ApplicationHost(directory, accounts); await restored.restore(); service = await startApplicationService(restored, { staticRoot: root }); api = new AtseqClient(service.url);
      const description = await api.call('describe', invitation); assert.equal(description.definition.cid, fixture.bundle.root); assert.equal(description.frontier.position, 11);
      assert.equal((await api.call('query', { ...invitation, name: 'selection', params: '{}' })).result.value.selected, 'one');
      const receipt = await api.call('receipt', { ...invitation, intent: prepared.intent }); assert.equal(receipt.outcome.reason, 'definition_changed');
    });
  } finally { await recordFlowEvidence('evolution', results, { expectedCases: 13, browserVersion: browser.version(), sourcePairs: 2 }); await browser.close(); await service.close(); await env.close(); await resetDisposable(env.dir); }
});
