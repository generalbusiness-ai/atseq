import { readHostToken } from '../src/host/token.ts';
import test from 'node:test';
import { recordFlowEvidence, type MeasuredCase } from './helpers/evidence.ts';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { cli } from './helpers/cli.ts';
import { join, dirname } from 'node:path';
import { startEnvironment, resetDisposable } from '../tests/support/pds/environment.mjs';
import { P256PrivateKeyExportable } from '@atcute/crypto';
import { Sequencer } from '../src/host/sequencer.ts';
import { acquireWriterLease } from '../src/host/lease.ts';
import { NSID } from '../src/core/nsids.ts';
import { Anchor, headAt, positionKey, sequence, validateHead, type SignedIntent } from '../src/protocol/log.ts';
import { Folder } from '../src/application/folder.ts';
import { ApplicationHost } from '../src/host/application.ts';
import { LocalAccounts } from '../src/host/accounts.ts';
import { startApplicationService } from '../src/host/http.ts';
import { AtseqClient } from '../src/client/api.ts';
import { createIdentity, prepareIntent } from '../src/client/identity.ts';
import { bytes, decodeBlock, contentCid } from '../src/protocol/wire.ts';
import { chartFixture, guitarFixture } from '../testdata/apps/fixtures.ts';

test('human and agent participation on a real PDS', async (t) => {
  const results: MeasuredCase[] = [];
  const check = async (name: string, run: () => Promise<void>) => {
    let fault: unknown;
    await t.test(name, async () => {
      const started = performance.now();
      let passed = false;
      try {
        await run();
        passed = true;
      } catch (error) {
        fault = error;
        throw error;
      } finally {
        results.push({ name, passed, elapsedMs: Math.round(performance.now() - started) });
      }
    });
    if (fault) throw fault;
  };
  const env = await startEnvironment();
  const directory = join(env.dir, 'applications'),
    accounts = new LocalAccounts(env.url, directory);
  const host = new ApplicationHost(directory, accounts);
  let service = await startApplicationService(host);
  try {
    const api = new AtseqClient(service.url, await readHostToken(service.tokenFile)),
      fixture = await guitarFixture(),
      identity = await createIdentity('CLI test');
    const source = bytes(await fixture.bundle.write()),
      id = randomUUID();
    await check('source validation and preview publish nothing', async () => {
      assert.equal((await api.call('validateDraft', { source })).definition.cid, fixture.bundle.root);
      assert.deepEqual((await api.call('list')).apps, []);
      const emptyChart = await chartFixture();
      const preview = await api.call('preview', { source: bytes(await emptyChart.bundle.write()) });
      assert.equal(preview.views[0].error, undefined, 'Empty rainfall query must produce a valid initial view');
    });
    const created = await api.call('create', { source, activationKeys: [identity.publicKey] }, id),
      invitation = { app: created.genesis.app, genesis: created.genesisCid.$link };
    await check('creation retry returns one app and binds its content', async () => {
      assert.deepEqual(await api.call('create', { source, activationKeys: [identity.publicKey] }, id), created);
      await assert.rejects(
        () => api.call('create', { source, activationKeys: [created.genesis.sequencerKey] }, id),
        /creation_conflict/,
      );
      assert.equal((await api.call('list')).apps.length, 1);
    });
    const intent = await prepareIntent(identity, invitation, fixture.bundle.root, fixture.action, {
      id: 'one',
      title: 'A guitar',
      pricePence: 40000,
    });
    await check('shared service exposes recorded and then interpreted progress', async () => {
      const submitted = await api.call('submit', { block: bytes(new Uint8Array(intent.block)) });
      assert.equal(submitted.receipt.position, 1);
      assert.equal(submitted.frontier.position, 0);
      const receipt = await api.call('receipt', { ...invitation, intent: intent.cid });
      assert.equal(receipt.outcome.$type, 'ai.generalbusiness.atseq.defs#effective');
      assert.equal(receipt.frontier.position, 1);
      const sync = await api.call('sync', invitation);
      assert.equal(sync.entries.length, 1);
      const query = await api.call('query', { ...invitation, name: 'summary', params: '{}' });
      assert.equal(query.result.value.count, 1);
    });
    await check('routine host metadata and receipts do not export a full Folder projection', async () => {
      const full = t.mock.method(Folder.prototype, 'snapshot', () => {
        throw new Error('Routine host read requested complete projection');
      });
      const catchUp = t.mock.method(Folder.prototype, 'catchUpVerified', () => {
        throw new Error('Routine host refresh requested complete projection');
      });
      try {
        const retry = await api.call('create', { source, activationKeys: [identity.publicKey] }, id);
        assert.equal(retry.genesisCid.$link, invitation.genesis);
        assert.equal((await api.call('describe', invitation)).frontier.position, 1);
        const submitted = await api.call('submit', { block: bytes(new Uint8Array(intent.block)) });
        assert.equal(submitted.receipt.position, 1);
        assert.equal(submitted.frontier.position, 1);
        const receipt = await api.call('receipt', { ...invitation, intent: intent.cid });
        assert.equal(receipt.outcome.$type, 'ai.generalbusiness.atseq.defs#effective');
        assert.equal(receipt.frontier.position, 1);
        assert.equal((await api.call('query', { ...invitation, name: 'summary', params: '{}' })).result.value.count, 1);
      } finally {
        catchUp.mock.restore();
        full.mock.restore();
      }
    });
    await check('reads after confirmation pass an older held interpretation refresh', async () => {
      let release!: () => void, entered!: () => void;
      const held = new Promise<void>((resolve) => (release = resolve)),
        reached = new Promise<void>((resolve) => (entered = resolve));
      const original = Folder.prototype.catchUpVerifiedStatus;
      let once = true;
      const spy = t.mock.method(
        Folder.prototype,
        'catchUpVerifiedStatus',
        async function (this: Folder, history: Parameters<Folder['catchUpVerifiedStatus']>[0]) {
          if (once && history.head.position === 1) {
            once = false;
            entered();
            await held;
          }
          return original.call(this, history);
        },
      );
      try {
        const older = api.call('describe', invitation);
        await reached;
        const next = await prepareIntent(identity, invitation, fixture.bundle.root, fixture.action, {
          id: 'confirmed-race',
          title: 'Confirmed during refresh',
          pricePence: 10000,
        });
        assert.equal((await api.call('submit', { block: bytes(new Uint8Array(next.block)) })).receipt.position, 2);
        const receipt = api.call('receipt', { ...invitation, intent: next.cid }),
          description = api.call('describe', invitation),
          query = api.call('query', { ...invitation, name: 'summary', params: '{}' });
        release();
        assert.equal((await receipt).receipt.position, 2);
        assert.equal((await description).head.position, 2);
        assert.equal((await query).result.value.count, 2);
        assert.ok((await older).head.position >= 1);
      } finally {
        release();
        spy.mock.restore();
      }
    });
    await check('reads do not chase appends arriving during every interpretation refresh', async () => {
      let refreshes = 0;
      const original = Folder.prototype.catchUpVerified;
      const spy = t.mock.method(
        Folder.prototype,
        'catchUpVerified',
        async function (this: Folder, history: Parameters<Folder['catchUpVerified']>[0]) {
          refreshes++;
          const result = await original.call(this, history);
          if (refreshes <= 4) {
            const next = await prepareIntent(identity, invitation, fixture.bundle.root, fixture.action, {
              id: 'steady-' + refreshes,
              title: 'Arrives during refresh',
              pricePence: 10000,
            });
            await api.call('submit', { block: bytes(new Uint8Array(next.block)) });
          }
          return result;
        },
      );
      try {
        assert.equal((await api.call('describe', invitation)).head.position, 2);
        assert.equal(refreshes, 1, 'the call returns at its captured floor despite a newer confirmed append');
      } finally {
        spy.mock.restore();
      }
    });
    await check('host restart restores the same app and interpreted history', async () => {
      await service.close();
      const broken = randomUUID();
      await mkdir(join(directory, broken));
      await writeFile(join(directory, broken, 'creation-secret.json'), '{broken');
      const restored = new ApplicationHost(directory, accounts);
      await restored.restore();
      assert.equal(Object.keys(restored.restorationFailures()).length, 1);
      assert.equal(restored.restorationFailures()[broken]?.code, 'runtime_fault');
      service = await startApplicationService(restored);
      const after = new AtseqClient(service.url, await readHostToken(service.tokenFile));
      const receipt = await after.call('receipt', { ...invitation, intent: intent.cid });
      assert.equal(receipt.receipt.position, 1);
      assert.equal((await after.call('list')).apps.length, 1);
    });
    await check('concurrent reads and submissions report coherent heads and frontiers', async () => {
      const client = new AtseqClient(service.url, await readHostToken(service.tokenFile));
      const pending = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          prepareIntent(identity, invitation, fixture.bundle.root, fixture.action, {
            id: `race-${i}`,
            title: 'Concurrent request',
            pricePence: 10000,
          }),
        ),
      );
      const results = await Promise.all(
        pending.flatMap((intent) => [
          client.call('submit', { block: bytes(new Uint8Array(intent.block)) }),
          client.call('describe', invitation),
          client.call('query', { ...invitation, name: 'summary', params: '{}' }),
        ]),
      );
      for (const response of results) assert.ok(response.frontier.position <= response.head.position);
      assert.equal((await client.call('sync', invitation)).entries.length, 8);
    });
    await check('documented CLI packs, validates and creates the same immutable source', async () => {
      const root = join(env.dir, 'authored'),
        output = join(env.dir, 'authored.car'),
        keyFile = join(env.dir, 'author-key.json');
      await mkdir(root);
      await writeFile(join(root, 'manifest.json'), JSON.stringify(fixture.manifest));
      for (const [path, data] of Object.entries(fixture.files)) {
        await mkdir(dirname(join(root, path)), { recursive: true });
        await writeFile(join(root, path), data);
      }
      const packed = await cli({ operation: 'pack', directory: root, output });
      assert.equal(packed.definition, fixture.bundle.root);
      const checked = await cli({
        operation: 'validate',
        host: service.url,
        hostTokenFile: service.tokenFile,
        source: output,
      });
      assert.equal(checked.definition.cid, fixture.bundle.root);
      await cli({ operation: 'identity', keyFile, name: 'Source author' });
      const input = {
        operation: 'create',
        host: service.url,
        hostTokenFile: service.tokenFile,
        source: output,
        keyFile,
        creationId: randomUUID(),
      };
      const created = await cli(input);
      assert.deepEqual((await cli(input)).genesisCid, created.genesisCid);
    });
  } finally {
    await recordFlowEvidence('host-flows', results, {
      expectedCases: 8,
      pdsVersion: '0.5.31',
      transport: 'real HTTP and SQLite',
    });
    await service.close();
    await env.close();
    await resetDisposable(env.dir);
  }
});

test('HTTP receipts retain crash recovery and externally confirmed heads across rollback', async (t) => {
  const env = await startEnvironment(),
    directory = join(env.dir, 'receipt-checkpoints'),
    accounts = new LocalAccounts(env.url, directory),
    id = randomUUID(),
    fixture = await guitarFixture(),
    identity = await createIdentity('Checkpoint owner');
  let host = new ApplicationHost(directory, accounts),
    service: Awaited<ReturnType<typeof startApplicationService>> | undefined = await startApplicationService(host);
  const client = async () => new AtseqClient(service!.url, await readHostToken(service!.tokenFile));
  const close = async () => {
    const closing = service;
    service = undefined;
    await closing?.close();
  };
  const restart = async () => {
    host = new ApplicationHost(directory, accounts);
    await host.restore();
    service = await startApplicationService(host);
  };
  try {
    const api = await client(),
      created = await api.call(
        'create',
        {
          source: bytes(await fixture.bundle.write()),
          activationKeys: [identity.publicKey],
        },
        id,
      ),
      invitation = { app: created.genesis.app, genesis: created.genesisCid.$link };
    const intent = (name: string) =>
      prepareIntent(identity, invitation, fixture.bundle.root, fixture.action, {
        id: name,
        title: name,
        pricePence: 100,
      });
    const first = await intent('first');
    await api.call('submit', { block: bytes(new Uint8Array(first.block)) });
    const second = await intent('crashed');
    let checkpoints = 0;
    const checkpoint = Sequencer.prototype.checkpoint;
    const crash = t.mock.method(Sequencer.prototype, 'checkpoint', function (this: Sequencer) {
      if (++checkpoints === 2) throw new Error('Fixture crash before confirmation checkpoint');
      return checkpoint.call(this);
    });
    try {
      await assert.rejects(() => api.call('submit', { block: bytes(new Uint8Array(second.block)) }), {
        status: 503,
        code: 'runtime_fault',
        permanent: false,
      });
    } finally {
      crash.mock.restore();
    }
    await close();
    const retainedPosition = () => {
      const lease = acquireWriterLease(join(directory, id, 'writer'), invitation.app);
      try {
        return (lease.readHead() as { position: number }).position;
      } finally {
        lease.close();
      }
    };
    assert.equal(retainedPosition(), 1, 'the simulated crash left confirmation uncheckpointed');
    await restart();
    const recovered = await client();
    assert.equal((await recovered.call('receipt', { ...invitation, intent: second.cid })).receipt.position, 2);
    await close();
    assert.equal(retainedPosition(), 2, 'restore and HTTP receipt retain the confirmed crash recovery');
    await restart();
    const pds = await accounts.open(id),
      previous = (await pds.get(NSID.head, 'self')).value;
    const record = JSON.parse(await readFile(join(directory, id, 'creation-secret.json'), 'utf8')),
      writer = await P256PrivateKeyExportable.importRaw(new Uint8Array(record.writer)),
      anchor = await Anchor.from(created.genesis, invitation),
      third = await intent('external');
    validateHead(previous, anchor);
    const entry = await sequence(
        decodeBlock(new Uint8Array(third.block)) as unknown as SignedIntent,
        anchor,
        previous,
        writer,
      ),
      head = headAt(anchor, entry.position, await contentCid(entry));
    await pds.applyConditional(
      [
        {
          $type: 'com.atproto.repo.applyWrites#create',
          collection: NSID.entry,
          rkey: positionKey(entry.position),
          value: entry,
        },
        { $type: 'com.atproto.repo.applyWrites#update', collection: NSID.head, rkey: 'self', value: head },
      ],
      (await pds.latestCommit()).cid,
    );
    assert.equal((await (await client()).call('receipt', { ...invitation, intent: third.cid })).receipt.position, 3);
    await close();
    assert.equal(retainedPosition(), 3, 'HTTP polling checkpoints a new verified head without a host append');
    await pds.applyConditional(
      [
        { $type: 'com.atproto.repo.applyWrites#delete', collection: NSID.entry, rkey: positionKey(entry.position) },
        { $type: 'com.atproto.repo.applyWrites#update', collection: NSID.head, rkey: 'self', value: previous },
      ],
      (await pds.latestCommit()).cid,
    );
    await restart();
    assert.equal(host.restorationFailures()[id]?.code, 'rollback');
    assert.deepEqual(host.list(), []);
  } finally {
    await close();
    await host.close();
    await env.close();
    await resetDisposable(env.dir);
  }
});
