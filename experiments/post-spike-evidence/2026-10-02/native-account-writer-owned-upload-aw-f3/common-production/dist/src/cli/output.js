import { lstat, stat, realpath, mkdir, open, link, rename, rm } from 'node:fs/promises';
import { resolve, dirname, basename, join, relative, isAbsolute } from 'node:path';
import { randomUUID } from 'node:crypto';
import { ProtocolError } from '../protocol/wire.js';
/** Resolve aliases even when the leaf or some parent directories do not exist. */
export async function canonicalPath(path) {
    let current = resolve(path);
    const missing = [];
    for (;;) {
        try {
            return join(await realpath(current), ...missing);
        }
        catch (error) {
            if (error.code !== 'ENOENT')
                throw error;
        }
        const parent = dirname(current);
        if (parent === current)
            throw new Error('No existing path ancestor');
        missing.unshift(basename(current));
        current = parent;
    }
}
async function identity(path) {
    try {
        const value = await stat(path);
        return `${value.dev}:${value.ino}`;
    }
    catch (error) {
        if (error.code === 'ENOENT')
            return;
        throw error;
    }
}
export async function checkOutput(path, policy = {}) {
    const output = resolve(path), canonical = await canonicalPath(output), outputIdentity = await identity(output);
    for (const protectedFile of policy.protectedFiles ?? []) {
        const protectedPath = await canonicalPath(protectedFile), protectedIdentity = await identity(protectedFile);
        if (canonical === protectedPath || (outputIdentity !== undefined && outputIdentity === protectedIdentity))
            throw new ProtocolError('protected_file', 'Output would replace a supplied key or intent file');
    }
    if (policy.sourceDirectory) {
        const source = await realpath(policy.sourceDirectory), inside = relative(source, canonical);
        if (inside === '' || (!isAbsolute(inside) && inside !== '..' && !inside.startsWith('../')))
            throw new ProtocolError('source_output', 'Write the CAR outside its source folder');
    }
    if (policy.overwrite !== true) {
        try {
            await lstat(output);
        }
        catch (error) {
            if (error.code === 'ENOENT')
                return output;
            throw error;
        }
        throw new ProtocolError('file_exists', 'Output exists; choose another path or explicitly set overwrite:true');
    }
    return output;
}
/** Publish complete 0600 output atomically, with exclusive creation by default. */
export async function writeOutput(path, data, policy = {}) {
    const output = await checkOutput(path, policy);
    await mkdir(dirname(output), { recursive: true, mode: 0o700 });
    const temporary = `${output}.${randomUUID()}.tmp`;
    try {
        const file = await open(temporary, 'wx', 0o600);
        try {
            await file.writeFile(data);
            await file.sync();
        }
        finally {
            await file.close();
        }
        // Recheck protected identities after preparing the output; an explicit
        // overwrite never grants permission to replace supplied key/intent files.
        await checkOutput(output, policy);
        if (policy.overwrite === true)
            await rename(temporary, output);
        else
            try {
                await link(temporary, output);
            }
            catch (error) {
                if (error.code === 'EEXIST')
                    throw new ProtocolError('file_exists', 'Output already exists');
                throw error;
            }
        const directory = await open(dirname(output), 'r');
        try {
            await directory.sync();
        }
        finally {
            await directory.close();
        }
    }
    finally {
        await rm(temporary, { force: true });
    }
}
//# sourceMappingURL=output.js.map