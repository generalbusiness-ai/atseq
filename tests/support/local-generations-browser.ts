import { openLocalGenerations } from '../../src/browser/local-generations.ts';
import { LocalStorageError } from '../../src/core/local-generations.ts';
import { localGenerationsCorpus } from './local-generations-corpus.ts';
function check(value: unknown, message: string): asserts value {
  if (!value) throw Error(message);
}
function request<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
function observe() {
  const originalContinue = IDBCursor.prototype.continue,
    originalGet = IDBObjectStore.prototype.get,
    originalAdd = IDBObjectStore.prototype.add;
  const counts = { cursorContinuations: 0, payloadReads: 0, payloadAdds: 0 };
  IDBCursor.prototype.continue = function (key?: IDBValidKey) {
    counts.cursorContinuations++;
    return originalContinue.call(this, key);
  };
  IDBObjectStore.prototype.get = function (key: IDBValidKey | IDBKeyRange) {
    if (this.name === 'values') counts.payloadReads++;
    return originalGet.call(this, key);
  };
  IDBObjectStore.prototype.add = function (value: unknown, key?: IDBValidKey) {
    if (this.name === 'values') counts.payloadAdds++;
    return originalAdd.call(this, value, key);
  };
  return {
    counts,
    restore() {
      IDBCursor.prototype.continue = originalContinue;
      IDBObjectStore.prototype.get = originalGet;
      IDBObjectStore.prototype.add = originalAdd;
    },
  };
}
export async function browserCorpus() {
  const cases = await localGenerationsCorpus((name, limits, scope = 'fixture-scope') =>
    openLocalGenerations(`corpus-${name}`, scope, limits),
  );
  const abort = await openLocalGenerations('actual-abort', 'abort-scope');
  try {
    await abort.commit(null, new Uint8Array([1]), []);
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (value: unknown, key?: IDBValidKey) {
      const r = original.call(this, value, key);
      if (this.name === 'state' && (value as { current?: number }).current === 2) this.transaction.abort();
      return r;
    };
    try {
      await abort.commit(1, new Uint8Array([2]), [{ kind: 'outcomes', key: '2', value: new Uint8Array([22]) }]);
      throw Error('Expected abort');
    } catch (e) {
      check(e instanceof DOMException && e.name === 'AbortError', 'Actual IDB abort');
    } finally {
      IDBObjectStore.prototype.put = original;
    }
    check((await abort.current())!.id === 1, 'Abort generation');
    check((await abort.row(1, 'outcomes', '2')) === undefined, 'Abort row');
    cases.push('actual IDB abort rolls back pointer and values');
  } finally {
    await abort.close();
  }
  const many = await openLocalGenerations('many', 'many-scope');
  const metrics: Record<string, unknown> = {};
  try {
    await many.commit(
      null,
      new Uint8Array([1]),
      Array.from({ length: 500 }, (_, i) => ({
        kind: 'outcomes' as const,
        key: String(i).padStart(4, '0'),
        value: new Uint8Array(256).fill(i % 256),
      })),
    );
    await many.commit(1, new Uint8Array([2]), [{ kind: 'outcomes', key: '0000', value: new Uint8Array([2]) }]);
    let observer = observe();
    try {
      await many.commit(2, new Uint8Array([3]), [{ kind: 'outcomes', key: '0000', value: new Uint8Array([3]) }]);
      metrics.commit = { ...observer.counts };
    } finally {
      observer.restore();
    }
    const commit = metrics.commit as typeof observer.counts;
    check(
      commit.payloadReads === 0 && commit.payloadAdds === 1 && commit.cursorContinuations === 4,
      'Indexed one-key metadata retirement',
    );
    observer = observe();
    try {
      const page = await many.page(3, 'outcomes', undefined, 10);
      check(page.rows.length === 10 && page.next === '0009', 'Many-row page');
      metrics.page = { ...observer.counts };
    } finally {
      observer.restore();
    }
    check((metrics.page as typeof observer.counts).payloadReads === 10, 'Only requested outcome payloads loaded');
    check(
      (await many.row(3, 'outcomes', '0499'))!.every((v) => v === 499 % 256),
      'Unchanged baseline row retained',
    );
    await many.pin(2, 'audit');
    await many.commit(3, new Uint8Array([4]), [{ kind: 'outcomes', key: '0000', value: new Uint8Array([4]) }]);
    observer = observe();
    try {
      await many.release('audit');
      metrics.pinRelease = { ...observer.counts };
    } finally {
      observer.restore();
    }
    check(
      (metrics.pinRelease as typeof observer.counts).payloadReads === 0 &&
        (metrics.pinRelease as typeof observer.counts).cursorContinuations >= 500,
      'Explicit full metadata pin-release pass',
    );
    const db = await request(indexedDB.open('many', 1));
    try {
      const tx = db.transaction(['state', 'rows', 'generations', 'pins'], 'readonly');
      const state = (await request(tx.objectStore('state').get('state'))) as {
        bytes: number;
        rows: number;
        scope: string;
      };
      const rows = (await request(tx.objectStore('rows').getAll())) as { size: number }[];
      const gens = (await request(tx.objectStore('generations').getAll())) as { metadata: Uint8Array }[];
      const pins = (await request(tx.objectStore('pins').getAll())) as { reference: string }[];
      const counted =
        state.scope.length +
        rows.reduce((sum, r) => sum + r.size, 0) +
        gens.reduce((sum, g) => sum + g.metadata.byteLength + 8, 0) +
        pins.reduce((sum, p) => sum + p.reference.length + 8, 0);
      check(state.rows === rows.length && state.bytes === counted, 'Exact logical accounting');
      metrics.storage = { historyRows: 500, storedVersions: rows.length, logicalBytes: state.bytes };
    } finally {
      db.close();
    }
    cases.push('500-row one-key commit and selective page instrumentation with restored native methods');
    cases.push('pin release scans metadata without loading old outcome bytes');
  } finally {
    await many.close();
  }
  return { cases, metrics };
}
export async function seedQuota() {
  const store = await openLocalGenerations('actual-quota', 'quota-scope', { rowBytes: 8 * 1024 * 1024 });
  try {
    await store.commit(null, new Uint8Array([1]), []);
  } finally {
    await store.close();
  }
}
export async function exhaustQuota() {
  const store = await openLocalGenerations('actual-quota', 'quota-scope', { rowBytes: 8 * 1024 * 1024 });
  try {
    const bytes = new Uint8Array(4 * 1024 * 1024);
    let seed = 1;
    for (let i = 0; i < bytes.length; i++) {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      bytes[i] = seed & 255;
    }
    let observed: unknown;
    try {
      await store.commit(1, new Uint8Array([2]), [{ kind: 'evidence', key: 'large', value: bytes }]);
      throw Error('Expected physical quota failure');
    } catch (e) {
      check(
        e instanceof LocalStorageError &&
          e.code === 'quota' &&
          e.cause instanceof DOMException &&
          e.cause.name === 'QuotaExceededError',
        `Actual Chromium quota failure: ${String(e)}; cause=${String((e as Error).cause)}`,
      );
      observed = { code: e.code, causeName: e.cause.name, causeMessage: e.cause.message };
    }
    check((await store.current())!.id === 1, 'Quota pointer retained');
    check((await store.row(1, 'evidence', 'large')) === undefined, 'Quota row absent');
    return {
      case: 'actual Chromium quota abort preserves generation',
      generation: 1,
      attemptedBytes: bytes.length,
      observed,
    };
  } finally {
    await store.close();
  }
}
export async function armCrash(phase: 'before' | 'after') {
  const store = await openLocalGenerations(`crash-${phase}`, 'crash-scope');
  await store.commit(null, new Uint8Array([1]), [{ kind: 'outcomes', key: '1', value: new Uint8Array([11]) }]);
  const state = globalThis as typeof globalThis & { crashArmed?: string; crashRequests?: number };
  if (phase === 'before') {
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (value: unknown, key?: IDBValidKey) {
      const r = original.call(this, value, key);
      if (this.name === 'state' && (value as { current?: number }).current === 2) {
        IDBObjectStore.prototype.put = original;
        const pendingStore = this;
        function hold() {
          const get = pendingStore.get('state');
          get.onsuccess = () => {
            state.crashRequests = (state.crashRequests ?? 0) + 1;
            state.crashArmed = 'before';
            hold();
          };
        }
        hold();
      }
      return r;
    };
    void store
      .commit(1, new Uint8Array([2]), [{ kind: 'outcomes', key: '2', value: new Uint8Array([22]) }])
      .catch(() => {});
  } else {
    await store.commit(1, new Uint8Array([2]), [{ kind: 'outcomes', key: '2', value: new Uint8Array([22]) }]);
    state.crashArmed = 'after';
    await store.close();
  }
}
export async function verifyCrash(phase: 'before' | 'after') {
  const store = await openLocalGenerations(`crash-${phase}`, 'crash-scope');
  try {
    const id = phase === 'before' ? 1 : 2;
    check((await store.current())!.id === id, 'Crash generation');
    check((await store.row(id, 'outcomes', '1'))![0] === 11, 'Crash prior row');
    const row = await store.row(id, 'outcomes', '2');
    check(phase === 'before' ? row === undefined : row?.[0] === 22, 'Crash successor row');
    return { phase, generation: id };
  } finally {
    await store.close();
  }
}
