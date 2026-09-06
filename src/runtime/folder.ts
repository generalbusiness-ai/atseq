import { Anchor, headAt, verifyHistory, type Entry, type Head } from '../protocol/log.ts';
import { contentCid, link } from '../protocol/wire.ts';
import { validateFramework } from '../protocol/schemas.ts';
import { LoadedDefinition } from '../definition/load.ts';
import type { SourceReader } from '../definition/source.ts';
import { evaluate, fold } from './evaluator.ts';
import { InterpretationError } from './profile.ts';
import { jsonCopy, type Json } from './values.ts';
import { applicationRuntimeCid } from './identity.ts';

export type Outcome = { $type: 'test.atseq.defs#effective' } | { $type: 'test.atseq.defs#ineffective'; reason: string; message?: string };
export interface Projection {
  app: string; genesis: string; definition: string;
  frontier: { $type: 'test.atseq.defs#cursor'; position: number; entry: { $link: string } };
  state: Json;
  outcomes: { position: number; entry: string; intent: string; outcome: Outcome }[];
}
export interface Stalled { position: number; code: string; message: string }
export type PersistProjection = (projection: Projection) => Promise<void>;
const ineffective = (reason: string): Outcome => ({ $type: 'test.atseq.defs#ineffective', reason });

/** Pure interpretation of a verified prefix; persistence replaces one snapshot. */
export class Folder {
  private tail: Promise<unknown> = Promise.resolve();
  private head: Head;
  private projection: Projection;
  private stalled?: Stalled;
  private constructor(private readonly anchor: Anchor, private definition: LoadedDefinition, private readonly persist?: PersistProjection) {
    this.head = headAt(anchor);
    this.projection = { app: anchor.genesis.app, genesis: anchor.cid, definition: definition.cid, frontier: { $type: 'test.atseq.defs#cursor', position: 0, entry: link(anchor.cid) }, state: structuredClone(definition.initialState), outcomes: [] };
  }
  static async open(anchor: Anchor, source: SourceReader, persist?: PersistProjection): Promise<Folder> {
    if (anchor.genesis.profile.$link !== await applicationRuntimeCid()) throw new InterpretationError('unsupported_runtime', 'Genesis requires a different runtime profile');
    const definition = await LoadedDefinition.load(anchor.genesis.definition.$link, source);
    if (definition.manifest.profile.$link !== anchor.genesis.profile.$link) throw new InterpretationError('unsupported_runtime', 'Genesis and definition profiles differ');
    const folder = new Folder(anchor, definition, persist);
    await persist?.(folder.snapshot().projection); return folder;
  }
  snapshot(): { head: Head; projection: Projection; stalled?: Stalled } {
    return structuredClone({ head: this.head, projection: this.projection, ...(this.stalled ? { stalled: this.stalled } : {}) });
  }
  catchUp(head: Head, records: unknown[]): Promise<ReturnType<Folder['snapshot']>> {
    const ownedHead = structuredClone(head), ownedRecords = structuredClone(records);
    const result = this.tail.then(() => this.advance(ownedHead, ownedRecords));
    this.tail = result.catch(() => {}); return result;
  }
  private async advance(head: Head, records: unknown[]): Promise<ReturnType<Folder['snapshot']>> {
    const verified = await verifyHistory(this.anchor, head, records);
    const frontier = this.projection.frontier;
    if (head.position < frontier.position) throw new InterpretationError('rollback', 'Chosen prefix is behind interpretation');
    const previous = frontier.position === 0 ? this.anchor.cid : await contentCid(verified.entries[frontier.position - 1]);
    if (previous !== frontier.entry.$link) throw new InterpretationError('fork', 'Chosen prefix differs from interpreted history');
    this.head = structuredClone(verified.head); this.stalled = undefined;
    for (const entry of verified.entries.slice(frontier.position)) {
      try {
        const { state, outcome } = await this.interpret(entry);
        validateFramework(outcome.$type, outcome);
        const entryCid = await contentCid(entry);
        const next: Projection = {
          ...this.projection, state, definition: this.definition.cid,
          frontier: { $type: 'test.atseq.defs#cursor', position: entry.position, entry: link(entryCid) },
          outcomes: [...this.projection.outcomes, { position: entry.position, entry: entryCid, intent: await contentCid(entry.signedIntent.intent), outcome }],
        };
        // State, outcomes and cursor cross the persistence boundary together.
        await this.persist?.(structuredClone(next)); this.projection = next;
      } catch (error) {
        const code = typeof (error as any)?.code === 'string' ? (error as any).code : 'interpretation_failed';
        this.stalled = { position: entry.position, code, message: error instanceof Error ? error.message : 'Interpretation could not complete' };
        break;
      }
    }
    return this.snapshot();
  }
  private async interpret(entry: Entry): Promise<{ state: Json; outcome: Outcome }> {
    const intent = entry.signedIntent.intent, state = this.projection.state;
    if (intent.definition.$link !== this.definition.cid) return { state, outcome: ineffective('definition_changed') };
    const action = this.definition.manifest.actions.find(a => a.ref === intent.action);
    if (!action) return { state, outcome: ineffective('unknown_action') };
    try { this.definition.schemas.validate(action.ref, intent.payload); }
    catch (error) {
      if (error instanceof InterpretationError && ['schema_value', 'schema_coercion'].includes(error.code)) return { state, outcome: ineffective('invalid_action') };
      throw error;
    }
    const result = await fold(this.definition.text(action.fold), { meta: { app: this.anchor.genesis.app, position: entry.position, actorKey: intent.actorKey, definition: this.definition.cid }, act: intent.payload, state });
    if (result.decision === 'ineffective') return { state, outcome: { $type: 'test.atseq.defs#ineffective', reason: result.reason, ...(result.message !== undefined ? { message: result.message } : {}) } };
    this.definition.schemas.validate(this.definition.manifest.state.ref, result.state);
    return { state: result.state, outcome: { $type: 'test.atseq.defs#effective' } };
  }
  async query(name: string, params: unknown) {
    // Capture one complete projection before awaiting evaluation. A concurrent
    // catch-up cannot relabel this result with a later frontier.
    const { head, projection } = this.snapshot(); const definition = this.definition;
    try {
      const query = definition.manifest.queries.find(q => q.name === name);
      if (!query) throw new InterpretationError('unknown_query', `Unknown query: ${name}`);
      const owned = jsonCopy(params); definition.schemas.queryParams(query.ref, owned);
      const { value } = await evaluate(definition.text(query.program), { params: owned, state: projection.state });
      definition.schemas.queryResult(query.ref, value);
      return { head, frontier: projection.frontier, result: { $type: 'test.atseq.defs#queryAvailable' as const, value } };
    } catch (error) {
      return { head, frontier: projection.frontier, result: { $type: 'test.atseq.defs#queryUnavailable' as const, code: typeof (error as any)?.code === 'string' ? (error as any).code : 'query_failed', message: (error instanceof Error ? error.message : 'Query could not complete').slice(0, 1024) } };
    }
  }
}
