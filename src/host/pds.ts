import { SOURCE_POOL_BYTES } from '../definition/source.ts';
import { responseBytes } from '../transport/api.ts';
import { link } from '../protocol/wire.ts';

/** Standard PDS XRPC transport. Credentials stay in the host, never in views. */
export class PdsError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(`PDS ${status}: ${code}`);
    this.name = 'PdsError';
  }
}
async function boundedBody(response: Response, limit: number): Promise<Uint8Array> {
  try {
    return await responseBytes(response, limit);
  } catch {
    throw new PdsError(502, 'ResponseUnavailable');
  }
}
async function jsonResponse(res: Response): Promise<any> {
  const raw = await boundedBody(res, res.ok ? 8 * 1024 * 1024 : 64 * 1024);
  let value: any;
  try {
    value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(raw));
  } catch {
    throw new PdsError(res.ok ? 502 : res.status, 'InvalidResponse');
  }
  if (!res.ok) throw new PdsError(res.status, typeof value?.error === 'string' ? value.error : 'RequestFailed');
  return value;
}
export class PdsClient {
  readonly service: string;
  private refreshing?: Promise<void>;
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
    const value = await jsonResponse(response);
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
    if (!this.refreshJwt) throw new PdsError(401, 'AuthenticationUnavailable');
    const refreshJwt = this.refreshJwt;
    const run = (async () => {
      try {
        const value = await jsonResponse(
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
          ([401, 403].includes(error.status) || ['ExpiredToken', 'InvalidToken'].includes(error.code))
        )
          throw new PdsError(401, 'AuthenticationUnavailable');
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
      await jsonResponse(response);
    } catch (error) {
      if (!(error instanceof PdsError) || error.code !== 'ExpiredToken') {
        if (error instanceof PdsError && [401, 403].includes(error.status))
          throw new PdsError(401, 'AuthenticationUnavailable');
        throw error;
      }
    }
    await this.refresh(token);
    const retried = await send(this.token);
    if (!retried.ok) {
      try {
        await jsonResponse(retried);
      } catch (error) {
        if (error instanceof PdsError && (error.code === 'ExpiredToken' || [401, 403].includes(error.status)))
          throw new PdsError(401, 'AuthenticationUnavailable');
        throw error;
      }
    }
    return retried;
  }
  async request(method: string, input: Record<string, unknown>, write = false): Promise<any> {
    const res = await this.fetch(
      method,
      {
        method: write ? 'POST' : 'GET',
        ...(write ? { headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) } : {}),
      },
      true,
      write ? undefined : input,
    );
    return jsonResponse(res);
  }
  async latestCommit(): Promise<{ cid: string; rev: string }> {
    const value = await this.request('com.atproto.sync.getLatestCommit', { did: this.did });
    if (typeof value?.cid !== 'string' || !value.cid || typeof value?.rev !== 'string' || !value.rev)
      throw new PdsError(502, 'InvalidCommit');
    try {
      link(value.cid);
    } catch {
      throw new PdsError(502, 'InvalidCommit');
    }
    return { cid: value.cid, rev: value.rev };
  }
  get(collection: string, rkey: string): Promise<{ uri: string; cid: string; value: unknown }> {
    return this.request('com.atproto.repo.getRecord', { repo: this.did, collection, rkey });
  }
  async list(collection: string): Promise<{ uri: string; cid: string; value: any }[]> {
    const records = [];
    let cursor: string | undefined;
    const seen = new Set<string>();
    do {
      const page = await this.request('com.atproto.repo.listRecords', {
        repo: this.did,
        collection,
        limit: 100,
        reverse: false,
        cursor,
      });
      if (
        !Array.isArray(page.records) ||
        page.records.length > 100 ||
        (page.cursor !== undefined && typeof page.cursor !== 'string')
      )
        throw new PdsError(502, 'InvalidPage');
      records.push(...page.records);
      cursor = page.cursor;
      if (records.length > 20_000) throw new PdsError(503, 'SnapshotLimit');
      if (cursor && seen.has(cursor)) throw new PdsError(502, 'RepeatedCursor');
      if (cursor) seen.add(cursor);
    } while (cursor);
    return records;
  }
  apply(writes: unknown[], swapCommit?: string): Promise<any> {
    return this.request(
      'com.atproto.repo.applyWrites',
      { repo: this.did, validate: false, writes, ...(swapCommit ? { swapCommit } : {}) },
      true,
    );
  }
  async applyConditional(writes: unknown[], swapCommit: string): Promise<any> {
    // Runtime validation is deliberate: a malformed remote reply or untyped
    // caller must never turn a conditional append into an unconditional write.
    if (typeof swapCommit !== 'string' || !swapCommit) throw new PdsError(502, 'InvalidCommit');
    try {
      link(swapCommit);
    } catch {
      throw new PdsError(502, 'InvalidCommit');
    }
    return this.apply(writes, swapCommit);
  }
  async upload(content: Uint8Array, mimeType = 'application/octet-stream'): Promise<any> {
    const res = await this.fetch('com.atproto.repo.uploadBlob', {
      method: 'POST',
      headers: { 'content-type': mimeType },
      body: new Uint8Array(content),
      redirect: 'error',
      signal: AbortSignal.timeout(15_000),
    });
    return (await jsonResponse(res)).blob;
  }
  async binary(
    method: 'com.atproto.sync.getRepo' | 'com.atproto.sync.getBlob',
    extra: Record<string, string> = {},
  ): Promise<Uint8Array> {
    const res = await this.fetch(method, { method: 'GET' }, true, { did: this.did, ...extra });
    if (!res.ok) await jsonResponse(res);
    return boundedBody(res, method === 'com.atproto.sync.getBlob' ? SOURCE_POOL_BYTES : 128 * 1024 * 1024);
  }
}
