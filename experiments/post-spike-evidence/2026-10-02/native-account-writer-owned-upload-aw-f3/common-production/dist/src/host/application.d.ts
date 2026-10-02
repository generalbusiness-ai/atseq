import { NSID } from '../core/nsids.ts';
import { type Genesis } from '../protocol/log.ts';
import type { AccountProvider } from './accounts.ts';
export declare class ApplicationHost {
    readonly directory: string;
    private readonly accounts;
    private readonly limits;
    private readonly apps;
    private readonly failedRestores;
    private readonly queue;
    constructor(directory: string, accounts: AccountProvider, limits?: {
        applications: number;
    });
    create(id: string, car: Uint8Array, activationKeys: string[]): Promise<{
        genesis: Genesis;
        genesisCid: import("@atcute/cid").CidLink;
        head: import("../protocol/log.ts").Head;
        frontier: {
            $type: typeof NSID.defsCursor;
            position: number;
            entry: {
                $link: string;
            };
        };
    }>;
    restore(): Promise<void>;
    restorationFailures(): {
        [k: string]: {
            code: string;
            message: string;
            name: string;
        };
    };
    private restoreOne;
    private attach;
    private get;
    private refresh;
    private created;
    list(): {
        app: string;
        genesis: string;
        title: string;
    }[];
    describe(app: string, genesis: string, includeSource?: boolean): Promise<{
        genesis: Genesis;
        definition: import("../application/definition.ts").DefinitionInfo;
        head: import("../protocol/log.ts").Head;
        frontier: {
            $type: typeof NSID.defsCursor;
            position: number;
            entry: {
                $link: string;
            };
        };
    }>;
    sync(app: string, genesis: string): Promise<{
        genesis: Genesis;
        genesisCid: string;
        head: import("../protocol/log.ts").Head;
        entries: import("../protocol/log.ts").Entry[];
        source: Uint8Array<ArrayBufferLike>;
        candidates: {
            definition: string;
            source: Uint8Array<ArrayBufferLike>;
        }[];
    }>;
    compareDefinition(app: string, genesis: string, expected: string, car: Uint8Array): Promise<{
        current: import("../application/definition.ts").DefinitionInfo;
        candidate: import("../application/definition.ts").DefinitionInfo;
        closure: string[];
        frontier: {
            $type: typeof NSID.defsCursor;
            position: number;
            entry: {
                $link: string;
            };
        };
        head: import("../protocol/log.ts").Head;
        statePreserved: boolean;
        replayPassed: boolean;
    }>;
    stageDefinition(app: string, genesis: string, expected: string, car: Uint8Array): Promise<{
        current: import("../application/definition.ts").DefinitionInfo;
        candidate: import("../application/definition.ts").DefinitionInfo;
        closure: string[];
        frontier: {
            $type: typeof NSID.defsCursor;
            position: number;
            entry: {
                $link: string;
            };
        };
        head: import("../protocol/log.ts").Head;
        statePreserved: boolean;
        replayPassed: boolean;
    }>;
    submit(block: Uint8Array): Promise<{
        receipt: import("../protocol/log.ts").Receipt;
        head: import("../protocol/log.ts").Head;
        frontier: {
            $type: typeof NSID.defsCursor;
            position: number;
            entry: {
                $link: string;
            };
        };
    }>;
    query(app: string, genesis: string, name: string, params: unknown): Promise<{
        head: import("../protocol/log.ts").Head;
        frontier: {
            $type: typeof NSID.defsCursor;
            position: number;
            entry: {
                $link: string;
            };
        };
        result: {
            $type: "ai.generalbusiness.atseq.defs#queryAvailable";
            value: import("../core/values.ts").Json;
            code?: undefined;
            message?: undefined;
        };
    } | {
        head: import("../protocol/log.ts").Head;
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
    receipt(app: string, genesis: string, intent: string): Promise<{
        receipt: import("../protocol/log.ts").Receipt;
        head: import("../protocol/log.ts").Head;
        frontier: {
            $type: typeof NSID.defsCursor;
            position: number;
            entry: {
                $link: string;
            };
        };
        outcome: {
            $type: typeof NSID.defsEffective;
        } | {
            $type: typeof NSID.defsIneffective;
            reason: string;
            message?: string;
        } | {
            $type: "ai.generalbusiness.atseq.defs#pending";
        };
    } | undefined>;
    close(): Promise<void>;
}
//# sourceMappingURL=application.d.ts.map