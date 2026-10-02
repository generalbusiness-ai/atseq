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
for copy in read('source-copies.json'):
    raw=(root/copy['path']).read_bytes();need(sha(raw)==copy['sha256'],'source copy changed')
    if 'commit' in copy:
        pinned=subprocess.check_output(['git','show',copy['commit']+':'+copy['sourcePath']],cwd=root)
        need(raw==pinned,'copied accepted source differs from Git blob')
retained=read('inputs/handoff-vectors.json')['vectors'];need(len(retained)==106,'all106 retained vectors')
need(len({r['key'] for r in retained})==106,'duplicate original vector')
need(all(row['original'].get('status',row['original'].get('execution'))=='UNEXECUTED' for row in retained),'original source vector status changed')
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
runs=read('runs.json');need(len(runs)==7 and all(row['exit']==0 for row in runs),'actual runtime matrix incomplete')
first=read('node22-source.json')
for major in [22,24,26]:
    source=read(f'node{major}-source.json');emitted=read(f'node{major}-emitted.json')
    need(source['cases']==first['cases'] and source['metrics']==first['metrics'],'source runtime disagreement')
    need(emitted['producer']['cases']==first['cases'] and emitted['producer']['metrics']==first['metrics'],'actual emitted runtime disagreement')
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
chrome=read('chromium.json');need(chrome['cases']['cases']==first['cases'] and chrome['cases']['metrics']==first['metrics'],'actual Chromium disagreement')
bundle=gzip.decompress((packet/'chromium-bundle.js.gz').read_bytes());need(len(bundle)==chrome['bundleBytes'] and sha(bundle)==chrome['bundleSha256'],'actual bundle hash')
binary=pathlib.Path(chrome['chromiumBinary'])
if binary.exists():need(sha(binary.read_bytes())==chrome['chromiumBinarySha256'],'actual Chromium binary hash')
literal=json.loads((root/'tests/vectors/native-checkpoint-producer.json').read_text())
need(first['metrics'][0]['recordBytes']==literal['counters']['recordBytes'],'literal byte counters')
need(len(first['cases'])==27 and first['noAdmission'],'new corpus case inventory')
# Meaningful integrity negative controls use altered claims, not filesystem mutation.
negative=0
for path in ['src/protocol/native-checkpoint-producer.ts','src/protocol/checkpoint-data.ts','tests/vectors/native-checkpoint-producer.json']:
    altered={**manifest,'files':{**manifest['files'],path:'0'*64}}
    try:check_manifest(altered)
    except AssertionError:negative+=1
    else:raise AssertionError('corrupt byte claim accepted')
report=(root/manifest['report']).read_text();links=re.findall(r'\]\(([^)]+)\)',report)
for link in links:
    if not link.startswith(('https:','http:','#')):need(((root/manifest['report']).parent/link.split('#')[0]).exists(),('report local link',link))
result=dict(result='PASS',newCases=27,originalDataCases=91,originalOutcomeCases=103,runs=7,retainedSourceVectors=106,buildSources=len(build['sourceHashes']),buildOutputs=len(build['outputHashes']),physicalRuntimePackages=len(packages),physicalRuntimeFiles=physical,negativeControls=negative,sourceCopies=len(read('source-copies.json')),reportLinks=len(links),limitations='Byte/data/provenance verification only; no runtime rerun, publication, trust installation or full P3/P4 completion')
(packet/'verification.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
