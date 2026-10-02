#!/usr/bin/env python3
"""Verify successor evidence and preserve the immutable original execution layer."""
import gzip,hashlib,json,re,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4];PACKET=Path(__file__).resolve().parent
sha=lambda raw:hashlib.sha256(raw).hexdigest()
def load(n):return json.loads((PACKET/n).read_text())
def verify(entries):
 for p,h in entries.items():assert sha((ROOT/p).read_bytes())==h,p
 return len(entries)
def main():
 manifest=load('manifest.json');files=verify(manifest['files'])
 source='tests/native-checkpoint-producer-browser.test.ts';before=load('before-run.json')
 original=subprocess.check_output(['git','show',manifest['base']+':'+source],cwd=ROOT)
 assert original==(PACKET/'predecessor-browser.ts').read_bytes()
 assert before['testedSourceSha256']==sha(original) and before['exit']==1
 assert before['defaultDirectoryInitiallyAbsent'] and before['buildPrerequisitePresent']
 assert "ENOENT" in (PACKET/'standalone-before.log').read_text()
 assert "native-checkpoint-producer/browser-bundle.js" in (PACKET/'standalone-before.log').read_text()
 assert load('initial-before-build.json')['exit']==1
 assert 'failed to resolve import' in (PACKET/'initial-before-build.log').read_text()
 pins=load('predecessor.json');assert len(pins)==205
 for p,blob in pins.items():
  if p==source:assert subprocess.check_output(['git','hash-object','--stdin'],input=original,cwd=ROOT,text=False).decode().strip()==blob
  else:assert subprocess.check_output(['git','hash-object',p],cwd=ROOT,text=True).strip()==blob,p
 old=ROOT/'experiments/post-spike-evidence/2026-10-02/native-checkpoint-producer-owned-input-p4-f1'
 oldmanifest=json.loads((old/'manifest.json').read_text())
 assert oldmanifest['executableHead'].startswith('13e777b0')
 assert oldmanifest['executableHead']!=manifest['executableCommit']
 assert subprocess.check_output(['git','show',oldmanifest['executableHead']+':'+source],cwd=ROOT)==original
 vectors=json.loads((ROOT/'experiments/post-spike-evidence/2026-10-02/native-checkpoint-producer-p4-f1/inputs/handoff-vectors.json').read_text())
 assert len(vectors['vectors'])==106
 inputs=verify(load('execution-inputs.json'));outputs=verify(load('build-outputs.json'));physical={}
 for name in ['tools','pds-tools']:physical[name]=verify(json.loads(gzip.decompress((PACKET/(name+'.json.gz')).read_bytes())))
 expected=[(n,m) for n in ['22','24','26'] for m in ['producer-alone','owned-alone']]+[('26','concurrent')]
 runs=load('runs.json');assert [(r['label'],r['exit']) for r in runs]==[(n+'-'+m,0) for n,m in expected]
 browserCount=0
 fixture=gzip.decompress((ROOT/'tests/vectors/checkpoint-data.json.gz').read_bytes())
 for r in runs:
  assert r['executionCommit']==manifest['executableCommit']
  assert r['bothDefaultDirectoriesInitiallyAbsent'] and r['captureEnvironmentAbsent']
  assert sha(Path(r['command'][0]).read_bytes())==r['nodeSha256']
  kinds=['native-checkpoint-producer'] if r['label'].endswith('producer-alone') else ['native-checkpoint-producer-owned-input']
  if r['label'].endswith('concurrent'):kinds=['native-checkpoint-producer','native-checkpoint-producer-owned-input']
  for kind in kinds:
   prefix=r['label']+'-'+kind+'-';v=load(prefix+'browser.json');browserCount+=1
   assert v['exactSharedCasesAgree'] and v['noAdmission']
   assert v['fixtureSha256']==sha(fixture) and v['fixtureBytes']==len(fixture)
   assert sha(Path(v['chromiumBinary']).read_bytes())==v['chromiumBinarySha256']
   probe=(PACKET/(prefix+'browser-bundle.js')).read_bytes()
   assert sha(probe)==v['bundleSha256'] and len(probe)==v['bundleBytes']
   assert not re.search(rb"from\s*['\"]node:",probe)
   assert len(v['cases']['cases'])==(30 if kind=='native-checkpoint-producer' else 21)
   if r['label'].endswith('concurrent'):
    node=load(prefix+'node.json');assert {k:value for k,value in node.items() if k!='node'}==v['cases']
 assert subprocess.check_output(['git','diff','--name-only',manifest['base'],manifest['executableCommit']],cwd=ROOT,text=True).splitlines()==[source]
 result={'passed':True,'packetFiles':files,'originalGitPins':205,'originalCurrentFiles':204,'oldBrowserBytesPreserved':True,'oldExecutionHead':oldmanifest['executableHead'],'sourceInputs':inputs,'buildOutputs':outputs,'physicalFiles':physical,'actualChromiumExecutions':browserCount,'commands':len(runs),'originalVectors':106,'productionChanged':False,'emittedExecutionClaimed':False,'fullP3P4Closed':False}
 (PACKET/'verification.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
if __name__=='__main__':main()
