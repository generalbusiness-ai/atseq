import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { extractionWorkload } from './support/native-proof-extraction-fixture.ts';
import { nativeProofExtractionWorkloads } from './support/native-proof-extraction-workload.ts';
test('characterize genuine sparse extraction at100/1k/10k generic records and warm0/1/100 paths', async () => {
  const directory = process.env.ATSEQ_NATIVE_EXTRACTION_CAPTURE_DIR ?? '.atseq-local/native-proof-extraction';
  await mkdir(directory, { recursive: true });
  const file = process.env.ATSEQ_NATIVE_EXTRACTION_WORKLOAD_FIXTURE_PATH;
  const fixtures = file ? JSON.parse(await readFile(file, 'utf8')) : {};
  if (!file)
    for (const records of [100, 1000, 10000, 40000]) fixtures[String(records)] = await extractionWorkload(records);
  await writeFile(directory + '/workload-fixture.json', JSON.stringify(fixtures) + '\n');
  const before = process.memoryUsage(),
    result = await nativeProofExtractionWorkloads(fixtures),
    after = process.memoryUsage();
  assert.equal(result.measurements.length, 13);
  await writeFile(
    directory + '/workload.json',
    JSON.stringify(
      {
        ...result,
        node: process.version,
        memory: {
          before,
          after,
          peakHeap: null,
          interpretation: 'Process snapshots across full workload; no per-operation allocation or peak attribution',
        },
      },
      null,
      2,
    ) + '\n',
  );
  console.log(JSON.stringify(result));
});
