/** Reviewed N1-D3 literals. Internal source support does not register a runnable application profile. */
import { Lexicons, jsonToLex, lexToJson, type LexiconDoc } from '@atproto/lexicon';
import { deepFreeze } from '../core/freeze.ts';
import { canonicalJson, type Json } from '../core/values.ts';
import { engineDescriptor } from '../core/contracts.ts';
import { InterpretationError, PROFILE } from '../core/profile.ts';
import { NATIVE_NSID, nativeRef } from '../protocol/native-schema.ts';
import type { NativeContent, ByteManifest } from '../protocol/native-wire.ts';
import { bytes, contentCid, encodeBlock, link, sameBytes, ProtocolError } from '../protocol/wire.ts';
import nativeSchemas from './native-source-data/native-schemas.json' with { type: 'json' };
import nativeRules from './native-source-data/native-rules.json' with { type: 'json' };
import applicationRules from './native-source-data/application-rules.json' with { type: 'json' };
import nativeDescriptor from './native-source-data/native-descriptor.json' with { type: 'json' };
import applicationDescriptor from './native-source-data/application-descriptor.json' with { type: 'json' };
import evaluatorDescriptor from './native-source-data/evaluator-descriptor.json' with { type: 'json' };

export const NATIVE_SOURCE_CONTRACT = deepFreeze({
  native: 'bafyreih6zlsu7zg5cv4kvmenwc6rlgzk2sy6dwdeh4vtrjtbh6bckmqrza',
  application: 'bafyreihvnufbqiqtfcqdnpr3ardmocn4i4j4uoh26f5lhk6rofi24sdtny',
  evaluator: 'bafyreid5y7di742qa3u22dyoozcsuvsabsytc33jzz4gzlltodx3jpwxjm',
});
const schemas = deepFreeze(nativeSchemas);
const registry = new Lexicons(structuredClone(schemas) as unknown as LexiconDoc[]);
const typed = new Set<string>(Object.keys(schemas.find((doc) => doc.id === NATIVE_NSID.defs)!.defs).map(nativeRef));
const withoutLex = (value: string) => value.replace(/^lex:/, '');

/** Owned closed literal shapes, including the reviewed raw-CID projection field. */
export function validateNativeSourceShape(ref: string, value: unknown): void {
  const original = encodeBlock(value);
  function close(schema: any, data: any, expectedType?: string): void {
    if (schema.type === 'record') return close(schema.record, data, expectedType);
    if (schema.type === 'ref') {
      const target = withoutLex(schema.ref);
      return close(registry.getDef(schema.ref), data, expectedType ?? (typed.has(target) ? target : undefined));
    }
    if (schema.type === 'union') {
      if (!data || !schema.refs.map(withoutLex).includes(data.$type))
        throw new ProtocolError('envelope', 'Unknown native source union member');
      return close(registry.getDef(data.$type), data, data.$type);
    }
    if (schema.type === 'object') {
      if (!data || typeof data !== 'object' || Array.isArray(data) || (expectedType && data.$type !== expectedType))
        throw new ProtocolError('envelope', 'Expected a native source object');
      for (const [field, child] of Object.entries(data)) {
        if (field === '$type' && expectedType) continue;
        if (!Object.hasOwn(schema.properties, field))
          throw new ProtocolError('envelope', 'Unknown native source field');
        if (child === null && schema.nullable?.includes(field)) continue;
        close(schema.properties[field], child);
      }
    } else if (schema.type === 'array' && Array.isArray(data)) data.forEach((child) => close(schema.items, child));
  }
  close(registry.getDef(ref), value, ref);
  const result = registry.validate(ref, jsonToLex(value as Json));
  if (!result.success) throw new ProtocolError('envelope', result.error.message);
  if (!sameBytes(original, encodeBlock(lexToJson(result.value))))
    throw new ProtocolError('envelope', 'Native source validation changed bytes');
}

export interface NativeByteFraming {
  manifest: Readonly<NativeContent<ByteManifest>>;
  cid: string;
  blocks: readonly { cid: string; raw: Uint8Array }[];
}
/** Raw JSON identity is distinct from the 32 KiB content locator; neither appoints authority. */
export async function frameNativeSourceBytes(raw: Uint8Array): Promise<NativeByteFraming> {
  if (raw.length > PROFILE.definitionBytes) throw new InterpretationError('value_bytes', 'Projection exceeds 512 KiB');
  const blocks: { cid: string; raw: Uint8Array }[] = [];
  for (let offset = 0; offset < raw.length; offset += 32 * 1024) {
    const chunk = {
      $type: NATIVE_NSID.content,
      version: 1,
      body: { $type: nativeRef('byteChunk'), bytes: bytes(raw.slice(offset, offset + 32 * 1024)) },
    };
    validateNativeSourceShape(NATIVE_NSID.content, chunk);
    blocks.push({ cid: await contentCid(chunk), raw: encodeBlock(chunk) });
  }
  const manifest: NativeContent<ByteManifest> = {
    $type: NATIVE_NSID.content,
    version: 1,
    body: { $type: nativeRef('byteManifest'), byteLength: raw.length, chunks: blocks.map((block) => link(block.cid)) },
  };
  validateNativeSourceShape(NATIVE_NSID.content, manifest);
  const cid = await contentCid(manifest);
  blocks.push({ cid, raw: encodeBlock(manifest) });
  return { manifest: deepFreeze(manifest), cid, blocks };
}
function mismatch(): never {
  throw new InterpretationError(
    'dependency_mismatch',
    'Compiled native source literals differ from the reviewed N1-D3 contract',
  );
}
let checked: Promise<void> | undefined;
export function assertNativeSourceContract(): Promise<void> {
  // Failed conformance remains failed. There is no caller-supplied supported descriptor registry.
  return (checked ??= (async () => {
    if (
      canonicalJson(engineDescriptor, PROFILE.definitionBytes) !==
      canonicalJson(evaluatorDescriptor, PROFILE.definitionBytes)
    )
      mismatch();
    const expected: [unknown, string][] = [
      [nativeSchemas, nativeDescriptor.body.schemas.$link],
      [nativeRules, nativeDescriptor.body.rules.$link],
      [applicationRules, applicationDescriptor.body.rules.$link],
    ];
    for (const [value, identity] of expected) {
      const raw = new TextEncoder().encode(canonicalJson(value, PROFILE.definitionBytes));
      if ((await frameNativeSourceBytes(raw)).cid !== identity) mismatch();
    }
    if (
      (await frameNativeSourceBytes(encodeBlock(evaluatorDescriptor))).cid !==
      applicationDescriptor.body.evaluator.bytes.$link
    )
      mismatch();
    for (const [descriptor, identity] of [
      [nativeDescriptor, NATIVE_SOURCE_CONTRACT.native],
      [applicationDescriptor, NATIVE_SOURCE_CONTRACT.application],
    ] as const) {
      validateNativeSourceShape(NATIVE_NSID.content, descriptor);
      if ((await contentCid(descriptor)) !== identity) mismatch();
    }
    if ((await contentCid(evaluatorDescriptor)) !== NATIVE_SOURCE_CONTRACT.evaluator) mismatch();
  })());
}
