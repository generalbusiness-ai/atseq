import { visit } from 'jsonc-parser';
import { ProtocolError } from '../core/errors.ts';

export function identityInput(message: string): never {
  throw new ProtocolError('input', message);
}
export function identityObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
/** One strict interpretation of the exact retained bytes, shared online/offline. */
export function parseIdentityJson(raw: Uint8Array, maximumBytes: number): unknown {
  if (!Number.isSafeInteger(maximumBytes) || maximumBytes < 1) identityInput('Invalid identity response budget');
  if (!(raw instanceof Uint8Array) || raw.length > maximumBytes) identityInput('Identity response exceeds budget');
  if (raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) identityInput('Identity JSON must not begin with a BOM');
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(raw);
  } catch (error) {
    if (error instanceof TypeError) identityInput('Identity JSON is not valid UTF-8');
    throw error;
  }
  const frames: (Set<string> | null)[] = [];
  function begin(names: Set<string> | null) {
    if (frames.length >= 32) identityInput('Identity JSON nesting exceeds 32');
    frames.push(names);
  }
  visit(
    text,
    {
      onObjectBegin: () => begin(new Set()),
      onArrayBegin: () => begin(null),
      onObjectProperty: (name) => {
        const names = frames.at(-1);
        if (!names || names.has(name)) identityInput('Duplicate identity JSON property');
        names.add(name);
      },
      onObjectEnd: () => {
        frames.pop();
      },
      onArrayEnd: () => {
        frames.pop();
      },
      onError: () => identityInput('Identity evidence must be strict JSON'),
    },
    { disallowComments: true, allowTrailingComma: false, allowEmptyContent: false },
  );
  // The visitor checks decoded duplicate names and depth; JSON.parse checks the
  // same text rather than replacing it with a lenient parser projection.
  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError) identityInput('Identity evidence must be strict JSON');
    throw error;
  }
}
