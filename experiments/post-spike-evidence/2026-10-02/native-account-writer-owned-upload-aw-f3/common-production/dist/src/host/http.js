import { HOST_LIMITS } from '../core/limits.js';
import { readInput } from './input.js';
import { NSID } from '../core/nsids.js';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { jsonToLex, lexToJson } from '@atproto/lexicon';
import { fromBytes } from '@atcute/cbor';
import { DraftStore } from './drafts.js';
import { link } from '../protocol/wire.js';
import { bytes, ProtocolError } from '../protocol/wire.js';
import { serviceSchemas } from '../transport/api.js';
import { previewSource } from '../application/definition.js';
import { ApplicationHost } from './application.js';
import { hostFailure } from './errors.js';
import { HostError } from './errors.js';
import { hostToken, acceptsHostToken } from './token.js';
export async function startApplicationService(host, options = {}) {
    const credential = await hostToken(host.directory), drafts = new DraftStore(host.directory);
    let origin = '';
    const server = createServer(async (req, res) => {
        const send = (status, value) => {
            res.writeHead(status, {
                'content-type': 'application/json',
                'cache-control': 'no-store',
                'x-content-type-options': 'nosniff',
            });
            res.end(JSON.stringify(value));
        };
        try {
            if (req.headers.host !== new URL(origin).host || (req.headers.origin && req.headers.origin !== origin))
                throw new ProtocolError('origin', 'Only this host origin is enabled');
            const url = new URL(req.url, origin);
            if (!url.pathname.startsWith('/xrpc/')) {
                if (!options.staticRoot || req.method !== 'GET') {
                    send(404, { error: 'InvalidRequest' });
                    return;
                }
                const root = resolve(options.staticRoot), path = resolve(root, '.' + (url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname)));
                if (!path.startsWith(root + sep))
                    throw new ProtocolError('path', 'Invalid static path');
                let body;
                try {
                    body = await readFile(path);
                }
                catch (error) {
                    if (error.code === 'ENOENT')
                        throw new HostError('static_not_found', 404, 'Static file not found');
                    throw error;
                }
                const types = {
                    '.html': 'text/html',
                    '.js': 'text/javascript',
                    '.css': 'text/css',
                    '.svg': 'image/svg+xml',
                };
                res.writeHead(200, {
                    'content-type': types[extname(path)] ?? 'application/octet-stream',
                    'cache-control': 'no-cache',
                    'x-content-type-options': 'nosniff',
                    'content-security-policy': "default-src 'self'; script-src 'self'; worker-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
                });
                res.end(body);
                return;
            }
            const method = url.pathname.slice(6), schema = serviceSchemas.getDef(method);
            if (!schema || (schema.type === 'procedure' ? req.method !== 'POST' : req.method !== 'GET')) {
                send(404, { error: 'InvalidRequest', message: 'Unknown method' });
                return;
            }
            if (schema.type === 'procedure' &&
                method !== NSID.submit &&
                !acceptsHostToken(req.headers.authorization, credential.token))
                throw new HostError('host_token', 401, 'This procedure requires the host token');
            const input = schema.type === 'procedure'
                ? await readInput(req, HOST_LIMITS.requestBytes)
                : Object.fromEntries(url.searchParams);
            if (method === NSID.describe && Object.hasOwn(input, 'includeSource')) {
                if (!['true', 'false'].includes(input.includeSource))
                    throw new ProtocolError('input', 'includeSource must be true or false');
                input.includeSource = input.includeSource === 'true';
            }
            try {
                if (schema.type === 'procedure')
                    serviceSchemas.assertValidXrpcInput(method, jsonToLex(input));
                else
                    serviceSchemas.assertValidXrpcParams(method, input);
            }
            catch {
                throw new ProtocolError('input', 'Input does not match the method Lexicon');
            }
            let output;
            switch (method) {
                case NSID.list:
                    output = { apps: host.list() };
                    break;
                case NSID.validateDraft:
                    output = { definition: (await previewSource(fromBytes(input.source))).definition };
                    break;
                case NSID.preview: {
                    const preview = await previewSource(fromBytes(input.source), input.action, input.payload, input.state);
                    await drafts.put(preview.definition.cid, fromBytes(input.source));
                    output = {
                        ...preview,
                        previewUrl: `${origin}/?preview=${preview.definition.cid}`,
                    };
                    break;
                }
                case NSID.readDraft:
                    link(input.definition);
                    output = { source: bytes(await drafts.read(input.definition)) };
                    break;
                case NSID.create:
                    output = await host.create(String(req.headers['idempotency-key'] ?? ''), fromBytes(input.source), input.activationKeys);
                    break;
                case NSID.describe:
                    output = await host.describe(input.app, input.genesis, input.includeSource === true);
                    break;
                case NSID.sync: {
                    const result = await host.sync(input.app, input.genesis);
                    output = {
                        ...result,
                        source: bytes(result.source),
                        candidates: result.candidates.map((candidate) => ({ ...candidate, source: bytes(candidate.source) })),
                    };
                    break;
                }
                case NSID.compareDefinition:
                    output = await host.compareDefinition(input.app, input.genesis, input.expected, fromBytes(input.source));
                    break;
                case NSID.stageDefinition:
                    output = await host.stageDefinition(input.app, input.genesis, input.expected, fromBytes(input.source));
                    break;
                case NSID.submit:
                    output = await host.submit(fromBytes(input.block));
                    break;
                case NSID.query: {
                    let params;
                    try {
                        params = JSON.parse(input.params);
                    }
                    catch {
                        throw new ProtocolError('input', 'Query params must be valid JSON');
                    }
                    output = await host.query(input.app, input.genesis, input.name, params);
                    break;
                }
                case NSID.receipt:
                    output = await host.receipt(input.app, input.genesis, input.intent);
                    if (!output) {
                        send(404, { error: 'Unavailable', message: 'No verified receipt for this intent' });
                        return;
                    }
                    break;
                default:
                    throw new ProtocolError('input', 'Unknown method');
            }
            send(200, lexToJson(serviceSchemas.assertValidXrpcOutput(method, jsonToLex(output))));
        }
        catch (error) {
            const failure = hostFailure(error);
            send(failure.status, failure.body);
        }
    });
    server.requestTimeout = 30_000;
    server.headersTimeout = 10_000;
    await new Promise((done, reject) => {
        server.once('error', reject);
        server.listen(options.port ?? 0, '127.0.0.1', done);
    });
    const address = server.address();
    if (!address || typeof address === 'string')
        throw new Error('No TCP address');
    origin = `http://127.0.0.1:${address.port}`;
    return {
        url: origin,
        tokenFile: credential.path,
        async close() {
            server.closeIdleConnections();
            await new Promise((done, reject) => server.close((e) => (e ? reject(e) : done())));
            await host.close();
        },
    };
}
//# sourceMappingURL=http.js.map