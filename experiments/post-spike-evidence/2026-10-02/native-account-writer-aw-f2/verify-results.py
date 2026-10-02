import hashlib
import json
import re
import subprocess
from pathlib import Path

directory = Path(__file__).resolve().parent
root = directory.parents[3]
final = directory / 'final'
sha = lambda data: hashlib.sha256(data).hexdigest()
manifest = json.loads((directory / 'manifest.json').read_text())
for item in manifest['files']:
    data = (root / item['path']).read_bytes()
    assert len(data) == item['bytes'] and sha(data) == item['sha256'], item['path']
pins = json.loads((final / 'producer-source-pins.json').read_text())
for item in pins['inputs']:
    data = subprocess.check_output(['git', 'show', item['producer'] + ':' + item['path']], cwd=root)
    assert len(data) == item['bytes'] and sha(data) == item['sha256'], item['path']
    assert (root / item['path']).read_bytes() == data, item['path']
for item in json.loads((final / 'compiled-output-retention.json').read_text()):
    data = (root / item['retained']).read_bytes()
    assert sha(data) == item['sha256'], item['retained']
for item in json.loads((final / 'adopted-input-pins.json').read_text()):
    data = (root / item['retained']).read_bytes()
    assert len(data) == item['bytes'] and sha(data) == item['sha256'], item['retained']
physical = json.loads((final / 'physical-runtime-pins.json').read_text())
for item in physical['pins']:
    if 'retained' in item:
        assert sha((root / item['retained']).read_bytes()) == item['sha256'], item['path']

def result(log, expected):
    text = (final / log).read_text()
    for key, value in [('tests', expected), ('pass', expected), ('fail', 0), ('cancelled', 0), ('skipped', 0)]:
        found = re.findall(r'(?m)^(?:#|ℹ) ' + key + r' (\d+)', text)
        assert found and int(found[-1]) == value, (log, key, found)

for n in (22, 24, 26):
    for mode in ('source', 'compiled'):
        result(f'{mode}-16f-node{n}.log', 105)
        result(f'{mode}-legacy-16f-node{n}.log', 35)
        pds = json.loads((final / f'{mode}-PDS-16f-node{n}.log').read_text())
        assert len(pds['cases']) == 6 and pds['resourceSends'] == 13
        assert pds['realReferencePDS'] and pds['testOnlyLoopbackBearerBridge']
        assert not pds['officialPDSDPoPAcceptanceClaim'] and not pds['publicProviderExecuted']
        assert pds['sniffedUpload']['requestType'] == 'application/octet-stream'
        assert pds['sniffedUpload']['responseType'] == 'image/png'
        assert pds['sniffedUpload']['bytes'] == 68 and pds['sniffedUpload']['exactRetainedByteRecovery']
    result(f'compiled-Chrome-16f-node{n}.log', 1)
    result(f'package-16f-node{n}.log', 1)
    result(f'packed-native-16f-node{n}.log', 43)
    assert 'Installed runtime closure, dependency edges and integrity pins match reviewed provenance.' in (final / f'check-16f-node{n}.log').read_text()
    extra = json.loads((final / f'supplemental-16f-node{n}.log').read_text())
    assert len(extra['cases']) == 6 and extra['maintainedClient'] and not extra['publicProviderExecuted']
result('compiled-Chrome-persistent-16f-node26.log', 1)
assert '"actualPersistentContextClosedAndReopened":true' in (final / 'compiled-Chrome-persistent-16f-node26.log').read_text()
coverage = json.loads((final / 'vector-coverage.json').read_text())
assert len(coverage['rows']) == 117
assert coverage['counts'] == {'accepted-acceptance-refinement': 1, 'deferred-separate-publisher-owner': 1, 'executed': 113, 'superseded-by-adopted-fixed-resource-policy': 2}
for row in coverage['rows']:
    for capture in row['captures']:
        assert (directory / capture).is_file(), capture
for pin in final.glob('*compiled-pins-16f-node*.json'):
    data = json.loads(pin.read_text())
    assert data['compiler']['version'] == '5.9.2' and not data['preparationOnly']
    for path, digest in data['sourceHashes'].items():
        assert sha((root / path).read_bytes()) == digest, (pin, path)
builds = [json.loads((final / f'build-provenance-16f-node{n}.json').read_text()) for n in (22, 24, 26)]
assert {item['compiler']['version'] for item in builds} == {'7.0.2'}
differences = [path for path in builds[0]['outputHashes'] if len({item['outputHashes'].get(path) for item in builds}) > 1]
assert differences == ['dist/shell/build-provenance.json', 'dist/shell/shell-manifest.json'], differences
print(json.dumps(dict(status='PASS', deliveredFiles=len(manifest['files']), immutableProducerInputs=len(pins['inputs']), retainedWrappers=len(json.loads((final / 'compiled-output-retention.json').read_text())), vectorRows=117, caveatsRetained=True)))
