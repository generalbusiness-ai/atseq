import { type AtseqError } from '../core/errors.ts';
export interface NativeSourceReader {
    get(cid: string): Promise<Uint8Array | AsyncIterable<Uint8Array>>;
}
export interface NativeSourceReadOptions {
    /** Operational retention budget, not a replicated validity rule. Root scratch is at most 64 KiB. */
    maximumRetainedBytes?: number;
    /** Operational cap on all delivered bytes; reaching it cannot prove normative invalidity. */
    maximumReadBytes?: number;
}
export interface NativeSourceClosure {
    root: unknown;
    rootBytes: Uint8Array;
    identities: string[];
    files: Map<string, Uint8Array>;
    logicalCarBytes: number;
    decodedOccurrenceBytes: number;
}
export type NativeSourceCollection = {
    readonly ok: true;
    readonly value: NativeSourceClosure;
} | {
    readonly ok: false;
    readonly error: AtseqError;
};
/** Activation preserves the exact supplied signed vector. */
export declare function collectNativeSourceClosure(rootCid: string, closure: readonly string[], reader: NativeSourceReader, options?: NativeSourceReadOptions): Promise<NativeSourceCollection>;
/** Genesis derives its set from the pinned, verified root; no caller vector or trusted mode. */
export declare function collectNativeGenesisSource(rootCid: string, reader: NativeSourceReader, options?: NativeSourceReadOptions): Promise<NativeSourceCollection>;
/** Diagnostic convenience only; thrown errors are not owner-returned source facts. */
export declare function readNativeSourceClosure(root: string, closure: readonly string[], reader: NativeSourceReader, options?: NativeSourceReadOptions): Promise<NativeSourceClosure>;
/** Independent maintained one-shot equivalent, used by conformance callers. */
export declare function nativeSourceBytesCid(raw: Uint8Array): Promise<string>;
//# sourceMappingURL=native-source-transport.d.ts.map