import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createExtractionFixtures } from './support/native-proof-extraction-fixture.ts';
import { nativeProofExtractionCorpus } from './support/native-proof-extraction-corpus.ts';
test('genuine native extraction preserves scoped evidence and bounded refusals', async () => {
  const directory = process.env.ATSEQ_NATIVE_EXTRACTION_CAPTURE_DIR ?? '.atseq-local/native-proof-extraction';
  await mkdir(directory, { recursive: true });
  const fixturePath = process.env.ATSEQ_NATIVE_EXTRACTION_FIXTURE_PATH;
  const fixture = fixturePath ? JSON.parse(await readFile(fixturePath, 'utf8')) : await createExtractionFixtures();
  await writeFile(directory + '/fixture.json', JSON.stringify(fixture) + '\n');
  const result = await nativeProofExtractionCorpus(fixture);
  assert.equal(result.cases.length, 17);
  await writeFile(directory + '/source.json', JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
});
