/** Real signed repositories; hostile records remain behind genuine P1 authentication. */
import * as CAR from '@atcute/car';
import * as CID from '@atcute/cid';
import { AuthorityHarness, authorityRepo, grantId } from './native-authority-fixture.ts';
import { car } from './native-proof-corpus.ts';
import { nativeRef, NATIVE_NSID } from '../../src/protocol/native-schema.ts';
import {
  nativeGenesisPath,
  nativeHeadPath,
  nativeEntryPath,
  nativeHeadAt,
  type NativeEntry,
  type NativeGenesis,
} from '../../src/protocol/native-wire.ts';
import { encodeBlock, decodeBlock, contentCid, link } from '../../src/protocol/wire.ts';
export interface PreservedFixture {
  genesis: NativeGenesis;
  genesisCid: string;
  key: string;
  identity: { auditBytes: number[]; selectedTipCid: string };
  content: [string, number[]][];
  roots: Record<string, number[]>;
  foreign: { car: number[]; did: string; key: string };
  original: NativeEntry['request'];
}
export async function nativePrefixPreservedFixture(): Promise<PreservedFixture> {
  const h = await AuthorityHarness.create(),
    roots: Record<string, number[]> = {};
  const save = async (name: string, records = h.appRecords, revision = 10) => {
    roots[name] = [...(await authorityRepo(h.app.principal, h.app.key, records, revision)).car];
  };
  await save('0');
  const entries: NativeEntry[] = [];
  for (let n = 1; n <= 4; n++) {
    const request = await h.signed({
      $type: nativeRef('assignRole'),
      grant: { id: grantId(1), cid: link(h.anchor.cid) },
      epoch: link(h.anchor.cid),
      target: h.actor.principal,
      role: 'member',
      enabled: false,
      expectedAssignment: link(h.anchor.cid),
    });
    await h.append('preserved prefix entry ' + n, request, { decision: 'ineffective', reason: 'grant_unadmitted' });
    const vector = h.vectors.at(-1)!;
    entries.push(decodeBlock(new Uint8Array(vector.entry)) as unknown as NativeEntry);
    roots[String(n)] = vector.appCar;
  }
  const selected = new Map(h.appRecords);
  // Do not inspect this suffix: it has no descriptor and invalid actor bytes, above both known floors.
  const unrelated = new Map(selected);
  unrelated.set(nativeEntryPath(h.anchor.cid, 5), encodeBlock({ unavailableDescriptor: true }));
  unrelated.set(
    nativeHeadPath(h.anchor.cid),
    encodeBlock(await nativeHeadAt(h.anchor, 100_001, await contentCid({ unavailableDescriptor: true }))),
  );
  await save('unrelated-suffix', unrelated);
  for (const [name, path] of [
    ['absent-genesis', nativeGenesisPath(h.anchor.cid)],
    ['absent-head', nativeHeadPath(h.anchor.cid)],
    ['absent-interior', nativeEntryPath(h.anchor.cid, 1)],
    ['absent-boundary', nativeEntryPath(h.anchor.cid, 2)],
    ['absent-floor', nativeEntryPath(h.anchor.cid, 3)],
  ] as const) {
    const records = new Map(selected);
    records.delete(path);
    await save(name, records);
  }
  for (const [name, position] of [
    ['changed-interior', 1],
    ['changed-boundary', 2],
    ['changed-floor', 3],
  ] as const) {
    const records = new Map(selected);
    records.set(
      nativeEntryPath(h.anchor.cid, position),
      encodeBlock({ ...entries[position - 1]!, prev: link(await contentCid({ changed: position })) }),
    );
    await save(name, records);
  }
  const changedGenesis = new Map(selected);
  changedGenesis.set(
    nativeGenesisPath(h.anchor.cid),
    encodeBlock({ ...h.anchor.genesis, creation: entries[0]!.request }),
  );
  await save('changed-genesis', changedGenesis);
  const wrongHead = new Map(selected);
  wrongHead.set(
    nativeHeadPath(h.anchor.cid),
    encodeBlock({ ...(await nativeHeadAt(h.anchor, 4, await contentCid(entries[3]!))), app: h.actor.principal }),
  );
  await save('wrong-head-scope', wrongHead);
  const changedHead = new Map(selected);
  changedHead.set(
    nativeHeadPath(h.anchor.cid),
    encodeBlock(await nativeHeadAt(h.anchor, 3, await contentCid(entries[1]!))),
  );
  await save('changed-head-at-floor', changedHead);
  // A wire-valid authority suffix with real context/descriptor; only its descriptor bytes are omitted.
  const epoch = await h.epoch(1),
    grant = await h.grant(1, epoch);
  const account = await h.accountRequest({ $type: nativeRef('admitGrant'), grant }, []);
  const descriptorRecords = new Map(selected);
  descriptorRecords.set(
    nativeEntryPath(h.anchor.cid, 5),
    encodeBlock({
      $type: NATIVE_NSID.entry,
      version: 2,
      app: h.app.principal,
      genesis: link(h.anchor.cid),
      position: 5,
      prev: link(await contentCid(entries[3]!)),
      request: account,
    }),
  );
  const fifth = descriptorRecords.get(nativeEntryPath(h.anchor.cid, 5))!;
  descriptorRecords.set(
    nativeHeadPath(h.anchor.cid),
    encodeBlock(await nativeHeadAt(h.anchor, 5, CID.toString(CID.createSync(CID.CODEC_DCBOR, fifth)))),
  );
  descriptorRecords.set(
    `${NATIVE_NSID.content}/${account.observation.$link}`,
    h.content.get(account.observation.$link)!,
  );
  const descriptorRepo = await authorityRepo(h.app.principal, h.app.key, descriptorRecords, 5);
  const descriptorCar = CAR.fromUint8Array(descriptorRepo.car),
    descriptorBlocks = new Map<string, Uint8Array>();
  for (const block of descriptorCar) descriptorBlocks.set(CID.toString(block.cid), new Uint8Array(block.bytes));
  descriptorBlocks.delete(account.observation.$link);
  roots['unrelated-descriptor'] = [...(await car(descriptorRepo.root, descriptorBlocks))];
  const parsed = CAR.fromUint8Array(new Uint8Array(roots['4']!)),
    blocks = new Map<string, Uint8Array>();
  for (const block of parsed) blocks.set(CID.toString(block.cid), new Uint8Array(block.bytes));
  const root = parsed.roots[0]!.$link;
  for (const [name, cid] of [
    ['missing-genesis', h.anchor.cid],
    ['missing-head', await contentCid(await nativeHeadAt(h.anchor, 4, await contentCid(entries[3]!)))],
    ['missing-interior', await contentCid(entries[0]!)],
    ['missing-boundary', await contentCid(entries[1]!)],
    ['missing-floor', await contentCid(entries[2]!)],
  ] as const) {
    const partial = new Map(blocks);
    partial.delete(cid);
    roots[name] = [...(await car(root, partial))];
  }
  const foreign = await authorityRepo(h.actor.principal, h.actor.key, selected, 4);
  return {
    genesis: h.anchor.genesis,
    genesisCid: h.anchor.cid,
    key: h.app.signing,
    identity: {
      auditBytes: [...new TextEncoder().encode(JSON.stringify(h.app.rows))],
      selectedTipCid: h.app.selectedTipCid,
    },
    content: [...h.content].map(([cid, raw]) => [cid, [...raw]]),
    roots,
    foreign: { car: [...foreign.car], did: h.actor.principal, key: h.actor.signing },
    original: entries[0]!.request,
  };
}
