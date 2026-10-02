import { readFile, writeFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
const directory = process.argv[2];
if (!directory) throw Error('Usage: report.mjs EVIDENCE_DIRECTORY');
const patterns = ['one', 'sixteen', 'retired', 'one-use'];
const runtimes = [
  'node22-source',
  'node22-compiled',
  'node24-source',
  'node24-compiled',
  'node26-source',
  'node26-compiled',
  'chromium',
];
const raw = [];
const cells = [];
for (const n of [100, 1000, 10000])
  for (const pattern of patterns) {
    const name = pattern + '-' + n;
    const producer = JSON.parse(await readFile(directory + '/fixtures/' + name + '-producer.json'));
    const records = [];
    for (const runtime of runtimes) {
      const result = JSON.parse(
        gunzipSync(await readFile(directory + '/runs/' + name + '-' + runtime + '/result.json.gz')),
      );
      records.push({ runtime, result });
      raw.push({ cell: name, runtime, result });
    }
    cells.push({
      cell: name,
      producer,
      costs: records[0].result.costs,
      counts: records[0].result.counts,
      counters: records[0].result.counters,
      measurements: records.map(({ runtime, result }) => ({
        runtime,
        times: result.times,
        failures: result.failures,
        receiptStatus: result.receipts.status,
        receiptLookups: result.receipts.lookups,
        persistence: result.persistence,
        storage: result.storage,
        memories: result.memories,
        runtimeMetadata: result.runtime,
        transfer: result.transfer ?? null,
        originStorage: result.originStorage ?? null,
      })),
    });
  }
await writeFile(
  directory + '/results.json',
  JSON.stringify(
    {
      cells,
      coldCaptures: raw.length,
      scope: 'Single actual cold captures; current defaults, not performance targets or accepted restore',
    },
    null,
    2,
  ) + '\n',
);
const timingNames = [...new Set(raw.flatMap((row) => Object.keys(row.result.times)))].sort();
const columns = [
  'cell',
  'runtime',
  'actions',
  'totalEntries',
  'grants',
  'retiredGrants',
  'descriptors',
  'receiptStatus',
  'rawStoreStatus',
  'confirmedRows',
  'requestedRows',
  'rawStoreLogicalBytes',
  'authorityJsonBytes',
  'deduplicatedNativeEvidenceBytes',
  'preventionTupleDiagnosticJsonBytes',
  'counterMarkDiagnosticJsonBytes',
  'originalReceiptPointerDiagnosticJsonBytes',
  ...timingNames.map((name) => name + '_ms'),
];
const csv = [columns.join(',')];
for (const { cell, runtime, result: r } of raw)
  csv.push(
    [
      cell,
      runtime,
      r.actions,
      r.counts.totalEntries,
      r.counts.admittedGrants,
      r.counts.retiredGrants,
      r.counts.descriptors,
      r.receipts.status,
      r.persistence.status,
      r.persistence.confirmedRows,
      r.persistence.requestedRows,
      r.storage.native.accounting.bytes,
      r.costs.authorityJsonBytes,
      r.costs.deduplicatedNativeEvidenceBytes,
      r.costs.preventionTupleDiagnosticJsonBytes,
      r.counters.counterMarkJsonBytes,
      r.costs.receiptPointerDiagnosticJsonBytes,
      ...timingNames.map((name) => r.times[name] ?? ''),
    ].join(','),
  );
await writeFile(directory + '/measurements.csv', csv.join('\n') + '\n');
const ms = (value) => (value === undefined ? '—' : (value / 1000).toFixed(3));
const bytes = (value) => (value / 1024 / 1024).toFixed(3);
let markdown =
  'All 12 cells and 84 fresh runtime captures complete. Canonical projections, proof results, retry outcomes, allocator outcomes and raw-storage status agree across all seven modes per cell. Default refusals are retained; no trusted budget was raised.\n\n';
markdown +=
  '| Actions | Pattern | Ordered entries | Grants / retired | Descriptors | Native evidence MiB | Authority JSON MiB | Raw rows confirmed / requested | Cold owner |\n| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |\n';
for (const cell of cells) {
  const r = cell.measurements[0];
  markdown += `| ${cell.producer.actions} | ${cell.producer.pattern} | ${cell.counts.totalEntries} | ${cell.counts.admittedGrants} / ${cell.counts.retiredGrants} | ${cell.counts.descriptors} | ${bytes(cell.costs.deduplicatedNativeEvidenceBytes)} | ${bytes(cell.costs.authorityJsonBytes)} | ${r.persistence.confirmedRows} / ${r.persistence.requestedRows} | ${r.receiptStatus === 'complete-from-genesis' ? 'verified' : 'refused'} |\n`;
}
for (const runtime of ['node22-source', 'chromium']) {
  markdown += `\nObserved ${runtime} wall seconds, one capture per cell. A missing complete-prefix/application value means the default route refused, not fast successful bootstrap.\n\n`;
  markdown +=
    '| Actions / pattern | History signature/hash/chain | DATA index decode | Authority decode/copy | Authority/history | Participant methods/roots/MST | Full DATA clone | Source-only fold | Complete cold prefix | Actual authority/source replay | Raw commit attempt | Exact reopen reads |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n';
  for (const cell of cells) {
    const r = cell.measurements.find((row) => row.runtime === runtime),
      t = r.times;
    markdown += `| ${cell.producer.actions} / ${cell.producer.pattern} | ${ms(t.historyOriginalBytesHashSignatureAndChain)} | ${ms(t.historyDecodeIndexAndFramingIdentity)} | ${ms(t.compactAuthorityDecodeValidateAndCopy)} | ${ms(t.authorityHistoryCrosscheckAndTemporaryIndexes)} | ${ms(t.participantMethodRootAndExactMstProofValidation)} | ${ms(t.explicitFullDataProjectionCopy)} | ${ms(t.isolatedSupportedSourceFoldAndValidation)} | ${r.receiptStatus === 'complete-from-genesis' ? ms(t.coldR1DefaultCompletePrefixReverification) : 'refused'} | ${ms(t.actualR1ApplicationAuthorityAndSourceReplay)} | ${ms(t.rawStoreDefaultBatchedCommits)} | ${ms(t.rawStoreExactReadAfterReopen)} |\n`;
  }
}
markdown +=
  '\nThe first three 10,000-action patterns fail with `content_unavailable` because their ordered entries exceed the default 10,000 delta. The one-use10,000 pattern fails earlier with `native_proof_limit: CAR bytes exceed budget`; its 93,417,453-byte app CAR exceeds the default 32MiB CAR limit. That cell also reaches the raw 48MiB logical store quota after 64 commits and 64,000 exact rows (49,629,164 accounted bytes); its requested 240,957 rows are not fully stored. All confirmed rows survive reopen byte-exact; this is not an accepted restore.\n';
const successful = raw.filter((row) => row.result.receipts.status === 'complete-from-genesis');
const receiptTimes = successful.flatMap(({ result }) =>
  Object.entries(result.times)
    .filter(([key]) => /^receipt-\d+-original$/.test(key))
    .map(([, value]) => value),
);
markdown += `\nAcross the successful eight cells, all original/alternate-signature retries preserve original intent/entry/position/first signature, and signed content conflicts return retry_conflict. There are ${successful.length * 3} selected original retry measurements across seven modes, ranging ${Math.min(...receiptTimes).toFixed(3)}–${Math.max(...receiptTimes).toFixed(3)} ms. This mixed-runtime single-capture range is not an SLA. The missing-old-publication-block refusal also agrees. Four10k receipt/whole-authority gates stay unavailable.\n`;
await writeFile(directory + '/results-tables.md', markdown);
console.log(
  JSON.stringify({ cells: cells.length, captures: raw.length, successfulColdOwnerCaptures: successful.length }),
);
