import { responseBytes, ResponseBytesLimit } from './api.js';
import { link } from '../protocol/wire.js';
import { AtseqError } from '../core/errors.js';
const providerCodes = new Set([
    'InvalidSwap',
    'RecordNotFound',
    'RepoNotFound',
    'InvalidRequest',
    'ExpiredToken',
    'InvalidToken',
    'AuthenticationRequired',
    'AuthRequired',
    'InvalidIdentifier',
    'BlobTooLarge',
    'InvalidMimeType',
    'Forbidden',
]);
/** Bounded standard PDS responses; authentication belongs to the selected transport. */
export class PdsError extends Error {
    status;
    code;
    constructor(status, code) {
        super(`PDS ${status}: ${code}`);
        this.status = status;
        this.code = code;
        this.name = 'PdsError';
    }
}
export async function boundedPdsBody(response, limit, policy) {
    try {
        return await responseBytes(response, limit);
    }
    catch (error) {
        if (policy) {
            if (error instanceof ResponseBytesLimit)
                throw new AtseqError('input', 'PDS response exceeds byte limit');
            throw new AtseqError('content_unavailable', 'PDS response is unavailable');
        }
        throw new PdsError(502, 'ResponseUnavailable');
    }
}
export async function pdsJsonResponse(res, policy) {
    const raw = await boundedPdsBody(res, res.ok ? (policy ? 1024 * 1024 : 8 * 1024 * 1024) : 64 * 1024, policy);
    let value;
    try {
        value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(raw));
    }
    catch {
        throw new PdsError(res.ok ? 502 : res.status, 'InvalidResponse');
    }
    if (!res.ok)
        throw new PdsError(res.status, typeof value?.error === 'string' && (!policy || providerCodes.has(value.error)) ? value.error : 'RequestFailed');
    return value;
}
/** The single standard operation owner. This callback conveys transport, not app authority. */
export class PdsOperations {
    send;
    policy;
    constructor(send, policy) {
        this.send = send;
        this.policy = policy;
    }
    async request(method, input, write = false) {
        const res = await this.send(method, {
            method: write ? 'POST' : 'GET',
            ...(write ? { headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) } : {}),
        }, write ? undefined : input);
        return pdsJsonResponse(res, this.policy);
    }
    async latestCommit(did) {
        const value = await this.request('com.atproto.sync.getLatestCommit', { did });
        if (typeof value?.cid !== 'string' || !value.cid || typeof value?.rev !== 'string' || !value.rev)
            throw new PdsError(502, 'InvalidCommit');
        try {
            link(value.cid);
        }
        catch {
            throw new PdsError(502, 'InvalidCommit');
        }
        return { cid: value.cid, rev: value.rev };
    }
    get(did, collection, rkey) {
        return this.request('com.atproto.repo.getRecord', { repo: did, collection, rkey });
    }
    async listPage(did, collection, cursor, limit = 100) {
        const page = await this.request('com.atproto.repo.listRecords', {
            repo: did,
            collection,
            limit,
            reverse: this.policy ? true : false,
            cursor,
        });
        if (!Array.isArray(page.records) ||
            page.records.length > limit ||
            (page.cursor !== undefined && typeof page.cursor !== 'string'))
            throw new PdsError(502, 'InvalidPage');
        return page;
    }
    apply(did, writes, swapCommit) {
        return this.request('com.atproto.repo.applyWrites', { repo: did, validate: false, writes, ...(swapCommit ? { swapCommit } : {}) }, true);
    }
    async applyConditional(did, writes, swapCommit) {
        // An untyped caller or malformed remote reply must never remove this condition.
        if (typeof swapCommit !== 'string' || !swapCommit)
            throw new PdsError(502, 'InvalidCommit');
        try {
            link(swapCommit);
        }
        catch {
            throw new PdsError(502, 'InvalidCommit');
        }
        return this.apply(did, writes, swapCommit);
    }
    async upload(content, mimeType = 'application/octet-stream') {
        const res = await this.send('com.atproto.repo.uploadBlob', {
            method: 'POST',
            headers: { 'content-type': mimeType },
            body: new Uint8Array(content),
        });
        return (await pdsJsonResponse(res, this.policy)).blob;
    }
}
//# sourceMappingURL=pds-operations.js.map