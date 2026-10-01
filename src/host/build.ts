import { build } from 'vite';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { packageRoot, verifyInstalledDependencies } from '../integrity/node.ts';
import dependencies from '../core/dependencies-approved.json' with { type: 'json' };
import packageFiles from '../integrity/files-approved.json' with { type: 'json' };
import { createHash } from 'node:crypto';
/** Cache only this installed shell; never XRPC replies, credentials or archives. */
export async function buildShell(outDir: string) {
  verifyInstalledDependencies();
  const root = resolve(outDir);
  await build({
    root: resolve(packageRoot, 'src/browser'),
    logLevel: 'warn',
    build: { outDir: root, emptyOutDir: true },
  });
  const files: string[] = [];
  async function walk(path = '') {
    for (const entry of await readdir(join(root, path), { withFileTypes: true })) {
      const name = path ? `${path}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await walk(name);
      else if (/\.(html|js|css)$/.test(name)) files.push('/' + name);
    }
  }
  await walk();
  files.sort();
  const bundles = Object.fromEntries(
    await Promise.all(
      files.map(async (path) => [
        path,
        createHash('sha256')
          .update(await readFile(root + path))
          .digest('hex'),
      ]),
    ),
  );
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
  for (const path of files) hash.update(path).update(await readFile(root + path));
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
  return { root, cache, files, provenance };
}
