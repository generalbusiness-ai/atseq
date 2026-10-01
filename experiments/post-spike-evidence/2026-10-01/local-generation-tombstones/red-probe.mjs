import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
const root = resolve(process.argv[2] ?? '.');
const { openLocalGenerations } = await import(pathToFileURL(join(root, 'src/host/local-generations.ts')).href);
const dir = await mkdtemp(join(tmpdir(), 'atseq-tombstone-red-'));
const path = join(dir, 'churn.sqlite');
const store = await openLocalGenerations(path, 'fixture-scope', { rows: 50 });
let id = null, attemptedGeneration = 0;
try {
  for (let i = 0; i < 150; i++) {
    attemptedGeneration = (id ?? 0) + 1;
    id = await store.commit(id, new Uint8Array([1]), [{ kind: 'pending', key: `k_${i}`, value: new Uint8Array([1]) }]);
    attemptedGeneration = id + 1;
    id = await store.commit(id, new Uint8Array([1]), [{ kind: 'pending', key: `k_${i}`, value: null }]);
  }
  for (let i = 0; i < 2; i++) id = await store.commit(id, new Uint8Array([1]), []);
  const db = new DatabaseSync(path);
  console.log(JSON.stringify({node:process.version,completedCycles:150,current:id,usage:db.prepare('SELECT bytes,rows FROM local_state').get(),physical:db.prepare('SELECT count(*) AS rows,sum(value IS NULL) AS deletionMarkers FROM local_rows').get()}));
  db.close();
} catch (error) {
  const db = new DatabaseSync(path);
  console.log(JSON.stringify({node:process.version,attemptedGeneration,current:(await store.current()).id,error:{name:error.name,code:error.code,message:error.message},usage:db.prepare('SELECT bytes,rows FROM local_state').get(),physical:db.prepare('SELECT count(*) AS rows,sum(value IS NULL) AS deletionMarkers FROM local_rows').get(),currentVisibleRows:(await store.page(id,'pending')).rows.length}));
  db.close();
  throw error;
} finally {
  await store.close();
  await rm(dir,{recursive:true});
}
