#!/usr/bin/env python3
"""Check byte attribution and actual DATA conformance captures; no provider/test rerun."""
import gzip,hashlib,json,pathlib,re,subprocess
packet=pathlib.Path(__file__).resolve().parent;root=packet.parents[3]
def sha(raw):return hashlib.sha256(raw).hexdigest()
def read(name):return json.loads((packet/name).read_text())
def need(value,message):
    if not value:raise AssertionError(message)
def check_manifest(manifest):
    for path,digest in manifest['files'].items():need(sha((root/path).read_bytes())==digest,('changed packet',path))
manifest=read('manifest.json');check_manifest(manifest)
listed=set(manifest['files'])|{str((packet/'manifest.json').relative_to(root)),str((packet/'verification.json').relative_to(root))}
actual={str(p.relative_to(root)) for p in packet.rglob('*') if p.is_file()}
need(actual<=listed,'unlisted evidence files')

predecessor=read('predecessor-files.json');need(len(predecessor['files'])==143,'complete predecessor143')
for item in predecessor['files']:
    original=subprocess.check_output(['git','show',predecessor['head']+':'+item['path']],cwd=root)
    need(sha(original)==item['sha256'],'predecessor Git blob changed')
    if item['unchangedInSuccessor']:need((root/item['path']).read_bytes()==original,('predecessor bytes changed',item['path']))
    else:need((packet/predecessor['sourceCopy']).read_bytes()==original,'original corrected source not preserved')
retained=json.loads((root/'experiments/post-spike-evidence/2026-10-02/native-checkpoint-producer-p4-f1/inputs/handoff-vectors.json').read_text())['vectors'];need(len(retained)==106,'all106 retained source vectors')
execution=read('execution-inputs.json')
for path,digest in execution.items():
    # Exact saved original oracle input is retained under packet; task-owned local copy may be absent elsewhere.
    file=root/path
    if path.startswith('.atseq-local/'):
        need(sha(gzip.decompress((packet/'independent-input.json.gz').read_bytes()))==digest,'retained original oracle input')
    else:
        need(file.exists() and sha(file.read_bytes())==digest,('execution input changed',path))
build=read('build-provenance.json')
for path,digest in build['sourceHashes'].items():need(sha((root/path).read_bytes())==digest,('compiled source changed',path))
if (root/'dist/build-provenance.json').exists():
    need(sha((root/'dist/build-provenance.json').read_bytes())==sha((packet/'build-provenance.json').read_bytes()),'actual build metadata differs')
    for path,digest in build['outputHashes'].items():need(sha((root/path).read_bytes())==digest,('actual emitted output changed',path))
installed=json.loads(gzip.decompress((packet/'installed-runtime.json.gz').read_bytes()));need(installed['verified'],'actual installed self-check missing')
packages=installed['trees'];need(len(packages)==194,'reviewed runtime package count')
physical=sum(len(tree) for tree in packages.values());need(physical==14234,'physical runtime file count')
for directory,tree in packages.items():
    for path,digest in tree.items():
        file=root/directory/path
        if file.exists():need(sha(file.read_bytes())==digest,('installed physical byte changed',directory,path))
for package,tree in read('compiler-tool-files.json').items():
    for path,digest in tree.items():
        file=root/path
        if file.exists():need(sha(file.read_bytes())==digest,('compiler/runtime wrapper byte changed',path))
physicalTools=json.loads(gzip.decompress((packet/'physical-tool-files.json.gz').read_bytes()))
for path,digest in physicalTools.items():
    file=root/path
    if (root/'node_modules').exists():need(file.exists() and sha(file.read_bytes())==digest,('physical private tool graph changed',path))
runs=read('runs.json');need(len(runs)==7 and all(row['exit']==0 for row in runs),'actual runtime matrix incomplete')
first=read('node22-source.json')
for major in [22,24,26]:
    source=read(f'node{major}-source.json');emitted=read(f'node{major}-emitted.json')
    need({key:value for key,value in source.items() if key!='node'}=={key:value for key,value in first.items() if key!='node'},'source runtime disagreement')
    need(emitted['ownedInput']=={key:value for key,value in source.items() if key!='node'},'actual emitted runtime disagreement')
    legacy=read(f'node{major}-legacy-producer.json')
    need(emitted['producer']=={key:value for key,value in legacy.items() if key!='node'},'old30producer source/emitted disagreement')
    original30=json.loads((root/'experiments/post-spike-evidence/2026-10-02/native-checkpoint-producer-p4-f1/node22-source.json').read_text())
    need(legacy['cases']==original30['cases'] and legacy['metrics']==original30['metrics'],'old30producer changed')
    need(emitted['originalData']==read(f'node{major}-original-data.json')['cases'],'original91DATA disagreement')
    need(emitted['originalOutcome']==read(f'node{major}-original-outcome.json')['cases'],'original103outcome disagreement')
    need(len(emitted['originalData'])==91 and len(emitted['originalOutcome'])==103,'original oracle case inventory changed')
    need(any(row['path']=='dist/src/protocol/native-checkpoint-producer.js' for row in emitted['actualProductionModules']),'producer actual emitted import absent')
    for module in emitted['actualProductionModules']:need(module['sha256']==build['outputHashes'][module['path']],'actual direct compiled module hash')
    for module in emitted['testModules']:need(module['sourceSha256']==execution[module['path']],'emitted wrapper source hash')
    for run in [r for r in runs if r.get('runtime',{}).get('version','').startswith('v'+str(major)+'.')]:
        file=pathlib.Path(run['runtime']['binary'])
        if file.exists():need(sha(file.read_bytes())==run['runtime']['sha256'],'runtime binary changed')
need(read('original-p4-data-browser.json')['cases']==read('node22-original-data.json')['cases'],'actual original Chromium DATA disagreement')
need(read('original-native-outcome-browser.json')['cases']==read('node22-original-outcome.json')['cases'],'actual original Chromium outcome disagreement')
chrome=read('chromium.json');need(chrome['cases']=={key:value for key,value in first.items() if key!='node'},'actual Chromium disagreement')
bundle=gzip.decompress((packet/'chromium-bundle.js.gz').read_bytes());need(len(bundle)==chrome['bundleBytes'] and sha(bundle)==chrome['bundleSha256'],'actual bundle hash')
binary=pathlib.Path(chrome['chromiumBinary'])
if binary.exists():need(sha(binary.read_bytes())==chrome['chromiumBinarySha256'],'actual Chromium binary hash')
literal=json.loads((root/'tests/vectors/native-checkpoint-producer.json').read_text())
legacy=read('node22-legacy-producer.json');need(legacy['metrics'][0]['recordBytes']==literal['counters']['recordBytes'],'literal byte counters')
need(read('legacy-producer-chromium.json')['cases']=={key:value for key,value in legacy.items() if key!='node'},'original30actualChrome disagreement')
need(len(first['cases'])==21 and first['noAdmission'],'new corpus case inventory')
# Meaningful integrity negative controls use altered claims, not filesystem mutation.
negative=0
for path in ['src/protocol/native-checkpoint-producer.ts','tests/support/native-checkpoint-producer-owned-input-corpus.ts','tests/vectors/native-checkpoint-producer.json']:
    altered={**manifest,'files':{**manifest['files'],path:'0'*64}}
    try:check_manifest(altered)
    except AssertionError:negative+=1
    else:raise AssertionError('corrupt byte claim accepted')
before=json.loads((packet/'inputs/root-probe-before.log').read_text());after=json.loads((packet/'inputs/root-probe-after.log').read_text());need(before['capturedOriginal'] is False and before['usedLaterMutation'] is True,'original root bug not reproduced');need(after['capturedOriginal'] is True and after['usedLaterMutation'] is False,'root repair probe failed');need(before['original']==after['original'] and before['mutated']==after['mutated'],'root probe input CID changed')
report=(root/manifest['report']).read_text();links=re.findall(r'\]\(([^)]+)\)',report)
for link in links:
    if not link.startswith(('https:','http:','#')):need(((root/manifest['report']).parent/link.split('#')[0]).exists(),('report local link',link))
result=dict(result='PASS',newCases=21,originalDataCases=91,originalOutcomeCases=103,runs=7,retainedSourceVectors=106,buildSources=len(build['sourceHashes']),buildOutputs=len(build['outputHashes']),physicalRuntimePackages=len(packages),physicalRuntimeFiles=physical,physicalToolFiles=len(physicalTools),legacyProducerCases=30,negativeControls=negative,unchangedPredecessorFiles=142,preservedPredecessorFiles=143,reportLinks=len(links),limitations='Byte/data/provenance verification only; no runtime rerun, publication, trust installation or full P3/P4 completion')
(packet/'verification.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
