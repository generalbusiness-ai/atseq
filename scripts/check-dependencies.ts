import assert from 'node:assert/strict';
import { dirname } from 'node:path';
import { existsSync } from 'node:fs';
import approved from '../src/core/dependencies-approved.json';
import lock from '../package-lock.json';
import { assertDependencies } from '../src/core/dependencies.ts';
assertDependencies();
const packages = lock.packages as Record<
  string,
  {
    dependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
  }
>;
const seen = new Set<string>();
function resolve(parent: string, name: string): string | undefined {
  let base = parent;
  for (;;) {
    const candidate = `${base ? `${base}/` : ''}node_modules/${name}`;
    if (packages[candidate] && existsSync(`${candidate}/package.json`)) return candidate;
    if (!base) return;
    const next = dirname(base);
    base = next === '.' ? '' : next;
  }
}
function visit(path: string) {
  if (seen.has(path)) return;
  seen.add(path);
  const entry = packages[path]!;
  for (const name of Object.keys(entry.dependencies ?? {})) {
    const target = resolve(path, name);
    assert.ok(target, `Missing dependency ${path}: ${name}`);
    visit(target);
  }
  for (const name of [...Object.keys(entry.optionalDependencies ?? {}), ...Object.keys(entry.peerDependencies ?? {})]) {
    const target = resolve(path, name);
    if (target) visit(target);
  }
}
for (const name of Object.keys(approved.direct)) {
  const target = resolve('', name);
  assert.ok(target, `Missing direct dependency ${name}`);
  visit(target);
}
assert.deepEqual(
  seen,
  new Set(Object.keys(approved.packages)),
  'Approved provenance must cover the entire resolved runtime closure, including installed peers',
);
console.log('Installed runtime closure, dependency edges and integrity pins match reviewed provenance.');
