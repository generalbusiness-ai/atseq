export declare const NATIVE_NSID: Readonly<{
    genesis: string;
    head: string;
    entry: string;
    definition: string;
    epoch: string;
    epochCurrent: string;
    grant: string;
    revoke: string;
    file: string;
    content: string;
    defs: string;
}>;
export declare const nativeRef: <T extends string>(name: T) => `ai.generalbusiness.atseq.defs#${T}`;
export declare const nativeLexicons: readonly {
    lexicon: 1;
    id: `${string}.${string}.${string}`;
    revision?: number | undefined;
    description?: string | undefined;
    defs: Record<string, import("@atproto/lexicon").LexUserType>;
}[];
/** Account syntax only; identity ownership/currentness requires retained I1 evidence. */
export declare function validateNativeAccountDid(value: unknown): asserts value is string;
/** Strict owned shape. This does not establish native publication or interpret authority. */
export declare function validateNativeShape(ref: string, value: unknown): void;
//# sourceMappingURL=native-schema.d.ts.map