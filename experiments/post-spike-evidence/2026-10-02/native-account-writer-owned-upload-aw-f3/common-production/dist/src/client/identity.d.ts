import { type Invitation } from '../protocol/log.ts';
import type { Json } from '../core/values.ts';
export interface Identity {
    name: string;
    publicKey: string;
    privateKey: number[];
}
export declare function createIdentity(name: string): Promise<Identity>;
export type { Invitation } from '../protocol/log.ts';
export declare function prepareIntent(identity: Identity, invitation: Invitation, definition: string, action: string, payload: Record<string, Json>): Promise<{
    cid: string;
    block: number[];
    signed: import("../protocol/log.ts").SignedIntent;
}>;
//# sourceMappingURL=identity.d.ts.map