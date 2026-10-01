import { LocalStorageError, type LocalGenerations, type LocalLimits } from '../../src/core/local-generations.ts';
export type OpenStore = (name: string, limits?: Partial<LocalLimits>, scope?: string) => Promise<LocalGenerations>;
function check(value: unknown, message: string): asserts value {
  if (!value) throw Error(message);
}
function same(value: unknown, expected: unknown) {
  check(
    JSON.stringify(value) === JSON.stringify(expected),
    `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(value)}`,
  );
}
async function error(code: string, work: () => Promise<unknown>) {
  try {
    await work();
  } catch (e) {
    check(e instanceof LocalStorageError && e.code === code, `Expected ${code}, got ${String(e)}`);
    return;
  }
  throw Error(`Expected ${code}`);
}
const bytes = (...v: number[]) => new Uint8Array(v);
export async function localGenerationsCorpus(open: OpenStore) {
  const passed: string[] = [];
  let store = await open('owned');
  try {
    check((await store.current()) === undefined, 'Empty store');
    const metadata = bytes(1),
      row = bytes(2);
    const commit = store.commit(null, metadata, [
      { kind: 'outcomes', key: 'a', value: row },
      { kind: 'outcomes', key: 'b', value: bytes(3) },
    ]);
    metadata[0] = 9;
    row[0] = 9;
    same(await commit, 1);
    same([...(await store.read(1)).metadata], [1]);
    same([...(await store.row(1, 'outcomes', 'a'))!], [2]);
    const read = await store.read(1);
    read.metadata[0] = 8;
    const readRow = (await store.row(1, 'outcomes', 'a'))!;
    readRow[0] = 8;
    same([...(await store.read(1)).metadata], [1]);
    same([...(await store.row(1, 'outcomes', 'a'))!], [2]);
    passed.push('owned inputs and reads');
    const first = await store.page(1, 'outcomes', undefined, 1);
    same(
      first.rows.map((r) => r.key),
      ['a'],
    );
    same(first.next, 'a');
    first.rows[0]!.value[0] = 8;
    same(
      (await store.page(1, 'outcomes', 'a', 1)).rows.map((r) => r.key),
      ['b'],
    );
    same([...(await store.row(1, 'outcomes', 'a'))!], [2]);
    passed.push('owned bounded pages');
    await store.commit(1, bytes(4), [
      { kind: 'outcomes', key: 'a', value: bytes(5) },
      { kind: 'outcomes', key: 'b', value: null },
      { kind: 'outcomes', key: 'c', value: bytes(6) },
    ]);
    same([...(await store.row(1, 'outcomes', 'a'))!], [2]);
    same([...(await store.row(1, 'outcomes', 'b'))!], [3]);
    same([...(await store.row(2, 'outcomes', 'a'))!], [5]);
    check((await store.row(2, 'outcomes', 'b')) === undefined, 'Deleted row');
    same(
      (await store.page(2, 'outcomes')).rows.map((r) => r.key),
      ['a', 'c'],
    );
    passed.push('exact generation and deletion visibility');
    await error('conflict', () => store.commit(1, bytes(9), []));
    same((await store.current())!.id, 2);
    passed.push('CAS conflict preserves generation');
    await error('input', () =>
      store.commit(2, bytes(9), [
        { kind: 'outcomes', key: 'x', value: bytes(1) },
        { kind: 'outcomes', key: 'x', value: bytes(2) },
      ]),
    );
    await error('input', () => store.page(2, 'outcomes', undefined, 0));
    await error('input', () => store.row(2, 'outcomes', '☃'));
    passed.push('invalid caller inputs');
    await store.close();
    store = await open('owned');
    same((await store.current())!.id, 2);
    same([...(await store.row(1, 'outcomes', 'b'))!], [3]);
    passed.push('durable reopen');
    await error('input', () => open('owned', undefined, 'different-scope'));
    passed.push('scope isolation');
    await store.commit(2, bytes(7), []);
    await error('missing', () => store.read(1));
    same([...(await store.row(3, 'outcomes', 'a'))!], [5]);
    passed.push('bounded predecessor GC preserves baseline rows');
  } finally {
    await store.close();
  }
  store = await open('pins', { generations: 2, pins: 1 });
  try {
    await store.commit(null, bytes(1), [{ kind: 'authority', key: 'x', value: bytes(1) }]);
    await store.pin(1, 'audit');
    await store.pin(1, 'audit');
    await error('quota', () => store.pin(1, 'export'));
    await store.commit(1, bytes(2), [{ kind: 'authority', key: 'x', value: bytes(2) }]);
    await error('conflict', () => store.pin(2, 'audit'));
    await error('quota', () => store.commit(2, bytes(3), [{ kind: 'authority', key: 'x', value: bytes(3) }]));
    same((await store.current())!.id, 2);
    same([...(await store.row(1, 'authority', 'x'))!], [1]);
    passed.push('pin and generation quota abort coherent transaction');
    await store.close();
    store = await open('pins', { generations: 2, pins: 1 });
    await error('quota', () => store.commit(2, bytes(3), []));
    passed.push('pins survive reopen');
    await store.release('audit');
    await store.release('audit');
    await store.commit(2, bytes(3), []);
    await error('missing', () => store.read(1));
    same([...(await store.row(3, 'authority', 'x'))!], [2]);
    passed.push('pin release permits retirement');
  } finally {
    await store.close();
  }
  store = await open('quota', { bytes: 180, rows: 2 });
  try {
    await store.commit(null, bytes(1), [{ kind: 'history', key: 'a', value: bytes(1) }]);
    await error('quota', () => store.commit(1, bytes(2), [{ kind: 'history', key: 'b', value: new Uint8Array(150) }]));
    same((await store.current())!.id, 1);
    check((await store.row(1, 'history', 'b')) === undefined, 'Quota partial row');
    await store.commit(1, bytes(2), [{ kind: 'history', key: 'b', value: bytes(2) }]);
    await error('quota', () => store.commit(2, bytes(3), [{ kind: 'history', key: 'c', value: bytes(3) }]));
    same((await store.current())!.id, 2);
    passed.push('byte and row quotas roll back pointer and rows');
  } finally {
    await store.close();
  }
  const one = await open('race'),
    two = await open('race');
  try {
    const results = await Promise.allSettled([one.commit(null, bytes(1), []), two.commit(null, bytes(2), [])]);
    same(results.filter((r) => r.status === 'fulfilled').length, 1);
    const failed = results.find((r) => r.status === 'rejected') as PromiseRejectedResult;
    check(failed.reason instanceof LocalStorageError && failed.reason.code === 'conflict', 'Concurrent CAS conflict');
    same((await one.current())!.id, 1);
    passed.push('two connections serialize compare and commit');
  } finally {
    await one.close();
    await two.close();
  }
  store = await open('overlapping-pins');
  const expected = new Map<number, { a: number | null; b: number | null }>();
  let a: number | null = null,
    b: number | null = null;
  const pinned = new Set<number>();
  try {
    for (let id = 1; id <= 14; id++) {
      const key = id % 2 ? 'a' : 'b';
      const value = id % 4 === 0 ? null : bytes(id);
      if (key === 'a') a = value?.[0] ?? null;
      else b = value?.[0] ?? null;
      await store.commit(id === 1 ? null : id - 1, bytes(id), [{ kind: 'outcomes', key, value }]);
      expected.set(id, { a, b });
      if (id === 1 || id === 3) {
        await store.pin(id, `pin-${id}`);
        pinned.add(id);
      }
      if (id === 12 || id === 14) {
        const released = id === 12 ? 1 : 3;
        await store.release(`pin-${released}`);
        pinned.delete(released);
      }
      for (let prior = 1; prior <= id; prior++) {
        if (prior < id - 1 && !pinned.has(prior)) await error('missing', () => store.read(prior));
        else {
          same((await store.read(prior)).metadata[0], prior);
          for (const k of ['a', 'b'] as const)
            same((await store.row(prior, 'outcomes', k))?.[0] ?? null, expected.get(prior)![k]);
        }
      }
    }
    passed.push('nonadjacent pinned generations preserve exact updates and tombstones through retirement');
  } finally {
    await store.close();
  }
  store = await open('tombstone-churn', { rows: 50 });
  try {
    let id: number | null = null;
    for (let cycle = 0; cycle < 150; cycle++) {
      const key = `k_${cycle}`;
      id = await store.commit(id, bytes(1), [{ kind: 'pending', key, value: bytes(1) }]);
      same([...(await store.row(id, 'pending', key))!], [1]);
      id = await store.commit(id, bytes(1), [{ kind: 'pending', key, value: null }]);
      check((await store.row(id, 'pending', key)) === undefined, 'Churn deletion');
      same((await store.page(id, 'pending')).rows, []);
    }
    id = await store.commit(id, bytes(1), []);
    id = await store.commit(id, bytes(1), []);
    same(id, 302);
    await store.close();
    store = await open('tombstone-churn', { rows: 50 });
    same((await store.current())!.id, 302);
    same((await store.page(301, 'pending')).rows, []);
    same((await store.page(302, 'pending')).rows, []);
    passed.push('150 distinct-key insert/delete cycles reclaim tombstones and survive reopen');
  } finally {
    await store.close();
  }
  store = await open('tombstone-small-quota', { rows: 2, bytes: 80 });
  try {
    let id: number | null = null;
    for (let cycle = 0; cycle < 75; cycle++) {
      const key = `k_${cycle}`;
      id = await store.commit(id, bytes(1), [{ kind: 'pending', key, value: bytes(1) }]);
      id = await store.commit(id, bytes(1), [{ kind: 'pending', key, value: null }]);
      same((await store.page(id, 'pending')).rows, []);
    }
    id = await store.commit(id, bytes(1), []);
    id = await store.commit(id, bytes(1), []);
    same(id, 152);
    await error('quota', () =>
      store.commit(id, bytes(1), [{ kind: 'pending', key: 'large', value: new Uint8Array(80) }]),
    );
    same((await store.current())!.id, 152);
    check((await store.row(152, 'pending', 'large')) === undefined, 'Quota rollback after tombstone reclamation');
    passed.push('two-row 80-byte quota permits repeated churn while genuine quota failures remain atomic');
  } finally {
    await store.close();
  }
  store = await open('tombstone-repeated-delete', { rows: 2, bytes: 80 });
  try {
    let id: number | null = null;
    for (let cycle = 0; cycle < 25; cycle++) {
      id = await store.commit(id, bytes(1), [{ kind: 'pending', key: 'x', value: null }]);
      check((await store.row(id, 'pending', 'x')) === undefined, 'Repeated absent deletion');
    }
    id = await store.commit(id, bytes(1), [{ kind: 'pending', key: 'x', value: bytes(7) }]);
    same([...(await store.row(id, 'pending', 'x'))!], [7]);
    for (let cycle = 0; cycle < 25; cycle++) {
      id = await store.commit(id, bytes(1), [{ kind: 'pending', key: 'x', value: null }]);
      check((await store.row(id, 'pending', 'x')) === undefined, 'Repeated former-live deletion');
    }
    id = await store.commit(id, bytes(1), []);
    id = await store.commit(id, bytes(1), []);
    same(id, 53);
    same((await store.page(id, 'pending')).rows, []);
    passed.push('repeated deletions of absent and formerly live keys do not consume retained row quota');
  } finally {
    await store.close();
  }
  store = await open('tombstone-pinned-value', { rows: 3, bytes: 140 });
  try {
    let id = await store.commit(null, bytes(1), [{ kind: 'pending', key: 'x', value: bytes(7) }]);
    await store.pin(id, 'audit');
    for (let cycle = 0; cycle < 12; cycle++) {
      id = await store.commit(id, bytes(1), [{ kind: 'pending', key: 'x', value: null }]);
      same([...(await store.row(1, 'pending', 'x'))!], [7]);
      check((await store.row(id, 'pending', 'x')) === undefined, 'Pinned value hidden in current generation');
      if (id > 2) check((await store.row(id - 1, 'pending', 'x')) === undefined, 'Pinned value hidden in predecessor');
      same((await store.page(id, 'pending')).rows, []);
    }
    await store.close();
    store = await open('tombstone-pinned-value', { rows: 3, bytes: 140 });
    same([...(await store.row(1, 'pending', 'x'))!], [7]);
    check((await store.row(id, 'pending', 'x')) === undefined, 'Pinned deletion survives reopen');
    await store.release('audit');
    await error('missing', () => store.read(1));
    id = await store.commit(id, bytes(1), [{ kind: 'pending', key: 'x', value: bytes(9) }]);
    same([...(await store.row(id, 'pending', 'x'))!], [9]);
    check(
      (await store.row(id - 1, 'pending', 'x')) === undefined,
      'Re-added value does not leak into prior generation',
    );
    id = await store.commit(id, bytes(1), [{ kind: 'pending', key: 'x', value: null }]);
    same([...(await store.row(id - 1, 'pending', 'x'))!], [9]);
    id = await store.commit(id, bytes(1), []);
    id = await store.commit(id, bytes(1), []);
    same((await store.page(id, 'pending')).rows, []);
    passed.push('pinned older live value retains necessary deletion markers until release and re-addition');
  } finally {
    await store.close();
  }
  store = await open('byte-pages', { pageBytes: 13 });
  try {
    await store.commit(null, bytes(1), [
      { kind: 'outcomes', key: 'a', value: new Uint8Array(7) },
      { kind: 'outcomes', key: 'b', value: new Uint8Array(7) },
      { kind: 'outcomes', key: 'c', value: new Uint8Array(20) },
    ]);
    const page = await store.page(1, 'outcomes');
    same(
      page.rows.map((r) => r.key),
      ['a'],
    );
    same(page.next, 'a');
    same(
      (await store.page(1, 'outcomes', 'a')).rows.map((r) => r.key),
      ['b'],
    );
    await error('quota', () => store.page(1, 'outcomes', 'b'));
    passed.push('page byte budget separates continuation from a single oversized row');
  } finally {
    await store.close();
  }
  await error('closed', () => store.current());
  passed.push('closed store rejects subsequent operations');
  await error('input', () => open('invalid-limits', { generations: 1 }));
  passed.push('invalid limits are caller errors');
  return passed;
}
