import { mkdir, writeFile } from 'node:fs/promises';
import { intakeFixtures, intakePrefixFixture } from '../../tests/support/native-car-intake.ts';
const directory = process.env.ATSEQ_CAR_INTAKE_OUTPUT ?? '.atseq-local/p2-car-intake';
await mkdir(directory, { recursive: true });
const started = performance.now(),
  data = { fixtures: await intakeFixtures(), prefix: await intakePrefixFixture() };
await writeFile(directory + '/fixtures.json', JSON.stringify(data) + '\n');
console.log(
  JSON.stringify({
    fixtures: data.fixtures.map((f) => ({ curve: f.curve, root: f.root, blocks: f.blocks.length })),
    milliseconds: performance.now() - started,
    publicFixturesOnly: true,
  }),
);
