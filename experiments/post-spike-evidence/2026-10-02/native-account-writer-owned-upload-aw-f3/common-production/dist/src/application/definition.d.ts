import { LoadedDefinition, type DefinitionManifest } from '../definition/load.ts';
import { type SourceDocument } from '../definition/document.ts';
import { type Json } from '../core/values.ts';
export interface DefinitionInfo {
    version: 1;
    cid: string;
    manifest: DefinitionManifest;
    lexicons: any[];
    source?: SourceDocument;
}
export declare function describeDefinition(definition: LoadedDefinition, includeSource?: boolean): Promise<DefinitionInfo>;
/** Discovery is closed/versioned service data. Source verification never establishes the active frontier. */
export declare function validateDefinitionInfo(input: unknown): Promise<DefinitionInfo>;
export declare function previewSource(car: Uint8Array, action?: string, payload?: Record<string, Json>, state?: Json): Promise<{
    definition: DefinitionInfo;
    state: Json;
    outcome: {
        decision: 'effective';
    } | {
        decision: 'ineffective';
        reason: string;
        message?: string;
    } | null;
    scope: string;
    views: ({
        name: string;
        tree: import("../view/inlay.ts").ViewNode[];
        error?: undefined;
    } | {
        tree?: undefined;
        name: string;
        error: string;
    })[];
}>;
//# sourceMappingURL=definition.d.ts.map