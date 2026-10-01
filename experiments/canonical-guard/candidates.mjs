/** Experimental transformations only. Production source is read, never written. */
export const variants = ['baseline', 'ascii', 'regex', 'utf8', 'paths', 'asciiPaths', 'regexPaths', 'utf8Paths'];

function replace(source, from, to) {
  if (!source.includes(from)) throw new Error(`Canonical source shape changed: ${from}`);
  return source.replaceAll(from, () => to);
}

export function candidateSource(original, name) {
  if (!variants.includes(name)) throw new Error(`Unknown variant: ${name}`);
  let source = original;
  if (name === 'ascii' || name === 'asciiPaths') {
    source = replace(
      source,
      'function token(text: string): string {',
      'function token(text: string, ascii = false): string {',
    );
    source = replace(
      source,
      'const size = encoder.encode(text).length;',
      'const size = ascii ? text.length : encoder.encode(text).length;',
    );
    source = replace(source, 'return token(String(v));', 'return token(String(v), true);');
    for (const token of ['[', ']', ',', '{', '}', ':'])
      source = replace(source, `token('${token}');`, `token('${token}', true);`);
  }
  if (name === 'utf8' || name === 'utf8Paths') {
    source = replace(
      source,
      'const size = encoder.encode(text).length;',
      `let size = text.length;
    for (let i = 0; i < text.length; i++) {
      const unit = text.charCodeAt(i);
      if (unit < 0x80) continue;
      if (unit < 0x800) { size++; continue; }
      if (unit >= 0xd800 && unit <= 0xdbff && i + 1 < text.length) {
        const next = text.charCodeAt(i + 1);
        if (next >= 0xdc00 && next <= 0xdfff) { size += 2; i++; continue; }
      }
      size += 2;
    }`,
    );
  }
  if (name === 'regex' || name === 'regexPaths') {
    source = replace(
      source,
      'const encoder = new TextEncoder();',
      'const encoder = new TextEncoder();\nconst asciiToken = /^[\\x00-\\x7f]*$/;',
    );
    source = replace(
      source,
      'const size = encoder.encode(text).length;',
      'const size = asciiToken.test(text) ? text.length : encoder.encode(text).length;',
    );
  }
  if (name === 'paths' || name.endsWith('Paths')) {
    source = replace(
      source,
      'const active = new Set<object>();',
      `const active = new Set<object>();
  const pathParts: (string | number)[] = ['$'];
  function at(key?: string | number): string {
    return key === undefined ? pathParts.join('/') : pathParts.join('/') + '/' + key;
  }
  function child(value: unknown, depth: number, key: string | number): string {
    pathParts.push(key);
    try { return walk(value, depth); } finally { pathParts.pop(); }
  }`,
    );
    source = replace(source, 'walk(desc.value, depth + 1, `${path}/${i}`)', 'child(desc.value, depth + 1, i)');
    source = replace(source, 'walk(desc.value, depth + 1, `${path}/${key}`)', 'child(desc.value, depth + 1, key)');
    source = replace(
      source,
      'function walk(v: unknown, depth: number, path: string): string {',
      'function walk(v: unknown, depth: number): string {',
    );
    source = replace(source, '${path}/${key}', '${at(key)}');
    source = replace(source, '${path}/${i}', '${at(i)}');
    source = replace(source, '${path}', '${at()}');
    source = replace(source, "return walk(value, 0, '$');", 'return walk(value, 0);');
  }
  return source;
}

/** Compile externally; inject the same profile/error class in each realm. */
export function createGuard(compiled, InterpretationError, PROFILE, TextEncoderClass = TextEncoder) {
  const local = compiled.replace(/^import .*?;\s*$/gm, '').replace(/^export /gm, '');
  return new Function('InterpretationError', 'PROFILE', 'TextEncoder', local + '\nreturn canonicalJson;')(
    InterpretationError,
    PROFILE,
    TextEncoderClass,
  );
}
