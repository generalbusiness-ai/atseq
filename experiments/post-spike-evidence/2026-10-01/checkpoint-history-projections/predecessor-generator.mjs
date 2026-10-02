/** Source-only mechanical projection vectors. No checkpoint admission or trust capability. */
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
const i2 = resolve(process.argv[2] ?? '../native-authority');
const root = resolve(import.meta.dirname, '../..');
const output = join(root, 'experiments/generated/checkpoint-projections');
const input = join(root, 'experiments/post-spike-evidence/2026-10-01/checkpoint-projections/i2-public-vectors.json.gz');
const sha = (value) => createHash('sha256').update(value).digest('hex');
const sourceHead = 'd08104ddae3e737b8de9e13a3e89116e65d84afc';
const modules = [
  'src/core/values.ts',
  'src/protocol/wire.ts',
  'src/protocol/native-schema.ts',
  'src/protocol/native-wire.ts',
  'src/application/native-authority.ts',
  'src/application/native-authority-snapshot.ts',
];
const sourceHashes = {};
for (const file of modules) {
  const actual = await readFile(join(i2, file));
  assert.equal(
    sha(actual),
    sha(execFileSync('git', ['show', `${sourceHead}:${file}`], { cwd: i2 })),
    `Frozen source ${file}`,
  );
  sourceHashes[file] = sha(actual);
}
const load = (file) => import(pathToFileURL(join(i2, file)).href);
const { canonicalJson } = await load('src/core/values.ts');
const { bytes, contentCid, encodeBlock, decodeBlock, link } = await load('src/protocol/wire.ts');
const { nativeRef, NATIVE_NSID } = await load('src/protocol/native-schema.ts');
const { NativeAnchor, readNativeValue, reconstructNativeBytes, verifyNativeEntryContents, nativeRetryIdentity } =
  await load('src/protocol/native-wire.ts');
const { openNativeAuthority, nativeAuthoritySnapshot } = await load('src/application/native-authority.ts');
const { readNativeAuthoritySnapshot } = await load('src/application/native-authority-snapshot.ts');
const require = createRequire(join(i2, 'package.json'));
const CID = await import(pathToFileURL(require.resolve('@atcute/cid')).href);
const rawCid = async (raw) => CID.toString(await CID.create(CID.CODEC_RAW, raw));
const fixtureRaw = gunzipSync(await readFile(input));
assert.equal(sha(fixtureRaw), 'a6ca8f0aa56a1986e6fc4e39f13da8b6609d3a6829c1349e94487c9496e4e019');
const fixture = JSON.parse(fixtureRaw)[0];
const anchor = await NativeAnchor.from(fixture.genesis, { app: fixture.genesis.app, genesis: fixture.genesisCid });
const scope = { app: fixture.genesis.app, genesis: fixture.genesisCid };
const records = new Map(),
  payloads = [],
  cases = [],
  byteProjections = [];
await mkdir(join(output, 'payloads'), { recursive: true });
await mkdir(join(output, 'native-records'), { recursive: true });
async function frame(name, raw) {
  raw = new Uint8Array(raw);
  const chunks = [];
  for (let offset = 0; offset < raw.length; offset += 32768) {
    const record = {
      $type: NATIVE_NSID.content,
      version: 1,
      body: { $type: nativeRef('byteChunk'), bytes: bytes(raw.slice(offset, offset + 32768)) },
    };
    await readNativeValue(NATIVE_NSID.content, record);
    const cid = await contentCid(record);
    records.set(cid, encodeBlock(record));
    chunks.push(link(cid));
  }
  const manifest = {
    $type: NATIVE_NSID.content,
    version: 1,
    body: { $type: nativeRef('byteManifest'), byteLength: raw.length, chunks },
  };
  await readNativeValue(NATIVE_NSID.content, manifest);
  const cid = await contentCid(manifest);
  records.set(cid, encodeBlock(manifest));
  const restored = await reconstructNativeBytes(
    manifest,
    {
      get: async (id) => {
        assert.ok(records.has(id));
        return new Uint8Array(records.get(id));
      },
    },
    raw.length,
  );
  assert.deepEqual(restored, raw);
  await writeFile(join(output, 'payloads', name), raw);
  payloads.push({
    file: `payloads/${name}`,
    bytes: raw.length,
    sha256: sha(raw),
    manifest: cid,
    chunks: chunks.map((c) => c.$link),
  });
  return cid;
}
async function json(name, value, max = 32 * 1024 * 1024) {
  const text = canonicalJson(value, max, 32);
  assert.equal(canonicalJson(JSON.parse(text), max, 32), text);
  return frame(`${name}.json`, new TextEncoder().encode(text));
}
const initial = nativeAuthoritySnapshot(await openNativeAuthority(anchor));
const parsedInitial = await readNativeAuthoritySnapshot(initial, anchor);
assert.throws(() => nativeAuthoritySnapshot(parsedInitial));
const snapshots = new Map([[0, initial]]);
for (const n of [1, 2, 12, 13, 20]) {
  const snapshot = fixture.vectors[n - 1].snapshot;
  const parsed = await readNativeAuthoritySnapshot(snapshot, anchor);
  assert.throws(() => nativeAuthoritySnapshot(parsed));
  snapshots.set(n, snapshot);
  await json(`authority-${n}`, snapshot);
}
await json('authority-0', initial);
const compact = new Map();
const authorityOptions = [];
for (const [position, snapshot] of snapshots) {
  const { consumedObservations, requests: priorRequests, retries, ...kernel } = snapshot;
  kernel.format = 'atseq-checkpoint-authority';
  compact.set(position, kernel);
  const baselineText = canonicalJson(snapshot,32*1024*1024,32);
  const compactText = canonicalJson(kernel,32*1024*1024,32);
  const manifest = await json(`checkpoint-authority-${position}`,kernel);
  authorityOptions.push({position,fullI2Bytes:Buffer.byteLength(baselineText),compactBytes:Buffer.byteLength(compactText),
    omittedIndexBytes:Buffer.byteLength(baselineText)-Buffer.byteLength(compactText),manifest});
  await assert.rejects(() => readNativeAuthoritySnapshot(kernel,anchor));
}
assert.ok(initial.roles.every((r) => r.enabled && r.revision === scope.genesis));
assert.equal(initial.roles.find((r) => r.role === 'neverAssigned')?.revision ?? null, null);
assert.equal(snapshots.get(2).roles.find((r) => r.role === 'member').enabled, false);
assert.notEqual(snapshots.get(2).roles.find((r) => r.role === 'member').revision, scope.genesis);
assert.ok(snapshots.get(13).principals[0].epochs.length >= 2);
assert.ok(
  snapshots.get(13).grants.some((g) => g.grant && g.grant.epoch.$link !== snapshots.get(13).principals[0].epoch),
);
cases.push('exact I2 genesis/disabled-role/retired-epoch/recovery authority projections remain parsed data');
const history = [],
  requests = [],
  descriptors = [],
  outcomes = [];
const through = snapshots.get(13).frontier;
for (let index = 0; index < 13; index++) {
  const vector = fixture.vectors[index],
    raw = new Uint8Array(vector.entry);
  const checked = await verifyNativeEntryContents(decodeBlock(raw), anchor);
  assert.equal(checked.entry.position, index + 1);
  assert.equal(checked.entry.prev.$link, index ? history[index - 1].entry : scope.genesis);
  const signed = checked.entry.request.$type === nativeRef('signedRequest');
  const originalRequest = encodeBlock(checked.entry.request);
  const unsigned = signed ? checked.entry.request.intent : checked.entry.request;
  const unsignedBytes = encodeBlock(unsigned);
  assert.equal(await contentCid(unsigned), checked.requestCid);
  const actor = signed ? { actorKey: unsigned.actorKey, nonce: unsigned.nonce.$bytes } : null;
  requests.push({ position: index + 1, entry: checked.entryCid, request: checked.requestCid, actor });
  const observation = signed
    ? unsigned.operation.$type === nativeRef('recoverParticipant')
      ? unsigned.operation.observation.$link
      : null
    : unsigned.observation.$link;
  history.push({
    position: index + 1,
    entry: checked.entryCid,
    request: checked.requestCid,
    entryBytes: await frame(`entry-${index + 1}.cbor`, raw),
    requestBytes: await frame(`request-${index + 1}.cbor`, originalRequest),
    observations: observation === null ? [] : [observation],
  });
  if (observation !== null)
    descriptors.push({
      descriptor: observation,
      position: index + 1,
      entry: checked.entryCid,
      request: checked.requestCid,
    });
  const outcome =
    vector.outcome.decision === 'effective' ? { decision: 'effective' } : { ...vector.outcome, source: 'framework' };
  outcomes.push({ position: index + 1, entry: checked.entryCid, outcome });
  byteProjections.push({
    position: index + 1,
    entry: checked.entryCid,
    request: checked.requestCid,
    unsignedBytesBase64: bytes(unsignedBytes).$bytes,
    requestBytesBase64: bytes(originalRequest).$bytes,
    nonceBase64: actor?.nonce ?? null,
    signatureBase64: signed ? checked.entry.request.sig.$bytes : null,
    retry: signed ? nativeRetryIdentity(unsigned) : null,
  });
}
descriptors.sort((a, b) => (a.descriptor < b.descriptor ? -1 : 1));
function crossCheck(frontier) {
  const snapshot = snapshots.get(frontier);
  assert.deepEqual(
    requests
      .filter((r) => r.position <= frontier)
      .map((r) => r.request)
      .sort(),
    snapshot.requests,
  );
  assert.deepEqual(
    byteProjections
      .filter((r) => r.position <= frontier && r.retry !== null)
      .map((r) => r.retry)
      .sort(),
    snapshot.retries,
  );
  assert.deepEqual(
    descriptors
      .filter((r) => r.position <= frontier)
      .map((r) => r.descriptor)
      .sort(),
    snapshot.consumedObservations,
  );
}
for (const frontier of [2,12,13]) {
  crossCheck(frontier);
  const rebuilt = {...compact.get(frontier),format:'atseq-native-authority',
    requests:requests.filter(r=>r.position<=frontier).map(r=>r.request).sort(),
    retries:byteProjections.filter(r=>r.position<=frontier&&r.retry!==null).map(r=>r.retry).sort(),
    consumedObservations:descriptors.filter(r=>r.position<=frontier).map(r=>r.descriptor).sort()};
  assert.equal(canonicalJson(await readNativeAuthoritySnapshot(rebuilt,anchor),32*1024*1024,32),canonicalJson(snapshots.get(frontier),32*1024*1024,32));
  assert.throws(() => nativeAuthoritySnapshot(rebuilt));
}
assert.equal(snapshots.get(2).roles.find((r) => r.role === 'member').revision, requests[1].request);
assert.notEqual(requests[1].request, await contentCid(decodeBlock(new Uint8Array(fixture.vectors[1].entry)).request));
cases.push('13 original entries retain signatures/nonces and unsigned CID identity; disabled role uses unsigned CID');
cases.push('head indexes reconstruct exact temporary I2 data at frontier without minting authority; compact omits duplicate arrays');
async function table(kind, rows, target = through, perPage = 2, label = kind) {
  const pages = [];
  for (let offset = 0; offset < rows.length; offset += perPage) {
    const page = rows.slice(offset, offset + perPage);
    pages.push({ payload: await json(`${label}-page-${pages.length + 1}`, page, 128 * 1024), rows: page.length });
  }
  assert.equal(
    pages.reduce((n, p) => n + p.rows, 0),
    rows.length,
  );
  return json(`${label}-table`, {
    format: 'atseq-checkpoint-table',
    version: 1,
    ...scope,
    kind,
    through: target,
    rows: rows.length,
    pages,
  });
}
const tables = {
  requests: await table('requests', requests),
  descriptors: await table('descriptors', descriptors),
  history: await table('history', history),
  outcomes: await table('outcomes', outcomes),
  outcomes12: await table('outcomes', outcomes.slice(0, 12), snapshots.get(12).frontier, 2, 'outcomes12'),
};
// Retain original I2 content/CAR/method bytes. CID rows carry intrinsic bytes;
// proof/identity contexts are in the original supported records/publication package.
const evidenceRaw = new Map(fixture.content.map(([cid, raw]) => [cid, new Uint8Array(raw)]));
const methodBytes = new Uint8Array(fixture.appIdentity.auditBytes);
evidenceRaw.set(await rawCid(methodBytes), methodBytes);
for (let index = 0; index < 13; index++) {
  const car = new Uint8Array(fixture.vectors[index].appCar);
  evidenceRaw.set(await rawCid(car), car);
}
const evidence = [];
for (const [cid, raw] of [...evidenceRaw].sort(([a], [b]) => (a < b ? -1 : 1))) {
  const parsed = CID.fromString(cid);
  assert.equal(CID.toString(await CID.create(parsed.codec, raw)), cid);
  evidence.push({ cid, bytes: await frame(`evidence-${evidence.length + 1}.bin`, raw) });
}
tables.evidence = await table('evidence', evidence, through, 32);
// Standalone native source-row shape/framing example, not the I2 placeholder source.
const files = [];
const sourceBytes = [
  ['unused.bin', new Uint8Array([0, 255, 128])],
  ['state.json', new TextEncoder().encode('{}\n')],
  [
    'lexicon.json',
    new TextEncoder().encode(
      canonicalJson({ lexicon: 1, id: 'org.example.checkpoint', defs: { state: { type: 'object', properties: {} } } }),
    ),
  ],
];
for (const [path, raw] of sourceBytes)
  files.push({ path, cid: await rawCid(raw), bytes: await frame(`source-${path}`, raw) });
const definition = {
  $type: NATIVE_NSID.definition,
  version: 2,
  profile: fixture.genesis.semantics,
  title: 'Checkpoint source framing example',
  files: files.map(({ path, cid }) => ({ path, cid })),
  lexicons: ['lexicon.json'],
  state: { ref: 'org.example.checkpoint#state', initial: 'state.json' },
  actions: [],
  queries: [],
  views: [],
};
await readNativeValue(NATIVE_NSID.definition, definition);
const sourceRow = {
  definition: await contentCid(definition),
  manifest: await frame('source-definition.cbor', encodeBlock(definition)),
  files,
};
const sourceTable = await table('sources', [sourceRow]);
assert.deepEqual(
  files.map((f) => f.path),
  ['unused.bin', 'state.json', 'lexicon.json'],
);
cases.push('standalone native source row preserves supplied nonalphabetic file order and unused binary asset');
// These outer bytes deliberately lack admitted source/provenance/publication gates.
// They are structural/framing literals, never a claimed admitted checkpoint.
const state = await json('domain-state', {});
const claimedProducer = await json('claimed-producer', {
  format: 'atseq-execution-provenance',
  version: 1,
  environment: 'node-source',
  runtime: { name: 'node', version: '22.19.0' },
  source: sourceTable,
  dependencies: tables.evidence,
  outputs: null,
});
async function assertion(name, frontier, stall, outcomeTable) {
  return json(name, {
    format: 'atseq-checkpoint-assertion',
    version: 1,
    ...scope,
    head: through,
    frontier: snapshots.get(frontier).frontier,
    definition: snapshots.get(frontier).activeDefinition,
    state,
    authority: payloads.find((p) => p.file === `payloads/checkpoint-authority-${frontier}.json`).manifest,
    requests: tables.requests,
    descriptors: tables.descriptors,
    outcomes: outcomeTable,
    history: tables.history,
    sources: sourceTable,
    evidence: tables.evidence,
    stall,
    producer: claimedProducer,
  });
}
const complete = await assertion('assertion-complete-shape', 13, null, tables.outcomes);
const stalled = await assertion(
  'assertion-stalled-shape',
  12,
  { position: 13, entry: history[12].entry, diagnostic: 'producer availability diagnostic' },
  tables.outcomes12,
);
const omitted = await assertion('assertion-outcomes-omitted-shape', 13, null, null);
assert.equal(snapshots.get(12).frontier.position + 1, history[12].position);
assert.ok(snapshots.get(12).frontier.position < through.position);
cases.push('stalled outer literal binds strictly later head and exact first uninterpreted entry');
for (const length of [0, 32768, 32769]) await frame(`chunk-boundary-${length}.bin`, new Uint8Array(length).fill(7));
cases.push('native deterministic chunk framing covers empty/exact32KiB/two-chunk boundary');
await json('fold-denial-namespace', {
  decision: 'ineffective',
  source: 'fold',
  reason: 'grant_revoked',
  message: 'unchanged authored message',
});
await json('framework-denial-namespace', { decision: 'ineffective', source: 'framework', reason: 'grant_revoked' });
await json('original-byte-projections', byteProjections);
for (const [cid, raw] of records) await writeFile(join(output, 'native-records', `${cid}.cbor`), raw);
const inventory = [...records]
  .sort(([a], [b]) => (a < b ? -1 : 1))
  .map(([cid, raw]) => ({ cid, file: `native-records/${cid}.cbor`, bytes: raw.length, sha256: sha(raw) }));
const result = {
  format: 'atseq-checkpoint-projection-vectors',
  version: 1,
  i2Source: sourceHead,
  inputRawSha256: sha(fixtureRaw),
  scope,
  through,
  authorityOnly: true,
  preferredAuthorityProjection: 'compact',
  authorityOptions,
  noCheckpointAdmission: true,
  noPrivateKeysRetained: true,
  notAdmissibleOuterReasons: [
    'I2 fixture uses unsupported semantic/source placeholder',
    'source table example is not the active placeholder definition',
    'claimed provenance inventories are framing examples only',
    'no caller-accepted publication or local-restore admission has run',
  ],
  cases,
  byteProjections,
  tables,
  standaloneSourceRow: sourceRow,
  assertions: { complete, stalled, omitted },
  payloads,
  nativeRecords: inventory,
  sourceHashes,
};
await writeFile(join(output, 'vectors.json'), JSON.stringify(result, null, 2) + '\n');
console.log(
  JSON.stringify({
    node: process.version,
    cases: cases.length,
    payloads: payloads.length,
    nativeRecords: inventory.length,
    vectorsSha256: sha(await readFile(join(output, 'vectors.json'))),
    noCheckpointAdmission: true,
  }),
);
