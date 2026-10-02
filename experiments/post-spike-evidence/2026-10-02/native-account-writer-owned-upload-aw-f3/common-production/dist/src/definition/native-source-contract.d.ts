import type { NativeContent, ByteManifest } from '../protocol/native-wire.ts';
export declare const NATIVE_SOURCE_CONTRACT: Readonly<{
    native: string;
    application: string;
    evaluator: string;
}>;
/** Exact compiled producer stages; parser acceptance alone proves no provenance. */
export declare const NATIVE_FOLD_FAILURE_STAGES: Readonly<{
    inputSchema: {
        schema_value: string;
        schema_coercion: string;
    };
    evaluateAndFold: string[];
    successorState: string[];
    neverCatchAll: string;
}>;
/** Owned closed literal shapes, including the reviewed raw-CID projection field. */
export declare function validateNativeSourceShape(ref: string, value: unknown): void;
export interface NativeByteFraming {
    manifest: Readonly<NativeContent<ByteManifest>>;
    cid: string;
    blocks: readonly {
        cid: string;
        raw: Uint8Array;
    }[];
}
/** Raw JSON identity is distinct from the 32 KiB content locator; neither appoints authority. */
export declare function frameNativeSourceBytes(raw: Uint8Array): Promise<NativeByteFraming>;
export declare function assertNativeSourceContract(): Promise<void>;
//# sourceMappingURL=native-source-contract.d.ts.map