import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';
import { NodeStore, NodeWrangler, NodeWalker, MemoryBlockStore, getKeyHeight } from '@atcute/mst';
import { P256PrivateKeyExportable, type PrivateKeyExportable } from '@atcute/crypto';
import { AuthorityHarness, authorityRepo, grantId } from './native-authority-fixture.ts';
import { nativeRef } from '../../src/protocol/native-schema.ts';
import { nativeGenesisPath, nativeHeadPath, nativeEntryPath } from '../../src/protocol/native-wire.ts';
import { link } from '../../src/protocol/wire.ts';
import { nativeFixture, car } from './native-proof-corpus.ts';

export const extractionPath = (n: number) => `ai.generalbusiness.atseq.probe/${String(n).padStart(8, '0')}`;
export interface ExtractionFixture {
  options: { expectedDid: string; trustedSigningKeyDid: string; expectedRoot: string };
  data: string;
  blocks: [string, number[]][];
}
export function extractionBlocks(fixture: ExtractionFixture) {
  return new Map(fixture.blocks.map(([cid, bytes]) => [cid, new Uint8Array(bytes)]));
}
export async function extractionOptions(fixture: ExtractionFixture) {
  return { ...fixture.options, carBytes: await car(fixture.options.expectedRoot, extractionBlocks(fixture)) };
}
async function signed(
  key: PrivateKeyExportable,
  data: string,
  blocks: Map<string, Uint8Array>,
): Promise<ExtractionFixture> {
  const unsigned = {
    did: 'did:plc:aaaaaaaaaaaaaaaaaaaaaaaa',
    version: 3,
    rev: '2222222222222',
    data: { $link: data },
    prev: null,
  };
  const raw = CBOR.encode({ ...unsigned, sig: CBOR.toBytes(await key.sign(CBOR.encode(unsigned))) });
  const root = CID.toString(CID.createSync(CID.CODEC_DCBOR, raw));
  blocks.set(root, raw);
  return {
    options: { expectedDid: unsigned.did, trustedSigningKeyDid: await key.exportPublicKey('did'), expectedRoot: root },
    data,
    blocks: [...blocks].map(([cid, bytes]) => [cid, [...bytes]]),
  };
}
export async function extractionWorkload(count: number) {
  const key = await P256PrivateKeyExportable.createKeypair(),
    store = new MemoryBlockStore(),
    nodes = new NodeStore(store),
    writer = new NodeWrangler(nodes);
  let data: string | null = null;
  const records = new Map<string, Uint8Array>();
  for (let n = 1; n <= count; n++) {
    const raw = CBOR.encode({ $type: 'ai.generalbusiness.atseq.probe', n }),
      cid = CID.toCidLink(CID.createSync(CID.CODEC_DCBOR, raw));
    await store.put(cid.$link, raw);
    records.set(cid.$link, raw);
    data = await writer.putRecord(data, extractionPath(n), cid);
  }
  if (!data) throw Error('Missing workload tree');
  const blocks = new Map(records),
    walker = await NodeWalker.create(nodes, data);
  for await (const node of walker.nodes()) {
    const cid = (await node.cid()).$link;
    blocks.set(cid, store.blocks.get(cid)!);
  }
  return signed(key, data, blocks);
}
export async function createExtractionFixtures() {
  const fixtures: Record<string, ExtractionFixture> = {};
  let key: PrivateKeyExportable | undefined,
    recordCid = '',
    recordRaw = new Uint8Array();
  for (const type of ['p256', 'secp256k1'] as const) {
    const f = await nativeFixture(type);
    fixtures[type] = {
      options: {
        expectedDid: f.options.expectedDid,
        trustedSigningKeyDid: f.options.trustedSigningKeyDid,
        expectedRoot: f.root,
      },
      data: f.data,
      blocks: [...f.blocks].map(([cid, bytes]) => [cid, [...bytes]]),
    };
    if (type === 'p256') {
      key = f.key;
      const found = [...f.blocks].find(([, raw]) => {
        const value = CBOR.decode(raw);
        return value && typeof value === 'object' && 'n' in value && value.n === 1;
      });
      if (!found) throw Error('Missing hostile record');
      [recordCid, recordRaw] = found;
    }
  }
  if (!key) throw Error('Missing fixture key');
  const heights = new Map<number, string[]>();
  for (let n = 1; n <= 500; n++) {
    const path = extractionPath(n),
      h = await getKeyHeight(path),
      paths = heights.get(h) ?? [];
    paths.push(path);
    heights.set(h, paths);
  }
  const entry = (path: string) => ({
    p: 0,
    k: CBOR.toBytes(new TextEncoder().encode(path)),
    v: { $link: recordCid },
    t: null,
  });
  const node = (path: string, left: string | null = null) => {
    const raw = CBOR.encode({ l: left ? { $link: left } : null, e: [entry(path)] });
    return { raw, cid: CID.toString(CID.createSync(CID.CODEC_DCBOR, raw)) };
  };
  const zero = heights.get(0)!,
    one = heights.get(1)!,
    k2 = heights.get(2)!.find((k) => one.some((p) => p < k && zero.some((z) => z < p)) && one.some((p) => p > k))!;
  const insideKey = one.find((k) => k < k2 && zero.some((z) => z < k))!,
    k0 = zero.find((k) => k < insideKey)!,
    k1 = one.find((k) => k > k2)!;
  const leaf = node(k0),
    outside = node(k1, leaf.cid),
    parent = node(k2, outside.cid);
  fixtures.intervalMissing = await signed(
    key,
    parent.cid,
    new Map([
      [recordCid, recordRaw],
      [outside.cid, outside.raw],
      [parent.cid, parent.raw],
    ]),
  );
  const inside = node(insideKey, leaf.cid),
    validParent = node(k2, inside.cid);
  fixtures.validMissing = await signed(
    key,
    validParent.cid,
    new Map([
      [recordCid, recordRaw],
      [inside.cid, inside.raw],
      [validParent.cid, validParent.raw],
    ]),
  );
  const emptyRaw = CBOR.encode({ l: null, e: [] }),
    emptyCid = CID.toString(CID.createSync(CID.CODEC_DCBOR, emptyRaw));
  fixtures.empty = await signed(key, emptyCid, new Map([[emptyCid, emptyRaw]]));
  const h = await AuthorityHarness.create();
  const request = await h.signed({
    $type: nativeRef('assignRole'),
    grant: { id: grantId(1), cid: link(h.anchor.cid) },
    epoch: link(h.anchor.cid),
    target: h.actor.principal,
    role: 'member',
    enabled: false,
    expectedAssignment: link(h.anchor.cid),
  });
  await h.append('extraction receipt path fixture', request, { decision: 'ineffective', reason: 'grant_unadmitted' });
  const app = await authorityRepo(h.app.principal, h.app.key, h.appRecords, 1);
  const reader = await import('@atcute/car');
  const appBlocks = [...reader.fromUint8Array(app.car)].map(
    (block) => [CID.toString(block.cid), [...block.bytes]] as [string, number[]],
  );
  const appCommit = CBOR.decode(new Uint8Array(appBlocks.find(([cid]) => cid === app.root)![1]));
  fixtures.application = {
    options: {
      expectedDid: h.app.principal,
      trustedSigningKeyDid: await h.app.key.exportPublicKey('did'),
      expectedRoot: app.root,
    },
    data: appCommit.data.$link,
    blocks: appBlocks,
  };
  return {
    fixtures,
    hostilePath: k0,
    hostileRootPath: k2,
    receiptPaths: [nativeGenesisPath(h.anchor.cid), nativeHeadPath(h.anchor.cid), nativeEntryPath(h.anchor.cid, 1)],
  };
}
