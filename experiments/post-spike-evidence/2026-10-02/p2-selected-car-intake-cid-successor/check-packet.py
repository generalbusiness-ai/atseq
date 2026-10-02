"""Verify compressed actual captures, frozen predecessor, exact source pins and substantive controls."""
from pathlib import Path
import argparse
import copy
import gzip
import hashlib
import json
import re
import subprocess

PACKET = Path(__file__).resolve().parent
ROOT = PACKET.parents[3]
sha = lambda raw: hashlib.sha256(raw).hexdigest()
m = json.loads((PACKET / 'manifest.json').read_text())


def raw(relative):
    row = m['captures'][relative]
    saved = (PACKET / row['path']).read_bytes()
    assert sha(saved) == row['savedSha256']
    value = gzip.decompress(saved) if row['gzip'] else saved
    assert sha(value) == row['rawSha256'] and len(value) == row['rawBytes']
    return value


def load(relative):
    return json.loads(raw(relative))


data = {'manifest': m, 'commands': load('commands.json'), 'comparison': load('comparison.json'),
        'fixture': load('fixtures.json'), 'consumers': [], 'builds': []}
for label, version in [('22', '22.19.0'), ('24', '24.21.0'), ('26', '26.10.0')]:
    data['consumers'] += [load('node' + label + '/source-' + version + '.json'), load('node' + label + '/compiled.json')]
    data['builds'].append(load('node' + label + '/build-provenance.json'))
data['consumers'].append(load('chromium.json'))
old = ROOT / 'experiments/post-spike-evidence/2026-10-02/p2-selected-car-intake'
old_outputs = json.loads((old / 'final/comparison.json').read_text())['outputs']


def validate(d):
    manifest, consumers = d['manifest'], d['consumers']
    assert manifest['runtimeProducer'] == 'ce54f1118bbfd928052cd5eb76551cb62b4b01f8'
    assert manifest['predecessor'] == 'f45521cdbcdf8ceac2270db4c852379cf9299375'
    assert manifest['actualCommands'] == len(d['commands']) == 19
    assert all(row['producer'] == manifest['runtimeProducer'] and row['exitCode'] == 0 for row in d['commands'])
    assert not manifest['fixturesRegenerated'] and not manifest['oldLimitGatesRerun']
    assert not manifest['fullP2Complete'] and not manifest['independentImplementationReviewComplete']
    assert 'src/protocol/native-observer-car.ts' in manifest['sourceInputs']
    assert manifest['physicalPackages'] == 194 and manifest['physicalFiles'] == 14234
    assert len(consumers) == manifest['actualConsumers'] == 7
    assert d['comparison']['fixtureBytesUnchanged'] and d['comparison']['validOutputHashesUnchanged']
    assert d['fixture'] == json.loads((old / 'final/fixtures.json').read_text())
    for result in consumers:
        assert len(result['cases']) == 24 and len(result['legacyCases']) == 20 and len(result['proofCases']) == 51
        assert result['cases'] == consumers[0]['cases'] and result['legacyCases'] == consumers[0]['legacyCases'] and result['proofCases'] == consumers[0]['proofCases']
        assert result['outputs'] == old_outputs
        assert result['unobservable'] == {'hashCalls': None, 'peakMemoryBytes': None, 'allocations': None}
        assert not result['fullP2Complete']
    for index, version in enumerate(['v22.19.0', 'v24.21.0', 'v26.10.0']):
        compiled, build = consumers[index * 2 + 1], d['builds'][index]
        assert compiled['node'] == build['node'] == version
        assert len(build['sourceHashes']) == manifest['actualBuildSources'] == 146
        assert len(build['outputHashes']) == manifest['actualBuildOutputs'] == 472
        assert compiled['fixtureSha256'] == sha((old / 'final/fixtures.json').read_bytes())
        production = {row['path']: row['sha256'] for row in compiled['actualProductionModules']}
        assert 'dist/src/protocol/native-observer-car.js' in production
        assert all(build['outputHashes'][path] == value for path, value in production.items())
        for path, row in compiled['compiledTests'].items():
            assert row['sourceSha256'] == manifest['sourceInputs'][path]
            assert sha(row['output'].encode()) == row['outputSha256']
            assert not re.search(r"/src/[^'\"\n]+\.ts", row['output'])
    chrome = consumers[-1]
    assert chrome['actualBrowserExecution'] and not chrome['providerTrial']
    assert chrome['sharedPublicFixtures'] == d['fixture']
    bundle = raw('chromium-bundle.js')
    assert sha(bundle) == chrome['bundleSha256'] and len(bundle) == chrome['bundleBytes']


parser = argparse.ArgumentParser()
parser.add_argument('--repo', default=str(ROOT))
parser.add_argument('--self-test', action='store_true')
args = parser.parse_args()
validate(data)
for relative in m['captures']:
    raw(relative)
for relative, value in m['files'].items():
    assert sha((PACKET / relative).read_bytes()) == value
for path, value in m['sourceInputs'].items():
    assert sha(subprocess.check_output(['git', '-C', args.repo, 'show', m['runtimeProducer'] + ':' + path])) == value
for path, value in m['predecessorFiles'].items():
    assert sha((ROOT / path).read_bytes()) == value
    assert sha(subprocess.check_output(['git', '-C', args.repo, 'show', m['predecessor'] + ':' + path])) == value
for row in data['commands']:
    relative = str(Path(row['log']).relative_to('.atseq-local/p2-car-intake/cid-successor'))
    assert sha(raw(relative)) == row['logSha256']
for label in ['22', '24', '26']:
    text = raw('node' + label + '-check.log').decode()
    for message in ['All matched files use Prettier code style!', 'Every source layer, portable import and wire identity checked.', 'Installed runtime closure, dependency edges and integrity pins match reviewed provenance.']:
        assert message in text
    assert 'pass 2' in raw('node' + label + '-source.log').decode()
    compiler = raw('node' + label + '-compiler-inputs.log').decode()
    for path in ['tests/support/native-car-intake.ts', 'tests/native-car-intake.test.ts', 'tests/native-car-intake-browser.test.ts', 'experiments/p2-car-intake/prepare.ts']:
        assert path in compiler
assert raw('fixtures.json') == (old / 'final/fixtures.json').read_bytes()
assert sha((ROOT / m['report']['path']).read_bytes()) == m['report']['sha256']
count = 0
if args.self_test:
    controls = [
        ('wrong producer', lambda d: d['manifest'].__setitem__('runtimeProducer', '0' * 40)),
        ('failed gate', lambda d: d['commands'][0].__setitem__('exitCode', 1)),
        ('unearned full P2', lambda d: d['manifest'].__setitem__('fullP2Complete', True)),
        ('unearned review', lambda d: d['manifest'].__setitem__('independentImplementationReviewComplete', True)),
        ('regenerated fixture claim', lambda d: d['manifest'].__setitem__('fixturesRegenerated', True)),
        ('wrong past gate attribution', lambda d: d['manifest'].__setitem__('oldLimitGatesRerun', True)),
        ('changed valid output', lambda d: d['consumers'][1]['outputs'][0].__setitem__('sha256', '0' * 64)),
        ('missing old CAR predicate', lambda d: d['consumers'][0]['legacyCases'].pop()),
        ('invented hash counter', lambda d: d['consumers'][0]['unobservable'].__setitem__('hashCalls', 0)),
        ('wrong emitted test code', lambda d: next(iter(d['consumers'][1]['compiledTests'].values())).__setitem__('outputSha256', '0' * 64)),
        ('wrong executed bundle', lambda d: d['consumers'][-1].__setitem__('bundleSha256', '0' * 64)),
        ('missing production pin', lambda d: d['manifest']['sourceInputs'].pop('src/protocol/native-observer-car.ts')),
    ]
    for name, mutate in controls:
        damaged = copy.deepcopy(data)
        mutate(damaged)
        try:
            validate(damaged)
        except (AssertionError, KeyError):
            count += 1
            continue
        raise AssertionError('Negative control accepted: ' + name)
print(json.dumps({'verified': True, 'sourcePins': len(m['sourceInputs']), 'captures': len(m['captures']),
    'retainedPredecessorFiles': len(m['predecessorFiles']), 'actualCommands': len(data['commands']),
    'negativeControls': count, 'fullP2Complete': False}))
