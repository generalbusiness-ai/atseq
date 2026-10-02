import type { Invitation } from '../protocol/log.ts';
import type { DeviceStore } from '../client/store.ts';
import type { AtseqClient } from '../client/api.ts';
import type { DefinitionInfo } from '../client/definition.ts';
import type { DeviceIdentity } from './identity.ts';
import type { AppSnapshot, Comparison } from './protocol.ts';
export interface ChangeDraft {
    source: number[];
    expected: string;
    comparison: Comparison;
}
export interface ChangeContext {
    changeDraft?: ChangeDraft;
    current: Invitation;
    definition: DefinitionInfo;
    snapshot: AppSnapshot;
    api: AtseqClient;
    store: DeviceStore;
    identity: () => DeviceIdentity | undefined;
    applying: () => boolean;
    setApplying: (value: boolean) => void;
    clearDraft: () => void;
    visible: () => boolean;
    inspect: (label: string, value: unknown) => HTMLElement;
    tell: (message: string) => void;
    failure: (error: unknown) => void;
    compareChange: (source: number[]) => Promise<void>;
    drawApp: () => Promise<void>;
    flush: () => Promise<void>;
}
export declare function changePanel(ctx: ChangeContext): HTMLElement;
//# sourceMappingURL=changes.d.ts.map