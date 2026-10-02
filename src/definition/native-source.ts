/** Private complete-source owner. These facts do not select an active definition or authorize execution. */
import { deepFreeze } from '../core/freeze.ts';
import { canonicalJson, jsonCopy, type Json } from '../core/values.ts';
import { InterpretationError, PROFILE } from '../core/profile.ts';
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
  readNativeSourceClosure,
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
    if (!(error instanceof StrictJsonError)) throw error;
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

export async function admitNativeSourceDefinition(
  cid: string,
  closure: readonly string[],
  reader: NativeSourceReader,
  localOptions: NativeSourceReadOptions = {},
): Promise<NativeSourceDefinition> {
  await assertNativeSourceContract();
  const complete = await readNativeSourceClosure(cid, closure, reader, localOptions);
  validateNativeSourceShape(NATIVE_NSID.definition, complete.root);
  const manifest = await readNativeValue<NativeDefinitionManifest>(NATIVE_NSID.definition, complete.root);
  // Authentic complete closure and local availability precede compatibility; program interpretation follows it.
  if (manifest.profile.$link !== NATIVE_SOURCE_CONTRACT.application)
    throw new InterpretationError('incompatible_definition', 'Definition requires different application semantics');
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
  for (const path of programs) {
    const source = sourceText(complete.files, path);
    try {
      await evaluate(source, { meta: {}, act: {}, params: {}, state: {} });
    } catch (error) {
      if (!(error instanceof InterpretationError) || error.kind !== 'invalid_input' || staticFailures.has(error.code))
        throw error;
    }
  }
  for (const view of manifest.views) {
    if (view.query && !manifest.queries.some((query) => query.name === view.query))
      fail('View names an unavailable query');
    try {
      await resolveView(sourceJson(complete.files, view.source) as unknown as LocalView, {});
    } catch (error) {
      if (view.query && error instanceof MissingError) continue;
      if (error instanceof MissingError)
        throw new InterpretationError('view_props', 'View requires an unavailable binding');
      throw error;
    }
  }
  const stateProjection = nativeSchemaProjection(documents, stateRef);
  const stateProjectionCid = await nativeProjectionCid(stateProjection);
  const derived: { ref: string; data: ActionData }[] = [];
  for (const action of manifest.actions) {
    const projection = nativeSchemaProjection(documents, stateRef, action.ref);
    const projectionBytes = nativeProjectionBytes(projection);
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
  return capability;
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
