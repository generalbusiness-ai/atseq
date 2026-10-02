import { deepFreeze } from '../core/freeze.ts';
import { AtseqError } from '../core/errors.ts';
import { OAuthAdapter, oauthUrl, oauthTransport, type OAuthAdapterOptions } from '../protocol/oauth.ts';

export interface BrowserOAuthOptions extends OAuthAdapterOptions {
  readonly custodyOrigin: string;
  readonly publisherOrigin: string;
  readonly applicationOrigin: string;
}
const CLIENT_PIN = 'atseq.oauth.client.v1';
import { BrowserOAuthCustody } from './oauth-custody.ts';

/** Credential origin only. App display and publisher contexts must be separate. */
export async function browserOAuthAdapter(input: BrowserOAuthOptions): Promise<OAuthAdapter> {
  const options = { ...input, metadata: deepFreeze(input.metadata) };
  const origin = oauthUrl(options.custodyOrigin).origin;
  if (
    !globalThis.isSecureContext ||
    !navigator.locks ||
    location.origin !== origin ||
    oauthUrl(options.metadata.client_id!).origin !== origin ||
    oauthUrl(options.publisherOrigin).origin === origin ||
    oauthUrl(options.applicationOrigin).origin === origin ||
    options.metadata.redirect_uris.some((uri) => oauthUrl(uri).origin !== origin)
  )
    throw new AtseqError('origin', 'OAuth requires its dedicated secure custody origin and Web Locks');
  const name = `atseq.oauth.custody:${origin}`;
  const lock = <T>(work: () => Promise<T>): Promise<T> => navigator.locks.request(name, work);
  await lock(async () => {
    const pinned = localStorage.getItem(CLIENT_PIN);
    if (pinned && pinned !== options.metadata.client_id)
      throw new AtseqError('origin', 'OAuth custody origin is pinned to another client');
    localStorage.setItem(CLIENT_PIN, options.metadata.client_id!);
  });
  // The convenience constructor owns a private, unbounded credential database.
  // An existing one requires trusted reset or a newly provisioned custody origin.
  if ((await indexedDB.databases()).some((database) => database.name === '@atproto-oauth-client'))
    throw new AtseqError('origin', 'OAuth custody requires explicit origin reset or re-enrolment on a fresh origin');
  const { OAuthClient, WebcryptoKey } = await import('@atproto/oauth-client-browser');
  const custody = new BrowserOAuthCustody(WebcryptoKey);
  const adapter = new OAuthAdapter(
    options,
    custody.transactions,
    lock,
    oauthTransport(globalThis.fetch.bind(globalThis)),
    async (fetch, identityResolver) => {
      class CustodyClient extends OAuthClient {
        async readApplicationState(callbackState: string) {
          return (await this.stateStore.get(callbackState))?.appState;
        }
      }
      return new CustodyClient({
        clientMetadata: options.metadata,
        responseMode: 'query',
        fetch,
        identityResolver,
        stateStore: custody.stateStore,
        sessionStore: custody.sessionStore,
        runtimeImplementation: custody.runtime(),
      });
    },
    custody,
  );
  // Housekeeping runs only while this shell/document remains active.
  const cleanup = setInterval(() => {
    void adapter.cleanupCustody().catch(() => {
      dispatchEvent(new Event('atseq-oauth-custody-unavailable'));
    });
  }, 60_000);
  addEventListener('pagehide', () => clearInterval(cleanup), { once: true });
  return adapter;
}

/** Trusted credential-shell management only; never invoked by app records or archives. */
export async function resetBrowserOAuthCustody(input: BrowserOAuthOptions): Promise<void> {
  const origin = oauthUrl(input.custodyOrigin).origin;
  if (
    !isSecureContext ||
    !navigator.locks ||
    location.origin !== origin ||
    oauthUrl(input.metadata.client_id!).origin !== origin ||
    oauthUrl(input.publisherOrigin).origin === origin ||
    oauthUrl(input.applicationOrigin).origin === origin
  )
    throw new AtseqError('origin', 'OAuth reset requires its dedicated secure custody origin and Web Locks');
  await navigator.locks.request(`atseq.oauth.custody:${origin}`, async () => {
    const pinned = localStorage.getItem(CLIENT_PIN);
    if (pinned && pinned !== input.metadata.client_id)
      throw new AtseqError('origin', 'OAuth custody origin is pinned to another client');
    // No decoding/migration of the former SDK database. Removing local data cannot
    // revoke unknown remote sessions or erase browser backups/forensic remnants.
    for (const name of ['atseq.oauth.custody.v1', '@atproto-oauth-client']) {
      await new Promise<void>((resolve, reject) => {
        const deletion = indexedDB.deleteDatabase(name);
        deletion.onsuccess = () => resolve();
        deletion.onerror = () => reject(deletion.error);
        deletion.onblocked = () => reject(new AtseqError('input', 'OAuth custody reset is blocked'));
      });
    }
    localStorage.removeItem('atseq.oauth.transactions.v1');
    localStorage.removeItem(CLIENT_PIN);
  });
}
