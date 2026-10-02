import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { prepare } from './fixture.ts';
const [actions, pattern, directory] = process.argv.slice(2);
if (!directory) throw Error('Usage: prepare.mjs ACTIONS PATTERN DIRECTORY');
await mkdir(directory, { recursive: true });
const producer = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const paths = [
  'experiments/r0-native/fixture.ts',
  'experiments/r0-native/prepare.mjs',
  'tests/support/identity-corpus.ts',
  'tests/support/native-proof-corpus.ts',
  'tests/support/native-application-fixture.ts',
  'tests/support/native-authority-fixture.ts',
  'package.json',
  'npm-shrinkwrap.json',
];
const sourceHashes = Object.fromEntries(
  await Promise.all(
    paths.map(async (path) => [
      path,
      createHash('sha256')
        .update(await readFile(path))
        .digest('hex'),
    ]),
  ),
);
const fixture = await prepare(Number(actions), pattern),
  bytes = Buffer.from(JSON.stringify(fixture) + '\n'),
  compressed = gzipSync(bytes);
const basename = pattern + '-' + actions;
await writeFile(directory + '/' + basename + '.json.gz', compressed);
const record = {
  producer,
  sourceHashes,
  node: process.version,
  actions: Number(actions),
  pattern,
  counts: fixture.counts,
  costs: fixture.costs,
  preparationMs: fixture.preparationMs,
  fixtureBytes: bytes.length,
  gzipBytes: compressed.length,
  fixtureSha256: createHash('sha256').update(bytes).digest('hex'),
  gzipSha256: createHash('sha256').update(compressed).digest('hex'),
  sourceBasis: {
    main: '7de9dcd447658679f3a94866c7f0eb5506c63659',
    e1: '2395c470283111e4817dde1342e973edd5e4e419',
    e1Producer: 'dd2f97bd710c88fa5c3f629f8efa6f00f837e5b1',
  },
  scope: 'Finite R0 experiment producer; N domain actions; no checkpoint certification/publication/restore capability',
};
await writeFile(directory + '/' + basename + '-producer.json', JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify(record));
