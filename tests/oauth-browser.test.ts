import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { relative, resolve } from 'node:path';
import { chromium } from '@playwright/test';
import {
  OAuthFixture,
  OAUTH_CUSTODY,
  OAUTH_DID,
  OAUTH_OTHER_DID,
  OAUTH_SCOPE,
  oauthMetadata,
} from './support/oauth-fixture.ts';

test('Chromium exercises maintained OAuth, custody origin, reload, cross-document consume and non-extractable key', async () => {
  const output = resolve('.atseq-local/oauth-browser');
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
    metafile: true,
    minify: true,
  });
  const files = new Map(built.outputFiles.map((file) => ['/' + relative(output, file.path), file.contents]));
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const fixture = new OAuthFixture();
  fixture.challenge = true;
  let cookiesSent = 0;
  let abortPath = '';
  await context.addCookies([
    {
      name: 'synthetic-cookie',
      value: 'not-an-account-credential',
      domain: 'auth.atseq-probe.net',
      path: '/',
      secure: true,
    },
  ]);
  await context.route('https://**/*', async (route) => {
    const request = route.request(),
      url = new URL(request.url());
    if (url.origin === OAUTH_CUSTODY) {
      const file = files.get(url.pathname);
      await route.fulfill({
        status: 200,
        contentType: file ? 'text/javascript' : 'text/html',
        body: file ? Buffer.from(file) : '<!doctype html><title>Trusted OAuth custody probe</title>',
      });
      return;
    }
    if (request.headers().cookie) cookiesSent++;
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
    if (url.pathname === abortPath) {
      fixture.calls.push(url.origin + url.pathname);
      await route.abort('failed');
      return;
    }
    const response = await fixture.fetch(
      new Request(request.url(), {
        method: request.method(),
        headers: request.headers(),
        body: request.postDataBuffer() ? new Uint8Array(request.postDataBuffer()!) : null,
        credentials: 'omit',
        redirect: 'error',
        cache: 'no-store',
      }),
    );
    await route.fulfill({
      status: response.status,
      body: Buffer.from(await response.arrayBuffer()),
      headers: {
        ...Object.fromEntries(response.headers),
        'access-control-allow-origin': OAUTH_CUSTODY,
        'access-control-expose-headers': 'DPoP-Nonce, WWW-Authenticate',
      },
    });
  });
  await context.route('http://untrusted.atseq-probe.net/**', async (route) => {
    const file = files.get(new URL(route.request().url()).pathname);
    await route.fulfill({
      status: 200,
      contentType: file ? 'text/javascript' : 'text/html',
      body: file ? Buffer.from(file) : '<!doctype html><title>Insecure refusal probe</title>',
    });
  });
  const page = await context.newPage(),
    other = await context.newPage();
  const initialize = async (target: typeof page) => {
    await target.goto(OAUTH_CUSTODY);
    return target.evaluate(async () => {
      const path = '/oauth-browser-probe.js';
      (globalThis as any).probe = await import(path);
      return (globalThis as any).probe.create();
    });
  };
  try {
    const created = await initialize(page);
    assert.equal(created.secure, true);
    assert.equal(created.locks, true);
    assert.equal(created.serialized, '{}');
    await page.evaluate(() => (globalThis as any).probe.begin());
    const params = fixture.callback().toString();
    // A new document must consume the retained transaction and official IndexedDB state.
    await page.reload();
    await initialize(page);
    await initialize(other);
    const race = await Promise.allSettled(
      [page, other].map((target) => target.evaluate((params) => (globalThis as any).probe.complete(params), params)),
    );
    assert.equal(race.filter((result) => result.status === 'fulfilled').length, 1);
    const winner = race[0]!.status === 'fulfilled' ? page : other;
    const accepted = race.find((result) => result.status === 'fulfilled');
    assert.ok(accepted?.status === 'fulfilled');
    assert.equal(accepted.value.info.did, OAUTH_DID);
    assert.equal(accepted.value.serialized, '{}');
    assert.equal(fixture.count('/token'), 2);
    assert.deepEqual(await winner.evaluate(() => (globalThis as any).probe.resource()), { accepted: true });
    await winner.evaluate(() => (globalThis as any).probe.info(true));
    const keyProperties = await winner.evaluate(() => (globalThis as any).probe.storedKeyProperties());
    assert.deepEqual(keyProperties, [{ privateExtractable: false, privateType: 'private', publicExtractable: true }]);
    await winner.reload();
    await initialize(winner);
    const restored = await winner.evaluate(() => (globalThis as any).probe.restore());
    assert.equal(restored.did, OAUTH_DID);
    assert.deepEqual(restored.scopes, OAUTH_SCOPE.split(' ').sort());
    await assert.rejects(
      () =>
        winner.evaluate((metadata) => (globalThis as any).probe.create({ metadata }), {
          ...oauthMetadata,
          client_id: OAUTH_CUSTODY + '/different.json',
        }),
      /pinned to another client/,
    );
    await assert.rejects(
      () =>
        winner.evaluate(() =>
          (globalThis as any).probe.create({ applicationOrigin: 'https://custody.atseq-probe.net' }),
        ),
      /dedicated secure custody origin/,
    );
    await winner.evaluate(() => (globalThis as any).probe.revoke());
    await assert.rejects(() => winner.evaluate(() => (globalThis as any).probe.restore()));
    // Missing issuer is refused before token exchange, even though the library
    // receives a valid state and code. A valid completion then consumes it once.
    await winner.evaluate(() => (globalThis as any).probe.begin());
    const missingParams = fixture.callback();
    missingParams.delete('iss');
    const tokenBefore = fixture.count('/token');
    await assert.rejects(
      () => winner.evaluate((params) => (globalThis as any).probe.complete(params), missingParams.toString()),
      /Incomplete OAuth callback/,
    );
    assert.equal(fixture.count('/token'), tokenBefore);
    const fullParams = fixture.callback().toString();
    await winner.evaluate((params) => (globalThis as any).probe.complete(params), fullParams);
    await assert.rejects(
      () => winner.evaluate((params) => (globalThis as any).probe.complete(params), fullParams),
      /OAuth operation failed/,
    );
    assert.equal(fixture.count('/token'), tokenBefore + 1);
    // Malformed/unknown callback state must leave both pending enrolments usable.
    await winner.evaluate(() => (globalThis as any).probe.begin());
    const firstPending = fixture.callback();
    await winner.evaluate((did) => (globalThis as any).probe.begin(did), OAUTH_OTHER_DID);
    const secondPending = fixture.callback();
    const beforePending = fixture.count('/token');
    for (const mode of ['unknown', 'duplicate', 'malformed'] as const) {
      const bad = new URLSearchParams(firstPending);
      if (mode === 'unknown') bad.set('state', crypto.randomUUID());
      if (mode === 'duplicate') bad.append('state', secondPending.get('state')!);
      if (mode === 'malformed') bad.set('state', 'bad');
      await assert.rejects(() =>
        winner.evaluate((params) => (globalThis as any).probe.complete(params), bad.toString()),
      );
    }
    assert.equal(fixture.count('/token'), beforePending);
    for (const [pending, did] of [
      [secondPending, OAUTH_OTHER_DID],
      [firstPending, OAUTH_DID],
    ] as const) {
      fixture.tokenDid = did;
      await winner.evaluate((params) => (globalThis as any).probe.complete(params), pending.toString());
    }
    fixture.tokenDid = OAUTH_DID;
    assert.equal(fixture.count('/token'), beforePending + 2);
    abortPath = '/xrpc/ai.generalbusiness.atseq.synthetic';
    await assert.rejects(
      () => winner.evaluate(() => (globalThis as any).probe.resource()),
      /OAuth operation is unavailable/,
    );
    abortPath = '';
    await winner.evaluate(() => (globalThis as any).probe.begin());
    await winner.evaluate((params) => (globalThis as any).probe.complete(params), fixture.callback().toString());
    fixture.redirectResource = true;
    // Fetch redirect:error rejects at the native edge, indistinguishably from network failure.
    await assert.rejects(
      () => winner.evaluate(() => (globalThis as any).probe.resource()),
      /OAuth operation is unavailable/,
    );
    assert.equal(fixture.count('/redirect-target'), 0);
    fixture.redirectResource = false;
    await winner.evaluate(() => (globalThis as any).probe.begin());
    await winner.evaluate((params) => (globalThis as any).probe.complete(params), fixture.callback().toString());
    fixture.resourceBytes = 1024 * 1024 + 1;
    await assert.rejects(() => winner.evaluate(() => (globalThis as any).probe.resource()), /OAuth operation failed/);
    fixture.resourceBytes = 0;
    await winner.evaluate(() => (globalThis as any).probe.begin());
    await winner.evaluate((params) => (globalThis as any).probe.complete(params), fixture.callback().toString());
    fixture.refuse = '/token';
    await assert.rejects(() => winner.evaluate(() => (globalThis as any).probe.info(true)), /OAuth operation failed/);
    fixture.refuse = '';
    await initialize(winner);
    await assert.rejects(
      () =>
        winner.evaluate(async () => {
          Object.defineProperty(navigator, 'locks', { value: undefined, configurable: true });
          try {
            await (globalThis as any).probe.create();
          } finally {
            delete (navigator as any).locks;
          }
        }),
      /dedicated secure custody origin/,
    );
    await assert.rejects(
      () =>
        winner.evaluate(async () => {
          const original = Storage.prototype.setItem;
          Storage.prototype.setItem = () => {
            throw new DOMException('Synthetic storage denial', 'SecurityError');
          };
          try {
            await (globalThis as any).probe.create();
          } finally {
            Storage.prototype.setItem = original;
          }
        }),
      /Synthetic storage denial/,
    );
    await initialize(winner);
    await winner.evaluate(() => (globalThis as any).probe.begin());
    await winner.evaluate(async () => {
      const open = indexedDB.open('atseq.oauth.custody.v1');
      const db = await new Promise<IDBDatabase>((resolve) => {
        open.onsuccess = () => resolve(open.result);
      });
      const tx = db.transaction('pending', 'readwrite');
      const store = tx.objectStore('pending');
      const rows = store.getAll();
      rows.onsuccess = () => {
        for (const row of rows.result) {
          row.expiresAt = Date.now() - 1;
          store.put(row);
        }
      };
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onabort = () => reject(tx.error);
      });
      db.close();
    });
    const beforeExpired = fixture.count('/token');
    await assert.rejects(
      () => winner.evaluate((params) => (globalThis as any).probe.complete(params), fixture.callback().toString()),
      /OAuth operation failed/,
    );
    assert.equal(fixture.count('/token'), beforeExpired);
    const insecure = await context.newPage();
    await insecure.goto('http://untrusted.atseq-probe.net');
    const refusal = await insecure.evaluate(async () => {
      const path = '/oauth-browser-probe.js',
        probe = await import(path);
      try {
        await probe.create();
        return { secure: isSecureContext, refused: false };
      } catch {
        return { secure: isSecureContext, refused: true };
      }
    });
    assert.deepEqual(refusal, { secure: false, refused: true });
    await insecure.close();
    assert.equal(cookiesSent, 0);
    console.log(
      JSON.stringify({
        browser: browser.version(),
        syntheticOnly: true,
        providerSuccess: false,
        crossDocumentOneExchange: true,
        twoPendingStateSelection: true,
        nativeTransportUnavailable: true,
        deterministicHTTPRefusal: true,
        reloadRestored: true,
        keyProperties,
        cookiesSent,
        isolatedPublisherAndAppOrigin: true,
      }),
    );
  } finally {
    await context.close();
    await browser.close();
  }
});
