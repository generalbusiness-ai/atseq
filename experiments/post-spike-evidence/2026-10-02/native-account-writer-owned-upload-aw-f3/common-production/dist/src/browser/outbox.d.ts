import { type AtseqClient } from '../client/api.ts';
import type { DeviceStore } from '../client/store.ts';
import type { SignedIntent, Receipt } from '../protocol/log.ts';
import type { Outcome } from '../application/folder.ts';
import type { AppSnapshot } from './protocol.ts';
export interface Pending {
    cid: string;
    block: number[];
    signed: SignedIntent;
    app: string;
    genesis: string;
    status: 'queued' | 'recorded' | 'applied' | 'not-applied' | 'refused';
    receipt?: Receipt;
    outcome?: Outcome;
    error?: string;
    source?: number[];
}
/** A new save during a flush schedules another scan, retaining exact signed bytes. */
export declare class Outbox {
    private readonly store;
    private readonly api;
    private running?;
    private again;
    constructor(store: Pick<DeviceStore, 'list' | 'update'>, api: Pick<AtseqClient, 'call'>);
    flush(): Promise<void>;
    private drain;
    resend(pending: Pending): Promise<void>;
    reconcile(snapshot: AppSnapshot): Promise<void>;
}
//# sourceMappingURL=outbox.d.ts.map