/** Native-format foundation. Content checks do not authenticate repository publication. */
import { type Bytes, type CidLink } from '@atcute/cbor';
import { type PrivateKey } from '@atcute/crypto';
import { type Json } from '../core/values.ts';
export { validateNativeAccountDid } from './native-schema.ts';
type Tag<T extends string> = `ai.generalbusiness.atseq.defs#${T}`;
export type ControlPower = 'certify' | 'govern' | 'recover';
export interface ControlPair {
    principal: string;
    actorKey: string;
}
export interface ControlAppointment extends ControlPair {
    powers: ControlPower[];
}
export interface NativeGenesis {
    $type: string;
    version: 2;
    app: string;
    creation: Bytes;
    semantics: CidLink;
    definition: CidLink;
    observationPolicy: CidLink;
    control: ControlAppointment[];
    recoverGovernance: boolean;
    owner: string | null;
    roles: {
        principal: string;
        role: string;
    }[];
}
export interface NativePin {
    app: string;
    genesis: string;
}
export interface NativeHead {
    $type: string;
    version: 2;
    app: string;
    genesis: CidLink;
    position: number;
    entry: CidLink;
}
export interface GrantReference {
    id: string;
    cid: CidLink;
}
export interface GrantContext {
    grant: GrantReference;
    epoch: CidLink;
}
export interface NativeAct extends GrantContext {
    $type: Tag<'act'>;
    action: string;
    execution: CidLink;
    payload: Record<string, Json>;
}
export interface NativeAssignRole extends GrantContext {
    $type: Tag<'assignRole'>;
    target: string;
    role: string;
    enabled: boolean;
    expectedAssignment: CidLink | null;
}
export interface ControlContext {
    position: number;
    prev: CidLink;
    controlTip: CidLink;
}
export type NativeControl = ControlContext & ({
    $type: Tag<'setControl'>;
    control: ControlAppointment[];
} | {
    $type: Tag<'setRecovery'>;
    recovery: ControlPair[];
} | {
    $type: Tag<'setOwner'>;
    owner: string | null;
} | {
    $type: Tag<'setRole'>;
    target: string;
    role: string;
    enabled: boolean;
    expectedAssignment: CidLink | null;
} | {
    $type: Tag<'activate'>;
    expected: CidLink;
    definition: CidLink;
    closure: string[];
} | {
    $type: Tag<'recoverParticipant'>;
    target: string;
    expectedEpoch: CidLink | null;
    expectedObservation: CidLink | null;
    epoch: CidLink;
    observation: CidLink;
} | {
    $type: Tag<'recoverGovernance'>;
    governance: ControlPair[];
});
export interface NativeIntent {
    $type: Tag<'intent'>;
    version: 2;
    app: string;
    genesis: CidLink;
    principal: string;
    actorKey: string;
    nonce: Bytes;
    operation: NativeAct | NativeAssignRole | NativeControl;
}
export interface NativeSignedRequest {
    $type: Tag<'signedRequest'>;
    intent: NativeIntent;
    sig: Bytes;
}
export interface NativeAccountOperation {
    $type: Tag<'accountOperation'>;
    app: string;
    genesis: CidLink;
    position: number;
    prev: CidLink;
    principal: string;
    expectedEpoch: CidLink | null;
    expectedObservation: CidLink | null;
    operation: {
        $type: Tag<'admitGrant'>;
        grant: GrantReference;
    } | {
        $type: Tag<'advanceEpoch'>;
        epoch: CidLink;
    } | {
        $type: Tag<'revokeGrant'>;
        revoke: GrantReference;
    };
    observation: CidLink;
}
export type NativeRequest = NativeSignedRequest | NativeAccountOperation;
export interface NativeEntry {
    $type: string;
    version: 2;
    app: string;
    genesis: CidLink;
    position: number;
    prev: CidLink;
    request: NativeRequest;
}
/** Sparse-publication framing only. Its contents cannot appoint their own binding. */
export interface NativeReceipt {
    $type: Tag<'receipt'>;
    version: 2;
    app: string;
    genesis: CidLink;
    request: CidLink;
    position: number;
    entry: CidLink;
    publication: {
        root: CidLink;
        binding: CidLink;
        proofs: CidLink[];
        head: CidLink | null;
    };
}
export interface NativeFile {
    $type: string;
    version: 1;
    cid: string;
    bytes: CidLink;
}
export interface NativeEpoch {
    $type: string;
    version: 1;
    id: Bytes;
    previous: CidLink | null;
}
export interface NativeEpochCurrent {
    $type: string;
    version: 1;
    id: Bytes;
    epoch: CidLink;
}
export interface NativeGrant {
    $type: string;
    version: 1;
    id: string;
    app: string;
    genesis: CidLink;
    epoch: CidLink;
    actorKey: string;
    actions: {
        action: string;
        execution: CidLink;
    }[];
    assignRoles: string[];
}
export interface NativeRevoke {
    $type: string;
    version: 1;
    id: string;
    app: string;
    genesis: CidLink;
}
export type NativeMethodEvidence = {
    $type: Tag<'plcAudit'>;
    bytes: CidLink;
    source: string;
    selectedTip: CidLink;
} | {
    $type: Tag<'webDocument'>;
    bytes: CidLink;
    source: string;
};
export interface NativeObservation {
    $type: Tag<'observation'>;
    policy: CidLink;
    principal: string;
    context: {
        app: string;
        genesis: CidLink;
        position: number;
        prev: CidLink;
        subject: CidLink;
    };
    binding: {
        signingKeyDid: string;
        pdsOrigin: string;
    };
    before: NativeMethodEvidence;
    after: NativeMethodEvidence;
    repositoryRoot: CidLink;
    records: {
        path: string;
        cid: CidLink;
    }[];
    proofs: CidLink[];
    observedAt: string;
}
export interface ByteChunk {
    $type: Tag<'byteChunk'>;
    bytes: Bytes;
}
export interface ByteManifest {
    $type: Tag<'byteManifest'>;
    byteLength: number;
    chunks: CidLink[];
}
export interface NativeContent<B = Record<string, unknown>> {
    $type: string;
    version: 1;
    body: B;
}
export interface ByteContentReader {
    get(cid: string): Promise<Uint8Array>;
}
/** Key representation only; grants and appointed powers are separate authority checks. */
export declare function validateNativeDeviceKey(value: string): Promise<void>;
/** Returns owned, strictly shaped content; no authority outcome is inferred. */
export declare function readNativeValue<T = unknown>(ref: string, value: unknown): Promise<T>;
export declare function nativePath(collection: string, rkey: string): string;
export declare function nativePositionKey(position: number): string;
export declare function parseNativePositionKey(value: string): number;
export declare function nativeEntryPath(genesis: string, position: number): string;
export declare function nativeGenesisPath(genesis: string): string;
export declare function nativeHeadPath(genesis: string): string;
/** Strict record and key derivation. The caller must separately verify native membership. */
export declare function readNativeRecord<T = unknown>(collection: string, rkey: string, raw: Uint8Array): Promise<T>;
/** Exact external pin, not native-root authentication or supported-semantic admission. */
export declare class NativeAnchor {
    readonly genesis: NativeGenesis;
    readonly cid: string;
    private constructor();
    static from(value: unknown, expected: NativePin): Promise<NativeAnchor>;
}
export declare function nativeHeadAt(anchor: NativeAnchor, position?: number, entry?: string): Promise<NativeHead>;
export declare function readNativeHead(value: unknown, anchor: NativeAnchor): Promise<NativeHead>;
export declare function signNativeIntent(value: unknown, signer: PrivateKey): Promise<NativeSignedRequest>;
export declare function verifyNativeSigned(value: unknown, anchor: NativeAnchor): Promise<{
    signed: NativeSignedRequest;
    requestCid: string;
}>;
/** Pure R0 tuple encoding. A host must verify shape/signature before lookup. */
export declare function nativeRetryIdentity(intent: NativeIntent): string;
/** Entry contents only: no native commit proof, prefix uniqueness, or authority outcome. */
export declare function verifyNativeEntryContents(value: unknown, anchor: NativeAnchor): Promise<{
    entry: NativeEntry;
    requestCid: string;
    entryCid: string;
}>;
export declare function createNativeEntry(request: NativeRequest, anchor: NativeAnchor, previous: NativeHead): Promise<NativeEntry>;
export declare function nativeObservationSubject(value: NativeIntent | NativeAccountOperation): Promise<string>;
/** Five-field owned JSON, intentionally independent of device/grant/epoch enrolment. */
export declare function nativeFoldMetadata(entry: NativeEntry): Record<string, Json>;
/** Local budget failures remain transient, separate from protocol shape failures. */
export declare function reconstructNativeBytes(manifest: NativeContent<ByteManifest>, reader: ByteContentReader, maximumBytes: number): Promise<Uint8Array>;
export declare function reconstructNativeFile(file: NativeFile, reader: ByteContentReader, maximumBytes: number): Promise<Uint8Array>;
//# sourceMappingURL=native-wire.d.ts.map