import { DatabaseSync } from 'node:sqlite';
import { writeSync } from 'node:fs';
import { openLocalGenerations } from '../../src/host/local-generations.ts';
const [path, phase] = process.argv.slice(2);
if (!path || !['before', 'after'].includes(phase ?? '')) throw Error('Invalid isolated crash probe');
const store = await openLocalGenerations(path, 'crash-scope');
const original = DatabaseSync.prototype.exec;
DatabaseSync.prototype.exec = function (sql: string) {
  if (sql === 'COMMIT') {
    if (phase === 'after') original.call(this, sql);
    writeSync(1, `armed ${phase}\n`);
    // Only this isolated test child is blocked. Parent kills the real process
    // with its production transaction either open or durably committed.
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0);
    throw Error('Crash probe unexpectedly resumed');
  }
  return original.call(this, sql);
};
try {
  await store.commit(1, new Uint8Array([2]), [{ kind: 'outcomes', key: '2', value: new Uint8Array([22]) }]);
} finally {
  DatabaseSync.prototype.exec = original;
  await store.close();
}
