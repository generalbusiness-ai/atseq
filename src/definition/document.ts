import { fromBytes, type Bytes } from '@atcute/cbor';
import { create, toString, CODEC_RAW, CODEC_DCBOR } from '@atcute/cid';
import { InterpretationError } from '../core/errors.ts';
import { PROFILE } from '../core/profile.ts';
import { canonicalJson, jsonCopy } from '../core/values.ts';
import { applicationRuntimeCid } from '../protocol/identity.ts';
import { bytes, encodeBlock } from '../protocol/wire.ts';
import { LoadedDefinition, type DefinitionManifest } from './load.ts';
import { SourceBundle } from './source.ts';

export const SOURCE_DOCUMENT_BYTES = 1024 * 1024;
export interface SourceDocument {
  format: 'atseq-source';
  version: 1;
  manifest: Omit<DefinitionManifest, 'files' | 'profile'> & Partial<Pick<DefinitionManifest, 'files' | 'profile'>>;
  sources: { path: string; content: Bytes }[];
}
function fail(message: string): never {
  throw new InterpretationError('definition_manifest', message);
}
function exact(value: any, names: string[]): void {
  if (
    !value ||
    Array.isArray(value) ||
    typeof value !== 'object' ||
    Object.keys(value).length !== names.length ||
    names.some((name) => !Object.hasOwn(value, name))
  )
    fail(`Expected exactly ${names.join(', ')}`);
}
function path(value: unknown): asserts value is string {
  if (
    typeof value !== 'string' ||
    value.length > 200 ||
    !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(value) ||
    value.split('/').some((segment) => !segment || segment === '.' || segment === '..')
  )
    throw new InterpretationError('definition_path', 'Invalid local source path');
}

/** Local authoring transport. All returned bundles have passed ordinary definition admission. */
export async function sourceDocumentToBundle(input: unknown): Promise<SourceBundle> {
  if (typeof input === 'string') {
    if (new TextEncoder().encode(input).length > SOURCE_DOCUMENT_BYTES)
      throw new InterpretationError('definition_size', 'Source document exceeds 1 MiB');
    try {
      input = JSON.parse(input);
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
      fail('Source document is not JSON');
    }
  }
  // Validate ownership, depth and total encoded size before decoding any source bytes.
  const document: any = JSON.parse(canonicalJson(input, SOURCE_DOCUMENT_BYTES));
  exact(document, ['format', 'version', 'manifest', 'sources']);
  if (document.format !== 'atseq-source' || document.version !== 1) fail('Unsupported source document format');
  if (!document.manifest || Array.isArray(document.manifest) || typeof document.manifest !== 'object')
    fail('Source document manifest must be an object');
  if (!Array.isArray(document.sources) || document.sources.length > PROFILE.definitionFiles - 1)
    throw new InterpretationError('definition_size', 'Source document exceeds 63 named files');
  const files = new Map<string, Uint8Array>();
  let size = 0;
  for (const item of document.sources) {
    exact(item, ['path', 'content']);
    path(item.path);
    if (files.has(item.path)) throw new InterpretationError('definition_duplicate', 'Duplicate source path');
    exact(item.content, ['$bytes']);
    const encoded = item.content.$bytes;
    if (typeof encoded !== 'string' || !/^[A-Za-z0-9+/]*$/.test(encoded) || encoded.length % 4 === 1)
      throw new InterpretationError('wire_bytes', 'Expected canonical unpadded base64');
    size += Math.floor((encoded.length * 3) / 4);
    if (size > PROFILE.definitionBytes)
      throw new InterpretationError('definition_size', 'Decoded source files exceed 512 KiB');
    let raw: Uint8Array;
    try {
      raw = fromBytes(item.content);
    } catch {
      throw new InterpretationError('wire_bytes', 'Expected canonical unpadded base64');
    }
    if (bytes(raw).$bytes !== encoded)
      throw new InterpretationError('wire_bytes', 'Expected canonical unpadded base64');
    files.set(item.path, new Uint8Array(raw));
  }
  const manifest = { ...document.manifest };
  if (!Object.hasOwn(manifest, 'profile')) manifest.profile = { $link: await applicationRuntimeCid() };
  let bundle: SourceBundle;
  if (!Object.hasOwn(manifest, 'files')) {
    bundle = await SourceBundle.pack(manifest, Object.fromEntries(files));
  } else {
    if (!Array.isArray(manifest.files) || manifest.files.length !== files.size)
      fail('Retained file table must name exactly the supplied source paths');
    const retained = new Map<string, Uint8Array>();
    const named = new Set<string>();
    for (const file of manifest.files) {
      exact(file, ['path', 'cid']);
      path(file.path);
      if (named.has(file.path)) throw new InterpretationError('definition_duplicate', 'Duplicate retained path');
      named.add(file.path);
      const raw = files.get(file.path);
      if (!raw || toString(await create(CODEC_RAW, raw)) !== file.cid)
        fail('Retained source path or CID differs from the supplied bytes');
    }
    // Match the ordinary packer's deterministic block order, preserving the manifest's array order.
    for (const [, raw] of [...files].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
      retained.set(toString(await create(CODEC_RAW, raw)), raw);
    const rootBytes = encodeBlock(manifest),
      root = toString(await create(CODEC_DCBOR, rootBytes));
    retained.set(root, rootBytes);
    bundle = await SourceBundle.collect(root, [...retained.keys()], {
      async get(cid) {
        const raw = retained.get(cid);
        if (!raw) throw new InterpretationError('content_missing', 'Missing retained source block');
        return raw;
      },
    });
  }
  await LoadedDefinition.load(bundle.root, bundle);
  return bundle;
}

/** Owned exact bytes from an already admitted closure, including its retained file table. */
export function sourceDocumentFromDefinition(definition: LoadedDefinition): SourceDocument {
  return {
    format: 'atseq-source',
    version: 1,
    manifest: jsonCopy(definition.manifest, SOURCE_DOCUMENT_BYTES) as unknown as DefinitionManifest,
    sources: [...definition.manifest.files]
      .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
      .map((file) => ({ path: file.path, content: bytes(definition.bytes(file.path)) })),
  };
}
export async function sourceDocumentFromBundle(bundle: SourceBundle): Promise<SourceDocument> {
  return sourceDocumentFromDefinition(await LoadedDefinition.load(bundle.root, bundle));
}
export function serializeSourceDocument(document: SourceDocument): string {
  return canonicalJson(document, SOURCE_DOCUMENT_BYTES) + '\n';
}
