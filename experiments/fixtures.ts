import { $, serializeTree } from '@inlay/core';
import { PRIMITIVES, type LocalView } from '../src/ui/inlay.ts';

export const totalsSchemas = [{ lexicon: 1, id: 'test.atseq.totals', defs: {
  main: { type: 'object', required: ['total'], properties: { total: { type: 'integer', minimum: 0 } } },
  add: { type: 'object', required: ['delta'], properties: { delta: { type: 'integer', minimum: 1, maximum: 100 } } },
  summary: { type: 'query', parameters: { type: 'params', properties: {} }, output: { encoding: 'application/json', schema: { type: 'object', required: ['summary'], properties: { summary: { type: 'string' } } } } },
} }];

export const offersSchemas = [{ lexicon: 1, id: 'test.atseq.offers', defs: {
  main: { type: 'object', required: ['offers'], properties: { offers: { type: 'array', items: { type: 'ref', ref: '#offer' } } } },
  offer: { type: 'object', required: ['name', 'availability'], nullable: ['note'], properties: {
    name: { type: 'string', maxLength: 80 }, note: { type: 'string', maxLength: 240 },
    availability: { type: 'union', closed: true, refs: ['test.atseq.availability#weekend', 'test.atseq.availability#weekday'] },
  } },
} }, { lexicon: 1, id: 'test.atseq.availability', defs: {
  weekend: { type: 'object', required: ['day'], properties: { day: { type: 'string', enum: ['Saturday', 'Sunday'] } } },
  weekday: { type: 'object', required: ['hours'], properties: { hours: { type: 'array', items: { type: 'integer', minimum: 0, maximum: 23 } } } },
} }];

export const totalFold = 'act.delta > 0 ? {"decision":"effective","state":{"total":state.total + act.delta}} : {"decision":"ineffective","reason":"not_positive"}';
export const summaryQuery = '{"summary":"Total recorded: " & state.total}';
export const baseInput = { meta: { app: 'did:plc:experiment', position: 1, actorKey: 'experiment', definition: 'candidate' }, act: { delta: 3 }, state: { total: 2 } };

const did = 'did:plc:localdemo';
export function localView(): LocalView {
  const records: Record<string, unknown> = Object.fromEntries(PRIMITIVES.map(type => [`at://${did}/at.inlay.component/${type}`, { $type: 'at.inlay.component' }]));
  records[`at://${did}/at.inlay.component/test.atseq.ui.Example`] = {
    $type: 'at.inlay.component', imports: [did],
    body: { $type: 'at.inlay.component#bodyTemplate', node: serializeTree($('test.atseq.ui.Panel', {},
      $('test.atseq.ui.Text', {}, $('at.inlay.Binding', { path: ['props', 'summary'] })),
      $('test.atseq.ui.Action', { action: 'add', label: 'Record amount' }),
    )) },
  };
  return { root: 'test.atseq.ui.Example', imports: [did], records };
}
