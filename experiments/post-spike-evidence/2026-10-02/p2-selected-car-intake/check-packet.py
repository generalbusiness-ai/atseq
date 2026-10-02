"""Check exact evidence/source attribution and reject changed scope or conflicting actual captures."""
from pathlib import Path
import argparse
import copy
import gzip
import hashlib
import json
import re
import subprocess

PACKET = Path(__file__).resolve().parent
sha = lambda raw: hashlib.sha256(raw).hexdigest()


def load():
    manifest = json.loads((PACKET / 'manifest.json').read_text())
    consumers = []
    for label, version in [('22', '22.19.0'), ('24', '24.21.0'), ('26', '26.10.0')]:
        consumers.append(json.loads((PACKET / ('final/node' + label + '/source-' + version + '.json')).read_text()))
        consumers.append(json.loads((PACKET / ('final/node' + label + '/compiled.json')).read_text()))
    consumers.append(json.loads((PACKET / 'final/chromium.json').read_text()))
    return {
        'manifest': manifest, 'consumers': consumers,
        'commands': json.loads((PACKET / 'final/commands.json').read_text()),
        'coverage': json.loads((PACKET / 'coverage.json').read_text()),
        'original': json.loads((PACKET / 'adopted/original-p2-vectors.json').read_text()),
        'adopted': json.loads((PACKET / 'adopted-source.json').read_text()),
        'fixture': json.loads((PACKET / 'final/fixtures.json').read_text()),
        'builds': [json.loads((PACKET / ('final/node' + label + '/build-provenance.json')).read_text()) for label in ['22', '24', '26']],
    }


def validate(data):
    m, consumers = data['manifest'], data['consumers']
    assert m['runtimeProducer'] == 'bf290d7018060e4a2ecc1fd0d3964f6eedceaec0'
    assert m['basis'] == '87eec6aa872ce7acc58dc641f8e84f47ca7bbbb1'
    assert not m['fullP2Complete'] and not m['independentImplementationReviewComplete']
    assert m['actualCommands'] == len(data['commands']) == 23
    assert all(row['exitCode'] == 0 and row['producer'] == m['runtimeProducer'] for row in data['commands'])
    assert len(consumers) == m['actualConsumers'] == 7
    assert m['actualBuildSources'] == 146 and m['actualBuildOutputs'] == 472
    assert m['physicalPackages'] == 194 and m['physicalFiles'] == 14234
    required = ['src/protocol/native-observer-car.ts', 'tests/support/native-car-intake.ts',
                'tests/native-car-intake.test.ts', 'tests/native-car-intake-browser.test.ts',
                'experiments/p2-car-intake/prepare.ts', 'experiments/p2-car-intake/compiled-conformance.mjs',
                'experiments/p2-car-intake/run-matrix.py', 'src/protocol/native-proof.ts',
                'tests/native-observer-limits.test.ts', 'tests/support/native-proof-corpus.ts']
    assert all(path in m['sourceInputs'] for path in required)
    assert all(path in m['compilerLiveInputs'] for path in required[1:5])
    assert len(data['original']['obligations']) == 12 and len(data['original']['vectors']) == 36
    assert data['original']['status'] == 'UNEXECUTED'
    assert data['coverage']['originalFullP2Obligations'] == data['original']['obligations']
    assert not data['coverage']['fullP2Complete'] and not data['coverage']['nativePersistenceExecuted']
    assert not data['coverage']['providerTrial'] and not data['coverage']['checkpointAuditExecuted']
    assert not data['coverage']['CI11']['newJoinedCallerImplemented']
    assert not data['coverage']['CI12']['registryCursorOrP4JoinImplemented']
    assert [f['curve'] for f in data['fixture']['fixtures']] == ['p256', 'secp256k1']
    assert all(len(f['blocks']) == 139 for f in data['fixture']['fixtures'])
    first = consumers[0]
    for result in consumers:
        assert len(result['cases']) == 24 and len(result['legacyCases']) == 20 and len(result['proofCases']) == 51
        assert result['cases'] == first['cases'] and result['legacyCases'] == first['legacyCases'] and result['proofCases'] == first['proofCases']
        assert result['outputs'] == first['outputs'] == m['sameOutputCarHashes']
        assert result['unobservable'] == {'hashCalls': None, 'peakMemoryBytes': None, 'allocations': None}
        assert not result['fullP2Complete']
        assert [row['responseBlocks'] for row in result['work']] == [64, 64, 10, 64, 64, 10]
        assert all(row['retainedBlocks'] == 139 and row['outputBlocks'] == row['responseBlocks'] + 1 for row in result['work'])
    assert len(first['outputs']) == 8
    assert next(row for row in first['outputs'] if row['name'] == 'framed-16MiB')['bytes'] == 16 * 1024 * 1024
    assert next(row for row in first['outputs'] if row['name'] == '65-unique-with-commit')['blocks'] == 65
    for index, version in enumerate(['v22.19.0', 'v24.21.0', 'v26.10.0']):
        compiled = consumers[index * 2 + 1]
        assert compiled['node'] == version == data['builds'][index]['node']
        assert compiled['fixtureSha256'] == sha((PACKET / 'final/fixtures.json').read_bytes())
        production = {row['path']: row['sha256'] for row in compiled['actualProductionModules']}
        assert 'dist/src/protocol/native-observer-car.js' in production and 'dist/src/protocol/native-proof.js' in production
        assert all(data['builds'][index]['outputHashes'][path] == checksum for path, checksum in production.items())
        for path, row in compiled['compiledTests'].items():
            assert m['sourceInputs'][path] == row['sourceSha256']
            assert sha(row['output'].encode()) == row['outputSha256']
            assert not re.search(r"/src/[^'\"\n]+\.ts", row['output'])
    chrome = consumers[-1]
    assert chrome['actualBrowserExecution'] and not chrome['hostObserverInBrowser'] and not chrome['providerTrial']
    bundle = gzip.decompress((PACKET / 'final/chromium-bundle.js.gz').read_bytes())
    assert sha(bundle) == chrome['bundleSha256'] and len(bundle) == chrome['bundleBytes']
    assert chrome['sharedPublicFixtures'] == data['fixture']


def self_test(data):
    controls = [
        ('wrong producer', lambda d: d['manifest'].__setitem__('runtimeProducer', '0' * 40)),
        ('full P2 claim', lambda d: d['manifest'].__setitem__('fullP2Complete', True)),
        ('unearned review claim', lambda d: d['manifest'].__setitem__('independentImplementationReviewComplete', True)),
        ('missing production pin', lambda d: d['manifest']['sourceInputs'].pop('src/protocol/native-observer-car.ts')),
        ('failed actual command', lambda d: d['commands'][0].__setitem__('exitCode', 1)),
        ('dropped original obligation', lambda d: d['original']['obligations'].pop()),
        ('dropped historical vector', lambda d: d['original']['vectors'].pop()),
        ('invented provider trial', lambda d: d['coverage'].__setitem__('providerTrial', True)),
        ('unimplemented joined caller', lambda d: d['coverage']['CI11'].__setitem__('newJoinedCallerImplemented', True)),
        ('changed output CAR digest', lambda d: d['consumers'][1]['outputs'][0].__setitem__('sha256', '0' * 64)),
        ('dropped legacy case', lambda d: d['consumers'][0]['legacyCases'].pop()),
        ('invented zero hash work', lambda d: d['consumers'][0]['unobservable'].__setitem__('hashCalls', 0)),
        ('changed emitted code', lambda d: next(iter(d['consumers'][1]['compiledTests'].values())).__setitem__('outputSha256', '0' * 64)),
        ('wrong browser execution hash', lambda d: d['consumers'][-1].__setitem__('bundleSha256', '0' * 64)),
    ]
    for name, mutate in controls:
        damaged = copy.deepcopy(data)
        mutate(damaged)
        try:
            validate(damaged)
        except (AssertionError, KeyError):
            continue
        raise AssertionError('Negative control accepted: ' + name)
    return len(controls)


parser = argparse.ArgumentParser()
parser.add_argument('--repo', default=str(Path.cwd()))
parser.add_argument('--self-test', action='store_true')
args = parser.parse_args()
data = load()
validate(data)
m = data['manifest']
for relative, checksum in m['files'].items():
    assert sha((PACKET / relative).read_bytes()) == checksum, relative
for path, checksum in m['sourceInputs'].items():
    assert sha(subprocess.check_output(['git', '-C', args.repo, 'show', m['runtimeProducer'] + ':' + path])) == checksum, path
for row in data['adopted']['files']:
    assert sha((PACKET / row['capture']).read_bytes()) == row['sha256']
    assert sha(subprocess.check_output(['git', '-C', args.repo, 'show', row['sourceCommit'] + ':' + row['sourcePath']])) == row['sha256']
for row in data['commands']:
    relative = Path(row['log']).relative_to('.atseq-local/p2-car-intake/final')
    assert sha((PACKET / 'final' / relative).read_bytes()) == row['logSha256']
for label in ['22', '24', '26']:
    check = (PACKET / ('final/node' + label + '-check.log')).read_text()
    assert 'All matched files use Prettier code style!' in check
    assert 'Every source layer, portable import and wire identity checked.' in check
    assert 'Installed runtime closure, dependency edges and integrity pins match reviewed provenance.' in check
    assert 'pass 5' in (PACKET / ('final/node' + label + '-source.log')).read_text()
    assert 'pass 3' in (PACKET / ('final/node' + label + '-dist-limits.log')).read_text()
    assert '30000' in (PACKET / ('final/node' + label + '-dist-limits.log')).read_text()
report = subprocess.check_output(['git', '-C', args.repo, 'show', 'HEAD:' + m['report']['path']]) if not (Path(args.repo) / m['report']['path']).exists() else (Path(args.repo) / m['report']['path']).read_bytes()
assert sha(report) == m['report']['sha256']
controls = self_test(data) if args.self_test else 0
print(json.dumps({'verified': True, 'sourcePins': len(m['sourceInputs']), 'captures': len(m['files']),
                  'commands': len(data['commands']), 'consumers': len(data['consumers']),
                  'negativeControls': controls, 'fullP2Complete': False}))
