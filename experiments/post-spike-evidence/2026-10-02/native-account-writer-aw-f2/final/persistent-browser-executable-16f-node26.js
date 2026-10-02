import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { relative, resolve, join, dirname } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium } from '@playwright/test';
import { NativeWriterFixture, WRITER_COLLECTION } from "./support/native-account-writer-fixture.js";
import { OAUTH_CUSTODY, OAUTH_DID } from "./support/oauth-fixture.js";
test('Chromium persistent context close/reopen preserves native overflow live custody and reauthorization', async () => {
    const output = resolve('.atseq-local/native-account-writer-browser');
    const entry = process.env.ATSEQ_WRITER_BROWSER_ENTRY ?? 'tests/support/native-account-writer-browser-probe.ts';
    const built = await build({
        entryPoints: [entry],
        bundle: true,
        splitting: true,
        outdir: output,
        entryNames: 'writer',
        format: 'esm',
        platform: 'browser',
        target: 'es2022',
        conditions: entry.endsWith('.ts') ? ['atseq-source', 'browser'] : ['browser'],
        write: false,
        metafile: true,
    });
    const files = new Map(built.outputFiles.map((file) => ['/' + relative(output, file.path), file.contents]));
    const bundleHashes = Object.fromEntries(built.outputFiles.map((file) => [
        relative(output, file.path),
        createHash('sha256').update(file.contents).digest('hex'),
    ]));
    // Capture the actual executable bytes before Chromium receives any of them.
    const capture = process.env.ATSEQ_WRITER_BROWSER_CAPTURE;
    if (capture) {
        await mkdir(capture, { recursive: true });
        for (const file of built.outputFiles) {
            const target = join(capture, 'bundle', relative(output, file.path));
            await mkdir(dirname(target), { recursive: true });
            await writeFile(target, file.contents);
        }
        await writeFile(join(capture, 'bundle-pins.json'), JSON.stringify({ entry, bundleHashes, metafile: built.metafile }, null, 2) + '\n');
    }
    const fixture = await new NativeWriterFixture().initialize();
    for (let index = 0; index < 101; index++)
        fixture.records.set('r' + index, { $type: WRITER_COLLECTION, index });
    const profile = resolve(".atseq-local/native-writer-profile-reopen-16f");
    let context = await chromium.launchPersistentContext(profile);
    let browser = context.browser();
    const attachRoutes = async () => { await context.route('https://**/*', async (route) => {
        const request = route.request(), url = new URL(request.url());
        if (url.origin === OAUTH_CUSTODY) {
            const file = files.get(url.pathname);
            await route.fulfill({
                status: 200,
                contentType: file ? 'text/javascript' : 'text/html',
                body: file ? Buffer.from(file) : '<!doctype html><title>Native account writer probe</title>',
            });
            return;
        }
        if (request.method() === 'OPTIONS') {
            await route.fulfill({
                status: 204,
                headers: {
                    'access-control-allow-origin': OAUTH_CUSTODY,
                    'access-control-allow-methods': 'GET, POST',
                    'access-control-allow-headers': '*',
                },
            });
            return;
        }
        const response = await fixture.fetch(new Request(request.url(), {
            method: request.method(),
            headers: request.headers(),
            body: request.postDataBuffer() ? new Uint8Array(request.postDataBuffer()) : null,
            credentials: 'omit',
            redirect: 'error',
            cache: 'no-store',
        }));
        await route.fulfill({
            status: response.status,
            body: Buffer.from(await response.arrayBuffer()),
            headers: {
                ...Object.fromEntries(response.headers),
                'access-control-allow-origin': OAUTH_CUSTODY,
                'access-control-expose-headers': 'DPoP-Nonce, WWW-Authenticate',
            },
        });
    }); };
    await attachRoutes();
    let page = await context.newPage();
    const initialize = async () => {
        await page.goto(OAUTH_CUSTODY);
        await page.evaluate(async () => {
            const path = '/writer.js';
            globalThis.writerProbe = await import(path);
            await globalThis.writerProbe.create();
        });
    };
    try {
        await initialize();
        await page.evaluate(() => globalThis.writerProbe.begin());
        const opened = await page.evaluate((params) => globalThis.writerProbe.complete(params), fixture.callback().toString());
        assert.deepEqual(opened, { did: OAUTH_DID, frozen: true, serialized: '{}' });
        assert.equal(await page.evaluate(() => globalThis.writerProbe.forgeries()), 4);
        assert.equal((await page.evaluate(() => globalThis.writerProbe.get())).uri, `at://${OAUTH_DID}/${WRITER_COLLECTION}/first`);
        const first = await page.evaluate(() => globalThis.writerProbe.list());
        const next = await page.evaluate((cursor) => globalThis.writerProbe.list(cursor), first.cursor);
        assert.equal(first.records.length, 100);
        assert.equal(next.records.length, 2);
        for (const size of [524288, 1048576]) {
            const blob = await page.evaluate((size) => globalThis.writerProbe.upload(size), size);
            assert.equal(blob.size, size);
            assert.ok(fixture.bodies.at(-1).every((byte) => byte === 17));
        }
        await assert.rejects(() => page.evaluate(() => globalThis.writerProbe.upload(1048577)));
        const old = fixture.commit, before = fixture.bodies.length;
        fixture.invalidTokenOnce = true;
        await page.evaluate((commit) => globalThis.writerProbe.apply(commit), old);
        assert.equal(fixture.bodies.length, before + 2);
        assert.deepEqual(fixture.bodies.at(-1), fixture.bodies.at(-2));
        assert.ok(new TextDecoder().decode(fixture.bodies.at(-1)).includes('before'));
        await assert.rejects(() => page.evaluate((commit) => globalThis.writerProbe.apply(commit), old));
        assert.equal(await page.evaluate(() => globalThis.writerProbe.ordinary(65536)), 200);
        await assert.rejects(() => page.evaluate(() => globalThis.writerProbe.ordinary(65537)));
        await page.reload();
        await initialize();
        assert.equal(await page.evaluate(() => globalThis.writerProbe.restore()), OAUTH_DID);
        assert.equal((await page.evaluate(() => globalThis.writerProbe.mutate())).cid, fixture.commit);
        await assert.rejects(() => page.evaluate(() => globalThis.writerProbe.upload(1, true)));
        const recoveryMessage = 'OAuth credential request exceeds the byte limit; reauthorization is required';
        fixture.refreshPadding = 21846;
        fixture.refreshCharacter = '+';
        await page.evaluate(() => globalThis.writerProbe.begin());
        await page.evaluate((params) => globalThis.writerProbe.complete(params), fixture.callback().toString());
        const beforeCredential = fixture.count('/token');
        const stored = await page.evaluate(() => globalThis.writerProbe.custodyStatus());
        assert.equal(stored.phase, 'live');
        assert.ok(stored.metadataBytes > 21846 && stored.metadataBytes < 65536);
        const expectedEncodedBytes = new TextEncoder().encode(new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: 'synthetic-refresh-' + '+'.repeat(21846),
            client_id: OAUTH_CUSTODY + '/oauth.json',
        }).toString()).length;
        let observedSizes = [];
        for (const method of ['upload', 'get', 'list', 'latest', 'apply']) {
            fixture.invalidTokenOnce = true;
            const beforeResource = fixture.paths.length;
            if (method === 'upload')
                await page.evaluate(() => globalThis.writerProbe.startByteObservation());
            const refusal = await page.evaluate(({ method, commit }) => globalThis.writerProbe.failure(method, commit), { method, commit: fixture.commit });
            if (method === 'upload')
                observedSizes = await page.evaluate(() => globalThis.writerProbe.stopByteObservation());
            assert.deepEqual(refusal, { code: 'input', kind: 'invalid_input', status: null, message: recoveryMessage });
            assert.equal(fixture.count('/token'), beforeCredential);
            assert.equal(fixture.paths.length, beforeResource + 1);
            assert.equal((await page.evaluate(() => globalThis.writerProbe.custodyStatus())).phase, 'live');
        }
        assert.ok(expectedEncodedBytes > 65536 && observedSizes.includes(expectedEncodedBytes), 'Actual owned refresh reader counts encoded bytes, not Content-Length');
        await context.close();
        context = await chromium.launchPersistentContext(profile);
        browser = context.browser();
        await attachRoutes();
        page = await context.newPage();
        await initialize();
        assert.equal(await page.evaluate(() => globalThis.writerProbe.restore()), OAUTH_DID);
        fixture.invalidTokenOnce = true;
        assert.equal((await page.evaluate(() => globalThis.writerProbe.failure('upload'))).message, recoveryMessage);
        assert.equal((await page.evaluate(() => globalThis.writerProbe.custodyStatus())).phase, 'live');
        fixture.invalidTokenOnce = true;
        assert.equal(await page.evaluate(() => globalThis.writerProbe.ordinary(1)), 401);
        // A new authorization can still receive an oversized encoded credential.
        await page.evaluate(() => globalThis.writerProbe.begin());
        await page.evaluate((params) => globalThis.writerProbe.complete(params), fixture.callback().toString());
        const afterNewAuthorization = fixture.count('/token');
        fixture.invalidTokenOnce = true;
        assert.equal((await page.evaluate(() => globalThis.writerProbe.failure('upload'))).message, recoveryMessage);
        assert.equal(fixture.count('/token'), afterNewAuthorization);
        assert.equal((await page.evaluate(() => globalThis.writerProbe.custodyStatus())).phase, 'live');
        fixture.refreshPadding = 0;
        await page.evaluate(() => globalThis.writerProbe.begin());
        await page.evaluate((params) => globalThis.writerProbe.complete(params), fixture.callback().toString());
        assert.equal((await page.evaluate(() => globalThis.writerProbe.latest())).cid, fixture.commit);
        assert.equal((await page.evaluate(() => globalThis.writerProbe.custodyStatus())).phase, 'live');
        // A genuinely dispatched bounded token failure still retires under CF-1.
        fixture.invalidTokenOnce = true;
        fixture.refuse = '/token';
        const beforeDispatched = fixture.count('/token');
        const dispatched = await page.evaluate(() => globalThis.writerProbe.failure('upload'));
        assert.equal(dispatched.code, 'RequestFailed');
        assert.equal(dispatched.status, 401);
        assert.ok(fixture.count('/token') > beforeDispatched);
        assert.equal((await page.evaluate(() => globalThis.writerProbe.custodyStatus())).phase, null);
        console.log(JSON.stringify({
            browser: browser.version(),
            entry,
            compiledProduction: !entry.endsWith('.ts'),
            maintainedClient: true,
            syntheticASAndResource: true,
            publicProviderExecuted: false,
            bundledBytes: built.outputFiles.reduce((size, file) => size + file.contents.length, 0),
            bundleHashes,
            resources: fixture.paths.length,
            credentialRecovery: {
                message: recoveryMessage,
                storedMetadataBytes: stored.metadataBytes,
                actualCountedEncodedRefreshBytes: expectedEncodedBytes,
                maintainedMethods: 5,
                reloadLive: true,
                actualPersistentContextClosedAndReopened: true,
                boundedReauthorization: true,
                actualDispatchedFailureRetired: true,
            },
        }));
    }
    finally {
        await context.close();
        await browser.close();
    }
});
