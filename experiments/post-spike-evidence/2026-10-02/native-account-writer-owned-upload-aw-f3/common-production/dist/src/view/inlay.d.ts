import { type Json } from '../core/values.ts';
export declare const PRIMITIVES: readonly ["ai.generalbusiness.atseq.ui.Panel", "ai.generalbusiness.atseq.ui.Text", "ai.generalbusiness.atseq.ui.Action"];
export interface Primitive {
    type: string;
    props: Record<string, Json>;
    children: ViewNode[];
}
export type ViewNode = string | Primitive;
export interface LocalView {
    root: string;
    imports: string[];
    records: Record<string, unknown>;
}
/** Resolve a retained Inlay source set. There is no ambient network or key access. */
export declare function resolveView(view: LocalView, props: Record<string, Json>): Promise<ViewNode[]>;
//# sourceMappingURL=inlay.d.ts.map