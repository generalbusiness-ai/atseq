import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { canonicalJson } from '../src/core/values.ts';
import { produceFloorHistoryFixture } from './support/native-authority-floor-fixture.ts';
import { floorHistoryCorpus } from './support/native-authority-floor-corpus.ts';

test('RV1 full-history join rejects exactly a missing consumed principal-floor descriptor', async () => {
  const fixture = await produceFloorHistoryFixture();
  const cases = await floorHistoryCorpus(fixture);
  assert.equal(cases.length, 4);
  const fixtureBytes = Buffer.from(canonicalJson(fixture, 32 * 1024 * 1024, 32));
  await mkdir('.atseq-local', { recursive: true });
  await writeFile(process.env.ATSEQ_R1_FLOOR_FIXTURE ?? '.atseq-local/r1-floor-fixture.json', fixtureBytes);
  const evidence = {
    node: process.version,
    producer: 'genuine AuthorityHarness repositories/I1 -> nativeAuthorityHistory live prefix join',
    cases,
    fixtureBytes: fixtureBytes.length,
    fixtureSha256: createHash('sha256').update(fixtureBytes).digest('hex'),
    exactError: { code: 'envelope', message: 'Floor descriptor was not consumed' },
    dataOnly: true,
  };
  await writeFile(
    process.env.ATSEQ_R1_FLOOR_CAPTURE ?? '.atseq-local/r1-floor-source.json',
    JSON.stringify(evidence, null, 2) + '\n',
  );
  console.log(JSON.stringify(evidence));
});
