import { responseBytes } from './api.ts';
import { link } from '../protocol/wire.ts';

/** Bounded standard PDS responses; authentication belongs to the selected transport. */
export class PdsError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(`PDS ${status}: ${code}`);
    this.name = 'PdsError';
  }
}
export async function boundedPdsBody(response: Response, limit: number): Promise<Uint8Array> {
  try {
    return await responseBytes(response, limit);
  } catch {
    throw new PdsError(502, 'ResponseUnavailable');
  }
}
export async function pdsJsonResponse(res: Response): Promise<any> {
  const raw = await boundedPdsBody(res, res.ok ? 8 * 1024 * 1024 : 64 * 1024);
  let value: any;
  try {
    value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(raw));
  } catch {
    throw new PdsError(res.ok ? 502 : res.status, 'InvalidResponse');
  }
  if (!res.ok) throw new PdsError(res.status, typeof value?.error === 'string' ? value.error : 'RequestFailed');
  return value;
}
/** The single standard operation owner. This callback conveys transport, not app authority. */
export class PdsOperations {
  constructor(
    private readonly send: (method: string, init: RequestInit, params?: Record<string, unknown>) => Promise<Response>,
  ) {}
  async request(method: string, input: Record<string, unknown>, write = false): Promise<any> {
    const res = await this.send(
      method,
      {
        method: write ? 'POST' : 'GET',
        ...(write ? { headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) } : {}),
      },
      write ? undefined : input,
    );
    return pdsJsonResponse(res);
  }
  async latestCommit(did: string): Promise<{ cid: string; rev: string }> {
    const value = await this.request('com.atproto.sync.getLatestCommit', { did });
    if (typeof value?.cid !== 'string' || !value.cid || typeof value?.rev !== 'string' || !value.rev)
      throw new PdsError(502, 'InvalidCommit');
    try {
      link(value.cid);
    } catch {
      throw new PdsError(502, 'InvalidCommit');
    }
    return { cid: value.cid, rev: value.rev };
  }
  get(did: string, collection: string, rkey: string): Promise<{ uri: string; cid: string; value: unknown }> {
    return this.request('com.atproto.repo.getRecord', { repo: did, collection, rkey });
  }
  async listPage(
    did: string,
    collection: string,
    cursor?: string,
    limit = 100,
  ): Promise<{ records: { uri: string; cid: string; value: any }[]; cursor?: string }> {
    const page = await this.request('com.atproto.repo.listRecords', {
      repo: did,
      collection,
      limit,
      reverse: false,
      cursor,
    });
    if (
      !Array.isArray(page.records) ||
      page.records.length > limit ||
      (page.cursor !== undefined && typeof page.cursor !== 'string')
    )
      throw new PdsError(502, 'InvalidPage');
    return page;
  }
  apply(did: string, writes: unknown[], swapCommit?: string): Promise<any> {
    return this.request(
      'com.atproto.repo.applyWrites',
      { repo: did, validate: false, writes, ...(swapCommit ? { swapCommit } : {}) },
      true,
    );
  }
  async applyConditional(did: string, writes: unknown[], swapCommit: string): Promise<any> {
    // An untyped caller or malformed remote reply must never remove this condition.
    if (typeof swapCommit !== 'string' || !swapCommit) throw new PdsError(502, 'InvalidCommit');
    try {
      link(swapCommit);
    } catch {
      throw new PdsError(502, 'InvalidCommit');
    }
    return this.apply(did, writes, swapCommit);
  }
  async upload(content: Uint8Array, mimeType = 'application/octet-stream'): Promise<any> {
    const res = await this.send('com.atproto.repo.uploadBlob', {
      method: 'POST',
      headers: { 'content-type': mimeType },
      body: new Uint8Array(content),
    });
    return (await pdsJsonResponse(res)).blob;
  }
}
