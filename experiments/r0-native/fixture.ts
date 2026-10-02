/** Experiment-only finite native fixtures. No producer or restore authority. */
import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';
import { MemoryBlockStore, NodeStore, NodeWalker, NodeWrangler } from '@atcute/mst';
import { P256PrivateKeyExportable, type PrivateKeyExportable } from '@atcute/crypto';
import { toBase32 } from '@atcute/multibase';
import { plcIdentityFixture } from '../../tests/support/identity-corpus.ts';
import { applicationSource, applicationAction } from '../../tests/support/native-application-fixture.ts';
import { authorityRevision } from '../../tests/support/native-authority-fixture.ts';
import { car } from '../../tests/support/native-proof-corpus.ts';
import { NATIVE_NSID, nativeRef } from '../../src/protocol/native-schema.ts';
import { NATIVE_SOURCE_CONTRACT } from '../../src/definition/native-source-contract.ts';
import {
  NativeAnchor,
  nativeEntryPath,
  nativeGenesisPath,
  nativeHeadAt,
  nativeHeadPath,
  nativeObservationSubject,
  signNativeIntent,
} from '../../src/protocol/native-wire.ts';
import { bytes, contentCid, encodeBlock, link } from '../../src/protocol/wire.ts';
import { canonicalJson } from '../../src/core/values.ts';

export const patterns = ['one', 'sixteen', 'retired', 'one-use'] as const;
export type Pattern = (typeof patterns)[number];
export const b64 = (raw: Uint8Array) => Buffer.from(raw).toString('base64');
const json = (value: unknown, maximum = 32 * 1024 * 1024) =>
  new TextEncoder().encode(canonicalJson(value, maximum, 32));
function id(namespace: number, sequence: number) {
  const raw = new Uint8Array(16),
    view = new DataView(raw.buffer);
  view.setUint32(0, 0x52304631);
  view.setUint32(4, namespace);
  view.setBigUint64(8, BigInt(sequence));
  return raw;
}

/** Same maintained MST/root primitives as E1 dd2f97bd:74-120, not its workload guard. */
class Repository {
  store = new MemoryBlockStore();
  ns = new NodeStore(this.store);
  writer = new NodeWrangler(this.ns);
  data: string | null = null;
  constructor(
    readonly did: string,
    readonly key: PrivateKeyExportable,
  ) {}
  async put(path: string, raw: Uint8Array) {
    const cid = CID.toCidLink(CID.createSync(CID.CODEC_DCBOR, raw));
    await this.store.put(cid.$link, new Uint8Array(raw));
    this.data = await this.writer.putRecord(this.data, path, cid);
    return cid.$link;
  }
  async reachable() {
    if (!this.data) throw Error('Empty repository');
    const found = new Set<string>();
    for await (const cid of (await NodeWalker.create(this.ns, this.data)).nodeCids()) found.add(cid.$link);
    for await (const [, cid] of (await NodeWalker.create(this.ns, this.data)).entries()) found.add(cid.$link);
    return found;
  }
  async compact() {
    const live = await this.reachable();
    for (const cid of this.store.blocks.keys()) if (!live.has(cid)) this.store.blocks.delete(cid);
  }
  async capture(revision: number) {
    if (!this.data) throw Error('Empty repository');
    const unsigned = { did: this.did, version: 3, rev: authorityRevision(revision), data: link(this.data), prev: null };
    const raw = CBOR.encode({ ...unsigned, sig: CBOR.toBytes(await this.key.sign(CBOR.encode(unsigned))) });
    const root = CID.toString(CID.createSync(CID.CODEC_DCBOR, raw));
    const blocks = new Map([...(await this.reachable())].map((cid) => [cid, this.store.blocks.get(cid)!]));
    blocks.set(root, raw);
    return { root, rev: unsigned.rev, blocks, car: await car(root, blocks) };
  }
}
export interface CostFixture {
  version: 1;
  actions: number;
  pattern: Pattern;
  counts: {
    totalEntries: number;
    actorSigners: number;
    admittedGrants: number;
    retiredGrants: number;
    epochs: number;
    retiredEpochs: number;
    descriptors: number;
  };
  genesis: any;
  genesisCid: string;
  appIdentity: { auditBytes: string; selectedTipCid: string };
  appRoot: string;
  appCar: string;
  content: [string, string][];
  sources: [string, string][];
  framed: [string, string][];
  history: { table: string; pages: string[] };
  outcomes: { table: string; pages: string[] };
  sourceTable: { table: string; pages: string[] };
  evidence: { table: string; pages: string[] };
  authority: string;
  authorityManifest: string;
  probes: { ordinal: number; position: number; original: any; alternate: any; conflict: any }[];
  oracle: { state: any; outcomes: { position: number; entry: string; outcome: any }[]; authority: any };
  costs: Record<string, number>;
  preparationMs: number;
}
export async function prepare(actions: number, pattern: Pattern): Promise<CostFixture> {
  if (![100, 1000, 10000].includes(actions) || !patterns.includes(pattern)) throw Error('Outside finite R0-F1 matrix');
  const started = performance.now();
  const grants = pattern === 'one' ? 1 : pattern === 'sixteen' ? 16 : pattern === 'retired' ? 100 : actions;
  const retiring = pattern === 'retired' || pattern === 'one-use';
  const app = await plcIdentityFixture(),
    person = await plcIdentityFixture(),
    control = await P256PrivateKeyExportable.createKeypair();
  const source = await applicationSource();
  const repository = new Repository(app.principal, app.key),
    content = new Map<string, Uint8Array>();
  const framed = new Map<string, Uint8Array>(),
    history: any[] = [],
    outcomes: any[] = [],
    evidence: any[] = [];
  const seenEvidence = new Set<string>();
  async function stash(body: any) {
    const raw = encodeBlock({ $type: NATIVE_NSID.content, version: 1, body }),
      cid = CID.toString(CID.createSync(CID.CODEC_DCBOR, raw));
    await repository.put(`${NATIVE_NSID.content}/${cid}`, raw);
    content.set(cid, raw);
    return cid;
  }
  async function frame(raw: Uint8Array, target = framed) {
    const chunks = [];
    for (let offset = 0; offset < raw.length; offset += 32768) {
      const record = {
        $type: NATIVE_NSID.content,
        version: 1,
        body: { $type: nativeRef('byteChunk'), bytes: bytes(raw.slice(offset, offset + 32768)) },
      };
      const cid = await contentCid(record);
      target.set(cid, encodeBlock(record));
      chunks.push(link(cid));
    }
    const record = {
      $type: NATIVE_NSID.content,
      version: 1,
      body: { $type: nativeRef('byteManifest'), byteLength: raw.length, chunks },
    };
    const cid = await contentCid(record);
    target.set(cid, encodeBlock(record));
    return cid;
  }
  async function retained(raw: Uint8Array) {
    const cid = await frame(raw, content);
    // Framing records are native app records, so actual publication membership can be checked.
    const manifest: any = CBOR.decode(content.get(cid)!);
    for (const chunk of manifest.body.chunks)
      await repository.put(`${NATIVE_NSID.content}/${chunk.$link}`, content.get(chunk.$link)!);
    await repository.put(`${NATIVE_NSID.content}/${cid}`, content.get(cid)!);
    const rawCid = CID.toString(CID.createSync(CID.CODEC_RAW, raw));
    if (!seenEvidence.has(rawCid)) {
      evidence.push({ cid: rawCid, bytes: cid });
      seenEvidence.add(rawCid);
    }
    return cid;
  }
  const policy = await stash({
    $type: nativeRef('observationPolicy'),
    algorithm: 'atseq-account-observation-v1',
    plcDirectory: 'https://plc.directory',
    allowWeb: true,
    checkpoint: 'native-publication-v1',
  });
  const genesis = {
    $type: NATIVE_NSID.genesis,
    version: 2,
    app: app.principal,
    creation: bytes(id(0, 0)),
    semantics: link(NATIVE_SOURCE_CONTRACT.native),
    definition: link(source.root),
    observationPolicy: link(policy),
    control: [
      { principal: person.principal, actorKey: await control.exportPublicKey('did'), powers: ['govern', 'recover'] },
    ],
    recoverGovernance: true,
    owner: person.principal,
    roles: [],
  };
  const genesisCid = await contentCid(genesis),
    anchor = await NativeAnchor.from(genesis, { app: app.principal, genesis: genesisCid });
  await repository.put(nativeGenesisPath(genesisCid), encodeBlock(genesis));
  const epochRecord = { $type: NATIVE_NSID.epoch, version: 1, id: bytes(id(1, 0)), previous: null };
  const epoch = await contentCid(epochRecord),
    audit = await retained(json(person.rows));
  const method = {
    $type: nativeRef('plcAudit'),
    bytes: link(audit),
    source: `https://plc.directory/${person.principal}/log/audit`,
    selectedTip: link(person.selectedTipCid),
  };
  let previous = genesisCid,
    observation: string | null = null,
    currentEpoch: string | null = null,
    floor: any = null;
  let proofBytes = 0,
    rawEntryBytes = 0,
    rawRequestBytes = 0,
    domainCount = 0,
    actionOrdinal = 0;
  const grantRows: any[] = [],
    probes: CostFixture['probes'] = [],
    chosen = new Set([1, Math.ceil(actions / 2), actions]);
  async function append(request: any, outcome = { decision: 'effective' }) {
    const position = history.length + 1;
    const entry = {
      $type: NATIVE_NSID.entry,
      version: 2,
      app: app.principal,
      genesis: link(genesisCid),
      position,
      prev: link(previous),
      request,
    };
    const raw = encodeBlock(entry),
      nested = encodeBlock(request),
      entryCid = await contentCid(entry);
    const signed = request.$type === nativeRef('signedRequest');
    const requestCid = await contentCid(signed ? request.intent : request);
    await repository.put(nativeEntryPath(genesisCid, position), raw);
    history.push({
      position,
      entry: entryCid,
      request: requestCid,
      actor: signed ? { actorKey: request.intent.actorKey, nonce: request.intent.nonce.$bytes } : null,
      entryBytes: await frame(raw),
      requestBytes: await frame(nested),
      observations: signed ? [] : [request.observation.$link],
    });
    outcomes.push({ position, entry: entryCid, outcome });
    previous = entryCid;
    rawEntryBytes += raw.length;
    rawRequestBytes += nested.length;
    if (position % 512 === 0) await repository.compact();
    return { position, entryCid };
  }
  async function importAccount(operation: any, records: Map<string, Uint8Array>) {
    const account = new Repository(person.principal, person.key);
    for (const [path, raw] of records) await account.put(path, raw);
    const selected = await account.capture(history.length + 2);
    proofBytes += selected.car.length;
    const proof = await retained(selected.car);
    const position = history.length + 1;
    const request = {
      $type: nativeRef('accountOperation'),
      app: app.principal,
      genesis: link(genesisCid),
      position,
      prev: link(previous),
      principal: person.principal,
      expectedEpoch: currentEpoch ? link(currentEpoch) : null,
      expectedObservation: observation ? link(observation) : null,
      operation,
      observation: link(genesisCid),
    };
    observation = await stash({
      $type: nativeRef('observation'),
      policy: link(policy),
      principal: person.principal,
      context: {
        app: app.principal,
        genesis: link(genesisCid),
        position,
        prev: link(previous),
        subject: link(await nativeObservationSubject(request)),
      },
      binding: { signingKeyDid: person.signing, pdsOrigin: 'https://pds.example' },
      before: method,
      after: method,
      repositoryRoot: link(selected.root),
      records: [...records]
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([path, raw]) => ({ path, cid: link(CID.toString(CID.createSync(CID.CODEC_DCBOR, raw))) })),
      proofs: [link(proof)],
      observedAt: '2026-10-02T00:00:00.000Z',
    });
    request.observation = link(observation);
    floor = {
      cid: observation,
      root: selected.root,
      rev: selected.rev,
      signingKeyDid: person.signing,
      pdsOrigin: 'https://pds.example',
      assuranceClass: 'plc-audit-v1',
    };
    await append(request);
    currentEpoch = epoch;
  }
  async function admit(index: number) {
    const key = await P256PrivateKeyExportable.createKeypair(),
      actorKey = await key.exportPublicKey('did');
    const grant = {
      $type: NATIVE_NSID.grant,
      version: 1,
      id: toBase32(id(2, index)),
      app: app.principal,
      genesis: link(genesisCid),
      epoch: link(epoch),
      actorKey,
      actions: [{ action: applicationAction, execution: link(source.execution) }],
      assignRoles: [],
    };
    const cid = await contentCid(grant);
    await importAccount(
      { $type: nativeRef('admitGrant'), grant: { id: grant.id, cid: link(cid) } },
      new Map([
        [`${NATIVE_NSID.epoch}/${epoch}`, encodeBlock(epochRecord)],
        [
          `${NATIVE_NSID.epochCurrent}/self`,
          encodeBlock({ $type: NATIVE_NSID.epochCurrent, version: 1, id: epochRecord.id, epoch: link(epoch) }),
        ],
        [`${NATIVE_NSID.grant}/${grant.id}`, encodeBlock(grant)],
      ]),
    );
    const row = { principal: person.principal, id: grant.id, cid, grant, revoked: false };
    grantRows.push(row);
    return { key, row };
  }
  async function act(actor: Awaited<ReturnType<typeof admit>>) {
    actionOrdinal++;
    const amount = 1 + ((actionOrdinal - 1) % 10);
    const intent = {
      $type: nativeRef('intent'),
      version: 2,
      app: app.principal,
      genesis: link(genesisCid),
      principal: person.principal,
      actorKey: actor.row.grant.actorKey,
      nonce: bytes(id(3, actionOrdinal)),
      operation: {
        $type: nativeRef('act'),
        action: applicationAction,
        execution: link(source.execution),
        payload: { amount },
        grant: { id: actor.row.id, cid: link(actor.row.cid) },
        epoch: link(epoch),
      },
    };
    const original = await signNativeIntent(intent, actor.key),
      published = await append(original);
    domainCount += amount;
    if (chosen.has(actionOrdinal)) {
      const alternate = await signNativeIntent(intent, actor.key);
      if (alternate.sig.$bytes === original.sig.$bytes) throw Error('Alternate ECDSA delivery did not differ');
      const conflict = await signNativeIntent(
        { ...intent, operation: { ...intent.operation, payload: { amount: amount === 1 ? 2 : 1 } } },
        actor.key,
      );
      probes.push({ ordinal: actionOrdinal, position: published.position, original, alternate, conflict });
    }
  }
  async function revoke(actor: Awaited<ReturnType<typeof admit>>) {
    const record = {
      $type: NATIVE_NSID.revoke,
      version: 1,
      id: actor.row.id,
      app: app.principal,
      genesis: link(genesisCid),
    };
    const cid = await contentCid(record);
    await importAccount(
      { $type: nativeRef('revokeGrant'), revoke: { id: record.id, cid: link(cid) } },
      new Map([[`${NATIVE_NSID.revoke}/${record.id}`, encodeBlock(record)]]),
    );
    actor.row.revoked = true;
  }
  if (!retiring) {
    const actors = [];
    for (let g = 0; g < grants; g++) actors.push(await admit(g + 1));
    for (let a = 0; a < actions; a++) await act(actors[a % grants]!);
  } else
    for (let g = 0; g < grants; g++) {
      const actor = await admit(g + 1),
        count = Math.floor(actions / grants) + Number(g < actions % grants);
      for (let a = 0; a < count; a++) await act(actor);
      if (g < grants - 1) await revoke(actor);
    }
  if (actionOrdinal !== actions) throw Error('Domain action count changed');
  await repository.put(nativeHeadPath(genesisCid), encodeBlock(await nativeHeadAt(anchor, history.length, previous)));
  await repository.compact();
  const selected = await repository.capture(history.length + 3);
  const through = { position: history.length, entry: previous };
  const authority = {
    format: 'atseq-checkpoint-authority',
    version: 1,
    app: app.principal,
    genesis: genesisCid,
    activeDefinition: source.root,
    frontier: through,
    control: { tip: genesisCid, appointments: genesis.control, owner: genesis.owner, recoverGovernance: true },
    roles: [],
    principals: [
      {
        principal: person.principal,
        epoch,
        epochs: [{ cid: epoch, id: epochRecord.id.$bytes, previous: null }],
        observation: floor,
      },
    ],
    grants: grantRows.sort((a, b) =>
      JSON.stringify([a.principal, a.id]) < JSON.stringify([b.principal, b.id]) ? -1 : 1,
    ),
  };
  async function table(kind: string, rows: any[], sort = false) {
    if (sort)
      rows.sort((a, b) =>
        (kind === 'sources' ? a.definition : a.cid) < (kind === 'sources' ? b.definition : b.cid) ? -1 : 1,
      );
    const pages: Uint8Array[] = [],
      refs = [];
    let page: any[] = [];
    for (const row of rows) {
      if (page.length && json([...page, row]).length > 128 * 1024) {
        pages.push(json(page));
        page = [];
      }
      page.push(row);
    }
    if (page.length) pages.push(json(page));
    for (const raw of pages)
      refs.push({ payload: await frame(raw), rows: JSON.parse(new TextDecoder().decode(raw)).length });
    return {
      table: b64(
        json({
          format: 'atseq-checkpoint-table',
          version: 1,
          app: app.principal,
          genesis: genesisCid,
          kind,
          through,
          rows: rows.length,
          pages: refs,
        }),
      ),
      pages: pages.map(b64),
    };
  }
  const manifest: any = CBOR.decode(source.blocks.get(source.root)!);
  const sourceRows = [
    {
      definition: source.root,
      manifest: await frame(source.blocks.get(source.root)!),
      files: await Promise.all(
        manifest.files.map(async (file: any) => ({
          path: file.path,
          cid: file.cid,
          bytes: await frame(source.blocks.get(file.cid)!),
        })),
      ),
    },
  ];
  const serialized = (map: Map<string, Uint8Array>): [string, string][] =>
    [...map].sort(([a], [b]) => (a < b ? -1 : 1)).map(([cid, raw]) => [cid, b64(raw)]);
  const historyTable = await table('history', history),
    outcomeTable = await table('outcomes', outcomes);
  const sourceTable = await table('sources', sourceRows, true),
    evidenceTable = await table('evidence', evidence, true);
  const authorityManifest = await frame(json(authority));
  const sum = (map: Map<string, Uint8Array>) => [...map.values()].reduce((n, raw) => n + raw.length, 0);
  return {
    version: 1,
    actions,
    pattern,
    counts: {
      totalEntries: history.length,
      actorSigners: grants,
      admittedGrants: grants,
      retiredGrants: retiring ? grants - 1 : 0,
      epochs: 1,
      retiredEpochs: 0,
      descriptors: grants + (retiring ? grants - 1 : 0),
    },
    genesis,
    genesisCid,
    appIdentity: { auditBytes: b64(json(app.rows)), selectedTipCid: app.selectedTipCid },
    appRoot: selected.root,
    appCar: b64(selected.car),
    content: serialized(content),
    sources: serialized(source.blocks),
    framed: serialized(framed),
    history: historyTable,
    outcomes: outcomeTable,
    sourceTable,
    evidence: evidenceTable,
    authority: b64(json(authority)),
    authorityManifest,
    probes,
    oracle: { state: { count: domainCount, description: 'demo' }, outcomes, authority },
    costs: {
      appCarBytes: selected.car.length,
      appRepositoryBlocks: selected.blocks.size,
      appRepositoryBlockBytes: sum(selected.blocks),
      retainedContentBlocks: content.size,
      retainedContentBlockBytes: sum(content),
      checkpointFramingBlocks: framed.size,
      checkpointFramingBlockBytes: sum(framed),
      sourceBlocks: source.blocks.size,
      sourceBytes: sum(source.blocks),
      originalEntryBytes: rawEntryBytes,
      originalNestedRequestBytes: rawRequestBytes,
      participantCarBytes: proofBytes,
      authorityJsonBytes: json(authority).length,
    },
    preparationMs: performance.now() - started,
  };
}
