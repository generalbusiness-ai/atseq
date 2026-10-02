#!/usr/bin/env python3
"""Verify this closed source/build/tool/input/output packet without rerunning workloads."""
import gzip, hashlib, json, re, subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4]
PACKET=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
def load(name): return json.loads((PACKET/name).read_text())
def verify(entries):
 for name,expected in entries.items():
  assert sha((ROOT/name).read_bytes())==expected,name
 return len(entries)
def main():
 manifest=load('manifest.json')
 files=verify(manifest['files'])
 before=load('before-run.json')
 assert before['exit']==1 and not before['fixtureExists'] and not before['workloadFixtureExists']
 assert "ENOENT" in (PACKET/'standalone-before.log').read_text()
 assert (PACKET/'predecessor-browser.ts').read_bytes()==subprocess.check_output(['git','show',manifest['base']+':tests/native-proof-extraction-browser.test.ts'],cwd=ROOT)
 pins=load('predecessor.json')
 for name,blob in pins.items():
  if name=='tests/native-proof-extraction-browser.test.ts': continue
  assert subprocess.check_output(['git','hash-object',name],cwd=ROOT,text=True).strip()==blob,name
 inputs=verify(load('execution-inputs.json'))
 outputs=verify(load('build-outputs.json'))
 tools={}
 for name in ['tools','pds-tools']:
  entries=json.loads(gzip.decompress((PACKET/(name+'.json.gz')).read_bytes()))
  tools[name]=verify(entries)
 runs=load('runs.json')
 assert [(r['label'],r['exit']) for r in runs]==[(n+'-'+m,0) for n,m in [('22','standalone'),('24','standalone'),('26','standalone'),('26','concurrent')]]
 for run in runs:
  assert run['executionCommit']==manifest['executableCommit']
  assert run['fixtureEnvironmentAbsent'] and run['defaultFixtureFilesAbsent']
  assert sha(Path(run['command'][0]).read_bytes())==run['nodeSha256']
  assert sha(Path(run['chromiumPath']).read_bytes())==run['chromiumSha256']
  label=run['label'];capture=load(label+'-browser-chromium.json')
  assert capture['actualExecution'] and not capture['browserInstalledProvenanceAcceptance']
  assert len(capture['extraction']['cases'])==17
  assert len(capture['workloads']['measurements'])==13
  assert len(capture['originalP1Cases'])==51
  for name,key in [('fixture.json','fixtureSha256'),('workload-fixture.json','workloadSha256')]:
   raw=gzip.decompress((PACKET/(label+'-browser-'+name+'.gz')).read_bytes())
   assert sha(raw)==capture['fixturePreparation'][key]
   json.loads(raw)
  assert capture['fixturePreparation']['fixture']=='own genuine factory'
  assert capture['fixturePreparation']['workloads']=='own genuine factory'
  probe=(PACKET/(label+'-browser-probe.js')).read_bytes()
  assert sha(probe)==capture['bundleSha256'] and len(probe)==capture['bundleBytes']
  assert not re.search(rb"from\s*['\"]node:",probe)
 concurrent=load('26-concurrent-producer-source.json')
 assert len(concurrent['cases'])==17
 assert len(load('26-concurrent-producer-workload.json')['measurements'])==13
 changed=subprocess.check_output(['git','diff','--name-only',manifest['base'],manifest['executableCommit']],cwd=ROOT,text=True).splitlines()
 assert changed==['tests/native-proof-extraction-browser.test.ts']
 result={'passed':True,'packetFiles':files,'sourceInputs':inputs,'buildOutputs':outputs,'physicalFiles':tools,'preservedPredecessorFiles':len(pins)-1,'actualChromiumRuns':len(runs),'negativeControl':'actual predecessor standalone ENOENT exit 1','productionChanged':False,'fullP2P4Closed':False}
 (PACKET/'verification.json').write_text(json.dumps(result,indent=2)+'\n')
 print(json.dumps(result))
if __name__=='__main__':main()
