import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const { runNativeWireCorpus } = await import(pathToFileURL(resolve('tests/support/native-wire-corpus.ts')).href);
const results = await runNativeWireCorpus();
assert.equal(results.length, 53);
for (const result of results) assert.equal(result.passed, true, result.detail ?? result.name);
const inherited = JSON.parse(
  await readFile('experiments/post-spike-evidence/2026-10-01/native-wire-foundation/manifest.json', 'utf8'),
);
const sourceHashes = Object.fromEntries(
  await Promise.all(
    Object.keys(inherited.sourceHashes).map(async (path) => [
      path,
      createHash('sha256').update(await readFile(path)).digest('hex'),
    ]),
  ),
);
console.log(
  JSON.stringify(
    {
      format: 'atseq-native-wire-node-integration-conformance',
      version: 1,
      measuredAt: new Date().toISOString(),
      nodeVersion: process.version,
      approvedBase: '3a40d2c5e230cd7698f9cd4b9e8e9729054be33e',
      integratedSource: '7e59d2ec',
      releasedCandidate: 'a75f950ab80c781400572976e2e73b6655a8129a',
      passed: true,
      results,
      sourceHashes,
    },
    null,
    2,
  ),
);
