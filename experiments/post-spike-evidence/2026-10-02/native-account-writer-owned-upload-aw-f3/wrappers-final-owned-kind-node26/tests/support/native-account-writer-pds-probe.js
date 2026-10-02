import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { startEnvironment } from "../../../../tests/support/pds/environment.mjs";
import { loadNodeOAuthAdapter } from "../../../../dist/src/host/oauth-loader.js";
import { NativeAccountWriter } from "../../../../dist/src/transport/native-account-writer.js";
import { PdsClient } from "../../../../dist/src/host/pds.js";
import { OAuthFixture, OAUTH_PDS, OAUTH_SCOPE } from "./oauth-fixture.js";
const env = await startEnvironment();
const nativeFetch = globalThis.fetch;
const collection = 'ai.generalbusiness.atseq.synthetic';
const cases = [];
try {
    const created = await nativeFetch(env.url + '/xrpc/com.atproto.server.createAccount', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            handle: 'writer-' + randomBytes(5).toString('hex') + '.test',
            email: 'writer@example.test',
            password: randomBytes(24).toString('hex'),
        }),
    });
    assert.equal(created.status, 200);
    const account = (await created.json());
    const fixture = new OAuthFixture();
    fixture.tokenDid = account.did;
    let resourceSends = 0;
    let dropAfterApply = false;
    const bodies = [];
    globalThis.fetch = async (input, init) => {
        const request = input instanceof Request ? input : new Request(input, init);
        const url = new URL(request.url);
        if (url.origin === new URL(env.url).origin)
            return nativeFetch(input, init);
        assert.equal(typeof init.dispatcher.dispatch, 'function');
        if (url.origin !== new URL(OAUTH_PDS).origin || !url.pathname.startsWith('/xrpc/'))
            return fixture.fetch(input, init);
        assert.ok(request.headers.get('authorization')?.startsWith('DPoP synthetic-access-'));
        assert.ok(request.headers.get('dpop'));
        resourceSends++;
        const body = new Uint8Array(await request.arrayBuffer());
        bodies.push(body);
        // Test bridge only. Local PDS credentials are inserted only on this loopback
        // call; the synthetic AS never receives the real account token or password.
        const local = new URL(url.pathname + url.search, env.url);
        const headers = new Headers();
        headers.set('authorization', 'Bearer ' + account.accessJwt);
        if (request.headers.has('content-type'))
            headers.set('content-type', request.headers.get('content-type'));
        const response = await nativeFetch(local, {
            method: request.method,
            headers,
            body: request.method === 'GET' ? undefined : body,
            signal: request.signal,
            redirect: 'error',
        });
        const bytes = new Uint8Array(await response.arrayBuffer());
        if (dropAfterApply && url.pathname.endsWith('applyWrites')) {
            dropAfterApply = false;
            throw new Error('Test-owned lost conditional reply');
        }
        return new Response(bytes, { status: response.status, headers: response.headers });
    };
    const adapter = await loadNodeOAuthAdapter(fixture.options());
    await adapter.begin(account.did, OAUTH_SCOPE);
    const handle = await adapter.complete(fixture.callback());
    const writer = await NativeAccountWriter.open(handle, account.did);
    const initial = await writer.latestCommit();
    const source = new Uint8Array(524288).fill(17);
    const uploading = writer.upload(source);
    source.fill(23);
    const blob = await uploading;
    assert.equal(blob.size, 524288);
    assert.ok(bodies.at(-1).every((byte) => byte === 17));
    cases.push('actual-maintained-callback-with-real-PDS-latest-and-captured-512KiB-RAW-upload');
    const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aIhcAAAAASUVORK5CYII=', 'base64'));
    const pngBlob = await writer.upload(png);
    assert.equal(pngBlob.mimeType, 'image/png');
    assert.equal(pngBlob.size, png.length);
    assert.deepEqual(bodies.at(-1), png);
    cases.push('real-PDS-sniffed-PNG-type-from-default-octet-stream-upload');
    const writes = Array.from({ length: 102 }, (_, index) => ({
        $type: 'com.atproto.repo.applyWrites#create',
        collection,
        rkey: 'r' + String(index).padStart(3, '0'),
        value: { $type: collection, index, ...(index === 0 ? { blob } : {}), ...(index === 1 ? { pngBlob } : {}) },
    }));
    const before = resourceSends;
    await writer.applyConditional(writes, initial.cid);
    assert.equal(resourceSends, before + 1);
    const first = await writer.list(collection);
    const second = await writer.list(collection, { cursor: first.cursor });
    const last = await writer.list(collection, { cursor: second.cursor });
    assert.equal(first.records.length, 100);
    assert.equal(second.records.length, 2);
    assert.equal(first.records[0].uri, `at://${account.did}/${collection}/r000`);
    assert.equal(second.records[0].uri, `at://${account.did}/${collection}/r100`);
    assert.equal(last.records.length, 0);
    assert.equal(last.cursor, undefined);
    assert.equal((await writer.get(collection, 'r000')).uri, `at://${account.did}/${collection}/r000`);
    cases.push('real-PDS-mandatory-CAS-get-and-explicit-102-record-pages');
    await assert.rejects(() => writer.applyConditional([], initial.cid), { code: 'InvalidSwap' });
    assert.equal((await writer.list(collection)).records.length, 100);
    const calls = resourceSends;
    for (const condition of [undefined, '', 'invalid'])
        await assert.rejects(() => writer.applyConditional([], condition), { code: 'InvalidCommit' });
    assert.equal(resourceSends, calls);
    cases.push('real-PDS-stale-condition-and-local-malformed-condition-refusals');
    const legacy = new PdsClient(env.url, account.did, account.accessJwt);
    assert.equal((await legacy.list(collection)).length, 102);
    // Use the saved native fetch because the global test bridge expects the host
    // OAuth dispatcher; no legacy credential is routed through the synthetic AS.
    const raw = await nativeFetch(env.url +
        '/xrpc/com.atproto.sync.getBlob?did=' +
        encodeURIComponent(account.did) +
        '&cid=' +
        encodeURIComponent(blob.ref.$link));
    assert.equal(raw.status, 200);
    assert.deepEqual(new Uint8Array(await raw.arrayBuffer()), new Uint8Array(524288).fill(17));
    cases.push('real-PDS-retained-RAW-blob-exact-byte-recovery');
    const pngRecovered = await nativeFetch(env.url +
        '/xrpc/com.atproto.sync.getBlob?did=' +
        encodeURIComponent(account.did) +
        '&cid=' +
        encodeURIComponent(pngBlob.ref.$link));
    assert.equal(pngRecovered.status, 200);
    assert.equal(pngRecovered.headers.get('content-type'), 'image/png');
    assert.deepEqual(new Uint8Array(await pngRecovered.arrayBuffer()), png);
    const current = await writer.latestCommit();
    const beforeLost = resourceSends;
    dropAfterApply = true;
    await assert.rejects(() => writer.applyConditional([{ ...writes[0], rkey: 'lost', value: { $type: collection, text: 'accepted despite lost reply' } }], current.cid), { code: 'content_unavailable' });
    assert.equal(resourceSends, beforeLost + 1);
    assert.equal((await writer.get(collection, 'lost')).uri, `at://${account.did}/${collection}/lost`);
    cases.push('real-PDS-accepted-write-lost-reply-single-send-no-writer-reconciliation');
    console.log(JSON.stringify({
        node: process.version,
        cases,
        resourceSends,
        sniffedUpload: {
            requestType: 'application/octet-stream',
            responseType: pngBlob.mimeType,
            bytes: png.length,
            exactRetainedByteRecovery: true,
        },
        maintainedClient: true,
        syntheticAS: true,
        realReferencePDS: true,
        testOnlyLoopbackBearerBridge: true,
        publicProviderExecuted: false,
        officialPDSDPoPAcceptanceClaim: false,
    }));
}
finally {
    globalThis.fetch = nativeFetch;
    await env.close();
}
