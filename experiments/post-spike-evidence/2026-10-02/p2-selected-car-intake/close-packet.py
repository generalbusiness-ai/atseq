"""Archive the actual frozen-source matrix without rerunning or relabelling earlier captures."""
from pathlib import Path
import gzip
import hashlib
import json
import os
import shutil
import subprocess

ROOT = Path.cwd()
PACKET = ROOT / 'experiments/post-spike-evidence/2026-10-02/p2-selected-car-intake'
LOCAL = ROOT / '.atseq-local/p2-car-intake'
PRODUCER = 'bf290d7018060e4a2ecc1fd0d3964f6eedceaec0'
BASIS = '87eec6aa872ce7acc58dc641f8e84f47ca7bbbb1'
REPORT = 'notes/2026-10-02-atseq-selected-car-intake-results.md'
sha = lambda raw: hashlib.sha256(raw).hexdigest()
for source in sorted((LOCAL / 'final').rglob('*')):
    if not source.is_file():
        continue
    target = PACKET / 'final' / source.relative_to(LOCAL / 'final')
    target.parent.mkdir(parents=True, exist_ok=True)
    if source.name == 'chromium-bundle.js':
        target.with_suffix('.js.gz').write_bytes(gzip.compress(source.read_bytes(), mtime=0))
    else:
        shutil.copyfile(source, target)
fail = PACKET / 'development'
fail.mkdir(exist_ok=True)
for name in ['draft-conformance.log', 'draft-conformance-2.log']:
    shutil.copyfile(LOCAL / name, fail / name)
shutil.copyfile(ROOT / '.atseq-local/p2-intake-draft-typecheck.log', fail / 'initial-typecheck.log')
for name in ['failed-draft-1', 'failed-draft-2']:
    shutil.copytree(LOCAL / name, fail / name, dirs_exist_ok=True)
shutil.copyfile(LOCAL / 'fixtures.json', fail / 'initial-public-fixtures.json')
(fail / 'attribution.json').write_text(json.dumps({
    'initialTypecheck': {'uncommittedDraft': True, 'fullOriginalTestSourceCaptured': False,
                         'diagnosticsRetained': True, 'productionModuleMatchesFinal': True},
    'runtimeDraft1': {'sourceSnapshot': 'failed-draft-1/attribution.json', 'expectedPrefixErrorCodeWrong': True},
    'runtimeDraft2': {'sourceSnapshot': 'failed-draft-2/attribution.json', 'expectedCaseCountWrong': True},
    'preparedFixture': {'uncommittedDraft': True, 'generationFunctionCapturedIn': 'failed-draft-1/native-car-intake.ts'},
    'setupReadErrors': ['Initial log redirection preceded mkdir; no compiler execution.',
                       'Adopted-source copy requested nonexistent source-pins.json; actual source-inspection.json copied instead.'],
    'approvalRequested': False,
}, indent=2) + '\n')
commands = json.loads((PACKET / 'final/commands.json').read_text())
assert len(commands) == 23 and all(row['exitCode'] == 0 and row['producer'] == PRODUCER for row in commands)
comparison = json.loads((PACKET / 'final/comparison.json').read_text())
assert comparison['producer'] == PRODUCER and comparison['consumers'] == 7
source = set()
for label in ['22', '24', '26']:
    paths = (PACKET / ('final/node' + label + '-compiler-inputs.log')).read_text().splitlines()
    live = sorted(path.removeprefix(str(ROOT) + '/') for path in paths
                  if path.startswith(str(ROOT) + '/') and '/node_modules/' not in path
                  and path.removeprefix(str(ROOT) + '/').split('/')[0] in ['src', 'scripts', 'tests', 'experiments'])
    if label == '22':
        expected_live = live
    assert live == expected_live
    source.update(live)
    build = json.loads((PACKET / ('final/node' + label + '/build-provenance.json')).read_text())
    assert build['node'] == {'22': 'v22.19.0', '24': 'v24.21.0', '26': 'v26.10.0'}[label]
    source.update(build['sourceHashes'])
    for path, checksum in build['sourceHashes'].items():
        assert sha(subprocess.check_output(['git', 'show', PRODUCER + ':' + path])) == checksum
    if label == '22':
        expected_build = build
    assert build['sourceHashes'] == expected_build['sourceHashes']
    assert set(build['outputHashes']) == set(expected_build['outputHashes'])
    differences = [path for path, checksum in expected_build['outputHashes'].items()
                   if build['outputHashes'][path] != checksum]
    assert differences == ([] if label == '22' else ['dist/shell/build-provenance.json', 'dist/shell/shell-manifest.json'])
for prefix in ['scripts', 'experiments/p2-car-intake']:
    source.update(subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', PRODUCER, '--', prefix], text=True).splitlines())
source = {path: sha(subprocess.check_output(['git', 'show', PRODUCER + ':' + path])) for path in sorted(source)}
for path, checksum in source.items():
    assert sha((ROOT / path).read_bytes()) == checksum
physical = json.loads(gzip.decompress((PACKET / 'physical-runtime.json.gz').read_bytes()))
files, links = {}, {}
assert not (ROOT / 'node_modules').is_symlink()
for package in physical['packages']:
    location = ROOT / package['path']
    assert not location.is_symlink()
    assert sha((location / 'package.json').read_bytes()) == package['packageJsonSha256']
    for current, dirs, names in os.walk(location):
        for name in names:
            path = Path(current) / name
            relative = str(path.relative_to(ROOT))
            if path.is_symlink():
                links[relative] = os.readlink(path)
            else:
                files[relative] = sha(path.read_bytes())
assert files == physical['fileHashes'] and links == physical['links']
(PACKET / 'physical-verification.json').write_text(json.dumps({
    'packages': physical['count'], 'actualFileHashesVerified': len(files),
    'rootSymlink': False, 'packageRootSymlinks': False,
    'graphReferenceDelivery': '2395c470283111e4817dde1342e973edd5e4e419',
    'actualNewPrivateTreeWalked': True, 'runtimeGraphChanged': False,
}, indent=2) + '\n')
actual_build = json.loads((PACKET / 'final/node26/build-provenance.json').read_text())
for path, checksum in actual_build['outputHashes'].items():
    assert sha((ROOT / path).read_bytes()) == checksum
(PACKET / 'actual-build-outputs.json').write_text(json.dumps(actual_build['outputHashes'], indent=2) + '\n')
(PACKET / 'build-output-comparison.json').write_text(json.dumps({
    'sourceHashesEqual': True, 'productionModuleAndBundleHashesEqual': True,
    'differingRuntimeLabelledMetadata': ['dist/shell/build-provenance.json', 'dist/shell/shell-manifest.json'],
    'allBuildHashRecordsRetained': True, 'allCurrentNode26OutputFilesIndependentlyHashed': True,
    'earlierNode22And24ShellMetadataBytesRetained': False,
}, indent=2) + '\n')
obligations = json.loads((PACKET / 'adopted/original-p2-vectors.json').read_text())
assert len(obligations['obligations']) == 12 and len(obligations['vectors']) == 36
coverage = {
    'helperVectors': ['CI' + str(i) for i in range(1, 11)],
    'CI11': {'existingObserverSourceAndCompiledGatesExecuted': True, 'newJoinedCallerImplemented': False},
    'CI12': {'byteBrandRefusalAndExistingPrefixFloorGuardExecuted': True, 'registryCursorOrP4JoinImplemented': False},
    'PXVectorsOwnedByOtherChild': True,
    'originalFullP2Obligations': obligations['obligations'],
    'historicalVectors': 36, 'historicalVectorStatusesRewritten': False,
    'fullP2Complete': False, 'nativePersistenceExecuted': False,
    'checkpointAuditExecuted': False, 'providerTrial': False,
    'N100100010000PerformanceMatrixExecuted': False,
}
(PACKET / 'coverage.json').write_text(json.dumps(coverage, indent=2) + '\n')
changed = subprocess.check_output(['git', 'diff', '--name-only', BASIS, PRODUCER], text=True).splitlines()
assert len(changed) == 7 and [path for path in changed if path.startswith('src/')] == ['src/protocol/native-observer-car.ts']
manifest = {
    'schema': 'atseq-p2-selected-car-intake-results-v1',
    'request': '8ae492b28309e9c143eb63e22c34edbebbe0d0a2',
    'promise': '1a4adfe4f02ad40a0577b0f273257228723584b0',
    'sourceAdoption': '97be58fccdd42286efa5feb38796f5791aa989b0',
    'adoptedCandidate': 'e08c10f38f60cc2b7cbac8fa2398cb333874090a',
    'basis': BASIS, 'runtimeProducer': PRODUCER, 'runtimeDeliveryFiles': changed,
    'sourceInputs': source, 'compilerLiveInputs': expected_live,
    'actualBuildSources': len(expected_build['sourceHashes']), 'actualBuildOutputs': len(expected_build['outputHashes']),
    'physicalPackages': physical['count'], 'physicalFiles': len(files),
    'actualCommands': 23, 'actualConsumers': 7, 'sameOutputCarHashes': comparison['outputs'],
    'fullP2Complete': False, 'independentImplementationReviewComplete': False,
    'report': {'path': REPORT, 'sha256': sha((ROOT / REPORT).read_bytes())},
    'files': {str(path.relative_to(PACKET)): sha(path.read_bytes()) for path in sorted(PACKET.rglob('*'))
              if path.is_file() and str(path.relative_to(PACKET)) not in ['manifest.json', 'delivery-list.json']},
}
delivery = set(changed + [REPORT])
delivery.update(str(path.relative_to(ROOT)) for path in PACKET.rglob('*') if path.is_file())
delivery.update(str((PACKET / name).relative_to(ROOT)) for name in ['manifest.json', 'delivery-list.json'])
(PACKET / 'delivery-list.json').write_text(json.dumps({'basis': BASIS, 'paths': sorted(delivery)}, indent=2) + '\n')
(PACKET / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps({'producer': PRODUCER, 'captures': len(manifest['files']), 'sourcePins': len(source),
                  'compilerLiveInputs': len(expected_live), 'buildSources': manifest['actualBuildSources'],
                  'buildOutputs': manifest['actualBuildOutputs'], 'physicalPackages': physical['count'],
                  'physicalFiles': len(files), 'deliveryPaths': len(delivery)}))
