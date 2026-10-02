import { SerialQueue } from '../core/queue.js';
import { NSID } from '../core/nsids.js';
import { ACTIVATE, activationPayload } from '../definition/control.js';
import { activationCandidate } from '../definition/activation.js';
import { Anchor, headAt, verifyHistory, assertVerifiedHistory, verifiedEntryCid, } from '../protocol/log.js';
import { contentCid, link } from '../protocol/wire.js';
import { validateFramework } from '../protocol/schemas.js';
import { LoadedDefinition } from '../definition/load.js';
import { evaluate, fold } from '../runtime/evaluator.js';
import { InterpretationError } from '../core/profile.js';
import { jsonCopy } from '../core/values.js';
import { applicationRuntimeCid } from '../protocol/identity.js';
import { errorCode, errorKind, interpretationCode } from '../core/errors.js';
const ineffective = (reason) => ({ $type: NSID.defsIneffective, reason });
/** Pure interpretation of a verified prefix; persistence replaces one snapshot. */
export class Folder {
    anchor;
    definition;
    source;
    persist;
    queue = new SerialQueue();
    head;
    projection;
    stalled;
    constructor(anchor, definition, source, persist) {
        this.anchor = anchor;
        this.definition = definition;
        this.source = source;
        this.persist = persist;
        this.head = headAt(anchor);
        this.projection = {
            app: anchor.genesis.app,
            genesis: anchor.cid,
            definition: definition.cid,
            frontier: { $type: NSID.defsCursor, position: 0, entry: link(anchor.cid) },
            state: structuredClone(definition.initialState),
            outcomes: [],
        };
    }
    static async open(anchor, source, persist) {
        if (anchor.genesis.profile.$link !== (await applicationRuntimeCid()))
            throw new InterpretationError('unsupported_runtime', 'Genesis requires a different runtime profile');
        const definition = await LoadedDefinition.load(anchor.genesis.definition.$link, source);
        if (definition.manifest.profile.$link !== anchor.genesis.profile.$link)
            throw new InterpretationError('unsupported_runtime', 'Genesis and definition profiles differ');
        const folder = new Folder(anchor, definition, source, persist);
        await persist?.(folder.snapshot().projection);
        return folder;
    }
    activeDefinition() {
        return this.definition;
    }
    snapshot() {
        return structuredClone({
            head: this.head,
            projection: this.projection,
            ...(this.stalled ? { stalled: this.stalled } : {}),
        });
    }
    statusValue() {
        return { head: this.head, frontier: this.projection.frontier, ...(this.stalled ? { stalled: this.stalled } : {}) };
    }
    /** Owned metadata at one frontier, without state or outcome history. */
    status() {
        return structuredClone(this.statusValue());
    }
    /** An exact-position observation, bound to the requested intent and its frontier. */
    outcomeAt(position, intent) {
        const observed = Number.isSafeInteger(position) && position > 0 ? this.projection.outcomes[position - 1] : undefined;
        return structuredClone({
            ...this.statusValue(),
            ...(observed && observed.position === position && observed.intent === intent
                ? { outcome: observed.outcome }
                : {}),
        });
    }
    catchUp(head, records) {
        const ownedHead = structuredClone(head), ownedRecords = structuredClone(records);
        return this.queue.run(async () => {
            await this.advanceVerified(await verifyHistory(this.anchor, ownedHead, ownedRecords));
            return this.snapshot();
        });
    }
    catchUpVerified(history) {
        assertVerifiedHistory(history, this.anchor);
        return this.queue.run(async () => {
            await this.advanceVerified(history);
            return this.snapshot();
        });
    }
    /** Catch up without constructing a complete exported projection. */
    catchUpVerifiedStatus(history) {
        assertVerifiedHistory(history, this.anchor);
        return this.queue.run(async () => {
            await this.advanceVerified(history);
            return this.status();
        });
    }
    async advanceVerified(verified) {
        assertVerifiedHistory(verified, this.anchor);
        const head = verified.head;
        const frontier = this.projection.frontier;
        if (head.position < frontier.position)
            throw new InterpretationError('rollback', 'Chosen prefix is behind interpretation');
        const previous = verifiedEntryCid(verified, this.anchor, frontier.position);
        if (previous !== frontier.entry.$link)
            throw new InterpretationError('fork', 'Chosen prefix differs from interpreted history');
        this.head = structuredClone(verified.head);
        this.stalled = undefined;
        for (const entry of verified.entries.slice(frontier.position)) {
            let result;
            try {
                result = await this.interpret(entry);
                validateFramework(result.outcome.$type, result.outcome);
            }
            catch (error) {
                if (errorKind(error) !== 'invalid_input') {
                    this.stalled = {
                        position: entry.position,
                        code: errorCode(error),
                        message: error instanceof Error ? error.message : 'Required content is unavailable',
                    };
                    break;
                }
                // An ordinary action cannot hold the log hostage. This outcome is part
                // of the semantic contract and retains the last committed state.
                let code;
                try {
                    code = interpretationCode(error);
                }
                catch (fault) {
                    this.stalled = { position: entry.position, code: 'runtime_fault', message: fault.message };
                    break;
                }
                result = { state: this.projection.state, outcome: ineffective(`fold_failed/${code}`) };
            }
            const { state, outcome, definition = this.definition } = result;
            const entryCid = await contentCid(entry);
            const next = {
                ...this.projection,
                state,
                definition: definition.cid,
                frontier: { $type: NSID.defsCursor, position: entry.position, entry: link(entryCid) },
                outcomes: this.projection.outcomes,
            };
            const observed = {
                position: entry.position,
                entry: entryCid,
                intent: await contentCid(entry.signedIntent.intent),
                outcome,
            };
            try {
                // Optional persistence receives a complete owned snapshot before memory advances.
                if (this.persist)
                    await this.persist(structuredClone({ ...next, outcomes: [...next.outcomes, observed] }));
                next.outcomes.push(observed);
                this.definition = definition;
                this.projection = next;
            }
            catch (error) {
                this.stalled = {
                    position: entry.position,
                    code: 'persistence_failed',
                    message: error instanceof Error ? error.message : 'Projection could not be persisted',
                };
                break;
            }
        }
    }
    async interpret(entry) {
        const intent = entry.signedIntent.intent, state = this.projection.state;
        if (intent.definition.$link !== this.definition.cid)
            return { state, outcome: ineffective('definition_changed') };
        if (intent.action === ACTIVATE) {
            if (!this.anchor.genesis.activationKeys.includes(intent.actorKey))
                return { state, outcome: ineffective('unauthorized_activation') };
            try {
                const payload = activationPayload(intent.payload);
                if (payload.expected !== this.definition.cid)
                    return { state, outcome: ineffective('definition_changed') };
                const definition = await activationCandidate(this.definition, payload, this.source, state);
                return { state, definition, outcome: { $type: NSID.defsEffective } };
            }
            catch (error) {
                if (errorKind(error) !== 'invalid_input')
                    throw error;
                return {
                    state,
                    outcome: ineffective(errorCode(error) === 'incompatible_definition' ? 'incompatible_definition' : 'invalid_activation'),
                };
            }
        }
        const action = this.definition.manifest.actions.find((a) => a.ref === intent.action);
        if (!action)
            return { state, outcome: ineffective('unknown_action') };
        try {
            this.definition.schemas.validate(action.ref, intent.payload);
        }
        catch (error) {
            if (error instanceof InterpretationError && ['schema_value', 'schema_coercion'].includes(error.code))
                return { state, outcome: ineffective('invalid_action') };
            throw error;
        }
        const result = await fold(this.definition.text(action.fold), {
            meta: {
                app: this.anchor.genesis.app,
                position: entry.position,
                actorKey: intent.actorKey,
                definition: this.definition.cid,
            },
            act: intent.payload,
            state,
        });
        if (result.decision === 'ineffective')
            return {
                state,
                outcome: {
                    $type: NSID.defsIneffective,
                    reason: result.reason,
                    ...(result.message !== undefined ? { message: result.message } : {}),
                },
            };
        this.definition.schemas.validate(this.definition.manifest.state.ref, result.state);
        return { state: result.state, outcome: { $type: NSID.defsEffective } };
    }
    async query(name, params) {
        // Capture only the owned query input before awaiting evaluation. A concurrent
        // catch-up cannot relabel this result with a later frontier.
        const definition = this.definition;
        const { head, frontier, state } = structuredClone({
            head: this.head,
            frontier: this.projection.frontier,
            state: this.projection.state,
        });
        try {
            const query = definition.manifest.queries.find((q) => q.name === name);
            if (!query)
                throw new InterpretationError('unknown_query', `Unknown query: ${name}`);
            const owned = jsonCopy(params);
            definition.schemas.queryParams(query.ref, owned);
            const { value } = await evaluate(definition.text(query.program), { params: owned, state });
            definition.schemas.queryResult(query.ref, value);
            return { head, frontier, result: { $type: NSID.defsQueryAvailable, value } };
        }
        catch (error) {
            return {
                head,
                frontier,
                result: {
                    $type: NSID.defsQueryUnavailable,
                    code: typeof error?.code === 'string' ? error.code : 'query_failed',
                    message: [...(error instanceof Error ? error.message : 'Query could not complete')].slice(0, 1024).join(''),
                },
            };
        }
    }
}
//# sourceMappingURL=folder.js.map