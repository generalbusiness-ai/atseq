import { LoadedDefinition } from './load.ts';
import { SourceBundle, readSource, type SourceReader } from './source.ts';
import { canonicalJson, type Json } from '../runtime/values.ts';
import { InterpretationError, PROFILE } from '../runtime/profile.ts';
import type { Activation } from './control.ts';

/** Compare the reachable state interface, not unrelated actions in its document. */
function stateContract(definition: LoadedDefinition) {
  const documents = new Map(definition.manifest.lexicons.map(path => { const doc = definition.json(path) as any; return [doc.id, doc]; }));
  const definitions: Record<string, unknown> = {};
  function visit(ref: string, context = ''): string {
    const absolute = ref.startsWith('#') ? `${context}${ref}` : ref;
    const [id, name = 'main'] = absolute.split('#'), key = `${id}#${name}`;
    if (Object.hasOwn(definitions, key)) return key;
    const schema = structuredClone(documents.get(id)?.defs[name]);
    if (!schema) throw new InterpretationError('incompatible_definition', 'State reference is unavailable');
    definitions[key] = schema;
    function walk(node: any) {
      if (!node || typeof node !== 'object') return;
      if (node.type === 'ref') node.ref = visit(node.ref, id);
      if (node.type === 'union') node.refs = node.refs.map((ref: string) => visit(ref, id));
      if (node.properties) Object.values(node.properties).forEach(walk);
      if (node.items) walk(node.items);
    }
    walk(schema); return key;
  }
  const root = visit(definition.manifest.state.ref);
  return canonicalJson({ root, definitions }, PROFILE.definitionBytes);
}
export function compatibleDefinition(current: LoadedDefinition, next: LoadedDefinition, state: Json): void {
  if (current.manifest.profile.$link !== next.manifest.profile.$link || stateContract(current) !== stateContract(next)) throw new InterpretationError('incompatible_definition', 'This spike requires the same runtime and complete state schema');
  next.schemas.validate(next.manifest.state.ref, state);
}
export async function activationCandidate(current: LoadedDefinition, payload: Activation, reader: SourceReader, state: Json) {
  // Freeze exactly the signed closure before judging semantics. A PDS reader
  // may hold unrelated staged blocks that another verifier does not possess.
  const blocks = new Map<string, Uint8Array>();
  for (const cid of payload.closure) blocks.set(cid, await readSource(reader, cid));
  // Above: unavailable/corrupt signed content pauses. Below: all signed bytes
  // are available; any missing manifest dependency is an invalid closure.
  try {
    const source = await SourceBundle.collect(payload.definition, payload.closure, { get: async cid => new Uint8Array(blocks.get(cid)!) });
    const next = await LoadedDefinition.load(payload.definition, source);
    const expected = [...new Set([next.cid, ...next.manifest.files.map(file => file.cid)])].sort();
    if (expected.join(',') !== payload.closure.join(',')) throw new Error('Signed closure differs from candidate manifest');
    compatibleDefinition(current, next, state); return next;
  } catch (error) {
    if (error instanceof InterpretationError && error.code === 'incompatible_definition') throw error;
    throw new InterpretationError('invalid_activation', 'The available signed closure is not a valid compatible definition');
  }
}
