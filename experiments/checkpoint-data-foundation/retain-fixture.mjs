/** Retain public exact accepted literals, never regenerate keys or native records. */
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { resolve, join } from 'node:path';
const source = resolve(process.argv[2]);
const evidence = join(source, 'experiments/post-spike-evidence/2026-10-01/checkpoint-history-projections');
const vectorsRaw = await readFile(join(evidence, 'vectors.json'));
const sha = (raw) => createHash('sha256').update(raw).digest('hex');
if (sha(vectorsRaw) !== '175a20c68b576cbd76e1a9db7b740de788d93ec08dca777705ccd22d1e685517')
  throw new Error('Unexpected accepted vectors');
const vectors = JSON.parse(vectorsRaw);
const records = vectors.nativeRecords.map((row) => {
  const raw = execFileSync('tar', ['-xOf', join(evidence, 'vectors.tar.gz'), row.file]);
  if (sha(raw) !== row.sha256 || raw.length !== row.bytes) throw new Error('Corrupt accepted record');
  return [row.cid, raw.toString('base64')];
});
const i2Raw = gunzipSync(
  await readFile(
    join(source, 'experiments/post-spike-evidence/2026-10-01/checkpoint-projections/i2-public-vectors.json.gz'),
  ),
);
if (sha(i2Raw) !== vectors.inputRawSha256) throw new Error('Unexpected exact I2 input');
const original = JSON.parse(i2Raw)[0];
const fixture = {
  source: '8e7dc9a23693d356db84a7dfc82b8ecde5613767',
  sourceVectorsSha256: sha(vectorsRaw),
  genesis: original.genesis,
  genesisCid: original.genesisCid,
  scope: vectors.scope,
  payloads: vectors.payloads.map(({ file, manifest }) => ({ file, manifest })),
  records,
};
const raw = Buffer.from(JSON.stringify(fixture));
await writeFile('tests/vectors/checkpoint-data.json.gz', gzipSync(raw, { mtime: 0 }));
console.log(
  JSON.stringify({
    rawBytes: raw.length,
    rawSha256: sha(raw),
    records: records.length,
    payloads: fixture.payloads.length,
    noPrivateKeys: true,
  }),
);
