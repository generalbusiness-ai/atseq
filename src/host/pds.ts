import { HOST_LIMITS } from '../core/limits.ts';
import { SOURCE_POOL_BYTES } from '../definition/source.ts';
import { boundedPdsBody, pdsJsonResponse, PdsError, PdsOperations } from '../transport/pds-operations.ts';
export { PdsError } from '../transport/pds-operations.ts';

export class PdsClient {
  readonly service: string;
  private readonly operations = new PdsOperations((method, init, params) => this.fetch(method, init, true, params));
  private refreshing?: Promise<void>;
  private authenticationDead = false;
  constructor(
    service: string,
    readonly did: string,
    private token: string,
    private refreshJwt?: string,
  ) {
    const url = new URL(service);
    if (
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash ||
      !['http:', 'https:'].includes(url.protocol)
    )
      throw new Error('Expected a PDS origin');
    if (url.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
      throw new Error('Nonlocal PDS transport requires HTTPS');
    this.service = url.origin;
  }
  /** Provision/login use this same bounded, origin-normalized transport. */
  static async account(
    service: string,
    method: 'com.atproto.server.createSession' | 'com.atproto.server.createAccount',
    input: Record<string, unknown>,
  ): Promise<PdsClient> {
    const client = new PdsClient(service, '', '');
    const response = await client.fetch(
      method,
      { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) },
      false,
    );
    const value = await pdsJsonResponse(response);
    if (
      typeof value.did !== 'string' ||
      !value.did ||
      typeof value.accessJwt !== 'string' ||
      !value.accessJwt ||
      typeof value.refreshJwt !== 'string' ||
      !value.refreshJwt
    )
      throw new PdsError(502, 'InvalidAccountResponse');
    return new PdsClient(client.service, value.did, value.accessJwt, value.refreshJwt);
  }
  private async refresh(expiredToken: string): Promise<void> {
    if (this.token !== expiredToken) return; // Another request already renewed it.
    if (this.refreshing) return this.refreshing;
    if (!this.refreshJwt) {
      this.authenticationDead = true;
      throw new PdsError(401, 'AuthenticationUnavailable');
    }
    const refreshJwt = this.refreshJwt;
    const run = (async () => {
      try {
        const value = await pdsJsonResponse(
          await this.fetch(
            'com.atproto.server.refreshSession',
            {
              method: 'POST',
              headers: { authorization: `Bearer ${refreshJwt}` },
            },
            false,
          ),
        );
        if (
          value.did !== this.did ||
          typeof value.accessJwt !== 'string' ||
          !value.accessJwt ||
          typeof value.refreshJwt !== 'string' ||
          !value.refreshJwt
        )
          throw new PdsError(502, 'InvalidRefreshResponse');
        this.token = value.accessJwt;
        this.refreshJwt = value.refreshJwt;
      } catch (error) {
        if (
          error instanceof PdsError &&
          ['ExpiredToken', 'InvalidToken', 'AuthenticationRequired', 'AuthRequired'].includes(error.code)
        ) {
          this.authenticationDead = true;
          throw new PdsError(401, 'AuthenticationUnavailable');
        }
        throw error;
      }
    })();
    this.refreshing = run;
    try {
      await run;
    } finally {
      if (this.refreshing === run) this.refreshing = undefined;
    }
  }
  private async fetch(
    method: string,
    init: RequestInit,
    authenticated = true,
    params?: Record<string, unknown>,
  ): Promise<Response> {
    if (authenticated && this.authenticationDead) throw new PdsError(401, 'AuthenticationUnavailable');
    const url = new URL(`/xrpc/${method}`, this.service);
    for (const [key, value] of Object.entries(params ?? {}))
      if (value !== undefined) url.searchParams.set(key, String(value));
    const token = this.token;
    const send = (current: string) =>
      fetch(url, {
        ...init,
        headers: {
          ...Object.fromEntries(new Headers(init.headers)),
          ...(authenticated ? { authorization: `Bearer ${current}` } : {}),
        },
        redirect: 'error',
        signal: AbortSignal.timeout(15_000),
      });
    const response = await send(token);
    if (!authenticated || response.ok) return response;
    try {
      await pdsJsonResponse(response);
    } catch (error) {
      if (!(error instanceof PdsError) || error.code !== 'ExpiredToken') {
        if (
          error instanceof PdsError &&
          ['InvalidToken', 'AuthenticationRequired', 'AuthRequired'].includes(error.code)
        ) {
          this.authenticationDead = true;
          throw new PdsError(401, 'AuthenticationUnavailable');
        }
        throw error;
      }
    }
    await this.refresh(token);
    const retried = await send(this.token);
    if (!retried.ok) {
      try {
        await pdsJsonResponse(retried);
      } catch (error) {
        if (
          error instanceof PdsError &&
          ['ExpiredToken', 'InvalidToken', 'AuthenticationRequired', 'AuthRequired'].includes(error.code)
        ) {
          this.authenticationDead = true;
          throw new PdsError(401, 'AuthenticationUnavailable');
        }
        throw error;
      }
    }
    return retried;
  }
  request(method: string, input: Record<string, unknown>, write = false): Promise<any> {
    return this.operations.request(method, input, write);
  }
  latestCommit(): Promise<{ cid: string; rev: string }> {
    return this.operations.latestCommit(this.did);
  }
  get(collection: string, rkey: string): Promise<{ uri: string; cid: string; value: unknown }> {
    return this.operations.get(this.did, collection, rkey);
  }
  async list(collection: string): Promise<{ uri: string; cid: string; value: any }[]> {
    const records = [];
    let cursor: string | undefined;
    const seen = new Set<string>();
    do {
      const page = await this.operations.listPage(this.did, collection, cursor);
      records.push(...page.records);
      cursor = page.cursor;
      if (records.length > HOST_LIMITS.historyEntries) throw new PdsError(503, 'SnapshotLimit');
      if (cursor && seen.has(cursor)) throw new PdsError(502, 'RepeatedCursor');
      if (cursor) seen.add(cursor);
    } while (cursor);
    return records;
  }
  apply(writes: unknown[], swapCommit?: string): Promise<any> {
    return this.operations.apply(this.did, writes, swapCommit);
  }
  applyConditional(writes: unknown[], swapCommit: string): Promise<any> {
    return this.operations.applyConditional(this.did, writes, swapCommit);
  }
  upload(content: Uint8Array, mimeType = 'application/octet-stream'): Promise<any> {
    return this.operations.upload(content, mimeType);
  }
  async binary(
    method: 'com.atproto.sync.getRepo' | 'com.atproto.sync.getBlob',
    extra: Record<string, string> = {},
  ): Promise<Uint8Array> {
    const res = await this.fetch(method, { method: 'GET' }, true, { did: this.did, ...extra });
    if (!res.ok) await pdsJsonResponse(res);
    return boundedPdsBody(res, method === 'com.atproto.sync.getBlob' ? SOURCE_POOL_BYTES : 128 * 1024 * 1024);
  }
}
