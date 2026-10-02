#!/usr/bin/env python3
"""Check R1-F2 hashes and runtime/source attribution; do not rerun experiments."""
import gzip
import hashlib
import io
import json
import pathlib
import re
import subprocess
import tarfile

packet = pathlib.Path(__file__).resolve().parent
root = packet.parents[3]
baseline = '316439928e0c0d41965b086f2dace19a9249dba7'
test_source = 'c9f6734e465c076bb25c9393f0a8942c64994a70'
expected_cases = ['genuine-full-history-join-roundtrip', 'compact-DATA-without-identity-arrays',
                  'RV1-floor-descriptor-missing-exact-rejection', 'original-export-and-compact-acceptance-unchanged']
exact_error = {'code': 'envelope', 'message': 'Floor descriptor was not consumed'}


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def raw(name):
    path = packet / name
    return gzip.decompress(path.read_bytes()) if path.suffix == '.gz' else path.read_bytes()


def read(name):
    return json.loads(raw(name))


def git(*args):
    return subprocess.check_output(['git', *args], cwd=root)


manifest = read('manifest.json')
assert manifest['baseline'] == baseline and manifest['testSource'] == test_source
assert manifest['productionChanged'] is False and manifest['fullR1P2P3Closed'] is False
for item in manifest['files']:
    data = (root / item['path']).read_bytes()
    assert len(data) == item['bytes'] and sha(data) == item['sha256'], item['path']
    if 'uncompressedSha256' in item:
        data = gzip.decompress(data)
        assert len(data) == item['uncompressedBytes'] and sha(data) == item['uncompressedSha256']
actual_files = sorted(str(p.relative_to(root)) for p in packet.rglob('*') if p.is_file()
                      and p.name not in ['manifest.json', 'verification.json'])
assert actual_files == sorted(x['path'] for x in manifest['files'] if x['path'].startswith(str(packet.relative_to(root))))
inspection = read('source-inspection.json')
assert len(inspection['sources']) == 27 and len(inspection['observations']) == 9
for item in inspection['sources']:
    data = git('show', item['commit'] + ':' + item['path'])
    assert len(data) == item['bytes'] and sha(data) == item['sha256']
    assert git('rev-parse', item['commit'] + ':' + item['path']).decode().strip() == item['gitBlob']
    if item['commit'] != '5dd41404aea39af906093e08611d7f4f7128f8af':
        assert data == (root / item['path']).read_bytes(), item['path']
for item in inspection['observations']:
    assert item['literal'] in git('show', baseline + ':' + item['path']).decode()
for line in git('diff', '--name-status', baseline, 'HEAD').decode().splitlines():
    kind, path = line.split('\t')
    assert kind == 'A' and (path.startswith('experiments/post-spike-evidence/2026-10-02/native-floor-history-r1-f2/')
                           or path.startswith('tests/native-authority-floor')
                           or path.startswith('tests/support/native-authority-floor')
                           or path.startswith('experiments/native-authority-floor/')
                           or path == 'notes/2026-10-02-atseq-native-prefix-cold-limit-and-floor-results.md'), path
build = read('build-provenance.json')
assert build['node'] == 'v26.10.0' and build['compiler'] == {'name': 'typescript', 'version': '7.0.2'}
for path, digest in build['sourceHashes'].items():
    assert sha(git('show', baseline + ':' + path)) == digest, path
installed = read('installed-runtime.json.gz')
assert installed['node'] == 'v26.10.0' and installed['forcedInstalledClosureCheck'] is True
assert installed['physicalNodeModules'] is True and len(installed['packages']) == 194
assert installed['packages'] == json.loads(git('show', baseline + ':src/integrity/files-approved.json'))
assert installed['lockSha256'] == sha(git('show', baseline + ':npm-shrinkwrap.json'))
versions = {'22': 'v22.19.0', '24': 'v24.21.0', '26': 'v26.10.0'}
authority_cases = read('chromium/i2-browser.json')['cases']
data_cases = read('chromium/p4-data-browser.json')['cases']
assert len(authority_cases) == 54 and len(data_cases) == 91
for major, version in versions.items():
    for mode in ['source', 'compiled']:
        capture = read('node' + major + '/' + mode + '.json')
        fixture = raw('node' + major + '/' + mode + '-fixture.json')
        assert capture['node'] == version and capture['cases'] == expected_cases
        assert capture['exactError'] == exact_error and capture['dataOnly'] is True
        assert len(fixture) == capture['fixtureBytes'] and sha(fixture) == capture['fixtureSha256']
        if mode == 'compiled':
            assert len(capture['actualProductionModules']) == 14 and len(capture['testModules']) == 5
            for item in capture['actualProductionModules']:
                assert build['outputHashes'][item['path']] == item['sha256']
            for item in capture['testModules']:
                assert sha((root / item['path']).read_bytes()) == item['sourceSha256']
    authority = read('node' + major + '/authority-compiled.json')
    assert authority['node'] == version and authority['cases'] == authority_cases
    fixture = raw('node' + major + '/authority-fixture.json.gz')
    assert len(fixture) == authority['fixtureBytes'] and sha(fixture) == authority['fixtureSha256']
    assert read('node' + major + '/checkpoint-data.json')['cases'] == data_cases
    log = raw('node' + major + '/source.log').decode()
    assert re.search(r'(?:#|ℹ) pass 3\b', log) and re.search(r'(?:#|ℹ) fail 0\b', log)
browser = read('chromium/floor.json')
assert browser['node'] == 'v26.10.0' and browser['chromium'] == '153.0.8010.12'
assert browser['cases'] == expected_cases and browser['exactSharedCasesAgree'] and browser['dataOnly']
assert sha(raw('chromium/r1-floor-browser-fixture.json')) == browser['fixtureSha256']
bundle = raw('chromium/r1-floor-browser-bundle.mjs.gz')
assert len(bundle) == browser['bundleBytes'] and sha(bundle) == browser['bundleSha256']
assert read('chromium/floor-source.json')['fixtureSha256'] == browser['fixtureSha256']
assert re.search(r'ℹ pass 3\b', raw('chromium/browser.log').decode())
assert 'Installed runtime closure, dependency edges and integrity pins match reviewed provenance.' in raw('check.log').decode()
attempt = read('draft-attempts/first-matrix-inventory.json')
archive = (packet / 'draft-attempts' / attempt['archive']).read_bytes()
assert sha(archive) == attempt['sha256'] and len(attempt['members']) == 24
with tarfile.open(fileobj=io.BytesIO(archive), mode='r:gz') as tar:
    assert tar.getnames() == [x['path'] for x in attempt['members']]
    for item in attempt['members']:
        data = tar.extractfile(item['path']).read()
        assert len(data) == item['bytes'] and sha(data) == item['sha256']
    assert json.loads(tar.extractfile('first-matrix-node22-source.json').read())['node'] == 'v24.13.0'
    assert json.loads(tar.extractfile('first-matrix-node24-source.json').read())['node'] == 'v22.19.0'
runs = read('runs.json')
assert len(runs['runs']) == 9 and all(x['exitCode'] == 0 for x in runs['runs'])
assert all(runs[x] is False for x in ['fullSuiteRerun', 'providerRun', 'durableRestoreRun', 'timingRun'])
request = read('request-projection.json')
assert request['event'].endswith('#git:sha1:ef61efd8e8531623f0313ada9b66208130e773f1')
note = root / 'notes/2026-10-02-atseq-native-prefix-cold-limit-and-floor-results.md'
text = note.read_text()
for target in re.findall(r'\[[^\]]+\]\(([^)]+)\)', text):
    assert (note.parent / target).is_file(), target
assert '**all ordered entries**' in text and 'Full R1, P2 and P3 remain open' in text
print(json.dumps({'result': 'PASS', 'baseline': baseline, 'testSource': test_source,
                  'manifestSha256': sha((packet / 'manifest.json').read_bytes()),
                  'exactSourcePins': 27, 'literalObservations': 9, 'retainedAttemptMembers': 24,
                  'sourceRuntimes': list(versions.values()), 'floorCases': 4, 'authorityCases': 54,
                  'checkpointDataCases': 91, 'chromium': browser['chromium'],
                  'productionChanged': False, 'fullR1P2P3Closed': False}, indent=2))
