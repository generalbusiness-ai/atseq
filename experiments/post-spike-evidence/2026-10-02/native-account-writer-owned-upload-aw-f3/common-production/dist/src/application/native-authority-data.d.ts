import { type NativeAnchor } from '../protocol/native-wire.ts';
import type { NativeAuthoritySnapshot as CompactNativeAuthoritySnapshot } from './native-authority.ts';
export interface NativeAuthoritySnapshot extends CompactNativeAuthoritySnapshot {
    requests: string[];
    retries: string[];
    consumedObservations: string[];
}
/** Local capacity refusal is unavailable; syntactic/self-consistency checks are not provenance. */
export type CompactAuthorityData = Omit<NativeAuthoritySnapshot, 'format' | 'consumedObservations' | 'requests' | 'retries'> & {
    format: 'atseq-checkpoint-authority';
};
export declare function readAuthorityData(value: unknown, anchor: NativeAnchor, compact: false, maximumBytes?: number): Promise<NativeAuthoritySnapshot>;
export declare function readAuthorityData(value: unknown, anchor: NativeAnchor, compact: true, maximumBytes?: number): Promise<CompactAuthorityData>;
//# sourceMappingURL=native-authority-data.d.ts.map