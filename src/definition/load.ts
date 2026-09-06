import { Lexicons, jsonToLex, type LexiconDoc } from '@atproto/lexicon';
import { fromString, CODEC_DCBOR, CODEC_RAW } from '@atcute/cid';
import { MissingError } from '@inlay/render';
import manifestLexicon from '../../lexicons/test/atseq/definition.json';
import { decodeBlock } from '../protocol/wire.ts';
import { applicationRuntimeCid } from '../runtime/identity.ts';
import { canonicalJson, jsonCopy, type Json } from '../runtime/values.ts';
import { evaluate } from '../runtime/evaluator.ts';
import { InterpretationError, PROFILE } from '../runtime/profile.ts';
import { resolveView, type LocalView } from '../ui/inlay.ts';
import { Schemas } from './schemas.ts';
import { readSource, SourceBundle, type SourceReader } from './source.ts';

export interface DefinitionManifest {
  $type: 'test.atseq.definition'; version: 0; profile: { $link: string }; title: string;
  files: { path: string; cid: string }[]; lexicons: string[];
  state: { ref: string; initial: string };
  actions: { ref: string; fold: string }[];
  queries: { name: string; ref: string; program: string }[];
  views: { name: string; source: string; query?: string }[];
}
const manifestSchemas = new Lexicons([manifestLexicon as LexiconDoc]);
function fail(code: string, message: string): never { throw new InterpretationError(code, message); }
function manifestShape(value: unknown): asserts value is DefinitionManifest {
  let valid;
  try { valid = manifestSchemas.validate('test.atseq.definition', jsonToLex(value as any)); }
  catch { return fail('definition_manifest', 'Manifest must be a Lexicon object'); }
  if (!valid.success || (value as any).$type !== 'test.atseq.definition') fail('definition_manifest', 'Manifest does not match test.atseq.definition');
  // Lexicon is open to extra object fields. The versioned manifest additionally
  // refuses unrecognized bindings so misspelled fields cannot silently disappear.
  function closed(schema: any, data: any): void {
    if (schema.type === 'ref') return closed(manifestSchemas.getDef(schema.ref), data);
    if (schema.type === 'array') { data.forEach((v: any) => closed(schema.items, v)); return; }
    if (schema.type !== 'object') return;
    for (const [name, item] of Object.entries(data)) {
      if (name === '$type') continue;
      if (!Object.hasOwn(schema.properties, name)) fail('definition_manifest', `Unknown manifest field: ${name}`);
      closed(schema.properties[name], item);
    }
  }
  closed(manifestSchemas.getDef('test.atseq.definition'), value);
}
function unique(values: string[], label: string): void {
  if (new Set(values).size !== values.length) fail('definition_duplicate', `Duplicate ${label}`);
}
function freeze<T>(value: T): T {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
function sourceText(files: Map<string, Uint8Array>, path: string): string {
  const bytes = files.get(path);
  if (!bytes) fail('definition_path', `Undeclared source path: ${path}`);
  try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { return fail('source_utf8', `Source is not UTF-8: ${path}`); }
}
function sourceJson(files: Map<string, Uint8Array>, path: string): Json {
  try { return jsonCopy(JSON.parse(sourceText(files, path)), PROFILE.definitionBytes); }
  catch (error) {
    if (error instanceof InterpretationError) throw error;
    return fail('source_json', `Source is not JSON: ${path}`);
  }
}

export class LoadedDefinition {
  private constructor(readonly cid: string, readonly manifest: Readonly<DefinitionManifest>, readonly schemas: Schemas, readonly initialState: Json, private readonly files: Map<string, Uint8Array>) {}
  text(path: string): string { return sourceText(this.files, path); }
  json(path: string): Json { return sourceJson(this.files, path); }
  async view(name: string, props: Record<string, Json>) {
    const binding = this.manifest.views.find(v => v.name === name);
    if (!binding) fail('unknown_view', `Unknown view: ${name}`);
    return resolveView(this.json(binding.source) as unknown as LocalView, props);
  }
  static async load(cid: string, reader: SourceReader): Promise<LoadedDefinition> {
    const rootBytes = await readSource(reader, cid);
    if (fromString(cid).codec !== CODEC_DCBOR) fail('definition_manifest', 'Definition root must use canonical CBOR');
    const manifest = decodeBlock(rootBytes); manifestShape(manifest);
    if (manifest.profile.$link !== await applicationRuntimeCid()) fail('unsupported_runtime', 'Definition requires a different runtime profile');
    unique(manifest.files.map(f => f.path), 'source path'); unique(manifest.lexicons, 'Lexicon path');
    unique(manifest.actions.map(a => a.ref), 'action'); unique(manifest.queries.map(q => q.name), 'query name'); unique(manifest.views.map(v => v.name), 'view name');
    const files = new Map<string, Uint8Array>(); let size = rootBytes.length;
    for (const file of manifest.files) {
      if (!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(file.path) || file.path.split('/').some(p => !p || p === '.' || p === '..')) fail('definition_path', `Invalid local source path: ${file.path}`);
      if (fromString(file.cid).codec !== CODEC_RAW) fail('definition_path', `Named source file must use a raw CID: ${file.path}`);
      const raw = await readSource(reader, file.cid); size += raw.length;
      if (size > PROFILE.definitionBytes) fail('definition_size', 'Definition closure exceeds 512 KiB');
      files.set(file.path, raw);
    }
    if (reader instanceof SourceBundle) {
      const expected = new Set([cid, ...manifest.files.map(f => f.cid)]);
      if (reader.root !== cid || reader.identities().some(id => !expected.has(id))) fail('source_car', 'Bundle contains blocks outside this definition closure');
    }
    const documents = manifest.lexicons.map(path => sourceJson(files, path));
    const schemas = new Schemas(documents);
    const schemaMap = new Map(documents.map(d => [(d as any).id, d as any]));
    const requireType = (ref: string, type: string) => {
      const [id, name = 'main', extra] = ref.split('#');
      if (extra !== undefined || schemaMap.get(id)?.defs[name]?.type !== type) fail('definition_binding', `${ref}: expected a declared ${type} schema`);
    };
    requireType(manifest.state.ref, 'object');
    const initial = sourceJson(files, manifest.state.initial);
    canonicalJson(initial, PROFILE.stateBytes);
    try { schemas.validate(manifest.state.ref, initial); }
    catch (error) {
      if (error instanceof InterpretationError) throw error;
      fail('schema_value', (error as Error).message);
    }
    const definition = new LoadedDefinition(cid, freeze(manifest), schemas, freeze(initial), files);
    const programs = [];
    for (const action of manifest.actions) { requireType(action.ref, 'object'); programs.push(action.fold); }
    for (const query of manifest.queries) { requireType(query.ref, 'query'); programs.push(query.program); }
    // The pinned evaluator validates its AST before evaluation. Its bounded
    // preflight may lack an action's required data; that is checked on each act.
    const staticFailures = new Set(['source_bytes', 'invalid_source', 'source_complexity', 'unsupported_expression', 'unsupported_function', 'unsupported_variable', 'reserved_key', 'wire_number']);
    for (const path of new Set(programs)) {
      const source = definition.text(path);
      try { await evaluate(source, { meta: {}, act: {}, params: {}, state: {} }); }
      catch (error) { if (!(error instanceof InterpretationError) || staticFailures.has(error.code)) throw error; }
    }
    for (const view of manifest.views) {
      if (view.query && !manifest.queries.some(q => q.name === view.query)) fail('definition_binding', `View names an unavailable query: ${view.query}`);
      // Query bindings may be absent during source validation. Structural,
      // capability and expansion errors still make the definition invalid.
      try { await definition.view(view.name, {}); }
      catch (error) {
        if (view.query && error instanceof MissingError) continue;
        throw error;
      }
    }
    return definition;
  }
}
