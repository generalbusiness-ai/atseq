import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

export interface WriterLease { readHead(): unknown; saveHead(value: unknown): void; close(): void }
/** Kernel-backed local lease and last-observed head cache, never application state. */
export function acquireWriterLease(directory: string, app: string): WriterLease {
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const name = createHash('sha256').update(app).digest('hex');
  const db = new DatabaseSync(join(directory, `${name}.sqlite`));
  try {
    db.exec('PRAGMA locking_mode=EXCLUSIVE; BEGIN EXCLUSIVE; CREATE TABLE IF NOT EXISTS checkpoint (id INTEGER PRIMARY KEY CHECK(id = 1), value TEXT NOT NULL); COMMIT');
  } catch { db.close(); throw new Error('Another local process holds this application writer lease'); }
  let open = true;
  return {
    readHead() { const row = db.prepare('SELECT value FROM checkpoint WHERE id = 1').get(); return row ? JSON.parse(row.value as string) : undefined; },
    saveHead(value) { db.prepare('INSERT INTO checkpoint VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET value = excluded.value').run(JSON.stringify(value)); },
    close() { if (open) { open = false; db.close(); } },
  };
}
