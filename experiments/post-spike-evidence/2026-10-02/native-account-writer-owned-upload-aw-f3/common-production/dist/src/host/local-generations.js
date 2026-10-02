import { DatabaseSync } from 'node:sqlite';
import { LocalStorageError, storageLimits, storageId, storageKey, storageKind, ownCommit, rowSize, retainGenerations, pageLimit, } from '../core/local-generations.js';
/** Opaque bytes, not replay/authority capabilities. One caller-selected scope per file. */
export async function openLocalGenerations(path, scope, policy = {}) {
    storageKey(scope);
    const limits = storageLimits(policy), db = new DatabaseSync(path);
    let closed = false;
    try {
        db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;
      BEGIN IMMEDIATE;
      CREATE TABLE IF NOT EXISTS local_state (id INTEGER PRIMARY KEY CHECK(id=1), scope TEXT NOT NULL,
        current INTEGER NOT NULL, bytes INTEGER NOT NULL, rows INTEGER NOT NULL) STRICT;
      CREATE TABLE IF NOT EXISTS local_generations (id INTEGER PRIMARY KEY, metadata BLOB NOT NULL) STRICT;
      CREATE TABLE IF NOT EXISTS local_pins (reference TEXT PRIMARY KEY, generation INTEGER NOT NULL) STRICT;
      CREATE TABLE IF NOT EXISTS local_rows (kind TEXT NOT NULL, key TEXT NOT NULL, generation INTEGER NOT NULL,
        value BLOB, size INTEGER NOT NULL, PRIMARY KEY(kind,key,generation)) STRICT;
      CREATE INDEX IF NOT EXISTS local_rows_generation ON local_rows(generation);
      COMMIT;`);
        db.prepare('INSERT OR IGNORE INTO local_state VALUES (1,?,0,?,0)').run(scope, scope.length);
        if (db.prepare('SELECT scope FROM local_state WHERE id=1').get()?.scope !== scope)
            throw new LocalStorageError('input', 'Local store scope differs');
    }
    catch (error) {
        try {
            db.exec('ROLLBACK');
        }
        catch {
            /* Preserve the initialization failure. */
        }
        db.close();
        throw error;
    }
    function open() {
        if (closed)
            throw new LocalStorageError('closed', 'Local store is closed');
    }
    function state() {
        const row = db.prepare('SELECT current,bytes,rows FROM local_state WHERE id=1').get();
        if (!row ||
            [row.current, row.bytes, row.rows].some((v) => typeof v !== 'number' || !Number.isSafeInteger(v) || v < 0))
            throw new LocalStorageError('corrupt', 'Invalid stored generation metadata');
        return { current: Number(row.current), bytes: Number(row.bytes), rows: Number(row.rows) };
    }
    function read(id) {
        storageId(id);
        const row = db.prepare('SELECT metadata FROM local_generations WHERE id=?').get(id);
        if (!row)
            throw new LocalStorageError('missing', 'Local generation is unavailable');
        if (!(row.metadata instanceof Uint8Array))
            throw new LocalStorageError('corrupt', 'Invalid stored metadata bytes');
        return { id, metadata: new Uint8Array(row.metadata) };
    }
    function failure(error) {
        const sqlite = error;
        if (sqlite?.code === 'ERR_SQLITE_ERROR') {
            const code = (sqlite.errcode ?? 0) % 256;
            if ([5, 6].includes(code))
                return new LocalStorageError('busy', 'Local database is busy', error);
            if (code === 13)
                return new LocalStorageError('quota', 'SQLite storage is full', error);
        }
        return error;
    }
    function transaction(work, write = true) {
        open();
        try {
            db.exec(write ? 'BEGIN IMMEDIATE' : 'BEGIN');
        }
        catch (error) {
            throw failure(error);
        }
        try {
            const result = work();
            db.exec('COMMIT');
            return result;
        }
        catch (error) {
            try {
                db.exec('ROLLBACK');
            }
            catch {
                /* Preserve the original storage failure. */
            }
            throw failure(error);
        }
    }
    function charge(bytes, rows = 0) {
        const used = state(), nextBytes = used.bytes + bytes, nextRows = used.rows + rows;
        if (!Number.isSafeInteger(nextBytes) || !Number.isSafeInteger(nextRows) || nextBytes < 0 || nextRows < 0)
            throw new LocalStorageError('quota', 'Local storage accounting exceeds safe bounds');
        db.prepare('UPDATE local_state SET bytes=?, rows=? WHERE id=1').run(nextBytes, nextRows);
    }
    function pruneKey(kind, key, kept) {
        const versions = db
            .prepare('SELECT generation,size,value IS NULL AS deleted FROM local_rows WHERE kind=? AND key=? ORDER BY generation')
            .all(kind, key);
        const visible = new Set();
        for (const id of kept) {
            const row = versions.findLast((r) => Number(r.generation) <= id);
            if (row)
                visible.add(Number(row.generation));
        }
        // After invisible versions are removed, leading deletion markers mean the
        // same as no version. Keep markers after a retained live value: an older pin
        // may still see that value while a newer generation must see its deletion.
        let retainedLiveValue = false;
        for (const row of versions) {
            const keep = visible.has(Number(row.generation)) && (!row.deleted || retainedLiveValue);
            if (keep)
                retainedLiveValue = true;
            else {
                db.prepare('DELETE FROM local_rows WHERE kind=? AND key=? AND generation=?').run(kind, key, Number(row.generation));
                charge(-Number(row.size), -1);
            }
        }
    }
    function collect(previous, all = false) {
        const current = state().current;
        if (!current)
            return;
        const pins = db
            .prepare('SELECT generation FROM local_pins')
            .all()
            .map((r) => Number(r.generation));
        const kept = retainGenerations(current, pins, limits);
        const removed = db
            .prepare('SELECT id,length(metadata)+8 AS size FROM local_generations')
            .all()
            .filter((r) => !kept.includes(Number(r.id)));
        for (const row of removed) {
            db.prepare('DELETE FROM local_generations WHERE id=?').run(Number(row.id));
            charge(-Number(row.size));
        }
        if (!removed.length)
            return;
        // Ordinary retirement visits keys changed in the previous generation only.
        // Releasing old pins is explicitly a full metadata scan, never a blob scan.
        const keys = all
            ? db.prepare('SELECT DISTINCT kind,key FROM local_rows').all()
            : db.prepare('SELECT kind,key FROM local_rows WHERE generation=?').all(previous);
        for (const row of keys)
            pruneKey(String(row.kind), String(row.key), kept);
    }
    function quota() {
        const used = state(), pins = Number(db.prepare('SELECT count(*) AS count FROM local_pins').get().count);
        if (used.bytes > limits.bytes || used.rows > limits.rows || pins > limits.pins)
            throw new LocalStorageError('quota', 'Local retained storage quota exceeded');
    }
    return {
        async current() {
            return transaction(() => {
                const id = state().current;
                return id ? read(id) : undefined;
            }, false);
        },
        async read(id) {
            open();
            return read(id);
        },
        async row(id, kind, key) {
            storageKind(kind);
            storageKey(key);
            return transaction(() => {
                read(id);
                const row = db
                    .prepare('SELECT value FROM local_rows WHERE kind=? AND key=? AND generation<=? ORDER BY generation DESC LIMIT 1')
                    .get(kind, key, id);
                return row?.value instanceof Uint8Array ? new Uint8Array(row.value) : undefined;
            }, false);
        },
        async page(id, kind, after, limit) {
            storageKind(kind);
            if (after !== undefined)
                storageKey(after);
            const count = pageLimit(limit, limits);
            return transaction(() => {
                read(id);
                const result = { rows: [] };
                let bytes = 0;
                const query = db.prepare(`SELECT r.key,r.value FROM local_rows AS r WHERE r.kind=? AND r.key>? AND r.generation<=?
          AND r.value IS NOT NULL AND NOT EXISTS (SELECT 1 FROM local_rows AS n WHERE n.kind=r.kind AND n.key=r.key AND n.generation>r.generation AND n.generation<=?)
          ORDER BY r.key LIMIT ?`);
                for (const row of query.iterate(kind, after ?? '', id, id, count + 1)) {
                    const key = String(row.key), value = row.value;
                    if (result.rows.length === count || bytes + key.length + value.byteLength > limits.pageBytes) {
                        if (!result.rows.length)
                            throw new LocalStorageError('quota', 'One local row exceeds page byte quota');
                        result.next = result.rows.at(-1).key;
                        break;
                    }
                    bytes += key.length + value.byteLength;
                    result.rows.push({ key, value: new Uint8Array(value) });
                }
                return result;
            }, false);
        },
        async commit(expected, metadata, changes) {
            open();
            const owned = ownCommit(expected, metadata, changes, limits);
            return transaction(() => {
                const current = state().current;
                if ((current || null) !== expected)
                    throw new LocalStorageError('conflict', 'Local generation changed');
                const id = current + 1;
                storageId(id);
                db.prepare('INSERT INTO local_generations VALUES (?,?)').run(id, owned.metadata);
                charge(owned.metadata.byteLength + 8);
                const insert = db.prepare('INSERT INTO local_rows VALUES (?,?,?,?,?)');
                for (const change of owned.changes) {
                    const size = rowSize(change);
                    insert.run(change.kind, change.key, id, change.value, size);
                    charge(size, 1);
                }
                db.prepare('UPDATE local_state SET current=? WHERE id=1').run(id);
                collect(current);
                quota();
                return id;
            });
        },
        async pin(id, reference) {
            storageKey(reference);
            transaction(() => {
                read(id);
                const prior = db.prepare('SELECT generation FROM local_pins WHERE reference=?').get(reference);
                if (prior && prior.generation !== id)
                    throw new LocalStorageError('conflict', 'Pin reference names another generation');
                if (!prior) {
                    db.prepare('INSERT INTO local_pins VALUES (?,?)').run(reference, id);
                    charge(reference.length + 8);
                }
                quota();
            });
        },
        async release(reference) {
            storageKey(reference);
            transaction(() => {
                const removed = db.prepare('DELETE FROM local_pins WHERE reference=?').run(reference).changes;
                if (removed) {
                    charge(-reference.length - 8);
                    collect(state().current, true);
                }
                quota();
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
//# sourceMappingURL=local-generations.js.map