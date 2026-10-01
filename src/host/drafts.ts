import { readdir, lstat, readFile, unlink, utimes } from 'node:fs/promises';
import { join } from 'node:path';
import { SerialQueue } from '../core/queue.ts';
import { link } from '../protocol/wire.ts';
import { atomicFile } from './files.ts';
import { HostError } from './errors.ts';

/** Bounded preview cache. Eviction never affects published source or device drafts. */
export class DraftStore {
  private readonly queue = new SerialQueue();
  private readonly directory: string;
  constructor(
    directory: string,
    private readonly limits = { count: 32, bytes: 16 * 1024 * 1024 },
  ) {
    this.directory = join(directory, 'drafts');
    if (![limits.count, limits.bytes].every((n) => Number.isSafeInteger(n) && n > 0))
      throw new Error('Draft limits must be positive integers');
  }
  read(cid: string): Promise<Uint8Array> {
    link(cid);
    return this.queue.run(async () => {
      const path = join(this.directory, cid + '.car');
      try {
        const stat = await lstat(path);
        if (!stat.isFile())
          throw new HostError('draft_storage', 503, 'Draft storage contains an alias or special file');
        const content = await readFile(path),
          now = new Date();
        await utimes(path, now, now);
        return new Uint8Array(content);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT')
          throw new HostError(
            'draft_not_found',
            404,
            'Preview draft expired or was not found; preview its source again',
          );
        throw error;
      }
    });
  }
  put(cid: string, content: Uint8Array): Promise<void> {
    link(cid);
    const owned = new Uint8Array(content);
    return this.queue.run(async () => {
      if (owned.length > this.limits.bytes)
        throw new HostError('draft_limit', 429, 'This draft exceeds the host preview byte budget');
      let names: string[];
      try {
        names = await readdir(this.directory);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        names = [];
      }
      const retained: { name: string; size: number; touched: number }[] = [];
      for (const name of names.filter((name) => name.endsWith('.car'))) {
        const stat = await lstat(join(this.directory, name));
        if (!stat.isFile())
          throw new HostError('draft_storage', 503, 'Draft storage contains an alias or special file');
        if (name !== cid + '.car') retained.push({ name, size: stat.size, touched: stat.mtimeMs });
      }
      retained.sort((a, b) => a.touched - b.touched || a.name.localeCompare(b.name));
      let size = retained.reduce((total, draft) => total + draft.size, owned.length),
        count = retained.length + 1;
      const evict: string[] = [];
      for (const draft of retained) {
        if (count <= this.limits.count && size <= this.limits.bytes) break;
        evict.push(draft.name);
        count--;
        size -= draft.size;
      }
      // Retain the replacement successfully before removing older previews.
      await atomicFile(join(this.directory, cid + '.car'), owned);
      for (const name of evict) await unlink(join(this.directory, name));
    });
  }
}
