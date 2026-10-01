import assert from 'node:assert/strict';
import { OAuthFixture, OAUTH_DID, OAUTH_OTHER_DID, OAUTH_SCOPE } from './oauth-fixture.ts';
import { OAUTH_LIMITS } from '../../src/protocol/oauth.ts';
let fixture = new OAuthFixture();
// Test-only, isolated process: maintained host wrapper routes synthetic responses here.
// It retains and checks the actual selected dispatcher; no production global patch exists.
let dispatcherCalls = 0;
globalThis.fetch = async (input, init) => {
  assert.equal(typeof (init as RequestInit & { dispatcher: { dispatch: unknown } }).dispatcher.dispatch, 'function');
  dispatcherCalls++;
  return fixture.fetch(input, init);
};
const { loadNodeOAuthAdapter } = await import('../../src/host/oauth-loader.ts');
const results: string[] = [];
fixture.challenge = true;
let adapter = await loadNodeOAuthAdapter(fixture.options());
assert.equal(dispatcherCalls, 0);
const begin = await adapter.begin(OAUTH_DID, OAUTH_SCOPE);
const race = await Promise.allSettled([
  adapter.complete(begin.transactionId, fixture.callback()),
  adapter.complete(begin.transactionId, fixture.callback()),
]);
assert.equal(race.filter((result) => result.status === 'fulfilled').length, 1);
const handle = race.find((result) => result.status === 'fulfilled');
assert.ok(handle?.status === 'fulfilled');
assert.equal(fixture.count('/token'), 2); // one exchange, with maintained nonce retry
assert.deepEqual(await handle.value.info(), {
  did: OAUTH_DID,
  issuer: 'https://auth.atseq-probe.net/',
  pds: 'https://pds.atseq-probe.net/',
  scopes: OAUTH_SCOPE.split(' ').sort(),
});
assert.deepEqual(await (await handle.value.request('/xrpc/ai.generalbusiness.atseq.synthetic')).json(), {
  accepted: true,
});
await handle.value.info(true);
assert.equal(fixture.count('/token'), 4); // one refresh, with distinct nonce retry
assert.equal(JSON.stringify(handle.value), '{}');
assert.equal(JSON.stringify(adapter), '{}');
await handle.value.revoke();
await assert.rejects(() => handle.value.info());
results.push(
  'actual-maintained-PAR-PKCE-DPoP-nonce-refresh-resource-revoke',
  'duplicate-callback-single-exchange',
  'opaque-session-and-adapter-serialization',
);

for (const mode of [
  'missing-issuer',
  'oversized-callback',
  'duplicate-issuer',
  'wrong-subject',
  'wrong-scopes',
  'extra-scopes',
  'wrong-callback-issuer',
  'changed-authority',
  'refresh-extra-scopes-before-resource-retry',
  'scope-refusal-before-resource',
  'resource-path-escape',
  'oversized-outgoing-body',
  'caller-aborted-request',
  'unsafe-token-url',
  'oversized-resource',
  'refused-token',
  'refused-refresh',
  'refused-resource',
  'refused-revoke',
] as const) {
  fixture = new OAuthFixture();
  adapter = await loadNodeOAuthAdapter(fixture.options());
  if (mode === 'wrong-subject') fixture.tokenDid = OAUTH_OTHER_DID;
  if (mode === 'wrong-scopes') fixture.tokenScope = 'atproto';
  if (mode === 'extra-scopes') fixture.tokenScope = OAUTH_SCOPE + ' repo:ai.generalbusiness.atseq.intent?action=create';
  if (mode === 'unsafe-token-url') fixture.tokenEndpoint = 'https://127.0.0.1/token';
  if (mode === 'unsafe-token-url') {
    await assert.rejects(() => adapter.begin(OAUTH_DID, OAUTH_SCOPE));
    assert.equal(fixture.count('/token'), 0);
    results.push(mode);
    continue;
  }
  const begun = await adapter.begin(OAUTH_DID, OAUTH_SCOPE);
  const params = fixture.callback();
  if (mode === 'oversized-callback') {
    params.set('code', 'x'.repeat(OAUTH_LIMITS.requestBytes + 1));
    await assert.rejects(() => adapter.complete(begun.transactionId, params));
    assert.equal(fixture.count('/token'), 0);
  } else if (mode === 'duplicate-issuer') {
    params.append('iss', params.get('iss')!);
    await assert.rejects(() => adapter.complete(begun.transactionId, params));
    assert.equal(fixture.count('/token'), 0);
  } else if (mode === 'wrong-callback-issuer') {
    params.set('iss', 'https://different.atseq-probe.net');
    await assert.rejects(() => adapter.complete(begun.transactionId, params));
    assert.equal(fixture.count('/token'), 0);
  } else if (mode === 'missing-issuer') {
    params.delete('iss');
    await assert.rejects(() => adapter.complete(begun.transactionId, params));
    assert.equal(fixture.count('/token'), 0);
  } else if (mode === 'wrong-subject' || mode === 'wrong-scopes' || mode === 'extra-scopes') {
    await assert.rejects(() => adapter.complete(begun.transactionId, params));
    assert.ok(fixture.count('/revoke') >= 1);
  } else if (mode === 'refused-token') {
    fixture.refuse = '/token';
    await assert.rejects(() => adapter.complete(begun.transactionId, params));
  } else {
    const session = await adapter.complete(begun.transactionId, params);
    if (mode === 'changed-authority') {
      fixture.pds = 'https://different-pds.atseq-probe.net';
      await assert.rejects(() => session.info());
    }
    if (mode === 'refresh-extra-scopes-before-resource-retry') {
      fixture.invalidTokenOnce = true;
      fixture.tokenScope = OAUTH_SCOPE + ' repo:ai.generalbusiness.atseq.intent?action=create';
      await assert.rejects(() => session.request('/xrpc/ai.generalbusiness.atseq.synthetic'));
      assert.equal(fixture.count('/xrpc/ai.generalbusiness.atseq.synthetic'), 1);
    }
    if (mode === 'scope-refusal-before-resource') {
      fixture.tokenScope = 'atproto';
      await assert.rejects(() => session.info(true));
      await assert.rejects(() => session.request('/xrpc/ai.generalbusiness.atseq.synthetic'));
      assert.equal(fixture.count('/xrpc/ai.generalbusiness.atseq.synthetic'), 0);
    }
    if (mode === 'resource-path-escape') {
      for (const path of ['/xrpc/../../token', '/xrpc/%2e%2e/token', '/xrpc/../token', '/xrpc/a#secret'])
        await assert.rejects(() => session.request(path));
      assert.equal(fixture.count('/token'), 1);
    }
    if (mode === 'oversized-outgoing-body') {
      await assert.rejects(() =>
        session.request('/xrpc/ai.generalbusiness.atseq.synthetic', {
          method: 'POST',
          body: new Uint8Array(OAUTH_LIMITS.requestBytes + 1),
        }),
      );
      assert.equal(fixture.count('/xrpc/ai.generalbusiness.atseq.synthetic'), 0);
    }
    if (mode === 'caller-aborted-request') {
      await assert.rejects(() =>
        session.request('/xrpc/ai.generalbusiness.atseq.synthetic', {
          method: 'POST',
          body: 'synthetic',
          signal: AbortSignal.abort(),
        }),
      );
      assert.equal(fixture.count('/xrpc/ai.generalbusiness.atseq.synthetic'), 0);
    }
    if (mode === 'oversized-resource') {
      fixture.resourceBytes = OAUTH_LIMITS.responseBytes + 1;
      await assert.rejects(() => session.request('/xrpc/ai.generalbusiness.atseq.synthetic'));
    }
    if (mode === 'refused-refresh') {
      fixture.refuse = '/token';
      await assert.rejects(() => session.info(true));
    }
    if (mode === 'refused-resource') {
      fixture.refuse = '/xrpc/ai.generalbusiness.atseq.synthetic';
      await assert.rejects(() => session.request(fixture.refuse));
    }
    if (mode === 'refused-revoke') {
      fixture.refuse = '/revoke';
      await session.revoke();
      await assert.rejects(() => session.info());
    }
  }
  results.push(mode);
}
fixture = new OAuthFixture();
fixture.refuse = '/par';
adapter = await loadNodeOAuthAdapter(fixture.options());
for (let i = 0; i < OAUTH_LIMITS.pending; i++) await assert.rejects(() => adapter.begin(OAUTH_DID, OAUTH_SCOPE));
await assert.rejects(() => adapter.begin(OAUTH_DID, OAUTH_SCOPE));
assert.equal(fixture.count('/par'), OAUTH_LIMITS.pending);
results.push('failed-PAR-state-count-bounded');
fixture = new OAuthFixture();
adapter = await loadNodeOAuthAdapter(fixture.options());
const expired = await adapter.begin(OAUTH_DID, OAUTH_SCOPE);
const now = Date.now;
Date.now = () => now() + OAUTH_LIMITS.transactionMs + 1;
try {
  await assert.rejects(() => adapter.complete(expired.transactionId, fixture.callback()));
  assert.equal(fixture.count('/token'), 0);
} finally {
  Date.now = now;
}
results.push('expired-transaction-before-token-exchange');
fixture = new OAuthFixture();
const original = await loadNodeOAuthAdapter(fixture.options());
const abandoned = await original.begin(OAUTH_DID, OAUTH_SCOPE);
adapter = await loadNodeOAuthAdapter(fixture.options());
await assert.rejects(() => adapter.complete(abandoned.transactionId, fixture.callback()));
assert.equal(fixture.count('/token'), 0);
results.push('new-volatile-Node-instance-refuses-abandoned-callback');
for (const mode of ['identity-request-count-budget', 'identity-cumulative-byte-budget'] as const) {
  fixture = new OAuthFixture();
  fixture.resourceBytes = OAUTH_LIMITS.responseBytes;
  const options = fixture.options();
  adapter = await loadNodeOAuthAdapter({
    ...options,
    resolveIdentity: async (identifier, guard) => {
      for (let i = 0; i < (mode === 'identity-request-count-budget' ? OAUTH_LIMITS.requests + 1 : 33); i++)
        await guard.fetch(
          mode === 'identity-request-count-budget'
            ? 'https://identity.atseq-probe.net/' + identifier
            : 'https://pds.atseq-probe.net/bulk',
          { signal: guard.signal },
        );
      return options.resolveIdentity(identifier, guard);
    },
  });
  await assert.rejects(() => adapter.begin(OAUTH_DID, OAUTH_SCOPE));
  assert.equal(fixture.count('/par'), 0);
  if (mode === 'identity-request-count-budget') assert.equal(fixture.calls.length, OAUTH_LIMITS.requests);
  else assert.equal(fixture.count('/bulk'), 33);
  results.push(mode);
}
fixture = new OAuthFixture();
fixture.issuer = 'https://auth.atseq-probe.net/tenant';
adapter = await loadNodeOAuthAdapter(fixture.options());
const tenant = await adapter.begin(OAUTH_DID, OAUTH_SCOPE);
const tenantSession = await adapter.complete(tenant.transactionId, fixture.callback());
assert.equal((await tenantSession.info()).issuer, fixture.issuer);
await tenantSession.revoke();
results.push('path-based-issuer-binding-preserved');
console.log(
  JSON.stringify({
    node: process.version,
    cases: results,
    dispatcherCalls,
    providerSuccess: false,
    syntheticOnly: true,
  }),
);
