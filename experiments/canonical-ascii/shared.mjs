import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { writeFileSync } from 'node:fs';
import { sources, compiled, output, hash, basis } from './sources.mjs';

const variant = process.argv[2];
assert.ok(variant === 'baseline' || variant === 'actual');
if (variant === 'baseline') {
  const url = new URL('../../src/core/values.ts', import.meta.url).href;
  registerHooks({
    load(request, context, next) {
      if (request === url) return { format: 'module', source: compiled.baseline, shortCircuit: true };
      return next(request, context);
    },
  });
}
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
  basis,
  variant,
  node: process.version,
  method:
    variant === 'baseline'
      ? 'Isolated process substitutes only pre-change values.ts; all other current source and dependencies remain installed.'
      : 'Actual on-disk production implementation, no module substitution.',
  sourceSha256: hash(sources[variant]),
  profiles: await supportedProfiles(),
  wrapperOutcomes: wrapperCases(),
  cases,
};
writeFileSync(output + `shared-${variant}.json`, JSON.stringify(result, null, 2) + '\n');
assert.deepEqual(
  cases.filter((entry) => !entry.passed),
  [],
);
console.log(JSON.stringify({ variant, cases: cases.length, passed: true }));
