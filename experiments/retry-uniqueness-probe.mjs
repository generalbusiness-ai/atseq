// R0 semantic/storage model only. No signatures, native proofs, real wire CIDs,
// checkpoint certification or runtime behavior are tested by this experiment.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const canonical = (value) =>
  JSON.stringify(value, (_, item) =>
    item && typeof item === 'object' && !Array.isArray(item)
      ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)))
      : item,
  );
const hash = (value) => createHash('sha256').update(canonical(value)).digest('hex');
const byteLength = (value) => Buffer.byteLength(canonical(value));
const base = {
  app: 'did:plc:aaaaaaaaaaaaaaaaaaaaaaaa',
  genesis: 'g'.repeat(64),
  principal: 'did:plc:bbbbbbbbbbbbbbbbbbbbbbbb',
  grant: 'h'.repeat(64),
  signer: 'did:key:example-signer',
  entryType: 'account-action',
  execution: 'x'.repeat(64),
  action: 'ai.generalbusiness.example.act',
  payload: { value: 1 },
};
const intent = (token, changes = {}) => ({ ...base, token, ...changes });
const nonceKey = (i) => canonical([i.app, i.genesis, i.signer, i.token]);
const counterScope = (i) => canonical([i.app, i.genesis, i.signer, i.grant]);
const isNonceFixture = (token) => typeof token === 'string' && token.length === 32 && /^[0-9a-f]+$/.test(token);
const modes = ['nonce', 'consecutive', 'increasing'];

class Model {
  receipts = new Map();
  byIntent = new Map();
  marks = new Map();
  position = 0;
  constructor(mode) {
    this.mode = mode;
  }
  key(i) {
    return this.mode === 'nonce' ? nonceKey(i) : canonical([counterScope(i), i.token]);
  }
  append(i, authorized = true) {
    if (this.mode === 'nonce' && !isNonceFixture(i.token)) return { result: 'invalid_nonce_shape' };
    const key = this.key(i);
    if (this.receipts.has(key) || this.byIntent.has(hash(i))) return { result: 'invalid_duplicate_history' };
    if (this.mode !== 'nonce') {
      const previous = this.marks.get(counterScope(i)) ?? 0;
      if (!Number.isSafeInteger(i.token) || i.token < 1) return { result: 'invalid_counter' };
      if (i.token <= previous) return { result: 'stale_unused_counter' };
      if (this.mode === 'consecutive' && i.token !== previous + 1) return { result: 'counter_gap' };
      this.marks.set(counterScope(i), i.token);
    }
    const receipt = {
      intent: hash(i),
      position: ++this.position,
      entry: hash([this.position, i]),
      outcome: authorized ? 'effective' : 'ineffective',
    };
    this.receipts.set(key, receipt);
    this.byIntent.set(receipt.intent, receipt);
    return { result: 'ordered', receipt };
  }
  submit(i, { authorized = true, originalEvidenceAvailable = true } = {}) {
    if (this.mode === 'nonce' && !isNonceFixture(i.token)) return { result: 'invalid_nonce_shape' };
    const exact = this.byIntent.get(hash(i));
    if (exact) {
      if (!originalEvidenceAvailable) return { result: 'unavailable_original_evidence' };
      return { result: 'original_receipt', receipt: exact };
    }
    const existing = this.receipts.get(this.key(i));
    if (existing) {
      if (!originalEvidenceAvailable) return { result: 'unavailable_original_evidence' };
      return { result: 'content_conflict' };
    }
    return this.append(i, authorized);
  }
}

const cases = [];
function check(name, mode, run) {
  const observed = run(new Model(mode));
  cases.push({ case: name, mode, passed: true, observed });
}
for (const mode of modes) {
  const first = mode === 'nonce' ? '0'.repeat(32) : 1;
  const second = mode === 'nonce' ? '1'.repeat(32) : 2;
  check('exact original retry after revocation/reset/activation returns its old outcome', mode, (m) => {
    const original = m.submit(intent(first));
    const retry = m.submit(intent(first), { authorized: false });
    assert.equal(retry.result, 'original_receipt');
    assert.deepEqual(retry.receipt, original.receipt);
    assert.equal(m.position, 1);
    return retry.result;
  });
  check('different payload/contract/principal/type under the same signer and token conflicts', mode, (m) => {
    m.submit(intent(first));
    const changes = [
      { payload: { value: 2 } },
      { execution: 'y'.repeat(64) },
      { principal: 'another-principal' },
      { entryType: 'app-control' },
    ];
    if (mode === 'nonce') changes.push({ grant: 'new-grant' });
    for (const change of changes) assert.equal(m.submit(intent(first, change)).result, 'content_conflict');
    assert.equal(m.position, 1);
    return { conflicts: changes.length };
  });
  check('old content cannot be diagnosed without original evidence', mode, (m) => {
    m.submit(intent(first));
    assert.equal(m.submit(intent(first), { originalEvidenceAvailable: false }).result, 'unavailable_original_evidence');
    assert.equal(
      m.submit(intent(first, { payload: { value: 3 } }), { originalEvidenceAvailable: false }).result,
      'unavailable_original_evidence',
    );
    return 'unavailable_original_evidence';
  });
  check('arbitrary old retry below the newest token still needs its original content', mode, (m) => {
    m.submit(intent(first));
    m.submit(intent(second));
    assert.equal(m.submit(intent(first)).result, 'original_receipt');
    assert.equal(m.submit(intent(first, { payload: { value: 8 } })).result, 'content_conflict');
    return { positions: m.position, oldestRetry: 'content_conflict' };
  });
  check('cloned signer allocation: first content wins; exact retry is not another position', mode, (m) => {
    m.submit(intent(first));
    assert.equal(m.submit(intent(first, { payload: { value: 7 } })).result, 'content_conflict');
    assert.equal(m.submit(intent(first)).result, 'original_receipt');
    return { positions: m.position };
  });
  check('cancelled first draft followed by second token', mode, (m) => {
    const result = m.submit(intent(second)).result;
    assert.equal(result, mode === 'consecutive' ? 'counter_gap' : 'ordered');
    return result;
  });
  check('higher offline token arrives before lower token', mode, (m) => {
    const higher = m.submit(intent(second)).result;
    const lower = m.submit(intent(first)).result;
    assert.deepEqual(
      [higher, lower],
      mode === 'nonce'
        ? ['ordered', 'ordered']
        : mode === 'consecutive'
          ? ['counter_gap', 'ordered']
          : ['ordered', 'stale_unused_counter'],
    );
    return [higher, lower];
  });
  check('authentic ineffective entry still consumes retry identity', mode, (m) => {
    assert.equal(m.submit(intent(first), { authorized: false }).receipt.outcome, 'ineffective');
    assert.equal(m.append(intent(first)).result, 'invalid_duplicate_history');
    assert.equal(m.submit(intent(first)).receipt.outcome, 'ineffective');
    return { positions: m.position, outcome: 'ineffective' };
  });
  check('same token under another pinned genesis is a different identity', mode, (m) => {
    m.submit(intent(first));
    assert.equal(m.submit(intent(first, { genesis: 'another-genesis' })).result, 'ordered');
    return { positions: m.position };
  });
  check('different signer reusing a token is new work; clients must forbid silent replacement', mode, (m) => {
    m.submit(intent(first));
    const result = m.submit(intent(first, { grant: 'new-grant', signer: 'new-key' })).result;
    assert.equal(result, 'ordered');
    return result;
  });
  check('different device grants need no shared allocator', mode, (m) => {
    m.submit(intent(first));
    const otherToken = mode === 'nonce' ? second : first;
    assert.equal(
      m.submit(intent(otherToken, { grant: 'other-device-grant', signer: 'other-device-key' })).result,
      'ordered',
    );
    return { positions: m.position };
  });
}

for (const [name, change] of [
  ['unrelated-key front-running', { signer: 'unrelated-key', grant: 'unrelated-grant' }],
  ['wrong-principal grant front-running', { signer: 'key-for-other-principal', grant: 'grant-from-other-principal' }],
  ['unadmitted signer front-running', { signer: 'unadmitted-key', grant: 'unadmitted-grant' }],
  ['revoked signer front-running', { signer: 'revoked-key', grant: 'revoked-grant' }],
]) {
  check(name + ' cannot consume the victim signer namespace', 'nonce', (m) => {
    const token = '2'.repeat(32);
    assert.equal(m.submit(intent(token, change), { authorized: false }).receipt.outcome, 'ineffective');
    assert.equal(m.submit(intent(token)).receipt.outcome, 'effective');
    assert.equal(m.submit(intent(token)).result, 'original_receipt');
    assert.equal(m.position, 2);
    return { positions: m.position, victimOutcome: 'effective' };
  });
}
check('renewal with the same signer and nonce but a different grant conflicts', 'nonce', (m) => {
  const token = '3'.repeat(32);
  m.submit(intent(token));
  assert.equal(m.submit(intent(token, { grant: 'renewed-grant' })).result, 'content_conflict');
  return { positions: m.position };
});
check('signer and nonce consume one namespace across account and control types', 'nonce', (m) => {
  const token = '4'.repeat(32);
  m.submit(intent(token, { entryType: 'app-control' }));
  assert.equal(m.submit(intent(token)).result, 'content_conflict');
  return { positions: m.position };
});
check('nonce fixture must represent exactly sixteen bytes', 'nonce', (m) => {
  for (const token of [
    '',
    '0'.repeat(30),
    '0'.repeat(34),
    'z'.repeat(32),
    '0'.repeat(32) + '\n',
    Array(16).fill(0),
    null,
    0,
  ])
    assert.equal(m.submit(intent(token)).result, 'invalid_nonce_shape');
  assert.equal(m.position, 0);
  return { rejectedFixtures: 8, positions: m.position };
});

const storage = [];
for (const n of [100, 1_000, 10_000]) {
  for (const [scenario, grants, retired] of [
    ['one long-lived grant', 1, 0],
    ['sixteen long-lived grants', 16, 0],
    ['many retained retired grants', 100, 99],
    ['one-use signer/grant per action', n, n - 1],
  ]) {
    const nonce = new Model('nonce');
    const counter = new Model('increasing');
    const allocated = new Map();
    for (let k = 0; k < n; k++) {
      const grantIndex = k % grants;
      const change = { grant: hash(['grant', grantIndex]), signer: `key-${grantIndex}` };
      const next = (allocated.get(grantIndex) ?? 0) + 1;
      allocated.set(grantIndex, next);
      assert.equal(nonce.submit(intent(k.toString(16).padStart(32, '0'), change)).result, 'ordered');
      assert.equal(counter.submit(intent(next, change)).result, 'ordered');
    }
    storage.push({
      actions: n,
      scenario,
      distinctGrants: grants,
      retiredGrantsCounted: retired,
      nonceUniqueKeys: nonce.receipts.size,
      counterMarks: counter.marks.size,
      noncePreventionJsonBytes: byteLength([...nonce.receipts.keys()]),
      counterPreventionJsonBytes: byteLength([...counter.marks]),
      noncePreventionSharedPinsJsonBytes: byteLength([...nonce.receipts.keys()].map((key) => JSON.parse(key).slice(2))),
      counterPreventionSharedPinsJsonBytes: byteLength(
        [...counter.marks].map(([scope, highest]) => [...JSON.parse(scope).slice(2), highest]),
      ),
      nonceReceiptIndexJsonBytes: byteLength([...nonce.receipts]),
      counterReceiptIndexJsonBytes: byteLength([...counter.receipts]),
    });
  }
}
const precedingPath = 'experiments/post-spike-evidence/2026-10-01/retry-uniqueness-model.json';
const precedingBytes = await readFile(precedingPath);
const result = {
  kind: 'atseq-retry-uniqueness-design-model',
  version: 2,
  capturedAt: new Date().toISOString(),
  node: process.version,
  sourceSha256: createHash('sha256')
    .update(await readFile(new URL(import.meta.url)))
    .digest('hex'),
  namespace: '(app, genesis, signer, nonce); counter comparison scoped to signer and grant',
  preCorrectionEvidence: {
    path: precedingPath,
    sha256: createHash('sha256').update(precedingBytes).digest('hex'),
    sourceSha256: JSON.parse(precedingBytes).sourceSha256,
    sourceGitHead: 'f8118814264ad15478b573ece074317c922b4020',
    assessment: 'b4403ae5fbf68b91f8b83d8c0fd8c58b219296d9',
    correction: 'Claimed principal did not authenticate the retry namespace; use the authenticated signer instead',
  },
  identityEncoding: 'sorted JSON and SHA-256 model hashes; not DRISL-CBOR or actual wire CIDs',
  nonceFixtures: 'deterministic unique 16-byte hex values; no RNG quality experiment',
  storageEncoding:
    'UTF-8 sorted compact JSON; no compression, native MST/proofs, authority/grant records or durable DB overhead',
  limitations: [
    'Semantic model only, no runtime/protocol conformance or signature tests',
    'No timing, heap, transfer or checkpoint verification measurements',
    'Grant/epoch/contract state modeled by supplied authorization, not independently verified',
    'Signatures and canonical real signer-key encodings are assumed; nonce length tests use a sixteen-byte hex fixture',
    'No CAS/network failures modeled as actual native operations',
    'Retired counter marks retained because ineffective ordered work still participates in uniqueness',
  ],
  cases,
  storage,
};
await mkdir('experiments/generated/retry-uniqueness', { recursive: true });
await writeFile('experiments/generated/retry-uniqueness/results.json', JSON.stringify(result, null, 2) + '\n');
console.log(
  JSON.stringify({ casesPassed: cases.length, storageCases: storage.length, sourceSha256: result.sourceSha256 }),
);
