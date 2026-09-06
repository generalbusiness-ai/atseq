import { LoadedDefinition, type DefinitionManifest } from '../definition/load.ts';
import { SourceBundle } from '../definition/source.ts';
import { evaluate, fold } from '../runtime/evaluator.ts';
import { jsonCopy, type Json } from '../runtime/values.ts';

export async function describeDefinition(definition: LoadedDefinition) {
  return { cid: definition.cid, manifest: definition.manifest, lexicons: definition.manifest.lexicons.map(path => definition.json(path)) };
}
export async function previewSource(car: Uint8Array, action?: string, payload?: Record<string, Json>, state?: Json) {
  const source = await SourceBundle.read(car), definition = await LoadedDefinition.load(source.root, source);
  let current = state === undefined ? jsonCopy(definition.initialState) : jsonCopy(state);
  definition.schemas.validate(definition.manifest.state.ref, current);
  let outcome: unknown = null;
  if (action) {
    const binding = definition.manifest.actions.find(a => a.ref === action);
    if (!binding) throw new Error('Unknown preview action');
    definition.schemas.validate(binding.ref, payload);
    const result = await fold(definition.text(binding.fold), { state: current, act: payload!, meta: { app: 'did:plc:aaaaaaaaaaaaaaaaaaaaaaaa', position: 1, actorKey: '', definition: definition.cid } });
    if (result.decision === 'effective') { definition.schemas.validate(definition.manifest.state.ref, result.state); current = result.state; }
    outcome = result.decision === 'effective' ? { decision: 'effective' } : result;
  }
  const views = [];
  for (const view of definition.manifest.views) {
    try {
      let props: any = {};
      if (view.query) {
        const query = definition.manifest.queries.find(q => q.name === view.query)!;
        definition.schemas.queryParams(query.ref, {});
        props = (await evaluate(definition.text(query.program), { params: {}, state: current })).value;
        definition.schemas.queryResult(query.ref, props);
      }
      if (!props || Array.isArray(props) || typeof props !== 'object') throw new Error('View query must return object properties');
      views.push({ name: view.name, tree: await definition.view(view.name, props) });
    } catch (error) { views.push({ name: view.name, error: (error as Error).message }); }
  }
  return { definition: await describeDefinition(definition), state: current, outcome, scope: 'local-preview', views };
}
export interface DefinitionInfo { cid: string; manifest: DefinitionManifest; lexicons: any[] }
export function resolveSchema(info: DefinitionInfo, ref: string, context?: string): any {
  const absolute = ref.startsWith('#') ? `${context}${ref}` : ref;
  const [id, name = 'main'] = absolute.split('#');
  const schema = info.lexicons.find(d => d.id === id)?.defs[name];
  if (!schema) throw new Error(`Unknown schema ${absolute}`);
  return structuredClone(schema);
}
