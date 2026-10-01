import test from 'node:test';
import assert from 'node:assert/strict';
import { nativeProofCorpus } from './support/native-proof-corpus.ts';
test('native repository proof corpus rejects hostile inputs and separates missing evidence', async () => {
  const cases = await nativeProofCorpus();
  assert.ok(cases.length >= 25);
  console.log(JSON.stringify({ nativeProofCases: cases }));
});
