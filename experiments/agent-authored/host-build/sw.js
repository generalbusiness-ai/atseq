const NAME="atseq-shell-v0-38c0e439ed9b1842c326", FILES=["/assets/index-BXQGzu8_.js","/assets/index-hi_6fonS.css","/assets/worker-B7zgIZLm.js","/index.html"];
self.addEventListener('install',event=>event.waitUntil(caches.open(NAME).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('atseq-shell-v0-')&&key!==NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 if(event.request.mode==='navigate'&&url.pathname==='/'){event.respondWith(fetch(event.request).catch(()=>caches.open(NAME).then(cache=>cache.match('/index.html'))));return;}
 if(FILES.includes(url.pathname)){event.respondWith(caches.open(NAME).then(async cache=>(await cache.match(url.pathname))||fetch(event.request)));}
});
