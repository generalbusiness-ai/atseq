import {
  Lexicons,
  lexiconDoc,
  lexString,
  lexInteger,
  lexBoolean,
  lexRef,
  lexRefUnion,
  ValidationError,
  InvalidLexiconError,
  LexiconDefNotFoundError,
  type LexiconDoc,
} from '@atproto/lexicon';
import { canonicalJson, safeName } from '../core/values.ts';
import { InterpretationError, PROFILE } from '../core/profile.ts';

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
    if (!documents.length || documents.length > PROFILE.definitionFiles)
      throw new InterpretationError('schema_count', 'Expected 1–64 schema documents');
    const ids = new Set<string>();
    const refs: { value: string; id: string; path: string }[] = [];
    function object(value: unknown): value is Record<string, any> {
      return value !== null && typeof value === 'object' && !Array.isArray(value);
    }
    function schema(node: any, path: string, id: string) {
      const allowed =
        object(node) && typeof node.type === 'string' && Object.hasOwn(supported, node.type)
          ? supported[node.type]
          : undefined;
      if (!allowed) throw new InterpretationError('unsupported_schema', `${path}: unsupported Lexicon type`);
      for (const key of Object.keys(node))
        if (!allowed.includes(key))
          throw new InterpretationError('unsupported_schema', `${path}/${key}: unsupported constraint`);
      const malformed = () => {
        throw new InterpretationError('unsupported_schema', `${path}: malformed schema member`);
      };
      if (node.description !== undefined && typeof node.description !== 'string') malformed();
      const leaves = { string: lexString, integer: lexInteger, boolean: lexBoolean, ref: lexRef, union: lexRefUnion };
      const leaf = leaves[node.type as keyof typeof leaves];
      if (leaf && !leaf.safeParse(node).success) malformed();
      for (const field of ['required', 'nullable'])
        if (
          node[field] !== undefined &&
          (!Array.isArray(node[field]) || node[field].some((v: unknown) => typeof v !== 'string'))
        )
          malformed();
      if (node.properties !== undefined && !object(node.properties)) malformed();
      for (const field of ['required', 'nullable'])
        for (const name of node[field] ?? [])
          if (!node.properties || !Object.hasOwn(node.properties, name)) malformed();
      if (node.type === 'array') {
        if (!object(node.items)) malformed();
        for (const field of ['minLength', 'maxLength'])
          if (node[field] !== undefined && (!Number.isSafeInteger(node[field]) || node[field] < 0)) malformed();
        if (node.minLength !== undefined && node.maxLength !== undefined && node.minLength > node.maxLength)
          malformed();
      }
      if (node.parameters !== undefined && (!object(node.parameters) || node.parameters.type !== 'params')) malformed();
      if (node.output !== undefined && !object(node.output)) malformed();
      if (
        node.errors !== undefined &&
        (!Array.isArray(node.errors) ||
          node.errors.some(
            (v: unknown) =>
              !object(v) ||
              typeof v.name !== 'string' ||
              (v.description !== undefined && typeof v.description !== 'string') ||
              Object.keys(v).some((k) => !['name', 'description'].includes(k)),
          ))
      )
        malformed();
      if (node.type === 'union' && node.closed !== true)
        throw new InterpretationError('unsupported_schema', `${path}: this profile requires closed unions`);
      if (node.type === 'ref') {
        if (typeof node.ref !== 'string')
          throw new InterpretationError('unsupported_schema', `${path}: ref must be a string`);
        if (node.ref.split('#').length > 2) malformed();
        refs.push({ value: node.ref, id, path });
      }
      if (node.type === 'union') {
        if (!Array.isArray(node.refs) || node.refs.some((ref: unknown) => typeof ref !== 'string'))
          throw new InterpretationError('unsupported_schema', `${path}: refs must be an array of strings`);
        for (const ref of node.refs) {
          if (ref.split('#').length > 2) malformed();
          refs.push({ value: ref, id, path });
        }
      }
      for (const [name, child] of Object.entries(node.properties ?? {})) {
        if (!safeName(name)) throw new InterpretationError('reserved_key', `${path}/${name}: reserved property`);
        schema(child, `${path}/properties/${name}`, id);
      }
      if (node.items) schema(node.items, `${path}/items`, id);
      if (node.parameters) schema(node.parameters, `${path}/parameters`, id);
      if (node.output) {
        if (
          node.output.encoding !== 'application/json' ||
          !node.output.schema ||
          Object.keys(node.output).some((k) => !['encoding', 'schema', 'description'].includes(k))
        )
          throw new InterpretationError('unsupported_schema', `${path}/output: expected a JSON schema`);
        schema(node.output.schema, `${path}/output/schema`, id);
      }
    }
    for (const document of documents as any[]) {
      // Validate document metadata with the ecosystem parser, then each supported
      // node. Its runtime validator accepts inline object array items, which the
      // published document parser excludes; v1's existing profile retains them.
      if (!object(document) || !object(document.defs) || !lexiconDoc.safeParse({ ...document, defs: {} }).success)
        throw new InterpretationError('invalid_schema', 'Malformed Lexicon document');
      if (!document || document.lexicon !== 1 || typeof document.id !== 'string' || !document.defs)
        throw new InterpretationError('invalid_schema', 'Expected a Lexicon 1 document');
      if (Object.keys(document).some((k) => !['lexicon', 'id', 'description', 'defs', 'revision'].includes(k)))
        throw new InterpretationError('unsupported_schema', `${document.id}: unsupported document member`);
      if (ids.has(document.id)) throw new InterpretationError('invalid_schema', `${document.id}: duplicate schema`);
      ids.add(document.id);
      for (const [name, def] of Object.entries(document.defs)) {
        if (!safeName(name) || name.includes('#'))
          throw new InterpretationError('unsupported_schema', 'Invalid definition name');
        schema(def, `${document.id}#${name}`, document.id);
      }
    }
    try {
      this.lexicons = new Lexicons(structuredClone(documents) as LexiconDoc[]);
      for (const { value, id, path } of refs) {
        const target = value.startsWith('#') ? `${id}${value}` : value;
        if (value.split('#').length > 2)
          throw new InterpretationError('invalid_schema', `${path}: invalid reference ${value}`);
        if (!this.lexicons.getDef(target))
          throw new InterpretationError('invalid_schema', `${path}: unresolved reference ${target}`);
      }
    } catch (error) {
      if (!(error instanceof InvalidLexiconError) && !(error instanceof LexiconDefNotFoundError)) throw error;
      throw new InterpretationError('invalid_schema', error.message);
    }
  }
  validate(ref: string, value: unknown): void {
    canonicalJson(value);
    let result;
    try {
      result = this.lexicons.validate(ref, value);
    } catch (error) {
      if (!(error instanceof ValidationError)) throw error;
      throw new InterpretationError('schema_value', error.message);
    }
    if (!result.success) throw new InterpretationError('schema_value', result.error.message);
    if (canonicalJson(result.value) !== canonicalJson(value))
      throw new InterpretationError('schema_coercion', 'Schema validation changed supplied data');
  }
  queryParams(ref: string, value: unknown): void {
    this.xrpc(ref, value, 'params');
  }
  queryResult(ref: string, value: unknown): void {
    this.xrpc(ref, value, 'result');
  }
  private xrpc(ref: string, value: unknown, kind: 'params' | 'result'): void {
    canonicalJson(value);
    try {
      const validated =
        kind === 'params'
          ? this.lexicons.assertValidXrpcParams(ref, value)
          : this.lexicons.assertValidXrpcOutput(ref, value);
      if (canonicalJson(validated) !== canonicalJson(value))
        throw new InterpretationError('schema_coercion', 'Validation changed supplied data');
    } catch (error) {
      if (!(error instanceof ValidationError)) throw error;
      throw new InterpretationError('schema_value', error.message);
    }
  }
}
