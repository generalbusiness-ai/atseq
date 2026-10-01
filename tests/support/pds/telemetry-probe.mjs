// The runner receives a harmless preload sentinel, never the telemetry preload.
import assert from 'node:assert/strict';
import childProcess from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fixtureChildEnvironment } from './child-environment.mjs';
import { startEnvironment, resetDisposable } from './environment.mjs';

const inherited = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => /^(OTEL_|JAEGER_|NODE_OPTIONS$)/.test(key)),
);
assert.equal(process.env.OTEL_SDK_DISABLED, 'false');
assert.equal(process.env.OTEL_PROPAGATORS, 'jaeger');
assert.equal(process.env.NODE_OPTIONS, '--no-warnings');
const mode = process.argv[2];
assert.ok(['legacy', 'allowlist'].includes(mode));
const inheritedChild = {
  ...process.env,
  NODE_OPTIONS: `--import ${new URL('node_modules/@atproto/pds/dist/telemetry.js', import.meta.url).href}`,
};
const originalFork = childProcess.fork;
let preloadedPdsChildren = 0;
// Model a caller's inherited preload only at the PDS fork. Actual production
// environment selection still determines whether the preload key survives.
childProcess.fork = (modulePath, args, options) => {
  assert.ok(String(modulePath).endsWith('/pds-server.mjs'));
  const env = mode === 'legacy' ? { ...process.env, LOG_ENABLED: 'false' } : { ...options.env };
  if (Object.hasOwn(env, 'NODE_OPTIONS')) {
    env.NODE_OPTIONS = inheritedChild.NODE_OPTIONS;
    preloadedPdsChildren++;
  }
  return originalFork(modulePath, args, { ...options, env });
};
syncBuiltinESMExports();
let env;
let operations = 0;
async function request(method, body, token) {
  const response = await fetch(`${env.url}/xrpc/${method}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(10_000),
  });
  assert.equal(response.status, 200, `${method}: ${await response.clone().text()}`);
  operations++;
  return response;
}
try {
  env = await startEnvironment();
  const account = await (
    await request('com.atproto.server.createAccount', {
      handle: `otel-${randomBytes(5).toString('hex')}.test`,
      email: 'telemetry-test@example.test',
      password: randomBytes(24).toString('hex'),
    })
  ).json();
  assert.match(account.did, /^did:plc:/);
  const handle = await (await request(`com.atproto.identity.resolveHandle?handle=${account.handle}`)).json();
  assert.equal(handle.did, account.did);
  const config = JSON.parse(await readFile(join(env.dir, 'pds-secrets.json'), 'utf8'));
  const plcResponse = await fetch(`${config.didPlcUrl}/${account.did}`, { signal: AbortSignal.timeout(10_000) });
  assert.equal(plcResponse.status, 200);
  assert.equal((await plcResponse.json()).id, account.did);
  operations++;
  for (let i = 0; i < 12; i++) {
    const written = await (
      await request(
        'com.atproto.repo.createRecord',
        {
          repo: account.did,
          collection: 'ai.generalbusiness.atseq.telemetrytest',
          rkey: `synthetic-${i}`,
          record: { $type: 'ai.generalbusiness.atseq.telemetrytest', value: i },
        },
        account.accessJwt,
      )
    ).json();
    assert.equal(typeof written.cid, 'string');
    const read = await (
      await request(
        `com.atproto.repo.getRecord?repo=${encodeURIComponent(account.did)}&collection=ai.generalbusiness.atseq.telemetrytest&rkey=synthetic-${i}`,
      )
    ).json();
    assert.equal(read.cid, written.cid);
    assert.equal(read.value.value, i);
  }
  const archive = await (
    await request(`com.atproto.sync.getRepo?did=${encodeURIComponent(account.did)}`)
  ).arrayBuffer();
  assert.ok(archive.byteLength > 0);
  await env.stop();
  await env.start();
  const retained = await (
    await request(
      `com.atproto.repo.getRecord?repo=${encodeURIComponent(account.did)}&collection=ai.generalbusiness.atseq.telemetrytest&rkey=synthetic-11`,
    )
  ).json();
  assert.equal(retained.value.value, 11);
  const after = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => /^(OTEL_|JAEGER_|NODE_OPTIONS$)/.test(key)),
  );
  assert.deepEqual(after, inherited, 'Fixture must not mutate its runner environment');
  const childEnv = fixtureChildEnvironment();
  assert.deepEqual(
    Object.keys(childEnv).filter((key) => /^(OTEL_|JAEGER_|NODE_OPTIONS$)/.test(key)),
    ['OTEL_SDK_DISABLED'],
  );
  assert.equal(childEnv.OTEL_SDK_DISABLED, 'true');
  process.send?.({
    mode,
    passed: true,
    operations,
    records: 12,
    restartVerified: true,
    runnerEnvironmentUnchanged: true,
    preloadedPdsChildren,
  });
} finally {
  childProcess.fork = originalFork;
  syncBuiltinESMExports();
  if (env) {
    await env.close();
    await resetDisposable(env.dir);
  }
}
