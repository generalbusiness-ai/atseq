import {
  LocalStorageError,
  storageLimits,
  storageId,
  storageKey,
  storageKind,
  ownCommit,
  rowSize,
  retainGenerations,
  pageLimit,
  type LocalLimits,
  type LocalGenerations,
  type LocalPage,
} from '../core/local-generations.ts';

type State = { scope: string; current: number; bytes: number; rows: number };
type Row = { kind: string; key: string; generation: number; deleted: boolean; size: number };
const stores = ['state', 'generations', 'pins', 'rows', 'values'];
function result<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function next(request: IDBRequest<IDBCursorWithValue | null>, cursor: IDBCursorWithValue) {
  const pending = result(request);
  cursor.continue();
  return pending;
}
/** Origin-trusted raw storage only; no deserialization creates protocol authority. */
export async function openLocalGenerations(
  name: string,
  scope: string,
  policy: Partial<LocalLimits> = {},
): Promise<LocalGenerations> {
  storageKey(name);
  storageKey(scope);
  const limits = storageLimits(policy),
    opening = indexedDB.open(name, 1);
  opening.onupgradeneeded = () => {
    const db = opening.result;
    db.createObjectStore('state');
    db.createObjectStore('generations', { keyPath: 'id' });
    db.createObjectStore('pins', { keyPath: 'reference' });
    const rows = db.createObjectStore('rows', { keyPath: ['kind', 'key', 'generation'] });
    rows.createIndex('generation', 'generation');
    db.createObjectStore('values');
  };
  const db = await result(opening);
  let closed = false;
  db.onversionchange = () => {
    closed = true;
    db.close();
  };
  async function transaction<T>(mode: IDBTransactionMode, work: (tx: IDBTransaction) => Promise<T>): Promise<T> {
    if (closed) throw new LocalStorageError('closed', 'Local store is closed');
    const tx = db.transaction(stores, mode, { durability: 'strict' });
    const finished = new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error ?? new DOMException('Local transaction aborted', 'AbortError'));
    });
    // Register a rejection handler immediately; a backend abort may precede the
    // awaited request's rejection. All operations stay inside IDB request tasks.
    finished.catch(() => {});
    try {
      const value = await work(tx);
      await finished;
      return value;
    } catch (error) {
      try {
        tx.abort();
      } catch {
        /* It may already have aborted/completed. */
      }
      await finished.catch(() => {});
      if (error instanceof DOMException && error.name === 'QuotaExceededError')
        throw new LocalStorageError('quota', 'IndexedDB quota exceeded', error);
      throw error;
    }
  }
  async function state(tx: IDBTransaction): Promise<State> {
    const value = (await result(tx.objectStore('state').get('state'))) as State | undefined;
    if (
      !value ||
      value.scope !== scope ||
      [value.current, value.bytes, value.rows].some((v) => !Number.isSafeInteger(v) || v < 0)
    )
      throw new LocalStorageError('corrupt', 'Invalid stored generation metadata');
    return value;
  }
  async function read(tx: IDBTransaction, id: number) {
    storageId(id);
    const value = (await result(tx.objectStore('generations').get(id))) as
      { id: number; metadata: Uint8Array } | undefined;
    if (!value) throw new LocalStorageError('missing', 'Local generation is unavailable');
    if (value.id !== id || !(value.metadata instanceof Uint8Array))
      throw new LocalStorageError('corrupt', 'Invalid stored generation bytes');
    return { id, metadata: new Uint8Array(value.metadata) };
  }
  async function rowHeaders(tx: IDBTransaction, range?: IDBKeyRange, byGeneration = false) {
    const source = byGeneration ? tx.objectStore('rows').index('generation') : tx.objectStore('rows');
    const request = source.openCursor(range),
      rows: Row[] = [];
    let cursor = await result(request);
    while (cursor) {
      rows.push(cursor.value as Row);
      cursor = await next(request, cursor);
    }
    return rows;
  }
  async function collect(tx: IDBTransaction, used: State, previous: number, all = false) {
    if (!used.current) return;
    const pins = (await result(tx.objectStore('pins').getAll())) as { reference: string; generation: number }[];
    const kept = retainGenerations(
      used.current,
      pins.map((p) => p.generation),
      limits,
    );
    const generations = (await result(tx.objectStore('generations').getAll())) as {
      id: number;
      metadata: Uint8Array;
    }[];
    const removed = generations.filter((g) => !kept.includes(g.id));
    for (const generation of removed) {
      await result(tx.objectStore('generations').delete(generation.id));
      used.bytes -= generation.metadata.byteLength + 8;
    }
    if (!removed.length) return;
    // Ordinary commits inspect only keys updated by the preceding generation.
    // Pin release deliberately scans all row headers, not their payload values.
    const candidates = all ? await rowHeaders(tx) : await rowHeaders(tx, IDBKeyRange.only(previous), true);
    const seen = new Set<string>();
    for (const candidate of candidates) {
      const identity = `${candidate.kind}\0${candidate.key}`;
      if (seen.has(identity)) continue;
      seen.add(identity);
      const versions = await rowHeaders(
        tx,
        IDBKeyRange.bound([candidate.kind, candidate.key, 0], [candidate.kind, candidate.key, Number.MAX_SAFE_INTEGER]),
      );
      const visible = new Set<number>();
      for (const id of kept) {
        const row = versions.findLast((r) => r.generation <= id);
        if (row) visible.add(row.generation);
      }
      // Absence and leading retained tombstones have the same reads once no
      // older live version remains. A marker after a retained live value stays
      // necessary for newer generations while an older pin still sees that value.
      let retainedLiveValue = false;
      for (const row of versions) {
        const keep = visible.has(row.generation) && (!row.deleted || retainedLiveValue);
        if (keep) retainedLiveValue = true;
        else {
          const key = [row.kind, row.key, row.generation];
          await result(tx.objectStore('rows').delete(key));
          await result(tx.objectStore('values').delete(key));
          used.bytes -= row.size;
          used.rows--;
        }
      }
    }
  }
  async function save(tx: IDBTransaction, used: State) {
    const count = await result(tx.objectStore('pins').count());
    if ([used.bytes, used.rows].some((v) => !Number.isSafeInteger(v) || v < 0))
      throw new LocalStorageError('corrupt', 'Invalid storage accounting');
    if (used.bytes > limits.bytes || used.rows > limits.rows || count > limits.pins)
      throw new LocalStorageError('quota', 'Local retained storage quota exceeded');
    await result(tx.objectStore('state').put(used, 'state'));
  }
  try {
    await transaction('readwrite', async (tx) => {
      const prior = (await result(tx.objectStore('state').get('state'))) as State | undefined;
      if (!prior)
        await result(tx.objectStore('state').put({ scope, current: 0, bytes: scope.length, rows: 0 }, 'state'));
      else if (prior.scope !== scope) throw new LocalStorageError('input', 'Local store scope differs');
    });
  } catch (error) {
    closed = true;
    db.close();
    throw error;
  }
  return {
    async current() {
      return transaction('readonly', async (tx) => {
        const used = await state(tx);
        return used.current ? read(tx, used.current) : undefined;
      });
    },
    async read(id) {
      return transaction('readonly', (tx) => read(tx, id));
    },
    async row(id, kind, key) {
      storageKind(kind);
      storageKey(key);
      return transaction('readonly', async (tx) => {
        await read(tx, id);
        const cursor = await result(
          tx.objectStore('rows').openCursor(IDBKeyRange.bound([kind, key, 0], [kind, key, id]), 'prev'),
        );
        if (!cursor || (cursor.value as Row).deleted) return undefined;
        const bytes = await result(tx.objectStore('values').get(cursor.primaryKey));
        if (!(bytes instanceof Uint8Array)) throw new LocalStorageError('corrupt', 'Missing local row bytes');
        return new Uint8Array(bytes);
      });
    },
    async page(id, kind, after, limit) {
      storageKind(kind);
      if (after !== undefined) storageKey(after);
      const count = pageLimit(limit, limits);
      return transaction('readonly', async (tx) => {
        await read(tx, id);
        const request = tx.objectStore('rows').openCursor(IDBKeyRange.bound([kind, after ?? ''], [kind, '\uffff']));
        let cursor = await result(request),
          selected: Row | undefined,
          group: string | undefined,
          bytes = 0;
        const page: LocalPage = { rows: [] };
        async function append() {
          if (!selected || selected.deleted) return false;
          if (page.rows.length === count || bytes + selected.size - selected.kind.length - 8 > limits.pageBytes) {
            if (!page.rows.length) throw new LocalStorageError('quota', 'One local row exceeds page byte quota');
            page.next = page.rows.at(-1)!.key;
            return true;
          }
          const value = await result(tx.objectStore('values').get([selected.kind, selected.key, selected.generation]));
          if (!(value instanceof Uint8Array)) throw new LocalStorageError('corrupt', 'Missing local row bytes');
          bytes += selected.key.length + value.byteLength;
          page.rows.push({ key: selected.key, value: new Uint8Array(value) });
          return false;
        }
        while (cursor) {
          const row = cursor.value as Row;
          if (row.key !== group) {
            if (await append()) return page;
            group = row.key;
            selected = undefined;
          }
          if (row.key > (after ?? '') && row.generation <= id) selected = row;
          cursor = await next(request, cursor);
        }
        await append();
        return page;
      });
    },
    async commit(expected, metadata, changes) {
      const owned = ownCommit(expected, metadata, changes, limits);
      return transaction('readwrite', async (tx) => {
        const used = await state(tx),
          previous = used.current;
        if ((previous || null) !== expected) throw new LocalStorageError('conflict', 'Local generation changed');
        const id = previous + 1;
        storageId(id);
        await result(tx.objectStore('generations').add({ id, metadata: owned.metadata }));
        used.bytes += owned.metadata.byteLength + 8;
        for (const change of owned.changes) {
          const key = [change.kind, change.key, id],
            size = rowSize(change);
          await result(
            tx
              .objectStore('rows')
              .add({ kind: change.kind, key: change.key, generation: id, deleted: change.value === null, size }),
          );
          if (change.value !== null) await result(tx.objectStore('values').add(change.value, key));
          used.bytes += size;
          used.rows++;
        }
        used.current = id;
        await collect(tx, used, previous);
        await save(tx, used);
        return id;
      });
    },
    async pin(id, reference) {
      storageKey(reference);
      await transaction('readwrite', async (tx) => {
        await read(tx, id);
        const used = await state(tx);
        const prior = (await result(tx.objectStore('pins').get(reference))) as
          { reference: string; generation: number } | undefined;
        if (prior && prior.generation !== id)
          throw new LocalStorageError('conflict', 'Pin reference names another generation');
        if (!prior) {
          await result(tx.objectStore('pins').add({ reference, generation: id }));
          used.bytes += reference.length + 8;
        }
        await save(tx, used);
      });
    },
    async release(reference) {
      storageKey(reference);
      await transaction('readwrite', async (tx) => {
        const used = await state(tx),
          prior = await result(tx.objectStore('pins').get(reference));
        if (prior) {
          await result(tx.objectStore('pins').delete(reference));
          used.bytes -= reference.length + 8;
          await collect(tx, used, used.current, true);
        }
        await save(tx, used);
      });
    },
    async close() {
      if (!closed) {
        closed = true;
        db.close();
      }
    },
  };
}
