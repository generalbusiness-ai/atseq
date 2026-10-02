/** Run the shared corpus against emitted runtime modules, not source imports. */
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';
const hash = (raw) => createHash('sha256').update(raw).digest('hex');
await mkdir('.atseq-local', { recursive: true });
const source = await readFile('tests/support/native-outcome-corpus.ts', 'utf8');
// Only the test driver loses its type annotations. Runtime imports below must
// resolve to the actual build's JavaScript, never to stripped source modules.
let emitted = stripTypeScriptTypes(source);
const modules = ['core/errors', 'core/values', 'protocol/native-outcome', 'protocol/checkpoint-data'];
const moduleHashes = {};
for (const name of modules) {
  const before = `from '../../src/${name}.ts'`;
  assert.ok(emitted.includes(before), `Missing shared-corpus import ${name}`);
  emitted = emitted.replaceAll(before, `from '../dist/src/${name}.js'`);
  moduleHashes[`dist/src/${name}.js`] = hash(await readFile(`dist/src/${name}.js`));
}
assert.ok(!emitted.includes("from '../../src/"), 'Source runtime import survived');
const corpusFile = resolve('.atseq-local/native-outcome-corpus-compiled.mjs');
await writeFile(corpusFile, emitted);
const fixtureRaw = gunzipSync(await readFile('tests/vectors/checkpoint-data.json.gz'));
const tablesRaw = gunzipSync(await readFile('tests/vectors/native-outcome/shared-outcome-tables.json.gz'));
const vectorsRaw = gunzipSync(await readFile('tests/vectors/native-outcome/outcome-vectors.json.gz'));
assert.equal(hash(fixtureRaw), '885826c82e93de564330c1b1ca3f601b387642a9d5b719a20217e853092d9b41');
assert.equal(hash(tablesRaw), '787879fb8306b0fd13870bd5109dc9a1fa372172b664ae7dda074d15f7157b93');
assert.equal(hash(vectorsRaw), '7eb0c5075f437a94d62db5e08026c2ad816afb5b1380c7e8486504838f608cda');
const { nativeOutcomeCorpus } = await import(pathToFileURL(corpusFile).href);
const cases = await nativeOutcomeCorpus(
  { tables: JSON.parse(tablesRaw), vectors: JSON.parse(vectorsRaw) },
  JSON.parse(fixtureRaw),
);
const evidence = {
  node: process.version,
  cases,
  corpusSourceSha256: hash(source),
  compiledCorpusSha256: hash(emitted),
  moduleHashes,
  tablesSha256: hash(tablesRaw),
  vectorsSha256: hash(vectorsRaw),
  fixtureSha256: hash(fixtureRaw),
  emittedRuntimeModules: true,
  noAdmission: true,
};
await writeFile(
  process.env.ATSEQ_OUTCOME_COMPILED_CAPTURE_PATH ?? '.atseq-local/native-outcome-compiled.json',
  JSON.stringify(evidence, null, 2) + '\n',
);
console.log(JSON.stringify(evidence));
