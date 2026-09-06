import type { PrivateKey } from '@atcute/crypto';
import { Anchor, headAt, positionKey, sequence, verifyHistory, verifyIntent, validateHead, type Head, type Receipt } from '../protocol/log.ts';
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
    const [genesis, head, records] = await Promise.all([pds.get('test.atseq.genesis', 'self'), pds.get('test.atseq.head', 'self'), pds.list('test.atseq.entry')]);
    const after = await pds.latestCommit();
    if (before.cid !== after.cid) continue;
    if (genesis.cid !== anchor.cid) throw new ProtocolError('anchor', 'Published genesis differs from the pinned anchor');
    await Anchor.from(genesis.value, anchor.cid);
    validateHead(head.value, anchor);
    if (await contentCid(head.value) !== head.cid) throw new ProtocolError('content', 'Head value differs from its PDS CID');
    const values = [];
    for (const record of records) {
      if (await contentCid(record.value) !== record.cid) throw new ProtocolError('content', 'Entry differs from its PDS CID');
      if (record.uri !== `at://${pds.did}/test.atseq.entry/${positionKey(record.value.position)}`) throw new ProtocolError('position', 'Entry record key differs from its signed position');
      values.push(record.value);
    }
    const history = await verifyHistory(anchor, head.value, values);
    if (knownHead) {
      validateHead(knownHead, anchor);
      if (history.head.position < knownHead.position) throw new ProtocolError('rollback', 'PDS head is behind the retained verified head');
      const knownCid = knownHead.position === 0 ? anchor.cid : await contentCid(history.entries[knownHead.position - 1]);
      if (knownCid !== knownHead.entry.$link) throw new ProtocolError('fork', 'PDS history differs from the retained verified head');
    }
    return { commit: after.cid, history };
  }
  throw new PdsError(503, 'RepositoryChanging');
}
export async function provisionLog(pds: PdsClient, anchor: Anchor): Promise<void> {
  if (pds.did !== anchor.genesis.app) throw new ProtocolError('target', 'Cannot provision a different app');
  const current = await pds.latestCommit();
  for (const collection of ['test.atseq.genesis', 'test.atseq.head']) {
    try { await pds.get(collection, 'self'); }
    catch (error) { if (error instanceof PdsError && error.code === 'RecordNotFound') continue; throw error; }
    throw new ProtocolError('already_provisioned', 'Application log already exists; provisioning cannot replace its anchor');
  }
  await pds.apply([
    { $type: 'com.atproto.repo.applyWrites#create', collection: 'test.atseq.genesis', rkey: 'self', value: anchor.genesis },
    { $type: 'com.atproto.repo.applyWrites#create', collection: 'test.atseq.head', rkey: 'self', value: headAt(anchor) },
  ], current.cid);
}
export class Sequencer {
  private tail: Promise<unknown> = Promise.resolve();
  private knownHead?: Head;
  private closed = false;
  private readonly lease: WriterLease;
  constructor(private readonly pds: PdsClient, private readonly anchor: Anchor, private readonly signer: PrivateKey, leaseDirectory: string, knownHead?: Head) {
    this.lease = acquireWriterLease(leaseDirectory, anchor.genesis.app);
    try {
      const cached = this.lease.readHead();
      if (cached !== undefined) { validateHead(cached, anchor); this.knownHead = structuredClone(cached); }
      if (knownHead) {
        validateHead(knownHead, anchor);
        if (this.knownHead && knownHead.position === this.knownHead.position && knownHead.entry.$link !== this.knownHead.entry.$link) throw new ProtocolError('fork', 'Supplied and cached heads conflict');
        if (!this.knownHead || knownHead.position > this.knownHead.position) this.knownHead = structuredClone(knownHead);
      }
    } catch (error) { this.lease.close(); throw error; }
  }
  submit(block: Uint8Array): Promise<{ receipt: Receipt; head: Head }> {
    if (this.closed) return Promise.reject(new Error('Sequencer is closed'));
    const owned = new Uint8Array(block);
    const result = this.tail.then(() => this.append(owned));
    this.tail = result.catch(() => {}); return result;
  }
  async lookup(intentCid: string): Promise<{ receipt: Receipt; head: Head } | undefined> {
    if (this.closed) throw new Error('Sequencer is closed');
    link(intentCid);
    const result = this.tail.then(async () => {
      const snapshot = await readSnapshot(this.pds, this.anchor, this.knownHead);
      this.knownHead = structuredClone(snapshot.history.head); this.lease.saveHead(this.knownHead);
      for (const entry of snapshot.history.entries) {
        if (await contentCid(entry.signedIntent.intent) === intentCid) return { receipt: (await snapshot.history.retries.lookup(entry.signedIntent.intent))!, head: snapshot.history.head };
      }
      return undefined;
    });
    this.tail = result.catch(() => {}); return result;
  }
  private async append(block: Uint8Array): Promise<{ receipt: Receipt; head: Head }> {
    const { signed } = await verifyIntent(decodeBlock(block), this.anchor);
    for (let attempt = 0; attempt < 8; attempt++) {
      const snapshot = await readSnapshot(this.pds, this.anchor, this.knownHead);
      this.knownHead = structuredClone(snapshot.history.head);
      this.lease.saveHead(this.knownHead);
      const receipt = await snapshot.history.retries.lookup(signed.intent);
      if (receipt) return { receipt, head: snapshot.history.head };
      const entry = await sequence(signed, this.anchor, snapshot.history.head, this.signer);
      const head = headAt(this.anchor, entry.position, await contentCid(entry));
      try {
        await this.pds.apply([
          { $type: 'com.atproto.repo.applyWrites#create', collection: 'test.atseq.entry', rkey: positionKey(entry.position), value: entry },
          { $type: 'com.atproto.repo.applyWrites#update', collection: 'test.atseq.head', rkey: 'self', value: head },
        ], snapshot.commit);
      } catch (error) {
        // A conflict or a lost response requires reconciliation, never a new nonce.
        if (error instanceof PdsError && error.status < 500 && !['InvalidSwap', 'RecordAlreadyExists'].includes(error.code)) throw error;
      }
      // Read confirmation even after a reported success. Only verified persistence
      // can produce a receipt; on uncertainty the next pass finds the exact retry.
    }
    throw new PdsError(503, 'ReceiptUncertain');
  }
  async close(): Promise<void> { this.closed = true; await this.tail; this.lease.close(); }
}
