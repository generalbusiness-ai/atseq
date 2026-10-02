/** Authored schema projection; maintained Lexicons rewrites are never identity inputs. */
import { canonicalJson, jsonCopy, type Json } from '../core/values.ts';
import { InterpretationError, PROFILE } from '../core/profile.ts';
import { create, CODEC_RAW, toString } from '@atcute/cid';

type Node = Record<string, any>;
export interface NativeSchemaProjection {
  stateRoot: string;
  actionRoot?: string;
  definitions: Record<string, Json>;
}
function fail(message: string): never {
  throw new InterpretationError('definition_binding', message);
}
export function normalizeNativeRef(ref: string, context = ''): string {
  const absolute = ref.startsWith('#') ? context + ref : ref;
  const [document, name = 'main', extra] = absolute.split('#');
  if (!document || !name || extra !== undefined) fail('Expected a declared schema reference');
  return `${document}#${name}`;
}

/** Visit schema positions only: literal properties, const/default/enum keep their exact data. */
export function nativeSchemaProjection(
  documents: readonly Json[],
  stateRef: string,
  actionRef?: string,
): NativeSchemaProjection {
  const authored = new Map(documents.map((document) => [(document as Node).id, document as Node]));
  const pending: string[] = [];
  const normalize = (ref: string, context = '') => {
    const identity = normalizeNativeRef(ref, context);
    pending.push(identity);
    return identity;
  };
  const stateRoot = normalize(stateRef);
  const actionRoot = actionRef === undefined ? undefined : normalize(actionRef);
  const definitions: Record<string, Json> = {};
  for (let index = 0; index < pending.length; index++) {
    const identity = pending[index]!;
    if (Object.hasOwn(definitions, identity)) continue;
    const [document, name] = identity.split('#') as [string, string];
    const source = authored.get(document)?.defs?.[name];
    if (!source || typeof source !== 'object') fail(`Unresolved schema reference: ${identity}`);
    const owned = jsonCopy(source, PROFILE.definitionBytes) as Node;
    definitions[identity] = owned as Json;
    const nodes: Node[] = [owned];
    for (let cursor = 0; cursor < nodes.length; cursor++) {
      const node = nodes[cursor]!;
      delete node.description;
      if (node.type === 'ref') node.ref = normalize(node.ref, document);
      if (node.type === 'union') {
        if (node.closed !== true || !Array.isArray(node.refs)) fail('Expected a closed schema union');
        node.refs = node.refs.map((ref: string) => normalize(ref, document));
      }
      for (const child of Object.values(node.properties ?? {})) nodes.push(child as Node);
      if (node.items) nodes.push(node.items);
      if (node.parameters) nodes.push(node.parameters);
      if (node.output) {
        delete node.output.description;
        if (node.output.schema) nodes.push(node.output.schema);
      }
      for (const error of node.errors ?? []) delete error.description;
    }
  }
  const result = { stateRoot, ...(actionRoot === undefined ? {} : { actionRoot }), definitions };
  canonicalJson(result, PROFILE.definitionBytes);
  return result;
}
export function nativeProjectionBytes(projection: NativeSchemaProjection): Uint8Array {
  return new TextEncoder().encode(canonicalJson(projection, PROFILE.definitionBytes));
}
export async function nativeProjectionCid(projection: NativeSchemaProjection): Promise<string> {
  return toString(await create(CODEC_RAW, nativeProjectionBytes(projection)));
}
