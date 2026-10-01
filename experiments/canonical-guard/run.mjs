import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { gunzipSync } from 'node:zlib';
import os from 'node:os';
import { ts } from 'ts-morph';
import { fromBytes } from '@atcute/cbor';
import { SourceBundle } from '../../src/definition/source.ts';
import { LoadedDefinition } from '../../src/definition/load.ts';
import { InterpretationError, PROFILE } from '../../src/core/profile.ts';
import { candidateSource, createGuard, variants } from './candidates.mjs';
import { differential } from './probe.ts';

const output = 'experiments/post-spike-evidence/2026-10-01/canonical-guard-';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const original = readFileSync('src/core/values.ts', 'utf8');
const sources = Object.fromEntries(variants.map((name) => [name, candidateSource(original, name)]));
const compiled = Object.fromEntries(
  Object.entries(sources).map(([name, source]) => [
    name,
    ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    }).outputText,
  ]),
);
const guards = Object.fromEntries(
  variants.map((name) => [name, createGuard(compiled[name], InterpretationError, PROFILE)]),
);
const differences = differential(compiled);
for (const record of Object.values(differences.comparisons)) assert.deepEqual(record.mismatches, []);

const inputPath = 'experiments/post-spike-evidence/2026-10-01/performance-inputs/growing-1-1000.json.gz';
const compressed = readFileSync(inputPath),
  raw = gunzipSync(compressed),
  fixture = JSON.parse(raw);
const retained = JSON.parse(
  readFileSync('experiments/post-spike-evidence/2026-10-01/performance-inputs/manifest.json'),
).inputs.find((row) => row.retainedPath === inputPath);
assert.equal(hash(compressed), retained.compressedSha256);
assert.equal(hash(raw), retained.sha256);
const source = await SourceBundle.read(fromBytes(fixture.source));
const definition = await LoadedDefinition.load(source.root, source);
const lexicons = definition.schemas.lexicons,
  ref = definition.manifest.state.ref;

function validation(guard, value, validate, policy = 'current') {
  const initial = guard(value);
  const validated = validate(value);
  if (policy === 'aliasPostOne' && validated === value) {
    guard(value);
    return;
  }
  if (guard(validated) !== (policy === 'cachedInitial' ? initial : guard(value)))
    throw new InterpretationError('schema_coercion', 'Schema validation changed supplied data');
}
function official(value) {
  const result = lexicons.validate(ref, value);
  if (!result.success) throw result.error;
  return result.value;
}
const benchmarks = [],
  samples = 9,
  iterations = 3;
const inputs = [0, 99, 999, 9999].map((length) => ({
  name: `P0 reconstructed state ${length}`,
  length,
  value: { candidates: Array.from({ length }, (_, i) => i + 1), selected: String(length) },
  schema: true,
}));
inputs.push(
  { name: 'ASCII string 128 KiB', value: 'a'.repeat(128 * 1024) },
  { name: 'BMP string 64 KiB units', value: '中'.repeat(64 * 1024) },
  { name: 'astral string 32 Ki code points', value: '🦉'.repeat(32 * 1024) },
  {
    name: '1000 small records',
    value: Array.from({ length: 1000 }, (_, n) => ({ id: n, label: 'Example', active: true })),
  },
);
for (const input of inputs) {
  const expected = guards.baseline(input.value);
  for (const guard of Object.values(guards)) assert.equal(guard(input.value), expected);
  for (const method of input.schema ? ['canonical', 'validation'] : ['canonical']) {
    for (let sample = -3; sample < samples; sample++) {
      // Rotate variant order rather than always measuring baseline first.
      const startAt = (sample + 3) % variants.length;
      for (let index = 0; index < variants.length; index++) {
        const name = variants[(index + startAt) % variants.length],
          guard = guards[name];
        const start = performance.now();
        for (let n = 0; n < iterations; n++) {
          if (method === 'canonical') guard(input.value);
          else validation(guard, input.value, official);
        }
        const elapsed = (performance.now() - start) / iterations;
        if (sample >= 0)
          benchmarks.push({
            input: input.name,
            length: input.length ?? null,
            jsonBytes: Buffer.byteLength(expected),
            method,
            variant: name,
            sample,
            elapsedMsPerCall: elapsed,
          });
      }
    }
  }
}
const encodings = inputs.map((input) => {
  const counts = {};
  for (const name of variants) {
    let calls = 0,
      bytes = 0;
    class CountingEncoder extends TextEncoder {
      encode(text) {
        calls++;
        const result = super.encode(text);
        bytes += result.length;
        return result;
      }
    }
    createGuard(compiled[name], InterpretationError, PROFILE, CountingEncoder)(input.value);
    counts[name] = { calls, encodedBytes: bytes };
  }
  return { input: input.name, counts };
});

const shortcutCases = [
  {
    name: 'in-place mutation with alias result',
    make: () => ({ n: 1 }),
    validate: (v) => {
      v.n = 2;
      return v;
    },
  },
  {
    name: 'in-place mutation with equal distinct result',
    make: () => ({ n: 1 }),
    validate: (v) => {
      v.n = 2;
      return { n: 2 };
    },
  },
  {
    name: 'post-validation invalid aliased result',
    make: () => ({ n: 1 }),
    validate: (v) => {
      v.n = -0;
      return v;
    },
  },
  {
    name: 'descriptor proxy changes across post-validation passes',
    make: () => {
      let n = 0;
      return new Proxy(
        { n: 1 },
        {
          getOwnPropertyDescriptor(target, key) {
            const desc = Reflect.getOwnPropertyDescriptor(target, key);
            if (key === 'n') desc.value = ++n;
            return desc;
          },
        },
      );
    },
    validate: (v) => v,
  },
];
const shortcuts = shortcutCases.map((entry) => ({
  name: entry.name,
  outcomes: Object.fromEntries(
    ['current', 'cachedInitial', 'aliasPostOne'].map((policy) => {
      try {
        validation(guards.baseline, entry.make(), entry.validate, policy);
        return [policy, { accepted: true }];
      } catch (error) {
        return [policy, { accepted: false, code: error.code, message: error.message }];
      }
    }),
  ),
}));
const metadata = {
  capturedAt: new Date().toISOString(),
  exactHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  node: process.version,
  typescriptTranspiler: ts.version,
  platform: `${os.platform()} ${os.release()} ${os.arch()}`,
  cpu: os.cpus()[0].model,
  lockSha256: hash(readFileSync('npm-shrinkwrap.json')),
  originalSourceSha256: hash(original),
  harnessHashes: Object.fromEntries(
    ['candidates.mjs', 'probe.ts', 'run.mjs'].map((name) => [
      name,
      hash(readFileSync('experiments/canonical-guard/' + name)),
    ]),
  ),
  input: {
    path: inputPath,
    compressedSha256: hash(compressed),
    rawSha256: hash(raw),
    sourceCid: source.root,
    entries: fixture.entries.length,
  },
  method: {
    samples,
    iterationsPerSample: iterations,
    warmupSamples: 3,
    order: 'rotated per sample',
    validation:
      'unchanged three canonical guards around official pinned Lexicon validate; hand-extracted wrapper, not end-to-end Folder timing',
  },
  limits: [
    'Bounded independent kernels on reconstructed P0 state shapes and additional string/record shapes; no growing-history catch-up',
    'Single Node process; rotating order and warmup reduce but do not eliminate JIT/GC/host noise',
    'No runtime or dependency source is changed; candidate code is compiled/evaluated only in this isolated experiment',
    'Shortcut cases use controlled validator callbacks to expose current wrapper behavior, not claims of observed upstream in-place mutation',
  ],
};
writeFileSync(
  output + 'sources.json',
  JSON.stringify({ originalSourceSha256: hash(original), sources, compiled }, null, 2) + '\n',
);
writeFileSync(
  output + 'node.json',
  JSON.stringify({ metadata, differences, benchmarks, encodings, shortcuts }, null, 2) + '\n',
);
console.log(
  JSON.stringify({
    variants: variants.length,
    differentialCasesPerVariant: Object.values(differences.comparisons)[0].cases,
    benchmarkRows: benchmarks.length,
    output: output + 'node.json',
  }),
);
