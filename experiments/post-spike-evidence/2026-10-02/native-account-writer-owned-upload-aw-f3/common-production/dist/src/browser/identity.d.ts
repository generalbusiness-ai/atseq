import { type Invitation } from '../protocol/log.ts';
import type { Json } from '../core/values.ts';
import type { DeviceStore } from '../client/store.ts';
/** Only the shell owns these keys. IndexedDB retains non-extractable CryptoKeys. */
export interface DeviceIdentity {
    name: string;
    publicKey: string;
    keys: CryptoKeyPair;
}
export declare function createDeviceIdentity(name: string): Promise<DeviceIdentity>;
export declare function deviceIdentity(store: DeviceStore): Promise<DeviceIdentity | undefined>;
export declare function prepareDeviceIntent(identity: DeviceIdentity, invitation: Invitation, definition: string, action: string, payload: Record<string, Json>): Promise<{
    cid: string;
    block: number[];
    signed: import("../protocol/log.ts").SignedIntent;
}>;
//# sourceMappingURL=identity.d.ts.map