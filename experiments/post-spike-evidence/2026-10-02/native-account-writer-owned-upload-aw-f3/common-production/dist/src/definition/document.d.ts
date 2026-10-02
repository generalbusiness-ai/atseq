import { type Bytes } from '@atcute/cbor';
import { LoadedDefinition, type DefinitionManifest } from './load.ts';
import { SourceBundle } from './source.ts';
export declare const SOURCE_DOCUMENT_BYTES: number;
export interface SourceDocument {
    format: 'atseq-source';
    version: 1;
    manifest: Omit<DefinitionManifest, 'files' | 'profile'> & Partial<Pick<DefinitionManifest, 'files' | 'profile'>>;
    sources: {
        path: string;
        content: Bytes;
    }[];
}
/** Local authoring transport. All returned bundles have passed ordinary definition admission. */
export declare function sourceDocumentToBundle(input: unknown): Promise<SourceBundle>;
/** Owned exact bytes from an already admitted closure, including its retained file table. */
export declare function sourceDocumentFromDefinition(definition: LoadedDefinition): SourceDocument;
export declare function sourceDocumentFromBundle(bundle: SourceBundle): Promise<SourceDocument>;
export declare function serializeSourceDocument(document: SourceDocument): string;
//# sourceMappingURL=document.d.ts.map