/** Decode frozen PUBLIC fixtures only; never regenerate the original application oracle. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const rows = {
  component: [
    'ATSEQ_NATIVE_DISCOVERY_FIXTURE_PATH',
    '.atseq-local/c1-kernel/native-discovery-fixture-final2.json',
    'testdata/native-discovery/component.json.gz',
    'cb9c193fe35088f65356f76389cd98fd357a3524fecd941121ee93743502cdc9',
  ],
  original: [
    'ATSEQ_NATIVE_APPLICATION_FIXTURE_PATH',
    '.atseq-local/c1-kernel/original-application.json',
    'experiments/post-spike-evidence/2026-10-02/native-prefix/fixtures/application.json.gz',
    'f7c6d9c3740208973de828da976107b32a6107ad3c62085412476fdbb2e874e6',
  ],
  few: [
    'ATSEQ_NATIVE_DISCOVERY_WORKLOAD_FEW',
    '.atseq-local/c1-kernel/native-discovery-workload-few-final.json',
    'testdata/native-discovery/few.json.gz',
    '1f264eae62254d8635f64dba5db39f0c1bea24ca31f500d9a3b24f1eb504bb1c',
  ],
  many: [
    'ATSEQ_NATIVE_DISCOVERY_WORKLOAD_MANY',
    '.atseq-local/c1-kernel/native-discovery-workload-many-final.json',
    'testdata/native-discovery/many.json.gz',
    'c57bac34ec63ee186f0016be32cedd9cb3b3b1b08f227c61fd812abc782c3e14',
  ],
};
export async function nativeDiscoveryFixtureFile(kind) {
  assert.ok(Object.hasOwn(rows, kind));
  const [variable, cache, compressed, expected] = rows[kind];
  const path = process.env[variable] ?? cache;
  let raw;
  try {
    raw = await readFile(path);
  } catch (error) {
    if (process.env[variable] || error.code !== 'ENOENT') throw error;
    raw = gunzipSync(await readFile(compressed));
    await mkdir('.atseq-local/c1-kernel', { recursive: true });
    await writeFile(path, raw);
  }
  assert.equal(createHash('sha256').update(raw).digest('hex'), expected, 'Exact frozen public fixture ' + kind);
  return { path, raw };
}
