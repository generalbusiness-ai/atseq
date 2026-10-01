import taskboard from '../../testdata/source-documents/taskboard.atseq.json' with { type: 'json' };
import guitar from '../../testdata/source-documents/guitar.atseq.json' with { type: 'json' };
import ledger from '../../testdata/source-documents/ledger.atseq.json' with { type: 'json' };
import { PROFILE } from '../../src/core/profile.ts';
import { canonicalJson, type Json } from '../../src/core/values.ts';
import { NSID } from '../../src/core/nsids.ts';
import { SourceBundle } from '../../src/definition/source.ts';
import { sourceDocumentToBundle } from '../../src/definition/document.ts';
import { LoadedDefinition } from '../../src/definition/load.ts';
import { applicationRuntimeCid } from '../../src/protocol/identity.ts';
import { bytes } from '../../src/protocol/wire.ts';
import type { Bytes } from '@atcute/cbor';

export interface CapFixture {
  name: string;
  family: string;
  size: string;
  preparation: 'generic experimental definition' | 'unchanged sample definition';
  source: Bytes;
  sourceCid: string;
  state: Json;
  predecessor: Json;
  growingAction: { ref: string; payload: Json; expected: Json };
  boundedAction: { ref: string; payload: Json; expected: Json };
  expectedQuery: Json;
  rowCount: number;
  canonicalBytes: number;
}
export function equal(actual: unknown, expected: unknown): void {
  if (canonicalJson(actual, 2 ** 24) !== canonicalJson(expected, 2 ** 24)) throw new Error('Values differ');
}
export function byteLength(value: unknown): number {
  return new TextEncoder().encode(canonicalJson(value, 2 ** 24)).length;
}
const text = (source: string) => new TextEncoder().encode(source);
const object = (properties: Record<string, unknown>, required = Object.keys(properties)) => ({
  type: 'object',
  properties,
  required,
});
const integer = { type: 'integer', minimum: 0, maximum: 2 ** 40 };
const string = { type: 'string', maxLength: PROFILE.stateBytes };
function owned<T>(value: T): T {
  return JSON.parse(canonicalJson(value, 2 ** 24));
}

async function generic(family: string, size: string, target: number): Promise<CapFixture> {
  const id = 'ai.generalbusiness.atseq.experiments.cap';
  let values: Json, valueSchema: unknown, count: number, addition: Json, query: string, expectedQuery: Json;
  if (family === 'scalar') {
    values = 1000000;
    valueSchema = integer;
    count = 0;
    addition = { text: 'x' };
    query = '{"value":state.values,"revision":state.revision}';
    expectedQuery = { value: values, revision: 0 };
  } else if (family === 'primitive-array') {
    count = Math.min(PROFILE.sequenceLength, Math.floor((target - 64) / 8));
    values = Array(count).fill(1000000);
    valueSchema = { type: 'array', maxLength: PROFILE.sequenceLength, items: integer };
    addition = { value: 1000000 };
    query = '{"count":$count(state.values),"total":$sum(state.values)}';
    expectedQuery = { count, total: count * 1000000 };
  } else if (family === 'row-array') {
    count = target > 10000 ? 1000 : 10;
    values = Array.from({ length: count }, (_, i) => ({
      id: `r${String(i).padStart(5, '0')}`,
      text: 'x'.repeat(80),
      value: 1000000,
    }));
    valueSchema = { type: 'array', maxLength: 1000, items: object({ id: string, text: string, value: integer }) };
    addition = owned((values as Json[]).at(-1)!);
    query = '{"count":$count(state.values),"total":$sum(state.values.value)}';
    expectedQuery = { count, total: count * 1000000 };
  } else {
    count = target > 10000 ? 4096 : 128;
    values = Object.fromEntries(Array.from({ length: count }, (_, i) => [`k${String(i).padStart(5, '0')}`, 1000000]));
    valueSchema = object(Object.fromEntries(Object.keys(values).map((key) => [key, integer])), ['k00000']);
    addition = { id: `k${String(count - 1).padStart(5, '0')}`, value: 1000000 };
    query = '{"value":$lookup(state.values,"k00000"),"revision":state.revision}';
    expectedQuery = { value: 1000000, revision: 0 };
  }
  const state: any = { padding: '', revision: 0, values };
  const remaining = target - byteLength(state);
  if (remaining < 1) throw new Error(`${family}: fixture exceeds target before padding`);
  state.padding = 'x'.repeat(remaining);
  equal(byteLength(state), target);
  const predecessor = owned(state);
  if (family === 'scalar') predecessor.padding = predecessor.padding.slice(0, -1);
  else if (family === 'wide-object') delete predecessor.values[(addition as any).id];
  else predecessor.values.pop();
  const grow = family === 'scalar' ? 'state.padding & act.text' : 'state.padding';
  const next =
    family === 'scalar'
      ? 'state.values'
      : family === 'wide-object'
        ? '$merge([state.values,{act.id:act.value}])'
        : '$append(state.values,' + (family === 'primitive-array' ? 'act.value' : 'act') + ')';
  const growing = `{"decision":"effective","state":{"padding":${grow},"revision":state.revision,"values":${next}}}`;
  const bounded =
    '{"decision":"effective","state":{"padding":state.padding,"revision":1-state.revision,"values":state.values}}';
  const schema = {
    lexicon: 1,
    id,
    defs: {
      state: object({ padding: string, revision: { type: 'integer', minimum: 0, maximum: 1 }, values: valueSchema }),
      grow:
        family === 'scalar'
          ? object({ text: string })
          : family === 'wide-object'
            ? object({ id: string, value: integer })
            : family === 'primitive-array'
              ? object({ value: integer })
              : object({ id: string, text: string, value: integer }),
      bounded: object({}),
    },
  };
  const resultProperties = Object.fromEntries(Object.keys(expectedQuery as object).map((key) => [key, integer]));
  const summary = {
    lexicon: 1,
    id: id + '.summary',
    defs: {
      main: {
        type: 'query',
        parameters: { type: 'params', properties: {} },
        output: { encoding: 'application/json', schema: object(resultProperties) },
      },
    },
  };
  const bundle = await SourceBundle.pack(
    {
      $type: NSID.definition,
      version: 1,
      profile: { $link: await applicationRuntimeCid() },
      title: `${family} ${size}`,
      lexicons: ['data.json', 'summary.json'],
      state: { ref: id + '#state', initial: 'initial.json' },
      actions: [
        { ref: id + '#grow', fold: 'grow.jsonata' },
        { ref: id + '#bounded', fold: 'bounded.jsonata' },
      ],
      queries: [{ name: 'summary', ref: id + '.summary', program: 'summary.jsonata' }],
      views: [],
    },
    {
      'data.json': text(JSON.stringify(schema)),
      'summary.json': text(JSON.stringify(summary)),
      'initial.json': text(canonicalJson(state)),
      'grow.jsonata': text(growing),
      'bounded.jsonata': text(bounded),
      'summary.jsonata': text(query),
    },
  );
  await LoadedDefinition.load(bundle.root, bundle);
  return {
    name: `${family}-${size}`,
    family,
    size,
    preparation: 'generic experimental definition',
    source: bytes(await bundle.write()),
    sourceCid: bundle.root,
    state,
    predecessor,
    growingAction: { ref: id + '#grow', payload: addition, expected: { decision: 'effective', state } },
    boundedAction: {
      ref: id + '#bounded',
      payload: {},
      expected: { decision: 'effective', state: { ...state, revision: 1 } },
    },
    expectedQuery,
    rowCount: count,
    canonicalBytes: target,
  };
}

async function sample(family: string, size: string, target?: number): Promise<CapFixture> {
  const original = { taskboard, guitar, ledger }[family as 'taskboard'];
  const bundle = await sourceDocumentToBundle(original);
  const count = target ? 1000 : 10;
  const rows: any[] = Array.from({ length: count }, (_, i) => ({
    id: `r${String(i).padStart(5, '0')}`,
    ...(family === 'ledger'
      ? { description: 'x', amountMinor: i % 2 ? -1 : 1 }
      : family === 'guitar'
        ? { title: 'x', pricePence: 100 }
        : { title: 'x' }),
  }));
  const key = family === 'taskboard' ? 'tasks' : family === 'guitar' ? 'candidates' : 'entries';
  const state: any = {
    [key]: rows,
    ...(family === 'taskboard' ? { completed: [] } : family === 'ledger' ? { balanceMinor: 0, currency: 'GBP' } : {}),
  };
  if (target) {
    let remaining = target - byteLength(state);
    for (const row of rows) {
      const field = family === 'ledger' ? 'description' : 'title';
      const added = Math.min(119, remaining);
      row[field] += 'x'.repeat(added);
      remaining -= added;
    }
    if (remaining !== 0) throw new Error('Target cannot be represented within sample text caps');
    equal(byteLength(state), target);
  }
  const predecessor = owned(state),
    addition = predecessor[key].pop();
  if (family === 'ledger') predecessor.balanceMinor -= addition.amountMinor;
  const ref = original.manifest.actions[0]!.ref;
  const expectedQuery: Json =
    family === 'taskboard'
      ? { count, completed: 0 }
      : family === 'guitar'
        ? { count, totalPence: count * 100 }
        : { count, balanceMinor: 0, currency: 'GBP' };
  return {
    name: `${family}-${size}`,
    family,
    size,
    preparation: 'unchanged sample definition',
    source: bytes(await bundle.write()),
    sourceCid: bundle.root,
    state,
    predecessor,
    growingAction: { ref, payload: addition, expected: { decision: 'effective', state } },
    boundedAction: {
      ref,
      payload: rows[0],
      expected: {
        decision: 'ineffective',
        reason: family === 'taskboard' ? 'already_added' : family === 'guitar' ? 'already_listed' : 'already_recorded',
      },
    },
    expectedQuery,
    rowCount: count,
    canonicalBytes: byteLength(state),
  };
}

export async function createFixtures(): Promise<CapFixture[]> {
  const fixtures: CapFixture[] = [];
  for (const family of ['scalar', 'primitive-array', 'row-array', 'wide-object'])
    for (const [size, target] of [
      ['small', 4096],
      ['near-cap', PROFILE.stateBytes - 4096],
      ['at-cap', PROFILE.stateBytes],
    ] as const)
      fixtures.push(await generic(family, size, target));
  for (const family of ['taskboard', 'guitar', 'ledger'])
    for (const [size, target] of [
      ['small', undefined],
      ['near-cap', PROFILE.stateBytes - 4096],
      ['at-cap', PROFILE.stateBytes],
    ] as const)
      fixtures.push(await sample(family, size, target));
  return fixtures;
}
