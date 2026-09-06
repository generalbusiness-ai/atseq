import { Lexicons, type LexiconDoc } from '@atproto/lexicon';
import { canonicalJson, safeName } from '../runtime/values.ts';
import { InterpretationError, PROFILE } from '../runtime/profile.ts';

const supported: Record<string, readonly string[]> = {
  object: ['type', 'description', 'required', 'nullable', 'properties'],
  string: ['type', 'description', 'minLength', 'maxLength', 'enum', 'const', 'knownValues', 'format'],
  integer: ['type', 'description', 'minimum', 'maximum', 'enum', 'const'],
  boolean: ['type', 'description', 'const'],
  array: ['type', 'description', 'minLength', 'maxLength', 'items'],
  ref: ['type', 'description', 'ref'],
  union: ['type', 'description', 'refs', 'closed'],
  query: ['type', 'description', 'parameters', 'output', 'errors'],
  params: ['type', 'required', 'properties'],
};

/** Uses the ecosystem's runtime data validator; this is a profile check, not a new IDL. */
export class Schemas {
  private readonly lexicons: Lexicons;
  constructor(documents: unknown[]) {
    canonicalJson(documents, PROFILE.definitionBytes);
    if (!documents.length || documents.length > PROFILE.definitionFiles) throw new InterpretationError('schema_count', 'Expected 1–64 schema documents');
    const ids = new Set<string>();
    const refs: { value: string; id: string; path: string }[] = [];
    function schema(node: any, path: string, id: string) {
      const allowed = node && Object.hasOwn(supported, node.type) ? supported[node.type] : undefined;
      if (!allowed) throw new InterpretationError('unsupported_schema', `${path}: unsupported Lexicon type ${node?.type}`);
      for (const key of Object.keys(node)) if (!allowed.includes(key)) throw new InterpretationError('unsupported_schema', `${path}/${key}: unsupported constraint`);
      if (node.type === 'union' && node.closed !== true) throw new InterpretationError('unsupported_schema', `${path}: this profile requires closed unions`);
      if (node.ref) refs.push({ value: node.ref, id, path });
      for (const ref of node.refs ?? []) refs.push({ value: ref, id, path });
      for (const [name, child] of Object.entries(node.properties ?? {})) {
        if (!safeName(name)) throw new InterpretationError('reserved_key', `${path}/${name}: reserved property`);
        schema(child, `${path}/properties/${name}`, id);
      }
      if (node.items) schema(node.items, `${path}/items`, id);
      if (node.parameters) schema(node.parameters, `${path}/parameters`, id);
      if (node.output) {
        if (node.output.encoding !== 'application/json' || !node.output.schema || Object.keys(node.output).some(k => !['encoding', 'schema', 'description'].includes(k))) throw new InterpretationError('unsupported_schema', `${path}/output: expected a JSON schema`);
        schema(node.output.schema, `${path}/output/schema`, id);
      }
    }
    for (const document of documents as any[]) {
      if (!document || document.lexicon !== 1 || typeof document.id !== 'string' || !document.defs) throw new InterpretationError('invalid_schema', 'Expected a Lexicon 1 document');
      if (Object.keys(document).some(k => !['lexicon', 'id', 'description', 'defs', 'revision'].includes(k))) throw new InterpretationError('unsupported_schema', `${document.id}: unsupported document member`);
      if (ids.has(document.id)) throw new InterpretationError('invalid_schema', `${document.id}: duplicate schema`);
      ids.add(document.id);
      for (const [name, def] of Object.entries(document.defs)) schema(def, `${document.id}#${name}`, document.id);
    }
    try {
      this.lexicons = new Lexicons(structuredClone(documents) as LexiconDoc[]);
      for (const { value, id, path } of refs) {
        const target = value.startsWith('#') ? `${id}${value}` : value;
        if (!this.lexicons.getDef(target)) throw new Error(`${path}: unresolved reference ${target}`);
      }
    } catch (error) { throw new InterpretationError('invalid_schema', String((error as Error).message)); }
  }
  validate(ref: string, value: unknown): void {
    canonicalJson(value);
    const result = this.lexicons.validate(ref, value);
    if (!result.success) throw new InterpretationError('schema_value', result.error.message);
    if (canonicalJson(result.value) !== canonicalJson(value)) throw new InterpretationError('schema_coercion', 'Schema validation changed supplied data');
  }
  queryParams(ref: string, value: unknown): void { this.xrpc(ref, value, 'params'); }
  queryResult(ref: string, value: unknown): void { this.xrpc(ref, value, 'result'); }
  private xrpc(ref: string, value: unknown, kind: 'params' | 'result'): void {
    canonicalJson(value);
    try {
      const validated = kind === 'params' ? this.lexicons.assertValidXrpcParams(ref, value) : this.lexicons.assertValidXrpcOutput(ref, value);
      if (canonicalJson(validated) !== canonicalJson(value)) throw new Error('Validation changed supplied data');
    } catch (error) { throw new InterpretationError('schema_value', String((error as Error).message)); }
  }
}
