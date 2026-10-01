import { NSID } from '../core/nsids.ts';
import { errorKind, type ErrorCode } from '../core/errors.ts';
import { ACTIVATE } from './control.ts';
import { Lexicons, ValidationError, jsonToLex, type LexiconDoc } from '@atproto/lexicon';
import { fromString, CODEC_DCBOR, CODEC_RAW } from '@atcute/cid';
import { MissingError } from '@inlay/render';
import manifestLexicon from '../../lexicons/ai/generalbusiness/atseq/definition.json';
import { decodeBlock, isCidInputError } from '../protocol/wire.ts';
import { applicationRuntimeCid } from '../protocol/identity.ts';
import { canonicalJson, jsonCopy, type Json } from '../core/values.ts';
import { evaluate } from '../runtime/evaluator.ts';
import { InterpretationError, PROFILE } from '../core/profile.ts';
import { resolveView, type LocalView } from '../view/inlay.ts';
import { Schemas } from './schemas.ts';
import { readSource, SourceBundle, type SourceReader } from './source.ts';

export interface DefinitionManifest {
  $type: typeof NSID.definition;
  version: 1;
  profile: { $link: string };
  title: string;
  files: { path: string; cid: string }[];
  lexicons: string[];
  state: { ref: string; initial: string };
  actions: { ref: string; fold: string }[];
  queries: { name: string; ref: string; program: string }[];
  views: { name: string; source: string; query?: string }[];
}
const manifestSchemas = new Lexicons([manifestLexicon as LexiconDoc]);
function fail(code: ErrorCode, message: string): never {
  throw new InterpretationError(code, message);
}
function manifestShape(value: unknown): asserts value is DefinitionManifest {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    fail('definition_manifest', 'Manifest must be an object');
  // Only the profile is Lexicon CID data. Never run arbitrary unvalidated
  // fields through jsonToLex's blob conversion before checking the manifest.
  const candidate = { ...(value as Record<string, unknown>) };
  if (
    candidate.profile &&
    typeof candidate.profile === 'object' &&
    Object.keys(candidate.profile).length === 1 &&
    '$link' in candidate.profile &&
    typeof candidate.profile.$link === 'string'
  )
    candidate.profile = jsonToLex(candidate.profile);
  let valid;
  try {
    valid = manifestSchemas.validate(NSID.definition, candidate);
  } catch (error) {
    if (!(error instanceof ValidationError)) throw error;
    return fail('definition_manifest', 'Manifest must be a Lexicon object');
  }
  if (!valid.success || (value as any).$type !== NSID.definition)
    fail('definition_manifest', `Manifest does not match ${NSID.definition}`);
  // Lexicon is open to extra object fields. The versioned manifest additionally
  // refuses unrecognized bindings so misspelled fields cannot silently disappear.
  function closed(schema: any, data: any): void {
    if (schema.type === 'ref') return closed(manifestSchemas.getDef(schema.ref), data);
    if (schema.type === 'array') {
      data.forEach((v: any) => closed(schema.items, v));
      return;
    }
    if (schema.type !== 'object') return;
    for (const [name, item] of Object.entries(data)) {
      if (name === '$type') continue;
      if (!Object.hasOwn(schema.properties, name)) fail('definition_manifest', `Unknown manifest field: ${name}`);
      closed(schema.properties[name], item);
    }
  }
  closed(manifestSchemas.getDef(NSID.definition), value);
}
function unique(values: string[], label: string): void {
  if (new Set(values).size !== values.length) fail('definition_duplicate', `Duplicate ${label}`);
}
function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
function sourceText(files: Map<string, Uint8Array>, path: string): string {
  const bytes = files.get(path);
  if (!bytes) fail('definition_path', `Undeclared source path: ${path}`);
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch (error) {
    if (!(error instanceof TypeError) || !/encoded data.*(not valid|invalid)/i.test(error.message)) throw error;
    return fail('source_utf8', `Source is not UTF-8: ${path}`);
  }
}
function sourceJson(files: Map<string, Uint8Array>, path: string): Json {
  try {
    return jsonCopy(JSON.parse(sourceText(files, path)), PROFILE.definitionBytes);
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    return fail('source_json', `Source is not JSON: ${path}`);
  }
}

export class LoadedDefinition {
  private constructor(
    readonly cid: string,
    readonly manifest: Readonly<DefinitionManifest>,
    readonly schemas: Schemas,
    readonly initialState: Json,
    private readonly files: Map<string, Uint8Array>,
  ) {}
  text(path: string): string {
    return sourceText(this.files, path);
  }
  json(path: string): Json {
    return sourceJson(this.files, path);
  }
  async view(name: string, props: Record<string, Json>) {
    const binding = this.manifest.views.find((v) => v.name === name);
    if (!binding) fail('unknown_view', `Unknown view: ${name}`);
    return resolveView(this.json(binding.source) as unknown as LocalView, props);
  }
  static async load(cid: string, reader: SourceReader): Promise<LoadedDefinition> {
    const rootBytes = await readSource(reader, cid);
    if (fromString(cid).codec !== CODEC_DCBOR) fail('definition_manifest', 'Definition root must use canonical CBOR');
    const manifest = decodeBlock(rootBytes);
    manifestShape(manifest);
    if (manifest.profile.$link !== (await applicationRuntimeCid()))
      fail('unsupported_runtime', 'Definition requires a different runtime profile');
    unique(
      manifest.files.map((f) => f.path),
      'source path',
    );
    unique(manifest.lexicons, 'Lexicon path');
    unique(
      manifest.actions.map((a) => a.ref),
      'action',
    );
    unique(
      manifest.queries.map((q) => q.name),
      'query name',
    );
    unique(
      manifest.views.map((v) => v.name),
      'view name',
    );
    if (manifest.actions.some((action) => action.ref === ACTIVATE))
      fail('definition_binding', 'The activation control action cannot be rebound by application source');
    const files = new Map<string, Uint8Array>();
    let size = rootBytes.length;
    for (const file of manifest.files) {
      if (
        !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(file.path) ||
        file.path.split('/').some((p) => !p || p === '.' || p === '..')
      )
        fail('definition_path', `Invalid local source path: ${file.path}`);
      let parsed;
      try {
        parsed = fromString(file.cid);
      } catch (error) {
        if (!isCidInputError(error)) throw error;
        fail('definition_path', `Invalid source CID: ${file.path}`);
      }
      if (parsed.codec !== CODEC_RAW) fail('definition_path', `Named source file must use a raw CID: ${file.path}`);
      const raw = await readSource(reader, file.cid);
      size += raw.length;
      if (size > PROFILE.definitionBytes) fail('definition_size', 'Definition closure exceeds 512 KiB');
      files.set(file.path, raw);
    }
    if (reader instanceof SourceBundle) {
      const expected = new Set([cid, ...manifest.files.map((f) => f.cid)]);
      if (reader.root !== cid || reader.identities().some((id) => !expected.has(id)))
        fail('source_car', 'Bundle contains blocks outside this definition closure');
    }
    const documents = manifest.lexicons.map((path) => sourceJson(files, path));
    const schemas = new Schemas(documents);
    const schemaMap = new Map(documents.map((d) => [(d as any).id, d as any]));
    const requireType = (ref: string, type: string) => {
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
      } catch (error) {
        if (
          errorKind(error) !== 'invalid_input' ||
          !(error instanceof InterpretationError) ||
          staticFailures.has(error.code)
        )
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
      } catch (error) {
        if (view.query && error instanceof MissingError) continue;
        if (error instanceof MissingError)
          throw new InterpretationError('view_props', 'View requires an unavailable property binding');
        throw error;
      }
    }
    return definition;
  }
}
