import { Lexicons, jsonToLex, lexToJson, type LexiconDoc } from '@atproto/lexicon';
import defs from '../../lexicons/test/atseq/defs.json';
import genesis from '../../lexicons/test/atseq/genesis.json';
import entry from '../../lexicons/test/atseq/entry.json';
import head from '../../lexicons/test/atseq/head.json';
import create from '../../lexicons/test/atseq/create.json';
import describe from '../../lexicons/test/atseq/describe.json';
import submit from '../../lexicons/test/atseq/submit.json';
import query from '../../lexicons/test/atseq/query.json';
import receipt from '../../lexicons/test/atseq/receipt.json';
import { encodeBlock, sameBytes, ProtocolError } from './wire.ts';
import type { Json } from '../runtime/values.ts';

export const frameworkLexicons = [defs, genesis, entry, head, create, describe, submit, query, receipt] as unknown as LexiconDoc[];
const lexicons = new Lexicons(structuredClone(frameworkLexicons));

/** Lexicon owns the shape; v0 additionally closes framework objects to extra keys. */
export function validateFramework(ref: string, value: unknown): void {
  const original = encodeBlock(value);
  function closed(schema: any, data: any, expectedType?: string): void {
    if (schema.type === 'record') return closed(schema.record, data, expectedType);
    if (schema.type === 'ref') return closed(lexicons.getDef(schema.ref), data, schema.ref.replace(/^lex:/, ''));
    if (schema.type === 'object') {
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new ProtocolError('envelope', 'Expected a framework object');
      if (expectedType && data.$type !== expectedType) throw new ProtocolError('envelope', `Expected $type ${expectedType}`);
      for (const [key, child] of Object.entries(data)) {
        if (key === '$type') continue;
        if (!Object.hasOwn(schema.properties, key)) throw new ProtocolError('envelope', `Unknown framework field ${key}`);
        closed(schema.properties[key], child);
      }
    } else if (schema.type === 'array' && Array.isArray(data)) data.forEach(v => closed(schema.items, v));
  }
  const schema = lexicons.getDef(ref);
  if (!schema) throw new ProtocolError('envelope', `Unknown framework schema ${ref}`);
  closed(schema, value, ref);
  const result = lexicons.validate(ref, jsonToLex(value as Json));
  if (!result.success) throw new ProtocolError('envelope', result.error.message);
  if (!sameBytes(original, encodeBlock(lexToJson(result.value)))) throw new ProtocolError('envelope', 'Schema validation changed signed content');
}
