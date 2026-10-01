import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { ts } from 'ts-morph';
import { candidateSource } from './candidates.mjs';

const variant = process.argv[2];
assert.ok(variant === 'baseline' || variant === 'ascii');
const url = new URL('../../src/core/values.ts', import.meta.url).href;
const original = readFileSync(new URL(url), 'utf8');
const source = candidateSource(original, variant);
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
registerHooks({
  load(request, context, next) {
    if (request === url) return { format: 'module', source: compiled, shortCircuit: true };
    return next(request, context);
  },
});
const { runCorpus } = await import('../../tests/support/corpus.ts');
const { runRuntimeCorpus } = await import('../../tests/support/runtime-corpus.ts');
const { runEvolutionCorpus } = await import('../../tests/support/evolution-corpus.ts');
const { supportedProfiles } = await import('../../src/protocol/identity.ts');
const { wrapperCases } = await import('./schema-probe.ts');
const cases = [...(await runCorpus()), ...(await runRuntimeCorpus())];
await runEvolutionCorpus(async (name, run) => {
  try {
    await run();
    cases.push({ name, passed: true });
  } catch (error) {
    cases.push({ name, passed: false, detail: error.message });
  }
});
const result = {
  capturedAt: new Date().toISOString(),
  variant,
  node: process.version,
  method:
    'In an isolated Node process, loader substitutes only values.ts with the compiled experimental source; all shared corpus consumers use that module. No on-disk production file is modified.',
  candidateSha256: createHash('sha256').update(source).digest('hex'),
  compiledSha256: createHash('sha256').update(compiled).digest('hex'),
  profiles: await supportedProfiles(),
  wrapperOutcomes: wrapperCases(),
  cases,
};
writeFileSync(
  `experiments/post-spike-evidence/2026-10-01/canonical-guard-shared-${variant}.json`,
  JSON.stringify(result, null, 2) + '\n',
);
assert.deepEqual(
  cases.filter((entry) => !entry.passed),
  [],
);
console.log(JSON.stringify({ variant, cases: cases.length, passed: true }));
