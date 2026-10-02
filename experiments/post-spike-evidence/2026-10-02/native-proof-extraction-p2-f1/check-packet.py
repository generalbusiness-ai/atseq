#!/usr/bin/env python3
"""Verify closed source/runtime evidence; do not rerun conformance or provider work."""
import copy
import gzip
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import time
p=Path(__file__).resolve().parent
root=p.parents[3]
sha=lambda raw:hashlib.sha256(raw).hexdigest()
def require(value,message):
    if not value:raise AssertionError(message)
def read(path):
    raw=path.read_bytes()
    return gzip.decompress(raw) if path.suffix=='.gz' else raw
def load(name):return json.loads(read(p/name))
def git(*args):
    for attempt in range(3):
        try:return subprocess.check_output(['git',*args],cwd=root)
        except OSError as error:
            if error.errno!=24 or attempt==2:raise
            time.sleep(0.2)
def files(m):
    names=set()
    for row in m['files']:
        require(row['path'] not in names,'Duplicate file')
        names.add(row['path']);raw=(root/row['path']).read_bytes()
        require(len(raw)==row['bytes'] and sha(raw)==row['sha256'],'Changed file '+row['path'])
    expected=set(m['executablePaths']+m['preservedAcceptedSourcePaths']+[m['report']])
    expected|={str(f.relative_to(root)) for f in p.rglob('*') if f.is_file() and f.name not in ['manifest.json','verification.json']}
    require(names==expected,'Packet inventory is not closed')
    require(not m['supportedApiChanged'] and not m['dependenciesChanged'] and not m['fullP2Closed'],'Scope overstated')
def pins(i):
    for row in i['pins']+i['preservedAcceptedSourceFiles']:
        name=row['commit']+':'+row['path'];raw=git('show',name)
        require(sha(raw)==row['sha256'] and len(raw)==row['bytes'] and git('rev-parse',name).decode().strip()==row['gitBlob'],'Wrong Git pin '+name)
        require((root/row['path']).read_bytes()==raw,'Working source/copy differs '+name)
    require(len(i['preservedAcceptedSourceFiles'])==16,'Accepted source inventory shortened')
    modified=git('diff','--name-only',i['baseline'],'--','src','package.json','npm-shrinkwrap.json','tsconfig.json','tsconfig.build.json').decode().splitlines()
    require(modified==sorted(i['productionFilesChanged'])==['src/protocol/index.ts','src/protocol/native-proof.ts'],'Production/dependency scope changed')
    proof=(root/'src/protocol/native-proof.ts').read_text();old=git('show',i['baseline']+':src/protocol/native-proof.ts').decode()
    shape=lambda code:code[code.index('export interface AuthenticatedRepo {'):code.index('export interface AuthenticateRepoOptions {')]
    require(shape(proof)==shape(old),'Supported capability shape changed')
    require(proof.count('new WeakMap<object, ExtractOperation>()')==1 and 'new WeakSet' not in proof,'Issuing registry changed')
    require('return lookupPath(path, expectedCid);' in proof,'Private collector exposed through lookup')
    runtime=['NATIVE_PROOF_LIMITS','NATIVE_CACHE_BROWSER','NATIVE_CACHE_HOST','normalizeRepoSigningKey','assertAuthenticatedRepo','VerifiedRepoBlocks','authenticateRepo']
    types=['NativeLookup','NativeTree','AuthenticatedRepo','AuthenticateRepoOptions']
    barrel=(root/'src/protocol/index.ts').read_text()
    match=re.search(r'export\s*\{([^}]+)\}\s*from\s*\x27\./native-proof\.ts\x27;',barrel,re.S)
    typematch=re.search(r'export type\s*\{([^}]+)\}\s*from\s*\x27\./native-proof\.ts\x27;',barrel,re.S)
    names=lambda match:[v.strip() for v in match.group(1).split(',') if v.strip()]
    require(match and typematch and names(match)==runtime and names(typematch)==types and 'extractNativeRepoPaths' not in barrel,'Supported export list changed')
    require(not i['originalCorporaChanged'] and not i['supportedApiShapeChanged'],'Original oracle/API claim changed')
def capture(runs,coverage):
    require(len(runs['runs'])==10 and all(row['exitCode']==0 for row in runs['runs']),'Actual matrix incomplete or failed')
    require(all(row['source']==inspection['executableHead'] for row in runs['runs']),'Mixed executable heads')
    expected=[(major,kind) for major in[22,24,26] for kind in['source','extraction-emitted','r1-emitted']]+[(26,'chromium')]
    require([(int(row['node'].split('.')[0][1:]),row['kind']) for row in runs['runs']]==expected,'Runtime invocation inventory changed')
    for row in runs['runs']:
        binary=Path(row['executable']);require(sha(binary.read_bytes())==row['executableSha256'],'Runtime binary changed')
        text=(p/row['log']).read_text();require(text.strip(),'Empty runtime log')
    require([row['id'] for row in coverage['vectors']]==[f'PX{n}' for n in range(1,19)] and len(coverage['vectors'])==18,'PX obligation dropped')
    require(coverage['all18PXAddressed'] and not coverage['broaderP2Closed'] and 'no complete receipt' in coverage['receiptScope'],'Broader claim scope upgraded')
    require('No natural retreat' in coverage['vectors'][3]['limitations'] and 'null' in coverage['vectors'][17]['limitations'],'Reachability/instrumentation limitations hidden')
    originals=None;r1=None;cases=None
    for major in[22,24,26]:
        source=load(f'node{major}/source/source.json');emitted=load(f'node{major}/emitted.json');result=load(f'node{major}/r1-source/result.json');r1emitted=load(f'node{major}/r1-emitted.json')
        wanted=[f'PX{n}' for n in range(1,19) if n!=17]
        require([row['id'] for row in source['cases']]==wanted and source['cases']==emitted['extraction']['cases'],'Source/dist extraction cases differ')
        require(not source['naturalRetreat'] and not emitted['extraction']['naturalRetreat'],'Natural retreat invented')
        if cases is None:cases=source['cases'];r1=result['cases']
        require(source['cases']==cases and result['cases']==r1==r1emitted['cases'] and len(r1)==29,'R1/source evidence changed')
        text=(p/f'node{major}/source.log').read_text();row=next(line for line in text.splitlines() if '"nativeProofCases":' in line)
        current=json.loads(row[row.index('{'):])['nativeProofCases']
        if originals is None:originals=current
        require(current==originals==emitted['originalP1Cases'] and len(originals)==51,'Original P1 oracle differs')
        for module in emitted['actualProductionModules']:
            require(module['path'].startswith('dist/') and sha((root/module['path']).read_bytes())==module['sha256'],'Actual dist import attribution changed')
        for metric in load(f'node{major}/source/workload.json')['measurements'],emitted['workloads']['measurements']:
            require(len(metric)==13,'Workload matrix changed')
            bound=metric[-1];require(bound['completeInputBlocks']==50742 and bound['completeInputCarBytes']==6740313 and bound['refusal']=='native_proof_limit' and not bound['partialOutput'],'Actual unique-block refusal changed')
            require(all(row.get('hashes') is None and row.get('keyNormalization') is None and row['peakHeap'] is None for row in metric),'Uninstrumented counters became fake zero')
    browser=load('chromium/chromium.json');require(browser['actualExecution'] and not browser['browserInstalledProvenanceAcceptance'],'Browser provenance overstated')
    require(browser['extraction']['cases']==cases and browser['originalP1Cases']==originals and load('r1-chromium.json')['cases']==r1,'Actual browser oracle differs')
    require(sha(read(p/'chromium/probe.js.gz'))==browser['bundleSha256'],'Browser bundle changed')
    return cases,originals,r1
manifest=load('manifest.json');inspection=load('source-inspection.json');coverage=load('stage-coverage.json');runs=load('runs.json')
files(manifest);pins(inspection);cases,originals,r1=capture(runs,coverage)
for row in load('compressed-inputs.json'):
    raw=read(root/row['path']);require(len(raw)==row['decodedBytes'] and sha(raw)==row['decodedSha256'],'Lossless compression changed')
build=load('build-provenance.json.gz')
for family in['sourceHashes','outputHashes']:
    for name,digest in build[family].items():require(sha((root/name).read_bytes())==digest,'Build source/output changed '+name)
require(len(build['sourceHashes'])==146 and len(build['outputHashes'])==472,'Build closure changed')
installed=load('installed-runtime.json.gz');require(len(installed['packages'])==194 and sum(map(len,installed['packages'].values()))==14234,'Physical inventory changed')
reviewed=json.loads((root/'src/integrity/files-approved.json').read_text())
require(installed['packages']==reviewed,'Physical capture differs from accepted runtime files')
for package,expected in installed['packages'].items():
    actual={}
    directory=root/package
    require(not directory.is_symlink(),'Package alias')
    for base,dirs,names in os.walk(directory):
        if Path(base)==directory:dirs[:]=[d for d in dirs if d!='node_modules']
        for name in dirs:require(not (Path(base)/name).is_symlink(),'Dependency directory alias')
        for name in names:
            f=Path(base)/name;require(f.is_file() and not f.is_symlink(),'Dependency file alias')
            actual[str(f.relative_to(directory))]=sha(f.read_bytes())
    require(actual==expected,'Actual physical package changed '+package)
original=json.loads((root/'experiments/post-spike-evidence/2026-10-02/native-proof-extraction-intake-api/original-p2-vectors.json').read_text())
require(len(original['vectors'])==36 and len(original['obligations'])==12 and all(row['status']=='UNEXECUTED' for row in original['vectors']),'Original full P2 inventory upgraded')
links=[]
for name in[manifest['report']]:
    text=(root/name).read_text()
    for target in re.findall(r'\]\(([^)]+)\)',text):
        require(not target.startswith('https:') and (root/name).parent.joinpath(target).resolve().is_file(),'Broken report link '+target);links.append(target)
controls=[]
def negative(name,run):
    try:run()
    except AssertionError:controls.append(name);return
    raise AssertionError('Accepted negative control '+name)
bad=copy.deepcopy(manifest);bad['files'][0]['sha256']='0'*64;negative('changed-file',lambda:files(bad))
bad=copy.deepcopy(manifest);bad['fullP2Closed']=True;negative('full-P2-upgrade',lambda:files(bad))
bad=copy.deepcopy(inspection);bad['pins'][0]['sha256']='0'*64;negative('changed-source-pin',lambda:pins(bad))
bad=copy.deepcopy(inspection);bad['preservedAcceptedSourceFiles'].pop();negative('accepted-source-file-dropped',lambda:pins(bad))
bad=copy.deepcopy(runs);bad['runs'][0]['exitCode']=1;negative('failed-runtime-promoted',lambda:capture(bad,coverage))
bad=copy.deepcopy(runs);bad['runs'].pop();negative('actual-browser-omitted',lambda:capture(bad,coverage))
bad=copy.deepcopy(coverage);bad['broaderP2Closed']=True;negative('complete-replay-upgrade',lambda:capture(runs,bad))
bad=copy.deepcopy(coverage);bad['vectors'].pop();negative('PX-obligation-dropped',lambda:capture(runs,bad))
bad=copy.deepcopy(coverage);bad['vectors'][3]['limitations']='natural retreat';negative('natural-retreat-invented',lambda:capture(runs,bad))
bad=copy.deepcopy(coverage);bad['vectors'][17]['limitations']='all counters zero';negative('unknown-work-counter-zeroed',lambda:capture(runs,bad))
print(json.dumps({'result':'PASS','sourceHead':inspection['executableHead'],'gitPins':len(inspection['pins']),'preservedAcceptedSourceFiles':16,'extractionCaseGroups':len(cases),'addressedPX':18,'originalP1Cases':len(originals),'originalR1Cases':len(r1),'actualRuntimeInvocations':10,'actualChromium':load('chromium/chromium.json')['version'],'buildSources':146,'actualBuildOutputs':472,'physicalRuntimePackages':194,'physicalRuntimeFiles':14234,'originalHistoricalUNEXECUTEDVectors':36,'originalObligations':12,'fullP2Closed':False,'links':len(links),'negativeControls':controls,'conformanceRerunByChecker':False},indent=2))
