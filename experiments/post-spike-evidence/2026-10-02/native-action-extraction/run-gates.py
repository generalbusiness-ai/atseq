from pathlib import Path
import os,subprocess,json,time,hashlib,concurrent.futures,shutil,sys
root=Path('/private/tmp/atseq-native-action-c1-f1-20261002');phase=sys.argv[1]
out=root/'.atseq-local/c1-f1'/phase;out.mkdir(parents=True,exist_ok=True)
oracle=Path('/private/tmp/atseq-c1-f1-oracle-20261002.json')
assert hashlib.sha256(oracle.read_bytes()).hexdigest()=='f7c6d9c3740208973de828da976107b32a6107ad3c62085412476fdbb2e874e6'
nodes={'node22':'/Users/hughpyle/.npm/_npx/992a19d7d9bf36d4/node_modules/node/bin/node','node24':'/Users/hughpyle/.npm/_npx/387698761821791d/node_modules/node/bin/node','node26':'/opt/homebrew/bin/node'}
rows=[]
def run(name,args,extra=None,timeout=300):
 d=out/name;d.mkdir(parents=True,exist_ok=True)
 existing=list(d.glob('attempt-*.log'));attempt=len(existing)+1
 env=os.environ.copy();env.update(ATSEQ_NATIVE_APPLICATION_FIXTURE_PATH=str(oracle));env.pop('NODE_TEST_CONTEXT',None)
 env['PATH']=str(Path(args[0]).parent)+':'+env['PATH']
 if extra:env.update(extra)
 start=time.monotonic()
 with (d/f'attempt-{attempt}.log').open('wb') as f:
  try:r=subprocess.run(args,cwd=root,env=env,stdout=f,stderr=subprocess.STDOUT,timeout=timeout);code=r.returncode
  except subprocess.TimeoutExpired:code='TIMEOUT'
 row={'name':name,'attempt':attempt,'command':args,'fixturePath':str(oracle),'exitCode':code,'elapsedSeconds':time.monotonic()-start,'log':str((d/f'attempt-{attempt}.log').relative_to(root))}
 (d/f'attempt-{attempt}.json').write_text(json.dumps(row,indent=2)+'\n');print(json.dumps(row),flush=True);return row
source_hashes={}
for p in ['src/application/native-authority.ts','src/runtime/evaluator.ts','src/runtime/index.ts','src/application/index.ts','tests/support/native-application-corpus.ts','tests/support/native-application-fixture.ts','tests/support/native-application-fault-bundle.ts','tests/support/native-application-fault-probe.ts','tests/native-application.test.ts','tests/native-application-browser.test.ts','experiments/native-application/compiled-conformance.mjs','package.json','npm-shrinkwrap.json']:
 source_hashes[p]=hashlib.sha256((root/p).read_bytes()).hexdigest()
(out/'source-at-start.json').write_text(json.dumps({'phase':phase,'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'workingTree':subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True),'files':source_hashes,'nodes':{k:subprocess.check_output([v,'--version'],text=True).strip() for k,v in nodes.items()}},indent=2)+'\n')
rows.append(run('build',[nodes['node26'],'scripts/build.mjs']))
if rows[-1]['exitCode']!=0:sys.exit(1)
shutil.copyfile(root/'dist/build-provenance.json',out/'build-provenance.json')
if (root/'dist/browser/build-provenance.json').exists():shutil.copyfile(root/'dist/browser/build-provenance.json',out/'shell-build-provenance.json')
def source_run(item):
 tag,node=item;dest=out/tag/'source';dest.mkdir(parents=True,exist_ok=True)
 return run(tag+'/source',[node,'scripts/source-run.mjs','--test','tests/native-application.test.ts'],{'ATSEQ_NATIVE_APPLICATION_CAPTURE_DIR':str(dest)})
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:rows.extend(ex.map(source_run,nodes.items()))
if any(x['exitCode']!=0 for x in rows):sys.exit(1)
def compiled_run(item):
 tag,node=item;dest=out/tag/'compiled';dest.mkdir(parents=True,exist_ok=True)
 return run(tag+'/compiled',[node,'experiments/native-application/compiled-conformance.mjs'],{'ATSEQ_NATIVE_APPLICATION_COMPILED_CAPTURE':str(dest/'result.json')})
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:rows.extend(ex.map(compiled_run,nodes.items()))
if any(x['exitCode']!=0 for x in rows):sys.exit(1)
rows.append(run('chromium',[nodes['node26'],'scripts/source-run.mjs','--test','tests/native-application-browser.test.ts']))
if rows[-1]['exitCode']!=0:sys.exit(1)
shutil.copyfile(root/'.atseq-local/native-application-chromium.json',out/'chromium/result.json')
shutil.copyfile(root/'.atseq-local/native-application-browser/fault-bundle.mjs',out/'chromium/fault-bundle.mjs')
(out/'run.json').write_text(json.dumps({'phase':phase,'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'rows':rows,'runtimeTestsRun':True,'fixtureSha256':hashlib.sha256(oracle.read_bytes()).hexdigest()},indent=2)+'\n')
print('COMPLETE '+phase,flush=True)
