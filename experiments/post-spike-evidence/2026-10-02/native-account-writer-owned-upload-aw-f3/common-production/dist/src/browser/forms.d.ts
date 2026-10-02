import { type DefinitionInfo } from '../client/definition.ts';
import type { Json } from '../core/values.ts';
export declare function element<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, className?: string): HTMLElementTagNameMap[K];
export declare function button(label: string, action: () => void | Promise<void>, className?: string): HTMLButtonElement;
/** Scalars use labeled controls; nested objects/arrays/unions use validated JSON. */
export declare function schemaForm(info: DefinitionInfo, schema: any, submitLabel: string, submit: (value: Record<string, Json>) => Promise<void>, initial?: Record<string, Json>): HTMLFormElement;
export declare function actionForm(info: DefinitionInfo, ref: string, submitLabel: string, submit: (value: Record<string, Json>) => Promise<void>, initial?: Record<string, Json>): HTMLFormElement;
//# sourceMappingURL=forms.d.ts.map