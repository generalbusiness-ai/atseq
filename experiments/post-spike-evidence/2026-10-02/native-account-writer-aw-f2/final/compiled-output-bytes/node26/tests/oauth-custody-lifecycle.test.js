import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:https';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { OAUTH_DID, OAUTH_SCOPE } from "./support/oauth-fixture.js";
test('actual BFCache restores exactly one custody timer, which performs idle cleanup after repeated restores', { timeout: 120_000 }, async () => {
    const directory = await mkdtemp(join(tmpdir(), 'atseq-custody-bfcache-'));
    // Test-only ephemeral TLS material; no live-origin certificate or credential.
    execFileSync('openssl', [
        'req',
        '-x509',
        '-newkey',
        'rsa:2048',
        '-nodes',
        '-keyout',
        join(directory, 'key.pem'),
        '-out',
        join(directory, 'cert.pem'),
        '-days',
        '1',
        '-subj',
        '/CN=custody.atseq-probe.net',
        '-addext',
        'subjectAltName=DNS:*.atseq-probe.net',
    ], { stdio: 'ignore' });
    const output = resolve('.atseq-local/oauth-bfcache');
    const built = await build({
        entryPoints: ['tests/support/oauth-browser-probe.ts'],
        bundle: true,
        splitting: true,
        outdir: output,
        format: 'esm',
        platform: 'browser',
        target: 'es2022',
        conditions: ['atseq-source', 'browser'],
        write: false,
        minify: true,
        plugins: process.env.ATSEQ_OAUTH_COMPILED
            ? [
                {
                    name: 'compiled-lifecycle-probe',
                    setup(builder) {
                        builder.onLoad({ filter: /oauth-browser-probe\.ts$/ }, async (args) => ({
                            contents: (await readFile(args.path, 'utf8'))
                                .replaceAll('../../src/browser/', '../../dist/src/browser/')
                                .replaceAll('oauth-loader.ts', 'oauth-loader.js')
                                .replaceAll('oauth-adapter.ts', 'oauth-adapter.js')
                                .replaceAll('oauth-custody.ts', 'oauth-custody.js')
                                .replaceAll('../../src/protocol/oauth.ts', '../../dist/src/protocol/oauth.js'),
                            loader: 'ts',
                        }));
                    },
                },
            ]
            : [],
    });
    const files = new Map(built.outputFiles.map((file) => ['/' + relative(output, file.path), file.contents]));
    const server = createServer({ key: await readFile(join(directory, 'key.pem')), cert: await readFile(join(directory, 'cert.pem')) }, (req, res) => {
        const bytes = files.get(new URL(req.url, 'https://fixture.invalid').pathname);
        res.writeHead(200, {
            'content-type': bytes ? 'text/javascript' : 'text/html',
            'cache-control': 'public,max-age=3600',
        });
        res.end(bytes ?? '<!doctype html><title>Native TLS custody lifecycle fixture</title>');
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const port = address.port;
    // Playwright normally disables BFCache, and its default headless shell did not
    // restore this fixture. Full Chromium + native TLS requests establish actual
    // persisted restoration; request interception is deliberately absent.
    const browser = await chromium.launch({
        channel: 'chromium',
        ignoreDefaultArgs: ['--disable-back-forward-cache'],
        args: ['--host-resolver-rules=MAP *.atseq-probe.net 127.0.0.1', '--no-proxy-server'],
    });
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    try {
        const page = await context.newPage();
        await page.addInitScript(() => {
            const state = {
                instance: crypto.randomUUID(),
                events: [],
                timers: new Set(),
                fires: 0,
            };
            globalThis.custodyLifecycle = state;
            const originalSet = setInterval, originalClear = clearInterval;
            globalThis.setInterval = ((work, time, ...args) => {
                const tracked = typeof work === 'function' && time === 60_000;
                const id = originalSet(tracked
                    ? () => {
                        state.fires++;
                        work(...args);
                    }
                    : work, time, ...(tracked ? [] : args));
                if (tracked)
                    state.timers.add(id);
                return id;
            });
            globalThis.clearInterval = ((id) => {
                if (id !== undefined)
                    state.timers.delete(id);
                originalClear(id);
            });
            addEventListener('pageshow', (event) => state.events.push({ event: 'pageshow', persisted: event.persisted }));
            addEventListener('pagehide', (event) => state.events.push({ event: 'pagehide', persisted: event.persisted }));
        });
        const custody = `https://custody.atseq-probe.net:${port}`;
        await page.goto(custody);
        await page.evaluate(async ({ port, scope }) => {
            const path = '/oauth-browser-probe.js';
            const probe = await import(path);
            globalThis.probe = probe;
            await probe.create({
                custodyOrigin: location.origin,
                publisherOrigin: `https://publisher.atseq-probe.net:${port}`,
                applicationOrigin: `https://application.atseq-probe.net:${port}`,
                metadata: {
                    client_id: location.origin + '/oauth.json',
                    application_type: 'web',
                    redirect_uris: [location.origin + '/callback'],
                    response_types: ['code'],
                    grant_types: ['authorization_code', 'refresh_token'],
                    token_endpoint_auth_method: 'none',
                    dpop_bound_access_tokens: true,
                    scope,
                },
            });
        }, { port, scope: OAUTH_SCOPE });
        const snapshot = () => page.evaluate(() => {
            const s = globalThis.custodyLifecycle;
            return { instance: s.instance, events: s.events, activeTimers: s.timers.size, fires: s.fires };
        });
        const initial = await snapshot();
        assert.equal(initial.activeTimers, 1);
        for (let restoration = 0; restoration < 3; restoration++) {
            await page.goto(`https://other.atseq-probe.net:${port}/away-${restoration}`);
            // A genuine restored document emits pageshow, not a new load event.
            await page.goBack({ waitUntil: 'commit' });
            await page.waitForFunction((count) => globalThis.custodyLifecycle.events.filter((event) => event.event === 'pageshow' && event.persisted).length === count, restoration + 1);
            const restored = await snapshot();
            assert.equal(restored.instance, initial.instance);
            assert.equal(restored.activeTimers, 1);
        }
        // Literal pre-PAR reservation rows exercise idle store cleanup without any
        // credential/AS network access or an adapter operation after restoration.
        await page.evaluate(async ({ did, scope }) => {
            const opening = indexedDB.open('atseq.oauth.custody.v1');
            const db = await new Promise((resolve, reject) => {
                opening.onsuccess = () => resolve(opening.result);
                opening.onerror = () => reject(opening.error);
            });
            try {
                const tx = db.transaction(['pending', 'accounts'], 'readwrite');
                tx.objectStore('pending').add({
                    id: crypto.randomUUID(),
                    did,
                    scopes: scope.split(' ').sort(),
                    expiresAt: Date.now() + 10,
                    consumed: false,
                });
                tx.objectStore('accounts').add({ did, phase: 'reserved', expiresAt: Date.now() + 10 });
                await new Promise((resolve, reject) => {
                    tx.oncomplete = () => resolve();
                    tx.onabort = () => reject(tx.error);
                });
            }
            finally {
                db.close();
            }
        }, { did: OAUTH_DID, scope: OAUTH_SCOPE });
        const before = await page.evaluate(() => globalThis.probe.custodyRows());
        assert.equal(before.pending.length, 1);
        assert.equal(before.accounts.length, 1);
        await page.waitForFunction(() => globalThis.custodyLifecycle.fires >= 1, undefined, { timeout: 75_000 });
        await page.waitForFunction(async () => {
            const rows = await globalThis.probe.custodyRows();
            return rows.pending.length === 0 && rows.accounts.length === 0;
        });
        const final = await snapshot();
        assert.equal(final.activeTimers, 1);
        assert.equal(final.fires, 1);
        console.log(JSON.stringify({
            case: 'actual-bfcache-housekeeping',
            chromium: browser.version(),
            compiled: !!process.env.ATSEQ_OAUTH_COMPILED,
            nativeTLS: true,
            requestInterception: false,
            restorations: 3,
            initial,
            final,
            actualMinuteTimerFired: true,
            idleReservedRowsPurged: true,
            providerSuccess: false,
        }));
    }
    finally {
        await context.close();
        await browser.close();
        server.closeAllConnections();
        await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
        await rm(directory, { recursive: true });
    }
});
