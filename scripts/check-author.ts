import assert from 'node:assert/strict';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { exportArchive, importArchive, encodeArchive } from '../src/archive/archive.ts';
import { AtseqClient } from '../src/client/api.ts';
import { SourceBundle } from '../src/definition/source.ts';
const root='experiments/agent-authored',directory=root+'/mending-circle-tool-desk';
const read=async(path:string)=>JSON.parse(await readFile(path,'utf8'));
const result=await read(directory+'/result.json'),transcript=await read(directory+'/transcript.json'),before=await read(root+'/host-before.json'),after=await read(root+'/host-after.json');
assert.deepEqual(before.hashes,after.hashes);assert.ok(Date.parse(before.capturedAt)<Date.parse(transcript.startedAt));assert.ok(Date.parse(after.capturedAt)>Date.parse(result.completedAt));
assert.ok(transcript.steps.length >= 15);assert.ok(transcript.steps.every((step:any)=>step.command==='npm run --silent atseq'&&step.exitCode===0&&step.response.ok));
const forbidden=new Set(['privateKey','password','accessJwt','refreshJwt','token','jwtSecret','writer']);
function scan(value:any){if(!value||typeof value!=='object')return;for(const[key,child]of Object.entries(value)){assert.equal(forbidden.has(key),false,`Retained secret field: ${key}`);scan(child);}}
scan(result);scan(transcript);
const files:Record<string,Uint8Array>={};async function walk(path=''){for(const entry of await readdir(join(directory,'source',path),{withFileTypes:true})){const relative=path?`${path}/${entry.name}`:entry.name;if(entry.isDirectory())await walk(relative);else if(relative!=='manifest.json')files[relative]=await readFile(join(directory,'source',relative));}}
await walk();const source=await SourceBundle.pack(await read(directory+'/source/manifest.json'),files);assert.equal(source.root,result.definition);assert.deepEqual(await source.write(),new Uint8Array(await readFile(directory+'/definition.car')));
if(process.argv.includes('--capture')){const api=new AtseqClient(result.invitation.host),input=await api.call('sync',{app:result.invitation.app,genesis:result.invitation.genesis});await writeFile(directory+'/application.atseq.json',encodeArchive(await exportArchive(input)));}
const replay=await importArchive(await readFile(directory+'/application.atseq.json'),result.invitation);assert.equal(replay.snapshot.projection.frontier.position,5);assert.equal(replay.snapshot.projection.definition,result.definition);
assert.deepEqual(replay.snapshot.projection.outcomes.map(({position,intent,outcome})=>({position,intent,outcome})),result.outcomes);
assert.deepEqual(await replay.folder.query('summary',{}),result.finalQuery.response);assert.equal(replay.retries.length,5);
const submitted=transcript.steps.filter((s:any)=>s.request.operation==='submit');assert.equal(submitted.length,6);assert.deepEqual(submitted.at(-1).response.result.receipt,submitted.at(-2).response.result.receipt);assert.equal(submitted.at(-1).response.result.intent,submitted.at(-2).response.result.intent);
for(const step of submitted){const cid=step.response.result.intent,entry=replay.history.entries.find(e=>replay.snapshot.projection.outcomes[e.position-1]?.intent===cid);assert.ok(entry);assert.equal(step.response.result.receipt.position,entry.position);assert.deepEqual(step.request.payload,entry.signedIntent.intent.payload);}
const sourceHashes:Record<string,string>={};async function hashes(path:string){for(const entry of await readdir(path,{withFileTypes:true})){const name=join(path,entry.name);if(entry.isDirectory())await hashes(name);else sourceHashes[name]=createHash('sha256').update(await readFile(name)).digest('hex');}}await hashes(directory);
await writeFile(root+'/verification.json',JSON.stringify({passed:true,measuredAt:new Date().toISOString(),title:result.invitation.title,authoring:'Existing agent, documented adapter only; separate from fixture generation and final independent review.',hostAndBuildUnchanged:true,hostFilesCompared:Object.keys(before.hashes).length,adapterCalls:transcript.steps.length,entries:5,source:source.root,genesis:replay.anchor.cid,frontier:replay.snapshot.projection.frontier,sourceHashes},null,2)+'\n');console.log('Agent-authored app: source and 5 signed entries replay; documented adapter calls, same exact retry, unchanged host/build.');
