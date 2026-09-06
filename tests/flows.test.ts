import test from 'node:test';
import { recordFlowEvidence, type MeasuredCase } from './helpers/evidence.ts';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { cli } from './helpers/cli.ts';
import { join, dirname } from 'node:path';
import { startEnvironment, resetDisposable } from '../experiments/pds/environment.mjs';
import { ApplicationHost } from '../src/host/application.ts';
import { LocalAccounts } from '../src/host/accounts.ts';
import { startApplicationService } from '../src/host/http.ts';
import { AtseqClient } from '../src/client/api.ts';
import { createIdentity, prepareIntent } from '../src/client/identity.ts';
import { bytes } from '../src/protocol/wire.ts';
import { chartFixture, guitarFixture } from '../testdata/apps/fixtures.ts';

test('human and agent participation on a real PDS', async t => {
  const results: MeasuredCase[] = [];
  const check = async (name: string, run: () => Promise<void>) => {
    let fault: unknown;
    await t.test(name, async () => { const started = performance.now(); let passed = false; try { await run(); passed = true; } catch (error) { fault = error; throw error; } finally { results.push({ name, passed, elapsedMs: Math.round(performance.now() - started) }); } });
    if (fault) throw fault;
  };
  const env = await startEnvironment();
  const directory = join(env.dir, 'applications'), accounts = new LocalAccounts(env.url, directory);
  const host = new ApplicationHost(directory, accounts);
  let service = await startApplicationService(host);
  try {
    const api = new AtseqClient(service.url), fixture = await guitarFixture(), identity = await createIdentity('CLI test');
    const source = bytes(await fixture.bundle.write()), id = randomUUID();
    await check('source validation and preview publish nothing', async () => {
      assert.equal((await api.call('validateDraft', { source })).definition.cid, fixture.bundle.root);
      assert.deepEqual((await api.call('list')).apps, []);
      const emptyChart = await chartFixture();
      const preview = await api.call('preview', { source: bytes(await emptyChart.bundle.write()) });
      assert.equal(preview.views[0].error, undefined, 'Empty rainfall query must produce a valid initial view');
    });
    const created = await api.call('create', { source, activationKeys: [identity.publicKey] }, id), invitation = { app: created.genesis.app, genesis: created.genesisCid.$link };
    await check('creation retry returns one app and binds its content', async () => {
      assert.deepEqual(await api.call('create', { source, activationKeys: [identity.publicKey] }, id), created);
      await assert.rejects(() => api.call('create', { source, activationKeys: [created.genesis.sequencerKey] }, id), /creation_conflict/);
      assert.equal((await api.call('list')).apps.length, 1);
    });
    const intent = await prepareIntent(identity, invitation, fixture.bundle.root, fixture.action, { id: 'one', title: 'A guitar', pricePence: 40000 });
    await check('shared service exposes recorded and then interpreted progress', async () => {
      const submitted = await api.call('submit', { block: bytes(new Uint8Array(intent.block)) });
      assert.equal(submitted.receipt.position, 1); assert.equal(submitted.frontier.position, 0);
      const receipt = await api.call('receipt', { ...invitation, intent: intent.cid });
      assert.equal(receipt.outcome.$type, 'test.atseq.defs#effective'); assert.equal(receipt.frontier.position, 1);
      const sync = await api.call('sync', invitation); assert.equal(sync.entries.length, 1);
      const query = await api.call('query', { ...invitation, name: 'summary', params: '{}' }); assert.equal(query.result.value.count, 1);
    });
    await check('host restart restores the same app and interpreted history', async () => {
      await service.close();
      const restored = new ApplicationHost(directory, accounts); await restored.restore(); service = await startApplicationService(restored);
      const after = new AtseqClient(service.url);
      const receipt = await after.call('receipt', { ...invitation, intent: intent.cid }); assert.equal(receipt.receipt.position, 1);
      assert.equal((await after.call('list')).apps.length, 1);
    });
    await check('concurrent reads and submissions report coherent heads and frontiers', async () => {
      const client = new AtseqClient(service.url);
      const pending = await Promise.all(Array.from({ length: 5 }, (_, i) => prepareIntent(identity, invitation, fixture.bundle.root, fixture.action, { id: `race-${i}`, title: 'Concurrent request', pricePence: 10000 })));
      const results = await Promise.all(pending.flatMap(intent => [client.call('submit', { block: bytes(new Uint8Array(intent.block)) }), client.call('describe', invitation), client.call('query', { ...invitation, name: 'summary', params: '{}' })]));
      for (const response of results) assert.ok(response.frontier.position <= response.head.position);
      assert.equal((await client.call('sync', invitation)).entries.length, 6);
    });
    await check('documented CLI packs, validates and creates the same immutable source', async () => {
      const root = join(env.dir, 'authored'), output = join(env.dir, 'authored.car'), keyFile = join(env.dir, 'author-key.json');
      await mkdir(root); await writeFile(join(root, 'manifest.json'), JSON.stringify(fixture.manifest));
      for (const [path, data] of Object.entries(fixture.files)) { await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), data); }
      const packed = await cli({ operation: 'pack', directory: root, output }); assert.equal(packed.definition, fixture.bundle.root);
      const checked = await cli({ operation: 'validate', host: service.url, source: output }); assert.equal(checked.definition.cid, fixture.bundle.root);
      await cli({ operation: 'identity', keyFile, name: 'Source author' });
      const input = { operation: 'create', host: service.url, source: output, keyFile, creationId: randomUUID() };
      const created = await cli(input); assert.deepEqual((await cli(input)).genesisCid, created.genesisCid);
    });
  } finally { await recordFlowEvidence('host-flows', results, { expectedCases: 6, pdsVersion: '0.5.31', transport: 'real HTTP and SQLite' }); await service.close(); await env.close(); await resetDisposable(env.dir); }
});
