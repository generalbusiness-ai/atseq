import { createServer, type IncomingMessage } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { jsonToLex, lexToJson } from '@atproto/lexicon';
import { fromBytes } from '@atcute/cbor';
import { atomicFile } from './files.ts';
import { link } from '../protocol/wire.ts';
import { bytes, ProtocolError } from '../protocol/wire.ts';
import { serviceSchemas } from '../client/api.ts';
import { previewSource } from '../client/definition.ts';
import { InterpretationError } from '../runtime/profile.ts';
import { ApplicationHost } from './application.ts';
import { PdsError } from './pds.ts';

async function readInput(req: IncomingMessage): Promise<any> {
  if (req.headers['content-type']?.split(';')[0] !== 'application/json') throw new ProtocolError('input', 'Expected JSON');
  const chunks: Buffer[] = []; let size = 0;
  for await (const chunk of req) { size += chunk.length; if (size > 768 * 1024) throw new ProtocolError('input', 'Request exceeds 768 KiB'); chunks.push(chunk); }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks))); }
  catch { throw new ProtocolError('input', 'Expected valid JSON'); }
}
export async function startApplicationService(host: ApplicationHost, options: { port?: number; staticRoot?: string } = {}) {
  let origin = '';
  const server = createServer(async (req, res) => {
    const send = (status: number, value: unknown) => { res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }); res.end(JSON.stringify(value)); };
    try {
      if (req.headers.host !== new URL(origin).host || (req.headers.origin && req.headers.origin !== origin)) throw new ProtocolError('origin', 'Only this host origin is enabled');
      const url = new URL(req.url!, origin);
      if (!url.pathname.startsWith('/xrpc/')) {
        if (!options.staticRoot || req.method !== 'GET') { send(404, { error: 'InvalidRequest' }); return; }
        const root = resolve(options.staticRoot), path = resolve(root, '.' + (url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname)));
        if (!path.startsWith(root + sep)) throw new ProtocolError('path', 'Invalid static path');
        const body = await readFile(path), types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
        res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream', 'cache-control': 'no-cache', 'x-content-type-options': 'nosniff', 'content-security-policy': "default-src 'self'; script-src 'self'; worker-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'" }); res.end(body); return;
      }
      const method = url.pathname.slice(6), schema = serviceSchemas.getDef(method) as any;
      if (!schema || (schema.type === 'procedure' ? req.method !== 'POST' : req.method !== 'GET')) { send(404, { error: 'InvalidRequest', message: 'Unknown method' }); return; }
      const input = schema.type === 'procedure' ? await readInput(req) : Object.fromEntries(url.searchParams);
      try { if (schema.type === 'procedure') serviceSchemas.assertValidXrpcInput(method, jsonToLex(input)); else serviceSchemas.assertValidXrpcParams(method, input); }
      catch { throw new ProtocolError('input', 'Input does not match the method Lexicon'); }
      let output;
      switch (method) {
        case 'test.atseq.list': output = { apps: host.list() }; break;
        case 'test.atseq.validateDraft': output = { definition: (await previewSource(fromBytes(input.source))).definition }; break;
        case 'test.atseq.preview': {
          const preview = await previewSource(fromBytes(input.source), input.action, input.payload, input.state);
          await atomicFile(resolve(host.directory, 'drafts', preview.definition.cid + '.car'), fromBytes(input.source));
          output = { ...preview, previewUrl: `${origin}/?preview=${preview.definition.cid}` }; break;
        }
        case 'test.atseq.readDraft': link(input.definition); output = { source: bytes(await readFile(resolve(host.directory, 'drafts', input.definition + '.car'))) }; break;
        case 'test.atseq.create': output = await host.create(String(req.headers['idempotency-key'] ?? ''), fromBytes(input.source), input.activationKeys); break;
        case 'test.atseq.describe': output = await host.describe(input.app, input.genesis); break;
        case 'test.atseq.sync': { const result = await host.sync(input.app, input.genesis); output = { ...result, source: bytes(result.source) }; break; }
        case 'test.atseq.submit': output = await host.submit(fromBytes(input.block)); break;
        case 'test.atseq.query': output = await host.query(input.app, input.genesis, input.name, JSON.parse(input.params)); break;
        case 'test.atseq.receipt': output = await host.receipt(input.app, input.genesis, input.intent); if (!output) { send(404, { error: 'Unavailable', message: 'No verified receipt for this intent' }); return; } break;
        default: throw new ProtocolError('input', 'Unknown method');
      }
      send(200, lexToJson(serviceSchemas.assertValidXrpcOutput(method, jsonToLex(output))));
    } catch (error) {
      if (error instanceof ProtocolError || error instanceof InterpretationError) send(400, { error: 'InvalidRequest', message: `${error.code}: ${error.message}` });
      else if (error instanceof PdsError) send(503, { error: 'Unavailable', message: error.code });
      else if ((error as any).code === 'ENOENT') send(404, { error: 'Unavailable', message: 'Local content is missing' });
      else send(503, { error: 'Unavailable', message: 'Could not establish a valid result' });
    }
  });
  server.requestTimeout = 30_000; server.headersTimeout = 10_000;
  await new Promise<void>((done, reject) => { server.once('error', reject); server.listen(options.port ?? 0, '127.0.0.1', done); });
  const address = server.address(); if (!address || typeof address === 'string') throw new Error('No TCP address'); origin = `http://127.0.0.1:${address.port}`;
  return { url: origin, async close() { server.closeIdleConnections(); await new Promise<void>((done, reject) => server.close(e => e ? reject(e) : done())); await host.close(); } };
}
