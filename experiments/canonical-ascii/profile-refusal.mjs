import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { fromBytes } from '@atcute/cbor';
import { SourceBundle } from '../../src/definition/source.ts';
import { LoadedDefinition } from '../../src/definition/load.ts';
import { basis, output, hash } from './sources.mjs';

const path = 'experiments/post-spike-evidence/2026-10-01/performance-inputs/growing-1-1000.json.gz';
const compressed = readFileSync(path),
  raw = gunzipSync(compressed);
const source = await SourceBundle.read(fromBytes(JSON.parse(raw).source));
let outcome;
try {
  await LoadedDefinition.load(source.root, source);
  outcome = { accepted: true };
} catch (error) {
  outcome = { accepted: false, name: error.name, code: error.code, kind: error.kind, message: error.message };
}
assert.equal(outcome.code, 'unsupported_runtime');
writeFileSync(
  output + 'profile-refusal.json',
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      basis,
      sourceCid: source.root,
      input: { path, compressedSha256: hash(compressed), rawSha256: hash(raw) },
      outcome,
    },
    null,
    2,
  ) + '\n',
);
console.log(JSON.stringify(outcome));
