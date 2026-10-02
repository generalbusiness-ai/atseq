/** Authored schema projection; maintained Lexicons rewrites are never identity inputs. */
import { type Json } from '../core/values.ts';
export interface NativeSchemaProjection {
    stateRoot: string;
    actionRoot?: string;
    definitions: Record<string, Json>;
}
export declare function normalizeNativeRef(ref: string, context?: string): string;
/** Visit schema positions only: literal properties, const/default/enum keep their exact data. */
export declare function nativeSchemaProjection(documents: readonly Json[], stateRef: string, actionRef?: string): NativeSchemaProjection;
export declare function nativeProjectionBytes(projection: NativeSchemaProjection): Uint8Array;
export declare function nativeProjectionCid(projection: NativeSchemaProjection): Promise<string>;
//# sourceMappingURL=native-source-projection.d.ts.map