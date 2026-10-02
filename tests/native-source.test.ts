import test from 'node:test';
import assert from 'node:assert/strict';
import { nativeSourceCorpus } from './support/native-source-corpus.ts';

test('private native source owner agrees with retained literals and hostile source cases', async () => {
  const results = await nativeSourceCorpus();
  assert.ok(results.length >= 40);
  console.log(JSON.stringify({ node: process.version, passed: results }));
});

import { nativeSourceFaultBundles } from './support/native-source-fault-bundles.ts';
test('actual source call sites propagate foreign interpreter and owner-input parser faults', async () => {
  const results: string[] = [];
  for (const bundle of await nativeSourceFaultBundles()) {
    const probe = await import('data:text/javascript;base64,' + Buffer.from(bundle.code).toString('base64'));
    assert.equal(await probe.foreignSourceFaultProbe(), true);
    results.push(bundle.name);
  }
  console.log(JSON.stringify({ node: process.version, testOnlyFaultBundles: results }));
});
