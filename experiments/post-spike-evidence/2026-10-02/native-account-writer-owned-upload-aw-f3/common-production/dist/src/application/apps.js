import { Anchor } from '../protocol/log.js';
import { ProtocolError } from '../protocol/wire.js';
import { Folder } from './folder.js';
/** Runtime registry starts empty; all application vocabulary arrives as source. */
export class Applications {
    apps = new Map();
    async open(genesis, expected, source, persist) {
        const anchor = await Anchor.from(genesis, expected);
        const existing = this.apps.get(anchor.genesis.app);
        if (existing) {
            if (existing.anchor !== anchor.cid)
                throw new ProtocolError('anchor', 'An existing application anchor cannot be replaced');
            return existing.pending;
        }
        // Reserve the anchor before source loading or persistence can yield. Two
        // concurrent imports cannot write conflicting initial projections.
        const entry = {
            anchor: anchor.cid,
            pending: Folder.open(anchor, source, persist),
            folder: undefined,
        };
        this.apps.set(anchor.genesis.app, entry);
        try {
            entry.folder = await entry.pending;
            return entry.folder;
        }
        catch (error) {
            this.apps.delete(anchor.genesis.app);
            throw error;
        }
    }
    get(app, genesis) {
        const existing = this.apps.get(app);
        if (!existing?.folder || existing.anchor !== genesis)
            throw new ProtocolError('anchor', 'Application is not loaded at this anchor');
        return existing.folder;
    }
}
//# sourceMappingURL=apps.js.map