export type Json = null | boolean | number | string | Json[] | {
    [key: string]: Json;
};
export declare function safeName(name: string): boolean;
/** Validate without coercion; canonical JSON is for evaluation caps, not wire signing. */
export declare function canonicalJson(value: unknown, maxBytes?: number, maxDepth?: 32, charge?: (bytes: number) => void, engineArrays?: boolean, intermediate?: boolean): string;
export declare function jsonCopy(value: unknown, maxBytes?: number, engineArrays?: boolean): Json;
//# sourceMappingURL=values.d.ts.map