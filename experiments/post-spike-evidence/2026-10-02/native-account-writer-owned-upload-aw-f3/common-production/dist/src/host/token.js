import { join } from 'node:path';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { ensurePrivateFile, readPrivateFile } from '../storage/private.js';
export async function readHostToken(path) {
    const token = (await readPrivateFile(path)).trim();
    if (!/^[A-Za-z0-9_-]{43,128}$/.test(token))
        throw new Error('Invalid host token file');
    return token;
}
export async function hostToken(directory) {
    const path = join(directory, 'host-token');
    await ensurePrivateFile(path, randomBytes(32).toString('base64url') + '\n');
    return { path, token: await readHostToken(path) };
}
export function acceptsHostToken(value, expected) {
    const supplied = Buffer.from(value ?? '');
    const wanted = Buffer.from(`Bearer ${expected}`);
    return supplied.length === wanted.length && timingSafeEqual(supplied, wanted);
}
//# sourceMappingURL=token.js.map