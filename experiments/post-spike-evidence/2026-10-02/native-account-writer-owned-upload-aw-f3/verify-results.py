#!/usr/bin/env python3
"""Verify delivered bytes and retained execution assertions; do not rerun gates."""
import hashlib
import json
import pathlib
import re
import subprocess
import tarfile

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[3]
BASE = '1935cd2da0445b0ac9264f37c6277d48235af69c'

def sha(raw):
    return hashlib.sha256(raw).hexdigest()

def load(name):
    return json.loads((HERE / name).read_text())

def git_bytes(head, path):
    return subprocess.check_output(['git', 'show', head + ':' + path], cwd=ROOT)

def pin(raw, item):
    assert len(raw) == item['bytes'], item['path']
    assert sha(raw) == item['sha256'], item['path']

inventory = load('delivery-inventory.json')
for item in inventory['files']:
    pin((ROOT / item['path']).read_bytes(), item)
changed = set(subprocess.check_output(['git', 'diff', '--name-only', BASE, 'HEAD'], cwd=ROOT).decode().splitlines())
expected = {item['path'] for item in inventory['files']} | set(inventory['gitClosedSelfReferences'])
assert changed == expected, {'missing': sorted(changed - expected), 'extra': sorted(expected - changed)}

original = load('original-preservation.json')
assert len(original['pins']) == 424 and original['originalVectorRows'] == 117
intentional = set(original['intentionalLiveCodeCorrections'])
for item in original['pins']:
    pin(git_bytes(BASE, item['path']), item)
    if item['path'] not in intentional:
        pin((ROOT / item['path']).read_bytes(), item)
for item in load('producer-inputs.json'):
    pin(git_bytes(item['producer'], item['path']), item)
    pin((ROOT / item['path']).read_bytes(), item)

build = load('production-build-provenance.json')
assert build['node'] == 'v26.10.0' and build['compiler']['version'] == '7.0.2'
for path, digest in build['sourceHashes'].items():
    assert sha((ROOT / path).read_bytes()) == digest, path
for path, digest in build['outputHashes'].items():
    assert sha((HERE / 'common-production' / path).read_bytes()) == digest, path

wrapper_count = 0
for folder in ['wrappers-final-owned-kind-node26', 'wrappers-final-owned-kind-real-installed-node26']:
    data = load(folder + '/compiled-pins.json')
    assert data['runtime'] == 'v26.10.0' and data['compiler']['version'] == '5.9.2'
    assert data['productionBuildProvenanceSHA256'] == sha((HERE / 'production-build-provenance.json').read_bytes())
    for path, digest in data['productionOutputs'].items():
        assert build['outputHashes'][path] == digest, path
    for path, digest in data['outputHashes'].items():
        # Output pins use original private output-root paths, retained beneath folder.
        relative = path.split('/', 2)[2]
        assert sha((HERE / folder / relative).read_bytes()) == digest, path
        wrapper_count += 1
    for path, digest in data['sourceHashes'].items():
        source = HERE / 'root-owned-blob-size-probe-original.ts' if path == '.atseq-local/root-owned-blob-size-probe.ts' else ROOT / path
        assert sha(source.read_bytes()) == digest, path
for mode in ['source', 'emitted']:
    data = load('chromium-final-' + mode + '/bundle-pins.json')
    for path, digest in data['bundleHashes'].items():
        assert sha((HERE / ('chromium-final-' + mode) / 'bundle' / path).read_bytes()) == digest, path

def json_lines(capture):
    return [json.loads(line) for line in (HERE / capture).read_text().splitlines() if line.startswith('{')]

def suite(capture, count):
    raw = (HERE / capture).read_text()
    for name, value in [('tests', count), ('pass', count), ('fail', 0), ('skipped', 0)]:
        assert re.search(r'(?m)^[#ℹ] ' + name + ' ' + str(value) + r'$', raw), capture

results = load('results.json')
assert not results['fullA1A2P3Claim'] and not results['linuxExecuted']
for row in results['rows']:
    assert row['result'] == 'PASS'
    if 'suiteTests' in row:
        suite(row['capture'], row['suiteTests'])
    else:
        values = json_lines(row['capture'])
        data = next(value for value in values if 'cases' in value or 'uploadOwnership' in value)
        cases = data.get('cases', data.get('uploadOwnership', {}).get('cases', []))
        assert len(cases) == row.get('cases', row.get('groupedCases')), row
        if 'actualNetworkSchedules' in row:
            assert len(data['realNetwork']) == row['actualNetworkSchedules']
        assert data['maintainedClient'] is True and data['publicProviderExecuted'] is False
for row in results['legacyAndReferencePds']:
    if row['kind'] == 'legacy':
        suite(row['capture'], 35)
    else:
        data = json_lines(row['capture'])[0]
        assert len(data['cases']) == 6 and data['realReferencePDS'] is True
        assert data['officialPDSDPoPAcceptanceClaim'] is False

with tarfile.open(HERE / 'package-final/atseq-0.1.0.tgz') as package:
    for path, digest in build['outputHashes'].items():
        assert sha(package.extractfile('package/' + path).read()) == digest, path
    assert package.getmember('package/node_modules/unicode-segmenter/grapheme.js').size > 0
assert 'Installed runtime closure, dependency edges and integrity pins match reviewed provenance.' in (HERE / 'raw/check-final-node26.log').read_text()
assert 'InvalidResponse' in (HERE / 'raw/final-identical-root-probe-source-node26.log').read_text()
assert 'InvalidResponse' in (HERE / 'raw/final-identical-root-probe-emitted-node26.log').read_text()
print(json.dumps({'status': 'PASS', 'deliveredPaths': len(expected), 'hashedDeliveryPaths': len(inventory['files']), 'originalGitPathsPreserved': 424, 'originalVectorRowsPreserved': 117, 'executedResultRows': len(results['rows']), 'legacyAndPdsRows': len(results['legacyAndReferencePds']), 'retainedFinalWrapperOutputs': wrapper_count, 'productionOutputs': len(build['outputHashes']), 'caveatsRetained': True}))
