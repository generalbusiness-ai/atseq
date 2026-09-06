import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { mkdir, rm, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { P256PrivateKeyExportable } from '@atcute/crypto';
import { create, toString, CODEC_RAW } from '@atcute/cid';
import { fromUint8Array } from '@atcute/car';
import { startEnvironment, assertDisposable, resetDisposable } from '../experiments/pds/environment.mjs';
import { Anchor, headAt, positionKey, randomNonce, runtimeDescriptor, runtimeCid, sequence, signIntent, type Intent } from '../src/protocol/log.ts';
import { bytes, contentCid, encodeBlock, link } from '../src/protocol/wire.ts';
import { PdsClient } from '../src/host/pds.ts';
import { SourceStore } from '../src/host/source.ts';
import { provisionLog, readSnapshot, Sequencer } from '../src/host/sequencer.ts';
import { startFaultProxy } from './helpers/pds-faults.ts';
import { startWriter } from './helpers/writer-process.ts';

// No Docker availability skip: this starts the actual official PDS with SQLite.
test('real disposable PDS persistence and recovery', async t => {
  const results: { name: string; passed: boolean; elapsedMs: number }[] = [];
  let finalEntries: number | null = null;
  async function check(name: string, run: () => unknown) {
    await t.test(name, async () => {
      const start = performance.now(); let passed = false;
      try { await run(); passed = true; }
      finally { results.push({ name, passed, elapsedMs: Math.round(performance.now() - start) }); }
    });
  }
  const env = await startEnvironment();
  let sequencer: Sequencer | undefined;
  let child: Awaited<ReturnType<typeof startWriter>> | undefined;
  const proxy = await startFaultProxy(env.url);
  try {
    const response = await fetch(`${env.url}/xrpc/com.atproto.server.createAccount`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ handle: `atseq-${randomBytes(5).toString('hex')}.test`, email: 'atseq-test@example.test', password: randomBytes(24).toString('hex') }),
    });
    assert.equal(response.status, 200, 'Disposable account creation must succeed');
    const account = await response.json() as any;
    const pds = new PdsClient(env.url, account.did, account.accessJwt);
    const sources = new SourceStore(pds);
    const actor = await P256PrivateKeyExportable.createKeypair();
    const writer = await P256PrivateKeyExportable.createKeypair();
    const program = new TextEncoder().encode('S2 retained source fixture; this is not an S3 executable definition.');
    const programCid = toString(await create(CODEC_RAW, program));
    const definition = { purpose: 'S2 PDS transport fixture', program: programCid };
    const definitionCid = await contentCid(definition);
    await sources.put(programCid, program);
    await sources.put(definitionCid, encodeBlock(definition));
    await sources.put(await runtimeCid(), encodeBlock(runtimeDescriptor));
    const genesis = { $type: 'test.atseq.genesis', version: 0, app: account.did, profile: link(await runtimeCid()), definition: link(definitionCid), sequencerKey: await writer.exportPublicKey('did'), activationKeys: [await actor.exportPublicKey('did')] };
    const anchor = await Anchor.from(genesis, await contentCid(genesis));
    await provisionLog(pds, anchor);
    await check('genesis and initial head are a verified empty prefix', async () => {
      const snapshot = await readSnapshot(pds, anchor); assert.equal(snapshot.history.head.position, 0);
    });
    await check('provisioning refuses to replace an existing application log', async () => {
      const before = await readSnapshot(pds, anchor);
      await assert.rejects(() => provisionLog(pds, anchor), { code: 'already_provisioned' });
      assert.equal((await readSnapshot(pds, anchor)).commit, before.commit);
    });
    await check('source blobs are retained and recovered by exact CID', async () => {
      assert.deepEqual(await sources.get(programCid), program);
      assert.deepEqual(await sources.get(definitionCid), encodeBlock(definition));
      await sources.put(programCid, program);
      assert.equal((await pds.list('test.atseq.source')).length, 3);
    });
    await check('reset refuses a live or unmarked directory', async () => {
      await assert.rejects(() => resetDisposable(env.dir), /running/);
      const unmarked = join(env.dir, 'ordinary-directory'); await mkdir(unmarked);
      await assert.rejects(() => resetDisposable(unmarked), /disposable/); await rm(unmarked, { recursive: true });
    });
    const intent = async (delta: number, nonce = randomNonce()) => signIntent({ $type: 'test.atseq.defs#intent', version: 0, app: account.did, genesis: link(anchor.cid), definition: link(definitionCid), actorKey: await actor.exportPublicKey('did'), nonce, action: 'test.atseq.totals#add', payload: { delta } } satisfies Intent, actor);
    const first = await intent(3), second = await intent(4);
    const leaseDirectory = join(env.dir, 'host');
    sequencer = new Sequencer(pds, anchor, writer, leaseDirectory);
    await check('two concurrent submissions receive one contiguous order', async () => {
      const receipts = await Promise.all([sequencer!.submit(encodeBlock(first)), sequencer!.submit(encodeBlock(second))]);
      assert.deepEqual(receipts.map(r => r.receipt.position).sort(), [1, 2]);
      const snapshot = await readSnapshot(pds, anchor); assert.equal(snapshot.history.entries.length, 2);
    });
    await check('same intent and a new valid signature return original receipt', async () => {
      const original = await sequencer!.submit(encodeBlock(first));
      const resigned = await signIntent(first.intent, actor);
      const retry = await sequencer!.submit(encodeBlock(resigned));
      assert.deepEqual(retry.receipt, original.receipt);
      assert.equal((await readSnapshot(pds, anchor)).history.entries.length, 2);
      const conflict = await signIntent({ ...first.intent, payload: { delta: 99 } }, actor);
      await assert.rejects(() => sequencer!.submit(encodeBlock(conflict)), { code: 'retry_conflict' });
    });
    await check('second local writer is refused while the lease is held', () => {
      assert.throws(() => new Sequencer(pds, anchor, writer, leaseDirectory), /writer lease/);
    });
    await sequencer.close(); sequencer = undefined;
    await check('official PDS process crash preserves acknowledged history and blobs', async () => {
      await env.stop('SIGKILL'); await env.start();
      sequencer = new Sequencer(pds, anchor, writer, leaseDirectory);
      const receipt = await sequencer.submit(encodeBlock(first)); assert.equal(receipt.receipt.position, 1);
      assert.deepEqual(await sources.get(programCid), program);
      assert.equal((await readSnapshot(pds, anchor)).history.entries.length, 2);
    });
    await sequencer!.close(); sequencer = undefined;
    const unrelated = () => pds.apply([{ $type: 'com.atproto.repo.applyWrites#create', collection: 'test.atseq.unrelated', rkey: randomBytes(8).toString('hex'), value: { $type: 'test.atseq.unrelated', text: 'Unrelated repository write' } }]);
    await check('a rejected conditional batch leaves entry and head unchanged', async () => {
      const before = await readSnapshot(pds, anchor);
      const entry = await sequence(await intent(5), anchor, before.history.head, writer);
      const head = headAt(anchor, entry.position, await contentCid(entry));
      await unrelated();
      await assert.rejects(() => pds.apply([
        { $type: 'com.atproto.repo.applyWrites#create', collection: 'test.atseq.entry', rkey: positionKey(entry.position), value: entry },
        { $type: 'com.atproto.repo.applyWrites#update', collection: 'test.atseq.head', rkey: 'self', value: head },
      ], before.commit), { code: 'InvalidSwap' });
      const after = await readSnapshot(pds, anchor);
      assert.deepEqual(after.history.head, before.history.head);
      assert.deepEqual(after.history.entries, before.history.entries);
    });
    const proxied = new PdsClient(proxy.url, account.did, account.accessJwt);
    sequencer = new Sequencer(proxied, anchor, writer, leaseDirectory);
    await check('an unrelated repo write races the append and is reconciled', async () => {
      const before = proxy.observations.length;
      proxy.fault({ before: async () => { await unrelated(); } });
      const result = await sequencer!.submit(encodeBlock(await intent(6)));
      assert.equal(result.receipt.position, 3);
      assert.deepEqual(proxy.observations.slice(before), [400, 200]);
      assert.equal((await readSnapshot(pds, anchor)).history.entries.length, 3);
    });
    await check('lost HTTP response after commit resolves to one original receipt', async () => {
      const signed = await intent(7);
      proxy.fault({ drop: true });
      const result = await sequencer!.submit(encodeBlock(signed));
      assert.equal(result.receipt.position, 4);
      assert.deepEqual((await sequencer!.submit(encodeBlock(signed))).receipt, result.receipt);
      assert.deepEqual((await sequencer!.lookup(await contentCid(signed.intent)))?.receipt, result.receipt);
      assert.equal((await readSnapshot(pds, anchor)).history.entries.length, 4);
    });
    await sequencer.close(); sequencer = undefined;
    const writerConfig = join(env.dir, 'writer-secrets.json');
    await writeFile(writerConfig, JSON.stringify({ pds: proxy.url, token: account.accessJwt, genesis, genesisCid: anchor.cid, writerHex: await writer.exportPrivateKey('rawHex'), leases: leaseDirectory }), { mode: 0o600 });
    child = await startWriter(writerConfig);
    const submit = async (url: string, signed: Awaited<ReturnType<typeof intent>>) => {
      const response = await fetch(`${url}/xrpc/test.atseq.submit`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ block: bytes(encodeBlock(signed)) }), signal: AbortSignal.timeout(15_000) });
      assert.equal(response.status, 200, await response.clone().text()); return response.json() as Promise<any>;
    };
    await check('a different writer process cannot acquire the same local lease', async () => {
      await assert.rejects(() => startWriter(writerConfig), /writer lease/);
    });
    await check('writer crash after commit but before acknowledgment recovers one receipt', async () => {
      const signed = await intent(8);
      let committed!: () => void, release!: () => void;
      const commitSeen = new Promise<void>(resolve => { committed = resolve; });
      const delivery = new Promise<void>(resolve => { release = resolve; });
      proxy.fault({ after: async () => { committed(); await delivery; } });
      const pending = submit(child!.url, signed).then(() => 'acknowledged', () => 'interrupted');
      try {
        await Promise.race([commitSeen, pending.then(() => { throw new Error('Host responded before the expected PDS commit'); })]);
        await child!.stop('SIGKILL'); child = undefined;
      }
      finally { release(); }
      assert.equal(await pending, 'interrupted');
      child = await startWriter(writerConfig);
      const result = await submit(child.url, signed);
      assert.equal(result.receipt.position, 5); assert.equal(result.frontier, null);
      assert.equal((await readSnapshot(pds, anchor)).history.entries.length, 5);
    });
    await check('writer crash after acknowledgment keeps receipt and no domain effect claim', async () => {
      const signed = await intent(9), result = await submit(child!.url, signed);
      assert.equal(result.receipt.position, 6);
      await child!.stop('SIGKILL'); child = await startWriter(writerConfig);
      const params = new URLSearchParams({ app: account.did, genesis: anchor.cid, intent: await contentCid(signed.intent) });
      const response = await fetch(`${child.url}/xrpc/test.atseq.receipt?${params}`);
      assert.equal(response.status, 200);
      const found = await response.json() as any;
      assert.deepEqual(found.receipt, result.receipt);
      assert.deepEqual(found.outcome, { $type: 'test.atseq.defs#pending' });
      assert.equal(found.frontier, null);
      assert.equal((await readSnapshot(pds, anchor)).history.entries.length, 6);
    });
    await check('XRPC rejects a foreign receipt anchor and malformed submission', async () => {
      const params = new URLSearchParams({ app: 'did:plc:bbbbbbbbbbbbbbbbbbbbbbbb', genesis: anchor.cid, intent: await contentCid(first.intent) });
      const foreign = await fetch(`${child!.url}/xrpc/test.atseq.receipt?${params}`);
      assert.equal(foreign.status, 400); assert.equal((await foreign.json() as any).error, 'VerificationFailed');
      const malformed = await fetch(`${child!.url}/xrpc/test.atseq.submit`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ block: bytes(new Uint8Array([1])) }) });
      assert.equal(malformed.status, 400);
      assert.equal((await readSnapshot(pds, anchor)).history.entries.length, 6);
    });
    await check('bootstrap at a chosen head catches up without notifications', async () => {
      const chosen = (await readSnapshot(pds, anchor)).history.head;
      await submit(child!.url, await intent(10)); await submit(child!.url, await intent(11));
      // This reader receives no live notification or subscription cursor.
      const later = await readSnapshot(pds, anchor, chosen);
      assert.equal(chosen.position, 6); assert.equal(later.history.head.position, 8);
      assert.deepEqual(later.history.entries.map(e => e.position), [1, 2, 3, 4, 5, 6, 7, 8]);
    });
    await child.stop(); child = undefined;
    await check('repository CAR contains retention references but blobs require explicit export', async () => {
      const archive = fromUint8Array(await pds.binary('com.atproto.sync.getRepo'));
      const cids = new Set([...archive].map(block => toString(block.cid)));
      assert.equal(cids.has((await pds.get('test.atseq.source', programCid)).cid), true);
      assert.equal(cids.has(programCid), false);
      const exported = await sources.get(programCid);
      assert.deepEqual(exported, program);
      assert.equal(toString(await create(CODEC_RAW, exported)), programCid);
    });
    await check('missing and tampered source references fail, then recover by exact content', async () => {
      const original = await pds.get('test.atseq.source', programCid);
      await pds.apply([{ $type: 'com.atproto.repo.applyWrites#delete', collection: 'test.atseq.source', rkey: programCid }]);
      await assert.rejects(() => sources.get(programCid), { code: 'RecordNotFound' });
      try {
        const other = (await pds.get('test.atseq.source', definitionCid)).value as any;
        await pds.apply([{ $type: 'com.atproto.repo.applyWrites#create', collection: 'test.atseq.source', rkey: programCid, value: { ...original.value as object, blob: other.blob } }]);
        await assert.rejects(() => sources.get(programCid), { code: 'content' });
      } finally {
        // Deleting the last reference can delete the blob itself. Recovery needs
        // retained bytes, not merely a stale copy of its retention record.
        await pds.upload(program);
        await pds.apply([{ $type: 'com.atproto.repo.applyWrites#update', collection: 'test.atseq.source', rkey: programCid, value: original.value }]);
      }
      assert.deepEqual(await sources.get(programCid), program);
    });
    await check('missing or corrupted physical blob bytes never satisfy a source CID', async () => {
      await assertDisposable(env.dir);
      // Official PDS 0.5.31 DiskBlobStore layout; only this test's marked data.
      const path = join(env.dir, 'blobs', account.did, programCid);
      const retained = await readFile(path); assert.deepEqual(new Uint8Array(retained), program);
      try {
        await writeFile(path, new Uint8Array(program.length).fill(33));
        await assert.rejects(() => sources.get(programCid), { code: 'content' });
        await rm(path);
        await assert.rejects(() => sources.get(programCid), { code: 'ContentUnavailable' });
      } finally { await writeFile(path, retained); }
      assert.deepEqual(await sources.get(programCid), program);
    });
    await check('a retained verified head refuses repository rollback and signed-entry corruption', async () => {
      const chosen = (await readSnapshot(pds, anchor)).history.head;
      const original = await pds.get('test.atseq.entry', positionKey(8));
      const prior = (await readSnapshot(pds, anchor)).history.entries[6]!;
      await pds.apply([
        { $type: 'com.atproto.repo.applyWrites#delete', collection: 'test.atseq.entry', rkey: positionKey(8) },
        { $type: 'com.atproto.repo.applyWrites#update', collection: 'test.atseq.head', rkey: 'self', value: headAt(anchor, 7, await contentCid(prior)) },
      ]);
      try { await assert.rejects(() => readSnapshot(pds, anchor, chosen), { code: 'rollback' }); }
      finally { await pds.apply([
        { $type: 'com.atproto.repo.applyWrites#create', collection: 'test.atseq.entry', rkey: positionKey(8), value: original.value },
        { $type: 'com.atproto.repo.applyWrites#update', collection: 'test.atseq.head', rkey: 'self', value: chosen },
      ]); }
      try {
        const bad = structuredClone(original.value) as any; bad.signedIntent.intent.payload.delta = 999;
        await pds.apply([{ $type: 'com.atproto.repo.applyWrites#update', collection: 'test.atseq.entry', rkey: positionKey(8), value: bad }]);
        await assert.rejects(() => readSnapshot(pds, anchor, chosen), { code: 'signature' });
      } finally { await pds.apply([{ $type: 'com.atproto.repo.applyWrites#update', collection: 'test.atseq.entry', rkey: positionKey(8), value: original.value }]); }
      assert.equal((await readSnapshot(pds, anchor, chosen)).history.head.position, 8);
    });
    await check('chosen-head catch-up verifies a prefix spanning real PDS pages', async () => {
      const before = await readSnapshot(pds, anchor); let head = before.history.head;
      const writes = [];
      // Seed a signed fixture batch while the host is stopped. This tests PDS
      // pagination and verification, not service append throughput.
      for (let i = 0; i < 103; i++) {
        const entry = await sequence(await intent(i), anchor, head, writer);
        head = headAt(anchor, entry.position, await contentCid(entry));
        writes.push({ $type: 'com.atproto.repo.applyWrites#create', collection: 'test.atseq.entry', rkey: positionKey(entry.position), value: entry });
      }
      writes.push({ $type: 'com.atproto.repo.applyWrites#update', collection: 'test.atseq.head', rkey: 'self', value: head });
      await pds.apply(writes, before.commit);
      const after = await readSnapshot(pds, anchor, before.history.head);
      finalEntries = after.history.entries.length;
      assert.equal(after.history.head.position, 111);
      assert.deepEqual(after.history.entries.map(e => e.position), Array.from({ length: 111 }, (_, i) => i + 1));
    });
  } finally {
    await child?.stop('SIGKILL'); await sequencer?.close(); await proxy.close(); await env.close();
    const paths = ['package.json', 'package-lock.json', 'tests/pds.test.ts', 'lexicons/test/atseq/source.json'];
    for (const directory of ['src/host', 'tests/helpers', 'experiments/pds']) {
      for (const file of await readdir(directory, { withFileTypes: true })) if (file.isFile()) paths.push(`${directory}/${file.name}`);
    }
    const sourceHashes = Object.fromEntries(await Promise.all(paths.map(async path => [path, createHash('sha256').update(await readFile(path)).digest('hex')])));
    await mkdir('experiments/generated', { recursive: true });
    await writeFile('experiments/generated/pds-results.json', JSON.stringify({ passed: results.length === 21 && results.every(r => r.passed) && finalEntries === 111, measuredAt: new Date().toISOString(), nodeVersion: process.version, pdsVersion: '0.5.31', storage: 'Official PDS HTTP and SQLite; loopback PLC with in-memory test database', finalEntries, results, sourceHashes }, null, 2) + '\n');
  }
});
