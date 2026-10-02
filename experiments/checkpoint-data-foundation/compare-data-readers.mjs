/** Differential extraction check against the actual reviewed predecessor source. */
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { parseIdentityJson } from '../../src/protocol/identity-json.ts';
import { readNativeAuthoritySnapshot } from '../../src/application/native-authority-snapshot.ts';
import { NativeAnchor } from '../../src/protocol/native-wire.ts';
import { readCheckpointBytes, readCheckpointJson } from '../../src/protocol/checkpoint-data.ts';
const base = 'eec0c8e877b66413a6a4781f826e0fbbcfdea462';
await mkdir('.atseq-local', { recursive: true });
const modules = [];
for (const file of ['src/protocol/identity-json.ts', 'src/application/native-authority-snapshot.ts']) {
  const raw = execFileSync('git', ['show', `${base}:${file}`]);
  const name = resolve('.atseq-local', file.split('/').at(-1));
  const layer = file.split('/')[1];
  const adjusted = raw
    .toString()
    .replace(/from '\.\.\//g, "from '../src/")
    .replace(/from '\.\//g, `from '../src/${layer}/`);
  await writeFile(name, adjusted);
  modules.push({
    file,
    sha256: createHash('sha256').update(raw).digest('hex'),
    module: await import(pathToFileURL(name).href),
  });
}
async function result(action) {
  try {
    return { value: await action() };
  } catch (e) {
    return { name: e.name, code: e.code ?? null, kind: e.kind ?? null, message: e.message };
  }
}
const encode = (s) => new TextEncoder().encode(s);
let jsonCases = 0;
for (const raw of [
  encode('{}'),
  encode('{"a":1,"\\u0061":2}'),
  encode('[1,]'),
  encode('/*x*/{}'),
  encode('{} {}'),
  encode(''),
  encode('['.repeat(32) + '0' + ']'.repeat(32)),
  encode('['.repeat(33) + '0' + ']'.repeat(33)),
  new Uint8Array([239, 187, 191, 123, 125]),
  new Uint8Array([195, 40]),
  null,
  {},
])
  for (const max of [0, -1, 1, 1024, NaN, 1.5]) {
    assert.deepEqual(
      await result(() => parseIdentityJson(raw, max)),
      await result(() => modules[0].module.parseIdentityJson(raw, max)),
    );
    jsonCases++;
  }
const fixture = JSON.parse(gunzipSync(await readFile('tests/vectors/checkpoint-data.json.gz')));
const map = new Map(fixture.records.map(([cid, b64]) => [cid, new Uint8Array(Buffer.from(b64, 'base64'))]));
const reader = { get: async (cid) => map.get(cid).slice() };
const anchor = await NativeAnchor.from(fixture.genesis, fixture.scope);
let authorityCases = 0;
for (const n of [0, 1, 2, 12, 13, 20]) {
  const manifest = fixture.payloads.find((p) => p.file === `payloads/authority-${n}.json`).manifest;
  const value = readCheckpointJson(await readCheckpointBytes(manifest, reader, 32 * 1024 * 1024), 32 * 1024 * 1024);
  const edits = [
    () => {},
    (v) => (v.extra = true),
    (v) => (v.requests = []),
    (v) => (v.control.tip = v.activeDefinition),
    (v) => (v.roles = [null]),
    (v) => (v.principals = [null]),
    (v) => (v.grants = [null]),
  ];
  for (const edit of edits)
    for (const limit of [1, 32 * 1024 * 1024]) {
      const changed = structuredClone(value);
      edit(changed);
      assert.deepEqual(
        await result(() => readNativeAuthoritySnapshot(changed, anchor, limit)),
        await result(() => modules[1].module.readNativeAuthoritySnapshot(changed, anchor, limit)),
      );
      authorityCases++;
    }
}
console.log(
  JSON.stringify({
    node: process.version,
    base,
    jsonCases,
    authorityCases,
    differences: 0,
    sourceHashes: modules.map(({ file, sha256 }) => ({ file, sha256 })),
  }),
);
