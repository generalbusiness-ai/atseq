import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { relative, resolve, join, dirname } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium } from '@playwright/test';
import { NativeWriterFixture, WRITER_COLLECTION } from './support/native-account-writer-fixture.ts';
import { OAUTH_CUSTODY, OAUTH_DID } from './support/oauth-fixture.ts';
import { create, toString, CODEC_RAW } from '@atcute/cid';
import { UPLOAD_OWNERSHIP_VALID, UPLOAD_OWNERSHIP_INVALID } from './support/native-upload-ownership-inputs.ts';

test('Chromium native writer uses maintained browser OAuth and actual guarded fetch with bounded custody', async () => {
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
  const bundleHashes = Object.fromEntries(
    built.outputFiles.map((file) => [
      relative(output, file.path),
      createHash('sha256').update(file.contents).digest('hex'),
    ]),
  );
  // Capture the actual executable bytes before Chromium receives any of them.
  const capture = process.env.ATSEQ_WRITER_BROWSER_CAPTURE;
  if (capture) {
    await mkdir(capture, { recursive: true });
    for (const file of built.outputFiles) {
      const target = join(capture, 'bundle', relative(output, file.path));
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, file.contents);
    }
    await writeFile(
      join(capture, 'bundle-pins.json'),
      JSON.stringify({ entry, bundleHashes, metafile: built.metafile }, null, 2) + '\n',
    );
  }
  const fixture = await new NativeWriterFixture().initialize();
  for (let index = 0; index < 101; index++) fixture.records.set('r' + index, { $type: WRITER_COLLECTION, index });
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.route('https://**/*', async (route) => {
    const request = route.request(),
      url = new URL(request.url());
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
  const page = await context.newPage();
  const initialize = async () => {
    await page.goto(OAUTH_CUSTODY);
    await page.evaluate(async () => {
      const path = '/writer.js';
      (globalThis as any).writerProbe = await import(path);
      await (globalThis as any).writerProbe.create();
    });
  };
  try {
    await initialize();
    await page.evaluate(() => (globalThis as any).writerProbe.begin());
    const opened = await page.evaluate(
      (params) => (globalThis as any).writerProbe.complete(params),
      fixture.callback().toString(),
    );
    assert.deepEqual(opened, { did: OAUTH_DID, frozen: true, serialized: '{}' });
    assert.equal(await page.evaluate(() => (globalThis as any).writerProbe.forgeries()), 4);
    assert.equal(
      (await page.evaluate(() => (globalThis as any).writerProbe.get())).uri,
      `at://${OAUTH_DID}/${WRITER_COLLECTION}/first`,
    );
    const first = await page.evaluate(() => (globalThis as any).writerProbe.list());
    const next = await page.evaluate((cursor) => (globalThis as any).writerProbe.list(cursor), first.cursor);
    assert.equal(first.records.length, 100);
    assert.equal(next.records.length, 2);
    for (const size of [524288, 1048576]) {
      const blob = await page.evaluate((size) => (globalThis as any).writerProbe.upload(size), size);
      assert.equal(blob.size, size);
      assert.ok(fixture.bodies.at(-1)!.every((byte) => byte === 17));
    }
    await assert.rejects(() => page.evaluate(() => (globalThis as any).writerProbe.upload(1048577)));
    const sharedStorageAvailable = await page.evaluate(() => typeof SharedArrayBuffer !== 'undefined');
    const uploadOwnershipCases: string[] = [];
    for (const name of UPLOAD_OWNERSHIP_VALID) {
      if (name === 'shared-storage' && !sharedStorageAvailable) continue;
      const blob = await page.evaluate((name) => (globalThis as any).writerProbe.uploadOwnership(name), name);
      assert.equal(blob.size, name === 'zero-byte-length-spoof' ? 0 : 17);
      assert.deepEqual(fixture.bodies.at(-1), new Uint8Array(blob.size).fill(42));
      uploadOwnershipCases.push('valid-owned-' + name);
    }
    for (const name of UPLOAD_OWNERSHIP_INVALID) {
      const before = fixture.calls.length;
      const code = await page.evaluate(async (name) => {
        try {
          await (globalThis as any).writerProbe.uploadOwnership(name);
          return 'unexpected-success';
        } catch (error: any) {
          return error.code;
        }
      }, name);
      assert.equal(code, 'input');
      assert.equal(fixture.calls.length, before);
      uploadOwnershipCases.push('local-refusal-' + name);
    }
    const beforeRealm = fixture.calls.length;
    assert.equal(
      await page.evaluate(async () => {
        try {
          await (globalThis as any).writerProbe.uploadCrossRealm();
          return 'unexpected-success';
        } catch (error: any) {
          return error.code;
        }
      }),
      'input',
    );
    assert.equal(fixture.calls.length, beforeRealm);
    uploadOwnershipCases.push('explicit-cross-realm-refusal-before-any-HTTP');
    let malformedSentBytes = 0;
    fixture.overrideResponse = async (_request, body) => {
      malformedSentBytes = body.byteLength;
      return new Response(
        JSON.stringify({
          blob: {
            $type: 'blob',
            ref: { $link: toString(await create(CODEC_RAW, body)) },
            mimeType: 'application/octet-stream',
            size: 0,
          },
        }),
      );
    };
    assert.equal(
      await page.evaluate(async () => {
        try {
          await (globalThis as any).writerProbe.uploadOwnership('length-zero');
          return 'unexpected-success';
        } catch (error: any) {
          return error.code;
        }
      }),
      'InvalidResponse',
    );
    assert.equal(malformedSentBytes, 17);
    uploadOwnershipCases.push('root-17-sent-own-length-zero-malformed-size-zero-refused');
    fixture.overrideResponse = undefined;
    assert.equal((await page.evaluate(() => (globalThis as any).writerProbe.uploadOwnership('length-zero'))).size, 17);
    uploadOwnershipCases.push('valid-reply-after-malformed-refusal');
    const old = fixture.commit,
      before = fixture.bodies.length;
    fixture.invalidTokenOnce = true;
    await page.evaluate((commit) => (globalThis as any).writerProbe.apply(commit), old);
    assert.equal(fixture.bodies.length, before + 2);
    assert.deepEqual(fixture.bodies.at(-1), fixture.bodies.at(-2));
    assert.ok(new TextDecoder().decode(fixture.bodies.at(-1)!).includes('before'));
    await assert.rejects(() => page.evaluate((commit) => (globalThis as any).writerProbe.apply(commit), old));
    assert.equal(await page.evaluate(() => (globalThis as any).writerProbe.ordinary(65536)), 200);
    await assert.rejects(() => page.evaluate(() => (globalThis as any).writerProbe.ordinary(65537)));
    await page.reload();
    await initialize();
    assert.equal(await page.evaluate(() => (globalThis as any).writerProbe.restore()), OAUTH_DID);
    assert.equal((await page.evaluate(() => (globalThis as any).writerProbe.mutate())).cid, fixture.commit);
    await assert.rejects(() => page.evaluate(() => (globalThis as any).writerProbe.upload(1, true)));
    const recoveryMessage = 'OAuth credential request exceeds the byte limit; reauthorization is required';
    fixture.refreshPadding = 21846;
    fixture.refreshCharacter = '+';
    await page.evaluate(() => (globalThis as any).writerProbe.begin());
    await page.evaluate((params) => (globalThis as any).writerProbe.complete(params), fixture.callback().toString());
    const beforeCredential = fixture.count('/token');
    const stored = await page.evaluate(() => (globalThis as any).writerProbe.custodyStatus());
    assert.equal(stored.phase, 'live');
    assert.ok(stored.metadataBytes > 21846 && stored.metadataBytes < 65536);
    const expectedEncodedBytes = new TextEncoder().encode(
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: 'synthetic-refresh-' + '+'.repeat(21846),
        client_id: OAUTH_CUSTODY + '/oauth.json',
      }).toString(),
    ).length;
    let observedSizes: number[] = [];
    for (const method of ['upload', 'get', 'list', 'latest', 'apply']) {
      fixture.invalidTokenOnce = true;
      const beforeResource = fixture.paths.length;
      if (method === 'upload') await page.evaluate(() => (globalThis as any).writerProbe.startByteObservation());
      const refusal = await page.evaluate(
        ({ method, commit }) => (globalThis as any).writerProbe.failure(method, commit),
        { method, commit: fixture.commit },
      );
      if (method === 'upload')
        observedSizes = await page.evaluate(() => (globalThis as any).writerProbe.stopByteObservation());
      assert.deepEqual(refusal, { code: 'input', kind: 'invalid_input', status: null, message: recoveryMessage });
      assert.equal(fixture.count('/token'), beforeCredential);
      assert.equal(fixture.paths.length, beforeResource + 1);
      assert.equal((await page.evaluate(() => (globalThis as any).writerProbe.custodyStatus())).phase, 'live');
    }
    assert.ok(
      expectedEncodedBytes > 65536 && observedSizes.includes(expectedEncodedBytes),
      'Actual owned refresh reader counts encoded bytes, not Content-Length',
    );
    await page.reload();
    await initialize();
    assert.equal(await page.evaluate(() => (globalThis as any).writerProbe.restore()), OAUTH_DID);
    fixture.invalidTokenOnce = true;
    assert.equal(
      (await page.evaluate(() => (globalThis as any).writerProbe.failure('upload'))).message,
      recoveryMessage,
    );
    assert.equal((await page.evaluate(() => (globalThis as any).writerProbe.custodyStatus())).phase, 'live');
    fixture.invalidTokenOnce = true;
    assert.equal(await page.evaluate(() => (globalThis as any).writerProbe.ordinary(1)), 401);
    // A new authorization can still receive an oversized encoded credential.
    await page.evaluate(() => (globalThis as any).writerProbe.begin());
    await page.evaluate((params) => (globalThis as any).writerProbe.complete(params), fixture.callback().toString());
    const afterNewAuthorization = fixture.count('/token');
    fixture.invalidTokenOnce = true;
    assert.equal(
      (await page.evaluate(() => (globalThis as any).writerProbe.failure('upload'))).message,
      recoveryMessage,
    );
    assert.equal(fixture.count('/token'), afterNewAuthorization);
    assert.equal((await page.evaluate(() => (globalThis as any).writerProbe.custodyStatus())).phase, 'live');
    fixture.refreshPadding = 0;
    await page.evaluate(() => (globalThis as any).writerProbe.begin());
    await page.evaluate((params) => (globalThis as any).writerProbe.complete(params), fixture.callback().toString());
    assert.equal((await page.evaluate(() => (globalThis as any).writerProbe.latest())).cid, fixture.commit);
    assert.equal((await page.evaluate(() => (globalThis as any).writerProbe.custodyStatus())).phase, 'live');
    // A genuinely dispatched bounded token failure still retires under CF-1.
    fixture.invalidTokenOnce = true;
    fixture.refuse = '/token';
    const beforeDispatched = fixture.count('/token');
    const dispatched = await page.evaluate(() => (globalThis as any).writerProbe.failure('upload'));
    assert.equal(dispatched.code, 'RequestFailed');
    assert.equal(dispatched.status, 401);
    assert.ok(fixture.count('/token') > beforeDispatched);
    assert.equal((await page.evaluate(() => (globalThis as any).writerProbe.custodyStatus())).phase, null);
    console.log(
      JSON.stringify({
        browser: browser.version(),
        entry,
        compiledProduction: !entry.endsWith('.ts'),
        maintainedClient: true,
        syntheticASAndResource: true,
        publicProviderExecuted: false,
        bundledBytes: built.outputFiles.reduce((size, file) => size + file.contents.length, 0),
        bundleHashes,
        resources: fixture.paths.length,
        uploadOwnership: { cases: uploadOwnershipCases, sharedStorageAvailable, crossRealmSupported: false },
        credentialRecovery: {
          message: recoveryMessage,
          storedMetadataBytes: stored.metadataBytes,
          actualCountedEncodedRefreshBytes: expectedEncodedBytes,
          maintainedMethods: 5,
          reloadLive: true,
          boundedReauthorization: true,
          actualDispatchedFailureRetired: true,
        },
      }),
    );
  } finally {
    await context.close();
    await browser.close();
  }
});
