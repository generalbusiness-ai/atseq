import test from 'node:test';
import assert from 'node:assert/strict';
import { isNonExecutedPeer } from '../src/core/dependency-peers.ts';
import { assertNoTypePeerRuntimeEdge } from '../src/integrity/type-peer.ts';

test('only the reviewed valibot optional typechecking peer is excluded', () => {
  const manifest = {
    name: 'valibot',
    version: '1.5.0',
    peerDependencies: { typescript: '>=5' },
    peerDependenciesMeta: { typescript: { optional: true } },
  };
  assert.equal(isNonExecutedPeer(manifest, 'typescript'), true);
  for (const changed of [
    { ...manifest, name: 'other' },
    { ...manifest, version: '1.5.1' },
    { ...manifest, peerDependenciesMeta: {} },
  ])
    assert.equal(isNonExecutedPeer(changed, 'typescript'), false);
  assert.equal(isNonExecutedPeer(manifest, 'other'), false);
});
test('a runtime reference to the excluded peer or computed import is refused', () => {
  assert.doesNotThrow(() => assertNoTypePeerRuntimeEdge('export function validate(x) { return x; }', 'index.mjs'));
  for (const source of [
    "import ts from 'typescript';",
    "export * from 'typescript/lib/typescript.js';",
    "require('typescript')",
    "import('type\\u0073cript')",
    "import.meta.resolve('typescript')",
    'import(name)',
    'require(name)',
  ])
    assert.throws(() => assertNoTypePeerRuntimeEdge(source, 'index.mjs'), { code: 'dependency_mismatch' });
});
