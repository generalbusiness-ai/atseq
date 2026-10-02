#!/usr/bin/env python3
"""Reproduce actual source/dist/Chromium conformance with execution-time byte attribution."""
import datetime, gzip, hashlib, json, os, pathlib, subprocess, time
packet=pathlib.Path(__file__).resolve().parent
root=packet.parents[3]
local=root/'.atseq-local/native-checkpoint-producer-owned-input'
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def save(name,value):
    (packet/name).write_text(json.dumps(value,indent=2)+'\n')
def command(args,env,log):
    before=datetime.datetime.now(datetime.timezone.utc).isoformat();start=time.monotonic()
    with (packet/log).open('w') as output:
        result=subprocess.run(args,cwd=root,env=env,stdout=output,stderr=subprocess.STDOUT)
    return dict(command=args,started=before,seconds=time.monotonic()-start,exit=result.returncode,log=log)
build=json.loads((root/'dist/build-provenance.json').read_text())
for name,digest in build['sourceHashes'].items():assert sha(root/name)==digest,name
for name,digest in build['outputHashes'].items():assert sha(root/name)==digest,name
# Pin every tracked source/test/compiler input plus the task-owned oracle input.
paths=subprocess.check_output(['git','ls-files','src','lexicons','scripts','tests','package.json','npm-shrinkwrap.json','tsconfig.json','tsconfig.build.json'],cwd=root,text=True).splitlines()
paths += ['.atseq-local/native-checkpoint-producer/independent-input.json','dist/build-provenance.json',str(pathlib.Path(__file__).relative_to(root))]
source={name:sha(root/name) for name in sorted(set(paths))}
save('execution-inputs.json',source)
(packet/'build-provenance.json').write_bytes((root/'dist/build-provenance.json').read_bytes())
(packet/'installed-runtime.json.gz').write_bytes(gzip.compress((local/'installed-runtime.json').read_bytes(),mtime=0))
compiler={}
for package in ['typescript','ts-morph','tsx','vite','prettier','@playwright/test','playwright-core','@ipld/dag-cbor','multiformats']:
    directory=root/'node_modules'/package
    compiler[package]={str(file.relative_to(root)):sha(file) for file in sorted(directory.rglob('*')) if file.is_file() and 'node_modules' not in file.relative_to(directory).parts}
save('compiler-tool-files.json',compiler)
physicalTools={str(file.relative_to(root)):sha(file) for file in sorted((root/'node_modules').rglob('*')) if file.is_file()}
(packet/'physical-tool-files.json.gz').write_bytes(gzip.compress((json.dumps(physicalTools,indent=2)+'\n').encode(),mtime=0))
nodes={22:'/Users/hughpyle/.npm/_npx/992a19d7d9bf36d4/node_modules/node/bin/node',24:'/Users/hughpyle/.npm/_npx/387698761821791d/node_modules/node/bin/node',26:'/opt/homebrew/Cellar/node/26.10.0_1/bin/node'}
base_env=os.environ.copy();base_env.pop('NODE_OPTIONS',None)
runs=[]
for major,binary in nodes.items():
    env=base_env.copy();env.update(ATSEQ_P4F1_CAPTURE_PATH=str(packet/f'node{major}-legacy-producer.json'),ATSEQ_P4F1_OWNED_CAPTURE_PATH=str(packet/f'node{major}-source.json'),ATSEQ_P4_CAPTURE_PATH=str(packet/f'node{major}-original-data.json'),ATSEQ_OUTCOME_CAPTURE_PATH=str(packet/f'node{major}-original-outcome.json'),ATSEQ_P4F1_OWNED_EMITTED_CAPTURE_PATH=str(packet/f'node{major}-emitted.json'))
    runtime=dict(binary=binary,sha256=sha(pathlib.Path(binary)),version=subprocess.check_output([binary,'--version'],text=True).strip())
    for mode,args in [('source',[binary,'scripts/source-run.mjs','--test','--test-concurrency=1','tests/native-checkpoint-producer-owned-input.test.ts','tests/native-checkpoint-producer.test.ts','tests/checkpoint-data.test.ts','tests/native-outcome.test.ts']),('emitted',[binary,'tests/support/native-checkpoint-producer-owned-input-emitted.mjs'])]:
        result=command(args,env,f'node{major}-{mode}.log');result.update(mode=mode,runtime=runtime,inputsSha256=sha(packet/'execution-inputs.json'),buildSha256=sha(packet/'build-provenance.json'),compilerInventorySha256=sha(packet/'compiler-tool-files.json'),physicalToolsSha256=sha(packet/'physical-tool-files.json.gz'));runs.append(result);save('runs.json',runs)
        assert result['exit']==0,result
    for name,digest in source.items():assert sha(root/name)==digest,('changed execution input',name)
env=base_env.copy();env['ATSEQ_P4F1_OWNED_BROWSER_CAPTURE_PATH']=str(packet/'chromium.json');env['ATSEQ_P4F1_BROWSER_CAPTURE_PATH']=str(packet/'legacy-producer-chromium.json')
result=command([nodes[26],'scripts/source-run.mjs','--test','--test-concurrency=1','tests/native-checkpoint-producer-owned-input-browser.test.ts','tests/native-checkpoint-producer-browser.test.ts','tests/checkpoint-data-browser.test.ts','tests/native-outcome-browser.test.ts'],env,'chromium.log');result.update(mode='actual-chromium',runtime=dict(binary=nodes[26],sha256=sha(pathlib.Path(nodes[26]))),inputsSha256=sha(packet/'execution-inputs.json'));runs.append(result);save('runs.json',runs);assert result['exit']==0,result
(packet/'chromium-bundle.js.gz').write_bytes(gzip.compress((local/'browser-bundle.js').read_bytes(),mtime=0))
for old in ['p4-data-browser.json','native-outcome-browser.json']:
    file=root/'.atseq-local'/old
    if file.exists():(packet/('original-'+old)).write_bytes(file.read_bytes())
for name,digest in source.items():assert sha(root/name)==digest,('changed execution input',name)
print(json.dumps(dict(runs=len(runs),passAll=True,sourceInputs=len(source),buildSources=len(build['sourceHashes']),buildOutputs=len(build['outputHashes']))))
