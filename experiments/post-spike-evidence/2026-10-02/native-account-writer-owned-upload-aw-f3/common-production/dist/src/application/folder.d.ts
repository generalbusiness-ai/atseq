import { NSID } from '../core/nsids.ts';
import { Anchor, type VerifiedHistory, type Head } from '../protocol/log.ts';
import { LoadedDefinition } from '../definition/load.ts';
import type { SourceReader } from '../definition/source.ts';
import { type Json } from '../core/values.ts';
export type Outcome = {
    $type: typeof NSID.defsEffective;
} | {
    $type: typeof NSID.defsIneffective;
    reason: string;
    message?: string;
};
export interface Projection {
    app: string;
    genesis: string;
    definition: string;
    frontier: {
        $type: typeof NSID.defsCursor;
        position: number;
        entry: {
            $link: string;
        };
    };
    state: Json;
    outcomes: {
        position: number;
        entry: string;
        intent: string;
        outcome: Outcome;
    }[];
}
export interface Stalled {
    position: number;
    code: string;
    message: string;
}
export interface FolderStatus {
    head: Head;
    frontier: Projection['frontier'];
    stalled?: Stalled;
}
export type PersistProjection = (projection: Projection) => Promise<void>;
/** Pure interpretation of a verified prefix; persistence replaces one snapshot. */
export declare class Folder {
    private readonly anchor;
    private definition;
    private readonly source;
    private readonly persist?;
    private readonly queue;
    private head;
    private projection;
    private stalled?;
    private constructor();
    static open(anchor: Anchor, source: SourceReader, persist?: PersistProjection): Promise<Folder>;
    activeDefinition(): LoadedDefinition;
    snapshot(): {
        head: Head;
        projection: Projection;
        stalled?: Stalled;
    };
    private statusValue;
    /** Owned metadata at one frontier, without state or outcome history. */
    status(): FolderStatus;
    /** An exact-position observation, bound to the requested intent and its frontier. */
    outcomeAt(position: number, intent: string): FolderStatus & {
        outcome?: Outcome;
    };
    catchUp(head: Head, records: unknown[]): Promise<ReturnType<Folder['snapshot']>>;
    catchUpVerified(history: VerifiedHistory): Promise<ReturnType<Folder['snapshot']>>;
    /** Catch up without constructing a complete exported projection. */
    catchUpVerifiedStatus(history: VerifiedHistory): Promise<FolderStatus>;
    private advanceVerified;
    private interpret;
    query(name: string, params: unknown): Promise<{
        head: Head;
        frontier: {
            $type: typeof NSID.defsCursor;
            position: number;
            entry: {
                $link: string;
            };
        };
        result: {
            $type: "ai.generalbusiness.atseq.defs#queryAvailable";
            value: Json;
            code?: undefined;
            message?: undefined;
        };
    } | {
        head: Head;
        frontier: {
            $type: typeof NSID.defsCursor;
            position: number;
            entry: {
                $link: string;
            };
        };
        result: {
            value?: undefined;
            $type: "ai.generalbusiness.atseq.defs#queryUnavailable";
            code: any;
            message: string;
        };
    }>;
}
//# sourceMappingURL=folder.d.ts.map