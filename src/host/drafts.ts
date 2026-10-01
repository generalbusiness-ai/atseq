import { readdir, lstat } from 'node:fs/promises';
import { join } from 'node:path';
import { SerialQueue } from '../core/queue.ts';
import { link } from '../protocol/wire.ts';
import { atomicFile } from './files.ts';
import { HostError } from './errors.ts';

/** Preview storage has an explicit count and byte budget; existing drafts stay retained. */
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
  put(cid: string, content: Uint8Array): Promise<void> {
    link(cid);
    const owned = new Uint8Array(content);
    return this.queue.run(async () => {
      let names: string[];
      try {
        names = await readdir(this.directory);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        names = [];
      }
      let size = 0,
        count = 0;
      for (const name of names.filter((n) => n.endsWith('.car'))) {
        const stat = await lstat(join(this.directory, name));
        if (!stat.isFile())
          throw new HostError('draft_storage', 503, 'Draft storage contains an alias or special file');
        if (name !== `${cid}.car`) {
          size += stat.size;
          count++;
        }
      }
      if (count + 1 > this.limits.count || size + owned.length > this.limits.bytes)
        throw new HostError('draft_limit', 429, 'Host draft limit reached');
      await atomicFile(join(this.directory, `${cid}.car`), owned);
    });
  }
}
