import { NativeAnchor, type ByteContentReader, type NativeAccountOperation, type NativeIntent } from '../protocol/native-wire.ts';
import { type NativeAuthorityState } from '../application/native-authority.ts';
declare const preparationBrand: unique symbol;
export interface NativeObservationPreparation {
    readonly [preparationBrand]: true;
}
declare const captureBrand: unique symbol;
export interface NativeObservationCapture {
    readonly [captureBrand]: true;
}
export type NativeSubjectRefusal = {
    readonly code: 'subject_absent';
    readonly path: string;
    readonly expectedCid: string | null;
    readonly observedCid: null;
    readonly root: string;
} | {
    readonly code: 'subject_replaced';
    readonly path: string;
    readonly expectedCid: string;
    readonly observedCid: string;
    readonly root: string;
};
export type NativeObservationResult = {
    kind: 'captured';
    capture: NativeObservationCapture;
} | {
    kind: 'refused';
    refusal: NativeSubjectRefusal;
};
export interface NativeObservationCaptureData {
    kind: 'account' | 'app';
    principal: string;
    root: string;
    rev: string;
    assuranceClass: 'plc-audit-v1' | 'web-observation-v1';
    policy: string;
    descriptor: string;
    proofs: string[];
    completed: NativeAccountOperation | NativeIntent | null;
    blocks: Map<string, Uint8Array<ArrayBuffer>>;
}
export declare class NativeObserver {
    #private;
    private constructor();
    static fromAnchor(anchor: NativeAnchor, reader: ByteContentReader): Promise<NativeObserver>;
    prepareAccount(prior: NativeAuthorityState, value: unknown): Promise<NativeObservationPreparation>;
    prepareRecovery(prior: NativeAuthorityState, value: unknown): Promise<NativeObservationPreparation>;
    readCapture(capture: NativeObservationCapture): NativeObservationCaptureData;
    assertCapturePrior(capture: NativeObservationCapture, current: NativeAuthorityState): void;
    observePrepared(preparation: NativeObservationPreparation, options?: {
        signal?: AbortSignal;
        observedAt?: string;
    }): Promise<NativeObservationResult>;
    observeApp(entry?: unknown, options?: {
        signal?: AbortSignal;
    }): Promise<NativeObservationResult>;
}
export {};
//# sourceMappingURL=native-observer.d.ts.map