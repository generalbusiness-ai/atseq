import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium, type Page } from '@playwright/test';
import { relative, resolve } from 'node:path';
import { OAuthFixture, OAUTH_CUSTODY, OAUTH_DID, OAUTH_SCOPE } from './support/oauth-fixture.ts';

async function environment() {
  const output = resolve('.atseq-local/oauth-custody');
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
            name: 'compiled-custody-probe',
            setup(builder) {
              builder.onLoad({ filter: /oauth-browser-probe\.ts$/ }, async (args) => {
                const { readFile } = await import('node:fs/promises');
                return {
                  contents: (await readFile(args.path, 'utf8'))
                    .replaceAll('../../src/browser/', '../../dist/src/browser/')
                    .replaceAll('oauth-loader.ts', 'oauth-loader.js')
                    .replaceAll('oauth-adapter.ts', 'oauth-adapter.js')
                    .replaceAll('oauth-custody.ts', 'oauth-custody.js')
                    .replaceAll('../../src/protocol/oauth.ts', '../../dist/src/protocol/oauth.js'),
                  loader: 'ts',
                };
              });
            },
          },
        ]
      : [],
  });
  const files = new Map(built.outputFiles.map((file) => ['/' + relative(output, file.path), file.contents]));
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const fixture = new OAuthFixture();
  const pages: Page[] = [];
  let hold: ((url: URL) => Promise<void>) | undefined;
  let afterResponse: ((url: URL) => Promise<void>) | undefined;
  let httpStatus: ((url: URL) => number | undefined) | undefined;
  let abortBefore: ((url: URL) => boolean) | undefined;
  let abortAfter: ((url: URL) => boolean) | undefined;
  await context.route('https://**/*', async (route) => {
    const req = route.request(),
      url = new URL(req.url());
    if (url.origin === OAUTH_CUSTODY) {
      const file = files.get(url.pathname);
      await route.fulfill({
        status: 200,
        contentType: file ? 'text/javascript' : 'text/html',
        body: file ? Buffer.from(file) : '<!doctype html><title>Isolated owned custody</title>',
      });
      return;
    }
    if (req.method() === 'OPTIONS') {
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
    if (abortBefore?.(url)) {
      await route.abort('connectionreset');
      return;
    }
    await hold?.(url);
    let response = await fixture.fetch(
      new Request(req.url(), {
        method: req.method(),
        headers: req.headers(),
        body: req.postDataBuffer() ? new Uint8Array(req.postDataBuffer()!) : null,
        credentials: 'omit',
        redirect: 'error',
        cache: 'no-store',
      }),
    );
    const status = httpStatus?.(url);
    if (status !== undefined) {
      await response.body?.cancel();
      response = new Response(
        url.hostname === 'identity.atseq-probe.net'
          ? 'Synthetic identity service unavailable'
          : JSON.stringify({ syntheticHttpOutage: status }),
        {
          status,
          headers: {
            'content-type': url.hostname === 'identity.atseq-probe.net' ? 'text/plain' : 'application/json',
          },
        },
      );
    }
    await afterResponse?.(url);
    if (abortAfter?.(url)) {
      await route.abort('connectionreset');
      return;
    }
    await route
      .fulfill({
        status: response.status,
        body: Buffer.from(await response.arrayBuffer()),
        headers: {
          ...Object.fromEntries(response.headers),
          'access-control-allow-origin': OAUTH_CUSTODY,
          'access-control-expose-headers': 'DPoP-Nonce, WWW-Authenticate',
        },
      })
      .catch(() => {});
  });
  async function page() {
    const p = await context.newPage();
    pages.push(p);
    await p.goto(OAUTH_CUSTODY);
    await p.evaluate(async () => {
      const path = '/oauth-browser-probe.js';
      (globalThis as any).probe = await import(path);
      await (globalThis as any).probe.create();
    });
    return p;
  }
  const begin = (p: Page, did = OAUTH_DID) => p.evaluate((did) => (globalThis as any).probe.begin(did), did);
  const complete = async (p: Page, did = OAUTH_DID) => {
    fixture.tokenDid = did;
    return p.evaluate((params) => (globalThis as any).probe.complete(params), fixture.callback().toString());
  };
  const enroll = async (p: Page, did = OAUTH_DID) => {
    await begin(p, did);
    await complete(p, did);
  };
  const rows = (p: Page) => p.evaluate(() => (globalThis as any).probe.custodyRows());
  const manage = (p: Page, action: string, value?: any) =>
    p.evaluate(({ action, value }) => (globalThis as any).probe.manage(action, value), { action, value });
  return {
    browser,
    context,
    fixture,
    page,
    begin,
    complete,
    enroll,
    rows,
    manage,
    setHttpStatus: (fn: typeof httpStatus) => {
      httpStatus = fn;
    },
    setAbortBefore: (fn: typeof abortBefore) => {
      abortBefore = fn;
    },
    setAbortAfter: (fn: typeof abortAfter) => {
      abortAfter = fn;
    },
    setAfterResponse: (fn: typeof afterResponse) => {
      afterResponse = fn;
    },
    setHold: (fn: typeof hold) => {
      hold = fn;
    },
    close: async () => {
      await context.close();
      await browser.close();
    },
  };
}
const did = (n: number) => 'did:plc:' + String.fromCharCode(97 + n).repeat(24);

test('owned custody atomic counts, one pending per DID, expiry, and fixed consent lifetime', async () => {
  const e = await environment();
  try {
    const p = await e.page();
    await e.begin(p);
    await assert.rejects(() => e.begin(p));
    assert.equal((await e.rows(p)).pending.length, 1);
    for (let n = 1; n < 10; n++) await e.begin(p, did(n));
    await assert.rejects(() => e.begin(p, did(10)));
    let rows = await e.rows(p);
    assert.equal(rows.pending.length, 10);
    assert.equal(rows.accounts.length, 10);
    for (const row of rows.pending)
      await e.manage(p, 'patch', { store: 'pending', id: row.id, patch: { expiresAt: Date.now() - 1 } });
    await e.manage(p, 'cleanup');
    rows = await e.rows(p);
    assert.equal(rows.pending.length, 0);
    assert.equal(rows.accounts.length, 0);
    for (let n = 0; n < 10; n++) await e.enroll(p, did(n));
    await assert.rejects(() => e.begin(p, did(10)));
    rows = await e.rows(p);
    assert.equal(rows.accounts.length, 10);
    const initial = rows.accounts.find((row: any) => row.did === did(9)).expiresAt;
    await p.evaluate(() => (globalThis as any).probe.info(true));
    assert.equal((await e.rows(p)).accounts.find((row: any) => row.did === did(9)).expiresAt, initial);
    await e.manage(p, 'patch', { store: 'accounts', id: did(9), patch: { expiresAt: Date.now() - 1 } });
    const tokenBefore = e.fixture.count('/token');
    await assert.rejects(() => p.evaluate(() => (globalThis as any).probe.info(true)));
    assert.equal(e.fixture.count('/token'), tokenBefore);
    assert.equal((await e.rows(p)).accounts.length, 9);
    console.log(
      JSON.stringify({
        custodyCase: 'counts-consent-expiry',
        pendingCap: 10,
        accountCap: 10,
        onePendingPerDid: true,
        refreshDoesNotExtendConsent: true,
        expiredNeverRefreshes: true,
      }),
    );
  } finally {
    await e.close();
  }
});

test('actual IDB session abort propagates and selected SDK revokes new refresh token', async () => {
  const e = await environment();
  try {
    const p = await e.page();
    await e.begin(p);
    await e.manage(p, 'fault', { store: 'accounts', phase: 'uncertain', credential: true });
    await assert.rejects(() => e.complete(p));
    assert.equal(await e.manage(p, 'clearFault'), true);
    assert.ok(e.fixture.count('/revoke') >= 1);
    assert.equal((await e.rows(p)).accounts.length, 0);
    await e.enroll(p);
    await e.manage(p, 'fault', { store: 'accounts', phase: 'uncertain', credential: true, after: 1 });
    const before = e.fixture.count('/revoke');
    await assert.rejects(() => p.evaluate(() => (globalThis as any).probe.info(true)));
    assert.equal(await e.manage(p, 'clearFault'), true);
    assert.ok(e.fixture.count('/revoke') > before);
    assert.equal((await e.rows(p)).accounts.length, 0);
    console.log(
      JSON.stringify({
        custodyCase: 'actual-write-abort',
        callbackAndRefreshRejected: true,
        selectedSdkRevocation: true,
        localPurge: true,
      }),
    );
  } finally {
    await e.close();
  }
});

test('crash during a logical read retains uncertainty, reopens with one revocation and no refresh retry', async () => {
  const e = await environment();
  let release = () => {};
  try {
    const p = await e.page();
    await e.enroll(p);
    const observer = await e.page();
    const barrier = new Promise<void>((resolve) => {
      release = resolve;
    });
    let reachedResolve = () => {};
    const reached = new Promise<void>((resolve) => {
      reachedResolve = resolve;
    });
    e.setHold(async (url) => {
      if (url.hostname === 'identity.atseq-probe.net') {
        reachedResolve();
        await barrier;
      }
    });
    const call = p.evaluate(() => (globalThis as any).probe.info()).catch(() => {});
    await reached;
    assert.equal((await e.rows(observer)).accounts[0].phase, 'uncertain');
    await p.close();
    release();
    await call;
    e.setHold(undefined);
    const before = e.fixture.count('/token'),
      beforeRevoke = e.fixture.count('/revoke');
    await assert.rejects(() => observer.evaluate(() => (globalThis as any).probe.restore()));
    assert.equal(e.fixture.count('/token'), before);
    assert.equal(e.fixture.count('/revoke'), beforeRevoke + 1);
    assert.equal((await e.rows(observer)).accounts.length, 0);
    console.log(
      JSON.stringify({
        custodyCase: 'read-crash',
        realDocumentClosed: true,
        uncertainNotRestored: true,
        noRefreshRetry: true,
        oneBestEffortRevoke: true,
      }),
    );
  } finally {
    release();
    await e.close();
  }
});

test('committed callback is not live before fresh authority checks; closing document retires it', async () => {
  const e = await environment();
  let release = () => {};
  try {
    const p = await e.page(),
      observer = await e.page();
    await e.begin(p);
    const barrier = new Promise<void>((resolve) => {
      release = resolve;
    });
    let resolveReached = () => {};
    const reached = new Promise<void>((resolve) => {
      resolveReached = resolve;
    });
    let afterTokenIdentity = 0;
    e.setHold(async (url) => {
      if (url.hostname === 'identity.atseq-probe.net' && e.fixture.count('/token') > 0 && ++afterTokenIdentity === 2) {
        resolveReached();
        await barrier;
      }
    });
    const call = e.complete(p).catch(() => {});
    await reached;
    const row = (await e.rows(observer)).accounts[0];
    assert.equal(row.phase, 'uncertain');
    assert.equal(row.hasCredential, true);
    await p.close();
    release();
    await call;
    e.setHold(undefined);
    const before = e.fixture.count('/token');
    await assert.rejects(() => observer.evaluate(() => (globalThis as any).probe.restore()));
    assert.equal(e.fixture.count('/token'), before);
    assert.equal((await e.rows(observer)).accounts.length, 0);
    console.log(
      JSON.stringify({
        custodyCase: 'callback-after-commit-crash',
        actualCommittedCredential: true,
        authorityChecksUnfinished: true,
        noReturnedHandle: true,
        noRefreshRetry: true,
      }),
    );
  } finally {
    release();
    await e.close();
  }
});

test('two documents serialize custody and distinct SDK locks without a process local fallback', async () => {
  const e = await environment();
  try {
    const p = await e.page(),
      other = await e.page();
    await e.enroll(p);
    await p.evaluate(async () => {
      (globalThis as any).releaseLock = undefined;
      (globalThis as any).held = navigator.locks.request(
        'atseq.oauth.custody:' + location.origin,
        () =>
          new Promise<void>((resolve) => {
            (globalThis as any).releaseLock = resolve;
          }),
      );
    });
    await p.waitForFunction(() => (globalThis as any).releaseLock);
    let done = false;
    const blocked = other
      .evaluate(() => (globalThis as any).probe.restore())
      .then(() => {
        done = true;
      });
    await other.waitForTimeout(100);
    assert.equal(done, false);
    await p.evaluate(() => (globalThis as any).releaseLock());
    await blocked;
    const keyProperties = await other.evaluate(() => (globalThis as any).probe.storedKeyProperties());
    assert.equal(keyProperties[0].privateExtractable, false);
    console.log(
      JSON.stringify({
        custodyCase: 'cross-document-lock-key',
        actualWebLocks: true,
        reloadedNonextractablePrivateKey: true,
        distinctLockPrefixes: true,
      }),
    );
  } finally {
    await e.close();
  }
});

test('browser quota refusal aborts real owned writes without exceeding physical slot counts', async () => {
  const e = await environment();
  try {
    const p = await e.page();
    const devtools = await e.context.newCDPSession(p);
    await devtools.send('Storage.overrideQuotaForOrigin', { origin: OAUTH_CUSTODY, quotaSize: 1 });
    await assert.rejects(() => e.begin(p));
    const rows = await e.rows(p);
    assert.equal(rows.pending.length, 0);
    assert.equal(rows.accounts.length, 0);
    await devtools.send('Storage.overrideQuotaForOrigin', { origin: OAUTH_CUSTODY });
    await e.enroll(p);
    console.log(
      JSON.stringify({
        custodyCase: 'actual-browser-quota',
        chromiumQuotaOverride: 1,
        writeRejected: true,
        physicalCountsPreserved: true,
        recoveredAfterQuotaRestored: true,
      }),
    );
  } finally {
    await e.close();
  }
});

test('failed local purge remains counted and unusable until storage repair or trusted explicit reset', async () => {
  const e = await environment();
  try {
    const p = await e.page();
    await e.enroll(p);
    await e.manage(p, 'fault', { store: 'accounts', action: 'delete', always: true });
    await assert.rejects(() => p.evaluate(() => (globalThis as any).probe.revoke()));
    let rows = await e.rows(p);
    assert.equal(rows.accounts.length, 1);
    assert.equal(rows.accounts[0].phase, 'uncertain');
    const before = e.fixture.count('/token');
    await assert.rejects(() => p.evaluate(() => (globalThis as any).probe.restore()));
    rows = await e.rows(p);
    assert.equal(rows.accounts.length, 1);
    assert.equal(rows.accounts[0].phase, 'retiring');
    assert.equal(e.fixture.count('/token'), before);
    assert.equal(await e.manage(p, 'clearFault'), true);
    await e.manage(p, 'cleanup');
    assert.equal((await e.rows(p)).accounts.length, 0);
    await e.enroll(p);
    await e.manage(p, 'reset');
    await p.evaluate(() => (globalThis as any).probe.create());
    assert.equal((await e.rows(p)).accounts.length, 0);
    await e.enroll(p);
    console.log(
      JSON.stringify({
        custodyCase: 'purge-failure-reset',
        actualDeleteTransactionAborts: true,
        countedWhileUnusable: true,
        noRefreshRetry: true,
        repairAndTrustedResetReenrollment: true,
      }),
    );
  } finally {
    await e.close();
  }
});

test('remote revocation refusal cannot prevent local purge', async () => {
  const e = await environment();
  try {
    const p = await e.page();
    await e.enroll(p);
    e.fixture.refuse = '/revoke';
    const beforeRevoke = e.fixture.count('/revoke');
    await p.evaluate(() => (globalThis as any).probe.revoke());
    assert.equal(e.fixture.count('/revoke'), beforeRevoke + 1);
    assert.equal((await e.rows(p)).accounts.length, 0);
    e.fixture.refuse = '';
    await e.enroll(p);
    console.log(
      JSON.stringify({
        custodyCase: 'remote-refusal',
        localDeletionIndependent: true,
        noDurableRemoteRetryQueue: true,
      }),
    );
  } finally {
    await e.close();
  }
});

test('legacy private SDK origin is refused until trusted reset; no private database migration', async () => {
  const e = await environment();
  try {
    const p = await e.page();
    await p.evaluate(async () => {
      const r = indexedDB.open('@atproto-oauth-client', 1);
      await new Promise<void>((resolve, reject) => {
        r.onsuccess = () => {
          r.result.close();
          resolve();
        };
        r.onerror = () => reject(r.error);
      });
    });
    await assert.rejects(() => p.evaluate(() => (globalThis as any).probe.create()), /explicit origin reset/);
    await e.manage(p, 'reset');
    await p.evaluate(() => (globalThis as any).probe.create());
    await e.enroll(p);
    console.log(
      JSON.stringify({
        custodyCase: 'legacy-origin-reset',
        legacyRefused: true,
        explicitDeletionWithoutDecoding: true,
        freshEnrollment: true,
      }),
    );
  } finally {
    await e.close();
  }
});

test('64 KiB logical UTF-8 metadata ceiling includes the account journal while opaque keypair is excluded', async () => {
  const e = await environment();
  try {
    const p = await e.page();
    await e.enroll(p);
    const original = (await e.rows(p)).accounts[0].metadataBytes;
    // An uncertain operation adds its UUID property; phase changes live to uncertain.
    // These measured public-fixture lengths choose the largest complete row accepted
    // at the journal write, rather than just the inner SDK session size.
    const uncertainOverhead =
      'uncertain'.length -
      'live'.length +
      JSON.stringify({ operation: '00000000-0000-0000-0000-000000000000' }).length -
      2 +
      1;
    await p.evaluate(() => (globalThis as any).probe.revoke());
    e.fixture.tokenPadding = 64 * 1024 - original - uncertainOverhead;
    await e.enroll(p);
    const accepted = (await e.rows(p)).accounts[0];
    assert.equal(accepted.metadataBytes + uncertainOverhead, 64 * 1024);
    await p.evaluate(() => (globalThis as any).probe.revoke());
    e.fixture.tokenPadding++;
    await e.begin(p);
    await assert.rejects(() => e.complete(p));
    assert.equal((await e.rows(p)).accounts.length, 0);
    console.log(
      JSON.stringify({
        custodyCase: 'exact-metadata-ceiling',
        utf8Bytes: 65536,
        oneByteOverRejected: true,
        opaquePairExcluded: true,
        journalIncluded: true,
      }),
    );
  } finally {
    await e.close();
  }
});

test('refresh response issued before local commit leaves the old credential uncertain and never retries it on reopen', async () => {
  const e = await environment();
  let release = () => {};
  try {
    const p = await e.page(),
      observer = await e.page();
    await e.enroll(p);
    const barrier = new Promise<void>((resolve) => {
      release = resolve;
    });
    let resolveReached = () => {};
    const reached = new Promise<void>((resolve) => {
      resolveReached = resolve;
    });
    e.setAfterResponse(async (url) => {
      if (url.pathname === '/token') {
        resolveReached();
        await barrier;
      }
    });
    const before = e.fixture.count('/token');
    const call = p.evaluate(() => (globalThis as any).probe.info(true)).catch(() => {});
    await reached;
    assert.equal(e.fixture.count('/token'), before + 1);
    const row = (await e.rows(observer)).accounts[0];
    assert.equal(row.phase, 'uncertain');
    assert.equal(row.hasCredential, true);
    const locks = await observer.evaluate(() => navigator.locks.query());
    assert.ok(locks.held?.some((lock) => lock.name?.startsWith('atseq.oauth.sdk:')));
    assert.ok(locks.held?.some((lock) => lock.name?.startsWith('atseq.oauth.custody:')));
    await p.close();
    release();
    await call;
    e.setAfterResponse(undefined);
    await assert.rejects(() => observer.evaluate(() => (globalThis as any).probe.restore()));
    assert.equal(e.fixture.count('/token'), before + 1);
    assert.equal((await e.rows(observer)).accounts.length, 0);
    console.log(
      JSON.stringify({
        custodyCase: 'refresh-issued-before-commit-crash',
        realTokenResponsePrepared: true,
        oldCredentialUncertain: true,
        noOneUseRefreshRetry: true,
        actualDistinctSdkAndCustodyLocks: true,
      }),
    );
  } finally {
    release();
    await e.close();
  }
});

test('final live-marker transaction abort returns no handle and retains committed uncertain credential for cleanup', async () => {
  const e = await environment();
  try {
    const p = await e.page(),
      observer = await e.page();
    await e.begin(p);
    await e.manage(p, 'fault', { store: 'accounts', phase: 'live' });
    await assert.rejects(() => e.complete(p));
    assert.equal(await e.manage(p, 'clearFault'), true);
    const row = (await e.rows(p)).accounts[0];
    assert.equal(row.phase, 'uncertain');
    assert.equal(row.hasCredential, true);
    const before = e.fixture.count('/token');
    await assert.rejects(() => observer.evaluate(() => (globalThis as any).probe.restore()));
    assert.equal(e.fixture.count('/token'), before);
    assert.equal((await e.rows(observer)).accounts.length, 0);
    console.log(
      JSON.stringify({
        custodyCase: 'final-live-commit-abort',
        actualFinalTransactionAborted: true,
        noAcceptedHandle: true,
        committedCredentialRetiredOnReopen: true,
      }),
    );
  } finally {
    await e.close();
  }
});

test('journal write must commit before any credential read, refresh or resource request', async () => {
  const e = await environment();
  try {
    const p = await e.page();
    await e.enroll(p);
    await e.manage(p, 'fault', { store: 'accounts', phase: 'uncertain', credential: true });
    const before = e.fixture.calls.length;
    await assert.rejects(() => p.evaluate(() => (globalThis as any).probe.resource()));
    assert.equal(await e.manage(p, 'clearFault'), true);
    assert.equal(e.fixture.calls.length, before);
    const row = (await e.rows(p)).accounts[0];
    assert.equal(row.phase, 'live');
    await p.evaluate(() => (globalThis as any).probe.resource());
    console.log(
      JSON.stringify({
        custodyCase: 'journal-first',
        actualMarkerAbort: true,
        noCredentialDispatchBeforeCommit: true,
        untouchedLiveConsentPreserved: true,
      }),
    );
  } finally {
    await e.close();
  }
});

test('subject mismatch cannot allocate another account and resource 401 refresh retains the journal and checks exact scopes', async () => {
  const e = await environment();
  try {
    const p = await e.page();
    await e.begin(p);
    e.fixture.tokenDid = did(1);
    await assert.rejects(() => e.complete(p, did(1)));
    assert.equal((await e.rows(p)).accounts.length, 0);
    e.fixture.tokenDid = OAUTH_DID;
    await e.enroll(p);
    const initial = (await e.rows(p)).accounts[0].expiresAt;
    e.fixture.invalidTokenOnce = true;
    await p.evaluate(() => (globalThis as any).probe.resource());
    assert.equal((await e.rows(p)).accounts[0].expiresAt, initial);
    e.fixture.invalidTokenOnce = true;
    e.fixture.tokenScope = OAUTH_SCOPE + ' repo:extra';
    const before = e.fixture.count('/xrpc/ai.generalbusiness.atseq.synthetic');
    await assert.rejects(() => p.evaluate(() => (globalThis as any).probe.resource()));
    assert.equal(e.fixture.count('/xrpc/ai.generalbusiness.atseq.synthetic'), before + 1);
    assert.equal((await e.rows(p)).accounts.length, 0);
    console.log(
      JSON.stringify({
        custodyCase: 'subject-and-401',
        foreignSubjectNeverAllocated: true,
        implicitRefreshJournalRetained: true,
        consentNotExtended: true,
        changedScopeRefusedBeforeSecondResourceDispatch: true,
      }),
    );
  } finally {
    await e.close();
  }
});

test('plain resource transport reset preserves live consent, deadline and next successful request without refresh or revocation', async () => {
  const e = await environment();
  try {
    const p = await e.page();
    await e.enroll(p);
    const initial = (await e.rows(p)).accounts[0],
      tokens = e.fixture.count('/token'),
      revokes = e.fixture.count('/revoke');
    e.setAbortBefore((url) => url.pathname.startsWith('/xrpc/'));
    await assert.rejects(
      () => p.evaluate(() => (globalThis as any).probe.resource()),
      /OAuth operation is unavailable/,
    );
    const row = (await e.rows(p)).accounts[0];
    assert.equal(row.phase, 'live');
    assert.equal(row.expiresAt, initial.expiresAt);
    assert.equal(e.fixture.count('/token'), tokens);
    assert.equal(e.fixture.count('/revoke'), revokes);
    e.setAbortBefore(undefined);
    assert.deepEqual(await p.evaluate(() => (globalThis as any).probe.resource()), { accepted: true });
    assert.equal(e.fixture.count('/token'), tokens);
    assert.equal(e.fixture.count('/revoke'), revokes);
    console.log(
      JSON.stringify({
        custodyCase: 'plain-reset-keeps-consent',
        originalUnavailableError: true,
        unchangedDeadline: true,
        noRefreshOrRevoke: true,
        nextRequestSucceeded: true,
      }),
    );
  } finally {
    await e.close();
  }
});

test('an authenticated resource form cannot masquerade as a maintained token request', async () => {
  const e = await environment();
  try {
    const p = await e.page();
    await e.enroll(p);
    e.setAbortBefore((url) => url.pathname.startsWith('/xrpc/'));
    const tokens = e.fixture.count('/token'),
      revokes = e.fixture.count('/revoke');
    await assert.rejects(
      () =>
        p.evaluate(() => {
          const form = new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: location.origin + '/oauth.json',
            refresh_token: 'synthetic-arbitrary-resource-field',
          });
          return (globalThis as any).probe.resource({
            method: 'POST',
            headers: { 'Content-Type': 'Application/X-Www-Form-Urlencoded; Charset=UTF-8' },
            body: form.toString(),
          });
        }),
      /OAuth operation is unavailable/,
    );
    assert.equal((await e.rows(p)).accounts[0].phase, 'live');
    assert.equal(e.fixture.count('/token'), tokens);
    assert.equal(e.fixture.count('/revoke'), revokes);
    e.setAbortBefore(undefined);
    await p.evaluate(() => (globalThis as any).probe.resource());
    console.log(
      JSON.stringify({
        custodyCase: 'resource-form-not-token',
        normalizedPostBody: true,
        authorizationProvenanceSeparatesResource: true,
        consentPreserved: true,
      }),
    );
  } finally {
    await e.close();
  }
});

test('lost 401 refresh response retires uncertainty even when the maintained resource helper returns its initial 401', async () => {
  const e = await environment();
  try {
    const p = await e.page();
    await e.enroll(p);
    e.fixture.invalidTokenOnce = true;
    e.setAbortAfter((url) => url.pathname === '/token');
    const tokens = e.fixture.count('/token');
    assert.deepEqual(await p.evaluate(() => (globalThis as any).probe.resource()), { error: 'invalid_token' });
    assert.equal(e.fixture.count('/token'), tokens + 1);
    assert.equal((await e.rows(p)).accounts.length, 0);
    e.setAbortAfter(undefined);
    await assert.rejects(() => p.evaluate(() => (globalThis as any).probe.resource()));
    assert.equal(e.fixture.count('/token'), tokens + 1);
    console.log(
      JSON.stringify({
        custodyCase: 'lost-401-refresh-response',
        actualPreparedTokenResponseLost: true,
        sdkInitial401Preserved: true,
        uncertainRetired: true,
        noOneUseRetry: true,
      }),
    );
  } finally {
    await e.close();
  }
});

test('token dispatch marker accepts maintained normalized form with extra fields and mixed-case media type with charset', async () => {
  const e = await environment();
  try {
    const p = await e.page();
    await p.evaluate(() => (globalThis as any).probe.tokenVariant());
    await e.enroll(p);
    e.fixture.invalidTokenOnce = true;
    e.setAbortAfter((url) => url.pathname === '/token');
    const tokens = e.fixture.count('/token');
    await p.evaluate(() => (globalThis as any).probe.resource());
    assert.equal(e.fixture.count('/token'), tokens + 1);
    assert.equal((await e.rows(p)).accounts.length, 0);
    console.log(
      JSON.stringify({
        custodyCase: 'token-dispatch-normalized-form',
        publicSdkFetchDecoratorOnly: true,
        optionalFieldsAccepted: true,
        mixedCaseCharsetAccepted: true,
        lostResponseRetired: true,
      }),
    );
  } finally {
    await e.close();
  }
});

test('safe failure finalization must commit; aborted live marker leaves uncertainty and preserves original transient error', async () => {
  const e = await environment();
  try {
    const p = await e.page(),
      observer = await e.page();
    await e.enroll(p);
    e.setAbortBefore((url) => url.pathname.startsWith('/xrpc/'));
    await e.manage(p, 'fault', { store: 'accounts', phase: 'live' });
    await assert.rejects(
      () => p.evaluate(() => (globalThis as any).probe.resource()),
      /OAuth operation is unavailable/,
    );
    assert.equal(await e.manage(p, 'clearFault'), true);
    assert.equal((await e.rows(p)).accounts[0].phase, 'uncertain');
    e.setAbortBefore(undefined);
    const tokens = e.fixture.count('/token');
    await assert.rejects(() => observer.evaluate(() => (globalThis as any).probe.restore()));
    assert.equal(e.fixture.count('/token'), tokens);
    assert.equal((await e.rows(observer)).accounts.length, 0);
    console.log(
      JSON.stringify({
        custodyCase: 'safe-finalization-abort',
        actualTransactionAbort: true,
        originalTransientErrorPreserved: true,
        uncertainNotUsable: true,
        noRefreshRetry: true,
      }),
    );
  } finally {
    await e.close();
  }
});

test('plain caller abort without token dispatch preserves existing consent and original unavailable class', async () => {
  const e = await environment();
  try {
    const p = await e.page();
    await e.enroll(p);
    const tokens = e.fixture.count('/token'),
      revokes = e.fixture.count('/revoke');
    await assert.rejects(
      () =>
        p.evaluate(() => {
          const controller = new AbortController();
          controller.abort();
          return (globalThis as any).probe.resource({ signal: controller.signal });
        }),
      /OAuth operation is unavailable/,
    );
    assert.equal((await e.rows(p)).accounts[0].phase, 'live');
    assert.equal(e.fixture.count('/token'), tokens);
    assert.equal(e.fixture.count('/revoke'), revokes);
    await p.evaluate(() => (globalThis as any).probe.resource());
    console.log(
      JSON.stringify({
        custodyCase: 'plain-caller-abort',
        existingConsentLive: true,
        noTokenOrRevoke: true,
        originalUnavailableClass: true,
      }),
    );
  } finally {
    await e.close();
  }
});

test('token handoff is marked before transport can synchronously reject, retaining conservative no-retry semantics', async () => {
  const e = await environment();
  try {
    const p = await e.page();
    await p.evaluate(() => (globalThis as any).probe.tokenVariant());
    await e.enroll(p);
    await p.evaluate(() => (globalThis as any).probe.setTokenTransportFailure(true));
    e.fixture.invalidTokenOnce = true;
    const tokens = e.fixture.count('/token');
    await p.evaluate(() => (globalThis as any).probe.resource());
    assert.equal((await e.rows(p)).accounts.length, 0);
    assert.equal(e.fixture.count('/token'), tokens);
    await p.evaluate(() => (globalThis as any).probe.setTokenTransportFailure(false));
    await assert.rejects(() => p.evaluate(() => (globalThis as any).probe.resource()));
    assert.equal(e.fixture.count('/token'), tokens);
    console.log(
      JSON.stringify({
        custodyCase: 'token-handoff-sync-rejection',
        markedBeforeTransport: true,
        noServerTokenResponseRequiredForConservativeRetirement: true,
        noAutomaticRetry: true,
      }),
    );
  } finally {
    await e.close();
  }
});

for (const stage of ['identity', 'discovery']) {
  for (const operation of ['resource', 'info', 'restore']) {
    test(`fresh verification ${stage} reset preserves unchanged ${operation} consent and permits next request`, async () => {
      const e = await environment();
      try {
        const p = await e.page();
        await e.enroll(p);
        const initial = (await e.rows(p)).accounts[0],
          tokens = e.fixture.count('/token'),
          revokes = e.fixture.count('/revoke'),
          resources = e.fixture.count('/xrpc/ai.generalbusiness.atseq.synthetic');
        e.setAbortBefore((url) =>
          stage === 'identity'
            ? url.hostname === 'identity.atseq-probe.net'
            : url.pathname.startsWith('/.well-known/oauth-authorization-server'),
        );
        await assert.rejects(
          () => p.evaluate((operation) => (globalThis as any).probe[operation](), operation),
          /OAuth operation is unavailable/,
        );
        const rows = await e.rows(p);
        const deltas = {
          token: e.fixture.count('/token') - tokens,
          revoke: e.fixture.count('/revoke') - revokes,
          resource: e.fixture.count('/xrpc/ai.generalbusiness.atseq.synthetic') - resources,
        };
        e.setAbortBefore(undefined);
        const nextSucceeded = await p
          .evaluate(() => (globalThis as any).probe.resource())
          .then(
            () => true,
            () => false,
          );
        console.log(
          JSON.stringify({
            custodyCase: 'fresh-verification-reset',
            stage,
            operation,
            nextSucceeded,
            deltasBeforeRetry: deltas,
            accountPhases: rows.accounts.map((row: any) => row.phase),
          }),
        );
        assert.deepEqual(deltas, { token: 0, revoke: 0, resource: 0 });
        assert.equal(rows.accounts[0]?.phase, 'live');
        assert.equal(rows.accounts[0].expiresAt, initial.expiresAt);
        assert.equal(nextSucceeded, true);
      } finally {
        await e.close();
      }
    });
  }
}

for (const mismatch of ['issuer', 'scope']) {
  test(`definitive fresh ${mismatch} mismatch retires unchanged credentials before resource dispatch`, async () => {
    const e = await environment();
    try {
      const p = await e.page();
      await e.enroll(p);
      if (mismatch === 'issuer') e.fixture.issuer = 'https://changed-auth.atseq-probe.net';
      else
        await p.evaluate(async () => {
          const opening = indexedDB.open('atseq.oauth.custody.v1');
          const db = await new Promise<IDBDatabase>((resolve, reject) => {
            opening.onsuccess = () => resolve(opening.result);
            opening.onerror = () => reject(opening.error);
          });
          try {
            const tx = db.transaction('accounts', 'readwrite');
            const done = new Promise<void>((resolve, reject) => {
              tx.oncomplete = () => resolve();
              tx.onabort = () => reject(tx.error);
            });
            const store = tx.objectStore('accounts'),
              request = store.getAll();
            request.onsuccess = () => {
              const row = request.result[0];
              row.value.tokenSet.scope += ' repo:extra';
              store.put(row);
            };
            await done;
          } finally {
            db.close();
          }
        });
      const tokens = e.fixture.count('/token'),
        revokes = e.fixture.count('/revoke'),
        resources = e.fixture.count('/xrpc/ai.generalbusiness.atseq.synthetic');
      const observer = await e.page();
      await assert.rejects(
        () => observer.evaluate(() => (globalThis as any).probe.restore()),
        /OAuth operation failed/,
      );
      const rows = await e.rows(observer);
      assert.equal(e.fixture.count('/token'), tokens);
      assert.equal(e.fixture.count('/xrpc/ai.generalbusiness.atseq.synthetic'), resources);
      assert.equal(rows.accounts.length, 0);
      const revokeDelta = e.fixture.count('/revoke') - revokes;
      assert.ok(revokeDelta <= 1);
      if (mismatch === 'scope') assert.equal(revokeDelta, 1);
      console.log(
        JSON.stringify({
          custodyCase: 'definitive-verification-mismatch',
          mismatch,
          retired: true,
          tokenDelta: 0,
          resourceDelta: 0,
          revokeDelta,
        }),
      );
    } finally {
      await e.close();
    }
  });
}

// These comparisons stay inside the isolated browser. No credential or private
// key bytes leave it; the only key export is the already public DPoP JWK.
async function unchangedAccount(p: Page, remember = false): Promise<boolean> {
  return p.evaluate(async (remember) => {
    const request = indexedDB.open('atseq.oauth.custody.v1');
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    let rows: any[];
    try {
      const tx = db.transaction('accounts', 'readonly');
      const done = new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onabort = () => reject(tx.error);
      });
      const reading = tx.objectStore('accounts').getAll();
      rows = await new Promise<any[]>((resolve, reject) => {
        reading.onsuccess = () => resolve(reading.result);
        reading.onerror = () => reject(reading.error);
      });
      await done;
    } finally {
      db.close();
    }
    if (rows.length !== 1) return false;
    const row = rows[0],
      pair = row.value.dpopKey.keyPair;
    const comparable = JSON.stringify({
      metadata: JSON.stringify(row, (name, value) => (name === 'keyPair' ? undefined : value)),
      publicKey: await crypto.subtle.exportKey('jwk', pair.publicKey),
      privateExtractable: pair.privateKey.extractable,
      privateType: pair.privateKey.type,
    });
    if (remember) {
      (globalThis as any).__cf1aAccount = comparable;
      return true;
    }
    return comparable === (globalThis as any).__cf1aAccount;
  }, remember);
}

for (const stage of ['identity', 'discovery', 'protected-resource']) {
  for (const status of [500, 503, 429]) {
    for (const operation of ['resource', 'restore']) {
      test(`unauthenticated HTTP${status} ${stage} ${operation} outage preserves exact consent and permits healthy retry`, async () => {
        const e = await environment();
        try {
          const p = await e.page();
          await e.enroll(p);
          assert.equal(await unchangedAccount(p, true), true);
          const initial = (await e.rows(p)).accounts[0],
            tokens = e.fixture.count('/token'),
            revokes = e.fixture.count('/revoke'),
            resources = e.fixture.count('/xrpc/ai.generalbusiness.atseq.synthetic');
          e.setHttpStatus((url) =>
            (
              stage === 'identity'
                ? url.hostname === 'identity.atseq-probe.net'
                : stage === 'discovery'
                  ? url.pathname.startsWith('/.well-known/oauth-authorization-server')
                  : url.pathname === '/.well-known/oauth-protected-resource'
            )
              ? status
              : undefined,
          );
          const failure = await p.evaluate(async (operation) => {
            try {
              await (globalThis as any).probe[operation]();
              return { succeeded: true };
            } catch (error: any) {
              return { code: error.code, message: error.message };
            }
          }, operation);
          const rows = await e.rows(p),
            exactAccountUnchanged = await unchangedAccount(p),
            deltas = {
              token: e.fixture.count('/token') - tokens,
              revoke: e.fixture.count('/revoke') - revokes,
              resource: e.fixture.count('/xrpc/ai.generalbusiness.atseq.synthetic') - resources,
            };
          e.setHttpStatus(undefined);
          const nextSucceeded = await p
            .evaluate(() => (globalThis as any).probe.resource())
            .then(
              () => true,
              () => false,
            );
          console.log(
            JSON.stringify({
              custodyCase: 'unauthenticated-http-outage',
              stage,
              status,
              operation,
              failure,
              deltasBeforeRetry: deltas,
              exactAccountUnchanged,
              live: rows.accounts[0]?.phase === 'live',
              deadlineUnchanged: rows.accounts[0]?.expiresAt === initial.expiresAt,
              nextSucceeded,
            }),
          );
          assert.deepEqual(failure, { code: 'content_unavailable', message: 'OAuth operation is unavailable' });
          assert.deepEqual(deltas, { token: 0, revoke: 0, resource: 0 });
          assert.equal(exactAccountUnchanged, true);
          assert.equal(rows.accounts[0]?.phase, 'live');
          assert.equal(rows.accounts[0]?.expiresAt, initial.expiresAt);
          assert.equal(nextSucceeded, true);
        } finally {
          await e.close();
        }
      });
    }
  }
}

for (const status of [500, 503, 429]) {
  test(`authenticated resource HTTP${status} remains a response and leaves exact consent live`, async () => {
    const e = await environment();
    try {
      const p = await e.page();
      await e.enroll(p);
      assert.equal(await unchangedAccount(p, true), true);
      const tokens = e.fixture.count('/token'),
        revokes = e.fixture.count('/revoke');
      e.setHttpStatus((url) => (url.pathname.startsWith('/xrpc/') ? status : undefined));
      assert.deepEqual(await p.evaluate(() => (globalThis as any).probe.resourceStatus()), {
        status,
        body: { syntheticHttpOutage: status },
      });
      assert.equal(await unchangedAccount(p), true);
      assert.equal(e.fixture.count('/token'), tokens);
      assert.equal(e.fixture.count('/revoke'), revokes);
      e.setHttpStatus(undefined);
      await p.evaluate(() => (globalThis as any).probe.resource());
      console.log(
        JSON.stringify({
          custodyCase: 'authenticated-http-response',
          status,
          unchangedResponseStatusAndBody: true,
          exactAccountUnchanged: true,
          tokenDelta: 0,
          revokeDelta: 0,
          nextSucceeded: true,
        }),
      );
    } finally {
      await e.close();
    }
  });
  for (const operation of ['explicit-refresh', 'resource-401-refresh']) {
    test(`dispatched token HTTP${status} ${operation} failure retires credentials without automatic retry`, async () => {
      const e = await environment();
      try {
        const p = await e.page();
        await e.enroll(p);
        const tokens = e.fixture.count('/token');
        e.setHttpStatus((url) => (url.pathname === '/token' ? status : undefined));
        if (operation === 'explicit-refresh')
          await assert.rejects(
            () => p.evaluate(() => (globalThis as any).probe.info(true)),
            /OAuth operation is unavailable/,
          );
        else {
          e.fixture.invalidTokenOnce = true;
          const response = await p.evaluate(() => (globalThis as any).probe.resourceStatus());
          assert.equal(response.status, 401);
        }
        const tokenDelta = e.fixture.count('/token') - tokens;
        assert.equal(tokenDelta, 1);
        assert.equal((await e.rows(p)).accounts.length, 0);
        e.setHttpStatus(undefined);
        await assert.rejects(() => p.evaluate(() => (globalThis as any).probe.resource()));
        assert.equal(e.fixture.count('/token') - tokens, 1);
        console.log(
          JSON.stringify({
            custodyCase: 'token-http-outage',
            status,
            operation,
            tokenDelta,
            retired: true,
            nextRequestRefused: true,
            noAutomaticRefreshRetry: true,
          }),
        );
      } finally {
        await e.close();
      }
    });
  }
}

test('explicit signout HTTP503 still retires locally without token mutation or automatic retry', async () => {
  const e = await environment();
  try {
    const p = await e.page();
    await e.enroll(p);
    const tokens = e.fixture.count('/token'),
      revokes = e.fixture.count('/revoke');
    e.setHttpStatus((url) => (url.pathname === '/revoke' ? 503 : undefined));
    // The maintained server agent suppresses best-effort remote revoke errors;
    // signOut still deletes local credentials in finally.
    await p.evaluate(() => (globalThis as any).probe.revoke());
    assert.equal((await e.rows(p)).accounts.length, 0);
    assert.equal(e.fixture.count('/token'), tokens);
    assert.equal(e.fixture.count('/revoke') - revokes, 1);
    e.setHttpStatus(undefined);
    await assert.rejects(() => p.evaluate(() => (globalThis as any).probe.resource()));
    assert.equal(e.fixture.count('/token'), tokens);
    console.log(
      JSON.stringify({
        custodyCase: 'explicit-signout-http-outage',
        remoteFailureSuppressedBySDK: true,
        status: 503,
        tokenDelta: 0,
        revokeDelta: 1,
        retiredLocally: true,
        nextRequestRefused: true,
      }),
    );
  } finally {
    await e.close();
  }
});
