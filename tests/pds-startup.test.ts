import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { once } from 'node:events';
import { readFile, rename, writeFile, unlink } from 'node:fs/promises';
import { Server, createServer } from 'node:net';
import { join } from 'node:path';
import { startEnvironment, resetDisposable } from './support/pds/environment.mjs';

async function checkAccount(env: Awaited<ReturnType<typeof startEnvironment>>) {
  const response = await fetch(`${env.url}/xrpc/com.atproto.server.createAccount`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      handle: `startup-${randomBytes(5).toString('hex')}.test`,
      email: 'startup@example.test',
      password: randomBytes(24).toString('hex'),
    }),
  });
  assert.equal(response.status, 200);
  const account = await response.json();
  const config = JSON.parse(await readFile(join(env.dir, 'pds-secrets.json'), 'utf8'));
  const document = await fetch(`${config.didPlcUrl}/${account.did}`).then((r) => r.json());
  assert.equal(document.id, account.did);
  assert.equal(document.service[0].serviceEndpoint, env.url.replace('127.0.0.1', 'localhost'));
  return account.did;
}

async function close(env: Awaited<ReturnType<typeof startEnvironment>>) {
  await env.close();
  await resetDisposable(env.dir);
}

test('actual PLC and PDS listeners retain exclusive ports throughout startup', async (t) => {
  const original = Server.prototype.listen;
  const probes: Promise<string>[] = [];
  let probing = false;
  const mocked = t.mock.method(Server.prototype, 'listen', function (this: Server, ...args: any[]) {
    const result = original.apply(this, args as any);
    if (!probing) {
      this.once('listening', () => {
        const address = this.address();
        assert.ok(address && typeof address !== 'string');
        const contender = createServer();
        probes.push(
          new Promise((resolve, reject) => {
            contender.once('error', (error: NodeJS.ErrnoException) => {
              if (error.code === 'EADDRINUSE') resolve(error.code);
              else reject(error);
            });
            contender.once('listening', () => {
              contender.close();
              reject(Error('Another process could steal the chosen fixture port'));
            });
            probing = true;
            contender.listen(address.port, '127.0.0.1');
            probing = false;
          }),
        );
      });
    }
    return result;
  });
  let env;
  try {
    env = await startEnvironment();
    mocked.mock.restore();
    assert.deepEqual(await Promise.all(probes), ['EADDRINUSE', 'EADDRINUSE']);
    await checkAccount(env);
    t.diagnostic('Both real listeners refused competing bind attempts; account creation and PLC endpoint passed.');
  } finally {
    mocked.mock.restore();
    if (env) await close(env);
  }
});

test('six real official PDS instances start concurrently with distinct retained ports', async (t) => {
  const starts = await Promise.allSettled(Array.from({ length: 6 }, () => startEnvironment()));
  const environments = starts.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
  try {
    assert.equal(environments.length, 6, JSON.stringify(starts.filter((r) => r.status === 'rejected')));
    assert.equal(new Set(environments.map((env) => env.url)).size, 6);
    const dids = await Promise.all(environments.map(checkAccount));
    assert.equal(new Set(dids).size, 6);
    t.diagnostic('Six distinct real PDS listeners, six persisted accounts, and six matching PLC service endpoints.');
  } finally {
    await Promise.all(environments.map(close));
  }
});

test('restart refuses an occupied original port and resumes at the same URL after release', async (t) => {
  const env = await startEnvironment();
  const contender = createServer();
  try {
    const url = env.url;
    await checkAccount(env);
    await env.stop('SIGKILL');
    contender.listen(Number(new URL(url).port), '127.0.0.1');
    await once(contender, 'listening');
    await assert.rejects(env.start(), { code: 'EADDRINUSE' });
    await assert.rejects(readFile(join(env.dir, 'pds.pid')), { code: 'ENOENT' });
    await new Promise<void>((resolve) => contender.close(() => resolve()));
    await env.start();
    assert.equal(env.url, url);
    assert.equal((await fetch(`${url}/xrpc/com.atproto.server.describeServer`)).status, 200);
    t.diagnostic('Occupied restart port was refused before spawning; released port reused without retargeting.');
  } finally {
    if (contender.listening) await new Promise<void>((resolve) => contender.close(() => resolve()));
    await close(env);
  }
});

test('a genuine non-port child startup failure escapes and releases the reserved listener', async (t) => {
  const env = await startEnvironment();
  const data = join(env.dir, 'data');
  const backup = join(env.dir, 'saved-data');
  try {
    await env.stop();
    await rename(data, backup);
    await writeFile(data, 'Deliberately invalid SQLite data directory');
    await assert.rejects(env.start(), /Official PDS exited during startup/);
    await unlink(data);
    await rename(backup, data);
    await env.start();
    await checkAccount(env);
    t.diagnostic(
      'Actual invalid data-directory startup failed once; same reserved port available for explicit restart.',
    );
  } finally {
    await close(env);
  }
});
