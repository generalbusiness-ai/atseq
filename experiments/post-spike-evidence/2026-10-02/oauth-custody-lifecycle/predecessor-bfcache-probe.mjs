import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:https';
import { relative,resolve } from 'node:path';
const root='/private/tmp/atseq-oauth-bounded-custody-20261002';
const require=createRequire(root+'/package.json');
const {chromium}=require('@playwright/test'),{build}=require('esbuild');
const output=root+'/.atseq-local/bfcache-readonly';
const built=await build({entryPoints:[root+'/tests/support/oauth-browser-probe.ts'],bundle:true,splitting:true,outdir:output,format:'esm',platform:'browser',target:'es2022',conditions:['atseq-source','browser'],write:false,minify:true});
const files=new Map(built.outputFiles.map(file=>['/'+relative(output,file.path),file.contents]));
const server=createServer({key:await readFile('/private/tmp/atseq-bfcache-fixture-key.pem'),cert:await readFile('/private/tmp/atseq-bfcache-fixture-cert.pem')},(req,res)=>{const bytes=files.get(new URL(req.url,'https://server.invalid').pathname);res.writeHead(200,{'content-type':bytes?'text/javascript':'text/html','cache-control':'public,max-age=3600'});res.end(bytes??'<!doctype html><title>Native TLS BFCache fixture</title>');});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const browser=await chromium.launch({channel:'chromium',ignoreDefaultArgs:['--disable-back-forward-cache'],args:['--host-resolver-rules=MAP *.atseq-probe.net 127.0.0.1','--no-proxy-server']});
const context=await browser.newContext({ignoreHTTPSErrors:true});
const page=await context.newPage();
const cdp=await context.newCDPSession(page);await cdp.send('Page.enable');const diagnostics=[];cdp.on('Page.backForwardCacheNotUsed',event=>diagnostics.push(event.notRestoredExplanations));
await page.addInitScript(()=>{globalThis.lifecycle=[];globalThis.instance=crypto.randomUUID();globalThis.activeTimers=new Set();const originalSet=setInterval,originalClear=clearInterval;globalThis.setInterval=(fn,time,...args)=>{const id=originalSet(fn,time,...args);if(time===60000)globalThis.activeTimers.add(id);return id;};globalThis.clearInterval=id=>{globalThis.activeTimers.delete(id);originalClear(id);};addEventListener('pageshow',event=>globalThis.lifecycle.push({event:'pageshow',persisted:event.persisted}));addEventListener('pagehide',event=>globalThis.lifecycle.push({event:'pagehide',persisted:event.persisted}));});
try {
 await page.goto('https://custody.atseq-probe.net:'+port+'/');
 await page.evaluate(async(port)=>{const probe=await import('/oauth-browser-probe.js');globalThis.probe=probe;const origin=location.origin;await probe.create({custodyOrigin:origin,publisherOrigin:'https://publisher.atseq-probe.net:'+port,applicationOrigin:'https://application.atseq-probe.net:'+port,metadata:{client_id:origin+'/oauth.json',application_type:'web',redirect_uris:[origin+'/callback'],response_types:['code'],grant_types:['authorization_code','refresh_token'],token_endpoint_auth_method:'none',dpop_bound_access_tokens:true,scope:'atproto repo:ai.generalbusiness.atseq.grant?action=create'}});},port);
 const initial=await page.evaluate(()=>({instance:globalThis.instance,events:globalThis.lifecycle,activeTimers:globalThis.activeTimers.size}));
 await page.goto('https://other.atseq-probe.net:'+port+'/');await page.goBack({waitUntil:'commit'});
 const restored=await page.evaluate(()=>({instance:globalThis.instance,events:globalThis.lifecycle,activeTimers:globalThis.activeTimers.size,notRestored:performance.getEntriesByType('navigation')[0]?.notRestoredReasons?.toJSON?.()}));
 console.log(JSON.stringify({browser:browser.version(),actualTLS:true,requestInterception:false,diagnostics,initial,restored,bfcache:initial.instance===restored.instance&&restored.events.some(event=>event.event==='pageshow'&&event.persisted)},null,2));
}finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
