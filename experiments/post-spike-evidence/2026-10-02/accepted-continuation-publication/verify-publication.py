"""Check immutable F5 publication bytes and retained observations; no admission."""
import argparse
import gzip
import hashlib
import json
import re
import subprocess
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
parser = argparse.ArgumentParser()
parser.add_argument('--maintained-root', type=Path, required=True,
                    help='Read-only installed maintained package source for five historical pins')
args = parser.parse_args()


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def git_bytes(commit, path):
    return subprocess.check_output(['git', 'show', f'{commit}:{path}'], cwd=ROOT)


def load(path):
    return json.loads((ROOT / path).read_bytes())


def checked(raw, item):
    assert len(raw) == item['bytes'] and sha(raw) == item['sha256']


def file_checks(items):
    for path, item in items.items():
        checked((ROOT / path).read_bytes(), item)
    return len(items)


publication = load(OUT.relative_to(ROOT) / 'source-publication.json')
assert publication['publishedFiles'] == len(publication['files']) == 50
paths = [item['publishedPath'] for item in publication['files']]
assert len(set(paths)) == 50
for item in publication['files']:
    original = git_bytes(item['source'], item['sourcePath'])
    actual = (ROOT / item['publishedPath']).read_bytes()
    assert actual == original
    assert len(actual) == item['bytes']
    assert sha(actual) == item['publishedSha256'] == item['sourceSha256']
assert sum(item['bytes'] for item in publication['files']) == publication['publishedBytes']
for group in publication['groups']:
    diff = subprocess.check_output(['git', 'diff', '--name-status', group['sourceBasis'],
                                    group['source']], cwd=ROOT, text=True).splitlines()
    assert all(line.startswith('A\t') for line in diff)
    assert len(diff) == group['files']
    assert {line.split('\t')[1] for line in diff} == {
        item['publishedPath'] for item in publication['files'] if item['group'] == group['id']}

observer = 'experiments/post-spike-evidence/2026-10-01/native-observer-clarification/'
inspection = load(observer + 'source-inspection.json')
approved = json.loads(git_bytes(inspection['baseline'], 'src/integrity/files-approved.json'))
source_pins = maintained_pins = excerpts = packet_files = 0
for item in inspection['files']:
    if item.get('gitRef'):
        raw = git_bytes(item['gitRef'], item['path'])
        source_pins += 1
    else:
        raw = (args.maintained_root / item['path']).read_bytes()
        package = 'node_modules/@atcute/car'
        assert approved[package][item['path'][len(package) + 1:]] == item['sha256']
        maintained_pins += 1
    checked(raw, item)
    lines = raw.decode().splitlines(keepends=True)
    for excerpt in item.get('excerpts', []):
        selected = ''.join(lines[excerpt['startLine'] - 1:excerpt['endLine']])
        assert selected == excerpt['text'] and excerpt['matchedText'] in selected
        excerpts += 1
packet_files += file_checks(load(observer + 'manifest.json')['files'])
observer_vectors = load(observer + 'expectation-vectors.json')
assert observer_vectors['execution'].startswith('NOT RUN')
assert len(observer_vectors['cases']) == len({x['id'] for x in observer_vectors['cases']}) == 30

coordinator = 'experiments/post-spike-evidence/2026-10-01/native-coordinator-d5/'
for item in load(coordinator + 'source-pins.json')['files']:
    checked(git_bytes(item['commit'], item['path']), item)
    source_pins += 1
coordinator_vectors = load(coordinator + 'decision-vectors.json')
assert coordinator_vectors['executionStatus'].startswith('NOT EXECUTED')
assert len(coordinator_vectors['cases']) == len({x['id'] for x in coordinator_vectors['cases']}) == 53

retry = 'experiments/post-spike-evidence/2026-10-01/retry-prefix-boundary/'
revised = 'experiments/post-spike-evidence/2026-10-02/retry-prefix-boundary/'
original_manifest = load(retry + 'manifest.json')
revised_manifest = load(revised + 'manifest.json')
packet_files += file_checks(original_manifest['artifacts'])
packet_files += file_checks(revised_manifest['artifacts'])
predecessor_paths = revised_manifest['unchangedPredecessorArtifacts']
packet_files += file_checks(predecessor_paths)
for path in predecessor_paths:
    assert (ROOT / path).read_bytes() == git_bytes(revised_manifest['predecessor'], path)
for path, item in original_manifest['unchangedApprovedInputs'].items():
    checked(git_bytes(original_manifest['examinedAt'], path), item)
    source_pins += 1
for item in revised_manifest['sourcePins']:
    checked(git_bytes(item['commit'], item['path']), item)
    source_pins += 1
for directory, count in [(retry, 36), (revised, 47)]:
    vectors = load(directory + 'decision-vectors.json')
    assert vectors['executedCases'] == 0
    assert len(vectors['scenarios']) == len({x['id'] for x in vectors['scenarios']}) == count

s0 = 'experiments/post-spike-evidence/2026-10-01/s0-replay/'
s0_manifest = load(s0 + 'manifest.json')
assert len(s0_manifest['files']) == s0_manifest['hashedFileCount'] == 35
for item in s0_manifest['files']:
    checked((ROOT / item['path']).read_bytes(), item)
assert sum(item['bytes'] for item in s0_manifest['files']) == s0_manifest['hashedBytes']
packet_files += 35
public_input = gzip.decompress((ROOT / (s0 + 'public-inputs.json.gz')).read_bytes())
assert len(public_input) == s0_manifest['publicInputBytes'] == 7315389
assert sha(public_input) == s0_manifest['publicInputSha256']
statistics = load(s0 + 'statistics.json')
spans = entries = 0
captures = {}
for environment in ['node', 'chromium']:
    raw = (ROOT / (s0 + environment + '-timing.json')).read_bytes()
    assert sha(raw) == statistics['captureHashes'][environment]
    capture = json.loads(raw)
    assert not capture['failures'] and capture['samples'] == 2
    assert len(capture['captures']) == 8
    assert capture['metadata']['exactHead'] == s0_manifest['timedSource']
    assert capture['metadata']['inputSha256'] == sha(public_input)
    captures[environment] = capture
    for observation, cell in zip(capture['captures'], statistics['cells']):
        assert observation['name'] == cell['name'] and observation['n'] == cell['n']
        values = [row['elapsedMs'] for row in observation['rows']]
        assert len(values) == 2 and all(row['entriesInterpreted'] == observation['n']
                                      for row in observation['rows'])
        assert {'minimumMs': min(values), 'maximumMs': max(values), 'allMs': values} == cell['environments'][environment]
        spans += len(values)
        entries += sum(row['entriesInterpreted'] for row in observation['rows'])
for node, chromium in zip(captures['node']['captures'], captures['chromium']['captures']):
    assert node['name'] == chromium['name'] and node['reference'] == chromium['reference']
assert spans == statistics['timedWholeReplaySpans'] == 32
assert entries == statistics['timedEntriesInterpreted'] == 17600

links = 0
notes = [ROOT / path for path in paths if path.startswith('notes/')]
notes.append(ROOT / 'notes/2026-10-02-atseq-accepted-continuation-publication-results.md')
for note in notes:
    for href in re.findall(r'\[[^\]]*\]\(([^)]+)\)', note.read_text()):
        href = href.strip('<>').split('#', 1)[0]
        if not href or re.match(r'[A-Za-z][A-Za-z0-9+.-]*:', href):
            continue
        href = re.sub(r':\d+$', '', unquote(href))
        assert (note.parent / href).resolve().exists(), f'{note.name}: {href}'
        links += 1
changed = subprocess.check_output(['git', 'diff', '--name-only', publication['basis']],
                                  cwd=ROOT, text=True).splitlines()
untracked = subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard'],
                                    cwd=ROOT, text=True).splitlines()
assert all(path.startswith(('notes/', 'experiments/')) for path in changed + untracked)
changes = subprocess.check_output(['git', 'diff', '--name-status', publication['basis']],
                                  cwd=ROOT, text=True).splitlines()
assert all(line.startswith('A\t') for line in changes)
assert all((ROOT / path).is_file() and not (ROOT / path).is_symlink()
           for path in changed + untracked)
manifest_path = OUT / 'manifest.json'
if manifest_path.exists():
    manifest = json.loads(manifest_path.read_bytes())
    assert manifest['basis'] == publication['basis']
    for item in manifest['files']:
        checked((ROOT / item['path']).read_bytes(), item)
    assert {item['path'] for item in manifest['files']} | {str(manifest_path.relative_to(ROOT))} == set(changed + untracked)

subprocess.check_call(['git', 'diff', '--exit-code', publication['basis'], '--',
                       'src', 'scripts', 'docs', 'lexicons', 'tests', 'package.json',
                       'npm-shrinkwrap.json', '.github', '.prettierignore'], cwd=ROOT)
result = {'format': 'atseq-accepted-continuation-publication-validation', 'version': 1,
          'basis': publication['basis'], 'sourceFiles': 50,
          'sourceBytes': publication['publishedBytes'], 'exactCopyEquality': True,
          'packetHashChecks': packet_files, 'exactGitSourcePins': source_pins,
          'installedMaintainedPins': maintained_pins, 'literalExcerptChecks': excerpts,
          'symbolicUnexecutedScenarios': {'observer': 30, 'coordinator': 53,
                                         'retryOriginal': 36, 'retryRevised': 47},
          'predecessorFilesPreserved': len(predecessor_paths), 's0PublicInputBytes': len(public_input),
          's0PublicInputSha256': sha(public_input), 'retainedReplaySpans': spans,
          'retainedInterpretedEntries': entries, 'retainedStatisticsAndFinalReferencesExact': True,
          'localNoteLinksChecked': links, 'changesOnlyNewNotesAndExperiments': True,
          'runtimeDependenciesProfilesExportsPriorEvidenceUnchanged': True,
          'timingsRerun': False, 'buildInstallRuntimeServiceProviderTestsRun': False,
          'limit': 'Source and retained-observation checks only. No native, durable, bootstrap, authority or checkpoint trust admission.'}
print(json.dumps(result, indent=2))
