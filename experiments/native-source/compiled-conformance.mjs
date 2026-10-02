/** Probe the actual production build, without changing package exports or supported profiles. */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { relative } from 'node:path';
import { create, CODEC_RAW, toString } from '@atcute/cid';
import {
  admitNativeSourceDefinition,
  assessNativeSource,
  nativeSourceAction,
  readNativeSourceAction,
  readNativeSourceDefinition,
} from '../../dist/src/definition/native-source.js';
import {
  assertNativeSourceContract,
  NATIVE_SOURCE_CONTRACT,
} from '../../dist/src/definition/native-source-contract.js';
import { contentCid, encodeBlock } from '../../dist/src/protocol/wire.js';
import { supportedProfiles } from '../../dist/src/protocol/identity.js';
import { AtseqError, InterpretationError } from '../../dist/src/core/errors.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const vectors = JSON.parse(
  await readFile(new URL('../../testdata/native-source/source-identity-vectors.json', import.meta.url)),
);
const approvedFiles = JSON.parse(await readFile(new URL('../../src/integrity/files-approved.json', import.meta.url)));
const approvedGraph = JSON.parse(await readFile(new URL('../../src/core/dependencies-approved.json', import.meta.url)));
const maintained = fileURLToPath(import.meta.resolve('@noble/hashes/sha2'));
const maintainedPath = relative(root, maintained);
const maintainedPackage = 'node_modules/@noble/hashes';
assert.ok(maintainedPath.startsWith(maintainedPackage + '/'));
const maintainedHash = createHash('sha256')
  .update(await readFile(maintained))
  .digest('hex');
assert.equal(maintainedHash, approvedFiles[maintainedPackage][maintainedPath.slice(maintainedPackage.length + 1)]);
await assertNativeSourceContract();
const passed = [];
for (const vector of vectors) {
  const blocks = new Map([[vector.definitionCid, encodeBlock(vector.manifest)]]);
  for (const file of vector.files) blocks.set(file.rawCid, new Uint8Array(Buffer.from(file.base64, 'base64')));
  const facts = await assessNativeSource(
    { root: vector.definitionCid, expectedSemantics: NATIVE_SOURCE_CONTRACT.application, closure: [...blocks.keys()] },
    {
      async get(cid) {
        assert.ok(blocks.has(cid));
        return new Uint8Array(blocks.get(cid));
      },
    },
  );
  assert.equal(facts.kind, 'admitted');
  assert.ok(Object.isFrozen(facts));
  const definition = facts.definition;
  assert.equal(readNativeSourceDefinition(definition).stateProjectionCid, vector.stateProjectionRawCid);
  const action = nativeSourceAction(definition, 'ai.generalbusiness.atseq.example#act');
  assert.ok(action);
  assert.equal(readNativeSourceAction(action).execution, vector.executionCid);
  assert.equal(readNativeSourceAction(action).projectionCid, vector.actionProjectionRawCid);
  assert.equal(nativeSourceAction(definition, 'ai.generalbusiness.atseq.example#missing'), null);
  assert.throws(() => readNativeSourceDefinition({ ...definition }), TypeError);
  assert.throws(() => readNativeSourceAction({ ...action }), TypeError);
  passed.push(vector.name);
}
const oversized = new Uint8Array(524289);
const source = structuredClone(vectors[0].manifest);
source.files.push({ path: 'large.bin', cid: toString(await create(CODEC_RAW, oversized)) });
const rootCid = await contentCid(source);
const blocks = new Map([[rootCid, encodeBlock(source)]]);
for (const file of vectors[0].files) blocks.set(file.rawCid, new Uint8Array(Buffer.from(file.base64, 'base64')));
blocks.set(source.files.at(-1).cid, oversized);
await assert.rejects(
  admitNativeSourceDefinition(
    rootCid,
    [...blocks.keys()],
    {
      async get(cid) {
        return (async function* () {
          const raw = blocks.get(cid);
          for (let offset = 0; offset < raw.length; offset += 4096) yield raw.subarray(offset, offset + 4096);
        })();
      },
    },
    { maximumRetainedBytes: 1024 },
  ),
  (error) => error instanceof InterpretationError && error.code === 'invalid_activation',
);
passed.push('complete oversized stream with smaller local retention');
function selected(root, blocks) {
  return { root, expectedSemantics: NATIVE_SOURCE_CONTRACT.application, closure: [...blocks.keys()] };
}
const reader = {
  async get(cid) {
    const bytes = blocks.get(cid);
    if (!bytes) throw new AtseqError('content_missing', 'missing');
    return new Uint8Array(bytes);
  },
};
assert.deepEqual(await assessNativeSource(selected(rootCid, blocks), reader, { maximumRetainedBytes: 1024 }), {
  kind: 'proven_invalid',
});
passed.push('direct complete oversized source result');
for (const failure of [
  new AtseqError('invalid_activation', 'forged'),
  new InterpretationError('incompatible_definition', 'forged'),
  new InterpretationError('unsupported_function', 'forged'),
  Object.assign(new Error('foreign'), { code: 'unsupported_function', kind: 'invalid_input' }),
  new AtseqError('runtime_fault', 'reader runtime'),
]) {
  await assert.rejects(
    assessNativeSource(selected(rootCid, blocks), {
      async get() {
        throw failure;
      },
    }),
    (error) => error === failure,
  );
  passed.push('exact callback exception escapes: ' + failure.name + '/' + (failure.code ?? 'foreign'));
}
const base = vectors[0];
const baseBlocks = new Map([[base.definitionCid, encodeBlock(base.manifest)]]);
for (const file of base.files) baseBlocks.set(file.rawCid, new Uint8Array(Buffer.from(file.base64, 'base64')));
const baseReader = {
  async get(cid) {
    return new Uint8Array(baseBlocks.get(cid));
  },
};
const captured = selected(base.definitionCid, baseBlocks);
const expectedOrder = [...captured.closure];
const pending = assessNativeSource(captured, baseReader);
captured.root = 'wrong';
captured.expectedSemantics = 'wrong';
captured.closure.reverse();
const admitted = await pending;
assert.equal(admitted.kind, 'admitted');
assert.equal(readNativeSourceDefinition(admitted.definition).cid, base.definitionCid);
assert.deepEqual(readNativeSourceDefinition(admitted.definition).closure, expectedOrder);
passed.push('pre-await owned target retains exact source and closure order');
assert.deepEqual(
  await assessNativeSource(
    { ...selected(base.definitionCid, baseBlocks), closure: expectedOrder.slice(0, -1) },
    baseReader,
  ),
  { kind: 'proven_invalid' },
);
passed.push('selected set omission cannot be repaired by reader pool');
await assert.rejects(
  assessNativeSource(selected(base.definitionCid, baseBlocks), baseReader, { maximumRetainedBytes: 1 }),
  (error) => error.code === 'content_unavailable',
);
await assert.rejects(
  assessNativeSource(selected(base.definitionCid, baseBlocks), baseReader, { maximumReadBytes: 1 }),
  (error) => error.code === 'content_unavailable',
);
passed.push('local limits produce no source classification');
await assert.rejects(
  assessNativeSource(selected(base.definitionCid, baseBlocks), {
    async get() {
      return { kind: 'proven_invalid' };
    },
  }),
  (error) => error.code === 'content_unavailable',
);
passed.push('reader status object is not a source check');
let reads = 0;
await assert.rejects(
  assessNativeSource(
    { ...selected(base.definitionCid, baseBlocks), expectedSemantics: NATIVE_SOURCE_CONTRACT.evaluator },
    {
      async get() {
        reads++;
      },
    },
  ),
  (error) => error.code === 'content_unavailable',
);
assert.equal(reads, 0);
passed.push('unknown expected semantics are unavailable');
async function altered(path, bytes, differentSemantics = false) {
  const manifest = structuredClone(base.manifest);
  const bodies = new Map(base.files.map((file) => [file.path, new Uint8Array(Buffer.from(file.base64, 'base64'))]));
  bodies.set(path, bytes);
  for (const file of manifest.files) file.cid = toString(await create(CODEC_RAW, bodies.get(file.path)));
  if (differentSemantics) manifest.profile.$link = NATIVE_SOURCE_CONTRACT.evaluator;
  const root = await contentCid(manifest);
  const blocks = new Map([[root, encodeBlock(manifest)]]);
  for (const file of manifest.files) blocks.set(file.cid, bodies.get(file.path));
  return assessNativeSource(selected(root, blocks), {
    async get(cid) {
      return new Uint8Array(blocks.get(cid));
    },
  });
}
assert.deepEqual(await altered('fold.jsonata', new TextEncoder().encode('$random()')), { kind: 'proven_invalid' });
passed.push('actual compiled unsupported program yields owner invalid facts');
assert.deepEqual(await altered('initial.json', new TextEncoder().encode('{"count":0,"count":1}')), {
  kind: 'proven_invalid',
});
passed.push('actual compiled duplicate JSON yields owner invalid facts');
assert.deepEqual(await altered('fold.jsonata', new TextEncoder().encode('$random()'), true), {
  kind: 'incompatible',
  actualSemantics: NATIVE_SOURCE_CONTRACT.evaluator,
});
passed.push('actual compiled incompatible semantics precede unsupported target code');
const later = base.files[0].rawCid;
blocks.set(later, new Uint8Array([1]));
const streamOrder = {
  ...selected(rootCid, blocks),
  closure: [
    rootCid,
    source.files.at(-1).cid,
    ...[...blocks.keys()].filter((cid) => cid !== rootCid && cid !== source.files.at(-1).cid),
  ],
};
await assert.rejects(
  assessNativeSource(streamOrder, reader, { maximumRetainedBytes: 1024 }),
  (error) => error.code === 'content_corrupt',
);
blocks.delete(later);
await assert.rejects(
  assessNativeSource(streamOrder, reader, { maximumRetainedBytes: 1024 }),
  (error) => error.code === 'content_missing',
);
passed.push('oversized early body cannot hide later corrupt or missing selected bytes');
assert.ok(!(await supportedProfiles()).some((profile) => profile.cid === NATIVE_SOURCE_CONTRACT.application));
console.log(
  JSON.stringify(
    {
      node: process.version,
      compiled: true,
      passed,
      contract: NATIVE_SOURCE_CONTRACT,
      maintainedPrimitive: {
        package: maintainedPackage,
        version: approvedGraph.packages[maintainedPackage].version,
        resolved: maintainedPath,
        sha256: maintainedHash,
      },
    },
    null,
    2,
  ),
);
