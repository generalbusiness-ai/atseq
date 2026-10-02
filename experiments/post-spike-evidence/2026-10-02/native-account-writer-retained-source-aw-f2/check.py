#!/usr/bin/env python3
"""Read-only clean-checkout verification; no installs or original ignored tree needed."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4];PACKET=Path(__file__).resolve().parent
sha=lambda raw:hashlib.sha256(raw).hexdigest()
def load(name):return json.loads((PACKET/name).read_text())
def gitbytes(ref,path):return subprocess.check_output(['git','show',ref+':'+path],cwd=ROOT)
def main():
 inventory=load('delivery-inventory.json');base=inventory['originalHead'];programme=inventory['programmeBase'];rows=inventory['files']
 assert len({x['path'] for x in rows})==len(rows)
 changed=set(subprocess.check_output(['git','diff','--name-only',programme,'HEAD'],cwd=ROOT,text=True).splitlines())
 assert changed=={x['path'] for x in rows},'delivery inventory must cover entire candidate diff'
 for x in rows:
  raw=(ROOT/x['path']).read_bytes()
  assert raw==gitbytes('HEAD',x['path']),x['path']
  if x.get('sha256') is not None:assert len(raw)==x['bytes'] and sha(raw)==x['sha256'],x['path']
  else:assert x['path'] in inventory['gitClosedSelfReferences'] and x['integrity']=='frozen Git tree and external ready inventory'
 original=load('original-git-pins.json');assert len(original)==394
 for p,blob in original.items():
  assert subprocess.check_output(['git','hash-object',p],cwd=ROOT,text=True).strip()==blob,p
  assert (ROOT/p).read_bytes()==gitbytes(base,p),p
 old=ROOT/'experiments/post-spike-evidence/2026-10-02/native-account-writer-aw-f2'
 manifest=json.loads((old/'manifest.json').read_text());assert len(manifest['files'])==392
 assert manifest['sourceProducer']=='16f36988179a0ccacf1189eeb7b2b0e3453d6836'
 for x in manifest['files']:
  raw=(ROOT/x['path']).read_bytes();assert len(raw)==x['bytes'] and sha(raw)==x['sha256'],x['path']
 physical=json.loads((old/'final/physical-runtime-pins.json').read_text());proof=load('retained-source-provenance.json');gap=load('root-gap.json')
 assert len(proof)==len(gap['missingGitRetainedInputs'])==17
 assert {x['path'] for x in proof}=={x['path'] for x in gap['missingGitRetainedInputs']}
 for x in proof:
  p=next(p for p in physical['pins'] if p.get('retained')==x['path'])
  assert x['recordedPhysicalPath']==p['path'] and x['bytes']==p['bytes'] and x['sha256']==p['sha256']
  assert x['physicalEqualsRetained']
  raw=gitbytes('HEAD',x['path']);assert sha(raw)==x['sha256'] and len(raw)==x['bytes']
  assert subprocess.check_output(['git','rev-parse','HEAD:'+x['path']],cwd=ROOT,text=True).strip()==x['gitBlob']
  assert subprocess.run(['git','cat-file','-e',base+':'+x['path']],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode!=0
 initial=load('initial-clean-checkout.json');assert initial['exit']==1 and initial['initialClean'] and initial['ignoredRetainedFilesPresent']==0 and not initial['installedDependenciesPresent']
 assert 'FileNotFoundError' in (PACKET/'initial-clean-checkout.log').read_text()
 assert len(set(original)&{x['path'] for x in manifest['files']})==375
 assert len(set(original)-{x['path'] for x in manifest['files']})==19
 added=set(subprocess.check_output(['git','diff','--name-only',base,'HEAD'],cwd=ROOT,text=True).splitlines())
 assert added=={x['path'] for x in rows if x['classification']!='original changed Git path'}
 assert not any(x.startswith(('src/','tests/','scripts/','lexicons/')) or x in ['package.json','npm-shrinkwrap.json'] for x in added)
 print(json.dumps({'status':'PASS','originalChangedGitPaths':394,'originalManifestPins':392,'formerlyIgnoredRetainedFiles':17,'completeDeliveryPaths':len(rows),'manifestOriginalOverlap':375,'originalChangedOutsideManifest':19,'sourceProducer':manifest['sourceProducer'],'retainedPhysicalProvenanceVerified':True,'physicalInstallationRequired':False,'productionChanged':False,'newProductionRuntimeExecutionClaim':False,'fullAWA1A2P3F3Closed':False},sort_keys=True))
if __name__=='__main__':main()
