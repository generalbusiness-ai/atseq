import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { compiled, sources, output, hash, basis } from './sources.mjs';
import { differential } from './probe.ts';

const differences = differential(compiled);
for (const record of Object.values(differences.comparisons)) assert.deepEqual(record.mismatches, []);
writeFileSync(output + 'sources.json', JSON.stringify({ basis, sources, compiled }, null, 2) + '\n');
writeFileSync(
  output + 'differential.json',
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      basis,
      node: process.version,
      sourceHashes: Object.fromEntries(Object.entries(sources).map(([name, source]) => [name, hash(source)])),
      method:
        'Compiled pre-change guard compared with compiled implementation and actual imported production guard; text, error and complete charge sequence.',
      differences,
    },
    null,
    2,
  ) + '\n',
);
console.log(JSON.stringify({ comparisons: differences.comparisons, passed: true }));
