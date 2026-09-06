import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { recordFlowEvidence } from '../tests/helpers/evidence.ts';

const commands = [
  ['npm','run','check'], ['npm','test'], ['npm','run','spike:feasibility'],
  ['npm','run','test:protocol'], ['npm','run','test:pds'], ['npm','run','test:runtime'], ['npm','run','test:dynamic-apps'],
  ['npm','run','test:flows','--','--group','participation'], ['npm','run','test:flows','--','--group','evolution'],
  ['node','--import','tsx','--test','tests/archive.test.ts'],
  ['node','--import','tsx','scripts/performance.ts'], ['node','--import','tsx','scripts/browser-performance.ts'],
  ['node','--import','tsx','scripts/check-author.ts'],
];
await mkdir('experiments/generated/acceptance',{recursive:true});
await mkdir('experiments/acceptance-logs',{recursive:true});
const startedAt = new Date().toISOString(), results:any[]=[];
await writeFile('experiments/acceptance.json', JSON.stringify({passed:false,status:'running',startedAt,commands:results},null,2)+'\n');
for(const [index,command] of commands.entries()){
  console.log(`Acceptance ${index+1}/${commands.length}: ${command.join(' ')}`);const start=performance.now();
  const child=spawn(command[0]!,command.slice(1),{stdio:['ignore','pipe','pipe']}),chunks:Buffer[]=[];
  child.stdout.on('data',b=>chunks.push(b));child.stderr.on('data',b=>chunks.push(b));
  const code=await new Promise<number|null>((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);});
  const name=`${String(index+1).padStart(2,'0')}.log`,log=`experiments/acceptance-logs/${name}`,text=Buffer.concat(chunks).toString();
  await writeFile(`experiments/generated/acceptance/${name}`,text);await writeFile(log,text);
  results.push({command,exitCode:code,passed:code===0,elapsedMs:performance.now()-start,log,logSha256:createHash('sha256').update(text).digest('hex')});
  console.log(`${code===0?'PASS':'FAIL'} ${command.join(' ')}`);
  await writeFile('experiments/generated/acceptance-partial.json',JSON.stringify({passed:false,results},null,2)+'\n');
  await writeFile('experiments/acceptance.json',JSON.stringify({passed:false,status:'running',startedAt,commands:results},null,2)+'\n');
}
const passed=results.every(r=>r.passed);
await recordFlowEvidence('acceptance',results.map(r=>({name:r.command.join(' '),passed:r.passed,elapsedMs:r.elapsedMs})),{expectedCases:commands.length,status:'complete',startedAt,commands:results,recommendation:passed?'revise':'incomplete',decision:passed?'Retain the declarative source/log/activation contracts. Revise complete-prefix serving and repeated verification before using this host for long histories; no unbounded-performance claim.':'This run failed. Its retained commands and logs identify the reproduction; earlier stage evidence does not establish success for this run.'});
await cp('experiments/generated/acceptance-results.json','experiments/acceptance.json');
if(passed){
  const reports={protocol:'protocol',pds:'pds',runtime:'runtime',dynamic:'dynamic','host-flows':'host-flows',participation:'participation','evolution-runtime':'evolution-runtime',evolution:'evolution',archive:'archive',performance:'performance','browser-performance':'browser-performance',acceptance:'acceptance'};
  for(const [generated,retained] of Object.entries(reports))await cp(`experiments/generated/${generated}-results.json`,`experiments/${retained}.json`);
  await mkdir('experiments/evidence/s6',{recursive:true});for(const name of ['offline.png','chart.png','chart.svg','chart.html','chart.atseq.json','evolved.atseq.json','oversized-closure.atseq.json'])await cp(`experiments/generated/archive-evidence/${name}`,`experiments/evidence/s6/${name}`);
  await cp('experiments/generated/dynamic-apps','experiments/evidence/s3',{recursive:true});
  for (const [source, stage] of [['participation-evidence','s4'],['evolution-evidence','s5']]) await cp(`experiments/generated/${source}`,`experiments/evidence/${stage}`,{recursive:true});
  await cp('experiments/generated/acceptance','experiments/acceptance-logs',{recursive:true});
  const retained = [...Object.values(reports).filter(name=>name!=='acceptance').map(name=>`experiments/${name}.json`), 'experiments/feasibility.json', 'experiments/agent-authored/verification.json'];
  const report = JSON.parse(await readFile('experiments/acceptance.json','utf8'));
  report.retainedHashes = Object.fromEntries(await Promise.all(retained.map(async path=>[path,createHash('sha256').update(await readFile(path)).digest('hex')])));
  await writeFile('experiments/acceptance.json',JSON.stringify(report,null,2)+'\n');
  await cp('experiments/acceptance.json','experiments/generated/acceptance-results.json');
}
process.exitCode=passed?0:1;
