import { PdsClient } from './pds.ts';
/** Retain exact source bytes through ordinary PDS blob references. */
export declare class SourceStore {
    private readonly pds;
    constructor(pds: PdsClient);
    private verify;
    put(cid: string, value: Uint8Array): Promise<void>;
    get(cid: string): Promise<Uint8Array>;
    private read;
}
//# sourceMappingURL=source.d.ts.map