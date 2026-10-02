import { methodNsid } from '../core/nsids.js';
import { jsonToLex, lexToJson } from '@atproto/lexicon';
import { serviceSchemas, BODY_LIMIT, responseBytes } from '../transport/api.js';
import { validateDefinitionInfo } from './definition.js';
export { serviceSchemas, BODY_LIMIT, responseBytes } from '../transport/api.js';
export class ApiError extends Error {
    status;
    code;
    permanent;
    constructor(status, code, message, permanent = false) {
        super(message);
        this.status = status;
        this.code = code;
        this.permanent = permanent;
    }
}
export class AtseqClient {
    hostToken;
    origin;
    constructor(origin, hostToken) {
        this.hostToken = hostToken;
        const url = new URL(origin);
        if (!['http:', 'https:'].includes(url.protocol) ||
            url.username ||
            url.password ||
            url.pathname !== '/' ||
            url.hash ||
            url.search)
            throw new Error('Expected an Atseq host origin');
        if (url.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
            throw new Error('Nonlocal host requires HTTPS');
        this.origin = url.origin;
    }
    setHostToken(token) {
        this.hostToken = token;
    }
    async call(name, input = {}, creationId) {
        const method = methodNsid(name), schema = serviceSchemas.getDef(method);
        if (!schema)
            throw new Error('Unknown Atseq method');
        const write = schema.type === 'procedure', url = new URL(`/xrpc/${method}`, this.origin);
        if (write)
            serviceSchemas.assertValidXrpcInput(method, jsonToLex(input));
        else {
            serviceSchemas.assertValidXrpcParams(method, input);
            for (const [key, value] of Object.entries(input))
                url.searchParams.set(key, String(value));
        }
        const response = await fetch(url, {
            method: write ? 'POST' : 'GET',
            headers: {
                ...(write ? { 'content-type': 'application/json' } : {}),
                ...(write && this.hostToken ? { authorization: `Bearer ${this.hostToken}` } : {}),
                ...(creationId ? { 'idempotency-key': creationId } : {}),
            },
            ...(write ? { body: JSON.stringify(input) } : {}),
            redirect: 'error',
            signal: AbortSignal.timeout(30_000),
        });
        let value;
        try {
            value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(await responseBytes(response, response.ok ? BODY_LIMIT : 65536)));
        }
        catch (e) {
            throw new ApiError(response.status, 'InvalidResponse', e.message);
        }
        if (!response.ok)
            throw new ApiError(response.status, value.code ?? value.error ?? 'Unavailable', value.message ?? 'Host request failed', value.permanent === true);
        const output = lexToJson(serviceSchemas.assertValidXrpcOutput(method, jsonToLex(value)));
        if (name === 'describe')
            output.definition = await validateDefinitionInfo(output.definition);
        return output;
    }
}
//# sourceMappingURL=api.js.map