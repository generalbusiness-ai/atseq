// Independent native-format writer: no source/protocol, @atcute or registry imports.
// TEST scalars 1,2,3 are public and must never protect a real identity.
import { createECDH, createPrivateKey, createHash, sign, verify } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { encode } from '@ipld/dag-cbor';
import { CID } from 'multiformats/cid';
import { sha256 } from 'multiformats/hashes/sha2';
import { base58btc } from 'multiformats/bases/base58';
import { base32 } from 'multiformats/bases/base32';
const output = 'tests/vectors/native-foundation.json';
let previous;
try {
  previous = JSON.parse(await readFile(output, 'utf8'));
} catch (e) {
  if (e.code !== 'ENOENT') throw e;
}
const N = 'ai.generalbusiness.atseq',
  type = (name) => `${N}.defs#${name}`;
const bytes = (b) => ({ $bytes: Buffer.from(b).toString('base64').replace(/=+$/, '') });
const lex = (v) =>
  v && typeof v === 'object'
    ? '$bytes' in v
      ? new Uint8Array(Buffer.from(v.$bytes, 'base64'))
      : '$link' in v
        ? CID.parse(v.$link)
        : Array.isArray(v)
          ? v.map(lex)
          : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, lex(x)]))
    : v;
const block = (v) => Buffer.from(encode(lex(v)));
const cid = async (v) => CID.createV1(0x71, await sha256.digest(block(v))).toString();
const rawCid = async (b) => CID.createV1(0x55, await sha256.digest(b)).toString();
const link = (id) => ({ $link: id });
const key = (scalar, curve = 'prime256v1') => {
  const secret = Buffer.alloc(32);
  secret[31] = scalar;
  const e = createECDH(curve);
  e.setPrivateKey(secret);
  const full = e.getPublicKey(),
    compressed = e.getPublicKey(undefined, 'compressed');
  const privateKey = createPrivateKey({
    format: 'jwk',
    key: {
      kty: 'EC',
      crv: curve === 'prime256v1' ? 'P-256' : 'secp256k1',
      d: secret.toString('base64url'),
      x: full.subarray(1, 33).toString('base64url'),
      y: full.subarray(33).toString('base64url'),
    },
  });
  return {
    did:
      'did:key:' +
      base58btc.encode(Buffer.concat([Buffer.from(curve === 'prime256v1' ? [0x80, 0x24] : [0xe7, 0x01]), compressed])),
    privateKey,
  };
};
const actor = key(1),
  control = key(2),
  repository = key(3, 'secp256k1');
const order = BigInt('0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551');
function signature(value, old) {
  const data = block(value);
  if (old) {
    const retained = Buffer.from(old.$bytes, 'base64');
    const retainedS = retained.length === 64 ? BigInt('0x' + retained.subarray(32).toString('hex')) : 0n;
    if (
      retainedS > 0n &&
      retainedS <= order / 2n &&
      verify('sha256', data, { key: actor.privateKey, dsaEncoding: 'ieee-p1363' }, retained)
    )
      return old;
  }
  const sig = sign('sha256', data, { key: actor.privateKey, dsaEncoding: 'ieee-p1363' });
  const s = BigInt('0x' + sig.subarray(32).toString('hex'));
  if (s > order / 2n) Buffer.from((order - s).toString(16).padStart(64, '0'), 'hex').copy(sig, 32);
  if (!verify('sha256', data, { key: actor.privateKey, dsaEncoding: 'ieee-p1363' }, sig))
    throw Error('Independent signature failed');
  return bytes(sig);
}
const placeholder = link(await cid({ fixture: 'wire-only placeholder, not authenticated evidence' }));
const policy = {
  $type: `${N}.content`,
  version: 1,
  body: {
    $type: type('observationPolicy'),
    algorithm: 'atseq-account-observation-v1',
    plcDirectory: 'https://plc.directory',
    allowWeb: true,
    checkpoint: 'native-publication-v1',
  },
};
const app = 'did:plc:aaaaaaaaaaaaaaaaaaaaaaaa',
  principal = 'did:plc:bbbbbbbbbbbbbbbbbbbbbbbb';
const genesis = {
  $type: `${N}.genesis`,
  version: 2,
  app,
  creation: bytes(Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex')),
  semantics: placeholder,
  definition: placeholder,
  observationPolicy: link(await cid(policy)),
  control: [{ principal, actorKey: control.did, powers: ['govern', 'recover'] }],
  recoverGovernance: true,
  owner: principal,
  roles: [{ principal, role: 'member' }],
};
const G = await cid(genesis),
  epoch = { $type: `${N}.epoch`, version: 1, id: bytes(Buffer.alloc(16, 1)), previous: null },
  epochCID = await cid(epoch);
const grantID = base32.encode(Buffer.alloc(16, 2)).slice(1);
const grant = {
  $type: `${N}.grant`,
  version: 1,
  id: grantID,
  app,
  genesis: link(G),
  epoch: link(epochCID),
  actorKey: actor.did,
  actions: [{ action: `${N}.totals#add`, execution: placeholder }],
  assignRoles: ['member'],
};
const intent = {
  $type: type('intent'),
  version: 2,
  app,
  genesis: link(G),
  principal,
  actorKey: actor.did,
  nonce: bytes(Buffer.alloc(16, 3)),
  operation: {
    $type: type('act'),
    grant: { id: grantID, cid: link(await cid(grant)) },
    epoch: link(epochCID),
    action: `${N}.totals#add`,
    execution: placeholder,
    payload: { delta: 3, note: null },
  },
};
const signed = { $type: type('signedRequest'), intent, sig: signature(intent, previous?.blocks?.signed?.value?.sig) };
let alternate = signature(intent, previous?.alternateSignature);
while (alternate.$bytes === signed.sig.$bytes) alternate = signature(intent);
const entry = { $type: `${N}.entry`, version: 2, app, genesis: link(G), position: 1, prev: link(G), request: signed };
const head = { $type: `${N}.head`, version: 2, app, genesis: link(G), position: 1, entry: link(await cid(entry)) };
const account = {
  $type: type('accountOperation'),
  app,
  genesis: link(G),
  position: 2,
  prev: head.entry,
  principal,
  expectedEpoch: link(epochCID),
  expectedObservation: null,
  operation: { $type: type('admitGrant'), grant: { id: grantID, cid: link(await cid(grant)) } },
  observation: placeholder,
};
const projected = structuredClone(account);
delete projected.observation;
const subject = await cid({ $type: type('observationSubject'), request: projected });
const evidence = {
  $type: type('plcAudit'),
  bytes: placeholder,
  source: `https://plc.directory/${principal}/log/audit`,
  selectedTip: placeholder,
};
const observation = {
  $type: `${N}.content`,
  version: 1,
  body: {
    $type: type('observation'),
    policy: link(await cid(policy)),
    principal,
    context: { app, genesis: link(G), position: 2, prev: head.entry, subject: link(subject) },
    binding: { signingKeyDid: repository.did, pdsOrigin: 'https://pds.example' },
    before: evidence,
    after: evidence,
    repositoryRoot: placeholder,
    records: [{ path: `${N}.grant/${grantID}`, cid: link(await cid(grant)) }],
    proofs: [placeholder],
    observedAt: '2026-10-01T00:00:00.000Z',
  },
};
account.observation = link(await cid(observation));
const accountEntry = { ...entry, position: 2, prev: head.entry, request: account };
const raw = Uint8Array.from({ length: 32771 }, (_, i) => i % 251),
  chunks = [];
for (let start = 0; start < raw.length; start += 32768)
  chunks.push({
    $type: `${N}.content`,
    version: 1,
    body: { $type: type('byteChunk'), bytes: bytes(raw.subarray(start, start + 32768)) },
  });
const manifest = {
  $type: `${N}.content`,
  version: 1,
  body: {
    $type: type('byteManifest'),
    byteLength: raw.length,
    chunks: await Promise.all(chunks.map(async (c) => link(await cid(c)))),
  },
};
const file = { $type: `${N}.file`, version: 1, cid: await rawCid(raw), bytes: link(await cid(manifest)) };
const epochCurrent = { $type: `${N}.epochCurrent`, version: 1, id: epoch.id, epoch: link(epochCID) };
const revoke = { $type: `${N}.revoke`, version: 1, id: grantID, app, genesis: link(G) };
const controlContext = { position: 2, prev: head.entry, controlTip: link(G) };
const controls = {
  setControl: {
    $type: type('setControl'),
    ...controlContext,
    control: [{ principal, actorKey: control.did, powers: ['certify', 'govern', 'recover'] }],
  },
  setRecovery: { $type: type('setRecovery'), ...controlContext, recovery: [{ principal, actorKey: control.did }] },
  setOwner: { $type: type('setOwner'), ...controlContext, owner: null },
  setRole: {
    $type: type('setRole'),
    ...controlContext,
    target: principal,
    role: 'member',
    enabled: false,
    expectedAssignment: link(G),
  },
  activate: {
    $type: type('activate'),
    ...controlContext,
    expected: placeholder,
    definition: placeholder,
    closure: [placeholder.$link],
  },
  recoverParticipant: {
    $type: type('recoverParticipant'),
    ...controlContext,
    target: principal,
    expectedEpoch: link(epochCID),
    expectedObservation: null,
    epoch: link(epochCID),
    observation: placeholder,
  },
  recoverGovernance: { $type: type('recoverGovernance'), ...controlContext, governance: [] },
  assignRole: {
    $type: type('assignRole'),
    grant: intent.operation.grant,
    epoch: link(epochCID),
    target: principal,
    role: 'member',
    enabled: true,
    expectedAssignment: null,
  },
  advanceEpoch: { $type: type('advanceEpoch'), epoch: link(epochCID) },
  revokeGrant: { $type: type('revokeGrant'), revoke: { id: grantID, cid: link(await cid(revoke)) } },
};
const disableRoleIntent = { ...intent, actorKey: control.did, operation: controls.setRole };
const appBinding = {
  $type: `${N}.content`,
  version: 1,
  body: {
    $type: type('appBinding'),
    policy: link(await cid(policy)),
    principal: app,
    binding: observation.body.binding,
    before: evidence,
    after: evidence,
    repositoryRoot: placeholder,
  },
};
const receipt = {
  $type: type('receipt'),
  version: 2,
  app,
  genesis: link(G),
  request: link(await cid(intent)),
  position: 1,
  entry: link(await cid(entry)),
  publication: {
    root: placeholder,
    binding: link(await cid(appBinding)),
    proofs: [link(await cid(manifest))],
    head: link(await cid(head)),
  },
};
const definition = {
  $type: `${N}.definition`,
  version: 2,
  profile: placeholder,
  title: 'Retained assets wire fixture',
  files: [
    { path: 'unused.txt', cid: file.cid },
    { path: 'state.json', cid: file.cid },
    { path: 'fold.jsonata', cid: file.cid },
    { path: 'schemas.json', cid: file.cid },
  ],
  lexicons: ['schemas.json'],
  state: { ref: `${N}.totals#state`, initial: 'state.json' },
  actions: [
    { ref: `${N}.totals#add`, fold: 'fold.jsonata', authorization: { $type: type('requiredRole'), role: 'member' } },
  ],
  queries: [],
  views: [],
};
const values = {
  disableRoleIntent,
  appBinding,
  receipt,
  definition,
  policy,
  genesis,
  epoch,
  epochCurrent,
  grant,
  revoke,
  intent,
  signed,
  entry,
  head,
  account,
  observation,
  accountEntry,
  chunk0: chunks[0],
  chunk1: chunks[1],
  manifest,
  file,
  ...controls,
};
const blocks = Object.fromEntries(
  await Promise.all(
    Object.entries(values).map(async ([name, value]) => [
      name,
      {
        value,
        cborHex: block(value).toString('hex'),
        cid: await cid(value),
        sha256: createHash('sha256').update(block(value)).digest('hex'),
      },
    ]),
  ),
);
const result = {
  provenance: {
    encoder: '@ipld/dag-cbor; multiformats CID/SHA-256; no implementation imports',
    signer: 'Node OpenSSL ECDSA-SHA256/P1363 low-S; retained public fixture signatures, not deterministic ECDSA',
    publicTestScalars: [1, 2, 3],
    scope: 'Content framing only. Placeholder identities, source, roots and PLC bytes are not valid native/I1 proofs.',
  },
  keys: { actor: actor.did, control: control.did, repository: repository.did },
  blocks,
  alternateSignature: alternate,
  observationSubject: subject,
  proposedRoleRevisions: { enabledGenesis: G, neverAssigned: null, disabled: await cid(disableRoleIntent) },
  rawFileHex: Buffer.from(raw).toString('hex'),
};
const serialized = JSON.stringify(result, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (JSON.stringify(result) !== JSON.stringify(JSON.parse(await readFile(output, 'utf8'))))
    throw Error('Retained fixture differs from independent encoding');
  console.log('Independent fixture bytes/CIDs/signatures reproduced');
} else {
  await writeFile(output, serialized);
  console.log('Wrote independently encoded native wire fixtures');
}
