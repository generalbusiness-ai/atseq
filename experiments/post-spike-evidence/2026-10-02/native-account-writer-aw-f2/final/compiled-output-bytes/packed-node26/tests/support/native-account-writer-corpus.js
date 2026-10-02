import { NativeAccountWriter } from "../../../packed-writer-final-16f-node26-published-inputs/node_modules/atseq/dist/src/transport/native-account-writer.js";
import { OAuthSessionHandle } from "../../../packed-writer-final-16f-node26-published-inputs/node_modules/atseq/dist/src/protocol/oauth.js";
import { AtseqError } from "../../../packed-writer-final-16f-node26-published-inputs/node_modules/atseq/dist/src/core/errors.js";
import { PdsError } from "../../../packed-writer-final-16f-node26-published-inputs/node_modules/atseq/dist/src/transport/pds-operations.js";
import { OAUTH_DID, OAUTH_OTHER_DID, OAUTH_SCOPE } from "./oauth-fixture.js";
import { NativeWriterFixture, WRITER_COLLECTION } from "./native-account-writer-fixture.js";
import { observeStreamByteCounts } from "./native-account-writer-byte-observation.js";
import { OAUTH_CUSTODY } from "./oauth-fixture.js";
import { largeNativeBatch } from "./native-account-writer-native-batch.js";
const check = (value, message) => {
    if (!value)
        throw new Error(message);
};
async function refused(work, code) {
    try {
        await work();
    }
    catch (error) {
        check(error instanceof AtseqError || error instanceof PdsError, 'Failure must be an owned finite error');
        check(code === undefined || error.code === code, 'Unexpected refusal category: ' + code);
        check(!error.message.includes('private-secret'), 'Provider secret escaped');
        return;
    }
    throw new Error('Expected refusal');
}
export async function runNativeWriterCorpus(createAdapter) {
    const results = [];
    async function open() {
        const fixture = await new NativeWriterFixture().initialize();
        const adapter = await createAdapter(fixture);
        await adapter.begin(OAUTH_DID, OAUTH_SCOPE);
        const handle = await adapter.complete(fixture.callback());
        const writer = await NativeAccountWriter.open(handle, OAUTH_DID);
        return { fixture, adapter, handle, writer };
    }
    let state = await open();
    const { writer, handle, adapter, fixture } = state;
    check(writer.did === OAUTH_DID && JSON.stringify(writer) === '{}', 'Immutable opaque writer');
    const restored = await adapter.restore(OAUTH_DID, OAUTH_SCOPE);
    check((await NativeAccountWriter.open(restored, OAUTH_DID)).did === OAUTH_DID, 'Genuine restored handle');
    results.push('maintained-callback-and-restore-owned-writer');
    for (const fake of [
        {},
        Object.create(OAuthSessionHandle.prototype),
        structuredClone(handle),
        Object.assign({}, handle),
        new OAuthSessionHandle({}, {}, {}),
    ]) {
        let invoked = false;
        fake.info = fake.request = () => {
            invoked = true;
            throw new Error('private-secret');
        };
        await refused(() => NativeAccountWriter.open(fake, OAUTH_DID), 'input');
        check(!invoked, 'Fabricated public methods must never run');
    }
    await refused(() => NativeAccountWriter.open(handle, OAUTH_OTHER_DID), 'input');
    for (const did of ['', 'did:key:zfake', 'did:web:host%3a443', 'did:web:' + 'a'.repeat(2049)])
        await refused(() => NativeAccountWriter.open(handle, did), 'input');
    check(Object.isFrozen(writer), 'Writer must not acquire shadow DID/account fields');
    handle.info = handle.request = (() => {
        throw new Error('private-secret');
    });
    check((await writer.latestCommit()).cid === fixture.commit, 'Owned operations bypass handle mutation');
    check((await NativeAccountWriter.open(handle, OAUTH_DID)).did === OAUTH_DID, 'Open bypasses mutable methods');
    results.push('constructor-prototype-clone-forgery-and-public-method-mutation-refused');
    check((await writer.get(WRITER_COLLECTION, 'first')).uri.endsWith('/first'), 'Exact record');
    for (let index = 0; index < 101; index++)
        fixture.records.set('r' + index, { $type: WRITER_COLLECTION, index });
    const first = await writer.list(WRITER_COLLECTION);
    const next = await writer.list(WRITER_COLLECTION, { cursor: first.cursor });
    check(first.records.length === 100 && next.records.length === 2 && next.cursor === undefined, 'Explicit page boundary');
    for (const limit of [0, 101, 1.5, NaN, '5'])
        await refused(() => writer.list(WRITER_COLLECTION, { limit: limit }), 'input');
    for (const cursor of ['', 1, 'é'.repeat(4097)])
        await refused(() => writer.list(WRITER_COLLECTION, { cursor: cursor }), 'input');
    results.push('standard-get-and-explicit-102-record-pages-bounded-input');
    for (const invalid of [undefined, '', 1, 'not-a-cid'])
        await refused(() => writer.applyConditional([], invalid), 'InvalidCommit');
    const previous = fixture.commit;
    const writes = [
        {
            $type: 'com.atproto.repo.applyWrites#create',
            collection: WRITER_COLLECTION,
            rkey: 'saved',
            value: { text: 'before' },
        },
    ];
    fixture.invalidTokenOnce = true;
    const before = fixture.bodies.length;
    const pending = writer.applyConditional(writes, previous);
    writes[0].value.text = 'after';
    await pending;
    const sends = fixture.bodies.slice(before);
    check(sends.length === 2 && sends.every((body) => new TextDecoder().decode(body).includes('before')), 'Exact condition/body through maintained refresh');
    check(new TextDecoder().decode(sends[0]) === new TextDecoder().decode(sends[1]), 'Maintained refresh unchanged bytes');
    await refused(() => writer.applyConditional([], previous), 'InvalidSwap');
    results.push('mandatory-CAS-captured-before-await-maintained-401-identical-body-no-writer-retry');
    for (const size of [65536, 65537, 524288, 1048576]) {
        const bytes = new Uint8Array(size).fill(17);
        const sending = writer.upload(bytes);
        bytes.fill(23);
        const blob = await sending;
        check(blob.size === size && fixture.bodies.at(-1)?.every((byte) => byte === 17), 'Captured exact upload bytes');
    }
    const count = fixture.paths.length;
    await refused(() => writer.upload(new Uint8Array(1048577)), 'input');
    check(fixture.paths.length === count, 'Over limit before resource transport');
    results.push('owned-upload-64KiB-plus-one-512KiB-1MiB-copy-and-1MiB-plus-one-local-refusal');
    const sampleBlob = await writer.upload(new Uint8Array(1));
    for (const invalid of [
        { ...sampleBlob, mimeType: '' },
        { ...sampleBlob, mimeType: 'private-secret' },
        { ...sampleBlob, mimeType: 'text/' + 'x'.repeat(257) },
        { ...sampleBlob, mimeType: 'text/plain;private-secret' },
        { ...sampleBlob, size: 0 },
        { ...sampleBlob, ref: { $link: fixture.commit } },
    ]) {
        fixture.overrideResponse = () => new Response(JSON.stringify({ blob: invalid }));
        await refused(() => writer.upload(new Uint8Array(1)), 'InvalidResponse');
    }
    fixture.overrideResponse = undefined;
    results.push('bounded-returned-blob-MIME-size-RAW-CID-shapes-refused-without-provider-text');
    const large = [{ ...writes[0], value: { text: 'x'.repeat(200000) } }];
    await writer.applyConditional(large, fixture.commit);
    check(fixture.bodies.at(-1).length > 65536, 'Large conditional JSON');
    await refused(() => writer.applyConditional([{ ...writes[0], value: { text: 'x'.repeat(1048576) } }], fixture.commit), 'input');
    results.push('large-conditional-JSON-and-whole-batch-local-cap');
    const capCondition = fixture.commit;
    const capWrites = [{ ...writes[0], value: { text: '' } }];
    const envelopeBytes = new TextEncoder().encode(JSON.stringify({ repo: OAUTH_DID, validate: false, writes: capWrites, swapCommit: capCondition })).length;
    capWrites[0].value.text = 'x'.repeat(1048576 - envelopeBytes);
    await writer.applyConditional(capWrites, capCondition);
    check(fixture.bodies.at(-1).length === 1048576, 'Actual apply body at exact 1 MiB');
    const overCondition = fixture.commit;
    capWrites[0].value.text += 'x';
    const beforeOver = fixture.paths.length;
    await refused(() => writer.applyConditional(capWrites, overCondition), 'input');
    check(fixture.paths.length === beforeOver, 'Exact 1 MiB plus one apply refused before resource transport');
    results.push('maintained-exact-1MiB-conditional-body-and-one-byte-over-local-refusal');
    // A separate genuine restored public handle retains its ordinary 64 KiB policy.
    for (const size of [65536, 65537]) {
        const work = () => restored.request('/xrpc/ai.generalbusiness.atseq.synthetic', { method: 'POST', body: new Uint8Array(size) });
        if (size === 65536)
            check((await work()).ok, 'Default exact 64 KiB');
        else
            await refused(work, 'input');
    }
    results.push('default-request-stays-64KiB-after-native-success');
    for (const remote of [
        { uri: `at://${OAUTH_OTHER_DID}/${WRITER_COLLECTION}/first`, cid: fixture.commit, value: {} },
        { uri: `at://${OAUTH_DID}/${WRITER_COLLECTION}/other`, cid: fixture.commit, value: {} },
        { uri: `at://${OAUTH_DID}/${WRITER_COLLECTION}/first`, cid: 'bad', value: {} },
        { uri: `at://${OAUTH_DID}/${WRITER_COLLECTION}/first`, cid: fixture.commit },
    ]) {
        fixture.overrideResponse = () => new Response(JSON.stringify(remote));
        await refused(() => writer.get(WRITER_COLLECTION, 'first'), 'InvalidResponse');
    }
    for (const remote of [
        null,
        { records: 'bad' },
        { records: [], cursor: '' },
        { records: [], cursor: 'é'.repeat(4097) },
        { records: [{ uri: 'bad', cid: 'bad', value: {} }] },
    ]) {
        fixture.overrideResponse = () => new Response(JSON.stringify(remote));
        await refused(() => writer.list(WRITER_COLLECTION));
    }
    results.push('malformed-record-and-page-shapes-account-key-CID-cursor-refused');
    for (const code of ['AuthenticationUnavailable', 'private-secret', 'InvalidSwap', 'Forbidden']) {
        fixture.overrideResponse = () => new Response(JSON.stringify({ error: code, message: 'private-secret' }), { status: 403 });
        await refused(() => writer.get(WRITER_COLLECTION, 'first'), ['InvalidSwap', 'Forbidden'].includes(code) ? code : 'RequestFailed');
    }
    fixture.overrideResponse = () => new Response('x'.repeat(65537), { status: 400 });
    await refused(() => writer.get(WRITER_COLLECTION, 'first'), 'input');
    fixture.resourceBytes = 1048577;
    await refused(() => writer.list(WRITER_COLLECTION), 'input');
    fixture.resourceBytes = 0;
    results.push('closed-provider-codes-local-auth-separation-and-counted-response-error-limits');
    fixture.overrideResponse = () => {
        throw new Error('private-secret lost response');
    };
    const lostBefore = fixture.paths.length;
    await refused(() => writer.applyConditional([], fixture.commit), 'content_unavailable');
    check(fixture.paths.length === lostBefore + 1, 'Lost response must send once');
    fixture.overrideResponse = undefined;
    await refused(() => restored.request('/xrpc/ai.generalbusiness.atseq.synthetic', { method: 'POST', body: new Uint8Array(65537) }), 'input');
    await refused(() => writer.upload(new Uint8Array(10), 'application/octet-stream', { signal: AbortSignal.abort() }), 'content_unavailable');
    results.push('lost-response-single-send-cancel-and-error-allowance-cleanup');
    for (const mode of ['pds', 'issuer', 'scope']) {
        state = await open();
        if (mode === 'pds')
            state.fixture.pds = 'https://different-pds.atseq-probe.net';
        if (mode === 'issuer')
            state.fixture.issuer = 'https://different-auth.atseq-probe.net';
        if (mode === 'scope') {
            state.fixture.invalidTokenOnce = true;
            state.fixture.tokenScope = OAUTH_SCOPE + ' repo:extra';
        }
        const prior = state.fixture.paths.length;
        await refused(() => state.writer.upload(new Uint8Array(524288)), 'input');
        check(state.fixture.paths.length === prior + (mode === 'scope' ? 1 : 0), 'Fresh authority and refresh-scope dispatch boundary');
    }
    results.push('fresh-PDS-issuer-and-refresh-scope-refusal-before-second-write');
    for (const mode of ['subject', 'missing-scope', 'extra-scope']) {
        const bad = await new NativeWriterFixture().initialize();
        const owner = await createAdapter(bad);
        await owner.begin(OAUTH_DID, OAUTH_SCOPE);
        if (mode === 'subject')
            bad.tokenDid = OAUTH_OTHER_DID;
        if (mode === 'missing-scope')
            bad.tokenScope = 'atproto';
        if (mode === 'extra-scope')
            bad.tokenScope = OAUTH_SCOPE + ' repo:extra';
        await refused(() => owner.complete(bad.callback()), 'input');
        check(bad.paths.length === 0, 'Subject/scope refusal must precede resource dispatch');
    }
    results.push('maintained-subject-missing-and-extra-scope-refused-before-mint');
    const native = await largeNativeBatch();
    const nativeFixture = await new NativeWriterFixture().initialize();
    nativeFixture.tokenDid = native.app;
    const nativeAdapter = await createAdapter(nativeFixture);
    await nativeAdapter.begin(native.app, OAUTH_SCOPE);
    const nativeHandle = await nativeAdapter.complete(nativeFixture.callback());
    const nativeWriter = await NativeAccountWriter.open(nativeHandle, native.app);
    const condition = nativeFixture.commit;
    const nativeWrites = [...native.entryHeadWrites, ...native.chunkWrites];
    const expectedBody = JSON.stringify({
        repo: native.app,
        validate: false,
        writes: nativeWrites,
        swapCommit: condition,
    });
    check(new TextEncoder().encode(expectedBody).length > 65536, 'Actual accepted entry/head plus two bounded content chunks exceeds old resource cap');
    await nativeWriter.applyConditional(nativeWrites, condition);
    check(new TextDecoder().decode(nativeFixture.bodies.at(-1)) === expectedBody, 'Genuine accepted native entry/head and content chunk body unchanged');
    results.push('genuine-admitted-source-authority-evaluator-entry-head-and-two-content-chunks-unchanged-JSON');
    const oversized = await new NativeWriterFixture().initialize();
    oversized.refreshCharacter = '+';
    oversized.refreshPadding = 21846;
    const recoveryAdapter = await createAdapter(oversized);
    await recoveryAdapter.begin(OAUTH_DID, OAUTH_SCOPE);
    const recoveryHandle = await recoveryAdapter.complete(oversized.callback());
    const recoveryWriter = await NativeAccountWriter.open(recoveryHandle, OAUTH_DID);
    const recoveryText = 'OAuth credential request exceeds the byte limit; reauthorization is required';
    const rawRefresh = 'synthetic-refresh-' + '+'.repeat(21846);
    const encodedRefreshBytes = new TextEncoder().encode(new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: rawRefresh,
        client_id: OAUTH_CUSTODY + '/oauth.json',
    }).toString()).length;
    const stop = observeStreamByteCounts();
    for (const work of [
        () => recoveryWriter.upload(new Uint8Array(524288)),
        () => recoveryWriter.get(WRITER_COLLECTION, 'first'),
        () => recoveryWriter.list(WRITER_COLLECTION),
        () => recoveryWriter.latestCommit(),
        () => recoveryWriter.applyConditional(writes, oversized.commit),
    ]) {
        oversized.invalidTokenOnce = true;
        const before = oversized.paths.length;
        try {
            await work();
            throw new Error('Expected native recovery instruction');
        }
        catch (error) {
            check(error instanceof AtseqError &&
                error.code === 'input' &&
                error.kind === 'invalid_input' &&
                error.message === recoveryText, 'Byte-stable owned recovery instruction');
        }
        check(oversized.count('/token') === 1 && oversized.paths.length === before + 1, 'Blocked refresh has no dispatch or second resource send');
    }
    const observedSizes = stop();
    check(observedSizes.includes(encodedRefreshBytes), 'Actual owned Node reader counts encoded refresh bytes');
    oversized.invalidTokenOnce = true;
    check((await recoveryHandle.request('/xrpc/ai.generalbusiness.atseq.synthetic')).status === 401, 'Generic A1 still returns original swallowed refresh 401');
    await recoveryAdapter.begin(OAUTH_DID, OAUTH_SCOPE);
    const largeAgain = await recoveryAdapter.complete(oversized.callback());
    const largeAgainWriter = await NativeAccountWriter.open(largeAgain, OAUTH_DID);
    oversized.invalidTokenOnce = true;
    const afterNewAuthorization = oversized.count('/token');
    try {
        await largeAgainWriter.upload(new Uint8Array(1));
        throw new Error('Expected AS-issued oversized credential again');
    }
    catch (error) {
        check(error instanceof AtseqError && error.message === recoveryText, 'Reauthorization does not guarantee AS credential size');
    }
    check(oversized.count('/token') === afterNewAuthorization, 'New oversized credential is also blocked before refresh dispatch');
    oversized.refreshPadding = 0;
    await recoveryAdapter.begin(OAUTH_DID, OAUTH_SCOPE);
    const reauthorized = await recoveryAdapter.complete(oversized.callback());
    const renewedWriter = await NativeAccountWriter.open(reauthorized, OAUTH_DID);
    check((await renewedWriter.latestCommit()).cid === oversized.commit, 'Genuine fresh authorization with bounded credential succeeds');
    results.push('genuine-maintained-all-native-methods-encoded-refresh-overflow-fixed-text-no-dispatch-generic-401-and-fresh-reauthorization');
    const expired = await new NativeWriterFixture().initialize();
    expired.refreshPadding = 21846;
    expired.refreshCharacter = '+';
    expired.tokenExpiresIn = 1;
    const expiredAdapter = await createAdapter(expired);
    await expiredAdapter.begin(OAUTH_DID, OAUTH_SCOPE);
    const expiredHandle = await expiredAdapter.complete(expired.callback());
    const expiredWriter = await NativeAccountWriter.open(expiredHandle, OAUTH_DID);
    try {
        await expiredWriter.upload(new Uint8Array(1));
        throw new Error('Expected original A1 verification refusal');
    }
    catch (error) {
        check(error instanceof AtseqError && error.code === 'input' && error.message === 'OAuth operation failed', 'Pre-authority refresh retains generic A1 classification');
    }
    check(expired.paths.length === 0, 'Pre-authority failure sends no resource');
    results.push('pre-authority-automatic-refresh-remains-original-A1-generic-input-outside-native-marker');
    return {
        cases: results,
        credentialRecovery: {
            message: recoveryText,
            rawRefreshTokenBytes: new TextEncoder().encode(rawRefresh).length,
            actualCountedEncodedRefreshBytes: encodedRefreshBytes,
        },
        nativeBatch: {
            selectedFixtureVector: native.vector,
            payloadJSONBytes: native.payloadBytes,
            entryCBORBytes: native.entryBytes,
            entryHeadJSONBytes: new TextEncoder().encode(JSON.stringify({ repo: native.app, validate: false, writes: native.entryHeadWrites, swapCommit: condition })).length,
            entryHeadAndChunkJSONBytes: new TextEncoder().encode(expectedBody).length,
        },
    };
}
