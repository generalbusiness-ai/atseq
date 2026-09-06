import { $, serializeTree } from '@inlay/core';
import { SourceBundle } from '../../src/definition/source.ts';
import { guitarFixture } from './fixtures.ts';
const text = (value: string) => new TextEncoder().encode(value);
const json = (value: unknown) => text(JSON.stringify(value, null, 2));
export async function guitarEvolution() {
  const old = await guitarFixture();
  const schema = JSON.parse(new TextDecoder().decode(old.files['schemas/data.json']));
  schema.defs.select = { type: 'object', required: ['id'], properties: { id: { type: 'string', minLength: 1, maxLength: 120 } } };
  const query = { lexicon: 1, id: 'test.guitar.selection', defs: { main: { type: 'query', parameters: { type: 'params', properties: {} }, output: { encoding: 'application/json', schema: { type: 'object', required: ['selected'], properties: { selected: { type: 'string', maxLength: 120 } } } } } } };
  const view = JSON.parse(new TextDecoder().decode(old.files['view.json']));
  const template = Object.values(view.records).find((r: any) => r.body) as any;
  template.body.node = serializeTree($('test.atseq.ui.Panel', {}, $('test.atseq.ui.Text', {}, 'Selected: ', $('at.inlay.Binding', { path: ['props', 'selected'] })), $('test.atseq.ui.Action', { action: 'test.guitar.data#select', label: 'Select a candidate' })));
  const manifest = { ...old.manifest, title: 'Weekend guitar shortlist', lexicons: [...old.manifest.lexicons, 'schemas/selection.json'], actions: [...old.manifest.actions, { ref: 'test.guitar.data#select', fold: 'select.jsonata' }], queries: [...old.manifest.queries, { name: 'selection', ref: 'test.guitar.selection', program: 'selection.jsonata' }], views: [{ name: 'selection', source: 'selection-view.json', query: 'selection' }, ...old.manifest.views] };
  const files = { ...old.files, 'schemas/data.json': json(schema), 'schemas/selection.json': json(query), 'select.jsonata': text('($id := act.id; $exists(state.candidates[id = $id]) ? {"decision":"effective","state":{"candidates":state.candidates,"selected":$id}} : {"decision":"ineffective","reason":"unknown_candidate"})'), 'selection.jsonata': text('{"selected":state.selected}'), 'selection-view.json': json(view) };
  return { old, manifest, files, bundle: await SourceBundle.pack(manifest, files), action: 'test.guitar.data#select' };
}
