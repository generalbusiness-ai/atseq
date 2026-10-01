// Isolated D0 evidence, not a runtime verifier. Install the explicitly pinned
// packages under .atseq-local/native-proof-probe before running this script.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { randomBytes, createHash } from 'node:crypto';
import { startEnvironment, resetDisposable } from '../tests/support/pds/environment.mjs';
import { fromUint8Array as readCar } from '../.atseq-local/native-proof-probe/node_modules/@atcute/car/dist/index.js';
import {
  create,
  CODEC_DCBOR,
  toString as cidString,
} from '../.atseq-local/native-proof-probe/node_modules/@atcute/cid/dist/index.js';
import { encode, decode } from '../.atseq-local/native-proof-probe/node_modules/@atcute/cbor/dist/index.js';
import {
  verifyRecord,
  fromUint8Array as readRepo,
} from '../.atseq-local/native-proof-probe/node_modules/@atcute/repo/dist/index.js';
import {
  parseDidKey,
  Secp256k1PrivateKeyExportable,
  getPublicKeyFromDidController,
  Secp256k1PublicKey,
  P256PublicKey,
} from '../.atseq-local/native-proof-probe/node_modules/@atcute/crypto/dist/index.js';
import { build } from 'vite';
import { formatDidKey } from '../tests/support/pds/node_modules/@atproto/crypto/dist/index.js';

const env = await startEnvironment();
const results = [];
try {
  const config = JSON.parse(await readFile(`${env.dir}/pds-secrets.json`, 'utf8'));
  const response = await fetch(`${env.url}/xrpc/com.atproto.server.createAccount`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      handle: `native${randomBytes(5).toString('hex')}.test`,
      email: 'probe@example.test',
      password: randomBytes(24).toString('hex'),
    }),
  });
  assert.equal(response.status, 200);
  const account = await response.json();
  const collection = 'ai.generalbusiness.atseq.probe';
  const value = { $type: collection, position: 1, purpose: 'Native membership probe; not an Atseq wire contract' };
  const created = await fetch(`${env.url}/xrpc/com.atproto.repo.createRecord`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${account.accessJwt}` },
    body: JSON.stringify({ repo: account.did, collection, rkey: 'one', record: value }),
  });
  assert.equal(created.status, 200);
  const createdRecord = await created.json();
  const didDoc = await (await fetch(`${config.didPlcUrl}/${account.did}`)).json();
  const controller = didDoc.verificationMethod.find((v) => v.id === `${account.did}#atproto` || v.id === '#atproto');
  assert.ok(controller);
  const legacy = getPublicKeyFromDidController(controller);
  const parsed = parseDidKey(formatDidKey(legacy.jwtAlg, legacy.publicKeyBytes));
  const key = await (parsed.type === 'secp256k1' ? Secp256k1PublicKey : P256PublicKey).importRaw(parsed.publicKeyBytes);
  const carResponse = await fetch(
    `${env.url}/xrpc/com.atproto.sync.getRecord?did=${encodeURIComponent(account.did)}&collection=${collection}&rkey=one`,
  );
  assert.equal(carResponse.status, 200);
  const carBytes = new Uint8Array(await carResponse.arrayBuffer());
  const root = readCar(carBytes).header.data.roots[0].$link;
  const options = { did: account.did, collection, rkey: 'one', publicKey: key, carBytes };
  const valid = await verifyRecord(options);
  assert.equal(valid.cid, createdRecord.cid);
  assert.deepEqual(valid.record, value);
  results.push({
    case: 'official PDS record membership and current mock-PLC key',
    passed: true,
    root,
    recordCid: valid.cid,
    proofBytes: carBytes.length,
    proofSha256: createHash('sha256').update(carBytes).digest('hex'),
  });
  for (const [name, change] of [
    ['wrong DID', { did: 'did:plc:aaaaaaaaaaaaaaaaaaaaaaaa' }],
    ['wrong path', { rkey: 'absent' }],
    ['wrong key', { publicKey: await Secp256k1PrivateKeyExportable.createKeypair() }],
    ['truncated CAR', { carBytes: carBytes.slice(0, carBytes.length - 1) }],
  ]) {
    await assert.rejects(() => verifyRecord({ ...options, ...change }));
    results.push({ case: name, passed: true });
  }
  const tampered = new Uint8Array(carBytes);
  tampered[tampered.length - 1] ^= 1;
  await assert.rejects(() => verifyRecord({ ...options, carBytes: tampered }));
  results.push({ case: 'tampered referenced block', passed: true });
  const allResponse = await fetch(`${env.url}/xrpc/com.atproto.sync.getRepo?did=${encodeURIComponent(account.did)}`);
  assert.equal(allResponse.status, 200);
  const allBytes = new Uint8Array(await allResponse.arrayBuffer());
  const entries = [...readRepo(allBytes)];
  assert.equal(entries.length, 1);
  assert.equal(entries[0].cid.$link, valid.cid);
  results.push({
    case: 'full CAR structural reader agrees with sparse membership',
    passed: true,
    repoBytes: allBytes.length,
  });
  // The proof reader indexes every supplied CAR on each verifyRecord invocation.
  // Production must authenticate/index a root once and reuse maintained MST
  // path primitives rather than repeat this convenience call N times on a full CAR.
  const blocks = [...readCar(carBytes)];
  const commit = decode(blocks.find((b) => cidString(b.cid) === root).bytes);
  assert.equal(commit.did, account.did);
  assert.equal(commit.prev, null);
  const second = { $type: collection, position: 2, prev: { $link: valid.cid } };
  const secondCid = cidString(await create(CODEC_DCBOR, encode(second)));
  const head = { $type: collection, position: 2, entry: { $link: secondCid } };
  const appended = await fetch(`${env.url}/xrpc/com.atproto.repo.applyWrites`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${account.accessJwt}` },
    body: JSON.stringify({
      repo: account.did,
      swapCommit: root,
      writes: [
        { $type: 'com.atproto.repo.applyWrites#create', collection, rkey: 'two', value: second },
        { $type: 'com.atproto.repo.applyWrites#create', collection, rkey: 'head', value: head },
      ],
    }),
  });
  assert.equal(appended.status, 200);
  const diffResponse = await fetch(
    `${env.url}/xrpc/com.atproto.sync.getRepo?did=${encodeURIComponent(account.did)}&since=${commit.rev}`,
  );
  assert.equal(diffResponse.status, 200);
  const diffBytes = new Uint8Array(await diffResponse.arrayBuffer());
  const diffRoot = readCar(diffBytes).header.data.roots[0].$link;
  assert.notEqual(diffRoot, root);
  const next = await verifyRecord({ ...options, rkey: 'two', carBytes: diffBytes });
  const nextHead = await verifyRecord({ ...options, rkey: 'head', carBytes: diffBytes });
  assert.equal(next.cid, secondCid);
  assert.equal(next.record.prev.$link, valid.cid);
  assert.equal(nextHead.record.entry.$link, secondCid);
  results.push({
    case: 'native since diff proves new entry and head under one root',
    passed: true,
    diffRoot,
    sinceRev: commit.rev,
    diffBytes: diffBytes.length,
    diffSha256: createHash('sha256').update(diffBytes).digest('hex'),
  });
  await mkdir('experiments/generated/native-authority', { recursive: true });
  await writeFile('experiments/generated/native-authority/diff.car', diffBytes);
  const bundled = await build({
    configFile: false,
    logLevel: 'error',
    build: {
      write: false,
      minify: true,
      lib: {
        entry: new URL('../.atseq-local/native-proof-probe/node_modules/@atcute/repo/dist/index.js', import.meta.url)
          .pathname,
        formats: ['es'],
      },
    },
  });
  const chunks = (Array.isArray(bundled) ? bundled : [bundled])
    .flatMap((result) => result.output)
    .filter((x) => x.type === 'chunk');
  assert.ok(chunks.length);
  assert.ok(chunks.every((x) => !/from\s*['"]node:/.test(x.code)));
  results.push({
    case: 'browser production bundle compiles without node imports',
    passed: true,
    jsBytes: chunks.reduce((n, c) => n + Buffer.byteLength(c.code), 0),
    executionTested: false,
  });
  await mkdir('experiments/generated/native-authority', { recursive: true });
  await writeFile('experiments/generated/native-authority/proof.car', carBytes);
  await writeFile(
    'experiments/generated/native-authority/results.json',
    JSON.stringify(
      {
        packages: { repo: '1.1.0', mst: '1.1.1' },
        pds: '0.5.31',
        mockPlc: true,
        results,
        limitations: [
          'Not a complete Atseq native-ordering implementation',
          'No live provider identity/currentness test',
          'Browser bundling only, not browser execution',
          'Whole-tree canonical validation and shared-root reuse require P1 wrapper',
        ],
      },
      null,
      2,
    ) + '\n',
  );
  console.log(JSON.stringify(results, null, 2));
} finally {
  await env.close();
  await resetDisposable(env.dir);
}
