import { lexiconDoc } from '@atproto/lexicon';
import { NSID } from '../core/nsids.ts';
import { $, deserializeTree, isValidElement, type Element } from '@inlay/core';
import { render, type Resolver, type RenderContext } from '@inlay/render';
import { canonicalJson, type Json } from '../core/values.ts';
import { InterpretationError, PROFILE } from '../core/profile.ts';

export const PRIMITIVES = [NSID.uiPanel, NSID.uiText, NSID.uiAction] as const;
const allowedProps: Record<string, string[]> = {
  [NSID.uiPanel]: ['children'],
  [NSID.uiText]: ['children'],
  [NSID.uiAction]: ['action', 'label'],
};
export interface Primitive {
  type: string;
  props: Record<string, Json>;
  children: ViewNode[];
}
export type ViewNode = string | Primitive;
export interface LocalView {
  root: string;
  imports: string[];
  records: Record<string, unknown>;
}

/** Resolve a retained Inlay source set. There is no ambient network or key access. */
export async function resolveView(view: LocalView, props: Record<string, Json>): Promise<ViewNode[]> {
  canonicalJson(view, PROFILE.definitionBytes);
  canonicalJson(props);
  function object(value: unknown): value is Record<string, any> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }
  if (
    !object(view) ||
    typeof view.root !== 'string' ||
    !Array.isArray(view.imports) ||
    view.imports.some((did: unknown) => typeof did !== 'string') ||
    !object(view.records)
  )
    throw new InterpretationError('view_source', 'Expected a local root, import list and record map');
  if (Object.keys(view.records).length > PROFILE.definitionFiles)
    throw new InterpretationError('view_limit', 'Too many component records');
  const records = structuredClone(view.records) as Record<string, any>;
  const allowedTypes = new Set<string>([...PRIMITIVES, 'at.inlay.Binding']);
  for (const [uri, record] of Object.entries(records)) {
    const match = /^at:\/\/([^/]+)\/at\.inlay\.component\/([^/]+)$/.exec(uri);
    if (
      !match ||
      !view.imports.includes(match[1]!) ||
      !lexiconDoc.safeParse({ lexicon: 1, id: match[2], defs: {} }).success
    )
      throw new InterpretationError('view_source', 'Component must be in the retained import set');
    allowedTypes.add(match[2]!);
    if (
      !object(record) ||
      record.$type !== 'at.inlay.component' ||
      Object.keys(record).some((k) => !['$type', 'body', 'imports'].includes(k))
    )
      throw new InterpretationError('view_source', 'Invalid component record');
    if (!record.body && !(PRIMITIVES as readonly string[]).includes(match[2]!))
      throw new InterpretationError('unknown_primitive', `Unregistered primitive ${match[2]}`);
    if (
      record.body &&
      (record.body.$type !== 'at.inlay.component#bodyTemplate' ||
        Object.keys(record.body).some((k) => !['$type', 'node'].includes(k)))
    )
      throw new InterpretationError('external_view', 'Only local Inlay templates are admitted');
    if (
      record.imports !== undefined &&
      (!Array.isArray(record.imports) || record.imports.some((did: unknown) => typeof did !== 'string'))
    )
      throw new InterpretationError('view_source', 'Component imports must be strings');
    if ((record.imports ?? []).some((did: string) => !view.imports.includes(did)))
      throw new InterpretationError('view_source', 'Import is outside retained content');
  }
  function available(type: string, imports: string[]): boolean {
    return (
      type === 'at.inlay.Binding' ||
      imports.some((did) => Object.hasOwn(records, `at://${did}/at.inlay.component/${type}`))
    );
  }
  if (!allowedTypes.has(view.root) || !available(view.root, view.imports))
    throw new InterpretationError('view_source', 'Root is outside retained imports');
  function inspect(value: any, imports: string[]): void {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      value.forEach((child) => inspect(child, imports));
      return;
    }
    if (value.$ === '$') {
      if (typeof value.type !== 'string' || !object(value.props))
        throw new InterpretationError('view_source', 'Element requires a type and props object');
      if (!allowedTypes.has(value.type) || !available(value.type, imports))
        throw new InterpretationError('unknown_component', `Unavailable component ${value.type}`);
      if (Object.keys(value).some((k) => !['$', 'type', 'props', 'key'].includes(k)))
        throw new InterpretationError('view_source', 'Invalid element member');
      if (
        value.type === 'at.inlay.Binding' &&
        (!Array.isArray(value.props?.path) ||
          !value.props.path.length ||
          !['props', 'record'].includes(value.props.path[0]) ||
          value.props.path.some((k: unknown) => typeof k !== 'string'))
      )
        throw new InterpretationError('view_source', 'Invalid binding path');
    }
    Object.values(value).forEach((child) => inspect(child, imports));
  }
  for (const record of Object.values(records)) inspect(record, record.imports ?? []);
  const resolver: Resolver = {
    async fetchRecord(uri) {
      return records[uri] ?? null;
    },
    async resolve(dids, collection, rkey) {
      for (const did of dids) {
        const uri = `at://${did}/${collection}/${rkey}` as const;
        if (Object.hasOwn(records, uri)) return { did, uri, record: records[uri] };
      }
      return null;
    },
    async resolveLexicon() {
      return null;
    },
    async xrpc() {
      throw new InterpretationError('external_view', 'Rendering cannot call XRPC');
    },
  };
  let count = 0;
  async function walk(node: unknown, context: RenderContext, depth = 0): Promise<ViewNode[]> {
    if (++count > PROFILE.viewNodes || depth > PROFILE.viewDepth)
      throw new InterpretationError('view_limit', 'Expanded view exceeds bounds');
    if (node === null || node === undefined || node === false) return [];
    if (typeof node === 'string' || typeof node === 'number') return [String(node)];
    if (Array.isArray(node)) {
      const children: ViewNode[] = [];
      for (const child of node) children.push(...(await walk(child, context, depth + 1)));
      return children;
    }
    if (!isValidElement(node) || !allowedTypes.has(node.type))
      throw new InterpretationError('unknown_component', 'Only retained components may render');
    const result = await render(node as Element, context, { resolver, maxDepth: PROFILE.viewDepth + 1 });
    if (result.node !== null) return walk(result.node, result.context, depth + 1);
    const keys = allowedProps[node.type];
    if (!keys) throw new InterpretationError('unknown_primitive', `Unregistered primitive ${node.type}`);
    if (Object.keys(result.props).some((k) => !keys.includes(k)))
      throw new InterpretationError('view_props', `Unsupported properties for ${node.type}`);
    const { children, ...properties } = result.props;
    canonicalJson(properties);
    return [
      {
        type: node.type,
        props: properties as Record<string, Json>,
        children: await walk(children, result.context, depth + 1),
      },
    ];
  }
  // Root props contain only caller-supplied query data. No signing capability.
  return walk(deserializeTree($(view.root, props)), { imports: view.imports as RenderContext['imports'] });
}
