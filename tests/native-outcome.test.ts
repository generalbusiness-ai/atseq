import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { nativeOutcomeCorpus } from './support/native-outcome-corpus.ts';
test('shared exact adopted native outcome and checkpoint outcome DATA corpus', async () => {
  const rawTables = gunzipSync(
    await readFile(new URL('./vectors/native-outcome/shared-outcome-tables.json.gz', import.meta.url)),
  );
  const rawVectors = gunzipSync(
    await readFile(new URL('./vectors/native-outcome/outcome-vectors.json.gz', import.meta.url)),
  );
  assert.equal(
    createHash('sha256').update(rawTables).digest('hex'),
    '787879fb8306b0fd13870bd5109dc9a1fa372172b664ae7dda074d15f7157b93',
  );
  assert.equal(
    createHash('sha256').update(rawVectors).digest('hex'),
    '7eb0c5075f437a94d62db5e08026c2ad816afb5b1380c7e8486504838f608cda',
  );
  const fixture = JSON.parse(
    gunzipSync(await readFile(new URL('./vectors/checkpoint-data.json.gz', import.meta.url))).toString(),
  );
  const cases = await nativeOutcomeCorpus(
    { tables: JSON.parse(rawTables.toString()), vectors: JSON.parse(rawVectors.toString()) },
    fixture,
  );
  await mkdir('.atseq-local', { recursive: true });
  await writeFile(
    process.env.ATSEQ_OUTCOME_CAPTURE_PATH ?? '.atseq-local/native-outcome-node.json',
    JSON.stringify({ node: process.version, cases, noAdmission: true }, null, 2) + '\n',
  );
  console.log(JSON.stringify({ node: process.version, cases: cases.length, noAdmission: true }));
});
