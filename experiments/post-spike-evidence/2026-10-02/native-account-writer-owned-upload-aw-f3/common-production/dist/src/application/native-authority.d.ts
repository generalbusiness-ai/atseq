import { type Json } from '../core/values.ts';
import { type NativeOutcomeData } from '../protocol/native-outcome.ts';
import type { NativeSourceReader, NativeSourceReadOptions } from '../definition/native-source-transport.ts';
import { AtseqError } from '../core/errors.ts';
import { NativeAnchor, type ControlAppointment, type NativeGrant, type NativeEntry } from '../protocol/native-wire.ts';
import { type AuthenticatedAuthorityEntry } from './native-authority-evidence.ts';
export interface AuthorityEpochRow {
    cid: string;
    id: string;
    previous: string | null;
}
export interface AuthorityFloor {
    cid: string;
    root: string;
    rev: string;
    signingKeyDid: string;
    pdsOrigin: string;
    assuranceClass: 'plc-audit-v1' | 'web-observation-v1';
}
export interface AuthorityPrincipalRow {
    principal: string;
    epoch: string | null;
    epochs: AuthorityEpochRow[];
    observation: AuthorityFloor | null;
}
export interface AuthorityGrantRow {
    principal: string;
    id: string;
    cid: string | null;
    grant: NativeGrant | null;
    revoked: boolean;
}
export interface AuthorityRoleRow {
    principal: string;
    role: string;
    enabled: boolean;
    revision: string;
}
/** Owned compact authority projection. Parsed DATA never accepts live state. */
export interface NativeAuthoritySnapshot {
    format: 'atseq-native-authority';
    version: 1;
    app: string;
    genesis: string;
    activeDefinition: string;
    frontier: {
        position: number;
        entry: string;
    };
    control: {
        tip: string;
        appointments: ControlAppointment[];
        owner: string | null;
        recoverGovernance: boolean;
    };
    roles: AuthorityRoleRow[];
    principals: AuthorityPrincipalRow[];
    grants: AuthorityGrantRow[];
}
declare const stateBrand: unique symbol;
export interface NativeAuthorityState {
    readonly [stateBrand]: true;
}
import { nativePrefixStatus, lookupNativeRetry, type NativePrefix, type NativePrefixPublication } from './native-prefix.ts';
export type NativeAuthorityOutcome = {
    decision: 'effective';
} | {
    decision: 'ineffective';
    reason: string;
};
/** Explicit external app/genesis trust choice; no native publication inferred here. */
export declare function openNativeAuthority(anchor: NativeAnchor): Promise<NativeAuthorityState>;
/** An owned projection. Changing it cannot change the accepted authority. */
export declare function nativeAuthoritySnapshot(state: NativeAuthorityState): NativeAuthoritySnapshot;
/** Content/signature must be checked first. This preflight does not authenticate publication. */
export declare function assertNativeAuthorityContext(prior: NativeAuthorityState, entry: NativeEntry): void;
export declare function nativeAuthorityFrontier(state: NativeAuthorityState): {
    position: number;
    entry: string;
};
export declare function nativeAuthorityPrefix(state: NativeAuthorityState): NativePrefix | null;
/** Explicit full historical DATA export; no acceptance factory. */
export declare function nativeAuthorityHistory(state: NativeAuthorityState): {
    requests: string[];
    retries: string[];
    consumedObservations: string[];
    format: 'atseq-native-authority';
    version: 1;
    app: string;
    genesis: string;
    activeDefinition: string;
    frontier: {
        position: number;
        entry: string;
    };
    control: {
        tip: string;
        appointments: ControlAppointment[];
        owner: string | null;
        recoverGovernance: boolean;
    };
    roles: AuthorityRoleRow[];
    principals: AuthorityPrincipalRow[];
    grants: AuthorityGrantRow[];
};
/** Atomic pure transition: any thrown missing/invalid/runtime failure leaves prior unchanged. */
export declare function interpretNativeAuthority(prior: NativeAuthorityState, authenticated: AuthenticatedAuthorityEntry): {
    state: NativeAuthorityState;
    outcome: NativeAuthorityOutcome;
};
export interface NativeApplicationProjection {
    format: 'atseq-native-application';
    version: 1;
    app: string;
    genesis: string;
    definition: string;
    state: Json;
    authority: NativeAuthoritySnapshot;
    publication: ReturnType<typeof nativePrefixStatus> | null;
    outcomes: {
        position: number;
        entry: string;
        request: string;
        outcome: NativeOutcomeData;
    }[];
}
/** A trusted local adapter could not determine whether its transaction committed.
 * This signal only blocks the instance; it cannot authorize restore or acceptance. */
export declare class NativePersistenceUncertain extends AtseqError {
    constructor();
}
type ProcessInput = Omit<NativePrefixPublication, 'anchor'> & {
    entry: unknown;
};
export interface NativeApplication {
    snapshot(): NativeApplicationProjection;
    prefix(): NativePrefix | null;
    publication(): ReturnType<typeof nativePrefixStatus> | null;
    retry(request: unknown): Promise<{
        receipt: Awaited<ReturnType<typeof lookupNativeRetry>>;
        outcome: NativeOutcomeData | null;
        frontier: NativeAuthoritySnapshot['frontier'];
        publication: ReturnType<typeof nativePrefixStatus>;
    }>;
    process(input: ProcessInput): Promise<{
        frontier: {
            position: number;
            entry: string;
        };
        outcome: NativeOutcomeData;
    }>;
    query(name: string, params: unknown): Promise<{
        frontier: {
            position: number;
            entry: string;
        };
        result: {
            kind: 'available';
            value: Json;
        } | {
            kind: 'unavailable';
            code: string;
        };
    }>;
}
/** Internal checked construction only, deliberately absent from public application exports. */
export declare function openNativeApplication(options: {
    anchor: NativeAnchor;
    sourceReader: NativeSourceReader;
    sourceOptions?: NativeSourceReadOptions;
    /** Trusted configured adapter: resolution confirms commit; ordinary rejection guarantees no commit.
     * If that outcome is unknown, throw NativePersistenceUncertain. Raw-store shape/error text grants no trust.
     * Actual adapter transactions/provenance and inspection remain the separate P3 integration gate. */
    persist?: (projection: NativeApplicationProjection) => Promise<void>;
}): Promise<NativeApplication>;
export {};
//# sourceMappingURL=native-authority.d.ts.map