import json,pathlib,hashlib,shutil,gzip,subprocess,os
root=pathlib.Path.cwd(); local=root/'.atseq-local/e1-preparation'; out=root/'experiments/post-spike-evidence/2026-10-02/e1-fixture-preparation';out.mkdir(parents=True,exist_ok=True)
sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
for srcdir,name in [('current','final'),('trial','draft-trial')]:
 target=out/name;target.mkdir(exist_ok=True)
 for p in (local/srcdir).iterdir():
  if p.is_file():shutil.copyfile(p,target/p.name)
for directory in ['attempts','trial-source']:
 target=out/directory;target.mkdir(exist_ok=True)
 for p in (local/directory).iterdir():
  if p.is_file():shutil.copyfile(p,target/(p.name+'.txt' if p.suffix=='.ts' else p.name))
for p in local.glob('*.log'):shutil.copyfile(p,out/p.name)
for name in ['r1-final.json','r1-trial.json','check-exit-codes.txt','tsconfig.live.json']:
 shutil.copyfile(local/name,out/name)
for name in ['results.json','validation-bundle.mjs']:
 p=local/'browser'/name
 if name.endswith('.mjs'):(out/'chromium-validation-bundle.mjs.gz').write_bytes(gzip.compress(p.read_bytes(),mtime=0))
 else:shutil.copyfile(p,out/'chromium-results.json')
shutil.copyfile(root/'dist/build-provenance.json',out/'build-provenance.json')
shutil.copyfile(local/'freeze.py',out/'freeze.py')
sourcebasis=json.load(open('/private/tmp/atseq-research-evidence-typecheck-20261002/experiments/post-spike-evidence/2026-10-02/research-evidence-typecheck/manifest.json'))
sourcepaths=set(sourcebasis['sourceInputs']); sourcepaths.update(str(p.relative_to(root)) for p in (root/'experiments/e1-native').glob('*.ts'));sourcepaths.update(['tests/e1-fixture.test.ts','tests/e1-fixture-browser.test.ts'])
sourceinputs={p:sha(root/p) for p in sorted(sourcepaths)}
physical=json.load(open('/private/tmp/atseq-research-evidence-typecheck-20261002/experiments/post-spike-evidence/2026-10-02/research-evidence-typecheck/physical-runtime.json'))
filehashes={};links={}
for package in physical['packages']:
 p=root/package['path'];assert not p.is_symlink();assert sha(p/'package.json')==package['packageJsonSha256']
 for current,dirs,files in os.walk(p):
  for name in files:
   path=pathlib.Path(current)/name; rel=str(path.relative_to(root))
   if path.is_symlink():links[rel]=os.readlink(path)
   else:filehashes[rel]=sha(path)
physical['fileCount']=len(filehashes);physical['fileHashes']=dict(sorted(filehashes.items()));physical['links']=dict(sorted(links.items()));physical['rootNodeModulesSymlink']=(root/'node_modules').is_symlink();assert not physical['rootNodeModulesSymlink']
(out/'physical-runtime.json.gz').write_bytes(gzip.compress((json.dumps(physical,indent=2)+'\n').encode(),mtime=0))
results=json.load(open(out/'final/results.json'));assert results['producerHead']=='dd2f97bd710c88fa5c3f629f8efa6f00f837e5b1' and not results['workingTreeDirty'] and not results['failures'] and len(results['captures'])==6
r1=json.load(open(out/'r1-final.json'));assert len(r1['results'])==40
lists=[(local/f'typecheck-node{n}-list.log').read_text().splitlines() for n in [22,24,26]];assert lists[0]==lists[1]==lists[2]
prefix=str(root)+'/'
live=[x.removeprefix(prefix) for x in lists[0] if x.startswith(prefix) and x.endswith('.ts') and not any(x.startswith(prefix+p) for p in ['node_modules/','tests/support/pds/node_modules/','dist/'])]
assert len(live)==276
new=[p for p in sourceinputs if 'e1-native/'in p or 'tests/e1-fixture'in p];assert len(new)==7 and all(p in live for p in new)
shas=[]
for version in [22,24,26]:
 rows=[];raw=(local/f'final-node{version}.log').read_text();assert ('fail 0'in raw and 'pass 4'in raw)
 for line in raw.splitlines():
  line=line.removeprefix('# ')
  if line.startswith('{'):
   item=json.loads(line)
   if 'snapshotSha256'in item:rows.append(item['snapshotSha256'])
 shas.append(rows)
chromium=json.load(open(out/'chromium-results.json'));assert shas[0]==shas[1]==shas[2]==chromium['snapshotSha256']
assert (local/'check-exit-codes.txt').read_text().strip()=='0 0 0'
normal=(local/'normal-check.log').read_text();assert sum(': error TS'in line for line in normal.splitlines())==74
build=json.load(open(out/'build-provenance.json'))
for p,h in build['sourceHashes'].items():assert sha(root/p)==h
for p,h in build['outputHashes'].items():assert sha(root/p)==h
report='notes/2026-10-02-atseq-e1-fixture-preparation-results.md'
manifest={'schema':'atseq-e1-fixture-preparation-v1','date':'2026-10-02','request':results['request'],'promise':results['promise'],'parentRequest':results['parentRequest'],'parentPromise':results['parentPromise'],'basis':'7de9dcd447658679f3a94866c7f0eb5506c63659','producerSource':results['producerHead'],'scope':'E1-F1 preparation and correctness; full E1 joined measurements remain open','finalCapturedFixtures':6,'healthyOrderedEntriesVerified':22200,'selectedSignedAppRootsVerified':42,'r1ValidationSource':r1['r1Head'],'r1WarmCells':22,'r1HostilePublicationChecks':18,'sameSmallNativeProjectionBytesAcrossNode22_24_26AndChromium':True,'snapshotSha256':shas[0],'actualChecks':{'build':0,'node22SmallTests':4,'node24SmallTests':4,'node26SmallTests':4,'chromiumTests':1,'format':0,'layers':0,'dependencies':0,'normalCheckExit':1,'normalCheckFrozenOfficialDiagnostics':74,'proposedH4TemporaryCompilerExitEachRuntime':0,'proposedH4LiveTypeScriptInputs':len(live),'newE1InputsIncluded':new,'compilerListIdenticalAcrossThreeRuntimes':True,'ordinaryLocalFullSuiteExecuted':False,'requiredReviewedH4IntegrationNormalCheck':'open; root-owned','actualPostLandingLinuxCi':'open; root-owned'},'physicalRuntimePackages':physical['count'],'physicalRuntimeFiles':len(filehashes),'buildSourcePins':len(build['sourceHashes']),'buildOutputPins':len(build['outputHashes']),'draftSourceAttribution':'draft trial repository HEAD=7de basis; uncommitted experiment working files captured byte-exact under trial-source; not claimed to be the final source freeze','readerTimingExecuted':False,'actualNativePersistenceExecuted':False,'checkpointRestoreAuditExecuted':False,'sourceInputs':sourceinputs,'report':{'path':report,'sha256':sha(root/report)},'files':{str(p.relative_to(out)):sha(p) for p in sorted(out.rglob('*')) if p.is_file() and p.name!='manifest.json'}}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'evidenceFiles':len(manifest['files']),'sourcePins':len(sourceinputs),'physicalPackages':physical['count'],'physicalFiles':len(filehashes),'buildSource':len(build['sourceHashes']),'buildOutputs':len(build['outputHashes']),'manifestSha256':sha(out/'manifest.json')}))
