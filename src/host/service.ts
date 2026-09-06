import { createServer, type IncomingMessage } from 'node:http';
import { Lexicons, jsonToLex, lexToJson } from '@atproto/lexicon';
import { fromBytes } from '@atcute/cbor';
import { frameworkLexicons } from '../protocol/schemas.ts';
import { ProtocolError, WIRE } from '../protocol/wire.ts';
import type { Anchor } from '../protocol/log.ts';
import { PdsError } from './pds.ts';
import type { Sequencer } from './sequencer.ts';

const schemas = new Lexicons(structuredClone(frameworkLexicons));
async function readInput(req: IncomingMessage): Promise<any> {
  if (req.headers['content-type']?.split(';')[0] !== 'application/json') throw new ProtocolError('input', 'Expected JSON');
  const chunks: Buffer[] = []; let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > WIRE.jsonBytes) throw new ProtocolError('input', 'Request exceeds the wire limit');
    chunks.push(chunk);
  }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks))); }
  catch { throw new ProtocolError('input', 'Expected valid JSON'); }
}
/** S2 transport methods only. A receipt is never a claim of domain effect. */
export async function startSequencerService(sequencer: Sequencer, anchor: Anchor, port = 0) {
  const server = createServer(async (req, res) => {
    const send = (status: number, value: unknown) => {
      res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      res.end(JSON.stringify(value));
    };
    try {
      if (req.headers.origin) throw new ProtocolError('input', 'Cross-origin access is not enabled');
      const url = new URL(req.url!, 'http://127.0.0.1');
      const method = url.pathname.replace(/^\/xrpc\//, '');
      let output: any;
      if (method === 'test.atseq.submit' && req.method === 'POST') {
        const input = await readInput(req);
        try { schemas.assertValidXrpcInput(method, jsonToLex(input)); }
        catch { throw new ProtocolError('input', 'Input does not match the method Lexicon'); }
        output = { ...await sequencer.submit(fromBytes(input.block)), frontier: null };
      } else if (method === 'test.atseq.receipt' && req.method === 'GET') {
        const params = Object.fromEntries(url.searchParams);
        try { schemas.assertValidXrpcParams(method, params); }
        catch { throw new ProtocolError('input', 'Parameters do not match the method Lexicon'); }
        if (params.app !== anchor.genesis.app || params.genesis !== anchor.cid) throw new ProtocolError('target', 'Receipt query targets another anchor');
        const found = await sequencer.lookup(params.intent!);
        if (!found) { send(404, { error: 'Unavailable', message: 'No verified receipt for this intent' }); return; }
        output = { ...found, frontier: null, outcome: { $type: 'test.atseq.defs#pending' } };
      } else { send(404, { error: 'InvalidRequest', message: 'Method is not implemented' }); return; }
      const valid = schemas.assertValidXrpcOutput(method, jsonToLex(output));
      send(200, lexToJson(valid));
    } catch (error) {
      if (error instanceof PdsError) send(503, { error: 'Unavailable', message: error.code });
      else if (error instanceof ProtocolError) send(400, { error: error.code === 'input' ? 'InvalidRequest' : 'VerificationFailed', message: error.code });
      else send(503, { error: 'Unavailable', message: 'The service could not establish a verified result' });
    }
  });
  server.requestTimeout = 15_000; server.headersTimeout = 10_000;
  await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Expected local TCP address');
  return {
    url: `http://127.0.0.1:${address.port}`,
    async close() { server.closeIdleConnections(); await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); await sequencer.close(); },
  };
}
