import { create, CODEC_RAW, CODEC_DCBOR, toString } from '@atcute/cid';
import { encode } from '@atcute/cbor';
import { OAuthFixture, OAUTH_DID } from './oauth-fixture.ts';

const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });
// Synthetic standard PDS records can exceed Atseq's native-record wire cap.
const contentCid = async (value: unknown) => toString(await create(CODEC_DCBOR, encode(value)));
export const WRITER_COLLECTION = 'ai.generalbusiness.atseq.synthetic';
/** Synthetic AS/resource replies only; the OAuth client itself is maintained. */
export class NativeWriterFixture extends OAuthFixture {
  // The base constructor initializes its fetch before these subclass fields.
  readonly baseFetch = (this as OAuthFixture).fetch;
  commit = '';
  readonly records = new Map<string, unknown>();
  readonly bodies: Uint8Array[] = [];
  readonly paths: string[] = [];
  refreshPadding = 0;
  overrideResponse?: (request: Request, body: Uint8Array) => Promise<Response> | Response;
  override readonly fetch: typeof globalThis.fetch = async (input, init) => {
    const request = new Request(input, init);
    const path = new URL(request.url).pathname;
    const resource = path.startsWith('/xrpc/');
    const body = resource ? new Uint8Array(await request.clone().arrayBuffer()) : new Uint8Array();
    if (resource) {
      this.bodies.push(body);
      this.paths.push(path);
    }
    const base = await this.baseFetch(request);
    if (!resource && path === '/token' && base.ok && this.refreshPadding) {
      const token = await base.json();
      token.refresh_token = 'synthetic-refresh-' + 'x'.repeat(this.refreshPadding);
      return json(token);
    }
    if (!resource || !base.ok || this.resourceBytes) return base;
    if (this.overrideResponse) return this.overrideResponse(request, body);
    const url = new URL(request.url);
    if (path.endsWith('getLatestCommit')) return json({ cid: this.commit, rev: 'synthetic-rev' });
    if (path.endsWith('getRecord')) {
      const rkey = url.searchParams.get('rkey')!;
      const value = this.records.get(rkey);
      if (value === undefined) return json({ error: 'RecordNotFound' }, 400);
      return json({ uri: `at://${OAUTH_DID}/${WRITER_COLLECTION}/${rkey}`, cid: await contentCid(value), value });
    }
    if (path.endsWith('listRecords')) {
      const start = Number(url.searchParams.get('cursor') ?? 0);
      const limit = Number(url.searchParams.get('limit'));
      const all = [...this.records].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
      const records = await Promise.all(
        all.slice(start, start + limit).map(async ([rkey, value]) => ({
          uri: `at://${OAUTH_DID}/${WRITER_COLLECTION}/${rkey}`,
          cid: await contentCid(value),
          value,
        })),
      );
      return json({ records, ...(start + limit < all.length ? { cursor: String(start + limit) } : {}) });
    }
    if (path.endsWith('applyWrites')) {
      const value = JSON.parse(new TextDecoder().decode(body));
      if (value.repo !== OAUTH_DID || value.swapCommit !== this.commit) return json({ error: 'InvalidSwap' }, 400);
      for (const write of value.writes) this.records.set(write.rkey, write.value);
      this.commit = await contentCid({ previous: this.commit, writes: value.writes });
      return json({
        commit: { cid: this.commit, rev: 'synthetic-rev' },
        results: await Promise.all(
          value.writes.map(async (write: any) => ({
            $type: 'com.atproto.repo.applyWrites#createResult',
            uri: `at://${OAUTH_DID}/${write.collection}/${write.rkey}`,
            cid: await contentCid(write.value),
          })),
        ),
      });
    }
    if (path.endsWith('uploadBlob'))
      return json({
        blob: {
          $type: 'blob',
          ref: { $link: toString(await create(CODEC_RAW, body)) },
          mimeType: request.headers.get('content-type'),
          size: body.length,
        },
      });
    return base;
  };
  async initialize() {
    this.commit = await contentCid({ synthetic: 'initial-commit' });
    this.records.set('first', { $type: WRITER_COLLECTION, text: 'first' });
    return this;
  }
}
