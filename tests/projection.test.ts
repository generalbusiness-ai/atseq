import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { chartFixture } from '../testdata/apps/fixtures.ts';
import { fixtureApp, fixtureHistory } from '../experiments/runtime-corpus.ts';
import { Folder, type Projection } from '../src/runtime/folder.ts';
import { projectionFile } from '../src/host/projection.ts';

test('host snapshot stays coherent during writes and rebuilds after cache deletion', async () => {
  await mkdir('.atseq-local', { recursive: true });
  const directory = await mkdtemp('.atseq-local/projection-'), path = join(directory, 'snapshot.json');
  try {
    const fixture = await chartFixture(), app = await fixtureApp(fixture.bundle);
    const history = await fixtureHistory(app, Array.from({ length: 20 }, (_, i) => ({ action: fixture.action, payload: { day: `Day ${i}`, millimetres: 1 } })));
    const folder = await Folder.open(app.anchor, fixture.bundle, projectionFile(path));
    let finished = false, observations = 0;
    const catchUp = folder.catchUp(history.head, history.entries).finally(() => { finished = true; });
    do {
      const snapshot = JSON.parse(await readFile(path, 'utf8')) as Projection;
      assert.equal(snapshot.outcomes.length, snapshot.frontier.position);
      assert.equal((snapshot.state as any).readings.length, snapshot.frontier.position);
      observations++;
    } while (!finished);
    const original = await catchUp; assert.ok(observations > 0);
    assert.equal(original.projection.frontier.position, 20);
    assert.deepEqual((await folder.query('summary', {})).result, { $type: 'test.atseq.defs#queryAvailable', value: { count: 20, total: 20 } });
    await rm(path);
    const restarted = await Folder.open(app.anchor, fixture.bundle, projectionFile(path));
    const replayed = await restarted.catchUp(history.head, history.entries);
    assert.deepEqual(replayed, original);
    assert.deepEqual(JSON.parse(await readFile(path, 'utf8')), original.projection);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
