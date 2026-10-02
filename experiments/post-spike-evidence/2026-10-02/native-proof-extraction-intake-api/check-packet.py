#!/usr/bin/env python3
"""Check this source-only proposal and falsify unsafe metadata; execute no proposed API."""
import copy
import gzip
import hashlib
import json
from pathlib import Path
import re
import subprocess

packet = Path(__file__).resolve().parent
root = packet.parents[3]
sha = lambda value: hashlib.sha256(value).hexdigest()

def load(name):
    return json.loads((packet / name).read_text())

def require(condition, message):
    if not condition:
        raise AssertionError(message)

def verify_files(manifest):
    names = set()
    for row in manifest['files']:
        require(row['path'] not in names, 'Duplicate inventory path')
        names.add(row['path'])
        value = (root / row['path']).read_bytes()
        require(sha(value) == row['sha256'] and len(value) == row['bytes'], 'Changed file ' + row['path'])
    actual = {str(path.relative_to(root)) for path in packet.rglob('*') if path.is_file() and path.name not in ['manifest.json','verification.json']}
    require(actual <= names, 'Unlisted packet file')

def verify_pins(inspection):
    for pin in inspection['pins']:
        name = pin['commit'] + ':' + pin['path']
        value = subprocess.check_output(['git','show',name],cwd=root)
        blob = subprocess.check_output(['git','rev-parse',name],cwd=root,text=True).strip()
        require(len(value) == pin['bytes'] and sha(value) == pin['sha256'] and blob == pin['gitBlob'], 'Changed Git pin ' + name)
        if pin['commit'] == inspection['baseline']:
            require(sha((root / pin['path']).read_bytes()) == pin['sha256'], 'Production/API/dependency source changed')
    require(inspection['proofAndCarUnchangedFromPrevious'], 'Unexpected proof baseline change')
    changed = subprocess.check_output(['git','diff','--name-only',inspection['previousReviewedProofBasis'],inspection['baseline'],'--','src/protocol/native-proof.ts','src/protocol/native-observer-car.ts','src/protocol/index.ts','src/host/native-observer.ts'],cwd=root,text=True)
    require(not changed, 'Proof/CAR/barrel/observer differs from inspected prior basis')
    changed = subprocess.check_output(['git','diff','--name-only',inspection['baseline'],'--','src','scripts','tests','package.json','npm-shrinkwrap.json','tsconfig.json'],cwd=root,text=True)
    require(not changed, 'Source-only scope violated')
    extra = subprocess.check_output(['git','ls-files','--others','--exclude-standard','--','src','scripts','tests'],cwd=root,text=True)
    require(not extra, 'Untracked production/test code in source-only task')
    inventory_pin = next(pin for pin in inspection['pins'] if pin['path'].endswith('/installed-runtime.json.gz'))
    inventory = json.loads(gzip.decompress(subprocess.check_output(['git','show',inventory_pin['commit']+':'+inventory_pin['path']],cwd=root)))
    for row in inspection['upstream']:
        value = (root / row['path']).read_bytes()
        expected = inventory['packages']['node_modules/'+row['package']][row['file']]
        require(sha(value) == row['sha256'] == expected, 'Changed maintained-source attribution')
    return len(inspection['pins'])

def verify_contract(c):
    require(c['status'] == 'PROPOSED; independent source decision required before code', 'Approval status overstated')
    exports = c['publicApi']
    runtime = ['NATIVE_PROOF_LIMITS','NATIVE_CACHE_BROWSER','NATIVE_CACHE_HOST','normalizeRepoSigningKey','assertAuthenticatedRepo','VerifiedRepoBlocks','authenticateRepo']
    types = ['NativeLookup','NativeTree','AuthenticatedRepo','AuthenticateRepoOptions']
    require(exports['runtime'] == runtime and exports['types'] == types, 'Supported export inventory changed')
    require(not exports['AuthenticatedRepoShapeChanged'] and not exports['supportedNamesAdded'], 'Supported API expanded without decision')
    code = (root/'src/protocol/native-proof.ts').read_text()
    names = re.findall(r'^export\s+(?:(?:async\s+)?function|const|class|type|interface)\s+(\w+)',code,re.M)
    require(set(names) == set(runtime+types), 'Proposed explicit list does not match actual exports')
    require("export * from './native-proof.ts';" in (root/'src/protocol/index.ts').read_text(), 'Current barrel/source fact changed')
    require(c['extract']['signature'].endswith('Promise<Uint8Array>'), 'CAR-only chosen output changed')
    require('existing authenticatedRoots WeakSet becomes ONE private WeakMap' in c['extract']['registry'] and 'no caller registrar or second brand' in c['extract']['registry'], 'Extra trust registry introduced')
    require(c['decisions'][2]['id'] == 'API3' and c['decisions'][2]['chosen'].startswith('read selected commit from original capability shared cache; eviction makes extraction unavailable'), 'Commit retention/eviction choice changed')
    require('exact CID set and physical count validated before' in c['car']['capture'], 'Unsafe post-admission or post-dedup intake')
    require('authenticateRepo' in c['car']['admission'] and 'original prototype' in c['car']['admission'] and 'original capability identity' in c['car']['admission'], 'Issuer identity/dispatch choice changed')
    require(c['budgets']['requestedBlocks'].startswith('1..64 unique canonical CBOR CIDs; response physical block count<=64 BEFORE CID dedup'), 'Physical response quota weakened')
    require('portable16MiB' in c['budgets']['extractCarBytes'] and 'including selected commit' in c['budgets']['intakeCar'], 'Output accounting weakened')
    require('PD1' in c['boundaries'] and 'PD2' in c['boundaries'] and 'P4' in c['boundaries'], 'Joined floor/capture/origin gate omitted')
    require(c['executed']['sourceCheckerOnly'] and not c['executed']['productionOrApiChanges'] and not c['executed']['runtimeExperiments'] and not c['executed']['providerExperiments'], 'Source-only scope overstated')
    require([row['id'] for row in c['decisions']] == ['API1','API2','API3','API4'], 'Decision inventory changed')
    recovery = c['futureObserverRecoveryDecision']
    require(recovery['status'].startswith('OPEN; separate future observer/recovery'), 'Future recovery decision prematurely resolved')
    require('contradiction or pendingFault' in recovery['baseline'] and 'for all apps' in recovery['baseline'], 'Approved conservative availability coupling omitted')
    require('separately reviewed private seam' in recovery['alternative'] and 'not chosen or implemented here' in recovery['alternative'], 'Unreviewed floor-only recovery chosen')

def verify_vectors(vectors, original_bytes):
    require(vectors['status'] == 'UNEXECUTED' and len(vectors['vectors']) == 30, 'Seam vector scope changed')
    require(all(row['status']=='UNEXECUTED' for row in vectors['vectors']) and not vectors['runtimeOrProviderExecutionHere'], 'Seam execution invented')
    require([row['id'] for row in vectors['vectors']] == [f'PX{n}' for n in range(1,19)]+[f'CI{n}' for n in range(1,13)], 'Seam acceptance inventory changed')
    original_pin = next(pin for pin in inspection['pins'] if pin['path'].endswith('selected-root-read-review-followup/unexecuted-vectors.json'))
    require(sha(original_bytes) == original_pin['sha256'] and len(original_bytes) == original_pin['bytes'], 'Original obligation/vector bytes changed')
    original = json.loads(original_bytes)
    require(len(original['vectors']) == 36 and len(original['obligations']) == 12, 'Original full P2 inventory changed')
    require(all(row['status'] == 'UNEXECUTED' for row in original['vectors']), 'Original vector label upgraded')
    events = load('request-projection.json')
    full = next(row['statement'] for row in events if row['event'].endswith('3a7f6bb3d6c1c763619b6082558d83056a0ef7b2'))
    require(original['originalP2Conditions'] == full['body']['conditions'], 'Full parent conditions changed')

manifest = load('manifest.json')
inspection = load('source-inspection.json')
c = load('contract.json')
v = load('decision-vectors.json')
original = (packet/'original-p2-vectors.json').read_bytes()
verify_files(manifest)
pins = verify_pins(inspection)
verify_contract(c)
verify_vectors(v,original)
later = load('later-coordination.json')
require(later['review']['event'].endswith('8ef8823469718221b7c06a18a88b919f9c6b1446'), 'Wrong later review pin')
require(later['review']['statement']['body']['head'] == '48a5634a89bc1aef535e1689bfc2ba54e8d3499c' and later['review']['statement']['body']['verdict'] == 'approved', 'Later review/head attribution changed')
require(later['observerRecoveryDecision'] == c['futureObserverRecoveryDecision'], 'Later recovery carry differs')
require('separate reviewed private seam/test decision' in v['vectors'][-1]['acceptance'], 'Future vector omits recovery decision')
links = []
for name in ['2026-10-02-atseq-native-proof-extraction-intake.md','2026-10-02-atseq-native-proof-extraction-intake-results.md']:
    text = (root/'notes'/name).read_text()
    for link in re.findall(r'\]\(([^)]+)\)',text):
        if link.startswith('https://'):
            require(link == 'https://github.com/mary-ext/atcute', 'Unverified external reference')
        else:
            require((root/'notes'/link).resolve().is_file(), 'Broken local link '+link)
        links.append(link)
require(load('official-references.json')['references'][0]['url'] == 'https://github.com/mary-ext/atcute','Related repo attribution changed')
controls = []
def negative(name,run):
    try:
        run()
    except AssertionError:
        controls.append(name)
        return
    raise AssertionError('Accepted unsafe negative control '+name)
bad = copy.deepcopy(manifest);bad['files'][0]['sha256']='0'*64
negative('changed-file-hash',lambda:verify_files(bad))
bad = copy.deepcopy(inspection);bad['pins'][0]['sha256']='0'*64
negative('changed-Git-pin',lambda:verify_pins(bad))
bad = copy.deepcopy(inspection);bad['upstream'][0]['sha256']='0'*64
negative('changed-upstream-attribution',lambda:verify_pins(bad))
for name, mutate in [
 ('premature-approval',lambda x:x.update(status='ADOPTED')),
 ('supported-method-expansion',lambda x:x['publicApi'].update(AuthenticatedRepoShapeChanged=True)),
 ('extra-supported-export',lambda x:x['publicApi']['runtime'].append('extractNativeRepoPaths')),
 ('result-row-output',lambda x:x['extract'].update(signature='extractNativeRepoPaths(...): Promise<NativeRows>')),
 ('second-registrar',lambda x:x['extract'].update(registry='Caller-supplied registrar')),
 ('uncharged-per-capability-commit',lambda x:x['decisions'][2].update(chosen='Retain every commit outside cache forever')),
 ('post-dedup-physical-limit',lambda x:x['car'].update(capture='Dedup before counting and admit available subset')),
 ('overridable-dispatch',lambda x:x['car'].update(admission='Use caller method and replace original handle')),
 ('capture-condition-omitted',lambda x:x['boundaries'].pop('PD2')),
 ('recovery-decision-prematurely-resolved',lambda x:x['futureObserverRecoveryDecision'].update(status='ADOPTED')),
 ('availability-coupling-omitted',lambda x:x['futureObserverRecoveryDecision'].update(baseline='Always advance the account cursor')),
 ('runtime-claim',lambda x:x['executed'].update(runtimeExperiments=True))]:
    bad=copy.deepcopy(c);mutate(bad);negative(name,lambda:verify_contract(bad))
bad = copy.deepcopy(v);bad['vectors'][0]['status']='PASS'
negative('unexecuted-vector-promoted',lambda:verify_vectors(bad,original))
negative('original-vector-byte-edited',lambda:verify_vectors(v,original+b'\n'))
print(json.dumps({'result':'PASS','scope':'SOURCE ONLY','gitPins':pins,'upstreamExactSources':len(inspection['upstream']),'supportedRuntimeNames':7,'supportedTypes':4,'proposedDecisions':4,'originalObligations':12,'originalHistoricalUNEXECUTEDVectors':36,'newUNEXECUTEDVectors':30,'links':len(links),'negativeControls':controls,'proposedRuntimeOrProviderExecution':False},indent=2))
