import { visit } from 'jsonc-parser';

/** Pure lexical facts. Each consumer decides whether a bound is normative or local. */
export class StrictJsonError extends Error {
  constructor(
    readonly reason: 'input' | 'bytes' | 'depth' | 'bom' | 'utf8' | 'duplicate' | 'syntax',
    message: string,
  ) {
    super(message);
    this.name = 'StrictJsonError';
  }
}
function fail(reason: StrictJsonError['reason'], message: string): never {
  throw new StrictJsonError(reason, message);
}

/** One strict interpretation of the exact retained bytes, shared online/offline. */
export function parseStrictJson(raw: Uint8Array, maximumBytes: number, maximumDepth = 32): unknown {
  if (
    !Number.isSafeInteger(maximumBytes) ||
    maximumBytes < 1 ||
    !Number.isSafeInteger(maximumDepth) ||
    maximumDepth < 1
  )
    fail('input', 'Invalid JSON parsing budget');
  if (!(raw instanceof Uint8Array)) fail('input', 'Expected retained JSON bytes');
  if (raw.length > maximumBytes) fail('bytes', 'JSON exceeds byte budget');
  if (raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) fail('bom', 'JSON must not begin with a BOM');
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(raw);
  } catch (error) {
    if (error instanceof TypeError) fail('utf8', 'JSON is not valid UTF-8');
    throw error;
  }
  const frames: (Set<string> | null)[] = [];
  function begin(names: Set<string> | null) {
    if (frames.length >= maximumDepth) fail('depth', 'JSON exceeds nesting budget');
    frames.push(names);
  }
  visit(
    text,
    {
      onObjectBegin: () => begin(new Set()),
      onArrayBegin: () => begin(null),
      onObjectProperty: (name) => {
        const names = frames.at(-1);
        if (!names || names.has(name)) fail('duplicate', 'Duplicate decoded JSON property');
        names.add(name);
      },
      onObjectEnd: () => {
        frames.pop();
      },
      onArrayEnd: () => {
        frames.pop();
      },
      onError: () => fail('syntax', 'Expected strict JSON'),
    },
    { disallowComments: true, allowTrailingComma: false, allowEmptyContent: false },
  );
  // The visitor checks decoded duplicate names and depth; JSON.parse checks the
  // same text rather than replacing it with a lenient parser projection.
  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError) fail('syntax', 'Expected strict JSON');
    throw error;
  }
}
