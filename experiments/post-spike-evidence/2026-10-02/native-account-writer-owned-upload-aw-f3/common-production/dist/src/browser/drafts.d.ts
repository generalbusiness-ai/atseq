import { type AtseqClient } from '../client/api.ts';
import { type DeviceStore, type Draft } from '../client/store.ts';
import type { Invitation } from '../protocol/log.ts';
import type { ViewNode } from '../view/inlay.ts';
import type { DeviceIdentity } from './identity.ts';
import type { Evaluator } from './evaluator.ts';
import type { Preview } from './protocol.ts';
export interface DraftContext {
    draft: Draft;
    preview: Preview;
    content: HTMLElement;
    evaluator: Evaluator;
    store: DeviceStore;
    api: AtseqClient;
    identity: () => DeviceIdentity | undefined;
    visible: () => boolean;
    setDraft: (draft: Draft) => void;
    setPreview: (preview: Preview) => void;
    redraw: () => void;
    tell: (message: string) => void;
    inspect: (label: string, value: unknown) => HTMLElement;
    showIdentity: (next: () => void) => void;
    applications: () => Promise<void>;
    openApp: (invitation: Invitation) => Promise<void>;
}
export declare function retainDraft(store: DeviceStore, evaluator: Evaluator, raw: Uint8Array): Promise<{
    draft: Draft;
    checked: {
        definition: import("../application/definition.ts").DefinitionInfo;
        state: import("../core/values.ts").Json;
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
            tree: ViewNode[];
            error?: undefined;
        } | {
            tree?: undefined;
            name: string;
            error: string;
        })[];
    };
}>;
export declare function drawDraft(ctx: DraftContext): void;
//# sourceMappingURL=drafts.d.ts.map