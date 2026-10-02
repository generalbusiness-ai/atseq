import { Lexicons } from '@atproto/lexicon';
export declare const serviceSchemas: Lexicons;
export declare const BODY_LIMIT: number;
/** Locally counted size refusal, never inferred from a provider response. */
export declare class ResponseBytesLimit extends Error {
}
export declare function responseBytes(response: Response, limit?: number): Promise<Uint8Array<ArrayBuffer>>;
//# sourceMappingURL=api.d.ts.map