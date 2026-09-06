import { applicationRuntimeCid as runtimeCid } from '../../src/runtime/identity.ts';
import { link } from '../../src/protocol/wire.ts';
import { SourceBundle } from '../../src/definition/source.ts';
import { $, serializeTree } from '@inlay/core';
import { PRIMITIVES } from '../../src/ui/inlay.ts';

const text = (value: string) => new TextEncoder().encode(value);
const json = (value: unknown) => text(JSON.stringify(value, null, 2));
const object = (properties: Record<string, unknown>) => ({ type: 'object', required: Object.keys(properties), properties });
const integer = { type: 'integer', minimum: 0, maximum: 1_000_000 };
const string = { type: 'string', minLength: 1, maxLength: 120 };
function view(action: string, label: string) {
  const did = 'did:plc:retainedfixture', root = 'test.fixture.Summary';
  const records: Record<string, unknown> = Object.fromEntries(PRIMITIVES.map(type => [`at://${did}/at.inlay.component/${type}`, { $type: 'at.inlay.component' }]));
  records[`at://${did}/at.inlay.component/${root}`] = { $type: 'at.inlay.component', imports: [did], body: { $type: 'at.inlay.component#bodyTemplate', node: serializeTree($('test.atseq.ui.Panel', {}, $('test.atseq.ui.Text', {}, 'Items: ', $('at.inlay.Binding', { path: ['props', 'count'] })), $('test.atseq.ui.Action', { action, label }))) } };
  return { root, imports: [did], records };
}

/** Fixture generation, deliberately outside host/runtime source. Call after startup. */
export async function chartFixture(namespace = 'test.rainfall') {
  const record = object({ day: string, millimetres: integer });
  const state = object({ readings: { type: 'array', maxLength: 1000, items: record } });
  const schema = { lexicon: 1, id: `${namespace}.data`, defs: { state, record } };
  const summary = { lexicon: 1, id: `${namespace}.summary`, defs: { main: { type: 'query', parameters: { type: 'params', properties: {} }, output: { encoding: 'application/json', schema: object({ count: integer, total: integer }) } } } };
  const manifest = {
    $type: 'test.atseq.definition', version: 0, profile: link(await runtimeCid()), title: 'Garden rainfall',
    lexicons: ['schemas/data.json', 'schemas/summary.json'], state: { ref: `${namespace}.data#state`, initial: 'initial.json' },
    actions: [{ ref: `${namespace}.data#record`, fold: 'record.jsonata' }],
    queries: [{ name: 'summary', ref: `${namespace}.summary`, program: 'summary.jsonata' }], views: [{ name: 'main', source: 'view.json', query: 'summary' }],
  };
  const files = {
    'schemas/data.json': json(schema), 'schemas/summary.json': json(summary), 'initial.json': json({ readings: [] }),
    'record.jsonata': text('{"decision":"effective","state":{"readings":$append(state.readings,act)}}'),
    'summary.jsonata': text('{"count":$count(state.readings),"total":($count(state.readings) = 0 ? 0 : $sum(state.readings.millimetres))}'),
    'view.json': json(view(`${namespace}.data#record`, 'Record rainfall')),
  };
  return { manifest, files, bundle: await SourceBundle.pack(manifest, files), action: `${namespace}.data#record` };
}

export async function guitarFixture(namespace = 'test.guitar') {
  const candidate = object({ id: string, title: string, pricePence: integer });
  const state = object({ candidates: { type: 'array', maxLength: 1000, items: candidate }, selected: { type: 'string', maxLength: 120 } });
  const schema = { lexicon: 1, id: `${namespace}.data`, defs: { state, candidate } };
  const summary = { lexicon: 1, id: `${namespace}.summary`, defs: { main: { type: 'query', parameters: { type: 'params', properties: {} }, output: { encoding: 'application/json', schema: object({ count: integer, selected: { type: 'string', maxLength: 120 } }) } } } };
  const manifest = {
    $type: 'test.atseq.definition', version: 0, profile: link(await runtimeCid()), title: 'Weekend guitar search',
    lexicons: ['schemas/data.json', 'schemas/summary.json'], state: { ref: `${namespace}.data#state`, initial: 'initial.json' },
    actions: [{ ref: `${namespace}.data#candidate`, fold: 'candidate.jsonata' }],
    queries: [{ name: 'summary', ref: `${namespace}.summary`, program: 'summary.jsonata' }], views: [{ name: 'main', source: 'view.json', query: 'summary' }],
  };
  const files = {
    'schemas/data.json': json(schema), 'schemas/summary.json': json(summary), 'initial.json': json({ candidates: [], selected: '' }),
    'candidate.jsonata': text('($id := act.id; $exists(state.candidates[id = $id]) ? {"decision":"ineffective","reason":"already_listed"} : {"decision":"effective","state":{"candidates":$append(state.candidates,act),"selected":state.selected}})'),
    'summary.jsonata': text('{"count":$count(state.candidates),"selected":state.selected}'),
    'view.json': json(view(`${namespace}.data#candidate`, 'Add candidate')),
  };
  return { manifest, files, bundle: await SourceBundle.pack(manifest, files), action: `${namespace}.data#candidate` };
}
