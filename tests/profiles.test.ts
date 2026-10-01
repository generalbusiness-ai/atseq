import { InterpretationError, interpretationCode, interpretationErrorTags } from '../src/core/errors.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vectors from './vectors/profiles-v1.json';
import oldVectors from './vectors/protocol-v0.json';
import approved from '../src/core/dependencies-approved.json';
import { assertDependencies } from '../src/core/dependencies.ts';
import { engineDescriptor, applicationDescriptor, logDescriptor } from '../src/core/contracts.ts';
import { supportedProfiles } from '../src/protocol/identity.ts';
import { contentCid } from '../src/protocol/wire.ts';

test('v1 contract identities agree with independent encoder vectors and exclude implementation provenance', async () => {
  const registry = await supportedProfiles();
  assert.deepEqual(
    registry.map(({ name, cid }) => ({ name, cid })),
    vectors.profiles,
  );
  assert.ok(!registry.some(({ cid }) => cid === oldVectors.profile.cid));
  for (const descriptor of [logDescriptor, engineDescriptor, applicationDescriptor]) {
    assert.ok(Object.isFrozen(descriptor));
    assert.equal(await contentCid(JSON.parse(JSON.stringify(descriptor, null, 7))), await contentCid(descriptor));
    assert.equal(Object.hasOwn(descriptor, 'sources'), false);
    assert.equal(Object.hasOwn(descriptor, 'libraries'), false);
  }
  assert.ok(Object.isFrozen(applicationDescriptor.log.lexicons[0]));
  assert.equal(Reflect.set(engineDescriptor.limits, 'stateBytes', 1), false);
  assert.equal(Reflect.set(applicationDescriptor.fold, 0, 'different behavior'), false);
});

test('unapproved, missing and duplicated installed dependency sets fail closed', async () => {
  const actual: [string, unknown][] = await Promise.all(
    Object.keys(approved.packages).map(
      async (path) => [path, JSON.parse(await readFile(`${path}/package.json`, 'utf8'))] as [string, unknown],
    ),
  );
  assert.doesNotThrow(() => assertDependencies(actual));
  const changed = structuredClone(actual);
  (changed[0]![1] as { version: string }).version = '0.0.0-unapproved';
  for (const set of [changed, actual.slice(1), [...actual.slice(1), actual[1]!]])
    assert.throws(() => assertDependencies(set), { code: 'dependency_mismatch' });
});

test('host-only errors do not widen semantic interpretation outcomes', () => {
  assert.equal(Object.hasOwn(interpretationErrorTags, 'creation_conflict'), false);
  assert.equal(interpretationCode(new InterpretationError('creation_conflict', 'Host-only failure')), 'runtime_fault');
});
