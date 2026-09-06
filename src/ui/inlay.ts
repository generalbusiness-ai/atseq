import { $, deserializeTree, isValidElement, type Element } from '@inlay/core';
import { render, type Resolver, type RenderContext } from '@inlay/render';
import { canonicalJson, type Json } from '../runtime/values.ts';
import { InterpretationError, PROFILE } from '../runtime/profile.ts';

export const PRIMITIVES = ['test.atseq.ui.Panel', 'test.atseq.ui.Text', 'test.atseq.ui.Action'] as const;
const allowedProps: Record<string, string[]> = {
  'test.atseq.ui.Panel': ['children'],
  'test.atseq.ui.Text': ['children'],
  'test.atseq.ui.Action': ['action', 'label'],
};
export interface Primitive { type: string; props: Record<string, Json>; children: ViewNode[] }
export type ViewNode = string | Primitive;
export interface LocalView { root: string; imports: string[]; records: Record<string, unknown> }

/** Resolve a retained Inlay source set. There is no ambient network or key access. */
export async function resolveView(view: LocalView, props: Record<string, Json>): Promise<ViewNode[]> {
  canonicalJson(view, PROFILE.definitionBytes);
  canonicalJson(props);
  if (Object.keys(view.records).length > PROFILE.definitionFiles) throw new InterpretationError('view_limit', 'Too many component records');
  const records = structuredClone(view.records) as Record<string, any>;
  const allowedTypes = new Set<string>([...PRIMITIVES, 'at.inlay.Binding']);
  for (const [uri, record] of Object.entries(records)) {
    const match = /^at:\/\/([^/]+)\/at\.inlay\.component\/([^/]+)$/.exec(uri);
    if (!match || !view.imports.includes(match[1]!)) throw new InterpretationError('view_source', 'Component must be in the retained import set');
    allowedTypes.add(match[2]!);
    if (record.$type !== 'at.inlay.component' || Object.keys(record).some(k => !['$type', 'body', 'imports'].includes(k))) throw new InterpretationError('view_source', 'Invalid component record');
    if (!record.body && !(PRIMITIVES as readonly string[]).includes(match[2]!)) throw new InterpretationError('unknown_primitive', `Unregistered primitive ${match[2]}`);
    if (record.body && (record.body.$type !== 'at.inlay.component#bodyTemplate' || Object.keys(record.body).some(k => !['$type', 'node'].includes(k)))) throw new InterpretationError('external_view', 'Only local Inlay templates are admitted');
    if ((record.imports ?? []).some((did: string) => !view.imports.includes(did))) throw new InterpretationError('view_source', 'Import is outside retained content');
  }
  function inspect(value: any): void {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(inspect); return; }
    if (value.$ === '$') {
      if (!allowedTypes.has(value.type)) throw new InterpretationError('unknown_component', `Unavailable component ${value.type}`);
      if (Object.keys(value).some(k => !['$', 'type', 'props', 'key'].includes(k))) throw new InterpretationError('view_source', 'Invalid element member');
      if (value.type === 'at.inlay.Binding' && (!Array.isArray(value.props?.path) || value.props.path.some((k: unknown) => typeof k !== 'string'))) throw new InterpretationError('view_source', 'Invalid binding path');
    }
    Object.values(value).forEach(inspect);
  }
  Object.values(records).forEach(inspect);
  const resolver: Resolver = {
    async fetchRecord(uri) { return records[uri] ?? null; },
    async resolve(dids, collection, rkey) {
      for (const did of dids) {
        const uri = `at://${did}/${collection}/${rkey}` as const;
        if (Object.hasOwn(records, uri)) return { did, uri, record: records[uri] };
      }
      return null;
    },
    async resolveLexicon() { return null; },
    async xrpc() { throw new InterpretationError('external_view', 'Rendering cannot call XRPC'); },
  };
  let count = 0;
  async function walk(node: unknown, context: RenderContext, depth = 0): Promise<ViewNode[]> {
    if (++count > PROFILE.viewNodes || depth > PROFILE.viewDepth) throw new InterpretationError('view_limit', 'Expanded view exceeds bounds');
    if (node === null || node === undefined || node === false) return [];
    if (typeof node === 'string' || typeof node === 'number') return [String(node)];
    if (Array.isArray(node)) {
      const children: ViewNode[] = [];
      for (const child of node) children.push(...await walk(child, context, depth + 1));
      return children;
    }
    if (!isValidElement(node) || !allowedTypes.has(node.type)) throw new InterpretationError('unknown_component', 'Only retained components may render');
    const result = await render(node as Element, context, { resolver, maxDepth: PROFILE.viewDepth + 1 });
    if (result.node !== null) return walk(result.node, result.context, depth + 1);
    const keys = allowedProps[node.type];
    if (!keys) throw new InterpretationError('unknown_primitive', `Unregistered primitive ${node.type}`);
    if (Object.keys(result.props).some(k => !keys.includes(k))) throw new InterpretationError('view_props', `Unsupported properties for ${node.type}`);
    const { children, ...properties } = result.props;
    canonicalJson(properties);
    return [{ type: node.type, props: properties as Record<string, Json>, children: await walk(children, result.context, depth + 1) }];
  }
  // Root props contain only caller-supplied query data. No signing capability.
  return walk(deserializeTree($(view.root, props)), { imports: view.imports as RenderContext['imports'] });
}
