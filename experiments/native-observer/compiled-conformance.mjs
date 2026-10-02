/** Compiled internal consumer; simulated HTTP, genuine signed evidence and private compiled I2 state. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { NativeObserver } from '../../dist/src/host/native-observer.js';
import { IdentityFetch } from '../../dist/src/host/identity-fetch.js';
import {
  NativeAnchor,
  nativeEntryPath,
  nativeHeadAt,
  createNativeEntry,
  readNativeRecord,
  reconstructNativeBytes,
} from '../../dist/src/protocol/native-wire.js';
import { contentCid, encodeBlock, link } from '../../dist/src/protocol/wire.js';
import { NATIVE_NSID, nativeRef } from '../../dist/src/protocol/native-schema.js';
import { authenticateRepo } from '../../dist/src/protocol/native-proof.js';
import { authenticateAuthorityEntry } from '../../dist/src/application/native-authority-evidence.js';
import {
  openNativeAuthority,
  nativeAuthoritySnapshot,
  interpretNativeAuthority,
} from '../../dist/src/application/native-authority.js';
import { AuthorityHarness, authorityRepo } from '../../tests/support/native-authority-fixture.ts';
import { ObserverNetwork } from '../../tests/support/native-observer-fixture.ts';

const cases = [],
  results = [];
for (const curve of ['p256', 'secp256k1'])
  for (const method of ['plc', 'web']) {
    const h = await AuthorityHarness.create(curve, method),
      epoch = await h.epoch(1),
      grant = await h.grant(1, epoch);
    const anchor = await NativeAnchor.from(h.anchor.genesis, { app: h.app.principal, genesis: h.anchor.cid });
    const prior = await openNativeAuthority(anchor),
      snapshot = nativeAuthoritySnapshot(prior);
    const observer = await NativeObserver.fromAnchor(anchor, h.reader()),
      network = new ObserverNetwork(h);
    await network.init();
    network.roots = [network.next.root, anchor.cid];
    const subject = {
      $type: nativeRef('accountOperation'),
      app: snapshot.app,
      genesis: link(snapshot.genesis),
      position: snapshot.frontier.position + 1,
      prev: link(snapshot.frontier.entry),
      principal: h.actor.principal,
      expectedEpoch: null,
      expectedObservation: null,
      operation: { $type: nativeRef('admitGrant'), grant },
    };
    await assert.rejects(observer.prepareAccount(h.state, subject), { code: 'envelope' });
    const prep = await observer.prepareAccount(prior, subject);
    const original = IdentityFetch.prototype.bytesFrom;
    IdentityFetch.prototype.bytesFrom = async function (url, maximumBytes, signal) {
      this.fetch = (input) => network.fetch(input);
      return original.call(this, url, maximumBytes, signal);
    };
    try {
      const observed = await observer.observePrepared(prep, { observedAt: '2026-10-02T00:00:00.000Z' });
      assert.equal(observed.kind, 'captured');
      observer.assertCapturePrior(observed.capture, prior);
      assert.throws(() => observer.readCapture(structuredClone(observed.capture)), { code: 'envelope' });
      const data = observer.readCapture(observed.capture);
      assert.equal(data.assuranceClass, method === 'plc' ? 'plc-audit-v1' : 'web-observation-v1');
      for (const [cid, raw] of data.blocks) {
        h.content.set(cid, raw);
        h.appRecords.set(NATIVE_NSID.content + '/' + cid, raw);
      }
      const entry = await createNativeEntry(data.completed, anchor, await nativeHeadAt(anchor));
      h.appRecords.set(nativeEntryPath(anchor.cid, entry.position), encodeBlock(entry));
      const app = await authorityRepo(h.app.principal, h.app.key, h.appRecords, 1);
      const appRepo = await authenticateRepo({
        carBytes: app.car,
        expectedDid: h.app.principal,
        trustedSigningKeyDid: h.app.signing,
      });
      const methodEvidence = {
        assuranceClass: 'plc-audit-v1',
        auditBytes: new TextEncoder().encode(JSON.stringify(h.app.rows)),
        selectedTipCid: h.app.selectedTipCid,
      };
      const count = network.calls.length;
      const authenticated = await authenticateAuthorityEntry({
        anchor,
        appRepo,
        entry,
        reader: h.reader(),
        prior,
        appIdentity: { before: methodEvidence, after: methodEvidence },
      });
      const interpreted = interpretNativeAuthority(prior, authenticated);
      assert.deepEqual(interpreted.outcome, { decision: 'effective' });
      assert.equal(network.calls.length, count);
      const whole = nativeAuthoritySnapshot(interpreted.state);
      assert.equal(whole.frontier.position, 1);
      assert.equal(whole.principals[0].epoch, epoch);
      assert.throws(() => observer.assertCapturePrior(observed.capture, interpreted.state), { code: 'envelope' });
      const publication = await observer.observeApp(entry);
      assert.equal(publication.kind, 'captured');
      const appData = observer.readCapture(publication.capture);
      const capturedReader = { get: async (cid) => new Uint8Array(appData.blocks.get(cid)) };
      const proofManifest = await readNativeRecord(
        NATIVE_NSID.content,
        appData.proofs[0],
        await capturedReader.get(appData.proofs[0]),
      );
      const retainedRepo = await authenticateRepo({
        carBytes: await reconstructNativeBytes(proofManifest, capturedReader, 16 * 1024 * 1024),
        expectedDid: h.app.principal,
        trustedSigningKeyDid: h.app.signing,
        expectedRoot: appData.root,
      });
      assert.equal(retainedRepo.rev, appRepo.rev);
      assert.equal(
        (await retainedRepo.lookup(nativeEntryPath(anchor.cid, entry.position), await contentCid(entry))).kind,
        'found',
      );
      cases.push(curve + '/' + method + '/compiled signed capture, offline I2 handoff, app proof and opaque ownership');
      results.push({
        curve,
        method,
        accountDescriptor: data.descriptor,
        entryCid: await contentCid(entry),
        snapshot: whole,
        appDescriptor: appData.descriptor,
        assuranceClass: data.assuranceClass,
      });
    } finally {
      IdentityFetch.prototype.bytesFrom = original;
    }
  }
const paths = [
  'host/native-observer',
  'host/identity-fetch',
  'protocol/native-observer-car',
  'protocol/native-proof',
  'protocol/identity-binding',
  'application/native-authority',
  'application/native-authority-evidence',
];
const modules = await Promise.all(
  paths.map(async (path) => {
    const raw = await readFile(new URL('../../dist/src/' + path + '.js', import.meta.url));
    return {
      path: 'dist/src/' + path + '.js',
      bytes: raw.length,
      sha256: createHash('sha256').update(raw).digest('hex'),
    };
  }),
);
const output = process.env.ATSEQ_OBSERVER_TEST_OUTPUT ?? 'experiments/generated/native-observer';
await mkdir(output, { recursive: true });
await writeFile(
  output + '/compiled.json',
  JSON.stringify(
    {
      node: process.version,
      cases,
      results,
      modules,
      compiledProductModules: true,
      delivery: 'simulated public HTTP; genuine signed method/repository fixtures; no provider trial',
    },
    null,
    2,
  ) + '\n',
);
console.log(JSON.stringify({ node: process.version, cases, compiledProductModules: true }));
