export { describeDefinition, validateDefinitionInfo, previewSource, } from '../application/definition.js';
export function resolveSchema(info, ref, context) {
    const absolute = ref.startsWith('#') ? `${context}${ref}` : ref;
    const [id, name = 'main'] = absolute.split('#');
    const schema = info.lexicons.find((d) => d.id === id)?.defs[name];
    if (!schema)
        throw new Error(`Unknown schema ${absolute}`);
    return structuredClone(schema);
}
//# sourceMappingURL=definition.js.map