import { deriveIdentityBinding, type IdentityEvidence } from '../protocol/identity-binding.ts';
import { type AuthenticatedRepo } from '../protocol/native-proof.ts';
import { NativeAnchor, verifyNativeEntryContents, type ByteContentReader, type NativeObservation, type NativeHead } from '../protocol/native-wire.ts';
declare const prefixBrand: unique symbol;
declare const extensionBrand: unique symbol;
export interface NativePrefix {
    readonly [prefixBrand]: true;
}
export interface NativePrefixExtension {
    readonly [extensionBrand]: true;
}
export interface NativePrefixPolicy {
    $type: string;
    algorithm: string;
    plcDirectory: string;
    allowWeb: boolean;
    checkpoint: string;
}
interface Row extends Awaited<ReturnType<typeof verifyNativeEntryContents>> {
    descriptor: NativeObservation | null;
    descriptorCid: string | null;
    retry: string | null;
    publicationAssurance: 'plc-audit-v1' | 'web-observation-v1';
    root: string;
    rev: string;
}
interface Owner {
    anchor: NativeAnchor;
    rows: Row[];
    requests: Map<string, number>;
    retries: Map<string, number>;
    descriptors: Map<string, number>;
    current: NativePrefix;
    observedFloor: {
        position: number;
        entry: string;
    };
    provenance: Map<string, {
        rev: string;
        binding: View['binding'];
        appIdentity: View['appIdentity'];
    }>;
    contradiction: {
        position: number;
        code: string;
    } | null;
    pendingFault: NativePrefix | null;
}
interface View {
    owner: Owner;
    head: Readonly<NativeHead>;
    repo: AuthenticatedRepo;
    policy: Readonly<NativePrefixPolicy>;
    binding: Awaited<ReturnType<typeof deriveIdentityBinding>>;
    appIdentity: {
        before: IdentityEvidence;
        after: IdentityEvidence;
    };
    staged?: {
        start: number;
        rows: Row[];
    };
    contradiction?: {
        position: number;
        code: string;
    };
    accepted?: boolean;
}
export interface NativePrefixPublication {
    anchor: NativeAnchor;
    appRepo: AuthenticatedRepo;
    reader: ByteContentReader;
    appIdentity: {
        before: IdentityEvidence;
        after: IdentityEvidence;
    };
    maximumDelta?: number;
}
/** Cold admission checks actual genesis and head; no synthetic zero-head proof. */
export declare function openNativePrefix(input: NativePrefixPublication): Promise<NativePrefix>;
export declare function stageNativePrefix(base: NativePrefix, input: NativePrefixPublication): Promise<NativePrefixExtension>;
/** Exact-base check is synchronous and is repeated after a caller's atomic local persistence. */
export declare function assertNativePrefixExtension(base: NativePrefix, candidate: NativePrefixExtension): void;
export declare function nativePrefixCandidate(candidate: NativePrefixExtension): NativePrefix;
export declare function acceptNativePrefix(base: NativePrefix, candidate: NativePrefixExtension): NativePrefix;
export declare function nativePrefixEntry(prefix: NativePrefix, position: number): {
    anchor: NativeAnchor;
    policy: Readonly<NativePrefixPolicy>;
    row: Row;
};
/** A compact interpreted state may know a larger publication floor than its frontier. */
export declare function assertNativePrefixPrior(prefix: NativePrefix, retained: NativePrefix): void;
export declare function nativePrefixStatus(prefix: NativePrefix): {
    app: string;
    genesis: string;
    head: Readonly<NativeHead>;
    root: string;
    rev: string;
    coverage: 'complete-from-genesis';
    contradiction: {
        position: number;
        code: string;
    } | null;
};
export declare function nativePrefixHas(prefix: NativePrefix, kind: 'requests' | 'retries' | 'descriptors', identity: string, boundary?: number): boolean;
/** Explicit historical diagnostic; normal lookups never copy these inventories. */
export declare function nativePrefixInventory(prefix: NativePrefix, boundary?: number): {
    requests: string[];
    retries: string[];
    consumedObservations: string[];
};
/** Explicit provenance export, with owned original I1 method bytes. It is not a new receipt proof packet. */
export declare function nativePrefixProvenance(prefix: NativePrefix, position: number): {
    rev: string;
    binding: View['binding'];
    appIdentity: View['appIdentity'];
    root: string;
};
export declare function nativePrefixWork(candidate: NativePrefixExtension): {
    signatureChecks: number;
    entryLoads: number;
    reusedEntries: number;
    descriptorLoads: number;
    indexReads: number;
    stagedIndexWrites: number;
    indexWrites: number;
    publicationLookups: number;
};
export declare function contradictNativePrefix(prefix: NativePrefix, position: number, code: string): void;
/** Verify incoming signed bytes before CID lookup, then tuple conflict. Original stored entry is never replaced. */
export declare function lookupNativeRetry(prefix: NativePrefix, request: unknown): Promise<{
    app: string;
    genesis: string;
    requestCid: string;
    entryCid: string;
    position: number;
    entry: import("../protocol/native-wire.ts").NativeEntry;
    root: string;
    rev: string;
    assurance: string;
} | null>;
export {};
//# sourceMappingURL=native-prefix.d.ts.map