import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { cpus, platform, release, totalmem, arch } from 'node:os';
import { createFixtures, type CapFixture } from './fixtures.ts';
import { characterize } from './kernels.ts';
import { measureFixtures } from './measure.ts';
import { supportedProfiles } from '../../src/protocol/identity.ts';

const output = '.atseq-local/complete-state-cap';
await mkdir(output, { recursive: true });
const measured = process.argv.includes('--measure');
const fixturePath = output + '/fixtures.json';
let fixtures: CapFixture[];
if (measured) fixtures = JSON.parse(await readFile(fixturePath, 'utf8'));
else {
  fixtures = await createFixtures();
  await writeFile(fixturePath, JSON.stringify(fixtures) + '\n');
}
let results;
if (measured) results = await measureFixtures(fixtures);
else {
  const rows = [];
  for (const fixture of fixtures) rows.push(await characterize(fixture));
  results = { results: rows };
}
const files = [
  'experiments/complete-state-cap/fixtures.ts',
  'experiments/complete-state-cap/kernels.ts',
  'experiments/complete-state-cap/measure.ts',
  'experiments/complete-state-cap/node-run.ts',
  'experiments/complete-state-cap/browser.ts',
  'experiments/complete-state-cap/browser-run.mjs',
  'src/core/values.ts',
  'src/core/profile.ts',
  'src/definition/load.ts',
  'src/definition/schemas.ts',
  'src/runtime/evaluator.ts',
  'src/application/folder.ts',
  'package.json',
  'npm-shrinkwrap.json',
  'src/core/dependencies-approved.json',
  'src/integrity/files-approved.json',
  'testdata/source-documents/taskboard.atseq.json',
  'testdata/source-documents/guitar.atseq.json',
  'testdata/source-documents/ledger.atseq.json',
];
const sha = (value: Uint8Array) => createHash('sha256').update(value).digest('hex');
const metadata = {
  format: 'atseq-complete-state-cap',
  version: 1,
  phase: measured ? 'quiet-window-kernels' : 'untimed-correctness-and-structural-counts',
  capturedAt: new Date().toISOString(),
  exactHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  node: process.version,
  machine: {
    platform: platform(),
    release: release(),
    arch: arch(),
    cpu: cpus()[0]?.model,
    logicalCpus: cpus().length,
    totalMemoryBytes: totalmem(),
  },
  fixtureSha256: sha(await readFile(fixturePath)),
  fixtureBytes: (await readFile(fixturePath)).length,
  profiles: await supportedProfiles(),
  sourceHashes: Object.fromEntries(await Promise.all(files.map(async (file) => [file, sha(await readFile(file))]))),
  limitations: [
    'Separate complete-state kernels, not exclusive components of replay or native catch-up.',
    'No signing, ordering, host/network/storage/checkpoint/worker-transfer timing.',
    'Generic definitions are experimental fixtures under current limits; sample source documents are unchanged.',
    'Structural hooks run only outside timing and count actual calls/encoded bytes, not heap allocations or a universal work bound.',
  ],
};
await writeFile(
  output + (measured ? '/node-timing.json' : '/node-structural.json'),
  JSON.stringify({ metadata, ...results }, null, 2) + '\n',
);
console.log(
  JSON.stringify({ phase: metadata.phase, fixtures: fixtures.length, passed: true, exactHead: metadata.exactHead }),
);
