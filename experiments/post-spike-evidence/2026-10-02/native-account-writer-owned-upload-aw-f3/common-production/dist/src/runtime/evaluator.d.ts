import { type Json } from '../core/values.ts';
export interface Evaluation {
    value: Json;
    steps: number;
    inspectedBytes: number;
}
/** One pinned engine in host and browser. No user callbacks or external bindings. */
export declare function evaluate(source: string, input: unknown): Promise<Evaluation>;
export type FoldResult = {
    decision: 'effective';
    state: Json;
} | {
    decision: 'ineffective';
    reason: string;
    message?: string;
};
export declare function fold(source: string, input: {
    meta: Json;
    act: Json;
    state: Json;
}): Promise<FoldResult>;
//# sourceMappingURL=evaluator.d.ts.map