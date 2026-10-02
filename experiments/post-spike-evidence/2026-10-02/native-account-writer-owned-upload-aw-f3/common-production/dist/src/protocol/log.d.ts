import { NSID } from '../core/nsids.ts';
import { type PrivateKey } from '@atcute/crypto';
import { type Bytes, type CidLink } from '@atcute/cbor';
import { type Json } from '../core/values.ts';
export declare const runtimeDescriptor: Readonly<Readonly<{
    name: string;
    version: number;
    language: string;
    functions: string[];
    nodes: string[];
    operators: string[];
    limits: Readonly<{
        id: "atseq-jsonata-v1";
        stateBytes: number;
        inputBytes: number;
        outputBytes: number;
        actionBytes: number;
        programBytes: number;
        definitionBytes: number;
        definitionFiles: 64;
        inputDepth: 32;
        astNodes: 4096;
        astDepth: 64;
        evaluationDepth: 64;
        evaluationSteps: 100000;
        sequenceLength: 16384;
        intermediateBytes: number;
        inspectionBytes: number;
        foldMessageLength: 1024;
        viewNodes: 2048;
        viewDepth: 24;
    }>;
    values: string[];
    fold: string[];
    errors: Readonly<{
        readonly absent_result: 'invalid_input';
        readonly content_corrupt: 'transient';
        readonly content_missing: 'transient';
        readonly definition_binding: 'invalid_input';
        readonly definition_duplicate: 'invalid_input';
        readonly definition_manifest: 'invalid_input';
        readonly definition_path: 'invalid_input';
        readonly definition_size: 'invalid_input';
        readonly engine_input: 'invalid_input';
        readonly envelope: 'invalid_input';
        readonly evaluation_depth: 'invalid_input';
        readonly external_view: 'invalid_input';
        readonly fold_message: 'invalid_input';
        readonly fold_output: 'invalid_input';
        readonly fork: 'invalid_input';
        readonly incompatible_definition: 'invalid_input';
        readonly inspection_budget: 'invalid_input';
        readonly invalid_activation: 'invalid_input';
        readonly invalid_schema: 'invalid_input';
        readonly invalid_source: 'invalid_input';
        readonly noncanonical: 'invalid_input';
        readonly persistence_failed: 'transient';
        readonly reserved_key: 'invalid_input';
        readonly rollback: 'invalid_input';
        readonly schema_coercion: 'invalid_input';
        readonly schema_count: 'invalid_input';
        readonly schema_value: 'invalid_input';
        readonly sequence_limit: 'invalid_input';
        readonly source_bytes: 'invalid_input';
        readonly source_car: 'invalid_input';
        readonly source_complexity: 'invalid_input';
        readonly source_json: 'invalid_input';
        readonly source_pool_limit: 'invalid_input';
        readonly source_size: 'invalid_input';
        readonly source_utf8: 'invalid_input';
        readonly step_budget: 'invalid_input';
        readonly sum_overflow: 'invalid_input';
        readonly unicode: 'invalid_input';
        readonly unknown_component: 'invalid_input';
        readonly unknown_primitive: 'invalid_input';
        readonly unknown_query: 'invalid_input';
        readonly unknown_view: 'invalid_input';
        readonly unsupported_expression: 'invalid_input';
        readonly unsupported_function: 'invalid_input';
        readonly unsupported_runtime: 'invalid_input';
        readonly unsupported_schema: 'invalid_input';
        readonly unsupported_variable: 'invalid_input';
        readonly value_bytes: 'invalid_input';
        readonly value_depth: 'invalid_input';
        readonly view_limit: 'invalid_input';
        readonly view_props: 'invalid_input';
        readonly view_source: 'invalid_input';
        readonly wire_bytes: 'invalid_input';
        readonly wire_cid: 'invalid_input';
        readonly wire_depth: 'invalid_input';
        readonly wire_key: 'invalid_input';
        readonly wire_number: 'invalid_input';
        readonly wire_size: 'invalid_input';
        readonly wire_value: 'invalid_input';
    }>;
}>>;
export declare const runtimeCid: () => Promise<string>;
export interface Genesis {
    $type: typeof NSID.genesis;
    version: 1;
    app: string;
    profile: CidLink;
    definition: CidLink;
    sequencerKey: string;
    activationKeys: string[];
}
export interface Intent {
    $type: typeof NSID.defsIntent;
    version: 1;
    app: string;
    genesis: CidLink;
    definition: CidLink;
    actorKey: string;
    nonce: Bytes;
    action: string;
    payload: Record<string, Json>;
}
export interface SignedIntent {
    $type: typeof NSID.defsSignedIntent;
    intent: Intent;
    sig: Bytes;
}
export interface Entry {
    $type: typeof NSID.entry;
    version: 1;
    app: string;
    genesis: CidLink;
    position: number;
    prev: CidLink;
    signedIntent: SignedIntent;
    sequencerKey: string;
    sig: Bytes;
}
export interface Head {
    $type: typeof NSID.head;
    version: 1;
    app: string;
    genesis: CidLink;
    position: number;
    entry: CidLink;
}
export interface Receipt {
    $type: typeof NSID.defsReceipt;
    app: string;
    genesis: CidLink;
    intent: CidLink;
    position: number;
    entry: CidLink;
}
export interface Invitation {
    app: string;
    genesis: string;
}
/** An invitation pins both the application DID and genesis CID. */
export declare class Anchor {
    readonly genesis: Genesis;
    readonly cid: string;
    private constructor();
    static from(value: unknown, expected: Invitation): Promise<Anchor>;
}
export declare function randomNonce(): Bytes;
export declare function signIntent(value: Intent, signer: PrivateKey): Promise<SignedIntent>;
export declare function verifyIntent(value: unknown, anchor: Anchor): Promise<{
    signed: SignedIntent;
    intentCid: string;
}>;
export declare function headAt(anchor: Anchor, position?: number, entryCid?: string): Head;
export declare function validateHead(value: unknown, anchor: Anchor): asserts value is Head;
export declare function positionKey(position: number): string;
export declare function sequence(value: unknown, anchor: Anchor, previous: Head, signer: PrivateKey): Promise<Entry>;
export declare function verifyEntry(value: unknown, anchor: Anchor): Promise<{
    entry: Entry;
    receipt: Receipt;
}>;
/** Transport identity excludes signature bytes. Domain effectiveness is irrelevant. */
export declare function retryKey(intent: Intent): string;
export declare class RetryIndex {
    #private;
    lookup(intent: Intent): Promise<Receipt | undefined>;
    lookupCid(cid: string): Receipt | undefined;
    seal(): this;
    record(entry: Entry, receipt: Receipt): void;
}
export interface VerifiedHistory {
    head: Head;
    entries: Entry[];
    retries: RetryIndex;
}
/** Only verifyHistory can issue this immutable capability; copies are unverified. */
export declare function assertVerifiedHistory(history: VerifiedHistory, anchor: Anchor): void;
export declare function verifiedEntryCid(history: VerifiedHistory, anchor: Anchor, position: number): string;
/** Verify a complete chosen prefix, independent of record/page arrival order. */
export declare function verifyHistory(anchor: Anchor, value: Head, records: unknown[]): Promise<VerifiedHistory>;
//# sourceMappingURL=log.d.ts.map