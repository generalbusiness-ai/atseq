/** Optional correctness validation against an exact, unchanged R1 checkout. No timing claim. */
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { pathToFileURL } from 'node:url';
import { strict as assert } from 'node:assert';
import { selectedCar, type E1Fixture } from './fixtures.ts';
import { fixtureEntry } from './validate.ts';
import { matrix } from './workload.ts';
const [checkout, directory, output] = process.argv.slice(2);
if (!checkout || !directory || !output)
  throw new Error('Usage: r1-check.ts EXACT_R1_CHECKOUT FIXTURE_DIRECTORY OUTPUT');
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: checkout, encoding: 'utf8' }).trim();
assert.equal(head, '5bb836a0522bd075cff513d4aaf4766bcbea5b97');
const load = (path: string) => import(pathToFileURL(checkout + '/src/' + path + '.ts').href);
const prefix = await load('application/native-prefix'),
  wire = await load('protocol/native-wire'),
  proof = await load('protocol/native-proof'),
  identity = await load('protocol/identity-binding');
const results = [];
for (const n of [100, 1000, 10_000])
  for (const name of ['bounded-one-actor', 'growing-many-actors-activation-invalid-action']) {
    const fixture: E1Fixture = JSON.parse(gunzipSync(await readFile(`${directory}/${name}-${n}.json.gz`)).toString());
    const anchor = await wire.NativeAnchor.from(fixture.genesis, {
      app: fixture.genesis.app,
      genesis: fixture.genesisCid,
    });
    const method = {
      assuranceClass: 'plc-audit-v1',
      auditBytes: Uint8Array.from(fixture.appIdentity.auditBytes),
      selectedTipCid: fixture.appIdentity.selectedTipCid,
    };
    const binding = await identity.deriveIdentityBinding(anchor.genesis.app, method);
    const retained = new Map(fixture.retainedContent.map(([cid, raw]) => [cid, Uint8Array.from(raw)]));
    const reader = {
      get: async (cid: string) => {
        const raw = retained.get(cid);
        assert.ok(raw);
        return new Uint8Array(raw);
      },
    };
    async function publication(selected: E1Fixture['roots'][number]) {
      const appRepo = await proof.authenticateRepo({
        carBytes: await selectedCar(fixture, selected),
        expectedDid: anchor.genesis.app,
        trustedSigningKeyDid: binding.signingKeyDid,
      });
      return { anchor, appRepo, reader, appIdentity: { before: method, after: method } };
    }
    const target = await publication(fixture.roots.find((row) => row.position === n)!);
    for (const cell of matrix().filter((row) => row.n === n && row.valid)) {
      const base = await publication(fixture.roots.find((row) => row.position === cell.base)!);
      const owner = await prefix.openNativePrefix(base);
      const staged = await prefix.stageNativePrefix(owner, target);
      const before = prefix.nativePrefixWork(staged);
      const signed = fixture.plan.slice(cell.base).filter((row) => row.kind !== 'admit').length;
      assert.equal(before.signatureChecks, signed);
      assert.equal(before.entryLoads, cell.delta);
      assert.equal(before.reusedEntries, cell.base ? 1 : 0);
      assert.equal(before.indexReads, 4 * cell.delta);
      assert.equal(before.stagedIndexWrites, 2 * cell.delta);
      assert.equal(before.indexWrites, 0);
      const accepted = prefix.acceptNativePrefix(owner, staged);
      assert.equal(prefix.nativePrefixWork(staged).indexWrites, 2 * cell.delta);
      assert.equal(prefix.nativePrefixInventory(accepted).requests.length, n);
      assert.equal(prefix.nativePrefixInventory(owner).requests.length, cell.base);
      results.push({
        name,
        ...cell,
        workBeforeAcceptance: before,
        workAfterAcceptance: prefix.nativePrefixWork(staged),
      });
    }
    const owner = await prefix.openNativePrefix(target),
      before = prefix.nativePrefixInventory(owner);
    const original = fixtureEntry(fixture, n).request;
    const receipt = await prefix.lookupNativeRetry(owner, original);
    assert.equal(receipt.position, n);
    assert.deepEqual(receipt.entry.request, original);
    for (const fault of fixture.faults.filter((row) => row.root)) {
      await assert.rejects(prefix.stageNativePrefix(owner, await publication(fault.root!)));
      assert.deepEqual(prefix.nativePrefixInventory(owner), before);
      assert.deepEqual(await prefix.lookupNativeRetry(owner, original), receipt);
      results.push({ name, n, fault: fault.name, rejected: true, acceptedInventoryUnchanged: true });
    }
  }
const report = {
  scope: 'exact R1 correctness and actual stage work counters only; no host/persistence/reader timing',
  r1Head: head,
  fixtureDirectory: directory,
  results,
};
await writeFile(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
