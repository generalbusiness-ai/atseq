/** Bounded preview cache. Eviction never affects published source or device drafts. */
export declare class DraftStore {
    private readonly limits;
    private readonly queue;
    private readonly directory;
    constructor(directory: string, limits?: {
        count: number;
        bytes: number;
    });
    read(cid: string): Promise<Uint8Array>;
    put(cid: string, content: Uint8Array): Promise<void>;
}
//# sourceMappingURL=drafts.d.ts.map