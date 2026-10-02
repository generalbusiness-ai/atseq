import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { cpus, platform, release, arch, totalmem } from 'node:os';
import { measure, type ReplayInput } from './replay.ts';
import { supportedProfiles } from '../../src/protocol/identity.ts';

const root = 'experiments/post-spike-evidence/2026-10-01/s0-replay';
const raw = gunzipSync(await readFile(root + '/public-inputs.json.gz'));
const inputs: ReplayInput[] = JSON.parse(raw.toString());
const label = process.argv.includes('--probe') ? 'node-probe' : 'node-timing';
const selected = label === 'node-probe' ? inputs.filter((x) => x.n === 100) : inputs;
const sha = (value: Uint8Array) => createHash('sha256').update(value).digest('hex');
const files = [
  'experiments/s0-replay/prepare.ts',
  'experiments/s0-replay/replay.ts',
  'experiments/s0-replay/node-run.ts',
  'experiments/s0-replay/browser-run.mjs',
  'src/application/folder.ts',
  'src/runtime/evaluator.ts',
  'src/definition/schemas.ts',
  'src/core/values.ts',
  'src/core/profile.ts',
  'src/protocol/log.ts',
  'testdata/apps/evolution.ts',
  'testdata/apps/fixtures.ts',
  'testdata/source-documents/taskboard.atseq.json',
  'testdata/source-documents/guitar.atseq.json',
  'testdata/source-documents/ledger.atseq.json',
  'package.json',
  'npm-shrinkwrap.json',
  'src/core/dependencies-approved.json',
  'src/integrity/files-approved.json',
];
const metadata = {
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
  inputSha256: sha(raw),
  inputBytes: raw.length,
  profiles: await supportedProfiles(),
  sourceHashes: Object.fromEntries(await Promise.all(files.map(async (file) => [file, sha(await readFile(file))]))),
  method:
    'Each timed span interprets all N distinct signed entries from frontier zero using actual Folder.catchUpVerifiedStatus once. Source loading, signature/history verification, ten-entry warmup, final snapshot, query and independent oracle are outside the span. No persistence adapter; no native repository proofs, transport, checkpoint restore, archive or worker cost.',
};
const results = await measure(selected, label === 'node-probe' ? 1 : 2);
await writeFile(root + '/' + label + '.json', JSON.stringify({ metadata, ...results }, null, 2) + '\n');
console.log(JSON.stringify({ label, cells: results.captures.length, failures: results.failures }));
if (results.failures.length) process.exitCode = 1;
