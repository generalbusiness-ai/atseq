import json
from pathlib import Path

directory = Path(__file__).resolve().parent.parent
final = directory / 'final'
node = [f'{mode}-16f-node{n}.log' for mode in ('source', 'compiled') for n in (22, 24, 26)]
browser = [f'compiled-Chrome-16f-node{n}.log' for n in (22, 24, 26)]
supplement = [f'supplemental-16f-node{n}.log' for n in (22, 24, 26)]
packed = [f'packed-native-16f-node{n}.log' for n in (22, 24, 26)]
pds = [f'{mode}-PDS-16f-node{n}.log' for mode in ('source', 'compiled') for n in (22, 24, 26)]
legacy = [f'{mode}-legacy-16f-node{n}.log' for mode in ('source', 'compiled') for n in (22, 24, 26)]
rows = []
for group, name, key in (
    ('design43', 'design', 'vectors'), ('resource29', 'resource', 'vectors'),
    ('handoff25', 'handoff', 'vectors'), ('recovery20', 'recovery', 'rows'),
):
    for item in json.loads((final / 'adopted-inputs' / f'{name}-vectors.json').read_text())[key]:
        identifier = item['id']
        row = dict(group=group, id=identifier, status='executed',
                   originalExpectation=item.get('expectation', item.get('expected')),
                   cases='Maintained Node corpus (17 named cases), hostile dispatch probes, first-refusal handoff checks and existing A1 custody regressions.',
                   captures=node.copy())
        if group == 'design43':
            if identifier in ('upload-65537', 'apply-json-boundary'):
                row.update(status='superseded-by-adopted-fixed-resource-policy',
                           scope='The adopted 29683 policy replaces the original 64 KiB native cap with fixed 1 MiB. Ordinary public A1 retains 64 KiB.')
            if identifier in ('latest-commit', 'apply-response', 'list-records-shape', 'response-one-MiB'):
                row['captures'] += supplement
            if identifier.startswith('official-pds'):
                row.update(captures=pds.copy(), cases='Actual official PDS 0.5.31 get/latest/upload/CAS/102-record explicit pages/exact recovery/lost reply; synthetic AS and test-only Bearer bridge.')
            if identifier == 'legacy-pds-predicates':
                row.update(captures=legacy.copy(), cases='All 35 legacy PDS and host predicates, source and emitted on all three runtimes.')
            if identifier == 'packed-compiled':
                row.update(captures=node + packed, cases='Emitted 105 and installed-package native 43 checks on each runtime; actual outputs pinned before execution.')
            if identifier in ('three-node-and-browser', 'portable-import'):
                row['captures'] += browser
        if group == 'resource29':
            if identifier == 'near-cap-entry-head':
                row.update(status='accepted-acceptance-refinement',
                           captures=node + ['../preparation/writer-near-cap-first-node26.log'],
                           scope='Parent accepted genuine nativeApplicationFixture admission and retained attempted-padding refusal. Actual entry is 1187 CBOR bytes, entry/head JSON 2304, whole batch with two valid chunks 90308. No near-64-KiB admitted entry claim; 285369 is a conservative transport bound. Final independent review remains required.')
            if identifier == 'source-524288':
                row.update(captures=node + pds,
                           scope='Exact 512 KiB standard raw upload primitive, not replacement of governed native ByteManifest/ByteChunk source publication.')
            if identifier == 'explicit-page-lowering':
                row.update(captures=supplement.copy(), cases='Actual over-cap two-record page refused after one send. Caller limit 1 succeeds; no automatic page retry.')
            if identifier == 'publisher-preflight':
                row.update(status='deferred-separate-publisher-owner', captures=[],
                           scope='Publisher must preflight actual serialized batch/blob before signing/enqueueing and own lost-reply reconciliation. AW-F2 supplies neither publisher nor collector.')
            if identifier == 'local-auth-code':
                row['captures'] += legacy
            if identifier == 'three-node-browser':
                row['captures'] += browser + packed
        if group == 'handoff25':
            if identifier == 'first-unavailable-later-input':
                row['scope'] = 'The unavailable probe retains the first failure and blocks a subsequent authenticated request before body processing. This prevents the later input path; it does not claim a later body was read.'
            if identifier in ('token-dispatch-witness-not-invented-for-blocked-refresh', 'dispatched-token-retirement-unchanged'):
                row['captures'] += browser
            if identifier == 'compiled-Chromium-custody-and-packed-import':
                row.update(captures=browser + packed)
        if group == 'recovery20':
            if identifier in ('genuine-browser-live', 'genuine-dispatched-token-failure'):
                row.update(captures=browser.copy(), cases='Actual Chromium: 22358-byte stored metadata, 65656-byte encoded refresh; live without false dispatch witness; genuinely dispatched bounded failure retires.')
            if identifier == 'browser-reload-repeat':
                row.update(captures=browser + ['compiled-Chrome-persistent-16f-node26.log'],
                           cases='Page reload plus actual persistent Chromium context close/reopen, restore, repeated fixed instruction/live row and bounded fresh authorization.')
            if identifier == 'incoming-response-cap':
                row['captures'] += supplement
            if identifier in ('fresh-reauthorization', 'reauthorization-large-again'):
                row['captures'] += browser
        for capture in row['captures']:
            assert (final / capture).is_file(), capture
        row['captures'] = ['final/' + capture for capture in row['captures']]
        rows.append(row)
assert len(rows) == 117
counts = {state: sum(row['status'] == state for row in rows) for state in sorted({row['status'] for row in rows})}
result = dict(producer='16f36988179a0ccacf1189eeb7b2b0e3453d6836', rows=rows, counts=counts,
              frozenInputsUnchanged=True,
              claim='Implementation evidence with explicit supersession, acceptance refinement and deferred publisher ownership. Original source-only vector bytes remain unchanged; full programme closure is not claimed.')
(final / 'vector-coverage.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(dict(rows=len(rows), statuses=counts)))
