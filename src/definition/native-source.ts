/** Private complete-source owner. These facts do not select an active definition or authorize execution. */
import { deepFreeze } from '../core/freeze.ts';
import { canonicalJson, jsonCopy, type Json } from '../core/values.ts';
import { InterpretationError, PROFILE } from '../core/profile.ts';
import { ProtocolError, type AtseqError } from '../core/errors.ts';
import { isUtf8 } from '../core/utf8.ts';
import { evaluate } from '../runtime/evaluator.ts';
import { NATIVE_NSID, nativeRef } from '../protocol/native-schema.ts';
import { readNativeValue } from '../protocol/native-wire.ts';
import { parseStrictJson, StrictJsonError } from '../protocol/strict-json.ts';
import { contentCid, link } from '../protocol/wire.ts';
import { resolveView, type LocalView } from '../view/inlay.ts';
import { MissingError } from '../view/render-adapter.ts';
import { ACTIVATE } from './control.ts';
import type { DefinitionManifest } from './load.ts';
import { Schemas } from './schemas.ts';
import {
  assertNativeSourceContract,
  frameNativeSourceBytes,
  NATIVE_SOURCE_CONTRACT,
  validateNativeSourceShape,
} from './native-source-contract.ts';
import {
  nativeProjectionBytes,
  nativeProjectionCid,
  nativeSchemaProjection,
  normalizeNativeRef,
  type NativeSchemaProjection,
} from './native-source-projection.ts';
import {
  collectNativeSourceClosure,
  type NativeSourceReader,
  type NativeSourceReadOptions,
} from './native-source-transport.ts';

export type NativeActionAuthorization =
  | { $type: 'ai.generalbusiness.atseq.defs#openParticipation' }
  | { $type: 'ai.generalbusiness.atseq.defs#requiredRole'; role: string };
export interface NativeDefinitionManifest extends Omit<DefinitionManifest, 'version' | 'actions'> {
  version: 2;
  actions: { ref: string; fold: string; authorization: NativeActionAuthorization }[];
}
declare const definitionBrand: unique symbol;
declare const actionBrand: unique symbol;
export interface NativeSourceDefinition {
  readonly [definitionBrand]: true;
}
export interface NativeSourceAction {
  readonly [actionBrand]: true;
}
export interface NativeSourceDefinitionFacts {
  cid: string;
  semantics: string;
  closure: readonly string[];
  manifest: Readonly<NativeDefinitionManifest>;
  initialState: Json;
  stateProjection: NativeSchemaProjection;
  stateProjectionCid: string;
  logicalCarBytes: number;
  decodedOccurrenceBytes: number;
}
export interface NativeSourceActionFacts {
  definition: string;
  ref: string;
  execution: string;
  projectionCid: string;
  projectionLocator: string;
  projection: NativeSchemaProjection;
  contract: Readonly<Record<string, unknown>>;
}
interface DefinitionData {
  facts: NativeSourceDefinitionFacts;
  files: Map<string, Uint8Array>;
  schemas: Schemas;
  actions: Map<string, NativeSourceAction>;
}
interface ActionData {
  facts: NativeSourceActionFacts;
  projectionBytes: Uint8Array;
  projectionBlocks: readonly { cid: string; raw: Uint8Array }[];
  fold: string;
}
const definitions = new WeakMap<NativeSourceDefinition, DefinitionData>();
const actions = new WeakMap<NativeSourceAction, ActionData>();
function definitionData(capability: NativeSourceDefinition): DefinitionData {
  const data = definitions.get(capability);
  if (!data) throw new TypeError('Expected a privately admitted native source definition');
  return data;
}
function actionData(capability: NativeSourceAction): ActionData {
  const data = actions.get(capability);
  if (!data) throw new TypeError('Expected a privately admitted native source action');
  return data;
}
function fail(message: string): never {
  throw new InterpretationError('invalid_activation', message);
}
function unique(values: string[], label: string): void {
  if (new Set(values).size !== values.length) fail(`Duplicate ${label}`);
}
function sourceRaw(files: Map<string, Uint8Array>, path: string): Uint8Array {
  const raw = files.get(path);
  if (!raw) fail('Source binding names an undeclared path');
  return raw;
}
function sourceText(files: Map<string, Uint8Array>, path: string): string {
  const raw = sourceRaw(files, path);
  if (!isUtf8(raw)) throw new InterpretationError('source_utf8', 'Used source is not UTF-8');
  return new TextDecoder('utf-8', { fatal: true }).decode(raw);
}
function sourceJson(files: Map<string, Uint8Array>, path: string): Json {
  let value;
  try {
    value = parseStrictJson(sourceRaw(files, path), PROFILE.definitionBytes, PROFILE.inputDepth);
  } catch (error) {
    if (!(error instanceof StrictJsonError) || error.constructor !== StrictJsonError || error.reason === 'input')
      throw error;
    throw new InterpretationError('source_json', `Used source is not strict JSON: ${error.reason}`);
  }
  return jsonCopy(value, PROFILE.definitionBytes);
}
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

export interface NativeSourceTarget {
  readonly root: string;
  readonly expectedSemantics: string;
  readonly closure: readonly string[];
}
/** Source facts only. A coordinator must call this owner itself with its authorized captured target. */
export type NativeSourceFacts =
  | { readonly kind: 'admitted'; readonly definition: NativeSourceDefinition }
  | { readonly kind: 'proven_invalid' }
  | { readonly kind: 'incompatible'; readonly actualSemantics: string };
type Checked<T> = { ok: true; value: T } | { ok: false; error: AtseqError };
type CheckedSource =
  | { kind: 'admitted'; definition: NativeSourceDefinition }
  | { kind: 'proven_invalid'; error: AtseqError }
  | { kind: 'incompatible'; actualSemantics: string; error: AtseqError };
const dataDependentFailures = new Set([
  'engine_input',
  'absent_result',
  'sum_overflow',
  'inspection_budget',
  'step_budget',
  'evaluation_depth',
  'sequence_limit',
  'value_bytes',
  'value_depth',
  'wire_value',
  'unicode',
]);
const valueFailures = ['value_bytes', 'value_depth', 'wire_value', 'wire_number', 'reserved_key', 'unicode'];
const manifestFailures = [
  ...valueFailures,
  'envelope',
  'wire_bytes',
  'wire_cid',
  'wire_key',
  'wire_size',
  'wire_depth',
];
const sourceFailures = [
  ...valueFailures,
  'invalid_activation',
  'source_json',
  'source_utf8',
  'schema_count',
  'invalid_schema',
  'unsupported_schema',
  'schema_value',
  'schema_coercion',
  'definition_binding',
];
const viewFailures = [
  ...valueFailures,
  'view_source',
  'view_limit',
  'view_props',
  'unknown_component',
  'unknown_primitive',
  'external_view',
];
function knownInput(error: unknown, codes: readonly string[]): error is AtseqError {
  return (
    (error instanceof InterpretationError || error instanceof ProtocolError) &&
    (error.constructor === InterpretationError || error.constructor === ProtocolError) &&
    codes.includes(error.code)
  );
}
/** Only pure owned-source calls belong in this scope; reader callbacks never do. */
function checkInput<T>(run: () => T, codes: readonly string[]): Checked<T> {
  try {
    return { ok: true, value: run() };
  } catch (error) {
    if (!knownInput(error, codes)) throw error;
    return { ok: false, error };
  }
}
function invalidSource(error: AtseqError): CheckedSource {
  return { kind: 'proven_invalid', error };
}
function captureTarget(target: NativeSourceTarget): NativeSourceTarget {
  if (!Array.isArray(target.closure)) throw new TypeError('Expected an exact native source closure vector');
  const root = target.root;
  const expectedSemantics = target.expectedSemantics;
  const closure = [...target.closure];
  if (
    typeof root !== 'string' ||
    typeof expectedSemantics !== 'string' ||
    closure.some((cid) => typeof cid !== 'string')
  )
    throw new TypeError('Expected a native source target with string identities');
  return Object.freeze({ root, expectedSemantics, closure: Object.freeze(closure) });
}

export async function assessNativeSource(
  target: NativeSourceTarget,
  reader: NativeSourceReader,
  localOptions: NativeSourceReadOptions = {},
): Promise<NativeSourceFacts> {
  // Capture before conformance's first await. No queued/cached facts are accepted from callers.
  const owned = captureTarget(target);
  const options = { ...localOptions };
  const result = await checkSource(owned, reader, options);
  if (result.kind === 'proven_invalid') return Object.freeze({ kind: result.kind });
  if (result.kind === 'incompatible')
    return Object.freeze({ kind: result.kind, actualSemantics: result.actualSemantics });
  return Object.freeze({ kind: result.kind, definition: result.definition });
}
/** Diagnostic convenience. Publicly constructible thrown errors never serve as source facts. */
export async function admitNativeSourceDefinition(
  cid: string,
  closure: readonly string[],
  reader: NativeSourceReader,
  localOptions: NativeSourceReadOptions = {},
): Promise<NativeSourceDefinition> {
  const owned = captureTarget({ root: cid, expectedSemantics: NATIVE_SOURCE_CONTRACT.application, closure });
  const result = await checkSource(owned, reader, { ...localOptions });
  if (result.kind !== 'admitted') throw result.error;
  return result.definition;
}
async function checkSource(
  target: NativeSourceTarget,
  reader: NativeSourceReader,
  localOptions: NativeSourceReadOptions,
): Promise<CheckedSource> {
  await assertNativeSourceContract();
  if (target.expectedSemantics !== NATIVE_SOURCE_CONTRACT.application)
    throw new InterpretationError(
      'content_unavailable',
      'Expected application semantics are not compiled and supported',
    );
  const cid = target.root;
  const collection = await collectNativeSourceClosure(cid, target.closure, reader, localOptions);
  if (!collection.ok) return invalidSource(collection.error);
  const complete = collection.value;
  const shape = checkInput(() => validateNativeSourceShape(NATIVE_NSID.definition, complete.root), manifestFailures);
  if (!shape.ok) return invalidSource(shape.error);
  let manifest: NativeDefinitionManifest;
  try {
    manifest = await readNativeValue<NativeDefinitionManifest>(NATIVE_NSID.definition, complete.root);
  } catch (error) {
    if (!knownInput(error, manifestFailures)) throw error;
    return invalidSource(error);
  }
  // Authentic complete closure and local availability precede compatibility; program interpretation follows it.
  if (manifest.profile.$link !== target.expectedSemantics)
    return {
      kind: 'incompatible',
      actualSemantics: manifest.profile.$link,
      error: new InterpretationError('incompatible_definition', 'Definition requires different application semantics'),
    };
  const prepared = checkInput(() => {
    unique(
      manifest.files.map((file) => file.path),
      'source path',
    );
    unique(manifest.lexicons, 'Lexicon path');
    unique(
      manifest.actions.map((action) => action.ref),
      'action',
    );
    unique(
      manifest.queries.map((query) => query.name),
      'query name',
    );
    unique(
      manifest.views.map((view) => view.name),
      'view name',
    );
    for (const file of manifest.files) {
      if (
        !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(file.path) ||
        file.path.split('/').some((part) => !part || part === '.' || part === '..')
      )
        fail('Expected a safe local source path');
    }
    if (manifest.actions.some((action) => action.ref === ACTIVATE))
      fail('Application source rebinds an activation control action');
    const documents = manifest.lexicons.map((path) => sourceJson(complete.files, path));
    const schemas = new Schemas(documents);
    const authored = new Map(documents.map((document) => [(document as any).id, document as any]));
    function requireType(ref: string, type: string): string {
      const normalized = normalizeNativeRef(ref);
      const [document, name] = normalized.split('#');
      if (authored.get(document)?.defs?.[name!]?.type !== type) fail('Source binding names an unavailable schema type');
      return normalized;
    }
    const stateRef = requireType(manifest.state.ref, 'object');
    const initialState = sourceJson(complete.files, manifest.state.initial);
    canonicalJson(initialState, PROFILE.stateBytes);
    schemas.validate(stateRef, initialState);
    const programs = new Set<string>();
    for (const action of manifest.actions) {
      requireType(action.ref, 'object');
      programs.add(action.fold);
    }
    for (const query of manifest.queries) {
      requireType(query.ref, 'query');
      programs.add(query.program);
    }
    // Bind and decode every program before the evaluator's data-dependent catch.
    const sources = [...programs].map((path) => sourceText(complete.files, path));
    return { documents, schemas, stateRef, initialState, sources };
  }, sourceFailures);
  if (!prepared.ok) return invalidSource(prepared.error);
  const { documents, schemas, stateRef, initialState, sources } = prepared.value;
  for (const source of sources) {
    try {
      await evaluate(source, { meta: {}, act: {}, params: {}, state: {} });
    } catch (error) {
      if (
        !(error instanceof InterpretationError) ||
        error.constructor !== InterpretationError ||
        error.kind !== 'invalid_input'
      )
        throw error;
      if (staticFailures.has(error.code)) return invalidSource(error);
      if (!dataDependentFailures.has(error.code)) throw error;
    }
  }
  for (const view of manifest.views) {
    if (view.query && !manifest.queries.some((query) => query.name === view.query))
      return invalidSource(new InterpretationError('invalid_activation', 'View names an unavailable query'));
    const parsed = checkInput(() => sourceJson(complete.files, view.source), sourceFailures);
    if (!parsed.ok) return invalidSource(parsed.error);
    try {
      await resolveView(parsed.value as unknown as LocalView, {});
    } catch (error) {
      if (view.query && error instanceof MissingError && error.constructor === MissingError) continue;
      if (error instanceof MissingError && error.constructor === MissingError)
        return invalidSource(new InterpretationError('view_props', 'View requires an unavailable binding'));
      if (!knownInput(error, viewFailures)) throw error;
      return invalidSource(error);
    }
  }
  const stateChecked = checkInput(() => nativeSchemaProjection(documents, stateRef), sourceFailures);
  if (!stateChecked.ok) return invalidSource(stateChecked.error);
  const stateProjection = stateChecked.value;
  const stateProjectionCid = await nativeProjectionCid(stateProjection);
  const derived: { ref: string; data: ActionData }[] = [];
  for (const action of manifest.actions) {
    const projected = checkInput(() => {
      const projection = nativeSchemaProjection(documents, stateRef, action.ref);
      return { projection, projectionBytes: nativeProjectionBytes(projection) };
    }, sourceFailures);
    if (!projected.ok) return invalidSource(projected.error);
    const { projection, projectionBytes } = projected.value;
    const projectionCid = await nativeProjectionCid(projection);
    const framing = await frameNativeSourceBytes(projectionBytes);
    const contract = {
      $type: NATIVE_NSID.content,
      version: 1,
      body: {
        $type: nativeRef('actionContract'),
        semantics: link(NATIVE_SOURCE_CONTRACT.application),
        schemas: { stateRoot: projection.stateRoot, actionRoot: projection.actionRoot, closure: projectionCid },
        fold: manifest.files.find((file) => file.path === action.fold)!.cid,
        authorization: action.authorization,
      },
    };
    validateNativeSourceShape(NATIVE_NSID.content, contract);
    derived.push({
      ref: action.ref,
      data: {
        facts: deepFreeze({
          definition: cid,
          ref: action.ref,
          execution: await contentCid(contract),
          projectionCid,
          projectionLocator: framing.cid,
          projection,
          contract,
        }),
        projectionBytes,
        projectionBlocks: framing.blocks,
        fold: sourceText(complete.files, action.fold),
      },
    });
  }
  // Mint only after every source, schema, initial state, program, query, view and derived action has passed.
  const actionCapabilities = new Map<string, NativeSourceAction>();
  for (const { ref, data } of derived) {
    const capability = Object.freeze({}) as NativeSourceAction;
    actions.set(capability, data);
    actionCapabilities.set(ref, capability);
  }
  const capability = Object.freeze({}) as NativeSourceDefinition;
  definitions.set(capability, {
    facts: deepFreeze({
      cid,
      semantics: NATIVE_SOURCE_CONTRACT.application,
      closure: complete.identities,
      manifest,
      initialState,
      stateProjection,
      stateProjectionCid,
      logicalCarBytes: complete.logicalCarBytes,
      decodedOccurrenceBytes: complete.decodedOccurrenceBytes,
    }),
    files: complete.files,
    schemas,
    actions: actionCapabilities,
  });
  return { kind: 'admitted', definition: capability };
}
export function readNativeSourceDefinition(capability: NativeSourceDefinition): Readonly<NativeSourceDefinitionFacts> {
  return definitionData(capability).facts;
}
/** A null result proves absence only in a completely admitted definition. */
export function nativeSourceAction(capability: NativeSourceDefinition, ref: string): NativeSourceAction | null {
  return definitionData(capability).actions.get(ref) ?? null;
}
export function readNativeSourceAction(capability: NativeSourceAction): Readonly<NativeSourceActionFacts> {
  return actionData(capability).facts;
}
export function nativeSourceFile(capability: NativeSourceDefinition, path: string): Uint8Array {
  return new Uint8Array(sourceRaw(definitionData(capability).files, path));
}
export function nativeSourceActionProjection(capability: NativeSourceAction): Uint8Array {
  return new Uint8Array(actionData(capability).projectionBytes);
}
export function nativeSourceActionProjectionBlocks(capability: NativeSourceAction): { cid: string; raw: Uint8Array }[] {
  return actionData(capability).projectionBlocks.map((block) => ({ cid: block.cid, raw: new Uint8Array(block.raw) }));
}
export function nativeSourceActionFold(capability: NativeSourceAction): string {
  return actionData(capability).fold;
}
