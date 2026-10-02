import type {
  OAuthClient,
  OAuthSession,
  OAuthClientMetadataInput,
  CreateIdentityResolverOptions,
} from '@atproto/oauth-client-browser';
import { AtseqError } from '../core/errors.ts';
import { assertDependencies } from '../core/dependencies.ts';
import { isAtprotoDid } from '@atproto/did';

/** Internal enrolment boundary. No OAuth secret is part of its returned values. */
export const OAUTH_LIMITS = Object.freeze({
  pending: 10,
  transactionMs: 10 * 60 * 1000,
  operationMs: 30_000,
  requests: 64,
  requestBytes: 64 * 1024,
  responseBytes: 1024 * 1024,
  totalBytes: 32 * 1024 * 1024,
  scopes: 64,
  scopeBytes: 8192,
});
export type OAuthIdentityResolver = NonNullable<CreateIdentityResolverOptions['identityResolver']>;
export interface OAuthAdapterOptions {
  readonly metadata: OAuthClientMetadataInput;
  /** Trusted caller's maintained identity path. Every HTTP lookup must use this fetch. */
  readonly resolveIdentity: (
    identifier: string,
    options: { readonly fetch: typeof globalThis.fetch; readonly signal: AbortSignal },
  ) => ReturnType<OAuthIdentityResolver['resolve']>;
}
export interface OAuthTransaction {
  readonly id: string;
  readonly did: string;
  readonly scopes: readonly string[];
  readonly expiresAt: number;
}
/** Non-secret transaction custody; the platform adapter serializes all access. */
export interface OAuthTransactionStore {
  list(): readonly OAuthTransaction[];
  set(transaction: OAuthTransaction): void;
  take(id: string): OAuthTransaction | undefined;
}
export type OAuthLock = <T>(work: () => Promise<T>) => Promise<T>;
interface Budget {
  readonly signal: AbortSignal;
  requests: number;
  bytes: number;
}
function refuse(message: string): never {
  throw new AtseqError('input', message);
}
/** Keep only trusted failure codes through SDK cause wrappers, never their text. */
function operationFailure(error: unknown, deadline = false): AtseqError {
  if (deadline) return new AtseqError('content_unavailable', 'OAuth operation is unavailable');
  const pending = [error],
    seen = new Set<unknown>();
  for (let checked = 0; pending.length && checked < 32; checked++) {
    const next = pending.pop();
    if (!(next instanceof Error) || seen.has(next)) continue;
    seen.add(next);
    if (next instanceof AtseqError) {
      if (next.code === 'content_unavailable')
        return new AtseqError('content_unavailable', 'OAuth operation is unavailable');
      if (next.code === 'origin') return new AtseqError('origin', 'OAuth custody origin is refused');
    }
    pending.push(next.cause);
    if (next instanceof AggregateError) pending.push(...next.errors.slice(0, 32));
  }
  return new AtseqError('input', 'OAuth operation failed');
}
/** Wrap the native fetch edge, outside host policy checks and SDK parsing. */
export function oauthTransport(fetch: typeof globalThis.fetch): typeof globalThis.fetch {
  return async (input, init) => {
    try {
      return await fetch(input, init);
    } catch (error) {
      if (error instanceof AtseqError) throw operationFailure(error);
      throw new AtseqError('content_unavailable', 'OAuth transport is unavailable');
    }
  };
}
/** Browser-visible URL policy only. Host transport must additionally guard actual DNS/connect. */
export function oauthUrl(value: string | URL): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    refuse('Invalid OAuth endpoint URL');
  }
  const host = url.hostname.toLowerCase();
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.hash ||
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.includes(':') ||
    /^\d+(\.\d+)*$/.test(host)
  )
    refuse('OAuth endpoint fails URL policy');
  return url;
}
function scopes(value: string): readonly string[] {
  if (value.length > OAUTH_LIMITS.scopeBytes || !/^[\x21-\x7e]+(?: [\x21-\x7e]+)*$/.test(value))
    refuse('Invalid OAuth scope');
  const result = value.split(' ');
  if (result.length > OAUTH_LIMITS.scopes || new Set(result).size !== result.length || !result.includes('atproto'))
    refuse('Invalid OAuth scope set');
  return Object.freeze(result.sort());
}
async function bodyBytes(
  body: ReadableStream<Uint8Array> | null,
  maximum: number,
  budget: Budget,
  signal = budget.signal,
): Promise<Uint8Array<ArrayBuffer> | null> {
  if (!body) return null;
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let rejectAbort: (reason: unknown) => void = () => {};
  const aborted = new Promise<never>((_, reject) => {
    rejectAbort = reject;
  });
  const abort = () => rejectAbort(new AtseqError('content_unavailable', 'OAuth request deadline exceeded'));
  signal.addEventListener('abort', abort, { once: true });
  try {
    signal.throwIfAborted();
    for (;;) {
      const { value, done } = await Promise.race([reader.read(), aborted]);
      if (done) break;
      size += value.length;
      budget.bytes += value.length;
      if (size > maximum || budget.bytes > OAUTH_LIMITS.totalBytes) refuse('OAuth HTTP body exceeds budget');
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    return bytes;
  } catch (error) {
    if (error instanceof AtseqError) throw error;
    throw new AtseqError('content_unavailable', 'OAuth body is unavailable');
  } finally {
    signal.removeEventListener('abort', abort);
    void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
export interface OAuthSessionInfo {
  readonly did: string;
  readonly issuer: string;
  readonly pds: string;
  readonly scopes: readonly string[];
}
/** Credentials stay in maintained-client stores and JS private fields, never JSON output. */
export class OAuthSessionHandle {
  readonly #flow: OAuthAdapter;
  readonly #session: OAuthSession;
  readonly #expected: OAuthTransaction;
  constructor(flow: OAuthAdapter, session: OAuthSession, expected: OAuthTransaction) {
    this.#flow = flow;
    this.#session = session;
    this.#expected = expected;
  }
  info(refresh = false): Promise<OAuthSessionInfo> {
    return this.#flow.sessionInfo(this.#session, this.#expected, refresh);
  }
  /** Account responses are ephemeral transport data, not an Atseq archive/result. */
  request(path: string, init?: RequestInit): Promise<Response> {
    return this.#flow.sessionRequest(this.#session, this.#expected, path, init);
  }
  revoke(): Promise<void> {
    return this.#flow.sessionRevoke(this.#session);
  }
}

/** Maintained OAuth performs PKCE/PAR/DPoP. This adapter adds custody and operation policy. */
export class OAuthAdapter {
  readonly #options: OAuthAdapterOptions;
  readonly #transactions: OAuthTransactionStore;
  readonly #lock: OAuthLock;
  readonly #transport: typeof globalThis.fetch;
  readonly #factory: (fetch: typeof globalThis.fetch, identity: OAuthIdentityResolver) => Promise<OAuthClient>;
  #client: Promise<OAuthClient> | undefined;
  #budget: Budget | undefined;
  #resourceCheck: ((request: Request) => Promise<void>) | undefined;
  constructor(
    options: OAuthAdapterOptions,
    transactions: OAuthTransactionStore,
    lock: OAuthLock,
    transport: typeof globalThis.fetch,
    factory: (fetch: typeof globalThis.fetch, identity: OAuthIdentityResolver) => Promise<OAuthClient>,
  ) {
    oauthUrl(options.metadata.client_id!);
    if (options.metadata.token_endpoint_auth_method !== 'none') refuse('This adapter requires a public OAuth client');
    scopes(options.metadata.scope ?? '');
    this.#options = options;
    this.#transactions = transactions;
    this.#lock = lock;
    this.#transport = transport;
    this.#factory = factory;
  }
  readonly #fetch: typeof globalThis.fetch = async (input, init) => {
    const budget = this.#budget;
    if (!budget) refuse('OAuth HTTP request outside an adapter operation');
    if (++budget.requests > OAUTH_LIMITS.requests) refuse('OAuth HTTP request count exceeds budget');
    const request = new Request(input, init);
    oauthUrl(request.url);
    await this.#resourceCheck?.(request);
    if (request.headers.has('cookie')) refuse('OAuth HTTP cookie header is forbidden');
    const signal = AbortSignal.any([budget.signal, request.signal]);
    const bytes = await bodyBytes(request.body, OAUTH_LIMITS.requestBytes, budget, signal);
    const headers = new Headers(request.headers);
    headers.delete('content-length');
    const guarded = new Request(request.url, {
      method: request.method,
      headers,
      body: bytes,
      redirect: 'error',
      credentials: 'omit',
      cache: 'no-store',
      signal,
    });
    const response = await this.#transport(guarded);
    if (response.redirected || response.status === 0) refuse('OAuth redirect or opaque response is forbidden');
    if (response.url && oauthUrl(response.url).href !== oauthUrl(request.url).href)
      refuse('OAuth response URL differs from request');
    const content = await bodyBytes(response.body, OAUTH_LIMITS.responseBytes, budget, signal);
    const resultHeaders = new Headers(response.headers);
    resultHeaders.delete('content-length');
    resultHeaders.delete('content-encoding');
    return new Response(content, { status: response.status, statusText: response.statusText, headers: resultHeaders });
  };
  async #run<T>(work: (client: OAuthClient) => Promise<T>): Promise<T> {
    return this.#lock(async () => {
      this.#budget = { signal: AbortSignal.timeout(OAUTH_LIMITS.operationMs), requests: 0, bytes: 0 };
      try {
        assertDependencies();
        this.#client ??= this.#factory(this.#fetch, {
          resolve: (identifier, options) =>
            this.#options.resolveIdentity(identifier, {
              fetch: this.#fetch,
              signal: AbortSignal.any([this.#budget!.signal, ...(options?.signal ? [options.signal] : [])]),
            }),
        });
        return await work(await this.#client);
      } catch (error) {
        // Library/server error descriptions may contain codes, tokens or request bodies.
        throw operationFailure(error, this.#budget.signal.aborted);
      } finally {
        this.#budget = undefined;
      }
    });
  }
  async begin(
    did: string,
    requestedScope: string,
  ): Promise<{ readonly transactionId: string; readonly authorizationUrl: string }> {
    if (!isAtprotoDid(did)) refuse('OAuth enrolment requires an ATproto account DID');
    const requested = scopes(requestedScope),
      allowed = scopes(this.#options.metadata.scope ?? '');
    if (requested.some((scope) => !allowed.includes(scope))) refuse('OAuth scope exceeds configured consent');
    return this.#run(async (client) => {
      for (const transaction of this.#transactions.list())
        if (Date.now() >= transaction.expiresAt) this.#transactions.take(transaction.id);
      if (this.#transactions.list().length >= OAUTH_LIMITS.pending) refuse('Too many OAuth transactions');
      const transaction = Object.freeze({
        id: crypto.randomUUID(),
        did,
        scopes: requested,
        expiresAt: Date.now() + OAUTH_LIMITS.transactionMs,
      });
      this.#transactions.set(transaction);
      // A failed begin can leave maintained PAR state. Keeping its transaction
      // counts that orphan against the same 10-entry cap until 10-minute expiry.
      const url = await client.authorize(did, { scope: requested.join(' '), state: transaction.id });
      oauthUrl(url);
      return Object.freeze({ transactionId: transaction.id, authorizationUrl: url.href });
    });
  }
  async complete(params: URLSearchParams): Promise<OAuthSessionHandle> {
    const encoded = params.toString();
    if (encoded.length > OAUTH_LIMITS.requestBytes) refuse('OAuth callback exceeds budget');
    const copy = new URLSearchParams(encoded);
    if (!copy.get('iss') || !copy.get('state') || !copy.get('code') || copy.has('error'))
      refuse('Incomplete OAuth callback');
    for (const name of ['iss', 'state', 'code'])
      if (copy.getAll(name).length !== 1) refuse('Duplicate OAuth callback parameter');
    const transactionId = copy.get('state')!;
    if (transactionId.length !== 36) refuse('Invalid OAuth callback state');
    const issuer = oauthUrl(copy.get('iss')!).href;
    return this.#run(async (client) => {
      const transaction = this.#transactions.take(transactionId);
      if (!transaction || Date.now() >= transaction.expiresAt) refuse('Unknown or expired OAuth transaction');
      const { session, state } = await client.callback(copy);
      try {
        if (state !== transactionId) refuse('OAuth transaction differs from callback');
        const info = await this.#verify(client, session, transaction, false);
        if (oauthUrl(info.issuer).href !== issuer) refuse('OAuth issuer differs from callback');
        return new OAuthSessionHandle(this, session, transaction);
      } catch (error) {
        await session.signOut().catch(() => {});
        throw operationFailure(error);
      }
    });
  }
  async restore(did: string, requestedScope: string): Promise<OAuthSessionHandle> {
    if (!isAtprotoDid(did)) refuse('OAuth session requires an ATproto account DID');
    const requested = scopes(requestedScope),
      allowed = scopes(this.#options.metadata.scope ?? '');
    if (requested.some((scope) => !allowed.includes(scope))) refuse('OAuth scope exceeds configured consent');
    return this.#run(async (client) => {
      const session = await client.restore(did, false);
      const expected = Object.freeze({ id: crypto.randomUUID(), did, scopes: requested, expiresAt: 0 });
      try {
        await this.#verify(client, session, expected, false);
        return new OAuthSessionHandle(this, session, expected);
      } catch (error) {
        await session.signOut().catch(() => {});
        throw operationFailure(error);
      }
    });
  }
  async #verify(
    client: OAuthClient,
    session: OAuthSession,
    expected: OAuthTransaction,
    refresh: boolean | 'auto',
  ): Promise<OAuthSessionInfo> {
    try {
      const info = await session.getTokenInfo(refresh);
      const granted = this.#checkToken(info, session, expected);
      const resolved = await client.oauthResolver.resolveFromIdentity(expected.did, {
        noCache: true,
        allowStale: false,
        signal: this.#budget!.signal,
      });
      const pds = resolved.pds.href;
      if (oauthUrl(resolved.metadata.issuer).href !== oauthUrl(info.iss).href)
        refuse('OAuth account issuer authority changed');
      if (oauthUrl(pds).href !== oauthUrl(info.aud).href) refuse('OAuth account authority changed');
      return Object.freeze({
        did: info.sub,
        issuer: oauthUrl(info.iss).href,
        pds: oauthUrl(pds).href,
        scopes: granted,
      });
    } catch (error) {
      await session.signOut().catch(() => {});
      throw operationFailure(error);
    }
  }
  #checkToken(
    info: Awaited<ReturnType<OAuthSession['getTokenInfo']>>,
    session: OAuthSession,
    expected: OAuthTransaction,
  ): readonly string[] {
    const granted = scopes(info.scope);
    if (
      info.sub !== expected.did ||
      session.did !== expected.did ||
      granted.length !== expected.scopes.length ||
      granted.some((scope, index) => scope !== expected.scopes[index])
    )
      refuse('OAuth account or granted scope differs from transaction');
    return granted;
  }
  sessionInfo(session: OAuthSession, expected: OAuthTransaction, refresh: boolean): Promise<OAuthSessionInfo> {
    return this.#run((client) => this.#verify(client, session, expected, refresh));
  }
  async sessionRequest(
    session: OAuthSession,
    expected: OAuthTransaction,
    path: string,
    init?: RequestInit,
  ): Promise<Response> {
    if (
      !path.startsWith('/xrpc/') ||
      path.includes('#') ||
      !new URL(path, 'https://xrpc.invalid').pathname.startsWith('/xrpc/')
    )
      refuse('OAuth resource path must name an XRPC operation');
    return this.#run(async (client) => {
      const authority = await this.#verify(client, session, expected, 'auto');
      const resource = new URL(path, authority.pds).href;
      // The maintained fetch can refresh again on a resource 401. Recheck the
      // updated token before either credential-bearing dispatch, not after a write.
      this.#resourceCheck = async (request) => {
        if (!request.headers.has('authorization')) return;
        try {
          const token = await session.getTokenInfo(false);
          this.#checkToken(token, session, expected);
          if (
            request.url !== resource ||
            oauthUrl(token.iss).href !== authority.issuer ||
            oauthUrl(token.aud).href !== authority.pds
          )
            refuse('OAuth resource authority changed during dispatch');
        } catch (error) {
          await session.signOut().catch(() => {});
          throw operationFailure(error);
        }
      };
      try {
        return await session.fetchHandler(path, init);
      } finally {
        this.#resourceCheck = undefined;
      }
    });
  }
  sessionRevoke(session: OAuthSession): Promise<void> {
    return this.#run(() => session.signOut());
  }
}
