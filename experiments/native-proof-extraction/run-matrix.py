#!/usr/bin/env python3
"""Serial source, actual emitted production, and actual Chromium conformance."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import platform
import shutil
import subprocess
import time

parser = argparse.ArgumentParser()
for major in (22, 24, 26):
    parser.add_argument(f'--node{major}', required=True)
parser.add_argument('--capture-dir', required=True)
parser.add_argument('--r1-fixture', required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[2]
out = Path(args.capture_dir).resolve()
out.mkdir(parents=True, exist_ok=True)
source = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
runtimes = {}
for major in (22, 24, 26):
    binary = Path(getattr(args, f'node{major}')).resolve()
    version = subprocess.check_output([str(binary), '--version'], text=True).strip()
    if not version.startswith(f'v{major}.'):
        raise SystemExit(f'Wrong runtime {major}: {version}')
    runtimes[major] = {'executable': str(binary), 'node': version, 'executableSha256': hashlib.sha256(binary.read_bytes()).hexdigest()}
runs = []
def save():
    (out / 'runs.json').write_text(json.dumps({'source': source, 'platform': platform.system(), 'machine': platform.machine(), 'runs': runs}, indent=2) + '\n')
def run(major, kind, argv, env):
    directory = out / f'node{major}'
    directory.mkdir(exist_ok=True)
    merged = dict(os.environ)
    merged.pop('NODE_TEST_CONTEXT', None)
    merged.update({key: str(value) for key, value in env.items()})
    log = directory / f'{kind}.log'
    record = {'kind': kind, **runtimes[major], 'argv': argv, 'env': {key: str(value) for key, value in env.items()}, 'log': str(log.relative_to(out)), 'source': source, 'started': datetime.now(timezone.utc).isoformat(), 'launchRetries': []}
    for attempt in range(3):
        try:
            with log.open('wb') as stream:
                process = subprocess.run([runtimes[major]['executable'], *argv], cwd=root, env=merged, stdout=stream, stderr=subprocess.STDOUT, timeout=300)
            break
        except OSError as error:
            record['launchRetries'].append({'attempt': attempt, 'errno': error.errno, 'error': str(error)})
            if error.errno != 24 or attempt == 2:
                raise
            time.sleep(1) # No child was created on this OSError.
    record['exitCode'] = process.returncode
    runs.append(record)
    save()
    print(f'{kind} {runtimes[major]["node"]}: {process.returncode}', flush=True)
    if process.returncode:
        raise SystemExit(f'Failed; retained {log}')
for major in (22, 24, 26):
    directory = out / f'node{major}'
    env = {'ATSEQ_NATIVE_EXTRACTION_CAPTURE_DIR': directory / 'source', 'ATSEQ_NATIVE_PREFIX_CAPTURE_DIR': directory / 'r1-source', 'ATSEQ_NATIVE_PREFIX_FIXTURE_PATH': Path(args.r1_fixture).resolve()}
    if major != 22:
        env.update({'ATSEQ_NATIVE_EXTRACTION_FIXTURE_PATH': out / 'node22/source/fixture.json', 'ATSEQ_NATIVE_EXTRACTION_WORKLOAD_FIXTURE_PATH': out / 'node22/source/workload-fixture.json'})
    run(major, 'source', ['scripts/source-run.mjs', '--test', '--test-concurrency=1', 'tests/native-proof-extraction.test.ts', 'tests/native-proof-extraction-workload.test.ts', 'tests/native-proof.test.ts', 'tests/native-prefix.test.ts'], env)
    run(major, 'extraction-emitted', ['experiments/native-proof-extraction/compiled-conformance.mjs'], {'ATSEQ_NATIVE_EXTRACTION_FIXTURE_PATH': directory / 'source/fixture.json', 'ATSEQ_NATIVE_EXTRACTION_WORKLOAD_FIXTURE_PATH': directory / 'source/workload-fixture.json', 'ATSEQ_NATIVE_EXTRACTION_COMPILED_CAPTURE': directory / 'emitted.json'})
    run(major, 'r1-emitted', ['experiments/native-prefix/compiled-conformance.mjs'], {'ATSEQ_NATIVE_PREFIX_FIXTURE_PATH': Path(args.r1_fixture).resolve(), 'ATSEQ_NATIVE_PREFIX_COMPILED_CAPTURE': directory / 'r1-emitted.json'})
run(26, 'chromium', ['scripts/source-run.mjs', '--test', '--test-concurrency=1', 'tests/native-proof-extraction-browser.test.ts', 'tests/native-prefix-browser.test.ts'], {'ATSEQ_NATIVE_EXTRACTION_FIXTURE_PATH': out / 'node22/source/fixture.json', 'ATSEQ_NATIVE_EXTRACTION_WORKLOAD_FIXTURE_PATH': out / 'node22/source/workload-fixture.json', 'ATSEQ_NATIVE_EXTRACTION_BROWSER_CAPTURE_DIR': out / 'chromium', 'ATSEQ_NATIVE_PREFIX_FIXTURE_PATH': Path(args.r1_fixture).resolve()})
shutil.copyfile(root / '.atseq-local/native-prefix-browser/chromium.json', out / 'r1-chromium.json')
shutil.copyfile(root / 'dist/build-provenance.json', out / 'build-provenance.json')
