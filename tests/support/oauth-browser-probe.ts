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
export async function begin() {
  return adapter.begin(OAUTH_DID, OAUTH_SCOPE);
}
export async function complete(id: string, encoded: string) {
  session = await adapter.complete(id, new URLSearchParams(encoded));
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
  const request = indexedDB.open('@atproto-oauth-client');
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    const transaction = db.transaction('session', 'readonly');
    const records = transaction.objectStore('session').getAll();
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
