import type { DeviceStore } from '../client/store.ts';
import type { RetainedInput } from '../archive/archive.ts';
/** Call only with worker-verified inputs. The transaction preserves a concurrently saved floor. */
export declare function retainVerified(store: Pick<DeviceStore, 'update'>, input: RetainedInput, current?: () => boolean): Promise<RetainedInput>;
//# sourceMappingURL=verified.d.ts.map