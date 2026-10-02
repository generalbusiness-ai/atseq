import { type Invitation } from '../protocol/log.ts';
import type { SourceReader } from '../definition/source.ts';
import { Folder, type PersistProjection } from './folder.ts';
/** Runtime registry starts empty; all application vocabulary arrives as source. */
export declare class Applications {
    private readonly apps;
    open(genesis: unknown, expected: Invitation, source: SourceReader, persist?: PersistProjection): Promise<Folder>;
    get(app: string, genesis: string): Folder;
}
//# sourceMappingURL=apps.d.ts.map