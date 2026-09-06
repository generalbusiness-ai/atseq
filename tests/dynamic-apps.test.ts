import test from 'node:test';
import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { chartFixture, guitarFixture } from '../testdata/apps/fixtures.ts';
import { fixtureApp, fixtureHistory } from '../experiments/runtime-corpus.ts';
import { applicationRuntimeDescriptor } from '../src/runtime/identity.ts';
import type { Json } from '../src/runtime/values.ts';

test('running host loads and interprets two newly generated unrelated applications', async () => {
  const paths = [...Object.keys(applicationRuntimeDescriptor.sources), 'src/runtime/application-profile.json', 'tests/helpers/runtime-child.ts'];
  const hashes = async () => Object.fromEntries(await Promise.all(paths.map(async path => [path, createHash('sha256').update(await readFile(path)).digest('hex')])));
  const before = await hashes();
  const child = fork(new URL('./helpers/runtime-child.ts', import.meta.url), [], { execArgv: ['--import', 'tsx'], stdio: ['ignore', 'ignore', 'ignore', 'ipc'] });
  const exited = new Promise<void>(resolve => child.once('exit', () => resolve()));
  let sequence = 0;
  const waiting = new Map<number, { resolve: (value: any) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> }>();
  const ready = new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Host startup timed out')), 10_000);
    child.on('message', (message: any) => {
      if (message.ready) { clearTimeout(timer); resolve(); return; }
      const pending = waiting.get(message.id); if (!pending) return;
      clearTimeout(pending.timer); waiting.delete(message.id);
      if (message.error) pending.reject(new Error(message.error)); else pending.resolve(message.result);
    });
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('exit', () => { clearTimeout(timer); reject(new Error('Host exited before ready')); });
  });
  const call = (input: object) => new Promise<any>((resolve, reject) => {
    const id = ++sequence, timer = setTimeout(() => { waiting.delete(id); reject(new Error('Runtime request timed out')); }, 15_000);
    waiting.set(id, { resolve, reject, timer }); child.send({ ...input, id });
  });
  const events: { event: string; title?: string; schema?: string }[] = [];
  try {
    await ready; events.push({ event: 'host-ready' });
    const suffix = randomBytes(5).toString('hex');
    const chart = await chartFixture(`test.generated${suffix}.rainfall`), guitar = await guitarFixture(`test.generated${suffix}.guitar`);
    events.push({ event: 'definitions-generated' });
    await mkdir('experiments/generated/dynamic-apps', { recursive: true });
    for (const [index, fixture] of [chart, guitar].entries()) {
      const app = await fixtureApp(fixture.bundle, index === 0 ? 'did:plc:eeeeeeeeeeeeeeeeeeeeeeee' : 'did:plc:ffffffffffffffffffffffff');
      const initial = await call({ operation: 'open', genesis: app.anchor.genesis, anchor: app.anchor.cid, car: [...await fixture.bundle.write()] });
      assert.equal(initial.projection.frontier.position, 0);
      const payload: Record<string, Json> = index === 0 ? { day: 'Monday', millimetres: 7 } : { id: 'one', title: 'Example guitar', pricePence: 12500 };
      const history = await fixtureHistory(app, [{ action: fixture.action, payload }]);
      const interpreted = await call({ operation: 'catchUp', app: app.anchor.genesis.app, anchor: app.anchor.cid, head: history.head, entries: history.entries });
      assert.equal(interpreted.projection.frontier.position, 1);
      assert.deepEqual(interpreted.projection.state, index === 0 ? { readings: [payload] } : { candidates: [payload], selected: '' });
      const query = await call({ operation: 'query', app: app.anchor.genesis.app, anchor: app.anchor.cid, name: 'summary', params: {} });
      assert.deepEqual(query.result, { $type: 'test.atseq.defs#queryAvailable', value: index === 0 ? { count: 1, total: 7 } : { count: 1, selected: '' } });
      const name = index === 0 ? 'rainfall' : 'guitar';
      await writeFile(`experiments/generated/dynamic-apps/${name}.car`, await fixture.bundle.write());
      await writeFile(`experiments/generated/dynamic-apps/${name}.json`, JSON.stringify({ genesis: app.anchor.genesis, anchor: app.anchor.cid, history, projection: interpreted.projection, query }, null, 2) + '\n');
      events.push({ event: 'application-interpreted', title: fixture.manifest.title, schema: fixture.action });
    }
    const after = await hashes(); assert.deepEqual(after, before);
    const evidencePaths = [...paths, 'tests/dynamic-apps.test.ts', 'testdata/apps/fixtures.ts', 'experiments/runtime-corpus.ts', 'package.json', 'package-lock.json'];
    const sourceHashes = Object.fromEntries(await Promise.all(evidencePaths.map(async path => [path, createHash('sha256').update(await readFile(path)).digest('hex')])));
    await mkdir('experiments/generated', { recursive: true });
    await writeFile('experiments/generated/dynamic-results.json', JSON.stringify({ passed: true, measuredAt: new Date().toISOString(), nodeVersion: process.version, fixtureGeneration: true, autonomousAgentGeneration: false, hostProcessStartedFirst: true, events, before, after, sourceHashes }, null, 2) + '\n');
  } finally {
    for (const pending of waiting.values()) clearTimeout(pending.timer);
    child.kill('SIGKILL'); await exited;
  }
});
