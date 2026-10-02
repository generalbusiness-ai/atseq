import test from 'node:test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { nativePrefixFixture } from './support/native-prefix-fixture.ts';
import { nativePrefixCorpus } from './support/native-prefix-corpus.ts';
test('one genuine verified prefix owns retries and compact authority across pending tails', async () => {
  const directory = process.env.ATSEQ_NATIVE_PREFIX_CAPTURE_DIR ?? '.atseq-local/native-prefix';
  const fixture = process.env.ATSEQ_NATIVE_PREFIX_FIXTURE_PATH
    ? JSON.parse(await readFile(process.env.ATSEQ_NATIVE_PREFIX_FIXTURE_PATH, 'utf8'))
    : await nativePrefixFixture();
  const result = await nativePrefixCorpus(fixture);
  await mkdir(directory, { recursive: true });
  await writeFile(directory + '/fixture.json', JSON.stringify(fixture) + '\n');
  await writeFile(directory + '/result.json', JSON.stringify({ node: process.version, ...result }, null, 2) + '\n');
  console.log(JSON.stringify({ node: process.version, ...result }));
});
