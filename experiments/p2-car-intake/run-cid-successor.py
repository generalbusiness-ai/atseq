"""Recheck the narrow CID classification fix using unchanged predecessor signed fixtures."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import time

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / '.atseq-local/p2-car-intake/cid-successor'
OUT.mkdir(parents=True, exist_ok=True)
OLD = ROOT / 'experiments/post-spike-evidence/2026-10-02/p2-selected-car-intake/final'
shutil.copyfile(OLD / 'fixtures.json', OUT / 'fixtures.json')
NODES = [('22', '/Users/hughpyle/.npm/_npx/992a19d7d9bf36d4/node_modules/node/bin/node'),
         ('24', '/Users/hughpyle/.npm/_npx/387698761821791d/node_modules/node/bin/node'),
         ('26', '/opt/homebrew/bin/node')]
PRODUCER = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
ROWS = []


def run(name, argv, node, extra=None):
    env = os.environ.copy()
    env.update(extra or {})
    env['PATH'] = str(Path(node).parent) + os.pathsep + env['PATH']
    start = time.monotonic()
    path = OUT / (name + '.log')
    print('START ' + name, flush=True)
    with path.open('wb') as log:
        completed = subprocess.run(argv, cwd=ROOT, env=env, stdout=log, stderr=subprocess.STDOUT)
    ROWS.append({'name': name, 'argv': argv, 'cwd': str(ROOT), 'producer': PRODUCER,
                 'environment': {key: env[key] for key in sorted((extra or {}))},
                 'pathNode': node, 'exitCode': completed.returncode, 'seconds': time.monotonic() - start,
                 'log': str(path.relative_to(ROOT)), 'logSha256': hashlib.sha256(path.read_bytes()).hexdigest()})
    (OUT / 'commands.json').write_text(json.dumps(ROWS, indent=2) + '\n')
    print('END ' + name + ' exit=' + str(completed.returncode), flush=True)
    if completed.returncode:
        raise SystemExit(completed.returncode)


fixtures = str(OUT / 'fixtures.json')
for label, node in NODES:
    local = OUT / ('node' + label)
    local.mkdir(exist_ok=True)
    extra = {'ATSEQ_CAR_INTAKE_OUTPUT': str(local), 'ATSEQ_CAR_INTAKE_FIXTURES': fixtures,
             'ATSEQ_OBSERVER_TEST_OUTPUT': str(local / 'observer')}
    run('node' + label + '-build', [node, 'scripts/build.mjs'], node)
    shutil.copyfile(ROOT / 'dist/build-provenance.json', local / 'build-provenance.json')
    run('node' + label + '-check', [node, '/opt/homebrew/lib/node_modules/npm/bin/npm-cli.js', 'run', 'check'], node)
    run('node' + label + '-compiler-inputs', [node, 'node_modules/typescript/bin/tsc', '--noEmit', '--listFilesOnly'], node)
    run('node' + label + '-source', [node, 'scripts/source-run.mjs', '--test', 'tests/native-car-intake.test.ts', 'tests/native-observer.test.ts'], node, extra)
    run('node' + label + '-dist', [node, 'experiments/p2-car-intake/compiled-conformance.mjs'], node,
        {**extra, 'ATSEQ_CAR_INTAKE_COMPILED_CAPTURE': str(local / 'compiled.json')})
    run('node' + label + '-dist-host', [node, 'scripts/source-run.mjs', 'experiments/native-observer/compiled-conformance.mjs'], node, extra)
run('chromium', [NODES[-1][1], 'scripts/source-run.mjs', '--test', 'tests/native-car-intake-browser.test.ts', 'tests/native-observer-browser.test.ts'], NODES[-1][1],
    {'ATSEQ_CAR_INTAKE_OUTPUT': str(OUT), 'ATSEQ_CAR_INTAKE_FIXTURES': fixtures, 'ATSEQ_OBSERVER_TEST_OUTPUT': str(OUT / 'observer-browser')})
results = []
for label, node in NODES:
    version = subprocess.check_output([node, '-p', 'process.versions.node'], text=True).strip()
    results += [json.loads((OUT / ('node' + label) / ('source-' + version + '.json')).read_text()),
                json.loads((OUT / ('node' + label) / 'compiled.json').read_text())]
results.append(json.loads((OUT / 'chromium.json').read_text()))
old = json.loads((OLD / 'comparison.json').read_text())
for result in results:
    assert result['outputs'] == old['outputs'], 'Valid output CAR bytes changed from actual predecessor'
    assert result['cases'] == results[0]['cases']
    assert result['legacyCases'] == results[0]['legacyCases'] and result['proofCases'] == results[0]['proofCases']
assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip() == PRODUCER
(OUT / 'comparison.json').write_text(json.dumps({'producer': PRODUCER, 'consumers': 7,
    'fixtureBytesUnchanged': (OUT / 'fixtures.json').read_bytes() == (OLD / 'fixtures.json').read_bytes(),
    'validOutputHashesUnchanged': True, 'outputs': old['outputs'], 'sourceDistChromiumByteEquality': True,
    'malformedCidAndForeignGetterControlsExecuted': True, 'fullP2Complete': False}, indent=2) + '\n')
print('COMPLETE actual CID controls and source/dist/Chromium equality with predecessor', flush=True)
