import { NSID } from '../core/nsids.ts';
import { type Json } from '../core/values.ts';
import { Schemas } from './schemas.ts';
import { type SourceReader } from './source.ts';
export interface DefinitionManifest {
    $type: typeof NSID.definition;
    version: 1;
    profile: {
        $link: string;
    };
    title: string;
    files: {
        path: string;
        cid: string;
    }[];
    lexicons: string[];
    state: {
        ref: string;
        initial: string;
    };
    actions: {
        ref: string;
        fold: string;
    }[];
    queries: {
        name: string;
        ref: string;
        program: string;
    }[];
    views: {
        name: string;
        source: string;
        query?: string;
    }[];
}
export declare function validateDefinitionManifest(value: unknown): asserts value is DefinitionManifest;
export declare class LoadedDefinition {
    readonly cid: string;
    readonly manifest: Readonly<DefinitionManifest>;
    readonly schemas: Schemas;
    readonly initialState: Json;
    private readonly files;
    private constructor();
    bytes(path: string): Uint8Array;
    text(path: string): string;
    json(path: string): Json;
    view(name: string, props: Record<string, Json>): Promise<import("../view/inlay.ts").ViewNode[]>;
    static load(cid: string, reader: SourceReader): Promise<LoadedDefinition>;
}
//# sourceMappingURL=load.d.ts.map