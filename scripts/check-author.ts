import assert from 'node:assert/strict';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { historicalReplay } from '../tests/support/historical-replay.ts';
import { execFileSync } from 'node:child_process';
import { SourceBundle } from '../src/definition/source.ts';
const root = 'experiments/agent-authored',
  directory = root + '/mending-circle-tool-desk';
const read = async (path: string) => JSON.parse(await readFile(path, 'utf8'));
const result = await read(directory + '/result.json'),
  transcript = await read(directory + '/transcript.json'),
  before = await read(root + '/host-before.json'),
  after = await read(root + '/host-after.json');
assert.deepEqual(before.hashes, after.hashes);
assert.ok(Date.parse(before.capturedAt) < Date.parse(transcript.startedAt));
assert.ok(Date.parse(after.capturedAt) > Date.parse(result.completedAt));
for (const [path, hash] of Object.entries(before.hashes)) {
  const retained = path.startsWith('experiments/generated/app/')
    ? root + '/host-build/' + path.slice('experiments/generated/app/'.length)
    : path;
  const bytes = path.startsWith('experiments/generated/app/')
    ? await readFile(retained)
    : execFileSync('git', ['show', `26d15287f3955eebd543f2c519c8506378c63d60:${path}`]);
  assert.equal(
    createHash('sha256').update(bytes).digest('hex'),
    hash,
    `Historical authoring host/build differs: ${path}`,
  );
}
assert.ok(transcript.steps.length >= 15);
assert.ok(
  transcript.steps.every(
    (step: any) => step.command === 'npm run --silent atseq' && step.exitCode === 0 && step.response.ok,
  ),
);
const forbidden = new Set(['privateKey', 'password', 'accessJwt', 'refreshJwt', 'token', 'jwtSecret', 'writer']);
function scan(value: any) {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    assert.equal(forbidden.has(key), false, `Retained secret field: ${key}`);
    scan(child);
  }
}
scan(result);
scan(transcript);
const files: Record<string, Uint8Array> = {};
async function walk(path = '') {
  for (const entry of await readdir(join(directory, 'source', path), { withFileTypes: true })) {
    const relative = path ? `${path}/${entry.name}` : entry.name;
    if (entry.isDirectory()) await walk(relative);
    else if (relative !== 'manifest.json') files[relative] = await readFile(join(directory, 'source', relative));
  }
}
await walk();
const source = await SourceBundle.pack(await read(directory + '/source/manifest.json'), files);
assert.equal(source.root, result.definition);
assert.deepEqual(await source.write(), new Uint8Array(await readFile(directory + '/definition.car')));
if (process.argv.includes('--capture'))
  throw new Error('Historical captures are immutable; author a new v1 app instead');
const historical = await historicalReplay(
  await readFile(directory + '/application.atseq.json'),
  result.invitation,
  root,
);
const replay = {
  snapshot: historical.snapshot,
  history: { entries: historical.checked.input.entries },
  retries: historical.checked.retries,
  anchor: { cid: historical.checked.input.genesisCid },
  folder: { query: async (_name: string, _params: unknown) => historical.summary },
};
assert.equal(replay.snapshot.projection.frontier.position, 5);
assert.equal(replay.snapshot.projection.definition, result.definition);
assert.deepEqual(
  replay.snapshot.projection.outcomes.map(({ position, intent, outcome }: any) => ({ position, intent, outcome })),
  result.outcomes,
);
assert.deepEqual(await replay.folder.query('summary', {}), result.finalQuery.response);
assert.equal(replay.retries.length, 5);
const submitted = transcript.steps.filter((s: any) => s.request.operation === 'submit');
assert.equal(submitted.length, 6);
assert.deepEqual(submitted.at(-1).response.result.receipt, submitted.at(-2).response.result.receipt);
assert.equal(submitted.at(-1).response.result.intent, submitted.at(-2).response.result.intent);
for (const step of submitted) {
  const cid = step.response.result.intent,
    entry = replay.history.entries.find(
      (e: any) => replay.snapshot.projection.outcomes[e.position - 1]?.intent === cid,
    );
  assert.ok(entry);
  assert.equal(step.response.result.receipt.position, entry.position);
  assert.deepEqual(step.request.payload, entry.signedIntent.intent.payload);
}
const sourceHashes: Record<string, string> = {};
async function hashes(path: string) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const name = join(path, entry.name);
    if (entry.isDirectory()) await hashes(name);
    else
      sourceHashes[name] = createHash('sha256')
        .update(await readFile(name))
        .digest('hex');
  }
}
await hashes(directory);
await writeFile(
  'experiments/generated/historical-author-results.json',
  JSON.stringify(
    {
      passed: true,
      historical: true,
      interpreter: 'Hash-checked original browser worker; v1 does not support this spike profile',
      browserVersion: historical.browserVersion,
      measuredAt: new Date().toISOString(),
      title: result.invitation.title,
      authoring:
        'Existing agent, documented adapter only; separate from fixture generation and final independent review.',
      hostAndBuildUnchanged: true,
      hostFilesCompared: Object.keys(before.hashes).length,
      adapterCalls: transcript.steps.length,
      entries: 5,
      source: source.root,
      genesis: replay.anchor.cid,
      frontier: replay.snapshot.projection.frontier,
      sourceHashes,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  'Historical agent-authored app: original binary replays source and 5 signed entries; documented adapter calls, same exact retry, unchanged host/build.',
);
