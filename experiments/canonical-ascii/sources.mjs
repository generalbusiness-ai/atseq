import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { ts } from 'ts-morph';

export const basis = '4b6ebab532d0ae1de5adbbe3326d70e0a80f0136';
export const output = 'experiments/post-spike-evidence/2026-10-01/canonical-ascii-';
export const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
export const sources = {
  baseline: execFileSync('git', ['show', `${basis}:src/core/values.ts`], { encoding: 'utf8' }),
  actual: readFileSync('src/core/values.ts', 'utf8'),
};
let adopted = sources.baseline
  .replace('function token(text: string): string {', 'function token(text: string, ascii = false): string {')
  .replace(
    'const size = encoder.encode(text).length;',
    'const size = ascii ? text.length : encoder.encode(text).length;',
  )
  .replaceAll('return token(String(v));', 'return token(String(v), true);');
for (const token of ['[', ']', ',', '{', '}', ':'])
  adopted = adopted.replaceAll(`token('${token}');`, `token('${token}', true);`);
assert.equal(sources.actual, adopted, 'Production source must be exactly the adopted shortcut');
export const compiled = Object.fromEntries(Object.entries(sources).map(([name, source]) => [name, compile(source)]));
export function compile(source) {
  return ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText;
}
