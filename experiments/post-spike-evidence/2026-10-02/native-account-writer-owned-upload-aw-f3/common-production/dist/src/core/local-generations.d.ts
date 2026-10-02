/** Raw local storage only. No stored bytes or generation ID establish protocol trust. */
export type LocalRowKind = 'history' | 'requests' | 'descriptors' | 'outcomes' | 'authority' | 'sources' | 'evidence' | 'pending';
export interface LocalGeneration {
    id: number;
    metadata: Uint8Array;
}
export interface LocalChange {
    kind: LocalRowKind;
    key: string;
    value: Uint8Array | null;
}
export interface LocalPage {
    rows: {
        key: string;
        value: Uint8Array;
    }[];
    next?: string;
}
export interface LocalGenerations {
    current(): Promise<LocalGeneration | undefined>;
    read(id: number): Promise<LocalGeneration>;
    row(id: number, kind: LocalRowKind, key: string): Promise<Uint8Array | undefined>;
    page(id: number, kind: LocalRowKind, after?: string, limit?: number): Promise<LocalPage>;
    commit(expected: number | null, metadata: Uint8Array, changes: readonly LocalChange[]): Promise<number>;
    pin(id: number, reference: string): Promise<void>;
    release(reference: string): Promise<void>;
    close(): Promise<void>;
}
export declare class LocalStorageError extends Error {
    readonly code: 'input' | 'conflict' | 'quota' | 'missing' | 'closed' | 'corrupt' | 'busy';
    constructor(code: 'input' | 'conflict' | 'quota' | 'missing' | 'closed' | 'corrupt' | 'busy', message: string, cause?: unknown);
}
/** Operational limits; bytes count stored payloads/keys, not backend file overhead. */
export declare const LOCAL_STORAGE_LIMITS: Readonly<{
    bytes: number;
    rows: 100000;
    generations: 4;
    pins: 16;
    changes: 1000;
    rowBytes: number;
    metadataBytes: number;
    pageRows: 1000;
    pageBytes: number;
}>;
export type LocalLimits = {
    -readonly [K in keyof typeof LOCAL_STORAGE_LIMITS]: number;
};
export declare function storageLimits(values?: Partial<LocalLimits>): LocalLimits;
export declare function storageId(id: number): void;
export declare function storageKey(key: string): void;
export declare function storageKind(kind: LocalRowKind): void;
export declare function ownCommit(expected: number | null, metadata: Uint8Array, changes: readonly LocalChange[], limits: LocalLimits): {
    metadata: Uint8Array<ArrayBuffer>;
    changes: LocalChange[];
};
export declare function rowSize(change: LocalChange): number;
export declare function retainGenerations(current: number, pins: readonly number[], limits: LocalLimits): number[];
export declare function pageLimit(limit: number | undefined, limits: LocalLimits): number;
//# sourceMappingURL=local-generations.d.ts.map