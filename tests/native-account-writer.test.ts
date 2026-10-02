import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

test('owned native writer uses genuine maintained Node OAuth and finite bounded standard operations', () => {
  const raw = execFileSync(
    process.execPath,
    ['--conditions=atseq-source', '--import', 'tsx', 'tests/support/native-account-writer-node-probe.ts'],
    { encoding: 'utf8', timeout: 60000 },
  );
  const result = JSON.parse(raw);
  assert.ok(result.cases.length >= 12);
  assert.equal(result.maintainedClient, true);
  assert.equal(result.publicProviderExecuted, false);
  console.log(raw.trim());
});
