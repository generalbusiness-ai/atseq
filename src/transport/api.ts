import { HOST_LIMITS } from '../core/limits.ts';
import { Lexicons, jsonToLex, lexToJson, type LexiconDoc } from '@atproto/lexicon';
import { frameworkLexicons } from '../protocol/schemas.ts';
import compareDefinition from '../../lexicons/ai/generalbusiness/atseq/compareDefinition.json';
import stageDefinition from '../../lexicons/ai/generalbusiness/atseq/stageDefinition.json';
import readDraft from '../../lexicons/ai/generalbusiness/atseq/readDraft.json';
import list from '../../lexicons/ai/generalbusiness/atseq/list.json';
import sync from '../../lexicons/ai/generalbusiness/atseq/sync.json';
import validateDraft from '../../lexicons/ai/generalbusiness/atseq/validateDraft.json';
import preview from '../../lexicons/ai/generalbusiness/atseq/preview.json';

export const serviceSchemas = new Lexicons([
  ...structuredClone([...frameworkLexicons]),
  list,
  sync,
  validateDraft,
  preview,
  readDraft,
  compareDefinition,
  stageDefinition,
] as LexiconDoc[]);
export const BODY_LIMIT = HOST_LIMITS.bodyBytes;
export async function responseBytes(response: Response, limit = BODY_LIMIT) {
  const reader = response.body?.getReader(),
    chunks: Uint8Array[] = [];
  let size = 0;
  if (reader)
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > limit) throw new Error('Response exceeds transport limit');
        chunks.push(value);
      }
    } finally {
      await reader.cancel().catch(() => {});
      reader.releaseLock();
    }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}
