import { OAuthClient, WebcryptoKey } from '@atproto/oauth-client-browser';
import { OAuthFixture, OAUTH_DID, OAUTH_SCOPE } from './fixture.mjs';

function requireThat(value, label) {
  if (!value) throw new Error(label);
}
async function rejects(work, label) {
  let refused = false;
  try {
    await work();
  } catch {
    refused = true;
  }
  requireThat(refused, label);
}
const runtime = (browser) => ({
  createKey: async (algs) => {
    if (browser) return WebcryptoKey.generate(algs, undefined, { extractable: false });
    // Node selects JOSE's Node KeyObject generator. The browser factory is the
    // proposal; this Node hook probe uses the public WebCrypto reconstruction seam.
    requireThat(algs.includes('ES256'), 'fixture requires ES256');
    const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);
    return WebcryptoKey.fromKeypair(pair, crypto.randomUUID());
  },
  getRandomValues: (length) => crypto.getRandomValues(new Uint8Array(length)),
  digest: async (data, { name }) => new Uint8Array(await crypto.subtle.digest(name.replace('sha', 'SHA-'), data)),
  requestLock: browser
    ? (name, work) => navigator.locks.request(name, { mode: 'exclusive' }, work)
    : async (_name, work) => work(),
});

export function memoryStores() {
  const rows = { state: new Map(), session: new Map() };
  const failures = { state: false, session: false };
  const port = (name) => ({
    get: (key) => rows[name].get(key),
    set: (key, value) => {
      if (failures[name]) throw new Error('synthetic-store-write-refused');
      rows[name].set(key, value);
    },
    del: (key) => {
      rows[name].delete(key);
    },
  });
  return {
    state: port('state'),
    session: port('session'),
    failures,
    count: async (name) => rows[name].size,
    close: async () => {},
  };
}

/** Experiment-owned database only. No convenience-client private database access. */
export async function indexedStores(databaseName) {
  const db = await new Promise((resolve, reject) => {
    const open = indexedDB.open(databaseName, 1);
    open.onupgradeneeded = () => {
      open.result.createObjectStore('state');
      open.result.createObjectStore('session');
    };
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(new Error('experiment-idb-open-failed'));
  });
  const failures = { state: false, session: false };
  const operation = (name, mode, work, injectSetFailure = false) =>
    new Promise((resolve, reject) => {
      const tx = db.transaction(name, mode);
      let value;
      tx.oncomplete = () => resolve(value);
      tx.onabort = () => reject(new Error('synthetic-store-write-refused'));
      tx.onerror = () => {};
      const request = work(tx.objectStore(name));
      if (request)
        request.onsuccess = () => {
          value = request.result;
        };
      if (injectSetFailure && failures[name]) tx.abort();
    });
  const port = (name) => ({
    get: async (key) => {
      const value = await operation(name, 'readonly', (store) => store.get(key));
      if (!value) return undefined;
      const { dpopKey, ...rest } = value;
      return { ...rest, dpopKey: await WebcryptoKey.fromKeypair(dpopKey.keyPair, dpopKey.kid) };
    },
    set: async (key, value) => {
      const { dpopKey, ...rest } = value;
      await operation(
        name,
        'readwrite',
        (store) =>
          store.put(
            {
              ...rest,
              dpopKey: { kid: dpopKey.kid, keyPair: dpopKey.cryptoKeyPair },
            },
            key,
          ),
        true,
      );
    },
    del: (key) => operation(name, 'readwrite', (store) => store.delete(key)),
  });
  return {
    state: port('state'),
    session: port('session'),
    failures,
    count: (name) => operation(name, 'readonly', (store) => store.count()),
    close: async () => {
      db.close();
    },
  };
}

function setup(stores, browser, refuseHook = false) {
  const fixture = new OAuthFixture();
  let client;
  let hookCalls = 0;
  let refreshRevoked = false;
  let accessRevoked = false;
  let newlyIssued;
  const fetch = async (input, init) => {
    const request = new Request(new Request(input, init), {
      redirect: 'error',
      credentials: 'omit',
      cache: 'no-store',
    });
    if (new URL(request.url).pathname === '/revoke') {
      const value = new URLSearchParams(await request.clone().text()).get('token');
      refreshRevoked ||= value === newlyIssued?.refresh_token;
      accessRevoked ||= value === newlyIssued?.access_token;
    }
    const response = await fixture.fetch(request);
    if (new URL(request.url).pathname === '/token' && response.ok) newlyIssued = await response.clone().json();
    return response;
  };
  client = new OAuthClient({
    clientMetadata: fixture.options().metadata,
    responseMode: 'fragment',
    runtimeImplementation: runtime(browser),
    stateStore: stores.state,
    sessionStore: stores.session,
    fetch,
    identityResolver: { resolve: (did) => fixture.resolveIdentity(did, { fetch, signal: AbortSignal.timeout(5_000) }) },
    onSessionUpdated: async (sub, session) => {
      hookCalls++;
      const committed = await stores.session.get(sub);
      const matches =
        committed &&
        committed.dpopKey.kid === session.dpopKey.kid &&
        JSON.stringify(committed.tokenSet) === JSON.stringify(session.tokenSet);
      requireThat(matches, 'successful-hook-must-observe-committed-row');
      if (refuseHook) throw new Error('synthetic-post-commit-hook-failure');
    },
  });
  return { client, fixture, status: () => ({ hookCalls, refreshRevoked, accessRevoked }) };
}

export async function runPublicHookCases(browser = false) {
  const cases = [];
  let index = 0;
  const make = () => (browser ? indexedStores(`atseq-public-hook-probe-${++index}`) : memoryStores());
  for (const name of [
    'state-write-refusal',
    'session-write-refusal',
    'callback-hook-refusal',
    'refresh-write-refusal',
    'refresh-write-refusal-revoke-refused',
    'successful-commit-hook',
  ]) {
    const stores = await make();
    const { client, fixture, status } = setup(stores, browser, name === 'callback-hook-refusal');
    try {
      if (name === 'state-write-refusal') {
        stores.failures.state = true;
        await rejects(() => client.authorize(OAUTH_DID, { scope: OAUTH_SCOPE }), 'state failure must propagate');
        requireThat(fixture.count('/par') === 0, 'state refusal must precede PAR');
      } else {
        await client.authorize(OAUTH_DID, { scope: OAUTH_SCOPE });
        if (name.startsWith('refresh-write')) {
          const { session } = await client.callback(fixture.callback());
          requireThat((await stores.count('session')) === 1, 'initial session must commit');
          stores.failures.session = true;
          if (name === 'refresh-write-refusal-revoke-refused') fixture.refuse = '/revoke';
          await Promise.race([
            rejects(() => session.getTokenInfo(true), 'refresh commit failure must propagate'),
            new Promise((_, reject) => setTimeout(() => reject(new Error('recursive-lock-or-hung-operation')), 2_000)),
          ]);
          requireThat(fixture.count('/revoke') === 1, 'SDK refresh failure must attempt revocation');
          stores.failures.session = false;
          // Store deletion is allowed independently of the injected set failure.
          requireThat((await stores.count('session')) === 0, 'SDK refresh failure must delete local row');
        } else {
          stores.failures.session = name === 'session-write-refusal';
          if (name === 'callback-hook-refusal') {
            await rejects(() => client.callback(fixture.callback()), 'verified callback must fail');
            requireThat(fixture.count('/revoke') === 1, 'callback catches hook failure and revokes');
            requireThat(
              (await stores.count('session')) === 1,
              'post-commit hook failure retains the already committed row',
            );
            await client.revoke(OAUTH_DID);
            requireThat((await stores.count('session')) === 0, 'explicit public revoke removes the row');
          } else if (name === 'session-write-refusal') {
            await rejects(() => client.callback(fixture.callback()), 'session failure must propagate');
            requireThat(
              fixture.count('/revoke') === 2,
              'both SDK storage and callback failure paths attempt revocation',
            );
            requireThat(status().hookCalls === 0, 'failed write must not invoke successful update hook');
            requireThat((await stores.count('session')) === 0, 'failed callback write must leave no row');
          } else {
            const returned = await client.callback(fixture.callback());
            requireThat(!!returned.session, 'successful callback must return a session');
            requireThat(status().hookCalls === 1, 'successful committed row invokes the hook');
            const stored = await stores.session.get(OAUTH_DID);
            requireThat(
              stored.dpopKey.cryptoKeyPair.privateKey.extractable === false,
              'private key remains nonextractable',
            );
            await returned.session.getTokenInfo(false);
          }
        }
      }
      cases.push({
        name,
        passed: true,
        sessionRows: await stores.count('session'),
        revocationRequests: fixture.count('/revoke'),
        ...status(),
      });
    } finally {
      await stores.close();
    }
  }
  return {
    environment: browser ? 'Chromium public core + actual IndexedDB/Web Locks' : 'Node public core + memory stores',
    syntheticOnly: true,
    providerSuccess: false,
    cases,
  };
}

export async function persistentSession(databaseName, create = false) {
  const stores = await indexedStores(databaseName);
  const { client, fixture } = setup(stores, true);
  try {
    if (create) {
      await client.authorize(OAUTH_DID, { scope: OAUTH_SCOPE });
      await client.callback(fixture.callback());
    }
    globalThis.atseqRestoreStarted = true;
    const session = await client.restore(OAUTH_DID, false);
    const info = await session.getTokenInfo(!create);
    const stored = await stores.session.get(OAUTH_DID);
    return {
      subjectMatches: info.sub === OAUTH_DID,
      privateExtractable: stored.dpopKey.cryptoKeyPair.privateKey.extractable,
      publicExtractable: stored.dpopKey.cryptoKeyPair.publicKey.extractable,
      sessionRows: await stores.count('session'),
      refreshRequests: fixture.count('/token'),
    };
  } finally {
    await stores.close();
  }
}
