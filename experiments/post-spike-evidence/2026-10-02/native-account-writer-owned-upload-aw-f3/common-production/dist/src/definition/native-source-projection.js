/** Authored schema projection; maintained Lexicons rewrites are never identity inputs. */
import { canonicalJson, jsonCopy } from '../core/values.js';
import { InterpretationError, PROFILE } from '../core/profile.js';
import { create, CODEC_RAW, toString } from '@atcute/cid';
function fail(message) {
    throw new InterpretationError('definition_binding', message);
}
export function normalizeNativeRef(ref, context = '') {
    const absolute = ref.startsWith('#') ? context + ref : ref;
    const [document, name = 'main', extra] = absolute.split('#');
    if (!document || !name || extra !== undefined)
        fail('Expected a declared schema reference');
    return `${document}#${name}`;
}
/** Visit schema positions only: literal properties, const/default/enum keep their exact data. */
export function nativeSchemaProjection(documents, stateRef, actionRef) {
    const authored = new Map(documents.map((document) => [document.id, document]));
    const pending = [];
    const normalize = (ref, context = '') => {
        const identity = normalizeNativeRef(ref, context);
        pending.push(identity);
        return identity;
    };
    const stateRoot = normalize(stateRef);
    const actionRoot = actionRef === undefined ? undefined : normalize(actionRef);
    const definitions = {};
    for (let index = 0; index < pending.length; index++) {
        const identity = pending[index];
        if (Object.hasOwn(definitions, identity))
            continue;
        const [document, name] = identity.split('#');
        const source = authored.get(document)?.defs?.[name];
        if (!source || typeof source !== 'object')
            fail(`Unresolved schema reference: ${identity}`);
        const owned = jsonCopy(source, PROFILE.definitionBytes);
        definitions[identity] = owned;
        const nodes = [owned];
        for (let cursor = 0; cursor < nodes.length; cursor++) {
            const node = nodes[cursor];
            delete node.description;
            if (node.type === 'ref')
                node.ref = normalize(node.ref, document);
            if (node.type === 'union') {
                if (node.closed !== true || !Array.isArray(node.refs))
                    fail('Expected a closed schema union');
                node.refs = node.refs.map((ref) => normalize(ref, document));
            }
            for (const child of Object.values(node.properties ?? {}))
                nodes.push(child);
            if (node.items)
                nodes.push(node.items);
            if (node.parameters)
                nodes.push(node.parameters);
            if (node.output) {
                delete node.output.description;
                if (node.output.schema)
                    nodes.push(node.output.schema);
            }
            for (const error of node.errors ?? [])
                delete error.description;
        }
    }
    const result = { stateRoot, ...(actionRoot === undefined ? {} : { actionRoot }), definitions };
    canonicalJson(result, PROFILE.definitionBytes);
    return result;
}
export function nativeProjectionBytes(projection) {
    return new TextEncoder().encode(canonicalJson(projection, PROFILE.definitionBytes));
}
export async function nativeProjectionCid(projection) {
    return toString(await create(CODEC_RAW, nativeProjectionBytes(projection)));
}
//# sourceMappingURL=native-source-projection.js.map