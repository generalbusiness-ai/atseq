/** Installed transport/storage policy. Semantic wire values also feed its descriptor. */
export declare const WIRE_LIMITS: Readonly<{
    version: 1;
    blockBytes: number;
    jsonBytes: number;
    depth: 32;
}>;
export declare const SOURCE_LIMITS: Readonly<{
    bytes: number;
    blocks: 2048;
}>;
export declare const HOST_LIMITS: Readonly<{
    historyEntries: 20000;
    retainedDefinitions: 32;
    bodyBytes: number;
    applications: 32;
    drafts: 32;
    draftBytes: number;
    requestBytes: number;
}>;
//# sourceMappingURL=limits.d.ts.map