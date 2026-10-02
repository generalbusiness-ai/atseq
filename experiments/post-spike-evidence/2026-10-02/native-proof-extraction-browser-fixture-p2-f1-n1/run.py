#!/usr/bin/env python3
"""Execute attributable actual Chromium runs in a disposable checkout, after npm ci/build."""
import gzip, hashlib, json, os, subprocess, time
from datetime import datetime, timezone
from pathlib import Path
ROOT = Path(__file__).resolve().parents[4]
PACKET = Path(__file__).resolve().parent
NODES = {
 '22': '/Users/hughpyle/.npm/_npx/992a19d7d9bf36d4/node_modules/node/bin/node',
 '24': '/Users/hughpyle/.npm/_npx/387698761821791d/node_modules/node/bin/node',
 '26': '/opt/homebrew/Cellar/node/26.10.0_1/bin/node',
}
def digest(raw): return hashlib.sha256(raw).hexdigest()
def write(name, value): (PACKET/name).write_text(json.dumps(value,indent=2)+'\n')
def physical(directory):
 return {str(p.relative_to(ROOT)):digest(p.read_bytes()) for p in sorted(directory.rglob('*')) if p.is_file()}
def main():
 os.chdir(ROOT)
 assert not Path('.atseq-local/native-proof-extraction/fixture.json').exists()
 assert not Path('.atseq-local/native-proof-extraction/workload-fixture.json').exists()
 inputs={p:digest(Path(p).read_bytes()) for p in subprocess.check_output(['git','ls-files'],text=True).splitlines() if p.startswith(('src/','tests/','scripts/','lexicons/')) or p in ('package.json','npm-shrinkwrap.json','tsconfig.json','tsconfig.build.json')}
 write('execution-inputs.json',inputs)
 write('build-outputs.json',physical(ROOT/'dist'))
 for directory,name in [(ROOT/'node_modules','tools'),(ROOT/'tests/support/pds/node_modules','pds-tools')]:
  raw=(json.dumps(physical(directory),sort_keys=True,indent=2)+'\n').encode()
  (PACKET/(name+'.json.gz')).write_bytes(gzip.compress(raw,mtime=0))
 for source,name in [('build.log','build.log'),('check.log','check.log'),('npm-ci.log','npm-ci.log'),('npm-ci-pds.log','npm-ci-pds.log')]:
  (PACKET/name).write_bytes((ROOT/'.atseq-local/native-proof-extraction-browser-fixture'/source).read_bytes())
 browser=Path('/Users/hughpyle/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing')
 records=[]
 for major,mode in [('22','standalone'),('24','standalone'),('26','standalone'),('26','concurrent')]:
  label=f'{major}-{mode}'; node=NODES[major]
  directory=ROOT/'.atseq-local/native-proof-extraction-browser-fixture'/label
  directory.mkdir(parents=True,exist_ok=True)
  env=dict(os.environ)
  for key in ['ATSEQ_NATIVE_EXTRACTION_FIXTURE_PATH','ATSEQ_NATIVE_EXTRACTION_WORKLOAD_FIXTURE_PATH']: env.pop(key,None)
  env['ATSEQ_NATIVE_EXTRACTION_BROWSER_CAPTURE_DIR']=str(directory/'browser')
  env['ATSEQ_NATIVE_EXTRACTION_CAPTURE_DIR']=str(directory/'producer')
  files=['tests/native-proof-extraction-browser.test.ts']
  if mode=='concurrent': files+=['tests/native-proof-extraction.test.ts','tests/native-proof-extraction-workload.test.ts']
  command=[node,'scripts/source-run.mjs','--test','--test-concurrency=3',*files]
  start=time.perf_counter(); at=datetime.now(timezone.utc).isoformat()
  with (PACKET/(label+'.log')).open('wb') as out:
   result=subprocess.run(command,env=env,stdout=out,stderr=subprocess.STDOUT)
  record={'label':label,'startedUTC':at,'seconds':time.perf_counter()-start,'command':command,'exit':result.returncode,'executionCommit':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'nodeVersion':subprocess.check_output([node,'--version'],text=True).strip(),'nodeSha256':digest(Path(node).read_bytes()),'chromiumPath':str(browser),'chromiumSha256':digest(browser.read_bytes()),'fixtureEnvironmentAbsent':True,'defaultFixtureFilesAbsent':not Path('.atseq-local/native-proof-extraction/fixture.json').exists() and not Path('.atseq-local/native-proof-extraction/workload-fixture.json').exists()}
  records.append(record);write('runs.json',records)
  assert result.returncode==0,(label,result.returncode)
  for p in sorted(directory.rglob('*')):
   if not p.is_file(): continue
   target=PACKET/(label+'-'+str(p.relative_to(directory)).replace('/','-'))
   if p.name in ['fixture.json','workload-fixture.json']: target.with_suffix(target.suffix+'.gz').write_bytes(gzip.compress(p.read_bytes(),mtime=0))
   else: target.write_bytes(p.read_bytes())
  capture=json.loads((directory/'browser/chromium.json').read_text())
  assert capture['fixturePreparation']['fixture']=='own genuine factory'
  assert capture['fixturePreparation']['workloads']=='own genuine factory'
  assert record['defaultFixtureFilesAbsent']
  print(json.dumps({'label':label,'exit':result.returncode,'seconds':round(record['seconds'],2),'browser':capture['version'],'extraction':len(capture['extraction']['cases']),'workloads':len(capture['workloads']['measurements']),'originalP1':len(capture['originalP1Cases'])}),flush=True)
if __name__=='__main__': main()
