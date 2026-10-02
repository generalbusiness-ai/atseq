#!/usr/bin/env python3
"""Execute real browser tests with sibling directories absent; use a disposable checkout."""
import gzip,hashlib,json,os,subprocess,time
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4];PACKET=Path(__file__).resolve().parent
NODES={'22':'/Users/hughpyle/.npm/_npx/992a19d7d9bf36d4/node_modules/node/bin/node','24':'/Users/hughpyle/.npm/_npx/387698761821791d/node_modules/node/bin/node','26':'/opt/homebrew/Cellar/node/26.10.0_1/bin/node'}
sha=lambda raw:hashlib.sha256(raw).hexdigest()
def write(name,obj):(PACKET/name).write_text(json.dumps(obj,indent=2)+'\n')
def inventory(directory):return {str(p.relative_to(ROOT)):sha(p.read_bytes()) for p in sorted(directory.rglob('*')) if p.is_file()}
def main():
 os.chdir(ROOT)
 directories=['native-checkpoint-producer','native-checkpoint-producer-owned-input']
 for n in directories:assert not (ROOT/'.atseq-local'/n).exists()
 inputs={p:sha(Path(p).read_bytes()) for p in subprocess.check_output(['git','ls-files'],text=True).splitlines() if p.startswith(('src/','tests/','scripts/','lexicons/')) or p in ('package.json','npm-shrinkwrap.json','tsconfig.json','tsconfig.build.json')}
 write('execution-inputs.json',inputs);write('build-outputs.json',inventory(ROOT/'dist'))
 for directory,name in [(ROOT/'node_modules','tools'),(ROOT/'tests/support/pds/node_modules','pds-tools')]:
  (PACKET/(name+'.json.gz')).write_bytes(gzip.compress((json.dumps(inventory(directory),sort_keys=True,indent=2)+'\n').encode(),mtime=0))
 for name in ['npm-ci.log','npm-ci-pds.log','build.log','check.log']:(PACKET/name).write_bytes((ROOT/'.atseq-local/native-checkpoint-browser-directory'/name).read_bytes())
 runs=[]
 for major,mode in [(n,m) for n in ['22','24','26'] for m in ['producer-alone','owned-alone']]+[('26','concurrent')]:
  label=major+'-'+mode
  for n in directories:assert not (ROOT/'.atseq-local'/n).exists()
  tests=['tests/native-checkpoint-producer-browser.test.ts'] if mode=='producer-alone' else ['tests/native-checkpoint-producer-owned-input-browser.test.ts']
  if mode=='concurrent':tests=['tests/native-checkpoint-producer.test.ts','tests/native-checkpoint-producer-owned-input.test.ts','tests/native-checkpoint-producer-browser.test.ts','tests/native-checkpoint-producer-owned-input-browser.test.ts']
  env=dict(os.environ)
  for k in ['ATSEQ_P4F1_BROWSER_CAPTURE_PATH','ATSEQ_P4F1_OWNED_BROWSER_CAPTURE_PATH','ATSEQ_P4F1_CAPTURE_PATH','ATSEQ_P4F1_OWNED_CAPTURE_PATH']:env.pop(k,None)
  command=[NODES[major],'scripts/source-run.mjs','--test','--test-concurrency=4',*tests]
  start=time.perf_counter();at=datetime.now(timezone.utc).isoformat()
  with (PACKET/(label+'.log')).open('wb') as log:r=subprocess.run(command,env=env,stdout=log,stderr=subprocess.STDOUT)
  record={'label':label,'startedUTC':at,'seconds':time.perf_counter()-start,'command':command,'exit':r.returncode,'executionCommit':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'nodeVersion':subprocess.check_output([NODES[major],'--version'],text=True).strip(),'nodeSha256':sha(Path(NODES[major]).read_bytes()),'captureEnvironmentAbsent':True,'bothDefaultDirectoriesInitiallyAbsent':True}
  runs.append(record);write('runs.json',runs);assert r.returncode==0,label
  if mode=='producer-alone':assert not (ROOT/'.atseq-local'/directories[1]).exists()
  if mode=='owned-alone':assert not (ROOT/'.atseq-local'/directories[0]).exists()
  count=0
  destination=ROOT/'.atseq-local/native-checkpoint-browser-directory/retained'/label;destination.mkdir(parents=True,exist_ok=True)
  for n in directories:
   path=ROOT/'.atseq-local'/n
   if not path.exists():continue
   for p in sorted(path.iterdir()):
    if p.is_file():(PACKET/(label+'-'+n+'-'+p.name)).write_bytes(p.read_bytes())
   capture=json.loads((path/'browser.json').read_text());assert capture['exactSharedCasesAgree'] and capture['noAdmission'];count+=1
   path.rename(destination/n)
  print(json.dumps({'label':label,'exit':r.returncode,'actualBrowsers':count,'seconds':round(record['seconds'],2)}),flush=True)
if __name__=='__main__':main()
