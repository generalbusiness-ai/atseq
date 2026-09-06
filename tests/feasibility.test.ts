import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runCorpus } from '../experiments/corpus.ts';

test('shared feasibility corpus passes in Node', async t => {
  for (const fixture of await runCorpus()) await t.test(fixture.name, () => assert.equal(fixture.passed, true, fixture.detail ?? fixture.name));
});
