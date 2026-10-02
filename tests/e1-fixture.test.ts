import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { canonicalJson } from '../src/core/values.ts';
import { prepareFixture, type E1Fixture } from '../experiments/e1-native/fixtures.ts';
import { verifyFixture, replaySmall } from '../experiments/e1-native/validate.ts';
import { matrix, plan, oracle, unique16 } from '../experiments/e1-native/workload.ts';
test('E1 final-head matrix enumerates every requested delta and independent workload conservation', () => {
  const cells = matrix();
  assert.equal(cells.length, 12);
  assert.equal(cells.filter((cell) => cell.valid).length, 11);
  assert.deepEqual(
    cells.filter((cell) => !cell.valid),
    [{ n: 100, delta: 1000, base: -900, target: 100, valid: false, reason: 'delta exceeds final ordered-entry count' }],
  );
  assert.equal(
    new Set(Array.from({ length: 10_001 }, (_, n) => Buffer.from(unique16(1, n)).toString('hex'))).size,
    10_001,
  );
  for (const n of [100, 1000, 10_000])
    for (const actors of [1, 16] as const)
      for (const activation of [false, true]) {
        const input = { n, actors, growing: true, activation, invalidAction: true },
          rows = plan(input),
          expected = oracle(input);
        assert.equal(rows.length, n);
        assert.equal(expected.admitted.length, actors);
        assert.equal(expected.actions, n - actors - Number(activation));
        const values = (expected.state as { values: number[] }).values;
        assert.equal(
          values.reduce((sum, amount) => sum + amount, 0),
          expected.state.count,
        );
        assert.equal(values.length, expected.actions - 1);
        assert.equal(expected.outcomes.filter((row) => row.decision === 'ineffective').length, 1);
      }
});
for (const workload of [
  { n: 100, actors: 1 as const, growing: false, activation: false, invalidAction: false },
  { n: 100, actors: 16 as const, growing: true, activation: true, invalidAction: true },
])
  test('E1 genuine selected roots and independent native replay: ' + JSON.stringify(workload), async () => {
    const directory = process.env.ATSEQ_E1_FIXTURE_DIRECTORY;
    const name = workload.actors === 1 ? 'bounded-one-actor' : 'growing-many-actors-activation-invalid-action';
    const fixture: E1Fixture = directory
      ? JSON.parse(gunzipSync(await readFile(`${directory}/${name}-100.json.gz`)).toString())
      : await prepareFixture(workload);
    const checked = await verifyFixture(fixture);
    assert.equal(checked.entries, workload.n);
    assert.equal(checked.selectedRoots.length, fixture.roots.length + 3);
    const first = await replaySmall(fixture),
      fresh = await replaySmall(fixture);
    assert.deepEqual(first, fresh);
    assert.equal((first.state as { count: number }).count, workload.actors === 1 ? 540 : 666);
    const tampered = structuredClone(fixture);
    tampered.expected.state.count++;
    await assert.rejects(verifyFixture(tampered), /Stored expected state differs/);
    assert.ok(fixture.faults.some((fault) => fault.name === 'duplicate-request'));
    assert.ok(fixture.faults.some((fault) => fault.name === 'duplicate-nonce'));
    assert.ok(fixture.faults.some((fault) => fault.name === 'same-height-fork'));
    console.log(
      JSON.stringify({
        workload,
        preparation: fixture.preparation,
        validation: checked,
        snapshotSha256: createHash('sha256').update(canonicalJson(first)).digest('hex'),
      }),
    );
  });

test('E1 preparation owns the workload before asynchronous key generation', async () => {
  const workload = { n: 100, actors: 1 as const, growing: false, activation: false, invalidAction: false };
  const pending = prepareFixture(workload, false);
  workload.n = 1000;
  workload.growing = true;
  const fixture = await pending;
  assert.equal(fixture.workload.n, 100);
  assert.equal(fixture.workload.growing, false);
  assert.equal(fixture.entries.length, 100);
  assert.equal(fixture.expected.state.count, 540);
});
