import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { chromium, expect } from '@playwright/test';
import { startEnvironment, resetDisposable, assertDisposable } from '../experiments/pds/environment.mjs';
import { ApplicationHost } from '../src/host/application.ts';
import { LocalAccounts } from '../src/host/accounts.ts';
import { startApplicationService } from '../src/host/http.ts';
import { buildShell } from '../src/host/build.ts';
import { AtseqClient } from '../src/client/api.ts';
import { createIdentity, prepareIntent } from '../src/client/identity.ts';
import { bytes, contentCid } from '../src/protocol/wire.ts';
import { Anchor, headAt } from '../src/protocol/log.ts';
import { ACTIVATE } from '../src/definition/control.ts';
import { exportArchive, importArchive, encodeArchive } from '../src/archive/archive.ts';
import { chartExport } from '../src/archive/chart.ts';
import { guitarEvolution, oversizedClosure } from '../testdata/apps/evolution.ts';
import { chartFixture } from '../testdata/apps/fixtures.ts';
import { SourceBundle } from '../src/definition/source.ts';
import { cli } from './helpers/cli.ts';
import { recordFlowEvidence, type MeasuredCase } from './helpers/evidence.ts';
import { ARCHIVE_LIMIT } from '../src/archive/limits.ts';

test('retain complete app history and rebuild without the PDS', async t => {
  const results: MeasuredCase[] = [], check = async (name: string, run:()=>Promise<void>) => {
    let fault:unknown; await t.test(name,async()=>{const start=performance.now();let passed=false;try{await run();passed=true;}catch(error){fault=error;throw error;}finally{results.push({name,passed,elapsedMs:performance.now()-start});}});if(fault)throw fault;
  };
  const env=await startEnvironment(),directory=join(env.dir,'apps'),root=resolve('experiments/generated/archive-app');await buildShell(root);
  const accounts=new LocalAccounts(env.url,directory),host=new ApplicationHost(directory,accounts);let service=await startApplicationService(host,{staticRoot:root});
  const api=new AtseqClient(service.url),identity=await createIdentity('Archive owner'),fixture=await guitarEvolution(),creationId=randomUUID();
  const created=await api.call('create',{source:bytes(await fixture.old.bundle.write()),activationKeys:[identity.publicKey]},creationId),target={app:created.genesis.app,genesis:created.genesisCid.$link};
  const send=async(definition:string,action:string,payload:any)=>{const pending=await prepareIntent(identity,target,definition,action,payload);await api.call('submit',{block:bytes(new Uint8Array(pending.block))});return pending;};
  const browser=await chromium.launch(),context=await browser.newContext(),page=await context.newPage();page.setDefaultTimeout(10000);
  let input:any,archive:any,replayed:any,archivePath=join(env.dir,'application.atseq.json');
  try {
    await send(fixture.old.bundle.root,fixture.old.action,{id:'one',title:'Retained evidence',pricePence:30000});
    const comparison=await api.call('stageDefinition',{...target,expected:fixture.old.bundle.root,source:bytes(await fixture.bundle.write())});
    await send(fixture.old.bundle.root,ACTIVATE,{expected:fixture.old.bundle.root,definition:fixture.bundle.root,closure:comparison.closure});
    await send(fixture.old.bundle.root,fixture.old.action,{id:'old',title:'Old definition',pricePence:100});
    await send(fixture.bundle.root,'test.guitar.data#select',{id:'one'});
    input=await api.call('sync',target);
    await check('complete evolved archive retains source history, profiles and exact outcomes',async()=>{
      archive=await exportArchive({...input,privateKey:'MUST_NOT_EXPORT',password:'MUST_NOT_EXPORT'});assert.equal(archive.input.head.position,4);
      assert.equal(JSON.stringify(archive).includes('MUST_NOT_EXPORT'),false);assert.ok(archive.licenses.length>0);
      replayed=await importArchive(encodeArchive(archive),target);assert.equal(replayed.snapshot.projection.definition,fixture.bundle.root);assert.equal((replayed.snapshot.projection.state as any).selected,'one');
      assert.equal(replayed.snapshot.projection.outcomes[2].outcome.reason,'definition_changed');assert.equal(replayed.retries.length,4);
      await writeFile(archivePath,encodeArchive(archive));
    });
    await check('chosen older prefix uses its original definition and no future candidate',async()=>{
      const old=await exportArchive(input,1),replay=await importArchive(encodeArchive(old));assert.equal(old.input.candidates!.length,0);assert.equal(replay.snapshot.projection.definition,fixture.old.bundle.root);assert.equal(replay.snapshot.projection.frontier.position,1);
    });
    await check('missing activation source permits only the last complete prefix',async()=>{
      const missing={...input,candidates:[]};const partial=await exportArchive(missing);assert.equal(partial.input.head.position,1);
      await assert.rejects(()=>exportArchive(missing,4),/through 1/);
      const broken=structuredClone(archive);broken.input.candidates=[];await assert.rejects(()=>importArchive(encodeArchive(broken)),/incomplete/);
    });
    await check('changed history, inventory, runtime and invitation cannot be accepted',async()=>{
      const changed=structuredClone(archive);changed.input.entries[0].signedIntent.intent.payload.title='Tampered';await assert.rejects(()=>importArchive(encodeArchive(changed)),/signature|P-256/);
      const inventory=structuredClone(archive);inventory.inventory.pop();await assert.rejects(()=>importArchive(encodeArchive(inventory)),/inventory/);
      const extra=structuredClone(archive);extra.password='Not allowed';await assert.rejects(()=>importArchive(encodeArchive(extra)),/Unknown archive field/);
      const runtime=structuredClone(archive);runtime.runtime.application.version=1;await assert.rejects(()=>importArchive(encodeArchive(runtime)),/runtime/);
      await assert.rejects(()=>importArchive(encodeArchive(archive),{...target,app:'did:plc:other'}),/invitation/);
      const notices=structuredClone(archive);notices.licenses=[];notices.replay='Different packaging instructions';
      assert.deepEqual((await importArchive(encodeArchive(notices))).snapshot.projection,replayed.snapshot.projection);
    });
    await check('archive bounds, byte decoding and source identity guards reject malformed copies',async()=>{
      const mutations:((copy:any)=>void)[]=[
        a=>{a.input.entries=Array(20001).fill(null);}, a=>{a.input.candidates=Array(33).fill(a.input.candidates[0]);},
        a=>{a.inventory=Array(2049).fill(a.inventory[0]);}, a=>{a.input.extra=true;}, a=>{a.input.source.extra=true;},
        a=>{a.input.candidates[0].extra=true;}, a=>{a.input.candidates[0].source.extra=true;},
        a=>{a.inventory[0].extra=true;}, a=>{a.runtime.extra=true;},
        a=>{a.input.source=a.input.candidates[0].source;}, a=>{a.input.candidates[0].definition=fixture.old.bundle.root;},
      ];
      for(const mutate of mutations){const copy=structuredClone(archive);mutate(copy);await assert.rejects(()=>importArchive(encodeArchive(copy)));}
      await assert.rejects(()=>importArchive(new Uint8Array([0xff])),/encoded data|encoding|UTF/i);
      await assert.rejects(()=>importArchive(new Uint8Array(ARCHIVE_LIMIT+1)),/48 MiB/);
    });
    await check('CLI rebuild uses a new directory after removing only its marked projection cache',async()=>{
      await assertDisposable(env.dir);const cache=join(directory,creationId,'projection.json');assert.deepEqual(JSON.parse(await readFile(cache,'utf8')),replayed.snapshot.projection);await rm(cache);await assert.rejects(()=>readFile(cache),{code:'ENOENT'});
      const output=join(env.dir,'rebuilt');const result=await cli({operation:'replay',source:archivePath,outputDirectory:output,...target});assert.equal(result.frontier.position,4);
      assert.deepEqual(JSON.parse(await readFile(join(output,'projection.json'),'utf8')),replayed.snapshot.projection);assert.deepEqual(JSON.parse(await readFile(join(output,'retry-index.json'),'utf8')),replayed.retries);
      for(const retry of replayed.retries){const entry=input.entries.find((e:any)=>e.signedIntent.intent.actorKey===retry.actorKey&&JSON.stringify(e.signedIntent.intent.nonce)===JSON.stringify(retry.nonce));const receipt=await api.call('receipt',{...target,intent:await contentCid(entry.signedIntent.intent)});assert.deepEqual(retry.receipt,receipt.receipt);}
      await assert.rejects(()=>cli({operation:'replay',source:archivePath,outputDirectory:join(env.dir,'wrong-pin'),...target,genesis:fixture.bundle.root}),/invitation/);
      await assert.rejects(()=>cli({operation:'replay',source:archivePath,outputDirectory:output}),/EEXIST/);
    });
    await check('installed shell bootstraps offline and rebuilds solely from an imported archive',async()=>{
      await page.goto(service.url);await expect(page.getByText('Shell saved for offline use',{exact:true})).toBeVisible();
      await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise<void>(resolve=>navigator.serviceWorker.addEventListener('controllerchange',()=>resolve(),{once:true}));});
      await context.setOffline(true);await page.reload();await expect(page.getByRole('heading',{name:'Your applications',exact:true})).toBeVisible();
      await page.getByLabel('Import app archive',{exact:true}).setInputFiles(archivePath);await expect(page.getByRole('heading',{name:'Weekend guitar shortlist',exact:true})).toBeVisible();
      await expect(page.getByText('Selected: one',{exact:true})).toBeVisible();assert.equal(await page.getByRole('button',{name:'Create identity',exact:true}).count(),1);
      await expect(page.getByText(/Offline.*Showing saved state through entry 4/)).toBeVisible();
      const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download app and verified history',exact:true}).click();const saved=await download;const path=join(env.dir,'offline-copy.json');await saved.saveAs(path);
      const checked=await importArchive(await readFile(path));assert.deepEqual(checked.snapshot.projection,replayed.snapshot.projection);assert.deepEqual(checked.retries,replayed.retries);
      await mkdir('experiments/generated/archive-evidence',{recursive:true});await page.screenshot({path:'experiments/generated/archive-evidence/offline.png',fullPage:true});
    });
    await check('an archive cannot replace this device’s genesis pin for an existing app DID',async()=>{
      const attacker=await createIdentity('Forged archive key'),genesis={...input.genesis,sequencerKey:attacker.publicKey,activationKeys:[attacker.publicKey]};
      const genesisCid=await contentCid(genesis),anchor=await Anchor.from(genesis,genesisCid);
      const forged=await exportArchive({...input,genesis,genesisCid,head:headAt(anchor),entries:[],candidates:[]});
      await importArchive(encodeArchive(forged));
      await assert.rejects(()=>importArchive(encodeArchive(forged),[target]),/pinned invitation/);
      const path=join(env.dir,'conflicting-genesis.atseq.json');await writeFile(path,encodeArchive(forged));
      const before=page.url();await page.getByLabel('Import app archive',{exact:true}).setInputFiles(path);
      await expect(page.getByRole('status')).toContainText('pinned invitation');
      assert.equal(page.url(),before);await expect(page.getByText('Selected: one',{exact:true})).toBeVisible();
      await page.reload();await expect(page.getByText('Selected: one',{exact:true})).toBeVisible();assert.ok(page.url().includes(target.genesis));
      const pin=await page.evaluate(app=>new Promise<any>((done,reject)=>{const r=indexedDB.open('atseq-device-v0');r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,q=db.transaction('values').objectStore('values').get(`pin:${app}`);q.onsuccess=()=>{done(q.result);db.close();};};}),target.app);
      assert.deepEqual(pin,target);
    });
    await check('cancelling a held worker export keeps verified inputs and an offline signed action',async()=>{
      await page.getByRole('button',{name:'Create identity',exact:true}).click();await page.getByRole('textbox',{name:'Display name'}).fill('Offline archive reader');await page.getByRole('button',{name:'Continue',exact:true}).click();await expect(page.getByText('Offline archive reader · this device',{exact:true})).toBeVisible();
      await page.getByRole('button',{name:'select',exact:true}).click();await page.getByRole('textbox',{name:'id',exact:true}).fill('one');await page.getByRole('button',{name:'Save action',exact:true}).click();await expect(page.getByText('Queued on device',{exact:true})).toBeVisible();
      const device=async()=>page.evaluate(async()=>{const db=await new Promise<IDBDatabase>((done,reject)=>{const r=indexedDB.open('atseq-device-v0');r.onsuccess=()=>done(r.result);r.onerror=()=>reject(r.error);});const values=await new Promise<any[]>((done,reject)=>{const r=db.transaction('values').objectStore('values').getAll();r.onsuccess=()=>done(r.result);r.onerror=()=>reject(r.error);});db.close();return values;});
      const before=await device();
      await page.evaluate(()=>{const send=Worker.prototype.postMessage;Worker.prototype.postMessage=function(message:any,...rest:any[]){if(message.kind==='exportArchive')return;(send as any).call(this,message,...rest);};});
      await page.getByRole('button',{name:'Download app and verified history',exact:true}).click();await expect(page.getByText('Verifying source and replaying the chosen prefix for export…',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Cancel local work',exact:true}).click();await expect(page.getByText(/cancelled.*Retained/i)).toBeVisible();assert.deepEqual(await device(),before);
      await page.reload();await expect(page.getByText('Selected: one',{exact:true})).toBeVisible();await expect(page.getByText('Queued on device',{exact:true})).toBeVisible();
      // Keep this context disconnected so its intentionally queued act cannot
      // change the retained four-entry archive used by the earlier assertions.
      await context.close();
    });
    await check('small imported data produces a zero-based chart and static source-tagged exports',async()=>{
      const chartContext=await browser.newContext(),chartPage=await chartContext.newPage();
      const page=chartPage;
      const fixture=await chartFixture(),doc=JSON.parse(new TextDecoder().decode(fixture.files['schemas/summary.json']));
      doc.defs.main.output.schema.properties.rows={type:'array',maxLength:100,items:{type:'object',required:['day','millimetres'],properties:{day:{type:'string'},millimetres:{type:'integer'}}}};doc.defs.main.output.schema.required.push('rows');
      const csv='day,millimetres\nMonday,4\nTuesday,0\nWednesday,12\nThursday,7\n';
      const csvPath=join(env.dir,'import.csv');await writeFile(csvPath,csv);const importedCsv=await readFile(csvPath,'utf8');
      const source=await SourceBundle.pack(fixture.manifest,{...fixture.files,'import.csv':new TextEncoder().encode(importedCsv),'schemas/summary.json':new TextEncoder().encode(JSON.stringify(doc)),'summary.jsonata':new TextEncoder().encode('{"count":$count(state.readings),"total":($count(state.readings)=0?0:$sum(state.readings.millimetres)),"rows":state.readings}')});
      const created=await api.call('create',{source:bytes(await source.write()),activationKeys:[identity.publicKey]},randomUUID()),invitation={app:created.genesis.app,genesis:created.genesisCid.$link};
      for(const line of importedCsv.trim().split('\n').slice(1)){const[day,mm]=line.split(',');const act=await prepareIntent(identity,invitation,source.root,fixture.action,{day:day!,millimetres:Number(mm)});await api.call('submit',{block:bytes(new Uint8Array(act.block))});}
      await page.goto(`${service.url}/#${new URLSearchParams(invitation)}`);await expect(page.getByText('Items: 4',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Run query',exact:true}).click();await page.getByRole('button',{name:'Draw chart',exact:true}).click();
      await expect(page.getByRole('cell',{name:'Wednesday',exact:true})).toBeVisible();
      const svgDownload=page.waitForEvent('download');await page.getByRole('button',{name:'Download SVG',exact:true}).click();const svg=join(env.dir,'chart.svg');await(await svgDownload).saveAs(svg);const text=await readFile(svg,'utf8');assert.match(text,/<metadata>/);assert.ok(text.includes(invitation.genesis));assert.ok(text.includes('Wednesday'));
      const tableDownload=page.waitForEvent('download');await page.getByRole('button',{name:'Download table',exact:true}).click();const table=join(env.dir,'chart.html');await(await tableDownload).saveAs(table);assert.match(await readFile(table,'utf8'),/Verified entry 4/);
      await writeFile('experiments/generated/archive-evidence/chart.svg',text);await writeFile('experiments/generated/archive-evidence/chart.html',await readFile(table));await page.screenshot({path:'experiments/generated/archive-evidence/chart.png',fullPage:true});
      const archived=await exportArchive(await api.call('sync',invitation));await writeFile('experiments/generated/archive-evidence/chart.atseq.json',encodeArchive(archived));
      const escaped=chartExport([{label:'<script>bad()</script>',value:-4}], 'label','value',{...invitation,definition:source.root,position:4,entry:archived.input.head.entry.$link,query:'summary',params:{}});assert.equal(escaped.svg.includes('<script>'),false);assert.match(escaped.svg,/&lt;script&gt;/);
    });
    await check('archives retain oversized invalid activation evidence and replay its following action',async()=>{
      const {first,second,closure}=await oversizedClosure(fixture);
      for(const bundle of [first,second])await api.call('stageDefinition',{...target,expected:fixture.bundle.root,source:bytes(await bundle.write())});
      await send(fixture.bundle.root,ACTIVATE,{expected:fixture.bundle.root,definition:first.root,closure});
      await send(fixture.bundle.root,fixture.action,{id:'one'});
      const retained=await exportArchive(await api.call('sync',target)),copy=await importArchive(encodeArchive(retained),target);
      assert.equal(copy.snapshot.stalled,undefined);assert.equal(copy.snapshot.projection.frontier.position,6);
      assert.deepEqual(copy.snapshot.projection.outcomes.slice(-2).map(o=>o.outcome),[{$type:'test.atseq.defs#ineffective',reason:'invalid_activation'},{$type:'test.atseq.defs#effective'}]);
      await writeFile('experiments/generated/archive-evidence/oversized-closure.atseq.json',encodeArchive(retained));
    });
    await writeFile('experiments/generated/archive-evidence/evolved.atseq.json',encodeArchive(archive));
  } finally { await recordFlowEvidence('archive',results,{expectedCases:11,browserVersion:browser.version(),offlineServiceWorker:true});await browser.close();await service.close();await env.close();await resetDisposable(env.dir); }
});
