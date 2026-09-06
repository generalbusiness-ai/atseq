import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';

test('a failed acceptance run replaces a prior pass and retains its exact command logs', async () => {
  const root = await mkdtemp(join(tmpdir(), 'atseq-acceptance-failure-'));
  const run = (script: string) => new Promise<{code:number|null;output:string}>((done,reject) => {
    const child = spawn(process.execPath, ['--import', import.meta.resolve('tsx'), resolve(script)], {cwd:root,env:{...process.env,PATH:join(root,'bin')},stdio:['ignore','pipe','pipe']});
    let output='';child.stdout.on('data',data=>output+=data);child.stderr.on('data',data=>output+=data);child.once('error',reject);child.once('close',code=>done({code,output}));
  });
  try {
    for (const dir of ['bin','src','lexicons','testdata','tests','scripts','experiments/pds']) await mkdir(join(root,dir),{recursive:true});
    for (const path of ['package.json','package-lock.json','experiments/pds/environment.mjs','experiments/pds/pds-server.mjs','experiments/pds/package.json','experiments/pds/package-lock.json']) await writeFile(join(root,path),'{}');
    for (const name of ['npm','node']) await writeFile(join(root,'bin',name),'#!/bin/sh\necho "Deliberate acceptance fixture failure"\nexit 17\n',{mode:0o700});
    await writeFile(join(root,'experiments/acceptance.json'),JSON.stringify({passed:true,sourceHashes:{},commands:[]}));
    const result = await run('scripts/acceptance.ts');assert.equal(result.code,1,result.output);
    const report = JSON.parse(await readFile(join(root,'experiments/acceptance.json'),'utf8'));
    assert.equal(report.passed,false);assert.equal(report.status,'complete');assert.equal(report.recommendation,'incomplete');assert.equal(report.commands.length,13);
    for (const command of report.commands) {
      assert.equal(command.exitCode,17);assert.equal(command.passed,false);
      assert.match(await readFile(join(root,command.log),'utf8'),/Deliberate acceptance fixture failure/);
    }
    const note = await run('scripts/report.ts');assert.notEqual(note.code,0);assert.match(note.output,/Acceptance is incomplete/);
  } finally { await rm(root,{recursive:true,force:true}); }
});
