import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, readFile, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chartFixture } from '../testdata/apps/fixtures.ts';
import { fixtureApp } from '../tests/support/runtime-corpus.ts';
import { headAt, Anchor } from '../src/protocol/log.ts';
import { bytes, link } from '../src/protocol/wire.ts';
import { exportArchive, importArchive, encodeArchive } from '../src/archive/archive.ts';
import { createIdentity, prepareIntent } from '../src/client/identity.ts';
import { NSID } from '../src/core/nsids.ts';
import { cli } from './helpers/cli.ts';

test('CLI export verifies the invitation instead of accepting the host’s self-pin', async () => {
  const root = await mkdtemp(join(tmpdir(), 'atseq-cli-trust-'));
  const fixture = await chartFixture(),
    app = await fixtureApp(fixture.bundle);
  const foreign = await fixtureApp(fixture.bundle, 'did:plc:dddddddddddddddddddddddd');
  const target = { app: app.anchor.genesis.app, genesis: app.anchor.cid };
  const input = {
    genesis: foreign.anchor.genesis,
    genesisCid: foreign.anchor.cid,
    head: headAt(foreign.anchor),
    entries: [],
    source: bytes(await fixture.bundle.write()),
  };
  const server = createServer((_request, response) => {
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify(input));
  });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  try {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('No test port');
    const host = `http://127.0.0.1:${address.port}`,
      output = join(root, 'archive.json');
    await assert.rejects(() => cli({ operation: 'export', host, ...target, output }), /pinned invitation/);
    await assert.rejects(() => readFile(output), { code: 'ENOENT' });
    await assert.rejects(() => exportArchive(input, target), { code: 'anchor' });
    await assert.rejects(() => Anchor.from(input.genesis, { app: target.app, genesis: foreign.anchor.cid }), {
      code: 'anchor',
    });
    const key = join(root, 'key.json'),
      alias = join(root, 'key-alias');
    await writeFile(key, 'secret', { mode: 0o600 });
    await symlink(key, alias);
    await assert.rejects(
      () => cli({ operation: 'export', host, ...target, output: alias, keyFile: key, overwrite: true }),
      /key or intent/,
    );
    assert.equal(await readFile(key, 'utf8'), 'secret');
  } finally {
    await new Promise<void>((done, reject) => server.close((error) => (error ? reject(error) : done())));
    await rm(root, { recursive: true, force: true });
  }
});

test('CLI replay refuses a single pin; archive import owns verified typed data and codes malformed input', async () => {
  const fixture = await chartFixture(),
    app = await fixtureApp(fixture.bundle),
    target = { app: app.anchor.genesis.app, genesis: app.anchor.cid };
  const input = {
    genesis: app.anchor.genesis,
    genesisCid: app.anchor.cid,
    head: headAt(app.anchor),
    entries: [],
    source: bytes(await fixture.bundle.write()),
  };
  const archive = await exportArchive(input, target),
    raw = encodeArchive(archive);
  for (const pin of [{ app: target.app }, { genesis: target.genesis }])
    await assert.rejects(
      () => cli({ operation: 'replay', source: 'missing', outputDirectory: 'unused', ...pin }),
      /both app and genesis/,
    );
  const rebuilt = await importArchive(raw, target);
  raw.fill(0);
  input.entries.push(null as never);
  assert.equal(rebuilt.archive.input.entries.length, 0);
  assert.equal(rebuilt.archive.input.genesis.app, target.app);
  await assert.rejects(() => importArchive(new TextEncoder().encode('null')), { code: 'archive' });
  await assert.rejects(() => importArchive(new Uint8Array([255])), { code: 'archive' });
});

test('retry requests compare content identity across property order and retain signed bytes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'atseq-cli-retry-'));
  const fixture = await chartFixture(),
    app = await fixtureApp(fixture.bundle);
  const target = { app: app.anchor.genesis.app, genesis: app.anchor.cid },
    identity = await createIdentity('Retry author');
  const payload = { day: 'Monday', millimetres: 3 },
    prepared = await prepareIntent(identity, target, fixture.bundle.root, fixture.action, payload);
  const keyFile = join(root, 'key.json'),
    intentFile = join(root, 'intent.json');
  const requested = {
    ...target,
    definition: fixture.bundle.root,
    action: fixture.action,
    payload,
    actorKey: identity.publicKey,
  };
  const retained = JSON.stringify({ requested, ...prepared });
  await writeFile(keyFile, JSON.stringify(identity), { mode: 0o600 });
  await writeFile(intentFile, retained, { mode: 0o600 });
  const server = createServer((_request, response) => {
    response.setHeader('content-type', 'application/json');
    response.end(
      JSON.stringify({
        genesis: app.anchor.genesis,
        definition: {},
        head: headAt(app.anchor),
        frontier: { $type: NSID.defsCursor, position: 0, entry: link(app.anchor.cid) },
      }),
    );
  });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  try {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('No test port');
    const result = await cli({
      operation: 'prepare',
      host: `http://127.0.0.1:${address.port}`,
      ...target,
      definition: fixture.bundle.root,
      action: fixture.action,
      payload: { millimetres: 3, day: 'Monday' },
      keyFile,
      intentFile,
    });
    assert.equal(result.intent, prepared.cid);
    assert.equal(result.status, 'prepared');
    assert.equal(await readFile(intentFile, 'utf8'), retained);
  } finally {
    await new Promise<void>((done, reject) => server.close((error) => (error ? reject(error) : done())));
    await rm(root, { recursive: true, force: true });
  }
});
