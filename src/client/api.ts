import { Lexicons, jsonToLex, lexToJson, type LexiconDoc } from '@atproto/lexicon';
import { frameworkLexicons } from '../protocol/schemas.ts';
import compareDefinition from '../../lexicons/test/atseq/compareDefinition.json';
import stageDefinition from '../../lexicons/test/atseq/stageDefinition.json';
import readDraft from '../../lexicons/test/atseq/readDraft.json';
import list from '../../lexicons/test/atseq/list.json';
import sync from '../../lexicons/test/atseq/sync.json';
import validateDraft from '../../lexicons/test/atseq/validateDraft.json';
import preview from '../../lexicons/test/atseq/preview.json';

export const serviceSchemas = new Lexicons([...structuredClone(frameworkLexicons), list, sync, validateDraft, preview, readDraft, compareDefinition, stageDefinition] as LexiconDoc[]);
export const BODY_LIMIT = 32 * 1024 * 1024;
export async function responseBytes(response: Response, limit = BODY_LIMIT) {
  const reader = response.body?.getReader(), chunks: Uint8Array[] = []; let size = 0;
  if (reader) try { for (;;) { const { value, done } = await reader.read(); if (done) break; size += value.length; if (size > limit) throw new Error('Response exceeds transport limit'); chunks.push(value); } }
  finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
  const result = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}
export class ApiError extends Error { constructor(readonly status: number, readonly code: string, message: string) { super(message); } }
export class AtseqClient {
  readonly origin: string;
  constructor(origin: string) {
    const url = new URL(origin);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.hash || url.search) throw new Error('Expected an Atseq host origin');
    if (url.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error('Nonlocal host requires HTTPS');
    this.origin = url.origin;
  }
  async call(name: string, input: Record<string, unknown> = {}, creationId?: string): Promise<any> {
    const method = `test.atseq.${name}`, schema = serviceSchemas.getDef(method) as any;
    if (!schema) throw new Error('Unknown Atseq method');
    const write = schema.type === 'procedure', url = new URL(`/xrpc/${method}`, this.origin);
    if (write) serviceSchemas.assertValidXrpcInput(method, jsonToLex(input));
    else { serviceSchemas.assertValidXrpcParams(method, input); for (const [key, value] of Object.entries(input)) url.searchParams.set(key, String(value)); }
    const response = await fetch(url, { method: write ? 'POST' : 'GET', headers: { ...(write ? { 'content-type': 'application/json' } : {}), ...(creationId ? { 'idempotency-key': creationId } : {}) }, ...(write ? { body: JSON.stringify(input) } : {}), redirect: 'error', signal: AbortSignal.timeout(30_000) });
    let value;
    try { value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(await responseBytes(response, response.ok ? BODY_LIMIT : 65536))); }
    catch (e) { throw new ApiError(response.status, 'InvalidResponse', (e as Error).message); }
    if (!response.ok) throw new ApiError(response.status, value.error ?? 'Unavailable', value.message ?? 'Host request failed');
    return lexToJson(serviceSchemas.assertValidXrpcOutput(method, jsonToLex(value)));
  }
}
