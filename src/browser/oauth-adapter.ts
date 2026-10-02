import { deepFreeze } from '../core/freeze.ts';
import { AtseqError } from '../core/errors.ts';
import {
  OAuthAdapter,
  oauthUrl,
  oauthTransport,
  OAUTH_LIMITS,
  type OAuthAdapterOptions,
  type OAuthTransaction,
} from '../protocol/oauth.ts';

export interface BrowserOAuthOptions extends OAuthAdapterOptions {
  readonly custodyOrigin: string;
  readonly publisherOrigin: string;
  readonly applicationOrigin: string;
}
const CLIENT_PIN = 'atseq.oauth.client.v1';
const TRANSACTIONS = 'atseq.oauth.transactions.v1';

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
  const read = (): OAuthTransaction[] => {
    const raw = localStorage.getItem(TRANSACTIONS) ?? '[]';
    if (raw.length > 200 * 1024) throw new AtseqError('input', 'OAuth transaction storage exceeds budget');
    const rows: unknown = JSON.parse(raw);
    if (
      !Array.isArray(rows) ||
      rows.length > OAUTH_LIMITS.pending ||
      rows.some(
        (row) =>
          !row ||
          typeof row !== 'object' ||
          typeof row.id !== 'string' ||
          row.id.length !== 36 ||
          typeof row.did !== 'string' ||
          row.did.length > 2048 ||
          !Array.isArray(row.scopes) ||
          row.scopes.length > OAUTH_LIMITS.scopes ||
          row.scopes.some((scope: unknown) => typeof scope !== 'string') ||
          row.scopes.join(' ').length > OAUTH_LIMITS.scopeBytes ||
          !Number.isSafeInteger(row.expiresAt) ||
          row.expiresAt <= 0 ||
          row.expiresAt > Date.now() + OAUTH_LIMITS.transactionMs,
      )
    )
      throw new AtseqError('input', 'Invalid OAuth transaction storage');
    return rows;
  };
  const write = (transactions: readonly OAuthTransaction[]) =>
    localStorage.setItem(TRANSACTIONS, JSON.stringify(transactions));
  return new OAuthAdapter(
    options,
    {
      list: read,
      set: (transaction) => write([...read(), transaction]),
      take: (id) => {
        const transactions = read(),
          transaction = transactions.find((entry) => entry.id === id);
        write(transactions.filter((entry) => entry.id !== id));
        return transaction;
      },
    },
    lock,
    oauthTransport(globalThis.fetch.bind(globalThis)),
    async (fetch, identityResolver) => {
      const { BrowserOAuthClient } = await import('@atproto/oauth-client-browser');
      return new BrowserOAuthClient({ clientMetadata: options.metadata, fetch, identityResolver });
    },
  );
}
