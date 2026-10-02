import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { OAuthFixture, OAUTH_DID, OAUTH_OTHER_DID, OAUTH_SCOPE } from "./oauth-fixture.js";
import { OAUTH_LIMITS } from "../../../packed-writer-final-16f-node24-published-inputs/node_modules/atseq/dist/src/protocol/oauth.js";
import { AtseqError } from "../../../packed-writer-final-16f-node24-published-inputs/node_modules/atseq/dist/src/core/errors.js";
let fixture = new OAuthFixture();
const nativeFetch = globalThis.fetch;
let networkFaultURL;
// Test-only, isolated process: maintained host wrapper routes synthetic responses here.
// It retains and checks the actual selected dispatcher; no production global patch exists.
let dispatcherCalls = 0;
globalThis.fetch = async (input, init) => {
    assert.equal(typeof init.dispatcher.dispatch, 'function');
    dispatcherCalls++;
    // Inspect an existing request without transferring its body a second time.
    const request = input instanceof Request ? input : new Request(input, init);
    if (networkFaultURL && new URL(request.url).pathname.startsWith('/xrpc/')) {
        // No OAuth headers or key material reach the test-owned local fault server.
        const response = await nativeFetch(networkFaultURL, { signal: request.signal, redirect: 'error' });
        // Retain the actual native stream, with the same synthetic response URL
        // convention as the fixture; no localhost URL enters production policy.
        return new Response(response.body, { status: response.status, headers: response.headers });
    }
    return fixture.fetch(input, init);
};
const { loadNodeOAuthAdapter } = await import("../../../packed-writer-final-16f-node24-published-inputs/node_modules/atseq/dist/src/host/oauth-loader.js");
const results = [];
async function refusedAs(work, code) {
    await assert.rejects(work, (error) => {
        assert.ok(error instanceof AtseqError);
        assert.equal(error.code, code);
        assert.equal(error.kind, code === 'content_unavailable' ? 'transient' : 'invalid_input');
        assert.ok(!error.message.includes('synthetic-secret'));
        return true;
    });
}
fixture.challenge = true;
let adapter = await loadNodeOAuthAdapter(fixture.options());
assert.equal(dispatcherCalls, 0);
await adapter.begin(OAUTH_DID, OAUTH_SCOPE);
const race = await Promise.allSettled([adapter.complete(fixture.callback()), adapter.complete(fixture.callback())]);
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
results.push('actual-maintained-PAR-PKCE-DPoP-nonce-refresh-resource-revoke', 'duplicate-callback-single-exchange', 'opaque-session-and-adapter-serialization');
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
]) {
    fixture = new OAuthFixture();
    adapter = await loadNodeOAuthAdapter(fixture.options());
    if (mode === 'wrong-subject')
        fixture.tokenDid = OAUTH_OTHER_DID;
    if (mode === 'wrong-scopes')
        fixture.tokenScope = 'atproto';
    if (mode === 'extra-scopes')
        fixture.tokenScope = OAUTH_SCOPE + ' repo:ai.generalbusiness.atseq.intent?action=create';
    if (mode === 'unsafe-token-url')
        fixture.tokenEndpoint = 'https://127.0.0.1/token';
    if (mode === 'unsafe-token-url') {
        await assert.rejects(() => adapter.begin(OAUTH_DID, OAUTH_SCOPE));
        assert.equal(fixture.count('/token'), 0);
        results.push(mode);
        continue;
    }
    await adapter.begin(OAUTH_DID, OAUTH_SCOPE);
    const params = fixture.callback();
    if (mode === 'oversized-callback') {
        params.set('code', 'x'.repeat(OAUTH_LIMITS.requestBytes + 1));
        await assert.rejects(() => adapter.complete(params));
        assert.equal(fixture.count('/token'), 0);
    }
    else if (mode === 'duplicate-issuer') {
        params.append('iss', params.get('iss'));
        await assert.rejects(() => adapter.complete(params));
        assert.equal(fixture.count('/token'), 0);
    }
    else if (mode === 'wrong-callback-issuer') {
        params.set('iss', 'https://different.atseq-probe.net');
        await assert.rejects(() => adapter.complete(params));
        assert.equal(fixture.count('/token'), 0);
    }
    else if (mode === 'missing-issuer') {
        params.delete('iss');
        await assert.rejects(() => adapter.complete(params));
        assert.equal(fixture.count('/token'), 0);
    }
    else if (mode === 'wrong-subject' || mode === 'wrong-scopes' || mode === 'extra-scopes') {
        await assert.rejects(() => adapter.complete(params));
        assert.ok(fixture.count('/revoke') >= 1);
    }
    else if (mode === 'refused-token') {
        fixture.refuse = '/token';
        await refusedAs(() => adapter.complete(params), 'input');
    }
    else {
        const session = await adapter.complete(params);
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
            await assert.rejects(() => session.request('/xrpc/ai.generalbusiness.atseq.synthetic', {
                method: 'POST',
                body: new Uint8Array(OAUTH_LIMITS.requestBytes + 1),
            }));
            assert.equal(fixture.count('/xrpc/ai.generalbusiness.atseq.synthetic'), 0);
        }
        if (mode === 'caller-aborted-request') {
            await refusedAs(() => session.request('/xrpc/ai.generalbusiness.atseq.synthetic', {
                method: 'POST',
                body: 'synthetic',
                signal: AbortSignal.abort(),
            }), 'content_unavailable');
            assert.equal(fixture.count('/xrpc/ai.generalbusiness.atseq.synthetic'), 0);
        }
        if (mode === 'oversized-resource') {
            fixture.resourceBytes = OAUTH_LIMITS.responseBytes + 1;
            await refusedAs(() => session.request('/xrpc/ai.generalbusiness.atseq.synthetic'), 'input');
        }
        if (mode === 'refused-refresh') {
            fixture.refuse = '/token';
            await refusedAs(() => session.info(true), 'input');
        }
        if (mode === 'refused-resource') {
            fixture.refuse = '/xrpc/ai.generalbusiness.atseq.synthetic';
            // HTTP resource refusals remain observable Response values, as in fetch.
            assert.equal((await session.request(fixture.refuse)).status, 400);
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
adapter = await loadNodeOAuthAdapter(fixture.options());
await adapter.begin(OAUTH_DID, OAUTH_SCOPE);
const firstCallback = fixture.callback();
await adapter.begin(OAUTH_DID, OAUTH_SCOPE);
const secondCallback = fixture.callback();
for (const mode of ['unknown', 'duplicate', 'malformed']) {
    const bad = new URLSearchParams(firstCallback);
    if (mode === 'unknown')
        bad.set('state', crypto.randomUUID());
    if (mode === 'duplicate')
        bad.append('state', secondCallback.get('state'));
    if (mode === 'malformed')
        bad.set('state', 'bad');
    await refusedAs(() => adapter.complete(bad), 'input');
}
assert.equal(fixture.count('/token'), 0);
await adapter.complete(secondCallback);
await adapter.complete(firstCallback);
assert.equal(fixture.count('/token'), 2);
results.push('callback-state-selects-one-of-two-pending-transactions');
for (const code of ['content_unavailable', 'origin']) {
    fixture = new OAuthFixture();
    adapter = await loadNodeOAuthAdapter({
        ...fixture.options(),
        resolveIdentity: async () => {
            throw new AtseqError(code, 'synthetic-secret-must-not-escape');
        },
    });
    await refusedAs(() => adapter.begin(OAUTH_DID, OAUTH_SCOPE), code);
    results.push('secret-free-identity-' + code + '-class');
}
// Real native fetch/socket failures and the actual adopted operation deadline.
// A test-only route substitutes a local fault URL after the guarded dispatch;
// it forwards only the AbortSignal, never OAuth headers or request contents.
const faultServer = createServer((request, response) => {
    if (request.url === '/drop') {
        request.socket.destroy();
        return;
    }
    response.writeHead(200, { 'content-type': 'application/octet-stream' });
    response.flushHeaders();
    if (request.url === '/body-drop') {
        response.write('synthetic');
        setTimeout(() => request.socket.destroy(), 10);
    }
    // /deadline keeps its response body open until the actual 30-second deadline.
});
await new Promise((resolve) => faultServer.listen(0, '127.0.0.1', resolve));
const address = faultServer.address();
assert.ok(address && typeof address !== 'string');
try {
    for (const path of ['/drop', '/body-drop', '/deadline']) {
        fixture = new OAuthFixture();
        adapter = await loadNodeOAuthAdapter(fixture.options());
        await adapter.begin(OAUTH_DID, OAUTH_SCOPE);
        const session = await adapter.complete(fixture.callback());
        networkFaultURL = 'http://127.0.0.1:' + address.port + path;
        const started = performance.now();
        await refusedAs(() => session.request('/xrpc/ai.generalbusiness.atseq.synthetic'), 'content_unavailable');
        const elapsed = performance.now() - started;
        if (path === '/deadline')
            assert.ok(elapsed >= OAUTH_LIMITS.operationMs - 100 && elapsed < 45_000);
        networkFaultURL = undefined;
        results.push('actual-native-fetch' + path + '-transient');
    }
}
finally {
    networkFaultURL = undefined;
    faultServer.closeAllConnections();
    await new Promise((resolve, reject) => faultServer.close((error) => (error ? reject(error) : resolve())));
}
fixture = new OAuthFixture();
fixture.refuse = '/par';
adapter = await loadNodeOAuthAdapter(fixture.options());
for (let i = 0; i < OAUTH_LIMITS.pending; i++)
    await assert.rejects(() => adapter.begin(OAUTH_DID, OAUTH_SCOPE));
await assert.rejects(() => adapter.begin(OAUTH_DID, OAUTH_SCOPE));
assert.equal(fixture.count('/par'), OAUTH_LIMITS.pending);
results.push('failed-PAR-state-count-bounded');
fixture = new OAuthFixture();
adapter = await loadNodeOAuthAdapter(fixture.options());
await adapter.begin(OAUTH_DID, OAUTH_SCOPE);
const expiredCallback = fixture.callback();
const now = Date.now;
Date.now = () => now() + OAUTH_LIMITS.transactionMs + 1;
try {
    await refusedAs(() => adapter.complete(expiredCallback), 'input');
    assert.equal(fixture.count('/token'), 0);
    await adapter.begin(OAUTH_DID, OAUTH_SCOPE);
    const laterCallback = fixture.callback();
    await refusedAs(() => adapter.complete(expiredCallback), 'input');
    await adapter.complete(laterCallback);
    assert.equal(fixture.count('/token'), 1);
}
finally {
    Date.now = now;
}
results.push('expired-transaction-before-token-exchange');
results.push('expired-callback-leaves-later-live-transaction-usable');
fixture = new OAuthFixture();
const original = await loadNodeOAuthAdapter(fixture.options());
await original.begin(OAUTH_DID, OAUTH_SCOPE);
adapter = await loadNodeOAuthAdapter(fixture.options());
await assert.rejects(() => adapter.complete(fixture.callback()));
assert.equal(fixture.count('/token'), 0);
results.push('new-volatile-Node-instance-refuses-abandoned-callback');
for (const mode of ['identity-request-count-budget', 'identity-cumulative-byte-budget']) {
    fixture = new OAuthFixture();
    fixture.resourceBytes = OAUTH_LIMITS.responseBytes;
    const options = fixture.options();
    adapter = await loadNodeOAuthAdapter({
        ...options,
        resolveIdentity: async (identifier, guard) => {
            for (let i = 0; i < (mode === 'identity-request-count-budget' ? OAUTH_LIMITS.requests + 1 : 33); i++)
                await guard.fetch(mode === 'identity-request-count-budget'
                    ? 'https://identity.atseq-probe.net/' + identifier
                    : 'https://pds.atseq-probe.net/bulk', { signal: guard.signal });
            return options.resolveIdentity(identifier, guard);
        },
    });
    await assert.rejects(() => adapter.begin(OAUTH_DID, OAUTH_SCOPE));
    assert.equal(fixture.count('/par'), 0);
    if (mode === 'identity-request-count-budget')
        assert.equal(fixture.calls.length, OAUTH_LIMITS.requests);
    else
        assert.equal(fixture.count('/bulk'), 33);
    results.push(mode);
}
fixture = new OAuthFixture();
fixture.issuer = 'https://auth.atseq-probe.net/tenant';
adapter = await loadNodeOAuthAdapter(fixture.options());
await adapter.begin(OAUTH_DID, OAUTH_SCOPE);
const tenantSession = await adapter.complete(fixture.callback());
assert.equal((await tenantSession.info()).issuer, fixture.issuer);
await tenantSession.revoke();
results.push('path-based-issuer-binding-preserved');
console.log(JSON.stringify({
    node: process.version,
    cases: results,
    dispatcherCalls,
    providerSuccess: false,
    syntheticOnly: true,
}));
