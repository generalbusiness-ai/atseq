import type { DefinitionManifest } from '../definition/load.ts';
export { describeDefinition, previewSource } from '../application/definition.ts';
export interface DefinitionInfo {
  cid: string;
  manifest: DefinitionManifest;
  lexicons: any[];
}
export function resolveSchema(info: DefinitionInfo, ref: string, context?: string): any {
  const absolute = ref.startsWith('#') ? `${context}${ref}` : ref;
  const [id, name = 'main'] = absolute.split('#');
  const schema = info.lexicons.find((d) => d.id === id)?.defs[name];
  if (!schema) throw new Error(`Unknown schema ${absolute}`);
  return structuredClone(schema);
}
