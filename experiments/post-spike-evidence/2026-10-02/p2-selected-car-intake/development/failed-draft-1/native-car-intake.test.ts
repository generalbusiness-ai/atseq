import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { carIntakeCorpus, type IntakeFixture, type IntakePrefixFixture } from './support/native-car-intake.ts';
import { nativeObserverCarCorpus } from './support/native-observer-portable.ts';
test('bounded selected CAR DATA and exact admission preserve genuine P1 and legacy CAR predicates', async () => {
  const directory = process.env.ATSEQ_CAR_INTAKE_OUTPUT ?? '.atseq-local/p2-car-intake',
    fixtures = JSON.parse(await readFile(directory + '/fixtures.json', 'utf8')) as {
      fixtures: IntakeFixture[];
      prefix: IntakePrefixFixture;
    },
    result = await carIntakeCorpus(fixtures.fixtures, fixtures.prefix),
    legacy = await nativeObserverCarCorpus();
  assert.equal(legacy.length, 20);
  assert.ok(result.cases.length >= 25);
  await mkdir(directory, { recursive: true });
  await writeFile(
    directory + '/source-' + process.versions.node + '.json',
    JSON.stringify({ runtime: process.version, ...result, legacyCases: legacy }, null, 2) + '\n',
  );
  console.log(
    JSON.stringify({
      runtime: process.version,
      cases: result.cases.length,
      legacy: legacy.length,
      outputs: result.outputs,
    }),
  );
});
