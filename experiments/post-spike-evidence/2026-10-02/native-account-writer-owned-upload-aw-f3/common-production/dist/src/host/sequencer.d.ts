import type { PrivateKey } from '@atcute/crypto';
import { Anchor, verifyHistory, type Head, type Receipt } from '../protocol/log.ts';
import { PdsClient } from './pds.ts';
export interface Snapshot {
    commit: string;
    history: Awaited<ReturnType<typeof verifyHistory>>;
}
/** The PDS repository is mutable. Read a consistent snapshot, then verify our chain. */
export declare function readSnapshot(pds: PdsClient, anchor: Anchor, knownHead?: Head): Promise<Snapshot>;
/** Share a verified repository snapshot while its commit is unchanged. */
export declare class SnapshotReader {
    private readonly pds;
    private readonly anchor;
    private cached?;
    private inFlight?;
    private generation;
    private knownHead?;
    constructor(pds: PdsClient, anchor: Anchor);
    isFor(pds: PdsClient, anchor: Anchor): boolean;
    requireHead(head: Head): void;
    /** A completed write invalidates reads that began before its response. */
    invalidate(): void;
    retainedHead(): Head | undefined;
    covers(history: Snapshot['history'], floor: Head | undefined): boolean;
    read(): Promise<Snapshot>;
    private startRead;
}
export declare function provisionLog(pds: PdsClient, anchor: Anchor): Promise<void>;
export declare class Sequencer {
    private readonly pds;
    private readonly anchor;
    private readonly signer;
    private readonly queue;
    private closed;
    private readonly lease;
    private readonly snapshots;
    private checkpointed?;
    constructor(pds: PdsClient, anchor: Anchor, signer: PrivateKey, leaseDirectory: string, knownHead?: Head, snapshots?: SnapshotReader);
    /** Persist the newest verified floor before issuing a receipt or read result. */
    checkpoint(): void;
    submit(block: Uint8Array): Promise<{
        receipt: Receipt;
        head: Head;
    }>;
    /** Read receipts independently of a pending append, from a verified snapshot. */
    lookup(intentCid: string): Promise<{
        receipt: Receipt;
        head: Head;
    } | undefined>;
    private append;
    close(): Promise<void>;
}
//# sourceMappingURL=sequencer.d.ts.map