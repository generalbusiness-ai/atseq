import { open, mkdir, rename, rm } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { PersistProjection } from '../runtime/folder.ts';

/** Disposable host cache. Canonical truth remains the signed PDS prefix. */
export function projectionFile(path: string): PersistProjection {
  return async projection => {
    await mkdir(dirname(path), { recursive: true, mode: 0o700 });
    const temp = `${path}.${randomUUID()}.tmp`;
    try {
      const file = await open(temp, 'wx', 0o600);
      try { await file.writeFile(JSON.stringify(projection)); await file.sync(); }
      finally { await file.close(); }
      await rename(temp, path);
      const directory = await open(dirname(path), 'r');
      try { await directory.sync(); } finally { await directory.close(); }
    } finally { await rm(temp, { force: true }); }
  };
}
