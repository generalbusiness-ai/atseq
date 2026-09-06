import { build } from 'vite';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
/** Cache only this installed shell; never XRPC replies, credentials or archives. */
export async function buildShell(outDir: string) {
  const root = resolve(outDir);
  await build({ root: resolve('src/browser'), logLevel: 'warn', build: { outDir: root, emptyOutDir: true } });
  const files: string[] = [];
  async function walk(path = '') { for (const entry of await readdir(join(root,path), {withFileTypes:true})) { const name = path ? `${path}/${entry.name}` : entry.name; if (entry.isDirectory()) await walk(name); else if (/\.(html|js|css)$/.test(name)) files.push('/'+name); } }
  await walk(); files.sort(); const hash = createHash('sha256');
  for (const path of files) hash.update(path).update(await readFile(root+path));
  const cache = 'atseq-shell-v0-' + hash.digest('hex').slice(0,20);
  const script = `const NAME=${JSON.stringify(cache)}, FILES=${JSON.stringify(files)};
self.addEventListener('install',event=>event.waitUntil(caches.open(NAME).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('atseq-shell-v0-')&&key!==NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 if(event.request.mode==='navigate'&&url.pathname==='/'){event.respondWith(fetch(event.request).catch(()=>caches.open(NAME).then(cache=>cache.match('/index.html'))));return;}
 if(FILES.includes(url.pathname)){event.respondWith(caches.open(NAME).then(async cache=>(await cache.match(url.pathname))||fetch(event.request)));}
});\n`;
  await writeFile(join(root,'sw.js'),script); return {root,cache,files};
}
