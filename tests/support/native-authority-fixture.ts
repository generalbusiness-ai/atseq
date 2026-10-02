import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';
import { NodeStore, NodeWrangler, MemoryBlockStore } from '@atcute/mst';
import { P256PrivateKeyExportable, type PrivateKeyExportable } from '@atcute/crypto';
import { toBase32 } from '@atcute/multibase';
import { car } from './native-proof-corpus.ts';
import { plcIdentityFixture } from './identity-corpus.ts';
import { authenticateRepo } from '../../src/protocol/native-proof.ts';
import { NATIVE_NSID, nativeRef } from '../../src/protocol/native-schema.ts';
import {
  NativeAnchor,
  nativeEntryPath,
  nativeHeadPath,
  nativeHeadAt,
  nativeGenesisPath,
  nativeObservationSubject,
  signNativeIntent,
  type NativeGenesis,
  type NativeIntent,
  type NativeAccountOperation,
  type NativeRequest,
  type ControlAppointment,
} from '../../src/protocol/native-wire.ts';
import { bytes, contentCid, encodeBlock, link } from '../../src/protocol/wire.ts';
import { AtseqError } from '../../src/core/errors.ts';
import { deriveIdentityBinding } from '../../src/protocol/identity-binding.ts';
import { didWebToUrl, isDidWeb } from '@atproto/did';
import {
  openNativePrefix,
  stageNativePrefix,
  acceptNativePrefix,
  type NativePrefix,
} from '../../src/application/native-prefix.ts';
import { NATIVE_SOURCE_CONTRACT } from '../../src/definition/native-source-contract.ts';
import { authenticateAuthorityEntry } from '../../src/application/native-authority-evidence.ts';
import {
  openNativeAuthority,
  nativeAuthoritySnapshot,
  interpretNativeAuthority,
  type NativeAuthorityState,
  type NativeAuthorityOutcome,
  type NativeAuthoritySnapshot,
} from '../../src/application/native-authority.ts';

export const grantId = (n: number) => toBase32(new Uint8Array(16).fill(n));
export const epochId = (n: number) => bytes(new Uint8Array(16).fill(n));
export const authorityRevision = (n: number) => {
  const alphabet = '234567abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 13; i++) {
    result = alphabet[n % 32] + result;
    n = Math.floor(n / 32);
  }
  return result;
};
export async function authorityRepo(
  did: string,
  key: PrivateKeyExportable,
  records: Map<string, Uint8Array>,
  revision: number,
) {
  const store = new MemoryBlockStore(),
    writer = new NodeWrangler(new NodeStore(store));
  let data: string | null = null;
  for (const [path, raw] of [...records].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    const recordCid = CID.toCidLink(CID.createSync(CID.CODEC_DCBOR, raw));
    await store.put(recordCid.$link, new Uint8Array(raw));
    data = await writer.putRecord(data, path, recordCid);
  }
  if (!data) throw new Error('Authority fixture repository must contain records');
  const unsigned = { did, version: 3, rev: authorityRevision(revision), data: link(data), prev: null };
  const raw = CBOR.encode({ ...unsigned, sig: CBOR.toBytes(await key.sign(CBOR.encode(unsigned))) });
  const root = CID.toString(CID.createSync(CID.CODEC_DCBOR, raw));
  const blocks = new Map<string, Uint8Array>(store.blocks);
  blocks.set(root, new Uint8Array(raw));
  return { root, car: await car(root, blocks) };
}
export interface AuthorityVector {
  name: string;
  entry: number[];
  appCar: number[];
  outcome: NativeAuthorityOutcome;
  snapshot: NativeAuthoritySnapshot;
}
export interface AuthorityPublicFixture {
  genesis: NativeGenesis;
  genesisCid: string;
  appKey: string;
  appIdentity: { auditBytes: number[]; selectedTipCid: string };
  content: [string, number[]][];
  vectors: AuthorityVector[];
  hostile: AuthorityHostileVector[];
}
export interface AuthorityHostileVector {
  name: string;
  entry: number[];
  appCar: number[];
  missingContent: string | null;
  expectedCode: string;
  claimedAppKey?: string;
  appIdentityAfter?: { auditBytes: number[]; selectedTipCid: string };
  stage?: 'interpret';
}
export class AuthorityHarness {
  state!: NativeAuthorityState;
  prefix: NativePrefix | null = null;
  anchor!: NativeAnchor;
  app!: Awaited<ReturnType<typeof plcIdentityFixture>>;
  actor!: Omit<Awaited<ReturnType<typeof plcIdentityFixture>>, 'principal'> & { principal: string };
  device!: P256PrivateKeyExportable;
  control!: P256PrivateKeyExportable;
  appRecords = new Map<string, Uint8Array>();
  accountRecords = new Map<string, Uint8Array>();
  content = new Map<string, Uint8Array>();
  vectors: AuthorityVector[] = [];
  hostile: AuthorityHostileVector[] = [];
  revision = 1;
  nonce = 1;
  static async create(
    repositoryCurve: 'p256' | 'secp256k1' = 'p256',
    participantMethod: 'plc' | 'web' = 'plc',
    controlPolicy: 'default' | 'mixed-recovery-blocked' = 'default',
  ) {
    const h = new AuthorityHarness();
    h.app = await plcIdentityFixture(repositoryCurve);
    h.actor = await plcIdentityFixture(repositoryCurve);
    if (participantMethod === 'web') h.actor.principal = 'did:web:participant.example';
    h.device = await P256PrivateKeyExportable.createKeypair();
    h.control = await P256PrivateKeyExportable.createKeypair();
    const policy = await h.stash({
      $type: nativeRef('observationPolicy'),
      algorithm: 'atseq-account-observation-v1',
      plcDirectory: 'https://plc.directory',
      allowWeb: true,
      checkpoint: 'native-publication-v1',
    });
    const placeholder = await contentCid({ fixture: 'not-supported-native-semantics' });
    const genesis: NativeGenesis = {
      $type: NATIVE_NSID.genesis,
      version: 2,
      app: h.app.principal,
      creation: epochId(101),
      semantics: link(NATIVE_SOURCE_CONTRACT.native),
      definition: link(placeholder),
      observationPolicy: link(policy),
      control: [
        {
          principal: h.actor.principal,
          actorKey: await h.control.exportPublicKey('did'),
          powers: ['govern', 'recover'],
        },
      ],
      recoverGovernance: true,
      owner: h.actor.principal,
      roles: [{ principal: h.actor.principal, role: 'member' }],
    };
    if (controlPolicy === 'mixed-recovery-blocked') {
      const control: ControlAppointment[] = [
        {
          principal: h.actor.principal,
          actorKey: await h.control.exportPublicKey('did'),
          powers: ['certify', 'recover'],
        },
      ];
      for (let n = 0; n < 15; n++)
        control.push({
          principal: h.actor.principal,
          actorKey: await (await P256PrivateKeyExportable.createKeypair()).exportPublicKey('did'),
          powers: ['certify', 'recover'],
        });
      genesis.control = control.sort((a, b) => {
        const left = JSON.stringify([a.principal, a.actorKey]),
          right = JSON.stringify([b.principal, b.actorKey]);
        return left < right ? -1 : left > right ? 1 : 0;
      });
      genesis.recoverGovernance = false;
    }
    const genesisCid = await contentCid(genesis);
    h.anchor = await NativeAnchor.from(genesis, { app: h.app.principal, genesis: genesisCid });
    h.state = await openNativeAuthority(h.anchor);
    h.appRecords.set(nativeGenesisPath(genesisCid), encodeBlock(genesis));
    h.appRecords.set(nativeHeadPath(genesisCid), encodeBlock(await nativeHeadAt(h.anchor)));
    return h;
  }
  async stash(body: unknown) {
    const record = { $type: NATIVE_NSID.content, version: 1, body },
      cid = await contentCid(record),
      raw = encodeBlock(record);
    this.content.set(cid, raw);
    this.appRecords.set(`${NATIVE_NSID.content}/${cid}`, raw);
    return cid;
  }
  async retained(raw: Uint8Array) {
    const chunks = [];
    for (let offset = 0; offset < raw.length; offset += 32 * 1024)
      chunks.push(
        link(await this.stash({ $type: nativeRef('byteChunk'), bytes: bytes(raw.slice(offset, offset + 32 * 1024)) })),
      );
    return this.stash({ $type: nativeRef('byteManifest'), byteLength: raw.length, chunks });
  }
  async account(collection: string, key: string, record: unknown) {
    const raw = encodeBlock(record),
      cid = await contentCid(record);
    this.accountRecords.set(`${collection}/${key}`, raw);
    return cid;
  }
  async epoch(n: number, previous: string | null = null) {
    const record = {
      $type: NATIVE_NSID.epoch,
      version: 1,
      id: epochId(n),
      previous: previous === null ? null : link(previous),
    };
    const cid = await contentCid(record);
    await this.account(NATIVE_NSID.epoch, cid, record);
    await this.account(NATIVE_NSID.epochCurrent, 'self', {
      $type: NATIVE_NSID.epochCurrent,
      version: 1,
      epoch: link(cid),
      id: record.id,
    });
    return cid;
  }
  async grant(n: number, epoch: string, assignRoles: string[] = ['member'], actorKey?: string) {
    const id = grantId(n),
      cid = await this.account(NATIVE_NSID.grant, id, {
        $type: NATIVE_NSID.grant,
        version: 1,
        id,
        app: this.anchor.genesis.app,
        genesis: link(this.anchor.cid),
        epoch: link(epoch),
        actorKey: actorKey ?? (await this.device.exportPublicKey('did')),
        actions: [],
        assignRoles,
      });
    return { id, cid: link(cid) };
  }
  expectations(target = this.actor.principal) {
    const row = nativeAuthoritySnapshot(this.state).principals.find((row) => row.principal === target);
    return {
      expectedEpoch: row?.epoch ? link(row.epoch) : null,
      expectedObservation: row?.observation ? link(row.observation.cid) : null,
    };
  }
  async observe(request: NativeAccountOperation | NativeIntent, paths: string[], revision = this.revision++) {
    const proof = await authorityRepo(this.actor.principal, this.actor.key, this.accountRecords, revision);
    const proofManifest = await this.retained(proof.car);
    const web = isDidWeb(this.actor.principal);
    const audit = await this.retained(
      new TextEncoder().encode(
        JSON.stringify(
          web
            ? {
                id: this.actor.principal,
                verificationMethod: [
                  {
                    id: '#atproto',
                    type: 'Multikey',
                    controller: this.actor.principal,
                    publicKeyMultibase: this.actor.signing.slice('did:key:'.length),
                  },
                ],
                service: [
                  { id: '#atproto_pds', type: 'AtprotoPersonalDataServer', serviceEndpoint: 'https://pds.example' },
                ],
              }
            : this.actor.rows,
        ),
      ),
    );
    const method = web
      ? {
          $type: nativeRef('webDocument'),
          bytes: link(audit),
          source: didWebToUrl(this.actor.principal as `did:web:${string}`).href,
        }
      : {
          $type: nativeRef('plcAudit'),
          bytes: link(audit),
          source: `https://plc.directory/${this.actor.principal}/log/audit`,
          selectedTip: link(this.actor.selectedTipCid),
        };
    const context =
      request.$type === nativeRef('accountOperation')
        ? request
        : (request.operation as { position: number; prev: { $link: string } });
    const records = await Promise.all(
      paths.sort().map(async (path) => {
        const raw = this.accountRecords.get(path);
        if (!raw) throw new Error('Fixture subject missing');
        return { path, cid: link(CID.toString(CID.createSync(CID.CODEC_DCBOR, raw))) };
      }),
    );
    return this.stash({
      $type: nativeRef('observation'),
      policy: this.anchor.genesis.observationPolicy,
      principal: this.actor.principal,
      context: {
        app: this.anchor.genesis.app,
        genesis: link(this.anchor.cid),
        position: context.position,
        prev: context.prev,
        subject: link(await nativeObservationSubject(request)),
      },
      binding: { signingKeyDid: this.actor.signing, pdsOrigin: 'https://pds.example' },
      before: method,
      after: method,
      repositoryRoot: link(proof.root),
      records,
      proofs: [link(proofManifest)],
      observedAt: '2026-10-01T00:00:00.000Z',
    });
  }
  async accountRequest(operation: NativeAccountOperation['operation'], paths: string[], revision?: number) {
    const prior = nativeAuthoritySnapshot(this.state),
      placeholder = this.anchor.cid;
    const request: NativeAccountOperation = {
      $type: nativeRef('accountOperation'),
      app: prior.app,
      genesis: link(prior.genesis),
      position: prior.frontier.position + 1,
      prev: link(prior.frontier.entry),
      principal: this.actor.principal,
      ...this.expectations(),
      operation,
      observation: link(placeholder),
    };
    request.observation = link(await this.observe(request, paths, revision));
    return request;
  }
  async signed(operation: NativeIntent['operation'], signer = this.device) {
    return signNativeIntent(
      {
        $type: nativeRef('intent'),
        version: 2,
        app: this.anchor.genesis.app,
        genesis: link(this.anchor.cid),
        principal: this.actor.principal,
        actorKey: await signer.exportPublicKey('did'),
        nonce: epochId(this.nonce++),
        operation,
      },
      signer,
    );
  }
  async append(name: string, request: NativeRequest, expected: NativeAuthorityOutcome) {
    const prior = nativeAuthoritySnapshot(this.state);
    const entry = {
      $type: NATIVE_NSID.entry,
      version: 2,
      app: prior.app,
      genesis: link(prior.genesis),
      position: prior.frontier.position + 1,
      prev: link(prior.frontier.entry),
      request,
    };
    const entryCid = await contentCid(entry);
    this.appRecords.set(nativeEntryPath(prior.genesis, entry.position), encodeBlock(entry));
    this.appRecords.set(
      nativeHeadPath(prior.genesis),
      encodeBlock(await nativeHeadAt(this.anchor, entry.position, entryCid)),
    );
    const proof = await authorityRepo(this.app.principal, this.app.key, this.appRecords, entry.position);
    const binding = await deriveIdentityBinding(this.app.principal, {
      assuranceClass: 'plc-audit-v1',
      auditBytes: new TextEncoder().encode(JSON.stringify(this.app.rows)),
      selectedTipCid: this.app.selectedTipCid,
    });
    const appRepo = await authenticateRepo({
      carBytes: proof.car,
      expectedDid: this.app.principal,
      trustedSigningKeyDid: binding.signingKeyDid,
    });
    const appEvidence = {
      assuranceClass: 'plc-audit-v1' as const,
      auditBytes: new TextEncoder().encode(JSON.stringify(this.app.rows)),
      selectedTipCid: this.app.selectedTipCid,
    };
    const publication = {
      anchor: this.anchor,
      appRepo,
      reader: this.reader(),
      appIdentity: { before: appEvidence, after: appEvidence },
    };
    this.prefix = this.prefix
      ? acceptNativePrefix(this.prefix, await stageNativePrefix(this.prefix, publication))
      : await openNativePrefix(publication);
    const capability = await authenticateAuthorityEntry({
      prefix: this.prefix,
      reader: this.reader(),
      prior: this.state,
    });
    const interpreted = interpretNativeAuthority(this.state, capability);
    if (JSON.stringify(interpreted.outcome) !== JSON.stringify(expected))
      throw new Error(`${name}: ${JSON.stringify(interpreted.outcome)}`);
    this.state = interpreted.state;
    this.vectors.push({
      name,
      entry: [...encodeBlock(entry)],
      appCar: [...proof.car],
      outcome: expected,
      snapshot: nativeAuthoritySnapshot(this.state),
    });
    return capability;
  }
  reader() {
    return {
      get: async (cid: string) => {
        const raw = this.content.get(cid);
        if (!raw) throw new AtseqError('content_unavailable', 'Fixture retained content is missing');
        return new Uint8Array(raw);
      },
    };
  }
  publicFixture(): AuthorityPublicFixture {
    return {
      genesis: this.anchor.genesis,
      genesisCid: this.anchor.cid,
      appKey: this.app.signing,
      appIdentity: {
        auditBytes: [...new TextEncoder().encode(JSON.stringify(this.app.rows))],
        selectedTipCid: this.app.selectedTipCid,
      },
      content: [...this.content].map(([cid, raw]) => [cid, [...raw]]),
      vectors: this.vectors,
      hostile: this.hostile,
    };
  }
}
