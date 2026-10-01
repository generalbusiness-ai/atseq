import { SerialQueue } from '../core/queue.ts';
import { HOST_LIMITS } from '../core/limits.ts';
import { NSID } from '../core/nsids.ts';
import type { PrivateKey } from '@atcute/crypto';
import {
  Anchor,
  headAt,
  positionKey,
  sequence,
  verifyHistory,
  verifiedEntryCid,
  verifyIntent,
  validateHead,
  type Head,
  type Receipt,
} from '../protocol/log.ts';
import { contentCid, decodeBlock, link, ProtocolError } from '../protocol/wire.ts';
import { PdsClient, PdsError } from './pds.ts';
import { acquireWriterLease, type WriterLease } from './lease.ts';

export interface Snapshot {
  commit: string;
  history: Awaited<ReturnType<typeof verifyHistory>>;
}
/** The PDS repository is mutable. Read a consistent snapshot, then verify our chain. */
export async function readSnapshot(pds: PdsClient, anchor: Anchor, knownHead?: Head): Promise<Snapshot> {
  if (pds.did !== anchor.genesis.app) throw new ProtocolError('target', 'PDS account differs from pinned app');
  for (let attempt = 0; attempt < 8; attempt++) {
    const before = await pds.latestCommit();
    const [genesis, head, records] = await Promise.all([
      pds.get(NSID.genesis, 'self'),
      pds.get(NSID.head, 'self'),
      pds.list(NSID.entry),
    ]);
    const after = await pds.latestCommit();
    if (before.cid !== after.cid) continue;
    if (genesis.cid !== anchor.cid)
      throw new ProtocolError('anchor', 'Published genesis differs from the pinned anchor');
    await Anchor.from(genesis.value, { app: anchor.genesis.app, genesis: anchor.cid });
    validateHead(head.value, anchor);
    if ((await contentCid(head.value)) !== head.cid)
      throw new ProtocolError('content', 'Head value differs from its PDS CID');
    const values = [];
    for (const record of records) {
      if ((await contentCid(record.value)) !== record.cid)
        throw new ProtocolError('content', 'Entry differs from its PDS CID');
      if (record.uri !== `at://${pds.did}/${NSID.entry}/${positionKey(record.value.position)}`)
        throw new ProtocolError('position', 'Entry record key differs from its signed position');
      values.push(record.value);
    }
    const history = await verifyHistory(anchor, head.value, values);
    if (knownHead) {
      validateHead(knownHead, anchor);
      if (history.head.position < knownHead.position)
        throw new ProtocolError('rollback', 'PDS head is behind the retained verified head');
      const knownCid = verifiedEntryCid(history, anchor, knownHead.position);
      if (knownCid !== knownHead.entry.$link)
        throw new ProtocolError('fork', 'PDS history differs from the retained verified head');
    }
    return { commit: after.cid, history };
  }
  throw new PdsError(503, 'RepositoryChanging');
}
/** Share a verified repository snapshot while its commit is unchanged. */
export class SnapshotReader {
  private cached?: Snapshot;
  private inFlight?: { generation: number; promise: Promise<Snapshot> };
  private generation = 0;
  private knownHead?: Head;
  constructor(
    private readonly pds: PdsClient,
    private readonly anchor: Anchor,
  ) {}
  isFor(pds: PdsClient, anchor: Anchor) {
    return this.pds === pds && this.anchor.cid === anchor.cid;
  }
  requireHead(head: Head) {
    validateHead(head, this.anchor);
    if (this.knownHead?.position === head.position && this.knownHead.entry.$link !== head.entry.$link)
      throw new ProtocolError('fork', 'Retained heads conflict');
    if (!this.knownHead || head.position > this.knownHead.position) this.knownHead = structuredClone(head);
  }
  /** A completed write invalidates reads that began before its response. */
  invalidate() {
    this.generation++;
    this.cached = undefined;
  }
  retainedHead() {
    return this.knownHead && structuredClone(this.knownHead);
  }
  covers(history: Snapshot['history']) {
    if (!this.knownHead) return true;
    if (history.head.position < this.knownHead.position) return false;
    if (verifiedEntryCid(history, this.anchor, this.knownHead.position) !== this.knownHead.entry.$link)
      throw new ProtocolError('fork', 'Snapshot differs from the retained verified head');
    return true;
  }
  async read(): Promise<Snapshot> {
    for (;;) {
      const running = this.inFlight ?? this.startRead();
      try {
        const snapshot = await running.promise;
        if (running.generation !== this.generation || !this.covers(snapshot.history)) continue;
        return snapshot;
      } catch (error) {
        if (running.generation !== this.generation) continue;
        throw error;
      }
    }
  }
  private startRead() {
    const generation = this.generation;
    const run = (async () => {
      const cached = this.cached;
      if (cached && this.covers(cached.history) && (await this.pds.latestCommit()).cid === cached.commit) return cached;
      const snapshot = await readSnapshot(this.pds, this.anchor, this.knownHead);
      if (!this.covers(snapshot.history))
        throw new ProtocolError('rollback', 'Snapshot is behind the retained verified head');
      this.requireHead(snapshot.history.head);
      // A write may have completed while this read was in progress.
      if (generation === this.generation) this.cached = Object.freeze(snapshot);
      return snapshot;
    })();
    const running = { generation, promise: run };
    this.inFlight = running;
    void run
      .finally(() => {
        if (this.inFlight === running) this.inFlight = undefined;
      })
      .catch(() => {});
    return running;
  }
}
export async function provisionLog(pds: PdsClient, anchor: Anchor): Promise<void> {
  if (pds.did !== anchor.genesis.app) throw new ProtocolError('target', 'Cannot provision a different app');
  const current = await pds.latestCommit();
  for (const collection of [NSID.genesis, NSID.head]) {
    try {
      await pds.get(collection, 'self');
    } catch (error) {
      if (error instanceof PdsError && error.code === 'RecordNotFound') continue;
      throw error;
    }
    throw new ProtocolError(
      'already_provisioned',
      'Application log already exists; provisioning cannot replace its anchor',
    );
  }
  await pds.applyConditional(
    [
      { $type: 'com.atproto.repo.applyWrites#create', collection: NSID.genesis, rkey: 'self', value: anchor.genesis },
      { $type: 'com.atproto.repo.applyWrites#create', collection: NSID.head, rkey: 'self', value: headAt(anchor) },
    ],
    current.cid,
  );
}
export class Sequencer {
  private readonly queue = new SerialQueue();
  private closed = false;
  private readonly lease: WriterLease;
  private readonly snapshots: SnapshotReader;
  constructor(
    private readonly pds: PdsClient,
    private readonly anchor: Anchor,
    private readonly signer: PrivateKey,
    leaseDirectory: string,
    knownHead?: Head,
    snapshots?: SnapshotReader,
  ) {
    if (snapshots && !snapshots.isFor(pds, anchor))
      throw new ProtocolError('target', 'Snapshot reader differs from the sequencer account and genesis');
    this.snapshots = snapshots ?? new SnapshotReader(pds, anchor);
    this.lease = acquireWriterLease(leaseDirectory, anchor.genesis.app);
    try {
      let retainedHead: Head | undefined;
      const cached = this.lease.readHead();
      if (cached !== undefined) {
        validateHead(cached, anchor);
        retainedHead = structuredClone(cached);
      }
      if (knownHead) {
        validateHead(knownHead, anchor);
        if (
          retainedHead &&
          knownHead.position === retainedHead.position &&
          knownHead.entry.$link !== retainedHead.entry.$link
        )
          throw new ProtocolError('fork', 'Supplied and cached heads conflict');
        if (!retainedHead || knownHead.position > retainedHead.position) retainedHead = structuredClone(knownHead);
      }
      if (retainedHead) this.snapshots.requireHead(retainedHead);
    } catch (error) {
      this.lease.close();
      throw error;
    }
  }
  submit(block: Uint8Array): Promise<{ receipt: Receipt; head: Head }> {
    if (this.closed) return Promise.reject(new Error('Sequencer is closed'));
    const owned = new Uint8Array(block);
    return this.queue.run(() => this.append(owned));
  }
  /** Read receipts independently of a pending append, from a verified snapshot. */
  async lookup(intentCid: string): Promise<{ receipt: Receipt; head: Head } | undefined> {
    if (this.closed) throw new Error('Sequencer is closed');
    link(intentCid);
    const snapshot = await this.snapshots.read();
    const receipt = snapshot.history.retries.lookupCid(intentCid);
    if (!receipt) return undefined;
    this.lease.saveHead(this.snapshots.retainedHead());
    return { receipt, head: structuredClone(snapshot.history.head) };
  }
  private async append(block: Uint8Array): Promise<{ receipt: Receipt; head: Head }> {
    const { signed } = await verifyIntent(decodeBlock(block), this.anchor);
    for (let attempt = 0; attempt < 8; attempt++) {
      const snapshot = await this.snapshots.read();
      const receipt = await snapshot.history.retries.lookup(signed.intent);
      if (receipt) {
        this.lease.saveHead(this.snapshots.retainedHead());
        return { receipt, head: snapshot.history.head };
      }
      if (snapshot.history.head.position >= HOST_LIMITS.historyEntries) throw new PdsError(413, 'AppendLimit');
      this.lease.saveHead(this.snapshots.retainedHead());
      const entry = await sequence(signed, this.anchor, snapshot.history.head, this.signer);
      const head = headAt(this.anchor, entry.position, await contentCid(entry));
      try {
        await this.pds.applyConditional(
          [
            {
              $type: 'com.atproto.repo.applyWrites#create',
              collection: NSID.entry,
              rkey: positionKey(entry.position),
              value: entry,
            },
            { $type: 'com.atproto.repo.applyWrites#update', collection: NSID.head, rkey: 'self', value: head },
          ],
          snapshot.commit,
        );
      } catch (error) {
        // A conflict or a lost response requires reconciliation, never a new nonce.
        if (error instanceof PdsError && error.status < 500 && error.code !== 'InvalidSwap') throw error;
      }
      this.snapshots.invalidate();
      // Read confirmation even after a reported success. Only verified persistence
      // can produce a receipt; on uncertainty the next pass finds the exact retry.
    }
    throw new PdsError(503, 'ReceiptUncertain');
  }
  async close(): Promise<void> {
    this.closed = true;
    await this.queue.idle();
    this.lease.close();
  }
}
