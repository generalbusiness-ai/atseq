/** Standard PDS XRPC transport. Credentials stay in the host, never in views. */
export class PdsError extends Error {
  constructor(readonly status: number, readonly code: string) { super(`PDS ${status}: ${code}`); this.name = 'PdsError'; }
}
async function boundedBody(res: Response, limit: number): Promise<Uint8Array> {
  const reader = res.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.length;
      if (size > limit) throw new PdsError(502, 'ResponseTooLarge');
      chunks.push(value);
    }
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
  const output = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { output.set(chunk, offset); offset += chunk.length; }
  return output;
}
async function jsonResponse(res: Response): Promise<any> {
  const raw = await boundedBody(res, res.ok ? 8 * 1024 * 1024 : 64 * 1024);
  let value: any;
  try { value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(raw)); }
  catch { throw new PdsError(res.ok ? 502 : res.status, 'InvalidResponse'); }
  if (!res.ok) throw new PdsError(res.status, typeof value?.error === 'string' ? value.error : 'RequestFailed');
  return value;
}
export class PdsClient {
  readonly service: string;
  constructor(service: string, readonly did: string, private readonly token: string) {
    const url = new URL(service);
    if (url.username || url.password || url.pathname !== '/' || url.search || url.hash || !['http:', 'https:'].includes(url.protocol)) throw new Error('Expected a PDS origin');
    if (url.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error('Nonlocal PDS transport requires HTTPS');
    this.service = url.origin;
  }
  async request(method: string, input: Record<string, unknown>, write = false): Promise<any> {
    const url = new URL(`/xrpc/${method}`, this.service);
    if (!write) for (const [key, value] of Object.entries(input)) if (value !== undefined) url.searchParams.set(key, String(value));
    const res = await fetch(url, { method: write ? 'POST' : 'GET', redirect: 'error', signal: AbortSignal.timeout(15_000), headers: { authorization: `Bearer ${this.token}`, ...(write ? { 'content-type': 'application/json' } : {}) }, ...(write ? { body: JSON.stringify(input) } : {}) });
    return jsonResponse(res);
  }
  latestCommit(): Promise<{ cid: string; rev: string }> { return this.request('com.atproto.sync.getLatestCommit', { did: this.did }); }
  get(collection: string, rkey: string): Promise<{ uri: string; cid: string; value: unknown }> { return this.request('com.atproto.repo.getRecord', { repo: this.did, collection, rkey }); }
  async list(collection: string): Promise<{ uri: string; cid: string; value: any }[]> {
    const records = []; let cursor: string | undefined;
    const seen = new Set<string>();
    do {
      const page = await this.request('com.atproto.repo.listRecords', { repo: this.did, collection, limit: 100, reverse: false, cursor });
      if (!Array.isArray(page.records) || page.records.length > 100 || (page.cursor !== undefined && typeof page.cursor !== 'string')) throw new PdsError(502, 'InvalidPage');
      records.push(...page.records); cursor = page.cursor;
      if (records.length > 20_000) throw new PdsError(503, 'SnapshotLimit');
      if (cursor && seen.has(cursor)) throw new PdsError(502, 'RepeatedCursor');
      if (cursor) seen.add(cursor);
    } while (cursor);
    return records;
  }
  apply(writes: unknown[], swapCommit?: string): Promise<any> { return this.request('com.atproto.repo.applyWrites', { repo: this.did, validate: false, writes, ...(swapCommit ? { swapCommit } : {}) }, true); }
  async upload(content: Uint8Array, mimeType = 'application/octet-stream'): Promise<any> {
    const res = await fetch(`${this.service}/xrpc/com.atproto.repo.uploadBlob`, { method: 'POST', headers: { authorization: `Bearer ${this.token}`, 'content-type': mimeType }, body: new Uint8Array(content), redirect: 'error', signal: AbortSignal.timeout(15_000) });
    return (await jsonResponse(res)).blob;
  }
  async binary(method: 'com.atproto.sync.getRepo' | 'com.atproto.sync.getBlob', extra: Record<string, string> = {}): Promise<Uint8Array> {
    const url = new URL(`/xrpc/${method}`, this.service);
    for (const [key, value] of Object.entries({ did: this.did, ...extra })) url.searchParams.set(key, value);
    const res = await fetch(url, { headers: { authorization: `Bearer ${this.token}` }, redirect: 'error', signal: AbortSignal.timeout(15_000) });
    if (!res.ok) { await res.body?.cancel(); throw new PdsError(res.status, 'ContentUnavailable'); }
    return boundedBody(res, method === 'com.atproto.sync.getBlob' ? 512 * 1024 : 128 * 1024 * 1024);
  }
}
