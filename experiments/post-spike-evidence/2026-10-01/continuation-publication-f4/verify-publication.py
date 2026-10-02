"""Read-only checks of exact F4 source copies and public evidence; no trust admission."""
import gzip
import hashlib
import json
import re
import subprocess
import tarfile
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def git_bytes(ref, path):
    return subprocess.check_output(['git', 'show', f'{ref}:{path}'], cwd=ROOT)


publication = json.loads((OUT / 'source-publication.json').read_text())
assert len(publication['files']) == 22
for item in publication['files']:
    source = git_bytes(item['source'], item['sourcePath'])
    actual = (ROOT / item['publishedPath']).read_bytes()
    assert source == actual
    assert len(actual) == item['bytes']
    assert sha(source) == item['sourceSha256'] == item['publishedSha256']
    if item['reviewedAt']:
        assert source == git_bytes(item['reviewedAt'], item['sourcePath'])

archive_checks = []
for prefix, members in [('checkpoint-projections', 475), ('checkpoint-history-projections', 436)]:
    directory = OUT.parent / prefix
    manifest = json.loads((directory / 'manifest.json').read_text())
    for item in manifest['files']:
        raw = (directory / item['file']).read_bytes()
        assert len(raw) == item['bytes'] and sha(raw) == item['sha256'], item['file']
    vectors_raw = (directory / 'vectors.json').read_bytes()
    vectors = json.loads(vectors_raw)
    assert vectors['noCheckpointAdmission'] and vectors['noPrivateKeysRetained']
    expected = {item['file']: item for item in vectors['payloads'] + vectors['nativeRecords']}
    assert len(expected) == len(vectors['payloads']) + len(vectors['nativeRecords'])
    with tarfile.open(directory / 'vectors.tar.gz') as archive:
        names = archive.getnames()
        assert len(names) == len(set(names)) == members
        assert set(names) == set(expected) | {'vectors.json'}
        for member in archive.getmembers():
            assert member.isfile()
            raw = archive.extractfile(member).read()
            if member.name == 'vectors.json':
                assert raw == vectors_raw
            else:
                item = expected[member.name]
                assert len(raw) == item['bytes'] and sha(raw) == item['sha256'], member.name
    archive_checks.append({'packet': prefix, 'members': members, 'payloads': len(vectors['payloads']),
                           'nativeRecords': len(vectors['nativeRecords']), 'vectorsSha256': sha(vectors_raw),
                           'archiveSha256': sha((directory / 'vectors.tar.gz').read_bytes())})

fixture = gzip.decompress((OUT.parent / 'checkpoint-projections/i2-public-vectors.json.gz').read_bytes())
assert len(fixture) == 23114637
assert sha(fixture) == 'a6ca8f0aa56a1986e6fc4e39f13da8b6609d3a6829c1349e94487c9496e4e019'
assert (OUT.parent / 'checkpoint-projections/i2-public-vectors.json.gz').read_bytes() == (OUT.parent / 'native-authority-foundation/public-vectors.json.gz').read_bytes()

for name, source_path in [('predecessor-generator.mjs', 'experiments/checkpoint-projections/generate.mjs'),
                          ('predecessor-policy-note.md', 'notes/2026-10-01-atseq-checkpoint-policy-bytes.md'),
                          ('predecessor-projections-note.md', 'notes/2026-10-01-atseq-checkpoint-projections.md')]:
    assert (OUT.parent / 'checkpoint-history-projections' / name).read_bytes() == git_bytes('72e0965bbdd4be15b59f50d420f06fd7e66ba562', source_path)

history_manifest = json.loads((OUT.parent / 'checkpoint-history-projections/manifest.json').read_text())
current_generation_inputs = []
for path, expected in history_manifest['i2ModuleHashes'].items():
    assert sha(git_bytes(history_manifest['i2Source'], path)) == expected
    actual = sha((ROOT / path).read_bytes())
    current_generation_inputs.append({'path': path, 'frozenSourceSha256': expected,
                                      'examinedMainSha256': actual, 'byteIdentical': actual == expected})
assert [item['path'] for item in current_generation_inputs if not item['byteIdentical']] == ['src/core/values.ts']

fresh = ROOT / 'experiments/generated/checkpoint-history-projections'
assert (fresh / 'vectors.json').read_bytes() == (OUT.parent / 'checkpoint-history-projections/vectors.json').read_bytes()
for item in json.loads((fresh / 'vectors.json').read_text())['payloads'] + json.loads((fresh / 'vectors.json').read_text())['nativeRecords']:
    raw = (fresh / item['file']).read_bytes()
    assert len(raw) == item['bytes'] and sha(raw) == item['sha256']
generator_runs = []
for file, version in [('p4-generator-node22.log', 'v22.19.0'), ('p4-generator-node26.log', 'v26.10.0')]:
    result = json.loads((OUT / file).read_text())
    assert result == {'node': version, 'cases': 7, 'payloads': 147, 'nativeRecords': 288,
                      'vectorsSha256': '175a20c68b576cbd76e1a9db7b740de788d93ec08dca777705ccd22d1e685517', 'noCheckpointAdmission': True}
    generator_runs.append(result)

notes = [ROOT / item['publishedPath'] for item in publication['files'] if item['publishedPath'].startswith('notes/')]
notes += [ROOT / 'notes' / name for name in ['2026-10-01-atseq-implementation-programme.md', '2026-10-01-atseq-plan-review-gaps.md', '2026-10-01-atseq-continuation-publication-results.md', 'README.md']]
links = 0
for note in notes:
    for href in re.findall(r'\[[^\]]*\]\(([^)]+)\)', note.read_text()):
        href = href.strip('<>').split('#', 1)[0]
        if not href or re.match(r'[A-Za-z][A-Za-z0-9+.-]*:', href):
            continue
        href = re.sub(r':\d+$', '', unquote(href))
        target = (note.parent / href).resolve()
        assert target.exists() or target == OUT / 'validation.json', f'{note.name}: {href}'
        links += 1

changed = subprocess.check_output(['git', 'diff', '--name-only', publication['basis']], cwd=ROOT, text=True).splitlines()
untracked = subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard'], cwd=ROOT, text=True).splitlines()
assert all(path.startswith(('notes/', 'experiments/')) or path == '.prettierignore' for path in changed + untracked)
assert (ROOT / '.prettierignore').read_bytes() == git_bytes(publication['basis'], '.prettierignore') + b'\n# Keep the independently reviewed source-only generator byte-exact.\nexperiments/checkpoint-projections/generate.mjs\n'
for path in ['package.json', 'npm-shrinkwrap.json', 'src/core/dependencies-approved.json', 'src/core/dependencies.ts', 'src/core/dependency-peers.ts']:
    assert (ROOT / path).read_bytes() == git_bytes(publication['basis'], path)
subprocess.check_call(['git', 'diff', '--exit-code', publication['basis'],
                       'c242ca20e823ea510e3939a8466a608f3ab860ba', '--',
                       'src', 'scripts', 'docs', 'lexicons', 'package.json',
                       'npm-shrinkwrap.json', '.github'], cwd=ROOT)

ci = []
for run, head, conclusion in [(36922875534, '3a40d2c5e230cd7698f9cd4b9e8e9729054be33e', 'success'),
                               (36935261684, 'fc8e20936c849d20e8e28be688afa08b29ce02ed', 'success'),
                               (36940311459, '1bb122ec394faead097139bd416bcde9f1c3b542', 'failure'),
                               (36942802499, 'eec0c8e877b66413a6a4781f826e0fbbcfdea462', 'success'),
                               (36945783974, 'b0a5d0668e670bd41050cd61536f37f4cea00ca2', 'success'),
                               (36947475821, 'c242ca20e823ea510e3939a8466a608f3ab860ba', 'success')]:
    result = json.loads((OUT / f'ci-{run}.json').read_text())
    assert result['headSha'] == head and result['status'] == 'completed' and result['conclusion'] == conclusion
    jobs = [{'name': job['name'], 'conclusion': job['conclusion']} for job in result['jobs']]
    ci.append({'run': run, 'head': head, 'conclusion': conclusion, 'jobs': jobs, 'url': result['url']})

result = {'format': 'atseq-continuation-publication-validation', 'version': 1,
          'checkedAt': datetime.now(timezone.utc).isoformat(), 'basis': publication['basis'],
          'statusObservedAt': '2026-10-02T02:40:02.144925+00:00',
          'observedMain': 'c242ca20e823ea510e3939a8466a608f3ab860ba',
          'exactPublishedFiles': len(publication['files']), 'publishedBytes': sum(item['bytes'] for item in publication['files']),
          'archives': archive_checks, 'fixtureRawBytes': len(fixture), 'fixtureRawSha256': sha(fixture),
          'freshSourceOnlyGeneratorRuns': generator_runs, 'predecessorNotesAndGeneratorExact': True,
          'pinnedI2SourceFiles': len(history_manifest['i2ModuleHashes']), 'pinnedI2Source': history_manifest['i2Source'],
          'currentGenerationInputHashes': current_generation_inputs,
          'generationBasisLimit': 'Fresh exact reproduction used the original d08104dd source in the read-only native-authority checkout. Examined main retains the separately reviewed V0 canonical-token optimization; one historical source file differs. No fresh generator execution against changed production input is claimed.',
          'noteLinksChecked': links,
          'changesRestrictedToNotesExperimentsAndExactFormatException': True,
          'formatException': {'path': 'experiments/checkpoint-projections/generate.mjs',
                              'scopeExtension': '2b3e8086676174aeb082ac705491aba00989182e',
                              'originalStyleExitCode': 1, 'afterNarrowExceptionExitCode': 0,
                              'reviewedSourceBytesUnchanged': True},
          'approvedRuntimeInputsUnchanged': True,
          'productionBytesIdenticalThroughObservedMain': True,
          'ci': ci, 'noCheckpointAdmission': True,
          'scope': 'Documentation copies and source-only projection reproduction; no full suite, provider, trusted restore, checkpoint runtime parser or native support execution.'}
(OUT / 'validation.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({key: result[key] for key in ['exactPublishedFiles', 'publishedBytes', 'noteLinksChecked', 'predecessorNotesAndGeneratorExact', 'noCheckpointAdmission']}))
