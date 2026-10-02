/** Native policy changes decoding limits, never authentication or app authority. */
export interface PdsResponsePolicy {
    readonly native: true;
}
/** Bounded standard PDS responses; authentication belongs to the selected transport. */
export declare class PdsError extends Error {
    readonly status: number;
    readonly code: string;
    constructor(status: number, code: string);
}
export declare function boundedPdsBody(response: Response, limit: number, policy?: PdsResponsePolicy): Promise<Uint8Array>;
export declare function pdsJsonResponse(res: Response, policy?: PdsResponsePolicy): Promise<any>;
/** The single standard operation owner. This callback conveys transport, not app authority. */
export declare class PdsOperations {
    private readonly send;
    private readonly policy?;
    constructor(send: (method: string, init: RequestInit, params?: Record<string, unknown>) => Promise<Response>, policy?: PdsResponsePolicy | undefined);
    request(method: string, input: Record<string, unknown>, write?: boolean): Promise<any>;
    latestCommit(did: string): Promise<{
        cid: string;
        rev: string;
    }>;
    get(did: string, collection: string, rkey: string): Promise<{
        uri: string;
        cid: string;
        value: unknown;
    }>;
    listPage(did: string, collection: string, cursor?: string, limit?: number): Promise<{
        records: {
            uri: string;
            cid: string;
            value: any;
        }[];
        cursor?: string;
    }>;
    apply(did: string, writes: unknown[], swapCommit?: string): Promise<any>;
    applyConditional(did: string, writes: unknown[], swapCommit: string): Promise<any>;
    upload(content: Uint8Array, mimeType?: string): Promise<any>;
}
//# sourceMappingURL=pds-operations.d.ts.map