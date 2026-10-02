import { type Json } from '../core/values.ts';
import type { DefinitionManifest } from './load.ts';
import { type NativeSchemaProjection } from './native-source-projection.ts';
import { type NativeSourceReader, type NativeSourceReadOptions } from './native-source-transport.ts';
export type NativeActionAuthorization = {
    $type: 'ai.generalbusiness.atseq.defs#openParticipation';
} | {
    $type: 'ai.generalbusiness.atseq.defs#requiredRole';
    role: string;
};
export interface NativeDefinitionManifest extends Omit<DefinitionManifest, 'version' | 'actions'> {
    version: 2;
    actions: {
        ref: string;
        fold: string;
        authorization: NativeActionAuthorization;
    }[];
}
declare const definitionBrand: unique symbol;
declare const actionBrand: unique symbol;
export interface NativeSourceDefinition {
    readonly [definitionBrand]: true;
}
export interface NativeSourceAction {
    readonly [actionBrand]: true;
}
export interface NativeSourceDefinitionFacts {
    cid: string;
    semantics: string;
    closure: readonly string[];
    manifest: Readonly<NativeDefinitionManifest>;
    initialState: Json;
    stateProjection: NativeSchemaProjection;
    stateProjectionCid: string;
    logicalCarBytes: number;
    decodedOccurrenceBytes: number;
}
export interface NativeSourceActionFacts {
    definition: string;
    ref: string;
    execution: string;
    projectionCid: string;
    projectionLocator: string;
    projection: NativeSchemaProjection;
    contract: Readonly<Record<string, unknown>>;
}
export interface NativeSourceTarget {
    readonly root: string;
    readonly expectedSemantics: string;
    readonly closure: readonly string[];
}
/** Source facts only. A coordinator must call this owner itself with its authorized captured target. */
export type NativeSourceFacts = {
    readonly kind: 'admitted';
    readonly definition: NativeSourceDefinition;
} | {
    readonly kind: 'proven_invalid';
} | {
    readonly kind: 'incompatible';
    readonly actualSemantics: string;
};
export declare function assessNativeSource(target: NativeSourceTarget, reader: NativeSourceReader, localOptions?: NativeSourceReadOptions): Promise<NativeSourceFacts>;
/** The checked application pin selects this root. Only this owner derives its genesis closure. */
export declare function assessNativeGenesisSource(root: string, reader: NativeSourceReader, localOptions?: NativeSourceReadOptions): Promise<NativeSourceFacts>;
/** Diagnostic convenience. Publicly constructible thrown errors never serve as source facts. */
export declare function admitNativeSourceDefinition(cid: string, closure: readonly string[], reader: NativeSourceReader, localOptions?: NativeSourceReadOptions): Promise<NativeSourceDefinition>;
export declare function readNativeSourceDefinition(capability: NativeSourceDefinition): Readonly<NativeSourceDefinitionFacts>;
/** A null result proves absence only in a completely admitted definition. */
export declare function nativeSourceAction(capability: NativeSourceDefinition, ref: string): NativeSourceAction | null;
export declare function readNativeSourceAction(capability: NativeSourceAction): Readonly<NativeSourceActionFacts>;
export declare function nativeSourceFile(capability: NativeSourceDefinition, path: string): Uint8Array;
export declare function nativeSourceActionProjection(capability: NativeSourceAction): Uint8Array;
export declare function nativeSourceActionProjectionBlocks(capability: NativeSourceAction): {
    cid: string;
    raw: Uint8Array;
}[];
export declare function nativeSourceActionFold(capability: NativeSourceAction): string;
/** Validator ownership remains inside the actual admitted definition. */
export declare function validateNativeSourceState(definition: NativeSourceDefinition, state: Json): void;
export declare function validateNativeSourceAction(definition: NativeSourceDefinition, action: NativeSourceAction, payload: Json): void;
export declare function nativeSourceQueryProgram(definition: NativeSourceDefinition, name: string): string;
export declare function validateNativeSourceQueryParams(definition: NativeSourceDefinition, name: string, params: Json): void;
export declare function validateNativeSourceQueryResult(definition: NativeSourceDefinition, name: string, result: Json): void;
export {};
//# sourceMappingURL=native-source.d.ts.map