import test from 'node:test';
import assert from 'node:assert/strict';
import { create, CODEC_RAW, toString } from '@atcute/cid';
import { OAuthAdapter, oauthTransport } from "../../packed-writer-final-16f-node26-published-inputs/node_modules/atseq/dist/src/protocol/oauth.js";
import { NativeAccountWriter } from "../../packed-writer-final-16f-node26-published-inputs/node_modules/atseq/dist/src/transport/native-account-writer.js";
import { AtseqError } from "../../packed-writer-final-16f-node26-published-inputs/node_modules/atseq/dist/src/core/errors.js";
import { OAUTH_DID, OAUTH_SCOPE, OAUTH_PDS, OAUTH_ISSUER, oauthMetadata } from "./support/oauth-fixture.js";
const RECOVERY = 'OAuth credential request exceeds the byte limit; reauthorization is required';
const generic = 'OAuth operation failed';
const json = (value) => new Response(JSON.stringify(value), { headers: { 'content-type': 'application/json' } });
// Deliberately hostile configured SDKs are negative probes only. Maintained
// positive mint/refresh/custody flows execute in the Node and Chromium corpus.
async function hostile(mode) {
    let guard;
    let identity;
    let attacking = true;
    let attacked = false;
    let sends = 0;
    let witnesses = 0;
    const transactions = new Map();
    const body = new Uint8Array(524288);
    const raw = toString(await create(CODEC_RAW, body));
    const response = () => json({ blob: { $type: 'blob', ref: { $link: raw }, size: body.length, mimeType: 'application/octet-stream' } });
    const credential = (method = 'POST', type = 'application/x-www-form-urlencoded', authorization = false) => guard(OAUTH_ISSUER + '/token', {
        method,
        headers: { 'content-type': type, ...(authorization ? { authorization: 'DPoP hostile' } : {}) },
        body: new Uint8Array(65537),
    });
    const session = {
        did: OAUTH_DID,
        getTokenInfo: async () => ({ sub: OAUTH_DID, scope: OAUTH_SCOPE, iss: OAUTH_ISSUER, aud: OAUTH_PDS }),
        signOut: async () => { },
        fetchHandler: async (path, init) => {
            const headers = new Headers(init.headers);
            headers.set('authorization', 'DPoP hostile');
            const resource = new URL(path, OAUTH_PDS);
            if (!attacking)
                return guard(resource, { ...init, headers });
            attacked = true;
            try {
                if (mode === 'unknown-sdk')
                    throw new Error('private-secret SDK text');
                if (mode.startsWith('credential') || mode === 'recovery-late-deadline')
                    await credential();
                else if (mode === 'pool-plus-body') {
                    for (let n = 0; n < 32; n++)
                        await guard(OAUTH_ISSUER + '/pool');
                    await credential();
                }
                else if (mode === 'non-post')
                    await credential('PUT');
                else if (mode === 'non-form')
                    await credential('POST', 'text/plain');
                else if (mode === 'identity-form')
                    await identity.resolve(OAUTH_DID);
                else if (mode === 'authorized-form')
                    await guard(resource, {
                        method: 'POST',
                        headers: { authorization: 'DPoP hostile', 'content-type': 'application/x-www-form-urlencoded' },
                        body: new Uint8Array(65537),
                    });
                else if (mode === 'count') {
                    for (let n = 0; n < 65; n++)
                        await guard(OAUTH_ISSUER + '/count');
                }
                else if (mode === 'pool') {
                    for (let n = 0; n < 33; n++)
                        await guard(OAUTH_ISSUER + '/pool');
                }
                else if (mode === 'response' || mode.startsWith('origin') || mode === 'unavailable' || mode === 'deadline')
                    await guard(resource, { ...init, headers });
                else if (mode === 'cancel')
                    await guard(resource, { ...init, headers, signal: AbortSignal.abort() });
                else
                    await guard(resource, { ...init, headers, body: new Uint8Array(1) });
            }
            catch (error) {
                if (mode === 'unknown-sdk')
                    throw error;
            }
            if (['no-second-resource', 'unavailable', 'deadline'].includes(mode)) {
                const before = sends;
                await assert.rejects(() => guard(resource, { ...init, headers }));
                assert.equal(sends, before);
            }
            if (mode === 'first-before-revoke')
                await credential().catch(() => { });
            if (mode.endsWith('sdk-throw') || mode === 'origin')
                throw new Error('private-secret later SDK text');
            return response();
        },
    };
    const adapter = new OAuthAdapter({
        metadata: oauthMetadata,
        resolveIdentity: async (_did, { fetch }) => {
            await fetch(OAUTH_ISSUER + '/token', {
                method: 'POST',
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                body: new Uint8Array(65537),
            });
            throw new Error('Unreachable');
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
    }, async (work) => work(), oauthTransport(async (request) => {
        sends++;
        if (attacking && attacked) {
            if (mode.startsWith('origin'))
                throw new AtseqError('origin', 'private-secret origin');
            if (mode === 'unavailable')
                throw new Error('private-secret network');
            if (mode === 'response')
                return new Response(new Uint8Array(1048577));
            if (mode === 'pool' || mode === 'pool-plus-body')
                return new Response(new Uint8Array(1048576));
            if (mode === 'deadline')
                return new Response(new ReadableStream({ start() { } }));
        }
        return request instanceof Request && request.headers.has('authorization') ? response() : json({});
    }), async (fetch, resolver) => {
        guard = fetch;
        identity = resolver;
        return {
            restore: async () => session,
            oauthResolver: {
                resolveFromIdentity: async () => ({ pds: new URL(OAUTH_PDS), metadata: { issuer: OAUTH_ISSUER } }),
            },
        };
    }, {
        prepare: async () => { },
        touch: async () => { },
        tokenRequestDispatched: () => {
            witnesses++;
        },
        finish: async () => {
            if (!attacked || !attacking)
                return;
            if (mode === 'custody-throw')
                throw new Error('private-secret custody');
            if (['input-late-deadline', 'origin-late-deadline', 'recovery-late-deadline'].includes(mode)) {
                await new Promise((resolve) => setTimeout(resolve, 30100));
                throw new Error('private-secret late custody');
            }
        },
    });
    const handle = await adapter.restore(OAUTH_DID, OAUTH_SCOPE);
    const writer = await NativeAccountWriter.open(handle, OAUTH_DID);
    return {
        writer,
        handle,
        body,
        counts: () => ({ sends, witnesses }),
        ordinary: () => {
            attacking = false;
        },
    };
}
test('private native first refusal survives hostile SDK success, cleanup and all excluded recovery shapes', async (t) => {
    for (const mode of [
        'input-sdk-success',
        'input-sdk-throw',
        'origin',
        'unavailable',
        'no-second-resource',
        'first-before-revoke',
        'credential-sdk-success',
        'credential-sdk-throw',
        'non-post',
        'non-form',
        'identity-form',
        'authorized-form',
        'response',
        'count',
        'pool',
        'pool-plus-body',
        'cancel',
        'custody-throw',
        'unknown-sdk',
    ]) {
        await t.test(mode, async () => {
            const state = await hostile(mode);
            const expected = mode.startsWith('credential')
                ? RECOVERY
                : mode === 'origin'
                    ? 'OAuth custody origin is refused'
                    : ['unavailable', 'cancel'].includes(mode)
                        ? 'OAuth operation is unavailable'
                        : generic;
            const code = mode === 'origin' ? 'origin' : ['unavailable', 'cancel'].includes(mode) ? 'content_unavailable' : 'input';
            await assert.rejects(() => state.writer.upload(state.body), (error) => error instanceof AtseqError && error.code === code && error.message === expected);
            assert.equal(state.counts().witnesses, 0);
            if (mode === 'no-second-resource')
                assert.equal(state.counts().sends, 0);
            if (mode === 'pool-plus-body')
                assert.equal(state.counts().sends, 32);
            state.ordinary();
            assert.equal((await state.handle.request('/xrpc/com.atproto.repo.uploadBlob', { method: 'POST', body: new Uint8Array(1) }))
                .status, 200);
            await assert.rejects(() => state.handle.request('/xrpc/com.atproto.repo.uploadBlob', { method: 'POST', body: new Uint8Array(65537) }), (error) => error instanceof AtseqError && error.message === generic);
            assert.equal((await state.writer.upload(state.body)).size, state.body.length);
        });
    }
});
test('native first failure preserves its original deadline and fixed recovery through later finalization', { concurrency: true }, async (t) => {
    const keepAlive = setInterval(() => { }, 1000);
    try {
        await Promise.all(['input-late-deadline', 'origin-late-deadline', 'recovery-late-deadline', 'deadline'].map((mode) => t.test(mode, async () => {
            const state = await hostile(mode);
            const started = performance.now();
            const expected = mode === 'recovery-late-deadline'
                ? RECOVERY
                : mode === 'origin-late-deadline'
                    ? 'OAuth custody origin is refused'
                    : mode === 'deadline'
                        ? 'OAuth operation is unavailable'
                        : generic;
            const code = mode === 'origin-late-deadline' ? 'origin' : mode === 'deadline' ? 'content_unavailable' : 'input';
            await assert.rejects(() => state.writer.upload(state.body), (error) => error instanceof AtseqError && error.code === code && error.message === expected);
            assert.ok(performance.now() - started >= 29900);
            state.ordinary();
            assert.equal((await state.handle.request('/xrpc/com.atproto.repo.uploadBlob', {
                method: 'POST',
                body: new Uint8Array(1),
            })).status, 200);
        })));
    }
    finally {
        clearInterval(keepAlive);
    }
});
