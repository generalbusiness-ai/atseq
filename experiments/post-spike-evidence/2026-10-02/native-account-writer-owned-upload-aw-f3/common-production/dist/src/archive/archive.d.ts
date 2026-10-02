import { Anchor, type Head, type Genesis, type Entry, type Invitation } from '../protocol/log.ts';
import type { Bytes } from '@atcute/cbor';
import { Folder } from '../application/folder.ts';
export { ARCHIVE_LIMIT } from './limits.ts';
export declare const REPLAY = "Install the trusted Atseq runtime named by runtime.application (and its locked dependencies). Run the documented CLI replay operation with this archive and a new output directory. Archive content never installs or executes runtime code. A browser with this installed shell can import the archive offline. This is a retained copy; it does not grant write authority or recreate PDS credentials.";
export interface RetainedInput {
    genesis: Genesis;
    genesisCid: string;
    head: Head;
    entries: Entry[];
    source: Bytes;
    candidates?: {
        definition: string;
        source: Bytes;
    }[];
}
export interface ArchiveNotice {
    name: string;
    version: string;
    license: string;
    texts: Record<string, string>;
}
export interface Archive {
    format: 'atseq-archive';
    version: 1;
    input: RetainedInput;
    runtime: {
        application: unknown;
        engine: unknown;
    };
    inventory: {
        cid: string;
        bytes: number;
    }[];
    licenses: ArchiveNotice[];
    replay: string;
}
export declare function replayInput(input: RetainedInput, expected?: Invitation): Promise<{
    folder: Folder;
    snapshot: {
        head: Head;
        projection: import("../application/folder.ts").Projection;
        stalled?: import("../application/folder.ts").Stalled;
    };
    retries: {
        actorKey: string;
        nonce: Bytes;
        receipt: import("../protocol/log.ts").Receipt | undefined;
    }[];
    inventory: {
        cid: string;
        bytes: number;
    }[];
    history: import("../protocol/log.ts").VerifiedHistory;
    anchor: Anchor;
}>;
export declare function exportArchive(input: RetainedInput, expected: Invitation, position?: number): Promise<Archive>;
export declare function encodeArchive(archive: Archive): Uint8Array;
export type ArchiveInvitation = Invitation;
export declare function importArchive(raw: Uint8Array, expected?: ArchiveInvitation | ArchiveInvitation[]): Promise<{
    folder: Folder;
    snapshot: {
        head: Head;
        projection: import("../application/folder.ts").Projection;
        stalled?: import("../application/folder.ts").Stalled;
    };
    retries: {
        actorKey: string;
        nonce: Bytes;
        receipt: import("../protocol/log.ts").Receipt | undefined;
    }[];
    inventory: {
        cid: string;
        bytes: number;
    }[];
    history: import("../protocol/log.ts").VerifiedHistory;
    anchor: Anchor;
    archive: Archive;
}>;
//# sourceMappingURL=archive.d.ts.map