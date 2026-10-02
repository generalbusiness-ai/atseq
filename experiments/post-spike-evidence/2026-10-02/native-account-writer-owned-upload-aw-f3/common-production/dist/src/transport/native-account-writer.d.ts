import { type OAuthSessionHandle } from '../protocol/oauth.ts';
interface CallOptions {
    readonly signal?: AbortSignal;
}
export interface NativeAccountRecord {
    readonly uri: string;
    readonly cid: string;
    readonly value: unknown;
}
/** Internal standard account access only. Replies provide neither app permission nor proof. */
export declare class NativeAccountWriter {
    #private;
    private constructor();
    static open(handle: OAuthSessionHandle, expectedDid: string): Promise<NativeAccountWriter>;
    get did(): string;
    get(collectionName: string, rkey: string, options?: CallOptions): Promise<NativeAccountRecord>;
    list(collectionName: string, options?: CallOptions & {
        readonly cursor?: string;
        readonly limit?: number;
    }): Promise<{
        readonly records: readonly NativeAccountRecord[];
        readonly cursor?: string;
    }>;
    latestCommit(options?: CallOptions): Promise<{
        readonly cid: string;
        readonly rev: string;
    }>;
    applyConditional(writes: unknown[], swapCommit: string, options?: CallOptions): Promise<any>;
    upload(content: Uint8Array, mimeType?: string, options?: CallOptions): Promise<any>;
}
export {};
//# sourceMappingURL=native-account-writer.d.ts.map