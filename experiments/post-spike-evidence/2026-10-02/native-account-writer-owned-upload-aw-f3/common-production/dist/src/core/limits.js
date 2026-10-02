/** Installed transport/storage policy. Semantic wire values also feed its descriptor. */
export const WIRE_LIMITS = Object.freeze({ version: 1, blockBytes: 64 * 1024, jsonBytes: 128 * 1024, depth: 32 });
export const SOURCE_LIMITS = Object.freeze({ bytes: 16 * 1024 * 1024, blocks: 2048 });
export const HOST_LIMITS = Object.freeze({
    historyEntries: 20000,
    retainedDefinitions: 32,
    bodyBytes: 32 * 1024 * 1024,
    applications: 32,
    drafts: 32,
    draftBytes: SOURCE_LIMITS.bytes,
    requestBytes: 768 * 1024,
});
//# sourceMappingURL=limits.js.map