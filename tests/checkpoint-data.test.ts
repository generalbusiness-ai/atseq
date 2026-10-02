import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { checkpointDataCorpus } from './support/checkpoint-data-corpus.ts';
test('exact retained checkpoint DATA and hostile corpus, without admission capabilities', async () => {
  const raw = gunzipSync(await readFile(new URL('./vectors/checkpoint-data.json.gz', import.meta.url)));
  assert.equal(
    createHash('sha256').update(raw).digest('hex'),
    '885826c82e93de564330c1b1ca3f601b387642a9d5b719a20217e853092d9b41',
  );
  const cases = await checkpointDataCorpus(JSON.parse(raw.toString()));
  await mkdir('.atseq-local', { recursive: true });
  await writeFile(
    process.env.ATSEQ_P4_CAPTURE_PATH ?? '.atseq-local/p4-data-node.json',
    JSON.stringify(
      {
        node: process.version,
        fixtureBytes: raw.length,
        fixtureSha256: createHash('sha256').update(raw).digest('hex'),
        cases,
        noAdmission: true,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(JSON.stringify({ node: process.version, cases: cases.length, noAdmission: true }));
});
