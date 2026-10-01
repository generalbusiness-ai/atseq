import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chartFixture } from '../testdata/apps/fixtures.ts';
import { fixtureApp, fixtureHistory } from '../experiments/runtime-corpus.ts';
import { Folder } from '../src/application/folder.ts';
import { PdsClient, PdsError } from '../src/host/pds.ts';
import { Sequencer, SnapshotReader } from '../src/host/sequencer.ts';
import { NSID } from '../src/core/nsids.ts';
import { HOST_LIMITS } from '../src/core/limits.ts';
import { contentCid, encodeBlock, link } from '../src/protocol/wire.ts';
import {
  headAt,
  positionKey,
  randomNonce,
  signIntent,
  verifyHistory,
  type Head,
  type Entry,
} from '../src/protocol/log.ts';

async function fixture(count: number) {
  const source = await chartFixture(),
    app = await fixtureApp(source.bundle);
  const history = await fixtureHistory(
    app,
    Array.from({ length: count }, (_, i) => ({ action: source.action, payload: { day: String(i), millimetres: 1 } })),
  );
  return { source, app, history };
}
class MemoryPds extends PdsClient {
  reads = 0;
  writes = 0;
  gate?: () => Promise<void>;
  private revision = 0;
  constructor(
    readonly anchor: Awaited<ReturnType<typeof fixtureApp>>['anchor'],
    public head: Head,
    public entries: Entry[],
  ) {
    super('http://127.0.0.1', anchor.genesis.app, 'fixture');
  }
  override async latestCommit() {
    return { cid: await contentCid({ revision: this.revision }), rev: String(this.revision) };
  }
  override async get(collection: string, rkey: string) {
    const value = collection === NSID.genesis ? this.anchor.genesis : this.head;
    return { uri: `at://${this.did}/${collection}/${rkey}`, cid: await contentCid(value), value };
  }
  override async list() {
    this.reads++;
    return Promise.all(
      this.entries.map(async (value) => ({
        uri: `at://${this.did}/${NSID.entry}/${positionKey(value.position)}`,
        cid: await contentCid(value),
        value,
      })),
    );
  }
  override async applyConditional(writes: any[], swap: string) {
    await this.gate?.();
    if ((await this.latestCommit()).cid !== swap) throw new PdsError(400, 'InvalidSwap');
    this.writes++;
    for (const write of writes) {
      if (write.collection === NSID.entry) this.entries.push(structuredClone(write.value));
      if (write.collection === NSID.head) this.head = structuredClone(write.value);
    }
    this.revision++;
    return { commit: await this.latestCommit() };
  }
  replace(head: Head, entries: Entry[]) {
    this.head = head;
    this.entries = entries;
    this.revision++;
  }
}
async function signed(f: Awaited<ReturnType<typeof fixture>>, day: string) {
  return signIntent(
    {
      $type: NSID.defsIntent,
      version: 1,
      app: f.app.anchor.genesis.app,
      genesis: link(f.app.anchor.cid),
      definition: link(f.app.bundle.root),
      actorKey: await f.app.actor.exportPublicKey('did'),
      nonce: randomNonce(),
      action: f.source.action,
      payload: { day, millimetres: 1 },
    },
    f.app.actor,
  );
}

test('preverified interpretation accepts only immutable history issued for its genesis', async () => {
  const f = await fixture(2),
    verified = await verifyHistory(f.app.anchor, f.history.head, f.history.entries);
  const folder = await Folder.open(f.app.anchor, f.source.bundle);
  assert.throws(() => {
    verified.entries[0]!.position = 99;
  }, TypeError);
  const receipt = verified.retries.lookupCid(await contentCid(verified.entries[0]!.signedIntent.intent))!;
  assert.throws(() => verified.retries.record(verified.entries[0]!, receipt), /immutable/);
  await assert.rejects(async () => folder.catchUpVerified({ ...verified }), { code: 'missing_history' });
  const other = await fixtureApp(f.source.bundle);
  const foreign = await verifyHistory(other.anchor, headAt(other.anchor), []);
  await assert.rejects(async () => folder.catchUpVerified(foreign), { code: 'missing_history' });
  const result = await folder.catchUpVerified(verified),
    cold = await Folder.open(f.app.anchor, f.source.bundle);
  assert.deepEqual(result, await cold.catchUp(f.history.head, f.history.entries));
  f.history.entries[0]!.position = 99;
  assert.equal(verified.entries[0]!.position, 1);
});

test('snapshot reads share verification, invalidate changed commits and retain rollback and fork checks', async () => {
  const f = await fixture(2),
    pds = new MemoryPds(f.app.anchor, f.history.head, f.history.entries),
    reader = new SnapshotReader(pds, f.app.anchor);
  const [a, b, c] = await Promise.all([reader.read(), reader.read(), reader.read()]);
  assert.equal(a, b);
  assert.equal(b, c);
  assert.equal(pds.reads, 1);
  assert.equal(await reader.read(), a);
  assert.equal(pds.reads, 1);
  pds.replace(headAt(f.app.anchor), []);
  await assert.rejects(() => reader.read(), { code: 'rollback' });
  const alternate = await fixtureHistory(f.app, [
    { action: f.source.action, payload: { day: 'fork', millimetres: 1 } },
    { action: f.source.action, payload: { day: 'fork2', millimetres: 1 } },
  ]);
  pds.replace(alternate.head, alternate.entries);
  await assert.rejects(() => reader.read(), { code: 'fork' });
  pds.replace(f.history.head, f.history.entries);
  const recovered = await reader.read();
  assert.equal(recovered.history.head.position, 2);
  assert.notEqual(recovered, a);
});

test('receipt lookup completes while an append waits for its conditional write', async () => {
  const f = await fixture(1),
    pds = new MemoryPds(f.app.anchor, f.history.head, f.history.entries);
  const directory = await mkdtemp(join(tmpdir(), 'atseq-receipt-'));
  const sequencer = new Sequencer(pds, f.app.anchor, f.app.writer, directory);
  let release!: () => void, entered!: () => void;
  const held = new Promise<void>((resolve) => (release = resolve)),
    writing = new Promise<void>((resolve) => (entered = resolve));
  pds.gate = async () => {
    entered();
    await held;
  };
  try {
    const pending = sequencer.submit(encodeBlock(await signed(f, 'next')));
    await writing;
    const cid = await contentCid(f.history.entries[0]!.signedIntent.intent);
    const receipt = await Promise.race([
      sequencer.lookup(cid),
      new Promise<never>((_, reject) => {
        const timer = setTimeout(() => reject(new Error('Receipt waited for append')), 2000);
        timer.unref();
      }),
    ]);
    assert.equal(receipt?.receipt.position, 1);
    assert.equal(pds.writes, 0);
    release();
    assert.equal((await pending).receipt.position, 2);
    assert.equal((await sequencer.lookup(cid))?.head.position, 2);
  } finally {
    release();
    await sequencer.close();
    await rm(directory, { recursive: true, force: true });
  }
});

test(
  'entry 20000 is accepted, 20001 is refused before a PDS write and existing history stays readable',
  { timeout: 120000 },
  async () => {
    const f = await fixture(HOST_LIMITS.historyEntries - 1),
      pds = new MemoryPds(f.app.anchor, f.history.head, f.history.entries);
    const directory = await mkdtemp(join(tmpdir(), 'atseq-append-boundary-')),
      sequencer = new Sequencer(pds, f.app.anchor, f.app.writer, directory);
    try {
      const last = await signed(f, 'last'),
        result = await sequencer.submit(encodeBlock(last));
      assert.equal(result.receipt.position, 20000);
      assert.equal(pds.writes, 1);
      assert.equal((await sequencer.submit(encodeBlock(last))).receipt.position, 20000);
      await assert.rejects(async () => sequencer.submit(encodeBlock(await signed(f, 'over-limit'))), {
        code: 'AppendLimit',
      });
      assert.equal(pds.writes, 1);
      assert.equal((await sequencer.lookup(result.receipt.intent.$link))?.head.position, 20000);
      assert.equal((await new SnapshotReader(pds, f.app.anchor).read()).history.entries.length, 20000);
    } finally {
      await sequencer.close();
      await rm(directory, { recursive: true, force: true });
    }
  },
);
