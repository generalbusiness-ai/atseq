import { parseStrictJson, StrictJsonError } from './strict-json.ts';
import { AtseqError, ProtocolError } from '../core/errors.ts';

export function identityInput(message: string): never {
  throw new ProtocolError('input', message);
}
export function identityResourceLimit(message: string): never {
  throw new AtseqError('content_unavailable', message);
}
export function identityObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
/** Retain I1's exact error policy over the shared pure lexical parser. */
export function parseIdentityJson(raw: Uint8Array, maximumBytes: number): unknown {
  try {
    return parseStrictJson(raw, maximumBytes);
  } catch (error) {
    if (!(error instanceof StrictJsonError)) throw error;
    switch (error.reason) {
      case 'input':
        if (!Number.isSafeInteger(maximumBytes) || maximumBytes < 1) identityInput('Invalid identity response budget');
        identityInput('Expected retained identity bytes');
      case 'bytes':
        identityResourceLimit('Identity response exceeds budget');
      case 'depth':
        identityResourceLimit('Identity JSON nesting exceeds 32');
      case 'bom':
        identityInput('Identity JSON must not begin with a BOM');
      case 'utf8':
        identityInput('Identity JSON is not valid UTF-8');
      case 'duplicate':
        identityInput('Duplicate identity JSON property');
      case 'syntax':
        identityInput('Identity evidence must be strict JSON');
    }
  }
}
