import { LoadedDefinition, validateDefinitionManifest } from '../definition/load.js';
import { SourceBundle } from '../definition/source.js';
import { sourceDocumentFromDefinition, sourceDocumentToBundle } from '../definition/document.js';
import { HOST_LIMITS } from '../core/limits.js';
import { InterpretationError } from '../core/errors.js';
import { link } from '../protocol/wire.js';
import { evaluate, fold } from '../runtime/evaluator.js';
import { canonicalJson, jsonCopy } from '../core/values.js';
export async function describeDefinition(definition, includeSource = false) {
    return {
        version: 1,
        cid: definition.cid,
        manifest: jsonCopy(definition.manifest, HOST_LIMITS.bodyBytes),
        lexicons: definition.manifest.lexicons.map((path) => definition.json(path)),
        ...(includeSource ? { source: sourceDocumentFromDefinition(definition) } : {}),
    };
}
/** Discovery is closed/versioned service data. Source verification never establishes the active frontier. */
export async function validateDefinitionInfo(input) {
    const value = JSON.parse(canonicalJson(input, HOST_LIMITS.bodyBytes));
    const required = ['version', 'cid', 'manifest', 'lexicons'];
    if (!value ||
        Array.isArray(value) ||
        typeof value !== 'object' ||
        value.version !== 1 ||
        required.some((name) => !Object.hasOwn(value, name)) ||
        Object.keys(value).some((name) => ![...required, 'source'].includes(name)) ||
        !Array.isArray(value.lexicons))
        throw new InterpretationError('definition_manifest', 'Expected version 1 definition discovery');
    link(value.cid);
    validateDefinitionManifest(value.manifest);
    if (value.lexicons.length !== value.manifest.lexicons.length)
        throw new InterpretationError('definition_manifest', 'Discovery Lexicons differ from manifest bindings');
    if (Object.hasOwn(value, 'source')) {
        const source = await sourceDocumentToBundle(value.source);
        if (source.root !== value.cid)
            throw new InterpretationError('content_corrupt', 'Discovery source differs from its CID');
        const reconstructed = await describeDefinition(await LoadedDefinition.load(source.root, source));
        if (canonicalJson(reconstructed.manifest, HOST_LIMITS.bodyBytes) !==
            canonicalJson(value.manifest, HOST_LIMITS.bodyBytes) ||
            canonicalJson(reconstructed.lexicons, HOST_LIMITS.bodyBytes) !==
                canonicalJson(value.lexicons, HOST_LIMITS.bodyBytes))
            throw new InterpretationError('content_corrupt', 'Discovery metadata differs from reconstructed source');
    }
    return value;
}
export async function previewSource(car, action, payload, state) {
    const source = await SourceBundle.read(car), definition = await LoadedDefinition.load(source.root, source);
    let current = state === undefined ? jsonCopy(definition.initialState) : jsonCopy(state);
    definition.schemas.validate(definition.manifest.state.ref, current);
    let outcome = null;
    if (action) {
        const binding = definition.manifest.actions.find((a) => a.ref === action);
        if (!binding)
            throw new Error('Unknown preview action');
        definition.schemas.validate(binding.ref, payload);
        const result = await fold(definition.text(binding.fold), {
            state: current,
            act: payload,
            meta: { app: 'did:plc:aaaaaaaaaaaaaaaaaaaaaaaa', position: 1, actorKey: '', definition: definition.cid },
        });
        if (result.decision === 'effective') {
            definition.schemas.validate(definition.manifest.state.ref, result.state);
            current = result.state;
        }
        outcome = result.decision === 'effective' ? { decision: 'effective' } : result;
    }
    const views = [];
    for (const view of definition.manifest.views) {
        try {
            let props = {};
            if (view.query) {
                const query = definition.manifest.queries.find((q) => q.name === view.query);
                definition.schemas.queryParams(query.ref, {});
                props = (await evaluate(definition.text(query.program), { params: {}, state: current })).value;
                definition.schemas.queryResult(query.ref, props);
            }
            if (!props || Array.isArray(props) || typeof props !== 'object')
                throw new Error('View query must return object properties');
            views.push({ name: view.name, tree: await definition.view(view.name, props) });
        }
        catch (error) {
            views.push({ name: view.name, error: error.message });
        }
    }
    return { definition: await describeDefinition(definition), state: current, outcome, scope: 'local-preview', views };
}
//# sourceMappingURL=definition.js.map