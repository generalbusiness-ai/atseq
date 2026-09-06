import { Lexicons, type LexiconDoc } from '@atproto/lexicon';
import { fromString, toString, CODEC_DCBOR, CODEC_RAW } from '@atcute/cid';
import schema from '../../lexicons/test/atseq/activate.json';
import { InterpretationError } from '../runtime/profile.ts';
import { link } from '../protocol/wire.ts';
export const ACTIVATE = 'test.atseq.activate';
export interface Activation { expected: string; definition: string; closure: string[] }
const lexicons = new Lexicons([schema as LexiconDoc]);
export function activationPayload(value: unknown): Activation {
  try {
    const valid = lexicons.validate(ACTIVATE, value);
    if (!valid.success || !value || typeof value !== 'object' || Object.keys(value).some(k => !['expected', 'definition', 'closure'].includes(k))) throw new Error();
    const payload = structuredClone(value) as Activation;
    link(payload.expected); link(payload.definition);
    if (!payload.closure.includes(payload.definition) || new Set(payload.closure).size !== payload.closure.length || payload.closure.join(',') !== [...payload.closure].sort().join(',')) throw new Error();
    for (const cid of payload.closure) { const parsed = fromString(cid); if (![CODEC_RAW, CODEC_DCBOR].includes(parsed.codec) || toString(parsed) !== cid) throw new Error(); }
    return payload;
  } catch { throw new InterpretationError('invalid_activation', 'Activation must name expected/new definition CIDs and a sorted, unique source closure'); }
}
