import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { replayAuthorityFixtures } from '../../tests/support/native-authority-corpus.ts';
const raw = await readFile(process.argv[2]!);
const cases = await replayAuthorityFixtures(JSON.parse(raw.toString()));
const capture = {
  node: process.version,
  cases,
  fixtureBytes: raw.length,
  fixtureSha256: createHash('sha256').update(raw).digest('hex'),
};
await writeFile(process.argv[3]!, JSON.stringify(capture, null, 2) + '\n');
console.log(JSON.stringify(capture));
