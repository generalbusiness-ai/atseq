import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { P256PrivateKeyExportable } from '@atcute/crypto';
import { Anchor, type Genesis } from '../protocol/log.ts';
import { contentCid, decodeBlock, encodeBlock, link, ProtocolError } from '../protocol/wire.ts';
import { applicationRuntimeCid, applicationRuntimeDescriptor } from '../runtime/identity.ts';
import { runtimeCid, runtimeDescriptor } from '../protocol/log.ts';
import { SourceBundle, SOURCE_POOL_BYTES } from '../definition/source.ts';
import { activationPayload, ACTIVATE } from '../definition/control.ts';
import { compatibleDefinition } from '../definition/activation.ts';
import { LoadedDefinition } from '../definition/load.ts';
import { Folder } from '../runtime/folder.ts';
import { describeDefinition } from '../client/definition.ts';
import { projectionFile } from './projection.ts';
import { SourceStore } from './source.ts';
import { provisionLog, readSnapshot, Sequencer } from './sequencer.ts';
import { PdsError, type PdsClient } from './pds.ts';
import { atomicFile, readJson } from './files.ts';
import type { AccountProvider } from './accounts.ts';

interface Creation { request: string; writer: number[]; genesis?: Genesis; anchor?: string; published: boolean }
interface Running { refreshTail: Promise<unknown>; anchor: Anchor; pds: PdsClient; sequencer: Sequencer; folder: Folder; source: SourceBundle; definition: LoadedDefinition }
export class ApplicationHost {
  private readonly apps = new Map<string, Running>();
  private tail: Promise<unknown> = Promise.resolve();
  constructor(readonly directory: string, private readonly accounts: AccountProvider) {}
  private serial<T>(run: () => Promise<T>): Promise<T> { const next = this.tail.then(run); this.tail = next.catch(() => {}); return next; }
  create(id: string, car: Uint8Array, activationKeys: string[]) {
    const owned = new Uint8Array(car), keys = [...activationKeys];
    return this.serial(async () => {
      if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id)) throw new ProtocolError('creation_id', 'Expected a stable UUID v4 creation ID');
      const source = await SourceBundle.read(owned), definition = await LoadedDefinition.load(source.root, source);
      const request = await contentCid({ definition: source.root, activationKeys: keys });
      const dir = join(this.directory, id), path = join(dir, 'creation-secret.json');
      let record = await readJson<Creation>(path);
      if (record && record.request !== request) throw new ProtocolError('creation_conflict', 'Creation ID already names different source or grants');
      if (!record) {
        const writer = await P256PrivateKeyExportable.createKeypair();
        record = { request, writer: [...await writer.exportPrivateKey('raw')], published: false };
        await atomicFile(join(dir, 'source.car'), owned); await atomicFile(path, JSON.stringify(record));
      }
      if (record.anchor && record.genesis && this.apps.has(record.genesis.app)) return this.created(this.get(record.genesis.app, record.anchor));
      const pds = await this.accounts.open(id), writer = await P256PrivateKeyExportable.importRaw(new Uint8Array(record.writer));
      if (!record.genesis) {
        const genesis = { $type: 'test.atseq.genesis', version: 0, app: pds.did, profile: link(await applicationRuntimeCid()), definition: link(source.root), sequencerKey: await writer.exportPublicKey('did'), activationKeys: keys } as Genesis;
        record.genesis = genesis; record.anchor = await contentCid(genesis);
        await Anchor.from(genesis, record.anchor); await atomicFile(path, JSON.stringify(record));
      }
      const anchor = await Anchor.from(record.genesis, record.anchor!);
      const store = new SourceStore(pds);
      for (const cid of source.identities()) await store.put(cid, await source.get(cid));
      await store.put(await applicationRuntimeCid(), encodeBlock(applicationRuntimeDescriptor));
      await store.put(await runtimeCid(), encodeBlock(runtimeDescriptor));
      let existing;
      try { existing = await pds.get('test.atseq.genesis', 'self'); }
      catch (error) { if (!(error instanceof PdsError) || error.code !== 'RecordNotFound') throw error; }
      if (existing) { if (existing.cid !== anchor.cid) throw new ProtocolError('anchor', 'Account already has another genesis'); }
      else {
        try { await provisionLog(pds, anchor); }
        catch (error) {
          // Lost provisioning replies reconcile only against the exact anchor.
          const retained = await pds.get('test.atseq.genesis', 'self');
          if (retained.cid !== anchor.cid) throw error;
        }
      }
      await readSnapshot(pds, anchor);
      record.published = true; await atomicFile(path, JSON.stringify(record));
      const app = await this.attach(id, pds, anchor, writer, source, definition);
      return this.created(app);
    });
  }
  async restore(): Promise<void> {
    let names: string[];
    try { names = await readdir(this.directory); } catch (e) { if ((e as any).code === 'ENOENT') return; throw e; }
    for (const id of names.filter(n => /^[a-f0-9-]{36}$/.test(n))) {
      const record = await readJson<Creation>(join(this.directory, id, 'creation-secret.json'));
      if (!record?.published || !record.genesis || !record.anchor) continue;
      const pds = await this.accounts.open(id), anchor = await Anchor.from(record.genesis, record.anchor);
      const source = await SourceBundle.read(await readFile(join(this.directory, id, 'source.car')));
      const definition = await LoadedDefinition.load(source.root, new SourceStore(pds));
      await this.attach(id, pds, anchor, await P256PrivateKeyExportable.importRaw(new Uint8Array(record.writer)), source, definition);
    }
  }
  private async attach(id: string, pds: PdsClient, anchor: Anchor, writer: P256PrivateKeyExportable, source: SourceBundle, definition: LoadedDefinition) {
    const sequencer = new Sequencer(pds, anchor, writer, join(this.directory, id, 'writer'));
    try {
      const folder = await Folder.open(anchor, new SourceStore(pds), projectionFile(join(this.directory, id, 'projection.json')));
      const app = { anchor, pds, sequencer, folder, source, definition, refreshTail: Promise.resolve() };
      await this.refresh(app); this.apps.set(pds.did, app); return app;
    } catch (error) { await sequencer.close(); throw error; }
  }
  private get(app: string, genesis: string): Running {
    const found = this.apps.get(app);
    if (!found || found.anchor.cid !== genesis) throw new ProtocolError('anchor', 'Application is not available at this invitation');
    return found;
  }
  private refresh(app: Running) {
    const next = app.refreshTail.then(async () => {
      const snapshot = await readSnapshot(app.pds, app.anchor, app.folder.snapshot().head);
      await app.folder.catchUp(snapshot.history.head, snapshot.history.entries); return snapshot.history;
    });
    app.refreshTail = next.catch(() => {}); return next;
  }
  private created(app: Running) { const { head, projection } = app.folder.snapshot(); return { genesis: app.anchor.genesis, genesisCid: link(app.anchor.cid), head, frontier: projection.frontier }; }
  list() { return [...this.apps.values()].map(a => ({ app: a.anchor.genesis.app, genesis: a.anchor.cid, title: a.folder.activeDefinition().manifest.title })); }
  async describe(app: string, genesis: string) { const found = this.get(app, genesis); await this.refresh(found); const { head, projection } = found.folder.snapshot(); return { genesis: found.anchor.genesis, definition: await describeDefinition(found.folder.activeDefinition()), head, frontier: projection.frontier }; }
  async sync(app: string, genesis: string) {
    const found = this.get(app, genesis), history = await this.refresh(found);
    // Read retained source through the PDS, even if the host has a local copy.
    // Missing publication content must remain visible to a fresh reader.
    const store = new SourceStore(found.pds);
    for (const cid of found.source.identities()) await store.get(cid);
    const initial = await found.source.write();
    const candidates = [], seen = new Set<string>(); let transported = initial.length;
    for (const entry of history.entries) {
      const intent = entry.signedIntent.intent;
      if (intent.action !== ACTIVATE || !found.anchor.genesis.activationKeys.includes(intent.actorKey)) continue;
      let payload; try { payload = activationPayload(intent.payload); } catch { continue; }
      const identity = payload.closure.join(','); if (seen.has(identity)) continue;
      seen.add(identity); if (seen.size > 32) throw new PdsError(503, 'DefinitionHistoryLimit');
      let source;
      try { source = await SourceBundle.collectClosure(payload.definition, payload.closure, store); }
      catch (error) {
        if (['content_missing', 'content_corrupt'].includes((error as any)?.code)) continue;
        throw new PdsError(503, 'DefinitionHistoryLimit');
      }
      const car = await source.writeClosure(); transported += car.length;
      if (transported > SOURCE_POOL_BYTES) throw new PdsError(503, 'DefinitionHistoryLimit');
      candidates.push({ definition: payload.definition, source: car });
    }
    return { genesis: found.anchor.genesis, genesisCid: genesis, head: history.head, entries: history.entries, source: initial, candidates };
  }
  async compareDefinition(app: string, genesis: string, expected: string, car: Uint8Array) {
    const found = this.get(app, genesis), history = await this.refresh(found), current = found.folder.activeDefinition(), projection = found.folder.snapshot().projection;
    if (current.cid !== expected) throw new ProtocolError('definition_changed', 'App changed; refresh the comparison before applying');
    const source = await SourceBundle.read(car), candidate = await LoadedDefinition.load(source.root, source);
    compatibleDefinition(current, candidate, projection.state);
    const replay = await Folder.open(found.anchor, new SourceStore(found.pds)); await replay.catchUp(history.head, history.entries);
    if (replay.snapshot().stalled || JSON.stringify(replay.snapshot().projection) !== JSON.stringify(projection)) throw new ProtocolError('replay', 'Existing prefix did not replay to the captured projection');
    return { current: await describeDefinition(current), candidate: await describeDefinition(candidate), closure: source.identities().sort(), frontier: projection.frontier, head: history.head, statePreserved: true, replayPassed: true };
  }
  async stageDefinition(app: string, genesis: string, expected: string, car: Uint8Array) {
    const owned = new Uint8Array(car), comparison = await this.compareDefinition(app, genesis, expected, owned), source = await SourceBundle.read(owned);
    const store = new SourceStore(this.get(app, genesis).pds);
    for (const cid of source.identities()) await store.put(cid, await source.get(cid));
    return comparison;
  }
  async submit(block: Uint8Array) {
    const signed = decodeBlock(block) as any, app = this.get(signed?.intent?.app, signed?.intent?.genesis?.$link);
    const result = await app.sequencer.submit(block);
    // A confirmed append can return while interpretation is still behind.
    const snapshot = app.folder.snapshot();
    return { ...result, head: snapshot.head.position > result.head.position ? snapshot.head : result.head, frontier: snapshot.projection.frontier };
  }
  async query(app: string, genesis: string, name: string, params: unknown) { const found = this.get(app, genesis); await this.refresh(found); return found.folder.query(name, params); }
  async receipt(app: string, genesis: string, intent: string) {
    const found = this.get(app, genesis), receipt = await found.sequencer.lookup(intent);
    if (!receipt) return undefined;
    await this.refresh(found); const { head, projection } = found.folder.snapshot();
    const outcome = projection.outcomes.find(o => o.intent === intent)?.outcome ?? { $type: 'test.atseq.defs#pending' };
    return { ...receipt, head, frontier: projection.frontier, outcome };
  }
  async close() { await this.tail; for (const app of this.apps.values()) { await app.refreshTail; await app.sequencer.close(); } this.apps.clear(); }
}
