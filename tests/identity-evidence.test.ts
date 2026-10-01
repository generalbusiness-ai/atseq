import test from 'node:test';
import assert from 'node:assert/strict';
import { identityCorpus } from './support/identity-corpus.ts';

test('retained identity JSON and PLC canonical-tip corpus', async () => {
  const cases = await identityCorpus();
  assert.ok(cases.length >= 35);
  console.log(JSON.stringify({ identityCases: cases }));
});
