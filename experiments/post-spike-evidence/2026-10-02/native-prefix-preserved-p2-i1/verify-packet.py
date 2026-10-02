#!/usr/bin/env python3
"""Verify the closed packet and actual cross-runtime attribution; no runtime experiment is rerun."""
import copy
import gzip
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

packet = Path(__file__).resolve().parent
root = packet.parents[3]
sha = lambda raw: hashlib.sha256(raw).hexdigest()

def raw(path):
    value = (packet / path).read_bytes()
    return gzip.decompress(value) if path.endswith('.gz') else value

def data(path):
    return json.loads(raw(path))

def require(condition, message):
    if not condition:
        raise AssertionError(message)

def verify_files(manifest):
    paths = set()
    for row in manifest['files']:
        require(row['path'] not in paths, 'Duplicate manifest path')
        paths.add(row['path'])
        value = (root / row['path']).read_bytes()
        require(len(value) == row['bytes'] and sha(value) == row['sha256'], 'Changed inventory: ' + row['path'])
    actual = {str(path.relative_to(root)) for path in packet.rglob('*') if path.is_file() and path.name not in ('manifest.json', 'verification.json')}
    require(actual <= paths, 'Unlisted packet files')

def verify_pins(inspection):
    for pin in inspection['pins']:
        name = pin['commit'] + ':' + pin['path']
        value = subprocess.check_output(['git', 'show', name], cwd=root)
        blob = subprocess.check_output(['git', 'rev-parse', name], cwd=root, text=True).strip()
        require(sha(value) == pin['sha256'] and len(value) == pin['bytes'] and blob == pin['gitBlob'], 'Changed Git pin: ' + name)
    source = inspection['source']
    changed = subprocess.check_output(['git', 'diff', '--name-only', inspection['baseline'], source], cwd=root, text=True).splitlines()
    require(sorted(changed) == sorted(inspection['newOrChangedSource']), 'Source scope changed')
    for pin in inspection['pins']:
        if pin['commit'] == source:
            require(sha((root / pin['path']).read_bytes()) == pin['sha256'], 'Working executable source differs')
    for pin in inspection['pins']:
        if pin['commit'] == inspection['baseline'] and pin['path'] != 'src/application/native-prefix.ts':
            require(sha((root / pin['path']).read_bytes()) == pin['sha256'], 'Original API/corpus/policy changed')
    code = (root / 'src/application/native-prefix.ts').read_text()
    start = code.index('export async function assertNativePrefixPreserved(')
    end = code.index('async function stageRows(', start)
    helper = code[start:end]
    require('Promise<void>' in helper and 'unchanged();' in helper, 'Void/recheck boundary absent')
    require(not re.search(r'\b(publication|stageRows|deriveIdentityBinding|verifyNativeSigned|verifyNativeEntryContents|mint|insert)\(', helper), 'Forbidden acceptance/crypto join in helper')
    require(not re.search(r'owner\.(current|observedFloor|contradiction|pendingFault)\s*=(?!=)', helper), 'Audit mutates owner')
    require(code.count('async function auditRetainedPaths(') == 1 and code.count('await auditRetainedPaths(') == 2, 'Retained loop is not shared once')
    require('assertNativePrefixPreserved' not in (root / 'src/application/index.ts').read_text(), 'Supported barrel changed')
    require('assertNativePrefixPreserved' not in (root / 'package.json').read_text(), 'Supported package changed')
    return len(inspection['pins'])

def verify_results(inspection, load=data):
    require(inspection['newCases'] == 32 and inspection['unchangedR1Cases'] == 29, 'Case count contract changed')
    reference = load('node22/preserved-source/result.json')
    original = load('node22/r1-source/result.json')
    require(len(reference['cases']) == 32 and len(original['cases']) == 29, 'Missing cases')
    require(len(set(reference['cases'])) == 32, 'Duplicate case')
    for name in ('higher-discarded-floor-is-required-without-installing-rows', 'old-view-audits-current-boundary-and-all-retained-interiors', 'genuine-unavailable-authority-descriptor-does-not-block-negative-audit', 'concurrent-higher-discarded-floor-withholds-completion', 'concurrent-current-acceptance-withholds-completion', 'concurrent-current-contradiction-withholds-completion', 'concurrent-pending-fault-withholds-completion', 'genuine-walker-runtime-fault-keeps-identity-and-no-effects'):
        require(name in reference['cases'], 'Missing required adversarial case')
    require([len(row['paths']) for row in reference['work']] == [2, 4, 5, 5, 6, 4], 'Audit path/dedup scope changed')
    require(all(row['cryptoChecks'] == 0 and row['contentReads'] == 0 for row in reference['work']), 'Negative audit ran crypto/content')
    build = load('build-provenance.json')
    source_pin = next(row for row in inspection['pins'] if row['commit'] == inspection['source'] and row['path'] == 'src/application/native-prefix.ts')
    require(build['sourceHashes'][source_pin['path']] == source_pin['sha256'], 'Build did not use final production source')
    versions = {22:'v22.19.0',24:'v24.21.0',26:'v26.10.0'}
    for major, version in versions.items():
        fixture = raw(f'node{major}/preserved-source/fixture.json.gz')
        for path, expected in ((f'node{major}/preserved-source/result.json', reference),(f'node{major}/preserved-emitted.json', reference),(f'node{major}/r1-source/result.json', original),(f'node{major}/r1-emitted.json', original)):
            result = load(path)
            require(result['node'] == version and result['cases'] == expected['cases'] and result['work'] == expected['work'], 'Cross-runtime projection changed: ' + path)
            if 'emitted' in path:
                expected_raw = fixture if 'preserved' in path else raw('fixtures/r1-prefix.json.gz')
                require(result['fixtureSha256'] == sha(expected_raw) and result['fixtureBytes'] == len(expected_raw), 'Wrong emitted fixture attribution')
                for row in result['actualProductionModules']:
                    require(build['outputHashes'][row['path']] == row['sha256'], 'Wrong actual emitted module')
        require(fixture == raw('node22/preserved-source/fixture.json.gz'), 'Source runtimes did not share exact fixture')
    for path, expected, fixture in (('native-prefix-preserved-browser.json',reference,raw('node22/preserved-source/fixture.json.gz')),('native-prefix-browser.json',original,raw('fixtures/r1-prefix.json.gz'))):
        result = load(path)
        require(result['chromium'] == '153.0.8010.12' and result['node'] == versions[26], 'Wrong actual browser attribution')
        require(result['cases'] == expected['cases'] and result['work'] == expected['work'], 'Browser projection changed')
        require(result['fixtureSha256'] == sha(fixture) and result['fixtureBytes'] == len(fixture), 'Browser fixture attribution changed')
    runs = load('runs.json')['runs']
    require(len(runs) == 10 and all(row['exitCode'] == 0 and row['source'] == inspection['source'] for row in runs), 'Missing/failed/misattributed runtime invocation')
    require(sorted(row['kind'] for row in runs) == sorted(['source','preserved-emitted','r1-emitted']*3+['chromium']), 'Runtime matrix changed')
    for row in runs:
        require((packet / row['log']).is_file(), 'Missing raw run log')
    return len(reference['cases'])

manifest = data('manifest.json')
inspection = data('source-inspection.json')
verify_files(manifest)
pins = verify_pins(inspection)
cases = verify_results(inspection)
for row in data('compression.json'):
    value = raw(row['path'])
    require(len(value) == row['uncompressedBytes'] and sha(value) == row['uncompressedSha256'], 'Lossless compression changed original')
installed = data('installed-runtime.json.gz')
require(installed['forcedInstalledClosureCheck'] and installed['physicalNodeModules'] and len(installed['packages']) == 194, 'Installed attribution missing')
remaining = data('remaining-gates.json')
require(len(remaining['vectors']) == 6 and all(row['status'] == 'UNEXECUTED' for row in remaining['vectors']), 'Future gates overstated')
note = (root / 'notes/2026-10-02-atseq-native-prefix-preservation-results.md').read_text()
links = re.findall(r'\]\((\.\.?/[^)]+)\)', note)
for link in links:
    require((root / 'notes' / link).resolve().is_file(), 'Broken local note link: ' + link)
controls = []
def negative(name, run):
    try:
        run()
    except AssertionError:
        controls.append(name)
        return
    raise AssertionError('Negative control accepted: ' + name)
bad = copy.deepcopy(manifest); bad['files'][0]['sha256'] = '0'*64
negative('changed-inventory-hash', lambda:verify_files(bad))
bad = copy.deepcopy(inspection); bad['pins'][0]['sha256'] = '0'*64
negative('changed-source-pin', lambda:verify_pins(bad))
def changed_load(path):
    value = data(path)
    if path == 'node22/preserved-source/result.json': value['cases'] = value['cases'][:-1]
    return value
negative('missing-adversarial-case', lambda:verify_results(inspection,changed_load))
def changed_work(path):
    value = data(path)
    if path == 'node22/preserved-source/result.json': value['work'][0]['cryptoChecks'] = 1
    return value
negative('crypto-work-present', lambda:verify_results(inspection,changed_work))
print(json.dumps({'result':'PASS','gitPins':pins,'newCases':cases,'unchangedR1Cases':29,'runtimeInvocations':10,'browser':'153.0.8010.12','localLinks':len(links),'negativeControls':controls,'runtimeExperimentsRerun':False},indent=2))
