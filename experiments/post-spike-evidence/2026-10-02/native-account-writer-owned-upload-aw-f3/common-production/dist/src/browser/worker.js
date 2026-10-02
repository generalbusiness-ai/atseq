import { NSID } from '../core/nsids.js';
import { exportArchive, importArchive, encodeArchive } from '../archive/archive.js';
import { fromBytes } from '@atcute/cbor';
import { fold } from '../runtime/evaluator.js';
import { Folder } from '../application/folder.js';
import { Anchor } from '../protocol/log.js';
import { compatibleDefinition } from '../definition/activation.js';
import { SourceBundle, SourcePool } from '../definition/source.js';
import { LoadedDefinition } from '../definition/load.js';
import { describeDefinition, previewSource } from '../client/definition.js';
import { sameSession } from './session.js';
import { Applications } from '../application/apps.js';
const sources = new Map();
let lastInput;
let session;
let apps = new Applications(), folder, definition;
let queue = Promise.resolve();
self.onmessage = ({ data }) => {
    queue = queue.then(() => handle(data));
};
async function handle(data) {
    try {
        if (!['preview', 'importArchive', 'reset', 'sync'].includes(data.kind) &&
            (!('session' in data) || !sameSession(data.session, session)))
            throw new Error('App session changed. Refresh before continuing.');
        let result;
        switch (data.kind) {
            case 'preview':
                result = await previewSource(new Uint8Array(data.source), data.action, data.payload, data.state);
                break;
            case 'sync': {
                const input = data.input, invitation = { app: data.session.app, genesis: data.session.genesis };
                if (session?.app === invitation.app && session.genesis === invitation.genesis) {
                    if (!sameSession(data.session, session))
                        throw new Error('Definition changed. Refresh before continuing.');
                }
                else if (data.session.definition !== input.genesis.definition.$link) {
                    throw new Error('Initial session must name the genesis definition');
                }
                if (input.genesis.app !== invitation.app || input.genesisCid !== invitation.genesis)
                    throw new Error('Host response differs from the pinned invitation');
                const source = await SourceBundle.read(fromBytes(input.source));
                const anchor = await Anchor.from(input.genesis, invitation);
                if (source.root !== anchor.genesis.definition.$link)
                    throw new Error('Initial CAR differs from genesis');
                await LoadedDefinition.load(source.root, source);
                const key = `${anchor.genesis.app}:${anchor.cid}`, pool = sources.get(key) ?? new SourcePool();
                await pool.add(source);
                for (const candidate of input.candidates ?? []) {
                    const retained = await SourceBundle.readClosure(fromBytes(candidate.source));
                    if (retained.root !== candidate.definition)
                        throw new Error('Candidate CAR differs from declared identity');
                    await pool.add(retained);
                }
                sources.set(key, pool);
                const opened = await apps.open(anchor.genesis, { app: anchor.genesis.app, genesis: anchor.cid }, pool);
                const snapshot = await opened.catchUp(input.head, input.entries);
                folder = opened;
                definition = folder.activeDefinition();
                lastInput = structuredClone(input);
                session = { ...invitation, definition: definition.cid };
                result = { ...snapshot, genesis: anchor.genesis, definition: await describeDefinition(definition), session };
                break;
            }
            case 'exportArchive': {
                if (!lastInput)
                    throw new Error('Open verified history first');
                const archive = await exportArchive(lastInput, { app: folder.snapshot().projection.app, genesis: folder.snapshot().projection.genesis }, data.position);
                result = { bytes: encodeArchive(archive), head: archive.input.head };
                break;
            }
            case 'importArchive': {
                const checked = await importArchive(new Uint8Array(data.source), data.expected);
                result = { input: checked.archive.input, projection: checked.snapshot.projection, retries: checked.retries };
                break;
            }
            case 'compareDefinition': {
                if (!folder || !definition || !lastInput)
                    throw new Error('Open an app first');
                if (definition.cid !== data.expected)
                    throw new Error('App changed; refresh the comparison');
                const source = await SourceBundle.read(new Uint8Array(data.source)), candidate = await LoadedDefinition.load(source.root, source);
                const projection = folder.snapshot().projection;
                compatibleDefinition(definition, candidate, projection.state);
                const anchor = await Anchor.from(lastInput.genesis, { app: projection.app, genesis: projection.genesis }), pool = sources.get(`${anchor.genesis.app}:${anchor.cid}`);
                const replay = await Folder.open(anchor, pool);
                await replay.catchUp(lastInput.head, lastInput.entries);
                if (replay.snapshot().stalled || JSON.stringify(replay.snapshot().projection) !== JSON.stringify(projection))
                    throw new Error('Existing prefix did not replay to the captured projection');
                result = {
                    current: await describeDefinition(definition),
                    candidate: await describeDefinition(candidate),
                    closure: source.identities().sort(),
                    statePreserved: true,
                    replayPassed: true,
                    frontier: projection.frontier,
                };
                break;
            }
            case 'previewPending': {
                if (!folder || !definition)
                    throw new Error('Open an app first');
                const base = folder.snapshot().projection;
                let state = structuredClone(base.state);
                const outcomes = [];
                if (data.intents.length > 100)
                    throw new Error('Pending preview is limited to 100 actions');
                for (const [offset, intent] of data.intents.entries()) {
                    if (intent.definition.$link !== definition.cid) {
                        outcomes.push({ decision: 'ineffective', reason: 'definition_changed' });
                        continue;
                    }
                    const binding = definition.manifest.actions.find((a) => a.ref === intent.action);
                    if (!binding)
                        throw new Error('Unknown queued action');
                    definition.schemas.validate(binding.ref, intent.payload);
                    const outcome = await fold(definition.text(binding.fold), {
                        state,
                        act: intent.payload,
                        meta: {
                            app: base.app,
                            position: base.frontier.position + offset + 1,
                            actorKey: intent.actorKey,
                            definition: definition.cid,
                        },
                    });
                    if (outcome.decision === 'effective') {
                        definition.schemas.validate(definition.manifest.state.ref, outcome.state);
                        state = outcome.state;
                        outcomes.push({ decision: 'effective' });
                    }
                    else
                        outcomes.push(outcome);
                }
                result = { state, outcomes, basedOn: base.frontier };
                break;
            }
            case 'validateAction': {
                if (!definition || !definition.manifest.actions.some((a) => a.ref === data.action))
                    throw new Error('Unknown action');
                definition.schemas.validate(data.action, data.payload);
                result = true;
                break;
            }
            case 'query':
                if (!folder)
                    throw new Error('Open an app first');
                result = await folder.query(data.name, data.params);
                break;
            case 'view': {
                if (!folder || !definition)
                    throw new Error('Open an app first');
                const binding = definition.manifest.views.find((v) => v.name === data.name);
                if (!binding)
                    throw new Error('Unknown view');
                const query = binding.query ? await folder.query(binding.query, data.params ?? {}) : undefined;
                if (query && query.result.$type !== NSID.defsQueryAvailable)
                    throw new Error('View query is unavailable; supply its required parameters');
                const props = query ? query.result.value : {};
                if (!props || Array.isArray(props) || typeof props !== 'object')
                    throw new Error('View query must supply object properties');
                result = await definition.view(data.name, props);
                break;
            }
            case 'reset':
                sources.clear();
                lastInput = undefined;
                apps = new Applications();
                folder = undefined;
                definition = undefined;
                session = undefined;
                result = true;
                break;
            default:
                throw new Error('Unknown worker operation');
        }
        self.postMessage({ id: data.id, result });
    }
    catch (error) {
        self.postMessage({
            id: data.id,
            error: { code: error.code ?? 'unavailable', message: error.message },
        });
    }
}
//# sourceMappingURL=worker.js.map