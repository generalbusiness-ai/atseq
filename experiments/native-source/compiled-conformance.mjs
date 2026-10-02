/** Probe the actual production build, without changing package exports or supported profiles. */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { relative } from 'node:path';
import { create, CODEC_RAW, toString } from '@atcute/cid';
import {
  admitNativeSourceDefinition,
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
import { InterpretationError } from '../../dist/src/core/errors.js';

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
  const definition = await admitNativeSourceDefinition(vector.definitionCid, [...blocks.keys()], {
    async get(cid) {
      assert.ok(blocks.has(cid));
      return new Uint8Array(blocks.get(cid));
    },
  });
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
