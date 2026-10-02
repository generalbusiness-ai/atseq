"""Close the attributed owned-request-length successor, keeping every predecessor capture byte unchanged."""
from pathlib import Path
import gzip
import hashlib
import json
import os
import subprocess

ROOT = Path.cwd()
PACKET = ROOT / 'experiments/post-spike-evidence/2026-10-02/p2-selected-car-intake-length-successor'
OLD = ROOT / 'experiments/post-spike-evidence/2026-10-02/p2-selected-car-intake'
LOCAL = ROOT / '.atseq-local/p2-car-intake/length-successor'
PRODUCER = '16a2361108deccc4c8a0317a51ee96639fbd614d'
PREDECESSOR = '2653472dc9fea6e38168a0d413eb027eba996e0a'
BASIS = '87eec6aa872ce7acc58dc641f8e84f47ca7bbbb1'
REPORT = 'notes/2026-10-02-atseq-selected-car-intake-length-results.md'
sha = lambda raw: hashlib.sha256(raw).hexdigest()
captures = {}
for path in sorted(LOCAL.rglob('*')):
    if not path.is_file():
        continue
    relative = str(path.relative_to(LOCAL))
    raw = path.read_bytes()
    target = PACKET / 'actual' / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    compress = path.suffix == '.js' or (path.suffix == '.json' and len(raw) > 128_000)
    if compress:
        target = Path(str(target) + '.gz')
    target.write_bytes(gzip.compress(raw, mtime=0) if compress else raw)
    captures[relative] = {'path': str(target.relative_to(PACKET)), 'gzip': compress,
                          'rawBytes': len(raw), 'rawSha256': sha(raw), 'savedSha256': sha(target.read_bytes())}
old_files = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', PREDECESSOR, '--', str(OLD.relative_to(ROOT)), 'experiments/post-spike-evidence/2026-10-02/p2-selected-car-intake-cid-successor'], text=True).splitlines()
retained = {}
for path in old_files + ['notes/2026-10-02-atseq-selected-car-intake-results.md', 'notes/2026-10-02-atseq-selected-car-intake-cid-results.md']:
    raw = subprocess.check_output(['git', 'show', PREDECESSOR + ':' + path])
    assert (ROOT / path).read_bytes() == raw
    retained[path] = sha(raw)
source = json.loads((ROOT / 'experiments/post-spike-evidence/2026-10-02/p2-selected-car-intake-cid-successor/manifest.json').read_text())['sourceInputs']
source = {path: sha(subprocess.check_output(['git', 'show', PRODUCER + ':' + path])) for path in source}
extra = 'experiments/p2-car-intake/run-length-successor.py'
source[extra] = sha(subprocess.check_output(['git', 'show', PRODUCER + ':' + extra]))
for path, checksum in source.items():
    assert sha((ROOT / path).read_bytes()) == checksum
build = json.loads((LOCAL / 'node26/build-provenance.json').read_text())
for path, checksum in build['outputHashes'].items():
    assert sha((ROOT / path).read_bytes()) == checksum
physical = json.loads(gzip.decompress((OLD / 'physical-runtime.json.gz').read_bytes()))
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
(PACKET / 'physical-verification.json').write_text(json.dumps({'packages': physical['count'],
    'actualFileHashesVerified': len(files), 'actualNewPrivateTreeWalked': True,
    'rootSymlink': False, 'packageRootSymlinks': False, 'graphChanged': False}, indent=2) + '\n')
commands = json.loads((LOCAL / 'commands.json').read_text())
assert len(commands) == 19 and all(row['exitCode'] == 0 and row['producer'] == PRODUCER for row in commands)
assert (LOCAL / 'fixtures.json').read_bytes() == (OLD / 'final/fixtures.json').read_bytes()
change = subprocess.check_output(['git', 'diff', '--name-only', PREDECESSOR, PRODUCER], text=True).splitlines()
assert sorted(change) == sorted(['src/protocol/native-observer-car.ts', 'tests/support/native-car-intake.ts', extra])
manifest = {'schema': 'atseq-p2-selected-car-length-successor-v1',
    'request': '8ae492b28309e9c143eb63e22c34edbebbe0d0a2', 'promise': '1a4adfe4f02ad40a0577b0f273257228723584b0',
    'sourceAdoption': '97be58fccdd42286efa5feb38796f5791aa989b0',
    'basis': BASIS, 'runtimeProducer': PRODUCER, 'predecessor': PREDECESSOR,
    'sourceInputs': source, 'predecessorFiles': retained, 'captures': captures,
    'actualCommands': 19, 'actualConsumers': 7, 'actualBuildSources': len(build['sourceHashes']),
    'actualBuildOutputs': len(build['outputHashes']), 'physicalPackages': physical['count'], 'physicalFiles': len(files),
    'runtimeChangesFromPredecessor': change, 'requestLengthCapturedOnceControlsExecuted': True, 'oldLimitGatesRerun': False, 'fixturesRegenerated': False,
    'fullP2Complete': False, 'independentImplementationReviewComplete': False,
    'report': {'path': REPORT, 'sha256': sha((ROOT / REPORT).read_bytes())},
    'files': {str(path.relative_to(PACKET)): sha(path.read_bytes()) for path in sorted(PACKET.rglob('*'))
              if path.is_file() and str(path.relative_to(PACKET)) not in ['manifest.json', 'delivery-list.json']}}
delivery = set(subprocess.check_output(['git', 'diff', '--name-only', BASIS, PRODUCER], text=True).splitlines())
delivery.update([REPORT])
delivery.update(str(path.relative_to(ROOT)) for path in PACKET.rglob('*') if path.is_file())
delivery.update(str((PACKET / name).relative_to(ROOT)) for name in ['manifest.json', 'delivery-list.json'])
(PACKET / 'delivery-list.json').write_text(json.dumps({'basis': BASIS, 'paths': sorted(delivery)}, indent=2) + '\n')
(PACKET / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps({'sourcePins': len(source), 'captures': len(captures), 'retainedPredecessorFiles': len(retained),
    'buildSources': len(build['sourceHashes']), 'buildOutputs': len(build['outputHashes']),
    'physicalPackages': physical['count'], 'physicalFiles': len(files), 'deliveryPaths': len(delivery)}))
