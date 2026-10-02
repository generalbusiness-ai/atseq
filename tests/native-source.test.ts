import test from 'node:test';
import assert from 'node:assert/strict';
import { nativeSourceCorpus } from './support/native-source-corpus.ts';

test('private native source owner agrees with retained literals and hostile source cases', async () => {
  const results = await nativeSourceCorpus();
  assert.ok(results.length >= 40);
  console.log(JSON.stringify({ node: process.version, passed: results }));
});
