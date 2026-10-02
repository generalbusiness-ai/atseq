import { type DidKeyString } from '@atcute/crypto';
/** Resource budgets, not a wire contract or an ATproto protocol maximum. */
export declare const NATIVE_PROOF_LIMITS: Readonly<{
    carBytes: number;
    blockBytes: number;
    carBlocks: 100000;
    headerBytes: number;
    nodeEntries: 4096;
    pathLoads: 64;
    treeLoads: 100000;
    pathCharacters: 1024;
    depth: 64;
}>;
export declare const NATIVE_CACHE_BROWSER: Readonly<{
    bytes: number;
    blocks: 50000;
}>;
export declare const NATIVE_CACHE_HOST: Readonly<{
    bytes: number;
    blocks: 400000;
}>;
type ProofLimits = {
    [K in keyof typeof NATIVE_PROOF_LIMITS]: number;
};
type CacheLimits = {
    [K in keyof typeof NATIVE_CACHE_BROWSER]: number;
};
/** Normalizes representation only. This neither observes nor trusts an account binding. */
export declare function normalizeRepoSigningKey(input: {
    type: 'secp256k1' | 'p256';
    publicKeyBytes: Uint8Array;
}): Promise<DidKeyString>;
export type NativeLookup = {
    kind: 'found';
    cid: string;
    bytes: Uint8Array<ArrayBuffer>;
} | {
    kind: 'absent';
} | {
    kind: 'missing';
    cid: string;
};
export type NativeTree = {
    kind: 'complete';
    records: number;
    nodeLoads: number;
} | {
    kind: 'missing';
    cid: string;
};
declare const brand: unique symbol;
export declare function assertAuthenticatedRepo(value: unknown): asserts value is AuthenticatedRepo;
export interface AuthenticatedRepo {
    readonly [brand]: true;
    readonly root: string;
    readonly did: string;
    readonly version: 3;
    readonly rev: string;
    readonly data: string;
    readonly signingKey: string;
    /** A sparse result says nothing about canonicality of unvisited branches. */
    lookup(path: string, expectedCid?: string): Promise<NativeLookup>;
    /** Checks every MST node and requires the corresponding record bytes. */
    validateTree(): Promise<NativeTree>;
}
export interface AuthenticateRepoOptions {
    carBytes: Uint8Array;
    expectedDid: string;
    trustedSigningKeyDid: string;
    expectedRoot?: string;
    blocks?: VerifiedRepoBlocks;
    limits?: Partial<ProofLimits>;
}
/** Private copied bytes; eviction produces missing evidence, never proven absence. */
export declare class VerifiedRepoBlocks {
    #private;
    constructor(limits?: Partial<CacheLimits>);
    get size(): number;
    get bytes(): number;
    authenticate(options: Omit<AuthenticateRepoOptions, 'blocks'>): Promise<AuthenticatedRepo>;
}
export declare function authenticateRepo(options: AuthenticateRepoOptions): Promise<AuthenticatedRepo>;
export {};
//# sourceMappingURL=native-proof.d.ts.map