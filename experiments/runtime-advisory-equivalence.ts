import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { runCorpus } from '../tests/support/corpus.ts';
import { runRuntimeCorpus } from '../tests/support/runtime-corpus.ts';
import { runEvolutionCorpus } from '../tests/support/evolution-corpus.ts';
import { supportedProfiles } from '../src/protocol/identity.ts';

const phase = process.argv[2];
assert.ok(phase === 'before' || phase === 'after');
const lockBytes = await readFile('npm-shrinkwrap.json'),
  lock = JSON.parse(lockBytes.toString()),
  cases = [...(await runCorpus()), ...(await runRuntimeCorpus())];
await runEvolutionCorpus(async (name, run) => {
  try {
    await run();
    cases.push({ name, passed: true });
  } catch (error) {
    cases.push({ name, passed: false, detail: (error as Error).message });
  }
});
const result = {
  phase,
  capturedAt: new Date().toISOString(),
  node: process.version,
  braceExpansion: lock.packages['node_modules/brace-expansion'].version,
  lockSha256: createHash('sha256').update(lockBytes).digest('hex'),
  method:
    'Shared protocol, authored runtime and activation/evolution assertions; independent fixture keys and nonces. Compares asserted contract behavior and profile CIDs, not randomly generated log bytes.',
  profiles: await supportedProfiles(),
  cases,
};
await writeFile(
  `experiments/post-spike-evidence/2026-10-01/runtime-advisory-equivalence-${phase}.json`,
  JSON.stringify(result, null, 2) + '\n',
);
assert.deepEqual(
  cases.filter((entry) => !entry.passed),
  [],
);
if (phase === 'after') {
  const before = JSON.parse(
    await readFile('experiments/post-spike-evidence/2026-10-01/runtime-advisory-equivalence-before.json', 'utf8'),
  );
  assert.deepEqual(result.profiles, before.profiles);
  assert.deepEqual(result.cases, before.cases);
}
console.log(
  `Runtime patch ${phase}: ${cases.length} shared contract cases passed; ${result.profiles.length} profile CIDs recorded.`,
);
