import type { DefinitionInfo } from '../application/definition.ts';
export {
  describeDefinition,
  validateDefinitionInfo,
  previewSource,
  type DefinitionInfo,
} from '../application/definition.ts';
export function resolveSchema(info: DefinitionInfo, ref: string, context?: string): any {
  const absolute = ref.startsWith('#') ? `${context}${ref}` : ref;
  const [id, name = 'main'] = absolute.split('#');
  const schema = info.lexicons.find((d) => d.id === id)?.defs[name];
  if (!schema) throw new Error(`Unknown schema ${absolute}`);
  return structuredClone(schema);
}
