import { type NativeOutcomeData } from './native-outcome.ts';
import { type ByteContentReader, type NativeAnchor } from './native-wire.ts';
export declare const CHECKPOINT_DATA_BOUNDS: Readonly<{
    pageBytes: number;
    depth: 32;
    payloadBytes: number;
}>;
export interface CheckpointPin {
    app: string;
    genesis: string;
}
export interface CheckpointThrough {
    position: number;
    entry: string;
}
export type CheckpointKind = 'history' | 'outcomes' | 'sources' | 'evidence';
export interface CheckpointTableData extends CheckpointPin {
    format: 'atseq-checkpoint-table';
    version: 1;
    kind: CheckpointKind;
    through: CheckpointThrough;
    rows: number;
    pages: {
        payload: string;
        rows: number;
    }[];
}
export interface CheckpointHistoryRow {
    position: number;
    entry: string;
    request: string;
    actor: null | {
        actorKey: string;
        nonce: string;
    };
    entryBytes: string;
    requestBytes: string;
    observations: string[];
}
export interface CheckpointSourceRow {
    definition: string;
    manifest: string;
    files: {
        path: string;
        cid: string;
        bytes: string;
    }[];
}
export interface CheckpointEvidenceRow {
    cid: string;
    bytes: string;
}
export interface CheckpointOutcomeRow {
    position: number;
    entry: string;
    outcome: NativeOutcomeData;
}
export interface CheckpointIndexesData {
    requests: string[];
    retries: string[];
    consumedObservations: string[];
}
export declare function checkpointClosed(value: any, keys: readonly string[]): void;
/** The strict parser's limits are facts; this adapter makes fixed format bounds malformed. */
export declare function readCheckpointJson(raw: Uint8Array, maximumBytes: number, page?: boolean): unknown;
/** Existing deterministic native framing identity; no publication/retention proof. */
export declare function checkpointPayloadIdentity(raw: Uint8Array): Promise<string>;
/** Native hashes/framing only; reader misses must be explicit unavailable errors. */
export declare function readCheckpointBytes(cid: string, reader: ByteContentReader, maximumBytes: number, page?: boolean): Promise<Uint8Array>;
export declare function readCheckpointTable(raw: Uint8Array, expectedKind: CheckpointKind, scope: CheckpointPin, maximumBytes: number): CheckpointTableData;
export declare function readCheckpointPage(raw: Uint8Array, kind: 'outcomes', scope: CheckpointPin, maximumBytes: number, maximumRows: number): Promise<CheckpointOutcomeRow[]>;
export declare function readCheckpointPage(raw: Uint8Array, kind: 'history', scope: CheckpointPin, maximumBytes: number, maximumRows: number): Promise<CheckpointHistoryRow[]>;
export declare function readCheckpointPage(raw: Uint8Array, kind: 'sources', scope: CheckpointPin, maximumBytes: number, maximumRows: number): Promise<CheckpointSourceRow[]>;
export declare function readCheckpointPage(raw: Uint8Array, kind: 'evidence', scope: CheckpointPin, maximumBytes: number, maximumRows: number): Promise<CheckpointEvidenceRow[]>;
/** Complete asserted coverage only. This is not a proof of history or prior absence. */
export declare function deriveCheckpointIndexes(history: readonly CheckpointHistoryRow[], scope: CheckpointPin, frontier: number): CheckpointIndexesData;
/** Compare supplied original bytes with their history projection; no native membership is inferred. */
export declare function checkCheckpointHistoryRecord(row: CheckpointHistoryRow, entryRaw: Uint8Array, requestRaw: Uint8Array, anchor: NativeAnchor, previous: string): Promise<void>;
export declare function checkCheckpointSourceRecord(row: CheckpointSourceRow, definitionRaw: Uint8Array, fileBytes: readonly Uint8Array[]): Promise<void>;
export declare function checkCheckpointEvidenceRecord(row: CheckpointEvidenceRow, raw: Uint8Array): Promise<void>;
/** All pages supplied; coverage is asserted data, never authenticated absence. */
export declare function readCompleteCheckpointTable(tableRaw: Uint8Array, pageBytes: readonly Uint8Array[], kind: 'outcomes', scope: CheckpointPin, maximumBytes: number, maximumRows: number): Promise<{
    table: CheckpointTableData;
    rows: CheckpointOutcomeRow[];
}>;
export declare function readCompleteCheckpointTable(tableRaw: Uint8Array, pageBytes: readonly Uint8Array[], kind: 'history', scope: CheckpointPin, maximumBytes: number, maximumRows: number): Promise<{
    table: CheckpointTableData;
    rows: CheckpointHistoryRow[];
}>;
export declare function readCompleteCheckpointTable(tableRaw: Uint8Array, pageBytes: readonly Uint8Array[], kind: 'sources', scope: CheckpointPin, maximumBytes: number, maximumRows: number): Promise<{
    table: CheckpointTableData;
    rows: CheckpointSourceRow[];
}>;
export declare function readCompleteCheckpointTable(tableRaw: Uint8Array, pageBytes: readonly Uint8Array[], kind: 'evidence', scope: CheckpointPin, maximumBytes: number, maximumRows: number): Promise<{
    table: CheckpointTableData;
    rows: CheckpointEvidenceRow[];
}>;
export declare function readCompleteCheckpointHistory(tableRaw: Uint8Array, pageBytes: readonly Uint8Array[], scope: CheckpointPin, frontier: number, maximumBytes: number, maximumRows: number): Promise<{
    table: CheckpointTableData;
    rows: CheckpointHistoryRow[];
    indexes: CheckpointIndexesData;
}>;
/** Non-null outcomes are complete through interpreted frontier; still asserted DATA. */
export declare function readCompleteCheckpointOutcomes(tableRaw: Uint8Array, pageBytes: readonly Uint8Array[], scope: CheckpointPin, frontier: CheckpointThrough, history: readonly CheckpointHistoryRow[], maximumBytes: number, maximumRows: number): Promise<{
    table: CheckpointTableData;
    rows: CheckpointOutcomeRow[];
}>;
//# sourceMappingURL=checkpoint-data.d.ts.map