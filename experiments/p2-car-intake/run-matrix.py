"""Run sequential, attributed checks in this private worktree; no fixture regeneration between consumers."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import time

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / '.atseq-local/p2-car-intake/final'
OUT.mkdir(parents=True, exist_ok=True)
NODES = [
    ('22', '/Users/hughpyle/.npm/_npx/992a19d7d9bf36d4/node_modules/node/bin/node'),
    ('24', '/Users/hughpyle/.npm/_npx/387698761821791d/node_modules/node/bin/node'),
    ('26', '/opt/homebrew/bin/node'),
]
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
    row = {'name': name, 'argv': argv, 'cwd': str(ROOT), 'producer': PRODUCER,
           'environment': {key: env[key] for key in sorted((extra or {}))},
           'pathNode': node, 'exitCode': completed.returncode, 'seconds': time.monotonic() - start,
           'log': str(path.relative_to(ROOT)), 'logSha256': hashlib.sha256(path.read_bytes()).hexdigest()}
    ROWS.append(row)
    (OUT / 'commands.json').write_text(json.dumps(ROWS, indent=2) + '\n')
    print('END ' + name + ' exit=' + str(completed.returncode), flush=True)
    if completed.returncode:
        raise SystemExit(completed.returncode)


node26 = NODES[-1][1]
run('prepare', [node26, 'scripts/source-run.mjs', 'experiments/p2-car-intake/prepare.ts'], node26,
    {'ATSEQ_CAR_INTAKE_OUTPUT': str(OUT)})
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
    run('node' + label + '-source', [node, 'scripts/source-run.mjs', '--test', 'tests/native-car-intake.test.ts',
                                   'tests/native-observer.test.ts', 'tests/native-observer-limits.test.ts'], node, extra)
    run('node' + label + '-dist', [node, 'experiments/p2-car-intake/compiled-conformance.mjs'], node,
        {**extra, 'ATSEQ_CAR_INTAKE_COMPILED_CAPTURE': str(local / 'compiled.json')})
    run('node' + label + '-dist-limits', [node, 'experiments/p2-car-intake/compiled-conformance.mjs', 'limits'], node,
        {**extra, 'ATSEQ_CAR_INTAKE_COMPILED_CAPTURE': str(local / 'compiled-limits-inputs.json')})
    run('node' + label + '-dist-host', [node, 'scripts/source-run.mjs', 'experiments/native-observer/compiled-conformance.mjs'], node, extra)
run('chromium', [node26, 'scripts/source-run.mjs', '--test', 'tests/native-car-intake-browser.test.ts',
                'tests/native-observer-browser.test.ts'], node26,
    {'ATSEQ_CAR_INTAKE_OUTPUT': str(OUT), 'ATSEQ_CAR_INTAKE_FIXTURES': fixtures,
     'ATSEQ_OBSERVER_TEST_OUTPUT': str(OUT / 'observer-browser')})
results = [json.loads((OUT / ('node' + label) / ('source-' + subprocess.check_output([node, '-p', 'process.versions.node'], text=True).strip() + '.json')).read_text()) for label, node in NODES]
results += [json.loads((OUT / ('node' + label) / 'compiled.json').read_text()) for label, _ in NODES]
results += [json.loads((OUT / 'chromium.json').read_text())]
for result in results:
    assert result['outputs'] == results[0]['outputs'], 'Source/dist/Chromium exact bytes differ'
    assert result['cases'] == results[0]['cases'], 'Focused predicates differ'
    assert result['legacyCases'] == results[0]['legacyCases'], 'Legacy CAR corpus differs'
    assert result['proofCases'] == results[0]['proofCases'], 'Original P1 corpus differs'
assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip() == PRODUCER
(OUT / 'comparison.json').write_text(json.dumps({'producer': PRODUCER, 'consumers': len(results),
    'outputs': results[0]['outputs'], 'focusedCases': len(results[0]['cases']),
    'legacyCases': len(results[0]['legacyCases']), 'proofCases': len(results[0]['proofCases']),
    'sourceDistChromiumByteEquality': True, 'fullP2Complete': False}, indent=2) + '\n')
print('COMPLETE exact source/dist/Chromium byte equality; all actual gates passed', flush=True)
