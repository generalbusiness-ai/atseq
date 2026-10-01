import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { PdsClient } from '../src/host/pds.ts';
import { PdsError } from '../src/host/pds.ts';
import { ProtocolError, InterpretationError } from '../src/core/errors.ts';
import { hostFailure } from '../src/host/errors.ts';
import { readdir, utimes, mkdtemp, mkdir, rm, readFile, writeFile, stat, chmod, symlink } from 'node:fs/promises';
import { randomUUID, createHash } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { ApplicationHost } from '../src/host/application.ts';
import { startApplicationService } from '../src/host/http.ts';
import { readHostToken } from '../src/host/token.ts';
import { readPrivateFile } from '../src/storage/private.ts';
import { AtseqClient } from '../src/client/api.ts';
import { chartFixture } from '../testdata/apps/fixtures.ts';
import { bytes, contentCid } from '../src/protocol/wire.ts';
import { DraftStore } from '../src/host/drafts.ts';
import { SourceStore } from '../src/host/source.ts';
import { acquireWriterLease } from '../src/host/lease.ts';

async function mockPds(run: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>) {
  const server = createServer((req, res) => {
    void run(req, res);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: async () => {
      server.closeAllConnections();
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    },
  };
}
function json(res: ServerResponse, status: number, value: unknown) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(value));
}
const did = 'did:plc:aaaaaaaaaaaaaaaaaaaaaaaa';

test('host procedures require a retained owner-only token; reads remain public', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'atseq-host-access-'));
  const host = new ApplicationHost(directory, {
    open: async () => {
      throw new Error('No account needed for preview');
    },
  });
  const service = await startApplicationService(host);
  try {
    assert.equal((await stat(service.tokenFile)).mode & 0o777, 0o600);
    const anonymous = new AtseqClient(service.url),
      fixture = await chartFixture();
    assert.deepEqual((await anonymous.call('list')).apps, []);
    const source = bytes(await fixture.bundle.write());
    await assert.rejects(() => anonymous.call('preview', { source }), { code: 'host_token', permanent: false });
    const token = await readHostToken(service.tokenFile),
      authorized = new AtseqClient(service.url, token);
    const preview = await authorized.call('preview', { source });
    assert.equal(preview.definition.cid, fixture.bundle.root);
    assert.equal(new URL(preview.previewUrl).hash, '');
    const missing = await contentCid({ missing: true });
    await assert.rejects(() => anonymous.call('readDraft', { definition: missing }), {
      code: 'draft_not_found',
      status: 404,
    });
    await chmod(service.tokenFile, 0o644);
    await assert.rejects(() => readPrivateFile(service.tokenFile), /0600/);
    await chmod(service.tokenFile, 0o600);
    const alias = join(directory, 'token-alias');
    await symlink(service.tokenFile, alias);
    await assert.rejects(() => readPrivateFile(alias), { code: 'ELOOP' });
    assert.equal(await readHostToken(service.tokenFile), token);
  } finally {
    await service.close();
    await rm(directory, { recursive: true, force: true });
  }
});

test('draft cache evicts least recently used previews within count and byte budgets', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'atseq-draft-quota-'));
  try {
    const ids = await Promise.all([1, 2, 3].map((n) => contentCid({ n })));
    const drafts = new DraftStore(directory, { count: 2, bytes: 6 });
    await drafts.put(ids[0]!, new Uint8Array([1, 2, 3]));
    await drafts.put(ids[1]!, new Uint8Array([4, 5, 6]));
    await utimes(join(directory, 'drafts', ids[0] + '.car'), new Date(0), new Date(0));
    await drafts.read(ids[0]!); // A read keeps this draft more recent than the second.
    await utimes(join(directory, 'drafts', ids[1] + '.car'), new Date(0), new Date(0));
    await drafts.put(ids[2]!, new Uint8Array([7, 8, 9]));
    assert.deepEqual([...(await drafts.read(ids[0]!))], [1, 2, 3]);
    await assert.rejects(() => drafts.read(ids[1]!), { code: 'draft_not_found', status: 404 });
    await drafts.put(ids[2]!, new Uint8Array(4)); // Byte pressure evicts the other preview.
    await assert.rejects(() => drafts.read(ids[0]!), { code: 'draft_not_found' });
    await assert.rejects(() => drafts.put(ids[2]!, new Uint8Array(7)), { code: 'draft_limit' });
    assert.equal((await drafts.read(ids[2]!)).length, 4);
    await Promise.all(ids.map((id) => drafts.put(id, new Uint8Array([1, 2, 3]))));
    assert.equal((await readdir(join(directory, 'drafts'))).length, 2);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('incomplete creations consume application quota before an account is provisioned', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'atseq-application-quota-'));
  try {
    await mkdir(join(directory, randomUUID()));
    let accounts = 0;
    const host = new ApplicationHost(
      directory,
      {
        open: async () => {
          accounts++;
          throw new Error('Unexpected provisioning');
        },
      },
      { applications: 1 },
    );
    const fixture = await chartFixture(),
      source = await fixture.bundle.write();
    await assert.rejects(() => host.create(randomUUID(), source, []), { code: 'application_limit', status: 429 });
    assert.equal(accounts, 0);
    await host.close();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('a corrupt lease database keeps its SQLite diagnostic instead of claiming contention', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'atseq-corrupt-lease-'));
  try {
    const name = createHash('sha256').update(did).digest('hex');
    await writeFile(join(directory, `${name}.sqlite`), 'This is not a database');
    assert.throws(
      () => acquireWriterLease(directory, did),
      (error) => {
        assert.equal((error as { errcode?: number }).errcode, 26);
        assert.doesNotMatch((error as Error).message, /Another local process/);
        return true;
      },
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('only a PDS RecordNotFound response becomes a missing source', async () => {
  for (const [status, code, expected] of [
    [400, 'RecordNotFound', 'content_missing'],
    [500, 'InternalServerError', 'content_unavailable'],
    [400, 'InvalidRequest', 'content_unavailable'],
  ] as const) {
    const server = await mockPds((_req, res) => json(res, status, { error: code }));
    try {
      await assert.rejects(() => new SourceStore(new PdsClient(server.origin, did, 'access')).get('fixture'), {
        code: expected,
      });
    } finally {
      await server.close();
    }
  }
});

test('only definite invalid input is final; integrity and host availability errors use 503', () => {
  for (const code of ['signature', 'key', 'envelope', 'input'] as const) {
    const failure = hostFailure(new ProtocolError(code, 'bad request'));
    assert.equal(failure.status, 400);
    assert.equal(failure.body.code, code);
    assert.equal(failure.body.permanent, true);
  }
  for (const error of [
    new ProtocolError('rollback', 'bad history'),
    new InterpretationError('content_missing', 'missing'),
    new InterpretationError('dependency_mismatch', 'drift'),
    new PdsError(500, 'InternalServerError'),
    new TypeError('fault'),
  ]) {
    assert.equal(hostFailure(error).status, 503);
    assert.equal(hostFailure(error).body.permanent, false);
  }
  const auth = hostFailure(new PdsError(401, 'AuthenticationUnavailable'));
  assert.equal(auth.status, 503);
  assert.equal(auth.body.code, 'host_authentication');
  assert.equal(auth.body.permanent, false);
  assert.equal(hostFailure(new ProtocolError('definition_changed', 'refresh')).body.permanent, false);
});

test('expiry renews once across concurrent JSON, blob and upload calls', async () => {
  let refreshes = 0;
  const bodies: Buffer[] = [];
  const server = await mockPds(async (req, res) => {
    if (req.url?.includes('refreshSession')) {
      assert.equal(req.headers.authorization, 'Bearer refresh-old');
      refreshes++;
      await new Promise((resolve) => setTimeout(resolve, 30));
      json(res, 200, { did, accessJwt: 'access-new', refreshJwt: 'refresh-new' });
      return;
    }
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk);
    bodies.push(Buffer.concat(chunks));
    if (req.headers.authorization === 'Bearer access-old') {
      json(res, 401, { error: 'ExpiredToken' });
      return;
    }
    assert.equal(req.headers.authorization, 'Bearer access-new');
    if (req.url?.includes('getBlob')) {
      res.end(Buffer.from([1, 2, 3]));
      return;
    }
    json(res, 200, req.url?.includes('uploadBlob') ? { blob: { size: 3 } } : { ok: true });
  });
  try {
    const client = new PdsClient(server.origin, did, 'access-old', 'refresh-old');
    const [record, blob, upload] = await Promise.all([
      client.request('com.atproto.repo.applyWrites', { writes: [{ x: 1 }] }, true),
      client.binary('com.atproto.sync.getBlob', { cid: 'fixture' }),
      client.upload(new Uint8Array([7, 8, 9])),
    ]);
    assert.equal(refreshes, 1);
    assert.deepEqual(record, { ok: true });
    assert.deepEqual([...blob], [1, 2, 3]);
    assert.equal(upload.size, 3);
    assert.equal(bodies.filter((body) => body.equals(Buffer.from([7, 8, 9]))).length, 2);
  } finally {
    await server.close();
  }
});

test('missing, rejected or repeatedly expired session credentials have a permanent authentication code', async () => {
  for (const mode of ['missing', 'rejected', 'repeated'] as const) {
    let calls = 0;
    const server = await mockPds((req, res) => {
      calls++;
      if (req.url?.includes('refreshSession')) {
        if (mode === 'rejected') json(res, 401, { error: 'InvalidToken' });
        else json(res, 200, { did, accessJwt: 'still-expired', refreshJwt: 'refresh-new' });
      } else json(res, 401, { error: 'ExpiredToken' });
    });
    try {
      const client = new PdsClient(server.origin, did, 'access-old', mode === 'missing' ? undefined : 'refresh-old');
      await assert.rejects(() => client.request('com.atproto.repo.getRecord', {}), {
        code: 'AuthenticationUnavailable',
      });
      assert.equal(calls, mode === 'missing' ? 1 : mode === 'rejected' ? 2 : 3);
      const firstCalls = calls;
      await assert.rejects(() => client.request('com.atproto.repo.getRecord', {}), {
        code: 'AuthenticationUnavailable',
      });
      assert.equal(calls, firstCalls);
    } finally {
      await server.close();
    }
  }
});

test('complete-prefix limits and nonce conflicts have stable permanent codes', () => {
  for (const [pds, code] of [
    ['AppendLimit', 'append_limit'],
    ['SnapshotLimit', 'snapshot_limit'],
    ['DefinitionHistoryLimit', 'definition_history_limit'],
  ]) {
    const failure = hostFailure(new PdsError(503, pds!));
    assert.equal(failure.status, 413);
    assert.equal(failure.body.code, code);
    assert.equal(failure.body.permanent, true);
  }
  assert.equal(hostFailure(new ProtocolError('retry_conflict', 'nonce collision')).body.permanent, true);
});

test('authorization refusal does not permanently disable a valid PDS credential', async () => {
  for (const status of [401, 403]) {
    let calls = 0;
    const server = await mockPds((_req, res) => {
      calls++;
      json(res, calls === 1 ? status : 200, calls === 1 ? { error: 'Forbidden' } : { ok: true });
    });
    try {
      const client = new PdsClient(server.origin, did, 'access', 'refresh');
      await assert.rejects(() => client.request('com.atproto.repo.getRecord', {}), { code: 'Forbidden' });
      assert.deepEqual(await client.request('com.atproto.repo.getRecord', {}), { ok: true });
      assert.equal(calls, 2);
    } finally {
      await server.close();
    }
  }
});
