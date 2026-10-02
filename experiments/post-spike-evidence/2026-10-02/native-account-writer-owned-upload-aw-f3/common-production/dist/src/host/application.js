import { HOST_LIMITS } from '../core/limits.js';
import { SerialQueue } from '../core/queue.js';
import { NSID } from '../core/nsids.js';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { P256PrivateKeyExportable } from '@atcute/crypto';
import { Anchor } from '../protocol/log.js';
import { contentCid, decodeBlock, encodeBlock, link, ProtocolError } from '../protocol/wire.js';
import { applicationRuntimeCid, applicationRuntimeDescriptor } from '../protocol/identity.js';
import { runtimeCid, runtimeDescriptor } from '../protocol/log.js';
import { SourceBundle, SOURCE_POOL_BYTES } from '../definition/source.js';
import { activationPayload, ACTIVATE } from '../definition/control.js';
import { compatibleDefinition } from '../definition/activation.js';
import { LoadedDefinition } from '../definition/load.js';
import { Folder } from '../application/folder.js';
import { describeDefinition } from '../application/definition.js';
import { SourceStore } from './source.js';
import { provisionLog, readSnapshot, Sequencer, SnapshotReader } from './sequencer.js';
import { PdsError } from './pds.js';
import { atomicFile, readJson } from './files.js';
import { HostError, hostFailure } from './errors.js';
export class ApplicationHost {
    directory;
    accounts;
    limits;
    apps = new Map();
    failedRestores = new Map();
    queue = new SerialQueue();
    constructor(directory, accounts, limits = { applications: HOST_LIMITS.applications }) {
        this.directory = directory;
        this.accounts = accounts;
        this.limits = limits;
        if (!Number.isSafeInteger(limits.applications) || limits.applications < 1)
            throw new Error('Application limit must be a positive integer');
    }
    create(id, car, activationKeys) {
        const owned = new Uint8Array(car), keys = [...activationKeys];
        return this.queue.run(async () => {
            if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id))
                throw new ProtocolError('creation_id', 'Expected a stable UUID v4 creation ID');
            const source = await SourceBundle.read(owned), definition = await LoadedDefinition.load(source.root, source);
            const request = await contentCid({ definition: source.root, activationKeys: keys });
            const dir = join(this.directory, id), path = join(dir, 'creation-secret.json');
            let record = await readJson(path);
            if (record && record.request !== request)
                throw new ProtocolError('creation_conflict', 'Creation ID already names different source or grants');
            if (!record) {
                let existing;
                try {
                    existing = await readdir(this.directory);
                }
                catch (error) {
                    if (error.code !== 'ENOENT')
                        throw error;
                    existing = [];
                }
                if (existing.filter((name) => /^[a-f0-9-]{36}$/.test(name)).length >= this.limits.applications)
                    throw new HostError('application_limit', 429, 'Host application limit reached');
                const writer = await P256PrivateKeyExportable.createKeypair();
                record = { request, writer: [...(await writer.exportPrivateKey('raw'))], published: false };
                await atomicFile(join(dir, 'source.car'), owned);
                await atomicFile(path, JSON.stringify(record));
            }
            if (record.anchor && record.genesis && this.apps.has(record.genesis.app))
                return this.created(this.get(record.genesis.app, record.anchor));
            const pds = await this.accounts.open(id), writer = await P256PrivateKeyExportable.importRaw(new Uint8Array(record.writer));
            if (!record.genesis) {
                const genesis = {
                    $type: NSID.genesis,
                    version: 1,
                    app: pds.did,
                    profile: link(await applicationRuntimeCid()),
                    definition: link(source.root),
                    sequencerKey: await writer.exportPublicKey('did'),
                    activationKeys: keys,
                };
                record.genesis = genesis;
                record.anchor = await contentCid(genesis);
                await Anchor.from(genesis, { app: pds.did, genesis: record.anchor });
                await atomicFile(path, JSON.stringify(record));
            }
            const anchor = await Anchor.from(record.genesis, { app: pds.did, genesis: record.anchor });
            const store = new SourceStore(pds);
            for (const cid of source.identities())
                await store.put(cid, await source.get(cid));
            await store.put(await applicationRuntimeCid(), encodeBlock(applicationRuntimeDescriptor));
            await store.put(await runtimeCid(), encodeBlock(runtimeDescriptor));
            let existing;
            try {
                existing = await pds.get(NSID.genesis, 'self');
            }
            catch (error) {
                if (!(error instanceof PdsError) || error.code !== 'RecordNotFound')
                    throw error;
            }
            if (existing) {
                if (existing.cid !== anchor.cid)
                    throw new ProtocolError('anchor', 'Account already has another genesis');
            }
            else {
                try {
                    await provisionLog(pds, anchor);
                }
                catch (error) {
                    // Lost provisioning replies reconcile only against the exact anchor.
                    const retained = await pds.get(NSID.genesis, 'self');
                    if (retained.cid !== anchor.cid)
                        throw error;
                }
            }
            await readSnapshot(pds, anchor);
            record.published = true;
            await atomicFile(path, JSON.stringify(record));
            const app = await this.attach(id, pds, anchor, writer, source, definition);
            return this.created(app);
        });
    }
    async restore() {
        let names;
        try {
            names = await readdir(this.directory);
        }
        catch (e) {
            if (e.code === 'ENOENT')
                return;
            throw e;
        }
        this.failedRestores.clear();
        for (const id of names.filter((n) => /^[a-f0-9-]{36}$/.test(n))) {
            try {
                await this.restoreOne(id);
            }
            catch (error) {
                const { code, message } = hostFailure(error).body;
                this.failedRestores.set(id, {
                    code,
                    name: error instanceof Error ? error.name : 'UnknownError',
                    message: error instanceof Error ? error.message : message,
                });
            }
        }
        await atomicFile(join(this.directory, 'restore-errors.json'), JSON.stringify(this.restorationFailures()));
    }
    restorationFailures() {
        return structuredClone(Object.fromEntries(this.failedRestores));
    }
    async restoreOne(id) {
        const record = await readJson(join(this.directory, id, 'creation-secret.json'));
        if (!record?.published)
            return;
        if (!record.genesis || !record.anchor)
            throw new HostError('creation_record', 503, 'Published application has incomplete local metadata');
        const running = this.apps.get(record.genesis.app);
        if (running) {
            if (running.anchor.cid !== record.anchor)
                throw new ProtocolError('anchor', 'Restored application anchor conflicts with the running app');
            return;
        }
        const pds = await this.accounts.open(id), anchor = await Anchor.from(record.genesis, { app: pds.did, genesis: record.anchor });
        const source = await SourceBundle.read(await readFile(join(this.directory, id, 'source.car')));
        const definition = await LoadedDefinition.load(source.root, new SourceStore(pds));
        await this.attach(id, pds, anchor, await P256PrivateKeyExportable.importRaw(new Uint8Array(record.writer)), source, definition);
    }
    async attach(id, pds, anchor, writer, source, definition) {
        const snapshots = new SnapshotReader(pds, anchor);
        const sequencer = new Sequencer(pds, anchor, writer, join(this.directory, id, 'writer'), undefined, snapshots);
        try {
            const folder = await Folder.open(anchor, new SourceStore(pds));
            const app = { anchor, pds, sequencer, folder, source, definition, snapshots };
            await this.refresh(app);
            this.apps.set(pds.did, app);
            return app;
        }
        catch (error) {
            await sequencer.close();
            throw error;
        }
    }
    get(app, genesis) {
        const found = this.apps.get(app);
        if (!found || found.anchor.cid !== genesis)
            throw new ProtocolError('anchor', 'Application is not available at this invitation');
        return found;
    }
    async refresh(app) {
        const floor = app.snapshots.retainedHead();
        for (;;) {
            if (!app.refreshInFlight) {
                const run = (async () => {
                    const snapshot = await app.snapshots.read();
                    await app.folder.catchUpVerifiedStatus(snapshot.history);
                    return snapshot.history;
                })();
                app.refreshInFlight = run;
                void run
                    .finally(() => {
                    if (app.refreshInFlight === run)
                        app.refreshInFlight = undefined;
                })
                    .catch(() => { });
            }
            const history = await app.refreshInFlight;
            // Cover the floor captured by this call; later appends cannot keep it waiting.
            if (app.snapshots.covers(history, floor)) {
                app.sequencer.checkpoint();
                return history;
            }
        }
    }
    created(app) {
        const { head, frontier } = app.folder.status();
        return { genesis: app.anchor.genesis, genesisCid: link(app.anchor.cid), head, frontier };
    }
    list() {
        return [...this.apps.values()].map((a) => ({
            app: a.anchor.genesis.app,
            genesis: a.anchor.cid,
            title: a.folder.activeDefinition().manifest.title,
        }));
    }
    async describe(app, genesis, includeSource = false) {
        const found = this.get(app, genesis);
        await this.refresh(found);
        const { head, frontier } = found.folder.status();
        const definition = found.folder.activeDefinition();
        return {
            genesis: found.anchor.genesis,
            definition: await describeDefinition(definition, includeSource),
            head,
            frontier,
        };
    }
    async sync(app, genesis) {
        const found = this.get(app, genesis), history = await this.refresh(found);
        // Read retained source through the PDS, even if the host has a local copy.
        // Missing publication content must remain visible to a fresh reader.
        const store = new SourceStore(found.pds);
        for (const cid of found.source.identities())
            await store.get(cid);
        const initial = await found.source.write();
        const candidates = [], seen = new Set();
        let transported = initial.length;
        for (const entry of history.entries) {
            const intent = entry.signedIntent.intent;
            if (intent.action !== ACTIVATE || !found.anchor.genesis.activationKeys.includes(intent.actorKey))
                continue;
            let payload;
            try {
                payload = activationPayload(intent.payload);
            }
            catch {
                continue;
            }
            const identity = payload.closure.join(',');
            if (seen.has(identity))
                continue;
            seen.add(identity);
            if (seen.size > HOST_LIMITS.retainedDefinitions)
                throw new PdsError(503, 'DefinitionHistoryLimit');
            let source;
            try {
                source = await SourceBundle.collectClosure(payload.definition, payload.closure, store);
            }
            catch (error) {
                if (['content_missing', 'content_corrupt'].includes(error?.code))
                    continue;
                throw error;
            }
            const car = await source.writeClosure();
            transported += car.length;
            if (transported > SOURCE_POOL_BYTES)
                throw new PdsError(503, 'DefinitionHistoryLimit');
            candidates.push({ definition: payload.definition, source: car });
        }
        return {
            genesis: found.anchor.genesis,
            genesisCid: genesis,
            head: history.head,
            entries: history.entries,
            source: initial,
            candidates,
        };
    }
    async compareDefinition(app, genesis, expected, car) {
        const found = this.get(app, genesis), history = await this.refresh(found), current = found.folder.activeDefinition(), projection = found.folder.snapshot().projection;
        if (current.cid !== expected)
            throw new ProtocolError('definition_changed', 'App changed; refresh the comparison before applying');
        const source = await SourceBundle.read(car), candidate = await LoadedDefinition.load(source.root, source);
        compatibleDefinition(current, candidate, projection.state);
        const replay = await Folder.open(found.anchor, new SourceStore(found.pds));
        await replay.catchUpVerified(history);
        if (replay.snapshot().stalled || JSON.stringify(replay.snapshot().projection) !== JSON.stringify(projection))
            throw new ProtocolError('replay', 'Existing prefix did not replay to the captured projection');
        return {
            current: await describeDefinition(current),
            candidate: await describeDefinition(candidate),
            closure: source.identities().sort(),
            frontier: projection.frontier,
            head: history.head,
            statePreserved: true,
            replayPassed: true,
        };
    }
    async stageDefinition(app, genesis, expected, car) {
        const owned = new Uint8Array(car), comparison = await this.compareDefinition(app, genesis, expected, owned), source = await SourceBundle.read(owned);
        const store = new SourceStore(this.get(app, genesis).pds);
        for (const cid of source.identities())
            await store.put(cid, await source.get(cid));
        return comparison;
    }
    async submit(block) {
        const signed = decodeBlock(block), app = this.get(signed?.intent?.app, signed?.intent?.genesis?.$link);
        const result = await app.sequencer.submit(block);
        // A confirmed append can return while interpretation is still behind.
        const status = app.folder.status();
        return {
            ...result,
            head: status.head.position > result.head.position ? status.head : result.head,
            frontier: status.frontier,
        };
    }
    async query(app, genesis, name, params) {
        const found = this.get(app, genesis);
        await this.refresh(found);
        return found.folder.query(name, params);
    }
    async receipt(app, genesis, intent) {
        const found = this.get(app, genesis), recorded = await found.sequencer.lookup(intent);
        if (!recorded)
            return undefined;
        await this.refresh(found);
        const receipt = recorded.receipt;
        const { head, frontier, outcome = { $type: NSID.defsPending } } = found.folder.outcomeAt(receipt.position, intent);
        return { receipt, head, frontier, outcome };
    }
    async close() {
        await this.queue.idle();
        for (const app of this.apps.values()) {
            await app.refreshInFlight?.catch(() => { });
            await app.sequencer.close();
        }
        this.apps.clear();
    }
}
//# sourceMappingURL=application.js.map