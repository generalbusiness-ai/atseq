import test from 'node:test';
import assert from 'node:assert/strict';
import { Lexicons } from '@atproto/lexicon';
import { Schemas } from '../src/definition/schemas.ts';
import { Folder } from '../src/application/folder.ts';
import { fixtureApp, fixtureHistory } from './support/runtime-corpus.ts';
import { guitarFixture } from '../testdata/apps/fixtures.ts';
import { observeInterpretation } from '../scripts/performance-interpretation-observer.ts';

test('interpretation observation preserves exact projection and restores all methods', async () => {
  const fixture = await guitarFixture();
  const app = await fixtureApp(fixture.bundle);
  const history = await fixtureHistory(app, [
    { action: fixture.action, payload: { id: 'one', title: 'One', pricePence: 100 } },
    { action: fixture.action, payload: { id: 'two', title: 'Two', pricePence: 200 } },
  ]);
  const expected = await (await Folder.open(app.anchor, fixture.bundle)).catchUp(history.head, history.entries);
  const folder = await Folder.open(app.anchor, fixture.bundle);
  const originals = [Schemas.prototype.validate, Lexicons.prototype.validate, structuredClone];
  const observed = await observeInterpretation(folder, () => folder.catchUp(history.head, history.entries));
  assert.deepEqual(observed.result, expected);
  assert.equal(observed.stages.actionValidation.calls, 2);
  assert.equal(observed.stages.stateValidation.calls, 2);
  assert.equal(observed.stages.foldRegion.calls, 2);
  assert.ok(observed.stages.structuredClone.calls > 0);
  assert.ok(observed.stages.lexiconValidation.calls >= 4);
  assert.deepEqual([Schemas.prototype.validate, Lexicons.prototype.validate, structuredClone], originals);
  await assert.rejects(
    observeInterpretation(folder, async () => {
      structuredClone(() => undefined);
    }),
  );
  assert.deepEqual([Schemas.prototype.validate, Lexicons.prototype.validate, structuredClone], originals);
  await observeInterpretation(folder, async () => {
    await assert.rejects(
      observeInterpretation(folder, async () => 1),
      /isolation/,
    );
  });
  assert.deepEqual([Schemas.prototype.validate, Lexicons.prototype.validate, structuredClone], originals);
});
