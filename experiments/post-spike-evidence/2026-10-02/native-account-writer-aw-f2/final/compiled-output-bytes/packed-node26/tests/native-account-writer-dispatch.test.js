import test from 'node:test';
import assert from 'node:assert/strict';
import { OAuthAdapter, oauthTransport } from "../../packed-writer-final-16f-node26-published-inputs/node_modules/atseq/dist/src/protocol/oauth.js";
import { NativeAccountWriter } from "../../packed-writer-final-16f-node26-published-inputs/node_modules/atseq/dist/src/transport/native-account-writer.js";
import { AtseqError } from "../../packed-writer-final-16f-node26-published-inputs/node_modules/atseq/dist/src/core/errors.js";
import { OAUTH_DID, OAUTH_SCOPE, OAUTH_PDS, OAUTH_ISSUER, oauthMetadata } from "./support/oauth-fixture.js";
// The constructor factory remains trusted A1 configuration. These deliberately
// hostile SDKs test the fetch guard, never a maintained-client positive path.
test('hostile configured SDK dispatch cannot widen the private native resource allowance', async (t) => {
    for (const mode of [
        'origin',
        'path',
        'query',
        'encoded-path',
        'method',
        'body',
        'retry-body',
        'token',
        'refresh',
        'revoke',
        'PAR',
        'discovery',
        'same-path-no-authorization',
        'count',
        'pool',
        'deadline',
    ]) {
        await t.test(mode, async () => {
            let guard;
            let sent = 0;
            let hostile = true;
            const transactions = new Map();
            const session = {
                did: OAUTH_DID,
                getTokenInfo: async () => ({ sub: OAUTH_DID, scope: OAUTH_SCOPE, iss: OAUTH_ISSUER, aud: OAUTH_PDS }),
                signOut: async () => { },
                fetchHandler: async (path, init) => {
                    const resource = new URL(path, OAUTH_PDS);
                    const headers = new Headers(init.headers);
                    headers.set('authorization', 'DPoP synthetic-hostile');
                    if (!hostile)
                        return guard(resource, { ...init, headers });
                    let method = 'POST';
                    let body = new Uint8Array(init.body);
                    if (mode === 'origin')
                        resource.hostname = 'other.atseq-probe.net';
                    if (mode === 'path')
                        resource.pathname = '/xrpc/com.atproto.repo.applyWrites';
                    if (mode === 'query')
                        resource.search = '?changed=1';
                    if (mode === 'encoded-path')
                        resource.pathname = '/xrpc/com.atproto.repo.%75ploadBlob';
                    if (mode === 'method')
                        method = 'PUT';
                    if (mode === 'body')
                        body = new Uint8Array(10);
                    if (mode === 'retry-body') {
                        await guard(resource, { ...init, headers, method, body });
                        body[0] = body[0] ^ 1;
                    }
                    if (['token', 'refresh', 'revoke', 'PAR', 'discovery', 'same-path-no-authorization'].includes(mode)) {
                        headers.delete('authorization');
                        if (mode !== 'same-path-no-authorization')
                            resource.href = OAUTH_ISSUER + '/' + mode;
                        body = new Uint8Array(65537);
                    }
                    if (mode === 'count' || mode === 'pool') {
                        for (let index = 0; index < 65; index++)
                            await guard(OAUTH_ISSUER + '/discovery', { method: 'GET' });
                    }
                    return guard(resource, { ...init, headers, method, body });
                },
            };
            const adapter = new OAuthAdapter({
                metadata: oauthMetadata,
                resolveIdentity: async () => {
                    throw new Error('Unused synthetic identity');
                },
            }, {
                list: () => [...transactions.values()],
                set: (value) => {
                    transactions.set(value.id, value);
                },
                take: (id) => {
                    const value = transactions.get(id);
                    transactions.delete(id);
                    return value;
                },
            }, async (work) => work(), oauthTransport(async () => {
                sent++;
                if (mode === 'deadline')
                    return new Response(new ReadableStream({ start() { } }));
                if (mode === 'pool')
                    return new Response(new Uint8Array(1048576));
                return new Response('{}');
            }), async (fetch) => {
                guard = fetch;
                return {
                    restore: async () => session,
                    oauthResolver: {
                        resolveFromIdentity: async () => ({ pds: new URL(OAUTH_PDS), metadata: { issuer: OAUTH_ISSUER } }),
                    },
                };
            });
            const handle = await adapter.restore(OAUTH_DID, OAUTH_SCOPE);
            const writer = await NativeAccountWriter.open(handle, OAUTH_DID);
            const started = performance.now();
            // Unlike a real open HTTP socket, this synthetic empty stream owns no
            // event-loop handle. Keep it alive without replacing the actual 30 s clock.
            const keepAlive = mode === 'deadline' ? setInterval(() => { }, 1000) : undefined;
            try {
                await assert.rejects(() => writer.upload(new Uint8Array(524288)), (error) => error instanceof AtseqError && error.code === (mode === 'deadline' ? 'content_unavailable' : 'input'));
            }
            finally {
                clearInterval(keepAlive);
            }
            if (mode === 'deadline')
                assert.ok(performance.now() - started >= 29900);
            if (mode === 'count')
                assert.equal(sent, 64);
            else if (mode === 'pool')
                assert.equal(sent, 33);
            else if (mode === 'retry-body' || mode === 'deadline')
                assert.equal(sent, 1);
            else
                assert.equal(sent, 0);
            // Every exit clears the allowance, even after a swallowed SDK/transport failure.
            hostile = false;
            await assert.rejects(() => handle.request('/xrpc/com.atproto.repo.uploadBlob', { method: 'POST', body: new Uint8Array(65537) }));
        });
    }
});
