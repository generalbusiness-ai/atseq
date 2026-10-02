import { InterpretationError } from '../core/profile.ts';
export interface SourceReader {
    get(cid: string): Promise<Uint8Array>;
}
export declare class SourceSizeError extends InterpretationError {
    readonly bytes: Uint8Array;
    constructor(bytes: Uint8Array);
}
export declare const SOURCE_POOL_BYTES: number;
export declare function readSource(reader: SourceReader, cid: string): Promise<Uint8Array>;
/** Standard CAR transport; owned blocks, bounded parsing, no network resolver. */
export declare class SourceBundle implements SourceReader {
    readonly root: string;
    private readonly blocks;
    private constructor();
    static read(carBytes: Uint8Array): Promise<SourceBundle>;
    /** Transport evidence for an activation attempt, including oversized definitions. */
    static readClosure(carBytes: Uint8Array): Promise<SourceBundle>;
    private static readWithin;
    static collect(root: string, ids: string[], reader: SourceReader): Promise<SourceBundle>;
    static collectClosure(root: string, ids: string[], reader: SourceReader): Promise<SourceBundle>;
    get(cid: string): Promise<Uint8Array>;
    identities(): string[];
    write(): Promise<Uint8Array>;
    writeClosure(): Promise<Uint8Array>;
    private writeWithin;
    static pack(manifest: Record<string, unknown>, files: Record<string, Uint8Array>): Promise<SourceBundle>;
}
/** One stable reader per app; new verified source bundles can arrive after opening. */
export declare class SourcePool implements SourceReader {
    private readonly blocks;
    add(bundle: SourceBundle): Promise<void>;
    get(cid: string): Promise<Uint8Array>;
}
//# sourceMappingURL=source.d.ts.map