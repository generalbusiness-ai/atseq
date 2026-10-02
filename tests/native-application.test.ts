import test from 'node:test';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { nativeApplicationFixture } from './support/native-application-fixture.ts';
import { nativeApplicationFaultBundle } from './support/native-application-fault-bundle.ts';
import { nativeApplicationCorpus } from './support/native-application-corpus.ts';
test('private native application interprets exact supported-source authenticated publications', async () => {
  const directory = process.env.ATSEQ_NATIVE_APPLICATION_CAPTURE_DIR ?? '.atseq-local/native-application';
  const fixture = process.env.ATSEQ_NATIVE_APPLICATION_FIXTURE_PATH
    ? JSON.parse(await readFile(process.env.ATSEQ_NATIVE_APPLICATION_FIXTURE_PATH, 'utf8'))
    : await nativeApplicationFixture();
  const cases = await nativeApplicationCorpus(fixture);
  const code = await nativeApplicationFaultBundle();
  const probe = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
  const faults = await probe.nativeApplicationFaultProbe(fixture);
  await mkdir(directory, { recursive: true });
  await writeFile(directory + '/fault-bundle.mjs', code);
  await writeFile(directory + '/faults.json', JSON.stringify(faults, null, 2) + '\n');
  await mkdir(directory, { recursive: true });
  await writeFile(directory + '/fixture.json', JSON.stringify(fixture) + '\n');
  console.log(JSON.stringify({ node: process.version, cases, faults, fixtureVectors: fixture.vectors.length }));
});
