import { safeFetchWrap } from '@atproto-labs/fetch-node';
import { AtseqError } from '../core/errors.js';
import { assertDependencies } from '../core/dependencies.js';
/** One bounded observation reservation, shared across complete retries. No credentials or redirects. */
export class IdentityFetch {
    deadline = AbortSignal.timeout(30_000);
    fetch;
    requests = 0;
    bytes = 0;
    active = false;
    constructor() {
        assertDependencies();
        this.fetch = safeFetchWrap({
            ssrfProtection: true,
            allowHttp: false,
            allowPrivateIps: false,
            allowData: false,
            allowCustomPort: true,
            allowIpHost: true,
            allowImplicitRedirect: false,
            timeout: 30_000,
            responseMaxSize: 32 * 1024 * 1024,
        });
    }
    /** Check the same reservation after offline verification or evidence construction. */
    assertActive(signal) {
        if (this.deadline.aborted || signal?.aborted)
            throw new AtseqError('content_unavailable', 'Identity observation deadline or cancellation reached');
    }
    async bytesFrom(url, maximumBytes, signal) {
        if (!Number.isSafeInteger(maximumBytes) || maximumBytes < 1 || maximumBytes > 32 * 1024 * 1024)
            throw new AtseqError('input', 'Invalid identity fetch byte budget');
        if (this.active)
            throw new AtseqError('input', 'Identity observation fetches must be sequential');
        const target = new URL(url);
        if (target.username || target.password || target.hash)
            throw new AtseqError('input', 'Identity URL contains credentials or fragment');
        if (++this.requests > 64 || this.bytes >= 32 * 1024 * 1024)
            throw new AtseqError('content_unavailable', 'Identity observation request budget exceeded');
        this.active = true;
        try {
            const response = await this.fetch(target, {
                method: 'GET',
                redirect: 'error',
                cache: 'no-store',
                credentials: 'omit',
                signal: signal ? AbortSignal.any([signal, this.deadline]) : this.deadline,
                headers: { accept: 'application/json, application/vnd.ipld.car' },
            });
            if (!response.ok) {
                await response.body?.cancel();
                throw new AtseqError('content_unavailable', 'Identity evidence response is unavailable');
            }
            const reader = response.body?.getReader(), chunks = [];
            let size = 0;
            try {
                if (reader)
                    for (;;) {
                        let result;
                        try {
                            result = await reader.read();
                        }
                        catch (error) {
                            // Headers have arrived. An unreadable remote body is unavailable
                            // evidence; our validation and budget checks stay outside this phase.
                            if (error instanceof AtseqError)
                                throw error;
                            throw new AtseqError('content_unavailable', 'Identity evidence body is unavailable');
                        }
                        const { done, value } = result;
                        if (done)
                            break;
                        size += value.length;
                        this.bytes += value.length;
                        if (size > maximumBytes || this.bytes > 32 * 1024 * 1024)
                            throw new AtseqError('content_unavailable', 'Identity evidence response exceeds byte budget');
                        chunks.push(value);
                    }
            }
            finally {
                if (reader) {
                    await reader.cancel().catch(() => { });
                    reader.releaseLock();
                }
            }
            const raw = new Uint8Array(size);
            let offset = 0;
            for (const chunk of chunks) {
                raw.set(chunk, offset);
                offset += chunk.length;
            }
            return raw;
        }
        catch (error) {
            if ((error instanceof TypeError && error.message === 'fetch failed') ||
                (error instanceof Error &&
                    ['FetchRequestError', 'FetchResponseError'].includes(error.constructor.name) &&
                    Number.isSafeInteger(error.statusCode)) ||
                (error instanceof DOMException && ['AbortError', 'TimeoutError'].includes(error.name)))
                throw new AtseqError('content_unavailable', 'Identity evidence fetch is unavailable');
            throw error;
        }
        finally {
            this.active = false;
        }
    }
}
//# sourceMappingURL=identity-fetch.js.map