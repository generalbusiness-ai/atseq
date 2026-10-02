import json,pathlib,hashlib,gzip,subprocess,shutil
root=pathlib.Path.cwd(); local=root/'.atseq-local/e1-h4-integration'; old=root/'experiments/post-spike-evidence/2026-10-02/e1-fixture-preparation'; out=root/'experiments/post-spike-evidence/2026-10-02/e1-fixture-preparation-h4-integration'
sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
previous=json.load(open(old/'manifest.json')); assert sha(old/'manifest.json')=='b1d63ba01fe69f662cbfca8262e8c33c5d6e3dca725db5898765d820ff11647e'
for p,h in previous['files'].items():assert sha(old/p)==h,p
assert sha(root/previous['report']['path'])==previous['report']['sha256']
sourceInputs={p:sha(root/p) for p in previous['sourceInputs']}
sourceChanged=[p for p,h in sourceInputs.items() if h!=previous['sourceInputs'][p]];assert sourceChanged==['tsconfig.json']
main='51079ecf9bb9b1f024589c341ce5cd473dd064e1'
assert (root/'tsconfig.json').read_bytes()==subprocess.check_output(['git','show',main+':tsconfig.json'])
physical=json.loads(gzip.decompress((old/'physical-runtime.json.gz').read_bytes()))
assert not (root/'node_modules').is_symlink()
for package in physical['packages']:
 p=root/package['path'];assert not p.is_symlink();assert sha(p/'package.json')==package['packageJsonSha256']
for p,h in physical['fileHashes'].items():assert sha(root/p)==h,p
before=json.load(open(old/'build-provenance.json'));after=json.load(open(root/'dist/build-provenance.json'))
sourceDelta=[p for p,h in after['sourceHashes'].items() if h!=before['sourceHashes'].get(p)]
assert sourceDelta==['tsconfig.json'];assert before['outputHashes']==after['outputHashes']
for p,h in after['sourceHashes'].items():assert sha(root/p)==h,p
for p,h in after['outputHashes'].items():assert sha(root/p)==h,p
checks=[];lists=[]
for n,version in [(22,'v22.19.0'),(24,'v24.21.0'),(26,'v26.10.0')]:
 runtime=json.load(open(local/f'runtime-node{n}.json'));assert runtime['node']==version
 log=(local/f'check-node{n}.log').read_text();assert 'All matched files use Prettier code style!'in log and 'Every source layer, portable import and wire identity checked.'in log and 'Installed runtime closure, dependency edges and integrity pins match reviewed provenance.'in log
 listing=(local/f'compiler-node{n}-list.log').read_text().splitlines(); assert all(pathlib.Path(p).is_file() for p in listing)
 normalized=[p.removeprefix(str(root)+'/') for p in listing];lists.append(normalized)
 live=[p for p in normalized if p.split('/')[0] in ['src','scripts','tests','experiments'] and not p.startswith('tests/support/pds/node_modules/')]
 assert len(live)==276
 e1=[p for p in sourceInputs if p.startswith('experiments/e1-native/') or p.startswith('tests/e1-fixture')]
 assert len(e1)==7 and all(p in live for p in e1)
 checks.append({'runtime':runtime,'normalNpmCheckExit':0,'normalCompilerListExit':0,'compilerInputs':len(listing),'liveInputs':len(live),'allSevenExperimentInputsIncluded':True})
assert lists[0]==lists[1]==lists[2]
oldprefix='/private/tmp/atseq-e1-fixture-preparation-20261002/'
oldlist=[p.removeprefix(oldprefix) for p in (old/'typecheck-node26-list.log').read_text().splitlines()]
# Only dependency paths outside the repository could differ; actual lists have no such differences here.
assert oldlist==lists[2]
for p in local.glob('*.log'):shutil.copyfile(p,out/p.name)
for p in local.glob('runtime-*.json'):shutil.copyfile(p,out/p.name)
shutil.copyfile(root/'dist/build-provenance.json',out/'build-provenance.json')
comparison={'originalCapturedFilesVerifiedUnchanged':len(previous['files']),'originalManifestSha256':sha(old/'manifest.json'),'originalReportSha256':previous['report']['sha256'],'originalSourcePins':len(sourceInputs),'sourcePinChanges':sourceChanged,'experimentSourceAndTestsChanged':[],'runtimeDependencyGraphAnd14234FileBytesChanged':False,'physicalRuntimePackages':physical['count'],'physicalRuntimeFilesVerified':len(physical['fileHashes']),'buildSourceChanges':sourceDelta,'buildOutputChanges':[],'actualBuildSourcePins':len(after['sourceHashes']),'actualBuildOutputPins':len(after['outputHashes']),'normalCompilerListsEqualEachOtherAndOldProposedH4ListAfterPathNormalization':True,'checks':checks,'runtimeFixtureTestsRepeated':False,'fixtureGenerationRepeated':False,'reasonNoRuntimeRepeat':'All seven experiment source/test files, all runtime dependency bytes and all 464 emitted build outputs match the original successful immutable conformance producer; only reviewed H4 compiler exclusion changed.'}
(out/'comparison.json').write_text(json.dumps(comparison,indent=2)+'\n')
report='notes/2026-10-02-atseq-e1-fixture-h4-integration-results.md'
producer=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip();assert producer=='d32dabe0aadd34a01f7e34a546b5cf38f368690a'
paths=set(subprocess.check_output(['git','diff','--name-only',main,producer],text=True).splitlines());paths.add(report);paths.update(str(p.relative_to(root)) for p in out.rglob('*') if p.is_file());paths.update([str((out/'manifest.json').relative_to(root)),str((out/'delivery-list.json').relative_to(root))])
(out/'delivery-list.json').write_text(json.dumps({'basis':main,'checkedSource':producer,'paths':sorted(paths)},indent=2)+'\n')
manifest={'schema':'atseq-e1-fixture-preparation-h4-integration-v1','date':'2026-10-02','request':previous['request'],'promise':previous['promise'],'reviewedBasis':main,'h4ReviewedCandidate':'9f5544dfa82a32bb1ed741235e1193fdf3b2e282','h4Review':'5ddc66e63982a7b91501daa5b05e68923cebba1f','h4Ratification':'283bb746836ceeeea968128fc72df737b9fce109','originalDelivery':'2395c470283111e4817dde1342e973edd5e4e419','originalFixtureProducer':previous['producerSource'],'successorCheckedSource':producer,'successorSourceCherryPick':'9f093dce4fdce7667f1ee8e3b429ca850d8bad27','originalPacket':str((old/'manifest.json').relative_to(root)),'originalPacketSha256':sha(old/'manifest.json'),'normalChecks':checks,'sourceInputs':sourceInputs,'report':{'path':report,'sha256':sha(root/report)},'scope':'E1-F1 local reviewed-H4 integration only; full E1 joined runtime/host/provider/persistence/checkpoint/offline measurements remain open','fixtureGenerationAndSuccessfulRuntimeTestsRepeated':False,'pushedMainLinuxCi':'Root-owned; no success claim for run37006369336','files':{str(p.relative_to(out)):sha(p) for p in sorted(out.rglob('*')) if p.is_file() and p.name!='manifest.json'}}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'producer':producer,'ownedPacketFiles':len(manifest['files']),'deliveryPaths':len(paths),'manifestSha256':sha(out/'manifest.json')}))
