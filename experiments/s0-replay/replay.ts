import { fromBytes, type Bytes } from '@atcute/cbor';
import { Folder } from '../../src/application/folder.ts';
import { SourceBundle } from '../../src/definition/source.ts';
import {
  Anchor,
  verifyHistory,
  verifiedEntryCid,
  headAt,
  type Genesis,
  type Head,
  type Entry,
} from '../../src/protocol/log.ts';
import { byteLength, equal } from '../complete-state-cap/fixtures.ts';
import type { Json } from '../../src/core/values.ts';

export interface ReplayInput {
  name: string;
  family: string;
  n: number;
  basis: string;
  originalSourceCid: string;
  derivativeSourceCid: string;
  changedSourcePaths: string[];
  initialStateBytes: number;
  finalStateBytes: number;
  initialRows: number;
  finalRows: number;
  genesis: Genesis;
  genesisCid: string;
  source: Bytes;
  head: Head;
  entries: Entry[];
  expectedState: Json;
  query: string;
  expectedQuery: Json;
}

// This independent domain oracle does not invoke the expression evaluator or
// introduce an application query. It checks the retained result after timing.
export function audit(input: ReplayInput, state: any) {
  if (input.family === 'ledger') {
    const ids = new Set<string>();
    let sum = 0;
    for (const row of state.entries) {
      if (ids.has(row.id)) throw new Error('Duplicate journal ID');
      ids.add(row.id);
      sum += row.amountMinor;
    }
    equal(sum, state.balanceMinor);
    equal(state.currency, 'GBP');
    return { rows: ids.size, independentlySummedMinor: sum, currency: 'GBP' };
  }
  if (input.family === 'taskboard') {
    const ids = new Set(state.tasks.map((row: any) => row.id));
    const completed = new Set(state.completed);
    equal(ids.size, state.tasks.length);
    equal(completed.size, state.completed.length);
    for (const id of completed) if (!ids.has(id)) throw new Error('Unknown completed task');
    return { rows: ids.size, completed: completed.size };
  }
  if (input.family === 'guitar-selection') {
    const ids = new Set(state.candidates.map((row: any) => row.id));
    equal(ids.size, state.candidates.length);
    if (!ids.has(state.selected)) throw new Error('Unknown selected candidate');
    return { rows: ids.size, selected: state.selected };
  }
  return { rows: state.values.length, revision: state.revision };
}

export async function measure(inputs: ReplayInput[], samples = 2) {
  const captures = [];
  const failures = [];
  for (const input of inputs) {
    try {
      // Authentic signed history, source reconstruction, loading, independent
      // expectations and warmup are outside every timed whole-replay span.
      const bundle = await SourceBundle.read(fromBytes(input.source));
      equal(bundle.root, input.derivativeSourceCid);
      const anchor = await Anchor.from(input.genesis, { app: input.genesis.app, genesis: input.genesisCid });
      const verified = await verifyHistory(anchor, input.head, input.entries);
      const warmEntries = input.entries.slice(0, 10);
      const warmHead = headAt(anchor, warmEntries.length, verifiedEntryCid(verified, anchor, warmEntries.length));
      const warmHistory = await verifyHistory(anchor, warmHead, warmEntries);
      const warmFolder = await Folder.open(anchor, bundle);
      equal((await warmFolder.catchUpVerifiedStatus(warmHistory)).frontier.position, 10);
      const rows = [];
      let reference;
      for (let sample = 0; sample < samples; sample++) {
        const folder = await Folder.open(anchor, bundle);
        equal(folder.status().frontier.position, 0);
        const before = performance.now();
        const status = await folder.catchUpVerifiedStatus(verified);
        const elapsedMs = performance.now() - before;
        const snapshot = folder.snapshot();
        if (status.stalled) throw new Error(`Replay stalled: ${status.stalled.code}`);
        equal(status.frontier.position, input.n);
        equal(snapshot.projection.state, input.expectedState);
        equal(snapshot.projection.outcomes.length, input.n);
        for (const outcome of snapshot.projection.outcomes)
          equal(outcome.outcome.$type, 'ai.generalbusiness.atseq.defs#effective');
        equal(byteLength(snapshot.projection.state), input.finalStateBytes);
        const domainAudit = audit(input, snapshot.projection.state);
        const query = await folder.query(input.query, {});
        equal(query.result.$type, 'ai.generalbusiness.atseq.defs#queryAvailable');
        equal((query.result as any).value, input.expectedQuery);
        const observed = { frontier: status.frontier, domainAudit, queryValue: (query.result as any).value };
        if (reference) equal(observed, reference);
        else reference = observed;
        rows.push({ sample, repetitions: 1, entriesInterpreted: input.n, elapsedMs });
      }
      captures.push({
        name: input.name,
        family: input.family,
        n: input.n,
        initialStateBytes: input.initialStateBytes,
        finalStateBytes: input.finalStateBytes,
        initialRows: input.initialRows,
        finalRows: input.finalRows,
        rows,
        reference,
      });
    } catch (error) {
      failures.push({ name: input.name, message: (error as Error).message, code: (error as any)?.code });
    }
  }
  return { samples, warmupEntriesPerCell: 10, captures, failures };
}
