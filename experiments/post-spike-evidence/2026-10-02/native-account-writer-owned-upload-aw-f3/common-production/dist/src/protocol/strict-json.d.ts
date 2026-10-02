/** Pure lexical facts. Each consumer decides whether a bound is normative or local. */
export declare class StrictJsonError extends Error {
    readonly reason: 'input' | 'bytes' | 'depth' | 'bom' | 'utf8' | 'duplicate' | 'syntax';
    constructor(reason: 'input' | 'bytes' | 'depth' | 'bom' | 'utf8' | 'duplicate' | 'syntax', message: string);
}
/** One strict interpretation of the exact retained bytes, shared online/offline. */
export declare function parseStrictJson(raw: Uint8Array, maximumBytes: number, maximumDepth?: number): unknown;
//# sourceMappingURL=strict-json.d.ts.map