/** Reverify retained public P1 CAR inputs without starting or reseeding a PDS. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fromUint8Array } from '@atcute/car';
import * as CID from '@atcute/cid';
import { authenticateRepo, VerifiedRepoBlocks, NATIVE_CACHE_HOST } from '../src/protocol/native-proof.ts';
import { decodeBlock } from '../src/protocol/wire.ts';
import { car, nativeProofCorpus } from '../tests/support/native-proof-corpus.ts';

const directory = 'experiments/generated/native-proof/pds';
const evidence = 'experiments/post-spike-evidence/2026-10-01/native-proofs';
const hash = (bytes: Uint8Array | string) => createHash('sha256').update(bytes).digest('hex');
const originalBytes = await readFile(`${evidence}/pds-results.json`);
const capture = JSON.parse(originalBytes.toString('utf8'));
const originalReverification = await readFile(`${evidence}/reverified.json`);
const corpus = await nativeProofCorpus();
const browser = JSON.parse(await readFile('experiments/generated/native-proof/browser.json', 'utf8'));
assert.deepEqual(browser.cases, corpus, 'Node and Chromium corpus names differ');
const inputs = new Map<string, { bytes: number; sha256: string }>();
const results = [];
for (const result of capture.results) {
  const load = async (name: string, expected: string) => {
    const bytes = new Uint8Array(await readFile(`${directory}/${name}`));
    assert.equal(hash(bytes), expected, `${name} differs from retained capture`);
    inputs.set(name, { bytes: bytes.length, sha256: expected });
    return bytes;
  };
  const before = await load(`${result.size}-before.car`, result.beforeSha256);
  const delta = await load(`${result.size}-delta${result.delta}.car`, result.diffSha256);
  const full = await load(`${result.size}-delta${result.delta}-full.car`, result.fullSha256);
  const options = { expectedDid: result.did, trustedSigningKeyDid: result.trustedSigningKeyDid };
  const cache = new VerifiedRepoBlocks(NATIVE_CACHE_HOST);
  await authenticateRepo({ ...options, expectedRoot: result.beforeRoot, carBytes: before, blocks: cache });
  const selected = await authenticateRepo({ ...options, expectedRoot: result.root, carBytes: delta, blocks: cache });
  for (let n = result.size + 1; n <= result.size + result.delta; n++) {
    const found = await selected.lookup(`ai.generalbusiness.atseq.probe/${String(n).padStart(12, '0')}`);
    assert.equal(found.kind, 'found');
    if (found.kind === 'found') assert.equal((decodeBlock(found.bytes) as { position: number }).position, n);
  }
  const tree = await selected.validateTree();
  assert.deepEqual(tree, result.canonicalTree);
  const oldPath = result.oldPathMissingFromDiff.path;
  assert.equal((await selected.lookup(oldPath)).kind, 'found');
  const sparse = await authenticateRepo({ ...options, expectedRoot: result.root, carBytes: delta });
  assert.deepEqual(await sparse.lookup(oldPath), { kind: 'missing', cid: result.oldPathMissingFromDiff.cid });
  const partialBlocks = new Map([...fromUint8Array(before)].map((block) => [CID.toString(block.cid), block.bytes]));
  assert.equal(partialBlocks.delete(result.oldPathMissingFromDiff.cid), true);
  const partialCache = new VerifiedRepoBlocks(NATIVE_CACHE_HOST);
  await authenticateRepo({
    ...options,
    expectedRoot: result.beforeRoot,
    carBytes: await car(result.beforeRoot, partialBlocks),
    blocks: partialCache,
  });
  const partial = await authenticateRepo({
    ...options,
    expectedRoot: result.root,
    carBytes: delta,
    blocks: partialCache,
  });
  assert.equal((await partial.lookup(oldPath)).kind, 'missing');
  await authenticateRepo({ ...options, expectedRoot: result.root, carBytes: full, blocks: partialCache });
  assert.equal((await partial.lookup(oldPath)).kind, 'found');
  assert.deepEqual(await partial.validateTree(), tree);
  const standalone = await authenticateRepo({ ...options, expectedRoot: result.root, carBytes: full });
  assert.deepEqual(await standalone.validateTree(), tree);
  results.push({
    size: result.size,
    delta: result.delta,
    root: result.root,
    canonicalTree: tree,
    newEntriesVerified: result.delta,
    retainedOldPathVerified: true,
    diffAloneMissing: true,
    deliberatelyOmittedNodeMissing: true,
    sameRootFullExportRecovery: true,
    standaloneFullTreeVerified: true,
  });
}
const sourceFiles = [
  'src/protocol/native-proof.ts',
  'src/protocol/wire.ts',
  'src/integrity/node.ts',
  'tests/support/native-proof-corpus.ts',
  'scripts/reverify-native-proof.ts',
  'npm-shrinkwrap.json',
];
const sourceSha256 = Object.fromEntries(
  await Promise.all(sourceFiles.map(async (file) => [file, hash(await readFile(file))])),
);
await writeFile(
  `${evidence}/reverified-review.json`,
  JSON.stringify(
    {
      assessment: '7f26f640fa05c85716489d3197b10ce51032a868',
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      originalCapture: {
        path: `${evidence}/pds-results.json`,
        sha256: hash(originalBytes),
        fixtureLockSha256: capture.pdsFixtureLockSha256,
      },
      historicalReverification: {
        path: `${evidence}/reverified.json`,
        sha256: hash(originalReverification),
        correction:
          'The historical scope said current31casecorpus; its actual associated corpus contained 33 cases. Original bytes are preserved.',
      },
      scope:
        'Selected root/DID/signature, every new entry, retained old path, whole canonical tree, diff-only and deliberate omission missingness, same-root full recovery, standalone full tree; shared current Node/Chromium corpus',
      currentCorpusCases: corpus.length,
      currentCorpus: corpus,
      chromium: {
        version: browser.version,
        corpusCases: browser.cases.length,
        bundleBytes: browser.bundleBytes,
        bundleSha256: browser.bundleSha256,
      },
      sourceSha256,
      inputs: Object.fromEntries(inputs),
      results,
    },
    null,
    2,
  ) + '\n',
);
console.log(JSON.stringify({ retainedCases: results.length, retainedCars: inputs.size, corpusCases: corpus.length }));
