import test from 'node:test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { nativeDiscoveryWorkloadCorpus } from './support/native-discovery-workload-corpus.ts';
test('actual 100/1000/10000 action replay and one/32-grant discovery characterization', async () => {
  const out = process.env.ATSEQ_NATIVE_DISCOVERY_WORKLOAD_CAPTURE_DIR ?? '.atseq-local/c1-kernel/workload';
  await mkdir(out, { recursive: true });
  const results = [];
  for (const profile of ['few', 'many']) {
    const file =
      process.env['ATSEQ_NATIVE_DISCOVERY_WORKLOAD_' + profile.toUpperCase()] ??
      '.atseq-local/c1-kernel/native-discovery-workload-' + profile + '-final.json';
    const raw = await readFile(file),
      result = await nativeDiscoveryWorkloadCorpus(JSON.parse(raw.toString()));
    const evidence = {
      node: process.version,
      file,
      fixtureBytes: raw.length,
      fixtureSha256: createHash('sha256').update(raw).digest('hex'),
      result,
    };
    await writeFile(out + '/' + profile + '.json', JSON.stringify(evidence, null, 2) + '\n');
    results.push({
      profile,
      rows: result.rows.map((row) => ({
        actions: row.actionCount,
        bootstrapMs: row.bootstrap.elapsedMs,
        coldMs: row.cold.measurement.elapsedMs,
        warmMs: row.warm.measurement.elapsedMs,
        coldWork: row.cold.result.work,
        warmWork: row.warm.result.work,
      })),
    });
  }
  console.log(JSON.stringify({ node: process.version, results }));
});
