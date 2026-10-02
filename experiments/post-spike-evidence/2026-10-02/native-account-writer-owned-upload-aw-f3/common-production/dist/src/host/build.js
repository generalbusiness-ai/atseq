import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { packageRoot, verifyInstalledDependencies } from '../integrity/node.js';
import dependencies from '../core/dependencies-approved.json' with { type: 'json' };
import packageFiles from '../integrity/files-approved.json' with { type: 'json' };
import { createHash } from 'node:crypto';
/** Cache only this installed shell; never XRPC replies, credentials or archives. */
export async function buildShell(outDir) {
    verifyInstalledDependencies();
    const root = resolve(outDir);
    if (import.meta.url.endsWith('/dist/src/host/build.js')) {
        const installed = resolve(packageRoot, 'dist/shell'), manifest = JSON.parse(await readFile(join(installed, 'shell-manifest.json'), 'utf8'));
        // Verify the complete shell before replacing any files in the serving directory.
        const content = await Promise.all(Object.entries(manifest.hashes).map(async ([path, hash]) => {
            if (!/^\/(?:[a-zA-Z0-9_.-]+\/)*[a-zA-Z0-9_.-]+$/.test(path) || path.split('/').includes('..'))
                throw new Error('Invalid installed shell path');
            const data = await readFile(installed + path);
            if (createHash('sha256').update(data).digest('hex') !== hash)
                throw new Error('Installed shell build drift');
            return { path, data };
        }));
        for (const { path, data } of content) {
            await mkdir(resolve(root, '.' + path, '..'), { recursive: true });
            await writeFile(root + path, data);
        }
        return { root, cache: manifest.cache, files: manifest.files, provenance: manifest.provenance };
    }
    const { build } = await import('vite');
    await build({
        root: resolve(packageRoot, 'src/browser'),
        logLevel: 'warn',
        build: { outDir: root, emptyOutDir: true },
    });
    const files = [];
    async function walk(path = '') {
        for (const entry of await readdir(join(root, path), { withFileTypes: true })) {
            const name = path ? `${path}/${entry.name}` : entry.name;
            if (entry.isDirectory())
                await walk(name);
            else if (/\.(html|js|css)$/.test(name))
                files.push('/' + name);
        }
    }
    await walk();
    files.sort();
    const bundles = Object.fromEntries(await Promise.all(files.map(async (path) => [
        path,
        createHash('sha256')
            .update(await readFile(root + path))
            .digest('hex'),
    ])));
    const provenance = {
        format: 'atseq-build-provenance',
        version: 1,
        node: process.version,
        dependencies,
        packageFilesSha256: createHash('sha256').update(JSON.stringify(packageFiles)).digest('hex'),
        bundles,
    };
    await writeFile(join(root, 'build-provenance.json'), JSON.stringify(provenance, null, 2) + '\n');
    const hash = createHash('sha256');
    for (const path of files)
        hash.update(path).update(await readFile(root + path));
    const cache = 'atseq-shell-v0-' + hash.digest('hex').slice(0, 20);
    const script = `const NAME=${JSON.stringify(cache)}, FILES=${JSON.stringify(files)}, HASHES=${JSON.stringify(bundles)};
self.addEventListener('install',event=>event.waitUntil(caches.open(NAME).then(async cache=>{for(const path of FILES){const response=await fetch(path,{cache:'no-store'});if(!response.ok)throw new Error('Shell fetch failed');const data=await response.clone().arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),n=>n.toString(16).padStart(2,'0')).join('');if(hash!==HASHES[path])throw new Error('Shell build drift');await cache.put(path,response);}})));
// Let open tabs finish with their current worker. Retain older hashed shells for their lazy worker assets.
// The browser activates this version after every tab using the previous worker closes.
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 if(event.request.mode==='navigate'&&url.pathname==='/'){event.respondWith(fetch(event.request).catch(()=>caches.open(NAME).then(cache=>cache.match('/index.html'))));return;}
 if(FILES.includes(url.pathname)){event.respondWith(caches.open(NAME).then(async cache=>(await cache.match(url.pathname))||fetch(event.request)));}
});\n`;
    await writeFile(join(root, 'sw.js'), script);
    const hashes = { ...bundles };
    for (const path of ['/sw.js', '/build-provenance.json'])
        hashes[path] = createHash('sha256')
            .update(await readFile(root + path))
            .digest('hex');
    await writeFile(join(root, 'shell-manifest.json'), JSON.stringify({ cache, files, hashes, provenance }, null, 2) + '\n');
    return { root, cache, files, provenance };
}
//# sourceMappingURL=build.js.map