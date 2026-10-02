import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import {
  nativeObserverCarCorpus,
  replayObserverFixtures,
  type ObserverAppFixture,
} from './support/native-observer-portable.ts';
import { nativeObserverHostCorpus } from './support/native-observer-fixture.ts';
test('native observer retains signed proof/method evidence, refuses stale targets and hands off offline', async () => {
  const result = await nativeObserverHostCorpus();
  assert.ok(result.cases.length >= 20);
  const carCases = await nativeObserverCarCorpus();
  const replayCases = await replayObserverFixtures(result.fixtures, result.appCaptures as ObserverAppFixture[]);
  result.cases.push(...carCases, ...replayCases);
  const output = process.env.ATSEQ_OBSERVER_TEST_OUTPUT ?? 'experiments/generated/native-observer';
  await mkdir(output, { recursive: true });
  await writeFile(output + '/host.json', JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ node: process.version, cases: result.cases, delivery: result.delivery }));
});
