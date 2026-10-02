import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { AtseqError } from "../../../dist/src/core/errors.js";
import { OAuthAdapter, oauthUrl } from "../../../dist/src/protocol/oauth.js";
test('actual Node OAuth adapter uses maintained client, guarded edges, races and private custody', () => {
    const raw = execFileSync(process.execPath, ["/private/tmp/atseq-native-account-writer-aw-f2-20261002/.atseq-local/writer-compiled-final-16f-node22/tests/support/oauth-node-probe.js"], { encoding: 'utf8', timeout: 60_000 });
    const result = JSON.parse(raw);
    assert.ok(result.cases.length >= 13);
    assert.ok(result.dispatcherCalls > 0);
    assert.equal(result.providerSuccess, false);
    console.log(JSON.stringify(result));
});
test('browser-visible OAuth URL policy refuses unsafe schemes, hosts, credentials and fragments', () => {
    for (const url of [
        'http://public.example/token',
        'https://127.1/token',
        'https://0x7f000001/token',
        'https://[::1]/token',
        'https://localhost/token',
        'https://a.localhost/token',
        'https://user:password@public.example/token',
        'https://public.example/token#fragment',
    ])
        assert.throws(() => oauthUrl(url));
    assert.equal(oauthUrl('https://public.example:8443/token').hostname, 'public.example');
});
// Controlled lifecycle timing verifies classification, not physical storage behavior.
test('storage finalization crossing the network deadline preserves the original work failure', async () => {
    const deadline = new AbortController(), originalTimeout = AbortSignal.timeout;
    AbortSignal.timeout = () => deadline.signal;
    try {
        const adapter = new OAuthAdapter({
            metadata: {
                client_id: 'https://client.example/metadata',
                redirect_uris: ['https://client.example/callback'],
                token_endpoint_auth_method: 'none',
                scope: 'atproto',
            },
            resolveIdentity: async () => {
                throw new Error('unused');
            },
        }, { list: () => [], set: () => { }, take: () => undefined }, async (work) => work(), async () => {
            throw new Error('unused');
        }, async () => ({
            restore: async () => {
                throw new AtseqError('input', 'private failure');
            },
        }), {
            prepare: async () => { },
            touch: async () => { },
            tokenRequestDispatched: () => { },
            finish: async () => {
                deadline.abort();
                throw new Error('storage completion failed');
            },
        });
        await assert.rejects(() => adapter.restore('did:plc:aaaaaaaaaaaaaaaaaaaaaaaa', 'atproto'), (error) => error instanceof AtseqError && error.code === 'input' && error.message === 'OAuth operation failed');
    }
    finally {
        AbortSignal.timeout = originalTimeout;
    }
});
test('definitive verification failure retains its class when awaited signout crosses the network deadline', async () => {
    const deadline = new AbortController(), originalTimeout = AbortSignal.timeout;
    AbortSignal.timeout = () => deadline.signal;
    let signouts = 0;
    try {
        const did = 'did:plc:aaaaaaaaaaaaaaaaaaaaaaaa';
        const adapter = new OAuthAdapter({
            metadata: {
                client_id: 'https://client.example/metadata',
                redirect_uris: ['https://client.example/callback'],
                token_endpoint_auth_method: 'none',
                scope: 'atproto',
            },
            resolveIdentity: async () => {
                throw new Error('unused');
            },
        }, { list: () => [], set: () => { }, take: () => undefined }, async (work) => work(), async () => {
            throw new Error('unused');
        }, async () => ({
            restore: async () => ({
                did,
                getTokenInfo: async () => ({ sub: did, scope: 'atproto repo:extra' }),
                signOut: async () => {
                    signouts++;
                    deadline.abort();
                    throw new Error('cleanup failure');
                },
            }),
        }), { prepare: async () => { }, touch: async () => { }, tokenRequestDispatched: () => { }, finish: async () => { } });
        await assert.rejects(() => adapter.restore(did, 'atproto'), (error) => error instanceof AtseqError && error.code === 'input' && error.message === 'OAuth operation failed');
        assert.equal(signouts, 1);
    }
    finally {
        AbortSignal.timeout = originalTimeout;
    }
});
