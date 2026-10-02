#!/usr/bin/env python3
"""Check frozen F6 evidence without running an SDK, provider or timing experiment."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
from urllib.parse import unquote, urlsplit

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--sdk-root', required=True, type=Path,
                    help='Physical installed SDK tree matching the original approved identities')
parser.add_argument('--write-capture', action='store_true')
args = parser.parse_args()
ROOT = Path(__file__).resolve().parents[4]
PACKET = Path(__file__).resolve().parent
SDK = args.sdk_root.resolve()

def read(path):
    data = path.read_bytes()
    assert len(data) <= 16 * 1024 * 1024, str(path)
    return data

def load(path):
    return json.loads(read(path))

def git(*args):
    return subprocess.check_output(['git', '-C', str(ROOT), *args])

def valid(data, row):
    if 'bytes' in row:
        assert len(data) == row['bytes'], row
    assert hashlib.sha256(data).hexdigest() == row['sha256'], row

manifest = load(PACKET / 'manifest.json')
assert manifest['schema'] == 'atseq-f6-publication-v1'
assert manifest['baseline'] == '526111bfd51172dfb3c06aa3557b3beb0a5d8964'
assert len(manifest['copies']) == 56
assert len({r['path'] for r in manifest['copies']}) == 56
for source in manifest['sources']:
    changed = git('diff', '--name-status', source['base'], source['head']).decode().splitlines()
    expected = {line.split('\t')[1] for line in changed if line.startswith('A\t')}
    assert len(expected) == source['addedFiles'] and len(changed) == len(expected)
    rows = [r for r in manifest['copies'] if r['head'] == source['head']]
    assert {r['path'] for r in rows} == expected
    for row in rows:
        data = read(ROOT / row['path'])
        valid(data, row)
        assert data == git('show', row['head'] + ':' + row['path']), row['path']
        assert git('rev-parse', row['head'] + ':' + row['path']).decode().strip() == row['gitBlob']
        assert row['path'].startswith(('notes/', 'experiments/'))
for row in manifest['ownedFiles']:
    valid(read(ROOT / row['path']), row)

OAUTH = ROOT / 'experiments/post-spike-evidence/2026-10-01/oauth-bounded-stores'
oauth = load(OAUTH / 'manifest.json')
assert oauth['syntheticOnly'] and not oauth['SDKPrivateDatabaseAccess']
assert oauth['dependencyPaths'] == 194
assert len(oauth['source']) == 6 and len(oauth['sdkPins']) == 24
for row in oauth['source']:
    data = read(ROOT / row['path'])
    valid(data, row)
    assert data == git('show', oauth['experimentSourceCommit'] + ':' + row['path'])
for key in ['captures', 'evidenceFiles']:
    for row in oauth[key]:
        valid(read(OAUTH / row.get('file', row.get('path'))), row)
valid(read(ROOT / oauth['note']['path']), oauth['note'])
valid(git('show', oauth['installedSDKCandidate'] + ':' + oauth['originalFixture']['path']),
      oauth['originalFixture'])
identity = oauth['dependencyIdentityManifest']
approved_data = git('show', oauth['installedSDKCandidate'] + ':' + identity['path'])
valid(approved_data, identity)
approved = json.loads(approved_data)
assert len(approved) == 194
for row in oauth['sdkPins']:
    path = row['path']
    package = row['approvedPackagePath']
    relative = path[len(package) + 1:]
    assert approved[package][relative] == row['sha256']
    assert row['matchesApprovedFile']
    valid(read(SDK / path), row)
# Check the public resolution evidence, without resolving or loading packages anew.
resolution = load(OAUTH / oauth['nodeResolution'])
assert resolution['version'] == '0.5.1'
assert resolution['selected'].endswith('/node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store/dist/index.js')
br = oauth['browserResolution']
meta = load(OAUTH / br['proof'])
assert br['selectedVersion'] == '0.5.1'
assert br['import'] in meta['inputs'][br['sessionGetterInput']]['imports']
assert br['import']['path'].endswith('/@atproto/oauth-client/node_modules/@atproto-labs/simple-store/dist/index.js')
assert json.loads(read(SDK / 'node_modules/@atproto/oauth-client/node_modules/@atproto-labs/simple-store/package.json'))['version'] == '0.5.1'
assert json.loads(read(SDK / 'node_modules/@atproto-labs/simple-store/package.json'))['version'] == '0.3.0'
node_results = [load(OAUTH / (name + '-final.json')) for name in ['node22', 'node24', 'node26']]
browser = load(OAUTH / 'browser-final.json')
cases = node_results[0]['cases']
assert len(cases) == 6 and all(c['passed'] for c in cases)
for value in node_results:
    assert value['syntheticOnly'] and not value['providerSuccess'] and value['cases'] == cases
assert browser['syntheticOnly'] and not browser['providerSuccess']
assert browser['hooks']['cases'] == cases
assert browser['expiry'] == {'expiredIsoRows': 1, 'numericUpperBoundMatches': 0,
                            'isoUpperBoundMatches': 1, 'SDKPrivateDatabaseAccess': False}
for phase in ['created', 'restored']:
    assert browser[phase]['subjectMatches'] and not browser[phase]['privateExtractable']
    assert browser[phase]['sessionRows'] == 1 and browser[phase]['refreshRequests'] == 1
assert all(browser['crossDocumentLock'].values())
assert browser['selectedStore'] == br['import']['path']
assert len([r for r in oauth['captures'] if r['status'] == 'failed']) == 5

A2 = ROOT / 'experiments/post-spike-evidence/2026-10-02/app-provisioning-boundary'
REVISED = ROOT / 'experiments/post-spike-evidence/2026-10-02/app-provisioning-review-clarification'
original = load(A2 / 'manifest.json')
revised = load(REVISED / 'manifest.json')
assert len(original['files']) == 24 and len(revised['files']) == 3
assert len(revised['predecessorFiles']) == 25
for packet in [original, revised]:
    for row in packet['files']:
        valid(read(ROOT / row['path']), row)
for row in revised['predecessorFiles']:
    data = read(ROOT / row['path'])
    valid(data, row)
    assert data == git('show', revised['predecessor'] + ':' + row['path'])
for key in ['reusedSourceInspection', 'reusedSourceObservations']:
    valid(read(ROOT / revised[key]['path']), revised[key])
inspection = load(A2 / 'source-inspection.json')
assert len(inspection['official']) == 18 and len(inspection['local']) == 25
for row in inspection['official']:
    valid(read(ROOT / row['retainedPath']), row)
    assert row['url'] == 'https://raw.githubusercontent.com/' + row['repository'] + '/' + row['commit'] + '/' + row['sourcePath']
    assert row['githubUrl'] == 'https://github.com/' + row['repository'] + '/blob/' + row['commit'] + '/' + row['sourcePath']
for row in inspection['local']:
    valid(git('show', row['commit'] + ':' + row['sourcePath']), row)
observations = load(A2 / 'source-observations.json')['observations']
assert len(observations) == 14
for row in observations:
    matches = [r for r in inspection['official'] if all(r[k] == row[k] for k in ['repository', 'commit', 'sourcePath'])]
    assert len(matches) == 1
    lines = read(ROOT / matches[0]['retainedPath']).decode().splitlines()
    hits = [{'line': i, 'text': line} for i, line in enumerate(lines, 1) if row['literal'] in line]
    assert hits == row['hits'], row
for packet, count in [(A2, 44), (REVISED, 12)]:
    vectors = load(packet / 'acceptance-vectors.json')
    assert vectors['executionStatus'] == 'unexecuted' and len(vectors['vectors']) == count
    assert len({v['id'] for v in vectors['vectors']}) == count
    assert all(v['executionStatus'] == 'unexecuted' for v in vectors['vectors'])
references = load(A2 / 'research-references.json')['references']
assert len(references) == 6
assert all(urlsplit(r['url']).scheme == 'https' and r['checkedAt'] == '2026-10-02' for r in references)

records = load(PACKET / 'review-records.json')['records']
by_id = {r['event'].rsplit(':', 1)[-1]: r for r in records}
assert len(by_id) == 5
for row in records:
    assert row['decision']['verdict'] == 'effective'
    assert row['event'] == row['statement']['event'] == row['decision']['event']
assert by_id['80111ff33975762e4f6ec9152342d176f2c01427']['statement']['body'] == {
    'account_limit': '10', 'consent_lifetime_ms': '2592000000', 'metadata_bytes': '65536',
    'pending_lifetime_ms': '600000', 'pending_limit': '10'}
for event, head in [('fb88a94ccb0379fcdbd0d94009ca8b66e17936f7', 'bb41a0ba'),
                    ('c2139bbeafe3bb494b7bca4537d5dae573fe1b49', '364457c8934250768d2624f40b2676bb48aa4c89'),
                    ('504aea8e07a66a00e001ac88a2f970d157ecd680', '2549de98c9579f40783dd83e73972ec0516c7ec8')]:
    statement = by_id[event]['statement']
    assert statement['kind'] == 'report' and statement['ratified'] and head in statement['text']
    assert statement['actor'] == 'e1e744dba2b206095714530f5e37c40f8d47b50fb949caafed60864f02ce4379'
    assert 'source' in statement['text'].lower()

links = []
for relative in manifest['authoredNotes']:
    note = ROOT / relative
    # Authored notes use inline Markdown links. Retained upstream source is not a local document.
    for target in re.findall(r'\[[^\]]*\]\(([^\s)]+)\)', read(note).decode()):
        parsed = urlsplit(target)
        if parsed.scheme or target.startswith('#'):
            continue
        path = (note.parent / unquote(parsed.path)).resolve()
        assert path.is_relative_to(ROOT), (relative, target)
        assert path.exists() or (args.write_capture and path == PACKET / 'verification.json'), (relative, target)
        links.append({'note': relative, 'target': target})
summary = {
    'result': 'passed', 'baseline': manifest['baseline'], 'cutoff': manifest['cutoff'],
    'copiedGitBlobs': 56, 'copiedBytes': sum(r['bytes'] for r in manifest['copies']),
    'oauthHarnessFiles': 6, 'oauthEvidenceFiles': len(oauth['evidenceFiles']),
    'oauthCaptureHashes': len(oauth['captures']), 'physicalSdkPins': 24,
    'sdkDependencyPaths': 194, 'storedPublicCoreCasesPerEnvironment': 6,
    'storedPublicCoreEnvironments': 4, 'retainedFailedCaptures': 5,
    'officialSourceCopies': 18, 'localGitPins': 25, 'literalObservations': 14,
    'predecessorFilesUnchanged': 25, 'originalUnexecutedVectors': 44,
    'successorUnexecutedVectors': 12, 'researchReferenceUrls': 6,
    'recordedReviewAndAdoptionScopes': 5, 'checkedLocalLinks': links,
    'runtimeExperimentsExecuted': False, 'providerOperationsExecuted': False,
    'timingExperimentsExecuted': False,
}
capture = PACKET / 'verification.json'
if args.write_capture:
    capture.write_text(json.dumps(summary, indent=2) + '\n')
else:
    assert load(capture) == summary, 'Retained verification capture differs from derived result'
    valid(read(capture), manifest['verificationCapture'])
print(json.dumps(summary, indent=2))
