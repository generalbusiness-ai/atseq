/** Historical comparison only. The prior raw-entry route is not linked into current production. */
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { NativeAnchor } from '../../src/protocol/native-wire.ts';
import { authenticateRepo } from '../../src/protocol/native-proof.ts';
import {
  openNativePrefix,
  stageNativePrefix,
  acceptNativePrefix,
  nativePrefixInventory,
} from '../../src/application/native-prefix.ts';
const priorRoot = resolve(process.argv[2]!);
const requiredHead = '526111bfd51172dfb3c06aa3557b3beb0a5d8964';
assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: priorRoot, encoding: 'utf8' }).trim(), requiredHead);
assert.equal(
  execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { cwd: priorRoot, encoding: 'utf8' }).trim(),
  '',
);
const fixturesPath = process.argv[3] ?? '.atseq-local/i2-public-vectors.json',
  raw = await readFile(fixturesPath),
  fixtures = JSON.parse(raw.toString());
const load = (path: string) => import(pathToFileURL(resolve(priorRoot, 'src', path)).href);
const [oldAuthority, oldEvidence, oldWire, oldProof, oldCodec] = await Promise.all([
  load('application/native-authority.ts'),
  load('application/native-authority-evidence.ts'),
  load('protocol/native-wire.ts'),
  load('protocol/native-proof.ts'),
  load('protocol/wire.ts'),
]);
const comparisons = [];
for (const fixture of fixtures) {
  const pin = { app: fixture.genesis.app, genesis: fixture.genesisCid },
    anchor = await NativeAnchor.from(fixture.genesis, pin),
    oldAnchor = await oldWire.NativeAnchor.from(fixture.genesis, pin);
  const identity = {
    assuranceClass: 'plc-audit-v1' as const,
    auditBytes: new Uint8Array(fixture.appIdentity.auditBytes),
    selectedTipCid: fixture.appIdentity.selectedTipCid,
  };
  const retained = new Map<string, Uint8Array>(
    fixture.content.map(([cid, bytes]: [string, number[]]) => [cid, new Uint8Array(bytes)]),
  );
  const reader = {
    async get(cid: string) {
      const bytes = retained.get(cid);
      if (!bytes) throw new Error('Comparison requires complete retained content');
      return new Uint8Array(bytes);
    },
  };
  let oldState = await oldAuthority.openNativeAuthority(oldAnchor),
    prefix = null;
  for (const vector of fixture.vectors) {
    const appRepo = await authenticateRepo({
      carBytes: new Uint8Array(vector.appCar),
      expectedDid: fixture.genesis.app,
      trustedSigningKeyDid: fixture.appKey,
    });
    const publication = { anchor, appRepo, reader, appIdentity: { before: identity, after: identity } };
    prefix = prefix
      ? acceptNativePrefix(prefix, await stageNativePrefix(prefix, publication))
      : await openNativePrefix(publication);
    const oldRepo = await oldProof.authenticateRepo({
      carBytes: new Uint8Array(vector.appCar),
      expectedDid: fixture.genesis.app,
      trustedSigningKeyDid: fixture.appKey,
    });
    const oldEntry = await oldEvidence.authenticateAuthorityEntry({
      anchor: oldAnchor,
      appRepo: oldRepo,
      entry: oldCodec.decodeBlock(new Uint8Array(vector.entry)),
      prior: oldState,
      reader,
      appIdentity: { before: identity, after: identity },
    });
    const interpreted = oldAuthority.interpretNativeAuthority(oldState, oldEntry);
    const full = oldAuthority.nativeAuthoritySnapshot(interpreted.state),
      { requests, retries, consumedObservations, ...compact } = full;
    assert.deepEqual(compact, vector.snapshot);
    assert.deepEqual(interpreted.outcome, vector.outcome);
    assert.deepEqual(nativePrefixInventory(prefix, full.frontier.position), {
      requests,
      retries,
      consumedObservations,
    });
    // Keep the original full DATA as an explicit diagnostic, never accepted new state.
    comparisons.push({
      name: vector.name,
      originalFullAuthority: full,
      compactAuthorityEqual: true,
      prefixIdentityInventoryEqual: true,
      outcomeEqual: true,
    });
    oldState = interpreted.state;
  }
}
const paths = [
  'application/native-authority.ts',
  'application/native-authority-evidence.ts',
  'protocol/native-wire.ts',
  'protocol/native-proof.ts',
];
const capture = {
  node: process.version,
  priorHead: requiredHead,
  fixtureBytes: raw.length,
  fixtureSha256: createHash('sha256').update(raw).digest('hex'),
  comparisons,
  priorSource: await Promise.all(
    paths.map(async (path) => ({
      path: 'src/' + path,
      sha256: createHash('sha256')
        .update(await readFile(resolve(priorRoot, 'src', path)))
        .digest('hex'),
    })),
  ),
};
await writeFile(
  process.env.ATSEQ_NATIVE_PREFIX_PRIOR_CAPTURE ?? '.atseq-local/native-prefix-prior-comparison.json',
  JSON.stringify(capture, null, 2) + '\n',
);
console.log(
  JSON.stringify({
    node: process.version,
    priorHead: requiredHead,
    fixtureSha256: capture.fixtureSha256,
    comparedStates: comparisons.length,
    exactCompactAuthorityAndOutcomes: true,
    exactIdentityInventory: true,
  }),
);
