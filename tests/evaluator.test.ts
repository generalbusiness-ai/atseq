import test from 'node:test';
import assert from 'node:assert/strict';
import { Evaluator } from '../src/browser/evaluator.ts';

test('worker requests honor longer replay budgets and retain the shorter preview default', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const original = Object.getOwnPropertyDescriptor(globalThis, 'Worker');
  const workers: FakeWorker[] = [];
  class FakeWorker {
    onmessage?: (event: any) => void; onerror?: () => void; terminated = false; message: any;
    constructor() { workers.push(this); }
    postMessage(message: any) { this.message = message; }
    terminate() { this.terminated = true; }
  }
  Object.defineProperty(globalThis, 'Worker', { configurable: true, value: FakeWorker });
  t.after(() => { if (original) Object.defineProperty(globalThis, 'Worker', original); else Reflect.deleteProperty(globalThis, 'Worker'); });
  const evaluator = new Evaluator(), long = evaluator.call('sync', {}, 120_000);
  t.mock.timers.tick(15_001); assert.equal(workers[0]!.terminated, false);
  workers[0]!.onmessage!({ data: { id: workers[0]!.message.id, result: 'complete' } });
  assert.equal(await long, 'complete');
  const preview = evaluator.call('preview'), rejected = assert.rejects(preview, /timed out/);
  t.mock.timers.tick(15_001); await rejected; assert.equal(workers[0]!.terminated, true);
  assert.equal(workers.length, 2);
});
