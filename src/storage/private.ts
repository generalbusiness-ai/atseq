import { constants } from 'node:fs';
import { mkdir, open, link, rm } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

/** Read a small owner-only file without following a symlink. */
export async function readPrivateFile(path: string): Promise<string> {
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = await file.stat();
    if (
      !stat.isFile() ||
      (stat.mode & 0o777) !== 0o600 ||
      (process.getuid && stat.uid !== process.getuid()) ||
      stat.size > 4096
    )
      throw new Error('Host token file must be a regular file owned by this user with mode 0600');
    return await file.readFile('utf8');
  } finally {
    await file.close();
  }
}
/** Create once, then read the retained file; a restart never rotates credentials. */
export async function ensurePrivateFile(path: string, value: string): Promise<string> {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  try {
    return await readPrivateFile(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    const file = await open(temporary, 'wx', 0o600);
    try {
      await file.writeFile(value);
      await file.sync();
    } finally {
      await file.close();
    }
    try {
      await link(temporary, path);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    }
    const directory = await open(dirname(path), 'r');
    try {
      await directory.sync();
    } finally {
      await directory.close();
    }
  } finally {
    await rm(temporary, { force: true });
  }
  return readPrivateFile(path);
}
