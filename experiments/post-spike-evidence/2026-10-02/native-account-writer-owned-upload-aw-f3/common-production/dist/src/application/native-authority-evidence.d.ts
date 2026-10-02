import { type ByteContentReader, type NativeEntry, type NativeGrant, type NativeEpoch, type NativeEpochCurrent, type NativeRevoke } from '../protocol/native-wire.ts';
import { type NativeAuthorityState } from './native-authority.ts';
export interface AuthorityObservation {
    cid: string;
    principal: string;
    root: string;
    rev: string;
    signingKeyDid: string;
    pdsOrigin: string;
    assuranceClass: 'plc-audit-v1' | 'web-observation-v1';
    /** Current-to-predecessor order, stopping before the operation's expected anchor. */
    epochs: {
        cid: string;
        record: NativeEpoch;
    }[];
    current: NativeEpochCurrent | null;
    grant: NativeGrant | null;
    revoke: NativeRevoke | null;
}
import { type NativePrefix } from './native-prefix.ts';
interface AuthenticatedAuthorityEntryData {
    prior: NativeAuthorityState;
    prefix: NativePrefix;
    entry: NativeEntry;
    requestCid: string;
    entryCid: string;
    observation: AuthorityObservation | null;
    publicationAssurance: 'plc-audit-v1' | 'web-observation-v1';
}
declare const entryBrand: unique symbol;
export interface AuthenticatedAuthorityEntry {
    readonly [entryBrand]: true;
}
export declare function authenticatedAuthorityEntry(value: AuthenticatedAuthorityEntry, prior?: NativeAuthorityState): Readonly<AuthenticatedAuthorityEntryData>;
/** The prefix owns publication/signatures/uniqueness; this owner finishes participant evidence. */
export declare function authenticateAuthorityEntry(options: {
    prefix: NativePrefix;
    reader: ByteContentReader;
    prior: NativeAuthorityState;
}): Promise<AuthenticatedAuthorityEntry>;
export {};
//# sourceMappingURL=native-authority-evidence.d.ts.map