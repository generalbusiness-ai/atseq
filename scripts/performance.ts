import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { P256PrivateKeyExportable } from '@atcute/crypto';
import { startEnvironment, resetDisposable } from '../experiments/pds/environment.mjs';
import { Anchor, headAt, positionKey, randomNonce, sequence, signIntent, type Intent } from '../src/protocol/log.ts';
import { contentCid, encodeBlock, link, bytes } from '../src/protocol/wire.ts';
import { applicationRuntimeCid } from '../src/runtime/identity.ts';
import { SourceBundle } from '../src/definition/source.ts';
import { Folder } from '../src/runtime/folder.ts';
import { PdsClient } from '../src/host/pds.ts';
import { SourceStore } from '../src/host/source.ts';
import { Sequencer, provisionLog, readSnapshot } from '../src/host/sequencer.ts';
import { guitarFixture } from '../testdata/apps/fixtures.ts';
import { recordFlowEvidence } from '../tests/helpers/evidence.ts';

const env = await startEnvironment(), measurements: any[] = [];
let sequencer: Sequencer | undefined, passed = false;
const samples = 9, sizes = [100, 1000, 10000];
const percentile = (values: number[], fraction: number) => [...values].sort((a,b) => a-b)[Math.ceil(values.length*fraction)-1];
try {
  const response = await fetch(`${env.url}/xrpc/com.atproto.server.createAccount`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ handle: `bench${randomBytes(5).toString('hex')}.test`, email: 'bench@example.test', password: randomBytes(24).toString('hex') }) });
  assert.equal(response.status, 200); const account = await response.json() as any, pds = new PdsClient(env.url, account.did, account.accessJwt);
  const actor = await P256PrivateKeyExportable.createKeypair(), writer = await P256PrivateKeyExportable.createKeypair(), actorKey = await actor.exportPublicKey('did');
  const base = await guitarFixture('test.bounded'), files = { ...base.files, 'candidate.jsonata': new TextEncoder().encode('{"decision":"effective","state":{"candidates":[],"selected":act.id}}') };
  const source = await SourceBundle.pack(base.manifest, files), store = new SourceStore(pds);
  for (const cid of source.identities()) await store.put(cid, await source.get(cid));
  const genesis = { $type: 'test.atseq.genesis', version: 0, app: account.did, profile: link(await applicationRuntimeCid()), definition: link(source.root), sequencerKey: await writer.exportPublicKey('did'), activationKeys: [actorKey] };
  const anchor = await Anchor.from(genesis, await contentCid(genesis)); await provisionLog(pds, anchor);
  let head = headAt(anchor), all: any[] = [];
  const intent = (position: number) => signIntent({ $type: 'test.atseq.defs#intent', version: 0, app: account.did, genesis: link(anchor.cid), definition: link(source.root), actorKey, nonce: randomNonce(), action: base.action, payload: { id: String(position), title: 'Bounded benchmark state', pricePence: 0 } } satisfies Intent, actor);
  for (const size of sizes) {
    console.log(`Seeding signed fixture history to ${size - samples}; conditional real-PDS batches are setup, excluded from acknowledgment samples.`);
    while (head.position < size - samples) {
      const writes: any[] = [];
      for (let n = 0; n < 99 && head.position < size - samples; n++) {
        const entry = await sequence(await intent(head.position + 1), anchor, head, writer); all.push(entry); head = headAt(anchor, entry.position, await contentCid(entry));
        writes.push({ $type: 'com.atproto.repo.applyWrites#create', collection: 'test.atseq.entry', rkey: positionKey(entry.position), value: entry });
      }
      writes.push({ $type: 'com.atproto.repo.applyWrites#update', collection: 'test.atseq.head', rkey: 'self', value: head });
      await pds.applyConditional(writes, (await pds.latestCommit()).cid);
    }
    sequencer = new Sequencer(pds, anchor, writer, join(env.dir, 'writer'));
    const acknowledgment = [];
    for (let n=0; n<samples; n++) {
      const signed = await intent(head.position+1), start = performance.now();
      const response = await sequencer.submit(encodeBlock(signed)), elapsedMs = performance.now()-start; head = response.head;
      acknowledgment.push({ position: response.receipt.position, elapsedMs }); console.log(`Confirmed #${head.position}: ${elapsedMs.toFixed(1)} ms`);
    }
    await sequencer.close(); sequencer = undefined;
    let started = performance.now(); const snapshot = await readSnapshot(pds, anchor); const readVerifyMs = performance.now()-started; all = snapshot.history.entries;
    started = performance.now(); const folder = await Folder.open(anchor, source); const loadedMs = performance.now()-started;
    started = performance.now(); const result = await folder.catchUp(head, all); const replayMs = performance.now()-started;
    assert.equal(result.stalled, undefined); assert.equal((result.projection.state as any).selected, String(size));
    started = performance.now(); const warm = await Folder.open(anchor, source); await warm.catchUp(headAt(anchor,size-1,await contentCid(all[size-2])),all.slice(0,-1));
    const before = performance.now(); await warm.catchUp(head,all); const catchUpOneMs = performance.now()-before;
    const raw = { size, acknowledgment, acknowledgmentP50Ms: percentile(acknowledgment.map(a=>a.elapsedMs),.5), acknowledgmentP95Ms: percentile(acknowledgment.map(a=>a.elapsedMs),.95), readVerifyMs, runtimeLoadMs: loadedMs, fullReplayMs: replayMs, catchUpOneMs, boundedStateBytes: encodeBlock(result.projection.state).length };
    measurements.push(raw);
    await mkdir('experiments/generated/performance', { recursive: true });
    await writeFile(`experiments/generated/performance/input-${size}.json`, JSON.stringify({ genesis, genesisCid: anchor.cid, head, entries: all, source: bytes(await source.write()), candidates: [] }));
    await writeFile('experiments/generated/performance-partial.json', JSON.stringify({ passed:false, measurements },null,2));
    console.log(JSON.stringify(raw));
  }
  passed = true;
} finally {
  await sequencer?.close(); await env.close(); await resetDisposable(env.dir);
  await recordFlowEvidence('performance', measurements.map(m=>({name:`history ${m.size}`,passed,elapsedMs:m.fullReplayMs})), {expectedCases:3, topology:'Official PDS 0.5.31, loopback HTTP, real SQLite and file blobs; official mock PLC. One sequencer, no rate limits; signed setup batched separately from timed confirmed single appends.', hardware:{platform:os.platform(),release:os.release(),arch:os.arch(),cpu:os.cpus()[0]?.model,logicalCpus:os.cpus().length,totalMemory:os.totalmem()}, measurements, sampling:'Nine ordered single-submit confirmations at each final size; nearest-rank p50/p95. Small samples describe this run, not a capacity guarantee.'});
}
