import test from 'node:test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { nativePrefixPreservedFixture } from './support/native-prefix-preserved-fixture.ts';
import { nativePrefixPreservedCorpus } from './support/native-prefix-preserved-corpus.ts';
test(
  'private preservation audits genuine current and discarded prefix floors without effects',
  { timeout: 60_000 },
  async () => {
    const directory = process.env.ATSEQ_NATIVE_PRESERVED_CAPTURE_DIR ?? '.atseq-local/native-prefix-preserved';
    const fixture = process.env.ATSEQ_NATIVE_PRESERVED_FIXTURE_PATH
      ? JSON.parse(await readFile(process.env.ATSEQ_NATIVE_PRESERVED_FIXTURE_PATH, 'utf8'))
      : await nativePrefixPreservedFixture();
    const result = await nativePrefixPreservedCorpus(fixture);
    await mkdir(directory, { recursive: true });
    await writeFile(directory + '/fixture.json', JSON.stringify(fixture) + '\n');
    await writeFile(directory + '/result.json', JSON.stringify({ node: process.version, ...result }, null, 2) + '\n');
    console.log(JSON.stringify({ node: process.version, ...result }));
  },
);
