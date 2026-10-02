/** Genuine ordered workload; signed repository proofs exist only at cutpoints. */
import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';
import { NodeStore, NodeWalker, NodeWrangler, MemoryBlockStore } from '@atcute/mst';
import type { PrivateKeyExportable } from '@atcute/crypto';
import { AuthorityHarness, authorityRevision, grantId } from './native-authority-fixture.ts';
import { car } from './native-proof-corpus.ts';
import { discoveryFixtureSource, type DiscoveryFixtureGrant } from './native-discovery-fixture.ts';
import { NATIVE_NSID, nativeRef } from '../../src/protocol/native-schema.ts';
import {
  NativeAnchor,
  nativeGenesisPath,
  nativeEntryPath,
  nativeHeadPath,
  signNativeIntent,
  type NativeEntry,
  type NativeAccountOperation,
  type NativeRequest,
} from '../../src/protocol/native-wire.ts';
import { bytes, contentCid, encodeBlock, link } from '../../src/protocol/wire.ts';
import { authenticateRepo } from '../../src/protocol/native-proof.ts';
import {
  openNativePrefix,
  stageNativePrefix,
  acceptNativePrefix,
  type NativePrefix,
} from '../../src/application/native-prefix.ts';

export interface NativeDiscoveryWorkload {
  profile: 'few' | 'many';
  grantCount: number;
  genesis: NativeAnchor['genesis'];
  genesisCid: string;
  appKey: string;
  appIdentity: { auditBytes: number[]; selectedTipCid: string };
  sourceBlocks: [string, number[]][];
  retainedContent: [string, number[]][];
  entries: NativeEntry[];
  subject: { principal: string; actorKey: string };
  selectedGrant: DiscoveryFixtureGrant;
  action: { ref: string; execution: string; role: string };
  initialState: { count: number; version: number; owner: string; description: string };
  checkpoints: {
    actionCount: number;
    totalEntries: number;
    appCar: number[];
    carBytes: number;
    emittedBlocks: number;
    transientBlocks: number;
    proof: 'authenticated-tree-and-prefix';
    coldDefaultRefusal: string | null;
    expectedState: { count: number; version: number; owner: string; description: string };
    expectedEffective: number;
  }[];
}

/** Pinned NodeWalker/NodeStore traversal retains the actual selected tree and
 * its record values. Iterative writer scratch nodes are not repository proof. */
async function workloadRepository(
  did: string,
  key: PrivateKeyExportable,
  records: Map<string, Uint8Array>,
  revision: number,
) {
  const store = new MemoryBlockStore(),
    writer = new NodeWrangler(new NodeStore(store));
  let data: string | null = null;
  for (const [path, raw] of [...records].sort(([a], [b]) => (a < b ? -1 : 1))) {
    const recordCid = CID.toCidLink(CID.createSync(CID.CODEC_DCBOR, raw));
    await store.put(recordCid.$link, new Uint8Array(raw));
    data = await writer.putRecord(data, path, recordCid);
  }
  if (!data) throw new Error('Workload repository lacks records');
  const retained = new Set<string>();
  class RecordingNodes extends NodeStore {
    override async get(cid: string | null) {
      const node = await super.get(cid);
      if (cid !== null) retained.add(cid);
      return node;
    }
  }
  const walker = await NodeWalker.create(new RecordingNodes(store), data);
  for await (const [, value] of walker.entries()) retained.add(value.$link);
  const unsigned = { did, version: 3, rev: authorityRevision(revision), data: link(data), prev: null };
  const raw = CBOR.encode({ ...unsigned, sig: CBOR.toBytes(await key.sign(CBOR.encode(unsigned))) });
  const root = CID.toString(CID.createSync(CID.CODEC_DCBOR, raw));
  const blocks = new Map<string, Uint8Array>([[root, new Uint8Array(raw)]]);
  for (const cid of retained) {
    const bytes = store.blocks.get(cid);
    if (!bytes) throw new Error('Pinned workload traversal requested missing block');
    blocks.set(cid, new Uint8Array(bytes));
  }
  return {
    car: await car(root, blocks),
    emittedBlocks: blocks.size,
    transientBlocks: store.blocks.size - retained.size,
  };
}

/** No interpretation or discovery is used to manufacture expected workload state.
 * Each admission is an authentic account observation; each action is signed by
 * its admitted device. Runners must replay every entry from the genuine anchor.
 * Replaying earlier cutpoints bounds the final 10k-action prefix delta at 9000. */
export async function nativeDiscoveryWorkloadFixture(
  profile: 'few' | 'many',
  cutpoints: readonly number[] = [100, 1000, 10_000],
): Promise<NativeDiscoveryWorkload> {
  if (
    !['few', 'many'].includes(profile) ||
    !cutpoints.length ||
    cutpoints.some((n, i) => !Number.isSafeInteger(n) || n < 1 || n > 10_000 || (i > 0 && cutpoints[i - 1]! >= n))
  )
    throw new Error('Invalid workload profile/cutpoints');
  const h = await AuthorityHarness.create(),
    source = await discoveryFixtureSource(h.actor.principal);
  const genesis = { ...h.anchor.genesis, definition: link(source.root) };
  const genesisCid = await contentCid(genesis);
  h.anchor = await NativeAnchor.from(genesis, { app: genesis.app, genesis: genesisCid });
  h.appRecords.clear();
  h.appRecords.set(nativeGenesisPath(genesisCid), encodeBlock(genesis));
  const entries: NativeEntry[] = [];
  let previousEntry = genesisCid;
  async function append(request: NativeRequest) {
    const entry: NativeEntry = {
      $type: NATIVE_NSID.entry,
      version: 2,
      app: genesis.app,
      genesis: link(genesisCid),
      position: entries.length + 1,
      prev: link(previousEntry),
      request,
    };
    previousEntry = await contentCid(entry);
    h.appRecords.set(nativeEntryPath(genesisCid, entry.position), encodeBlock(entry));
    entries.push(entry);
  }
  const grantCount = profile === 'few' ? 1 : 32;
  const ids = Array.from({ length: grantCount }, (_, n) => grantId(n + 1)).sort();
  if (new Set(ids).size !== grantCount) throw new Error('Workload IDs must be distinct');
  const eligibleId = ids.at(-1)!;
  const epoch = await h.epoch(1),
    actorKey = await h.device.exportPublicKey('did');
  let previousObservation: string | null = null;
  let selectedGrant: DiscoveryFixtureGrant | undefined;
  for (const id of ids) {
    const cid = await h.account(NATIVE_NSID.grant, id, {
      $type: NATIVE_NSID.grant,
      version: 1,
      id,
      app: genesis.app,
      genesis: link(genesisCid),
      epoch: link(epoch),
      actorKey,
      actions:
        id === eligibleId ? [{ action: source.actions.act.ref, execution: link(source.actions.act.execution) }] : [],
      assignRoles: ['member'],
    });
    if (id === eligibleId) selectedGrant = { principal: h.actor.principal, id, cid, epoch, actorKey };
    const request: NativeAccountOperation = {
      $type: nativeRef('accountOperation'),
      app: genesis.app,
      genesis: link(genesisCid),
      position: entries.length + 1,
      prev: link(previousEntry),
      principal: h.actor.principal,
      expectedEpoch: previousObservation === null ? null : link(epoch),
      expectedObservation: previousObservation === null ? null : link(previousObservation),
      operation: { $type: nativeRef('admitGrant'), grant: { id, cid: link(cid) } },
      observation: link(genesisCid),
    };
    const observation = await h.observe(request, [
      `${NATIVE_NSID.epochCurrent}/self`,
      `${NATIVE_NSID.epoch}/${epoch}`,
      `${NATIVE_NSID.grant}/${id}`,
    ]);
    request.observation = link(observation);
    await append(request);
    previousObservation = observation;
  }
  if (!selectedGrant) throw new Error('Eligible workload grant missing');
  const checkpoints: NativeDiscoveryWorkload['checkpoints'] = [];
  let prefix: NativePrefix | null = null;
  const appEvidence = {
    assuranceClass: 'plc-audit-v1' as const,
    auditBytes: new TextEncoder().encode(JSON.stringify(h.app.rows)),
    selectedTipCid: h.app.selectedTipCid,
  };
  for (let n = 1; n <= cutpoints.at(-1)!; n++) {
    const nonce = new Uint8Array(16);
    new DataView(nonce.buffer).setUint32(12, n, false);
    await append(
      await signNativeIntent(
        {
          $type: nativeRef('intent'),
          version: 2,
          app: genesis.app,
          genesis: link(genesisCid),
          principal: h.actor.principal,
          actorKey,
          nonce: bytes(nonce),
          operation: {
            $type: nativeRef('act'),
            action: source.actions.act.ref,
            execution: link(source.actions.act.execution),
            payload: { amount: 1, version: n },
            grant: { id: selectedGrant.id, cid: link(selectedGrant.cid) },
            epoch: link(epoch),
          },
        },
        h.device,
      ),
    );
    if (!cutpoints.includes(n)) continue;
    h.appRecords.set(
      nativeHeadPath(genesisCid),
      encodeBlock({
        $type: NATIVE_NSID.head,
        version: 2,
        app: genesis.app,
        genesis: link(genesisCid),
        position: entries.length,
        entry: link(previousEntry),
      }),
    );
    const publication = await workloadRepository(h.app.principal, h.app.key, h.appRecords, entries.length);
    const appRepo = await authenticateRepo({
      carBytes: publication.car,
      expectedDid: h.app.principal,
      trustedSigningKeyDid: h.app.signing,
    });
    const tree = await appRepo.validateTree();
    if (tree.kind !== 'complete') throw new Error('Workload emitted incomplete selected repository tree');
    const prefixPublication = {
      anchor: h.anchor,
      appRepo,
      reader: h.reader(),
      appIdentity: { before: appEvidence, after: appEvidence },
    };
    let coldDefaultRefusal: string | null = null;
    if (entries.length > 10_000) {
      try {
        await openNativePrefix(prefixPublication);
      } catch (error) {
        coldDefaultRefusal = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'unexpected';
      }
      if (coldDefaultRefusal !== 'content_unavailable') throw new Error('Expected existing cold prefix delta refusal');
    }
    prefix = prefix
      ? acceptNativePrefix(prefix, await stageNativePrefix(prefix, prefixPublication))
      : await openNativePrefix(prefixPublication);
    checkpoints.push({
      actionCount: n,
      totalEntries: entries.length,
      appCar: [...publication.car],
      carBytes: publication.car.length,
      emittedBlocks: publication.emittedBlocks,
      transientBlocks: publication.transientBlocks,
      proof: 'authenticated-tree-and-prefix',
      coldDefaultRefusal,
      expectedState: { ...source.initial, count: n, version: n + 1 },
      expectedEffective: entries.length,
    });
  }
  return {
    profile,
    grantCount,
    genesis,
    genesisCid,
    appKey: h.app.signing,
    appIdentity: {
      auditBytes: [...new TextEncoder().encode(JSON.stringify(h.app.rows))],
      selectedTipCid: h.app.selectedTipCid,
    },
    sourceBlocks: [...source.blocks].map(([cid, raw]) => [cid, [...raw]]),
    retainedContent: [...h.content].map(([cid, raw]) => [cid, [...raw]]),
    entries,
    subject: { principal: h.actor.principal, actorKey },
    selectedGrant,
    action: source.actions.act,
    initialState: source.initial,
    checkpoints,
  };
}
