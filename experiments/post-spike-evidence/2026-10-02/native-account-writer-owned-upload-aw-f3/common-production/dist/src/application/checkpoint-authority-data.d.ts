import { type CheckpointHistoryRow, type CheckpointThrough } from '../protocol/checkpoint-data.ts';
import { type NativeAnchor } from '../protocol/native-wire.ts';
import { type CompactAuthorityData } from './native-authority-data.ts';
import type { NativeAuthoritySnapshot } from './native-authority.ts';
export type { CompactAuthorityData } from './native-authority-data.ts';
export declare function readCheckpointAuthorityData(raw: Uint8Array, anchor: NativeAnchor, maximumBytes: number): Promise<CompactAuthorityData>;
/** Historical crosschecks only after complete asserted history coverage. Still returns DATA. */
export declare function checkCheckpointAuthorityHistory(raw: Uint8Array, history: readonly CheckpointHistoryRow[], head: CheckpointThrough, anchor: NativeAnchor, maximumBytes: number): Promise<NativeAuthoritySnapshot>;
//# sourceMappingURL=checkpoint-authority-data.d.ts.map