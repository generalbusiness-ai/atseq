import assert from 'node:assert/strict';
import { resolve, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = resolve('.'), label = process.argv[2];
assert.match(label, /^node(?:22|24|26)$/);
const compiled = join(root, '.atseq-local/writer-compiled-final-16f-node26');
const imported = path => import(pathToFileURL(join(root, path)));
const { loadNodeOAuthAdapter } = await imported('dist/src/host/oauth-loader.js');
const { NativeAccountWriter } = await imported('dist/src/transport/native-account-writer.js');
const { PdsError } = await imported('dist/src/transport/pds-operations.js');
const { AtseqError } = await imported('dist/src/core/errors.js');
const { NativeWriterFixture, WRITER_COLLECTION } = await import(pathToFileURL(join(compiled, 'tests/support/native-account-writer-fixture.js')));
const { OAUTH_DID, OAUTH_OTHER_DID, OAUTH_SCOPE } = await import(pathToFileURL(join(compiled, 'tests/support/oauth-fixture.js')));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const script = fileURLToPath(import.meta.url);
const pins = { producer: '16f36988179a0ccacf1189eeb7b2b0e3453d6836', runtime: process.version,
  executable: process.execPath, executableSHA256: hash(await readFile(process.execPath)),
  scriptSHA256: hash(await readFile(script)), preparedBeforeExecution: new Date().toISOString(),
  productionBuild: 'final/build-provenance-16f-node26.json',
  productionBuildSHA256: hash(await readFile(join(root, 'dist/build-provenance.json'))),
  testWrapperInputs: 'final/compiled-pins-16f-node26.json',
  semantics: 'All three supplemental runtimes use the unchanged common Node26-built production outputs and Node26-transpiled test fixtures. Original complete source/emitted matrices used separately built outputs on each selected runtime.' };
await writeFile(join(root, 'experiments/post-spike-evidence/2026-10-02/native-account-writer-aw-f2/final/supplemental-pins-16f-' + label + '.json'), JSON.stringify(pins, null, 2) + '\n');
let fixture = await new NativeWriterFixture().initialize();
const nativeFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  assert.equal(typeof init.dispatcher.dispatch, 'function');
  return fixture.fetch(input, init);
};
const owner = await loadNodeOAuthAdapter(fixture.options());
await owner.begin(OAUTH_DID, OAUTH_SCOPE);
const handle = await owner.complete(fixture.callback());
const writer = await NativeAccountWriter.open(handle, OAUTH_DID);
const json = value => new Response(JSON.stringify(value));
const reject = async (work, code) => assert.rejects(work, error =>
  (error instanceof AtseqError || error instanceof PdsError) && error.code === code && !error.message.includes('private-secret'));
const cases = [];
try {
  for (const value of [{ cid: 'bad', rev: 'x' }, { cid: fixture.commit, rev: '' },
    { cid: fixture.commit, rev: 'é'.repeat(4097) }, { cid: fixture.commit, rev: 1 }]) {
    fixture.overrideResponse = () => json(value);
    await reject(() => writer.latestCommit(), 'InvalidCommit');
  }
  cases.push('latest-commit-malformed-CID-empty-type-and-8192UTF8-rev');
  const valid = { uri: `at://${OAUTH_DID}/${WRITER_COLLECTION}/first`, cid: fixture.commit, value: {} };
  for (const value of [
    { records: [], cursor: 1 }, { records: [valid, valid] },
    { records: [{ ...valid, uri: `at://${OAUTH_OTHER_DID}/${WRITER_COLLECTION}/first` }] },
    { records: [{ ...valid, uri: `at://${OAUTH_DID}/ai.generalbusiness.atseq.other/first` }] },
  ]) {
    fixture.overrideResponse = () => json(value);
    await reject(() => writer.list(WRITER_COLLECTION, { limit: 1 }),
      value.records.length > 1 || typeof value.cursor === 'number' ? 'InvalidPage' : 'InvalidResponse');
  }
  cases.push('list-over-requested-limit-nonstring-cursor-foreign-account-and-collection');
  for (const value of [null, { commit: { cid: fixture.commit, rev: 'x' } },
    { commit: { cid: fixture.commit, rev: 'x' }, results: [valid] },
    { commit: { cid: 'bad', rev: 'x' }, results: [] }]) {
    fixture.overrideResponse = () => json(value);
    await reject(() => writer.applyConditional([], fixture.commit), 'InvalidResponse');
  }
  cases.push('apply-commit-and-result-count-required');
  const exact = { ...valid, value: { text: '' } };
  const envelope = new TextEncoder().encode(JSON.stringify(exact)).length;
  exact.value.text = 'x'.repeat(1048576 - envelope);
  fixture.overrideResponse = () => json(exact);
  assert.equal((await writer.get(WRITER_COLLECTION, 'first')).value.text.length, 1048576 - envelope);
  exact.value.text += 'x';
  await reject(() => writer.get(WRITER_COLLECTION, 'first'), 'input');
  cases.push('actual-valid-record-response-exact-1MiB-and-plus-one');
  fixture.overrideResponse = undefined;
  fixture.records.clear();
  fixture.records.set('a', { text: 'x'.repeat(600000) });
  fixture.records.set('b', { text: 'x'.repeat(600000) });
  const before = fixture.paths.length;
  await reject(() => writer.list(WRITER_COLLECTION, { limit: 2 }), 'input');
  assert.equal(fixture.paths.length, before + 1, 'No automatic lower-page retry');
  const page = await writer.list(WRITER_COLLECTION, { limit: 1 });
  assert.equal(page.records.length, 1);
  assert.equal(typeof page.cursor, 'string');
  assert.equal(fixture.paths.length, before + 2, 'Caller owns explicit conservative page');
  cases.push('actual-over-cap-page-single-send-then-explicit-lower-page');
  fixture.invalidTokenOnce = true;
  fixture.tokenPadding = 1048576;
  const beforeToken = fixture.count('/token');
  await assert.rejects(() => writer.upload(new Uint8Array(524288)), error =>
    error instanceof AtseqError && error.code === 'input' && error.message === 'OAuth operation failed');
  assert.ok(fixture.count('/token') > beforeToken);
  cases.push('actual-maintained-incoming-token-over-1MiB-is-generic-input-without-recovery-tag');
  console.log(JSON.stringify({ ...pins, cases, maintainedClient: true, syntheticASAndResource: true,
    publicProviderExecuted: false, nativeApplicationAcceptanceClaim: false }));
} finally {
  globalThis.fetch = nativeFetch;
}
