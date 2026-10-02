#!/usr/bin/env python3
"""Check retained C1-F1 execution evidence; never construct expected application state."""
from pathlib import Path
import copy
import gzip
import hashlib
import json
import re
import subprocess

PACKET = Path(__file__).resolve().parent
ROOT = PACKET.parents[3]
ORACLE_SHA = 'f7c6d9c3740208973de828da976107b32a6107ad3c62085412476fdbb2e874e6'
ORACLE_BYTES = 8371247
VERSIONS = {'node22': 'v22.19.0', 'node24': 'v24.21.0', 'node26': 'v26.10.0'}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def require(value, message):
    if not value:
        raise AssertionError(message)


def read(name):
    return json.loads((PACKET / name).read_text())


def git(head, path):
    return subprocess.check_output(['git', 'show', head + ':' + path], cwd=ROOT)


def matrix(captures, pins):
    def capture(name):
        return json.loads(captures[name])
    for phase, head in [('before', pins['basis']), ('after', pins['productionProducer'])]:
        start = capture(phase + '/source-at-start.json')
        run = capture(phase + '/run.json')
        require(start['head'] == head == run['head'], phase + ' exact producer')
        require(run['runtimeTestsRun'] is True and run['fixtureSha256'] == ORACLE_SHA, phase + ' executed oracle gate')
        require(len(run['rows']) == 8 and all(row['exitCode'] == 0 for row in run['rows']), phase + ' eight actual passing commands')
        require({row['name'] for row in run['rows']} == {'build', 'chromium'} | {tag + '/' + kind for tag in VERSIONS for kind in ['source', 'compiled']}, phase + ' complete command set')
        require(all(row['fixturePath'] == '/private/tmp/atseq-c1-f1-oracle-20261002.json' for row in run['rows']), phase + ' frozen environment seam')
        provenance = capture(phase + '/build-provenance.json')
        require(provenance['format'] == 'atseq-package-build-provenance' and provenance['node'] == VERSIONS['node26'], phase + ' actual build')
        for path, expected in start['files'].items():
            require(sha(git(head, path)) == expected, phase + ' captured source ' + path)
        for tag, version in VERSIONS.items():
            source = capture(phase + '/' + tag + '/source/result.json')
            compiled = capture(phase + '/' + tag + '/compiled/result.json')
            require(source['node'] == compiled['node'] == version, phase + ' actual ' + tag)
            require(len(source['cases']) == 58 and len(set(source['cases'])) == 58 and len(source['faults']) == 24, phase + ' source 58/24')
            require(source['fixtureVectors'] == 40, phase + ' R1 oracle vectors')
            require(compiled['cases'] == source['cases'] and compiled['fixtureSha256'] == ORACLE_SHA and compiled['fixtureBytes'] == ORACLE_BYTES, phase + ' emitted 58/oracle')
            require(capture(phase + '/' + tag + '/source/faults.json') == source['faults'], phase + ' actual fault capture')
            require(len(compiled['actualProductionModules']) == 8 and any(row['path'] == 'dist/src/application/native-authority.js' for row in compiled['actualProductionModules']), phase + ' actual emitted application')
            for module in compiled['actualProductionModules']:
                require(provenance['outputHashes'][module['path']] == module['sha256'], phase + ' emitted/build agreement')
            fixture = captures[phase + '/' + tag + '/source/fixture.json']
            require(len(fixture) == ORACLE_BYTES and sha(fixture) == ORACLE_SHA, phase + ' exact retained oracle bytes')
        chrome = capture(phase + '/chromium/result.json')
        reference = capture(phase + '/node26/source/result.json')
        require(chrome['chromium'] == '153.0.8010.12' and chrome['node'] == VERSIONS['node26'], phase + ' actual Chromium')
        require(chrome['cases'] == reference['cases'] and chrome['faults'] == reference['faults'], phase + ' Chrome 58/24 agreement')
        require(chrome['fixtureBytes'] == ORACLE_BYTES and chrome['fixtureSha256'] == ORACLE_SHA, phase + ' Chrome oracle')
        bundle = captures[phase + '/chromium/fault-bundle.mjs']
        require(sha(bundle) == chrome['faultBundleSha256'] and len(bundle) == chrome['faultBundleBytes'], phase + ' retained transformed bundle')
        require(b'__nativeApplicationFoldFault' in bundle and b'__nativeApplicationStoredFault' in bundle, phase + ' actual fault transforms')
        for tag in VERSIONS:
            require(captures[phase + '/' + tag + '/source/fault-bundle.mjs'] == bundle, phase + ' same transformed source/browser fault bundle')
    for tag in VERSIONS:
        require(capture('before/' + tag + '/source/result.json') == capture('after/' + tag + '/source/result.json'), tag + ' byte-equivalent before/after case/fault JSON')
        before = capture('before/' + tag + '/compiled/result.json')
        after = capture('after/' + tag + '/compiled/result.json')
        for field in ['node', 'cases', 'fixtureBytes', 'fixtureSha256']:
            require(before[field] == after[field], tag + ' unchanged emitted behavior')
    for field in ['node', 'chromium', 'cases', 'faults', 'fixtureBytes', 'fixtureSha256']:
        require(capture('before/chromium/result.json')[field] == capture('after/chromium/result.json')[field], 'unchanged Chrome behavior ' + field)
    b = capture('before/build-provenance.json')
    a = capture('after/build-provenance.json')
    require(b['semanticContracts'] == a['semanticContracts'], 'semantic contracts unchanged')
    require({path for path in b['sourceHashes'] if b['sourceHashes'][path] != a['sourceHashes'][path]} == {'src/application/native-authority.ts', 'src/runtime/evaluator.ts'}, 'only two production source changes')
    faults = capture('after/node26/source/faults.json')
    require(sum(row.startswith('actual designated fold callsite ') for row in faults) == 15, '15 exact evaluator stage fault cases')
    require(sum(row.startswith('non-designated constructor/code escapes ') for row in faults) == 4, 'four identity/code escape cases')
    require(sum(row.startswith('same typed fold code from stored-state wrong callsite ') for row in faults) == 3, 'three stored-state wrong-callsite cases')
    require(len(faults[-2:]) == 2 and faults[-1].startswith('durable success then stale base poisons'), 'two coordinator stale/poison cases')
    comparison = capture('comparison.json')
    require(comparison['transformedFaultsAreCompiledProduction'] is False and comparison['newDiscoverySimulationHostImportCallers'] is False, 'honest transformed/production and scope distinction')
    measurement_cases = capture('after/measurement/node26/source/result.json')['cases']
    require(len(measurement_cases) == 4, 'four internal fold probes')
    require([(row['steps'], row['inspectedBytes']) for row in measurement_cases[:2]] == [(13, 122), (7, 113)], 'actual measured counters')
    require(all(row['failure'] == 'fold_output' and row['evaluation'] is None for row in measurement_cases[2:]), 'thrown counters unavailable')
    for tag, version in VERSIONS.items():
        source = capture('after/measurement/' + tag + '/source/result.json')
        compiled = capture('after/measurement/' + tag + '/compiled.json')
        require(source['node'] == compiled['node'] == version and source['chromium'] == '153.0.8010.12', tag + ' measured source/emitted/Chrome environments')
        require(source['cases'] == compiled['cases'] == measurement_cases, tag + ' measured byte agreement')
        bundle = captures['after/measurement/' + tag + '/source/bundle.mjs']
        require(sha(bundle) == source['bundleSha256'] and len(bundle) == source['bundleBytes'], tag + ' measured browser bundle')
        require(any(row['path'] == 'dist/src/runtime/evaluator.js' for row in compiled['actualProductionModules']), tag + ' actual emitted measured helper')
        for module in compiled['actualProductionModules']:
            require(a['outputHashes'][module['path']] == module['sha256'], tag + ' measured emitted/build agreement')
        rows = capture('after/measurement/' + tag + '/run.json')
        require(len(rows) == 2 and all(row['exitCode'] == 0 for row in rows), tag + ' measured commands passed')
    checks = capture('after/checks.json')
    require(checks['check']['exitCode'] == checks['shared']['exitCode'] == 0 and checks['shared']['tests'] == 82, 'appropriate checks/shared tests passed')
    require(checks['check']['firstAttemptExitCode'] == 1 and b'Cannot find module' in captures['after/check.log'], 'initial dependency failure retained')
    require(b'All matched files use Prettier code style!' in captures['after/check-private-pds-correction.log'], 'corrective check retained')
    require(b'pass 82' in captures['after/shared-runtime-native.log'] and b'fail 0' in captures['after/shared-runtime-native.log'], '82 actual shared test log')


def main():
    manifest = read('manifest.json')
    for row in manifest['files']:
        data = (ROOT / row['path']).read_bytes()
        require(len(data) == row['bytes'] and sha(data) == row['sha256'], 'delivery hash ' + row['path'])
    expected_files = {row['path'] for row in manifest['files']} | {str((PACKET / 'manifest.json').relative_to(ROOT))}
    actual_files = {str(path.relative_to(ROOT)) for path in PACKET.rglob('*') if path.is_file()} | {'notes/2026-10-02-atseq-native-action-extraction-results.md'}
    require(expected_files == actual_files, 'exact packet/note inventory')
    pins = read('source-pins.json')
    for row in pins['files']:
        data = git(row['head'], row['path'])
        require(len(data) == row['bytes'] and sha(data) == row['sha256'], 'exact Git source pin ' + row['path'])
        if row['currentMustMatch']:
            require((ROOT / row['path']).read_bytes() == data, 'current/source pin ' + row['path'])
    captures = {}
    for row in read('capture-inventory.json')['files']:
        data = (PACKET / row['path']).read_bytes()
        if row['encoding'] == 'gzip':
            data = gzip.decompress(data)
        else:
            require(row['encoding'] == 'identity', 'closed evidence encoding')
        require(len(data) == row['bytes'] and sha(data) == row['sha256'], 'capture decoded hash ' + row['capture'])
        require(row['capture'] not in captures, 'unique capture path')
        captures[row['capture']] = data
    oracle = read('oracle-freeze.json')
    require(oracle['frozenBeforeSourceEdits'] is True and oracle['currentR1Clean'] is True and oracle['decodedBytes'] == ORACLE_BYTES and oracle['decodedSha256'] == ORACLE_SHA, 'pre-edit oracle freeze')
    original = git(pins['reviewedR1'], 'experiments/post-spike-evidence/2026-10-02/native-prefix/fixtures/application.json.gz')
    require(sha(original) == oracle['gzipSha256'] and sha(gzip.decompress(original)) == ORACLE_SHA, 'retained reviewed oracle')
    matrix(captures, pins)
    for phase, head in [('before', pins['basis']), ('after', pins['productionProducer'])]:
        provenance = json.loads(captures[phase + '/build-provenance.json'])
        for path, expected in provenance['sourceHashes'].items():
            require(sha(git(head, path)) == expected, phase + ' full 145-file build source closure ' + path)
    authority = (ROOT / 'src/application/native-authority.ts').read_text()
    evaluator = (ROOT / 'src/runtime/evaluator.ts').read_text()
    measured = evaluator.split('export async function foldEvaluation(')[1].split('export async function fold(')[0]
    require(measured.count('await evaluate(') == 1, 'one actual engine evaluation in measured fold')
    action = authority.split('  async #action(')[1].split('  #projection(')[0]
    require(action.count('await foldEvaluation(') == 1 and action.count('this.#same(base)') == 1, 'one private fold and retained post-await ownership guard')
    require(len(re.findall(r'#action\(', authority)) == 2 and len(re.findall(r'#actionGate\(', authority)) == 2, 'one private ordinary caller and one private gate')
    for stage in ['inputSchema', 'evaluateAndFold', 'successorState']:
        require('NATIVE_FOLD_FAILURE_STAGES.' + stage in action, 'same stage-specific catches ' + stage)
    require('nativeFoldMetadata(data.entry)' in authority and 'evaluation: null' in action, 'owned five-field metadata and unavailable counters')
    scope = read('scope.json')
    require(scope['fullC1Closed'] is False and scope['newProductionCallers'] is False and scope['publicExportsChanged'] is False, 'foundation-only scope')
    changed = subprocess.check_output(['git', 'diff', '--name-only', pins['basis'], 'HEAD'], cwd=ROOT, text=True).splitlines()
    allowed = set(scope['allowedProductionPaths'] + scope['allowedTestPaths'] + [scope['requiredNote']])
    require(all(path in allowed or path.startswith(str(PACKET.relative_to(ROOT)) + '/') for path in changed), 'exact implementation/delivery scope')
    decision = read('internal-decision.json')['structuredContent']
    require(decision['decision']['verdict'] == 'effective' and decision['event'].endswith(scope['decision']), 'effective internal helper decision')
    negatives = [
        ('missing portable case', 'after/node22/source/result.json', lambda x: x['cases'].pop()),
        ('missing fault case', 'after/node24/source/result.json', lambda x: x['faults'].pop()),
        ('invented runtime pass', 'after/run.json', lambda x: x.update(runtimeTestsRun=False)),
        ('wrong producer', 'before/source-at-start.json', lambda x: x.update(head=pins['productionProducer'])),
        ('changed frozen fixture hash', 'after/node26/compiled/result.json', lambda x: x.update(fixtureSha256='0' * 64)),
        ('wrong emitted production bytes', 'after/node22/compiled/result.json', lambda x: x['actualProductionModules'][0].update(sha256='0' * 64)),
        ('missing Chrome fault', 'after/chromium/result.json', lambda x: x['faults'].pop()),
        ('fabricated evaluator zero', 'after/measurement/node26/source/result.json', lambda x: x['cases'][0].update(steps=0)),
        ('fabricated thrown counters', 'after/measurement/node24/compiled.json', lambda x: x['cases'][2].update(evaluation={'steps': 0, 'inspectedBytes': 0})),
        ('fault bundle called production', 'comparison.json', lambda x: x.update(transformedFaultsAreCompiledProduction=True)),
        ('hidden check failure', 'after/checks.json', lambda x: x['check'].update(exitCode=1)),
    ]
    for name, path, mutate in negatives:
        candidate = dict(captures)
        value = json.loads(candidate[path])
        mutate(value)
        candidate[path] = json.dumps(value).encode()
        try:
            matrix(candidate, pins)
        except AssertionError:
            continue
        raise AssertionError('Negative control accepted: ' + name)
    print(json.dumps({'gitSourcePins': len(pins['files']), 'deliveryHashes': len(manifest['files']), 'decodedCaptures': len(captures), 'buildSourcePins': 290, 'portableCasesPerEnvironment': 58, 'faultCasesPerSourceBrowserEnvironment': 24, 'compiledCasesPerNode': 58, 'internalCounterCasesPerEnvironment': 4, 'sharedTests': 82, 'negativeControlsRejected': len(negatives), 'runtimeEvidenceVerified': True, 'newProductionCallers': False, 'fullC1Closed': False}, indent=2))


if __name__ == '__main__':
    main()
