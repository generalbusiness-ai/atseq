import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import {
  carIntakeConformance,
  intakeFixtures,
  intakePrefixFixture,
  type IntakeFixture,
  type IntakePrefixFixture,
} from './support/native-car-intake.ts';
test('bounded selected CAR DATA and exact admission preserve genuine P1 and legacy CAR predicates', async () => {
  const directory = process.env.ATSEQ_CAR_INTAKE_OUTPUT ?? '.atseq-local/p2-car-intake',
    fixtures = process.env.ATSEQ_CAR_INTAKE_FIXTURES
      ? (JSON.parse(await readFile(process.env.ATSEQ_CAR_INTAKE_FIXTURES, 'utf8')) as {
          fixtures: IntakeFixture[];
          prefix: IntakePrefixFixture;
        })
      : { fixtures: await intakeFixtures(), prefix: await intakePrefixFixture() },
    result = await carIntakeConformance(fixtures.fixtures, fixtures.prefix);
  assert.equal(result.legacyCases.length, 20);
  assert.equal(result.cases.length, 24);
  for (const id of ['CI1', 'CI2', 'CI3', 'CI4', 'CI5', 'CI6', 'CI7', 'CI8', 'CI9', 'CI10', 'CI12'])
    assert.ok(
      result.cases.some((name) => name.startsWith(id + ':')),
      id + ' missing',
    );
  await mkdir(directory, { recursive: true });
  await writeFile(
    directory + '/source-' + process.versions.node + '.json',
    JSON.stringify({ runtime: process.version, ...result }, null, 2) + '\n',
  );
  console.log(
    JSON.stringify({
      runtime: process.version,
      cases: result.cases.length,
      legacy: result.legacyCases.length,
      proof: result.proofCases.length,
      outputs: result.outputs,
    }),
  );
});
