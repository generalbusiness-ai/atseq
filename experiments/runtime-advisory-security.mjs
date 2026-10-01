import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const cases = [
  { name: 'ordinary brace alternatives', input: '{one,two}/{a,b}', expected: ['one/a', 'one/b', 'two/a', 'two/b'] },
  { name: 'comma parsing recursion advisory shape', input: '{' + '{a},'.repeat(7000) + 'b}' },
  { name: 'nested expansion recursion advisory shape', input: '{'.repeat(3200) + 'a,b' + '}'.repeat(3200) },
  { name: 'repeated rewrite advisory shape', input: '{a}' + '}'.repeat(16000) + ',z}' },
];
const probe = `import {expand} from 'brace-expansion';
let input='';for await(const chunk of process.stdin)input+=chunk;
process.stdout.write(JSON.stringify(expand(JSON.parse(input))));`;
const results = cases.map(({ name, input, expected }) => {
  const output = JSON.parse(
    execFileSync(process.execPath, ['--input-type=module', '-e', probe], {
      input: JSON.stringify(input),
      encoding: 'utf8',
      timeout: 3000,
      maxBuffer: 4 * 1024 * 1024,
    }),
  );
  assert.ok(Array.isArray(output));
  assert.ok(output.every((value) => typeof value === 'string'));
  if (expected) assert.deepEqual(output, expected);
  return { name, inputBytes: Buffer.byteLength(input), resultCount: output.length, passed: true };
});
const installed = JSON.parse(readFileSync('node_modules/brace-expansion/package.json'));
assert.equal(installed.version, '5.0.12');
writeFileSync(
  'experiments/post-spike-evidence/2026-10-01/runtime-advisory-security.json',
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      node: process.version,
      package: `${installed.name}@${installed.version}`,
      installedEsmSha256: createHash('sha256')
        .update(readFileSync('node_modules/brace-expansion/dist/esm/index.js'))
        .digest('hex'),
      method:
        'Each input executes in a separate Node subprocess with a three-second timeout and four-MiB output budget. Tests successful return for representative advisory shapes, and exact output for an ordinary expansion. No old-version execution, Atseq exploit-reachability or performance claim.',
      sources: [
        'https://github.com/advisories/GHSA-6j4f-fj2g-mc7p',
        'https://github.com/advisories/GHSA-qhr7-859c-m2p7',
        'https://github.com/advisories/GHSA-q2hr-2g5m-vwhr',
      ],
      cases: results,
    },
    null,
    2,
  ) + '\n',
);
console.log(`Patched package security smoke passed: ${results.length} bounded subprocess cases.`);
