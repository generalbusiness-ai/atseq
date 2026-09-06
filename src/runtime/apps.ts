import { Anchor } from '../protocol/log.ts';
import { ProtocolError } from '../protocol/wire.ts';
import type { SourceReader } from '../definition/source.ts';
import { Folder, type PersistProjection } from './folder.ts';

/** Runtime registry starts empty; all application vocabulary arrives as source. */
export class Applications {
  private readonly apps = new Map<string, { anchor: string; pending: Promise<Folder>; folder?: Folder }>();
  async open(genesis: unknown, expectedCid: string, source: SourceReader, persist?: PersistProjection): Promise<Folder> {
    const anchor = await Anchor.from(genesis, expectedCid);
    const existing = this.apps.get(anchor.genesis.app);
    if (existing) {
      if (existing.anchor !== anchor.cid) throw new ProtocolError('anchor', 'An existing application anchor cannot be replaced');
      return existing.pending;
    }
    // Reserve the anchor before source loading or persistence can yield. Two
    // concurrent imports cannot write conflicting initial projections.
    const entry = { anchor: anchor.cid, pending: Folder.open(anchor, source, persist), folder: undefined as Folder | undefined };
    this.apps.set(anchor.genesis.app, entry);
    try { entry.folder = await entry.pending; return entry.folder; }
    catch (error) { this.apps.delete(anchor.genesis.app); throw error; }
  }
  get(app: string, genesis: string): Folder {
    const existing = this.apps.get(app);
    if (!existing?.folder || existing.anchor !== genesis) throw new ProtocolError('anchor', 'Application is not loaded at this anchor');
    return existing.folder;
  }
}
