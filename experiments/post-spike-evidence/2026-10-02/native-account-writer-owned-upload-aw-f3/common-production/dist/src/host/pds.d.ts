export { PdsError } from '../transport/pds-operations.ts';
export declare class PdsClient {
    readonly did: string;
    private token;
    private refreshJwt?;
    readonly service: string;
    private readonly operations;
    private refreshing?;
    private authenticationDead;
    constructor(service: string, did: string, token: string, refreshJwt?: string | undefined);
    /** Provision/login use this same bounded, origin-normalized transport. */
    static account(service: string, method: 'com.atproto.server.createSession' | 'com.atproto.server.createAccount', input: Record<string, unknown>): Promise<PdsClient>;
    private refresh;
    private fetch;
    request(method: string, input: Record<string, unknown>, write?: boolean): Promise<any>;
    latestCommit(): Promise<{
        cid: string;
        rev: string;
    }>;
    get(collection: string, rkey: string): Promise<{
        uri: string;
        cid: string;
        value: unknown;
    }>;
    list(collection: string): Promise<{
        uri: string;
        cid: string;
        value: any;
    }[]>;
    apply(writes: unknown[], swapCommit?: string): Promise<any>;
    applyConditional(writes: unknown[], swapCommit: string): Promise<any>;
    upload(content: Uint8Array, mimeType?: string): Promise<any>;
    binary(method: 'com.atproto.sync.getRepo' | 'com.atproto.sync.getBlob', extra?: Record<string, string>): Promise<Uint8Array>;
}
//# sourceMappingURL=pds.d.ts.map