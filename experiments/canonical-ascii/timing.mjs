import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { gunzipSync } from 'node:zlib';
import os from 'node:os';
import { fromBytes } from '@atcute/cbor';
import { basis, sources, compiled, compile, output, hash } from './sources.mjs';
import { createGuard } from './guards.mjs';

// Load the unchanged real Schemas class twice, replacing only its baseline guard import.
const schemaUrl = new URL('../../src/definition/schemas.ts', import.meta.url).href;
const baselineSchemaUrl = schemaUrl + '?canonical-ascii=baseline';
const valueUrl = new URL('../../src/core/values.ts', import.meta.url).href;
const baselineValueUrl = valueUrl + '?canonical-ascii=baseline';
const schemaSource = readFileSync(new URL(schemaUrl), 'utf8');
assert.equal(schemaSource, execFileSync('git', ['show', `${basis}:src/definition/schemas.ts`], { encoding: 'utf8' }));
assert.ok(schemaSource.includes("'../core/values.ts'"));
const baselineSchemaCompiled = compile(schemaSource.replace("'../core/values.ts'", JSON.stringify(baselineValueUrl)));
registerHooks({
  load(request, context, next) {
    if (request === baselineValueUrl) return { format: 'module', source: compiled.baseline, shortCircuit: true };
    if (request === baselineSchemaUrl) return { format: 'module', source: baselineSchemaCompiled, shortCircuit: true };
    return next(request, context);
  },
});
const { Schemas: BaselineSchemas } = await import(baselineSchemaUrl);
const { Schemas } = await import(schemaUrl);
const { SourceBundle } = await import('../../src/definition/source.ts');
const { decodeBlock } = await import('../../src/protocol/wire.ts');
const { InterpretationError, PROFILE } = await import('../../src/core/profile.ts');

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
// Reuse retained Lexicon bytes, not the historical application's profile admission.
const manifest = decodeBlock(await source.get(source.root));
const readJson = async (path) => {
  const file = manifest.files.find((file) => file.path === path);
  assert.ok(file, path);
  return JSON.parse(new TextDecoder().decode(await source.get(file.cid)));
};
const documents = await Promise.all(manifest.lexicons.map(readJson));
const validators = { baseline: new BaselineSchemas(documents), actual: new Schemas(documents) };
const ref = manifest.state.ref;
if (process.argv.includes('--prepare')) {
  const initial = await readJson(manifest.state.initial);
  for (const validator of Object.values(validators)) validator.validate(ref, initial);
  console.log(JSON.stringify({ prepared: true, sourceCid: source.root, schemaRef: ref }));
  process.exit(0);
}
const variants = Object.keys(validators),
  samples = 13,
  iterations = 5,
  warmupSamples = 5;
const rows = [],
  inputs = [],
  encodings = [];
for (const length of [0, 99, 999, 9999]) {
  const value = { candidates: Array.from({ length }, (_, i) => i + 1), selected: String(length) };
  const expected = createGuard(compiled.baseline, InterpretationError, PROFILE)(value);
  assert.equal(createGuard(compiled.actual, InterpretationError, PROFILE)(value), expected);
  for (const validator of Object.values(validators)) validator.validate(ref, value);
  inputs.push({ length, jsonBytes: Buffer.byteLength(expected), canonicalSha256: hash(expected) });
  for (let sample = -warmupSamples; sample < samples; sample++) {
    const order = (sample + warmupSamples) % 2 ? [...variants].reverse() : variants;
    for (const variant of order) {
      const start = performance.now();
      for (let call = 0; call < iterations; call++) validators[variant].validate(ref, value);
      const elapsedMsPerCall = (performance.now() - start) / iterations;
      if (sample >= 0) rows.push({ length, variant, sample, elapsedMsPerCall });
    }
  }
  const counts = {};
  for (const variant of variants) {
    let calls = 0,
      encodedBytes = 0,
      chargedBytes = 0;
    class CountingEncoder extends TextEncoder {
      encode(text) {
        calls++;
        const result = super.encode(text);
        encodedBytes += result.length;
        return result;
      }
    }
    const guard = createGuard(compiled[variant], InterpretationError, PROFILE, CountingEncoder);
    assert.equal(
      guard(value, undefined, undefined, (bytes) => {
        chargedBytes += bytes;
      }),
      expected,
    );
    counts[variant] = { calls, encodedBytes, chargedBytes };
  }
  encodings.push({ length, counts });
}
writeFileSync(
  output + 'timing.json',
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      basis,
      codeHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
      node: process.version,
      platform: `${os.platform()} ${os.release()} ${os.arch()}`,
      cpu: os.cpus()[0].model,
      sourceHashes: Object.fromEntries(Object.entries(sources).map(([name, source]) => [name, hash(source)])),
      schemasSha256: hash(schemaSource),
      baselineSchemasCompiledSha256: hash(baselineSchemaCompiled),
      lockSha256: hash(readFileSync('npm-shrinkwrap.json')),
      harnessSha256: hash(readFileSync(new URL(import.meta.url))),
      input: {
        path: inputPath,
        compressedSha256: hash(compressed),
        rawSha256: hash(raw),
        sourceCid: source.root,
        entries: fixture.entries.length,
        historicalApplicationProfile: manifest.profile,
        lexiconDocumentsSha256: hash(JSON.stringify(documents)),
      },
      method: {
        samples,
        iterationsPerSample: iterations,
        warmupSamples,
        order: 'alternating per sample',
        timing:
          'Actual unchanged Schemas.validate methods, with separate equivalent official Lexicon instances. Baseline class uses only pre-change guard via a process-local import substitution; actual class imports production source normally.',
        counting:
          'Outside timing: compile exact before/after guard sources and inject a counting TextEncoder, preserving all charged bytes.',
      },
      limits: [
        'Bounded reconstructed P0 shapes, no growing-history replay or end-to-end speedup claim',
        'Retained P0 application has the historical v1 profile; only its exact Lexicon documents and state shapes are reused for this isolated Schemas kernel, not admitted as a current application',
        'Own heavy processes stopped and programme quiet window requested; unrelated host activity, JIT and GC remain possible noise',
        'Baseline class is compiled by the locked ts-morph TypeScript API; actual class uses the normal source runner',
      ],
      inputs,
      rows,
      encodings,
    },
    null,
    2,
  ) + '\n',
);
console.log(JSON.stringify({ samples: rows.length, actualMethod: 'Schemas.validate', passed: true }));
