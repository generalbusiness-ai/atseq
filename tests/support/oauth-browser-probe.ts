import { loadBrowserOAuthAdapter } from '../../src/browser/oauth-loader.ts';
import type { OAuthAdapter, OAuthSessionHandle } from '../../src/protocol/oauth.ts';
import { OAuthFixture, OAUTH_CUSTODY, OAUTH_DID, OAUTH_SCOPE, oauthMetadata } from './oauth-fixture.ts';
let adapter: OAuthAdapter;
let session: OAuthSessionHandle;
export async function create(overrides = {}) {
  const fixture = new OAuthFixture();
  adapter = await loadBrowserOAuthAdapter({
    metadata: oauthMetadata,
    resolveIdentity: fixture.resolveIdentity,
    custodyOrigin: OAUTH_CUSTODY,
    publisherOrigin: 'https://publisher.atseq-probe.net',
    applicationOrigin: 'https://application.atseq-probe.net',
    ...overrides,
  });
  return { secure: isSecureContext, locks: Boolean(navigator.locks), serialized: JSON.stringify(adapter) };
}
export async function begin(did = OAUTH_DID) {
  return adapter.begin(did, OAUTH_SCOPE);
}
export async function complete(encoded: string) {
  session = await adapter.complete(new URLSearchParams(encoded));
  return { serialized: JSON.stringify(session), info: await session.info() };
}
export async function info(refresh = false) {
  return session.info(refresh);
}
export async function resource() {
  return (await session.request('/xrpc/ai.generalbusiness.atseq.synthetic')).json();
}
export async function restore() {
  session = await adapter.restore(OAUTH_DID, OAUTH_SCOPE);
  return session.info();
}
export async function revoke() {
  await session.revoke();
}
export async function storedKeyProperties() {
  const request = indexedDB.open('atseq.oauth.custody.v1');
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    const transaction = db.transaction('accounts', 'readonly');
    const records = transaction.objectStore('accounts').getAll();
    const values = await new Promise<any[]>((resolve, reject) => {
      records.onsuccess = () => resolve(records.result);
      records.onerror = () => reject(records.error);
    });
    return values.map(({ value }) => ({
      privateExtractable: value.dpopKey.keyPair.privateKey.extractable,
      privateType: value.dpopKey.keyPair.privateKey.type,
      publicExtractable: value.dpopKey.keyPair.publicKey.extractable,
    }));
  } finally {
    db.close();
  }
}

export async function custodyRows() {
  const opening = indexedDB.open('atseq.oauth.custody.v1');
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    opening.onsuccess = () => resolve(opening.result);
    opening.onerror = () => reject(opening.error);
  });
  try {
    const tx = db.transaction(['pending', 'accounts'], 'readonly');
    const read = (store: string) =>
      new Promise<any[]>((resolve, reject) => {
        const r = tx.objectStore(store).getAll();
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      });
    const [pending, accounts] = await Promise.all([read('pending'), read('accounts')]);
    return {
      pending: pending.map(({ id, did, expiresAt, consumed }) => ({ id, did, expiresAt, consumed })),
      accounts: accounts.map(({ did, phase, expiresAt, operation, value }) => ({
        did,
        phase,
        expiresAt,
        uncertain: Boolean(operation),
        hasCredential: Boolean(value),
        metadataBytes: new TextEncoder().encode(
          JSON.stringify({ did, phase, expiresAt, operation, value }, (name, entry) =>
            name === 'keyPair' ? undefined : entry,
          ),
        ).length,
      })),
    };
  } finally {
    db.close();
  }
}

export async function manage(action: string, value?: any) {
  const { resetBrowserOAuthCustody } = await import('../../src/browser/oauth-adapter.ts');
  if (action === 'reset') {
    await resetBrowserOAuthCustody({
      metadata: oauthMetadata,
      resolveIdentity: new OAuthFixture().resolveIdentity,
      custodyOrigin: OAUTH_CUSTODY,
      publisherOrigin: 'https://publisher.atseq-probe.net',
      applicationOrigin: 'https://application.atseq-probe.net',
    });
    return;
  }
  if (action === 'cleanup') return adapter.cleanupCustody();
  if (action === 'fault') {
    const method: 'put' | 'delete' = value.action ?? 'put';
    const original = IDBObjectStore.prototype[method];
    let fired = false;
    let matched = 0;
    IDBObjectStore.prototype[method] = function (row: any, ...args: any[]) {
      const result = (original as any).call(this, row, ...args);
      if (
        (!fired || value.always) &&
        this.name === value.store &&
        (!value.phase || row.phase === value.phase) &&
        (!value.credential || row.value) &&
        ++matched > (value.after ?? 0)
      ) {
        fired = true;
        this.transaction.abort();
      }
      return result;
    };
    (globalThis as any).clearCustodyFault = () => {
      IDBObjectStore.prototype[method] = original as any;
      return fired;
    };
    return;
  }
  if (action === 'clearFault') return (globalThis as any).clearCustodyFault();
  const open = indexedDB.open('atseq.oauth.custody.v1');
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error);
  });
  try {
    const tx = db.transaction(['pending', 'accounts'], 'readwrite');
    const completed = new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error);
    });
    const r = tx.objectStore(value.store).get(value.id);
    r.onsuccess = () => {
      const row = r.result;
      Object.assign(row, value.patch);
      tx.objectStore(value.store).put(row);
    };
    await completed;
  } finally {
    db.close();
  }
}
