const NAME="atseq-shell-v0-fc1effac0c1d2a5d17dd", FILES=["/assets/index-CasGVl9K.css","/assets/index-Dio-obB8.js","/assets/worker-BmogdvyT.js","/index.html"], HASHES={"/assets/index-CasGVl9K.css":"24ee742cbe2fa624f2210ac79833b9fe5193bf8c49f4d67cd0a1c8e22c870404","/assets/index-Dio-obB8.js":"965228f7ffe4dfec2a35786c10b06640d68da81f63b267dcb83a9123a89445c1","/assets/worker-BmogdvyT.js":"4c350ac458e56b70059cbc96608e8534d32dd379e933cd9ebe6214101d73df19","/index.html":"ae9fe2fb86b659f86b9e476876184eaa5ed19d2c88b8d29576d32718d651630a"};
self.addEventListener('install',event=>event.waitUntil(caches.open(NAME).then(async cache=>{for(const path of FILES){const response=await fetch(path,{cache:'no-store'});if(!response.ok)throw new Error('Shell fetch failed');const data=await response.clone().arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),n=>n.toString(16).padStart(2,'0')).join('');if(hash!==HASHES[path])throw new Error('Shell build drift');await cache.put(path,response);}})));
// Let open tabs finish with their current worker. Retain older hashed shells for their lazy worker assets.
// The browser activates this version after every tab using the previous worker closes.
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 if(event.request.mode==='navigate'&&url.pathname==='/'){event.respondWith(fetch(event.request).catch(()=>caches.open(NAME).then(cache=>cache.match('/index.html'))));return;}
 if(FILES.includes(url.pathname)){event.respondWith(caches.open(NAME).then(async cache=>(await cache.match(url.pathname))||fetch(event.request)));}
});
