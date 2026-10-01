import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { openLocalGenerations } from '../src/host/local-generations.ts';
import { LocalStorageError } from '../src/core/local-generations.ts';
import { localGenerationsCorpus } from './support/local-generations-corpus.ts';

test('real SQLite generations, coherent abort/crash recovery and incremental retirement', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'atseq-local-generations-'));
  const cases: string[] = [];
  const capture: Record<string, unknown> = { node: process.version };
  try {
    cases.push(
      ...(await localGenerationsCorpus((name, limits, scope = 'fixture-scope') =>
        openLocalGenerations(join(dir, `${name}.sqlite`), scope, limits),
      )),
    );
    const path = join(dir, 'abort.sqlite'),
      store = await openLocalGenerations(path, 'abort-scope');
    try {
      await store.commit(null, new Uint8Array([1]), [{ kind: 'outcomes', key: '1', value: new Uint8Array([11]) }]);
      const original = DatabaseSync.prototype.exec,
        failure = Error('isolated commit fault');
      DatabaseSync.prototype.exec = function (sql: string) {
        if (sql === 'COMMIT') throw failure;
        return original.call(this, sql);
      };
      try {
        await assert.rejects(
          store.commit(1, new Uint8Array([2]), [{ kind: 'outcomes', key: '2', value: new Uint8Array([22]) }]),
          (e) => e === failure,
        );
      } finally {
        DatabaseSync.prototype.exec = original;
      }
      assert.equal((await store.current())!.id, 1);
      assert.equal(await store.row(1, 'outcomes', '2'), undefined);
      cases.push('actual SQLite COMMIT failure preserves original error and rolls back all changes');
    } finally {
      await store.close();
    }
    const full = await openLocalGenerations(join(dir, 'full.sqlite'), 'full-scope', { rowBytes: 8 * 1024 * 1024 });
    try {
      await full.commit(null, new Uint8Array([1]), []);
      const original = DatabaseSync.prototype.exec;
      let maxPages: unknown;
      DatabaseSync.prototype.exec = function (sql: string) {
        if (sql === 'BEGIN IMMEDIATE') {
          DatabaseSync.prototype.exec = original;
          maxPages = this.prepare('PRAGMA page_count').get()!.page_count;
          original.call(this, `PRAGMA max_page_count=${String(maxPages)}`);
        }
        return original.call(this, sql);
      };
      let observed: unknown;
      try {
        await assert.rejects(
          full.commit(1, new Uint8Array([2]), [
            { kind: 'evidence', key: 'large', value: new Uint8Array(4 * 1024 * 1024).fill(11) },
          ]),
          (e) => {
            if (e instanceof LocalStorageError && e.code === 'quota') {
              const cause = e.cause as { code?: string; errcode?: number };
              observed = { code: e.code, causeCode: cause.code, causeErrcode: cause.errcode };
              return cause.code === 'ERR_SQLITE_ERROR' && cause.errcode === 13;
            }
            return false;
          },
        );
      } finally {
        DatabaseSync.prototype.exec = original;
      }
      assert.equal((await full.current())!.id, 1);
      assert.equal(await full.row(1, 'evidence', 'large'), undefined);
      capture.quota = { attemptedBytes: 4 * 1024 * 1024, maxPages, observed, generation: 1 };
      cases.push('actual SQLite FULL engine failure preserves prior generation and typed quota cause');
    } finally {
      await full.close();
    }
    for (const phase of ['before', 'after']) {
      const path = join(dir, `crash-${phase}.sqlite`),
        store = await openLocalGenerations(path, 'crash-scope');
      await store.commit(null, new Uint8Array([1]), [{ kind: 'outcomes', key: '1', value: new Uint8Array([11]) }]);
      const child = spawn(
        process.execPath,
        ['--import', 'tsx', 'tests/support/local-generation-crash.ts', path, phase],
        { stdio: ['ignore', 'pipe', 'pipe'] },
      );
      let stderr = '';
      child.stderr.on('data', (data) => (stderr += String(data)));
      try {
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => reject(Error(`Crash probe timed out: ${stderr}`)), 10000);
          child.stdout.on('data', (data) => {
            if (String(data).includes(`armed ${phase}`)) {
              clearTimeout(timer);
              resolve();
            }
          });
          child.once('exit', (code) => {
            clearTimeout(timer);
            reject(Error(`Probe exited ${code}: ${stderr}`));
          });
        });
        assert.equal((await store.current())!.id, phase === 'before' ? 1 : 2);
        if (phase === 'before')
          await assert.rejects(
            store.commit(1, new Uint8Array([9]), []),
            (e) => e instanceof LocalStorageError && e.code === 'busy',
          );
      } finally {
        const exited = once(child, 'exit');
        child.kill('SIGKILL');
        await exited;
        await store.close();
      }
      const reopened = await openLocalGenerations(path, 'crash-scope');
      try {
        const id = phase === 'before' ? 1 : 2;
        assert.equal((await reopened.current())!.id, id);
        assert.deepEqual([...(await reopened.row(id, 'outcomes', '1'))!], [11]);
        assert.deepEqual(
          await reopened.row(id, 'outcomes', '2'),
          phase === 'before' ? undefined : new Uint8Array([22]),
        );
      } finally {
        await reopened.close();
      }
      cases.push(
        `SIGKILL ${phase} real SQLite COMMIT restores coherent ${phase === 'before' ? 'old' : 'new'} generation`,
      );
    }
    const manyPath = join(dir, 'many.sqlite'),
      many = await openLocalGenerations(manyPath, 'many-scope');
    try {
      const rows = Array.from({ length: 500 }, (_, i) => ({
        kind: 'outcomes' as const,
        key: String(i).padStart(4, '0'),
        value: new Uint8Array(256).fill(i % 256),
      }));
      await many.commit(null, new Uint8Array([1]), rows);
      await many.commit(1, new Uint8Array([2]), [{ kind: 'outcomes', key: '0000', value: new Uint8Array([2]) }]);
      const inspect = new DatabaseSync(manyPath);
      try {
        const precedingKeys = inspect.prepare('SELECT count(*) AS count FROM local_rows WHERE generation=2').get()!
          .count;
        const plan = inspect.prepare('EXPLAIN QUERY PLAN SELECT kind,key FROM local_rows WHERE generation=?').all(2);
        const originalPrepare = DatabaseSync.prototype.prepare;
        let actualRetirementKeys = 0;
        DatabaseSync.prototype.prepare = function (sql: string) {
          const statement = originalPrepare.call(this, sql);
          if (sql === 'SELECT kind,key FROM local_rows WHERE generation=?') {
            const all = statement.all;
            statement.all = function (...parameters) {
              const rows: ReturnType<typeof all> = Reflect.apply(all, this, parameters);
              actualRetirementKeys += rows.length;
              return rows;
            };
          }
          return statement;
        };
        try {
          await many.commit(2, new Uint8Array([3]), [{ kind: 'outcomes', key: '0000', value: new Uint8Array([3]) }]);
        } finally {
          DatabaseSync.prototype.prepare = originalPrepare;
        }
        assert.equal(actualRetirementKeys, 1);
        assert.equal(precedingKeys, 1);
        assert.equal(inspect.prepare('SELECT count(*) AS count FROM local_rows').get()!.count, 501);
        assert.equal((await many.page(3, 'outcomes', undefined, 10)).rows.length, 10);
        assert.deepEqual([...(await many.row(3, 'outcomes', '0499'))!], new Array(256).fill(499 % 256));
        assert.ok(plan.some((row) => String(row.detail).includes('local_rows_generation')));
        const used = inspect.prepare('SELECT bytes,rows FROM local_state').get()!;
        const actual = inspect
          .prepare(
            `SELECT (SELECT coalesce(sum(size),0) FROM local_rows)+(SELECT coalesce(sum(length(metadata)+8),0) FROM local_generations)+(SELECT coalesce(sum(length(reference)+8),0) FROM local_pins)+length(scope) AS bytes FROM local_state`,
          )
          .get()!;
        assert.equal(used.bytes, actual.bytes);
        capture.incremental = {
          historyRows: 500,
          precedingChangedKeys: precedingKeys,
          actualRetirementKeys,
          storedVersions: 501,
          sqlPlan: plan,
          logicalUsage: used,
        };
        cases.push('500-row history one-key retirement uses generation index and exact incremental accounting');
      } finally {
        inspect.close();
      }
    } finally {
      await many.close();
    }
    const sources: Record<string, string> = {};
    for (const path of [
      'src/core/local-generations.ts',
      'src/host/local-generations.ts',
      'tests/support/local-generations-corpus.ts',
      'tests/support/local-generation-crash.ts',
      'tests/local-generations.test.ts',
    ])
      sources[path] = createHash('sha256')
        .update(await readFile(path))
        .digest('hex');
    await mkdir('experiments/generated/local-generations', { recursive: true });
    await writeFile(
      `experiments/generated/local-generations/node-${process.version}.json`,
      JSON.stringify({ ...capture, cases, sources }, null, 2) + '\n',
    );
    console.log(JSON.stringify({ node: process.version, cases: cases.length, incremental: capture.incremental }));
  } finally {
    await rm(dir, { recursive: true });
  }
});
