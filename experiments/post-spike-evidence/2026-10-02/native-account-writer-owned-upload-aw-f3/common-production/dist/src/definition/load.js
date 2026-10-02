import { NSID } from '../core/nsids.js';
import { isUtf8 } from '../core/utf8.js';
import { errorKind } from '../core/errors.js';
import { ACTIVATE } from './control.js';
import { Lexicons, ValidationError, jsonToLex } from '@atproto/lexicon';
import { fromString, CODEC_DCBOR, CODEC_RAW } from '@atcute/cid';
import { MissingError } from '../view/render-adapter.js';
import manifestLexicon from '../../lexicons/ai/generalbusiness/atseq/definition.json' with { type: 'json' };
import { decodeBlock, isCidInputError } from '../protocol/wire.js';
import { applicationRuntimeCid } from '../protocol/identity.js';
import { canonicalJson, jsonCopy } from '../core/values.js';
import { evaluate } from '../runtime/evaluator.js';
import { InterpretationError, PROFILE } from '../core/profile.js';
import { resolveView } from '../view/inlay.js';
import { Schemas } from './schemas.js';
import { readSource, SourceBundle } from './source.js';
const manifestSchemas = new Lexicons([manifestLexicon]);
function fail(code, message) {
    throw new InterpretationError(code, message);
}
export function validateDefinitionManifest(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        fail('definition_manifest', 'Manifest must be an object');
    // Only the profile is Lexicon CID data. Never run arbitrary unvalidated
    // fields through jsonToLex's blob conversion before checking the manifest.
    const candidate = { ...value };
    if (candidate.profile &&
        typeof candidate.profile === 'object' &&
        Object.keys(candidate.profile).length === 1 &&
        '$link' in candidate.profile &&
        typeof candidate.profile.$link === 'string')
        candidate.profile = jsonToLex(candidate.profile);
    let valid;
    try {
        valid = manifestSchemas.validate(NSID.definition, candidate);
    }
    catch (error) {
        if (!(error instanceof ValidationError))
            throw error;
        return fail('definition_manifest', 'Manifest must be a Lexicon object');
    }
    if (!valid.success || value.$type !== NSID.definition)
        fail('definition_manifest', `Manifest does not match ${NSID.definition}`);
    // Lexicon is open to extra object fields. The versioned manifest additionally
    // refuses unrecognized bindings so misspelled fields cannot silently disappear.
    function closed(schema, data) {
        if (schema.type === 'ref')
            return closed(manifestSchemas.getDef(schema.ref), data);
        if (schema.type === 'array') {
            data.forEach((v) => closed(schema.items, v));
            return;
        }
        if (schema.type !== 'object')
            return;
        for (const [name, item] of Object.entries(data)) {
            if (name === '$type')
                continue;
            if (!Object.hasOwn(schema.properties, name))
                fail('definition_manifest', `Unknown manifest field: ${name}`);
            closed(schema.properties[name], item);
        }
    }
    closed(manifestSchemas.getDef(NSID.definition), value);
}
function unique(values, label) {
    if (new Set(values).size !== values.length)
        fail('definition_duplicate', `Duplicate ${label}`);
}
function freeze(value) {
    if (value && typeof value === 'object') {
        Object.values(value).forEach(freeze);
        Object.freeze(value);
    }
    return value;
}
function sourceText(files, path) {
    const bytes = files.get(path);
    if (!bytes)
        fail('definition_path', `Undeclared source path: ${path}`);
    if (!isUtf8(bytes))
        return fail('source_utf8', `Source is not UTF-8: ${path}`);
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}
function sourceJson(files, path) {
    try {
        return jsonCopy(JSON.parse(sourceText(files, path)), PROFILE.definitionBytes);
    }
    catch (error) {
        if (!(error instanceof SyntaxError))
            throw error;
        return fail('source_json', `Source is not JSON: ${path}`);
    }
}
export class LoadedDefinition {
    cid;
    manifest;
    schemas;
    initialState;
    files;
    constructor(cid, manifest, schemas, initialState, files) {
        this.cid = cid;
        this.manifest = manifest;
        this.schemas = schemas;
        this.initialState = initialState;
        this.files = files;
    }
    bytes(path) {
        const raw = this.files.get(path);
        if (!raw)
            fail('definition_path', `Undeclared source path: ${path}`);
        return new Uint8Array(raw);
    }
    text(path) {
        return sourceText(this.files, path);
    }
    json(path) {
        return sourceJson(this.files, path);
    }
    async view(name, props) {
        const binding = this.manifest.views.find((v) => v.name === name);
        if (!binding)
            fail('unknown_view', `Unknown view: ${name}`);
        return resolveView(this.json(binding.source), props);
    }
    static async load(cid, reader) {
        const rootBytes = await readSource(reader, cid);
        if (fromString(cid).codec !== CODEC_DCBOR)
            fail('definition_manifest', 'Definition root must use canonical CBOR');
        const manifest = decodeBlock(rootBytes);
        validateDefinitionManifest(manifest);
        if (manifest.profile.$link !== (await applicationRuntimeCid()))
            fail('unsupported_runtime', 'Definition requires a different runtime profile');
        unique(manifest.files.map((f) => f.path), 'source path');
        unique(manifest.lexicons, 'Lexicon path');
        unique(manifest.actions.map((a) => a.ref), 'action');
        unique(manifest.queries.map((q) => q.name), 'query name');
        unique(manifest.views.map((v) => v.name), 'view name');
        if (manifest.actions.some((action) => action.ref === ACTIVATE))
            fail('definition_binding', 'The activation control action cannot be rebound by application source');
        const files = new Map();
        let size = rootBytes.length;
        for (const file of manifest.files) {
            if (!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(file.path) ||
                file.path.split('/').some((p) => !p || p === '.' || p === '..'))
                fail('definition_path', `Invalid local source path: ${file.path}`);
            let parsed;
            try {
                parsed = fromString(file.cid);
            }
            catch (error) {
                if (!isCidInputError(error))
                    throw error;
                fail('definition_path', `Invalid source CID: ${file.path}`);
            }
            if (parsed.codec !== CODEC_RAW)
                fail('definition_path', `Named source file must use a raw CID: ${file.path}`);
            const raw = await readSource(reader, file.cid);
            size += raw.length;
            if (size > PROFILE.definitionBytes)
                fail('definition_size', 'Definition closure exceeds 512 KiB');
            files.set(file.path, raw);
        }
        if (reader instanceof SourceBundle) {
            const expected = new Set([cid, ...manifest.files.map((f) => f.cid)]);
            if (reader.root !== cid || reader.identities().some((id) => !expected.has(id)))
                fail('source_car', 'Bundle contains blocks outside this definition closure');
        }
        const documents = manifest.lexicons.map((path) => sourceJson(files, path));
        const schemas = new Schemas(documents);
        const schemaMap = new Map(documents.map((d) => [d.id, d]));
        const requireType = (ref, type) => {
            const [id, name = 'main', extra] = ref.split('#');
            if (extra !== undefined || schemaMap.get(id)?.defs[name]?.type !== type)
                fail('definition_binding', `${ref}: expected a declared ${type} schema`);
        };
        requireType(manifest.state.ref, 'object');
        const initial = sourceJson(files, manifest.state.initial);
        canonicalJson(initial, PROFILE.stateBytes);
        schemas.validate(manifest.state.ref, initial);
        const definition = new LoadedDefinition(cid, freeze(manifest), schemas, freeze(initial), files);
        const programs = [];
        for (const action of manifest.actions) {
            requireType(action.ref, 'object');
            programs.push(action.fold);
        }
        for (const query of manifest.queries) {
            requireType(query.ref, 'query');
            programs.push(query.program);
        }
        // The pinned evaluator validates its AST before evaluation. Its bounded
        // preflight may lack an action's required data; that is checked on each act.
        const staticFailures = new Set([
            'source_bytes',
            'invalid_source',
            'source_complexity',
            'unsupported_expression',
            'unsupported_function',
            'unsupported_variable',
            'reserved_key',
            'wire_number',
        ]);
        for (const path of new Set(programs)) {
            const source = definition.text(path);
            try {
                await evaluate(source, { meta: {}, act: {}, params: {}, state: {} });
            }
            catch (error) {
                if (errorKind(error) !== 'invalid_input' ||
                    !(error instanceof InterpretationError) ||
                    staticFailures.has(error.code))
                    throw error;
            }
        }
        for (const view of manifest.views) {
            if (view.query && !manifest.queries.some((q) => q.name === view.query))
                fail('definition_binding', `View names an unavailable query: ${view.query}`);
            // Query bindings may be absent during source validation. Structural,
            // capability and expansion errors still make the definition invalid.
            try {
                await definition.view(view.name, {});
            }
            catch (error) {
                if (view.query && error instanceof MissingError)
                    continue;
                if (error instanceof MissingError)
                    throw new InterpretationError('view_props', 'View requires an unavailable property binding');
                throw error;
            }
        }
        return definition;
    }
}
//# sourceMappingURL=load.js.map