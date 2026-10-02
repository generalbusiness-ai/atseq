export declare const frameworkLexicons: readonly {
    lexicon: 1;
    id: `${string}.${string}.${string}`;
    revision?: number | undefined;
    description?: string | undefined;
    defs: Record<string, import("@atproto/lexicon").LexUserType>;
}[];
/** Lexicon owns the shape; v1 additionally closes framework objects to extra keys. */
export declare function validateFramework(ref: string, value: unknown): void;
//# sourceMappingURL=schemas.d.ts.map