/** Successor fixtures sign real genesis/head records; no historical archive is rewritten. */
import * as CAR from '@atcute/car';
import * as CID from '@atcute/cid';
import { AuthorityHarness, authorityRepo, grantId, epochId } from './native-authority-fixture.ts';
import {
  NativeAnchor,
  nativeHeadAt,
  nativeGenesisPath,
  nativeHeadPath,
  nativeEntryPath,
  type NativeEntry,
  type NativeAccountOperation,
  type NativeContent,
  type NativeObservation,
} from '../../src/protocol/native-wire.ts';
import { openNativeAuthority } from '../../src/application/native-authority.ts';
import { nativeRef, NATIVE_NSID } from '../../src/protocol/native-schema.ts';
import { encodeBlock, decodeBlock, contentCid, link, bytes } from '../../src/protocol/wire.ts';
import { nativeApplicationFixture, type ApplicationFixture } from './native-application-fixture.ts';
export interface PrefixFixture {
  genesis: NativeAnchor['genesis'];
  genesisCid: string;
  appKey: string;
  appIdentity: { auditBytes: number[]; selectedTipCid: string };
  content: [string, number[]][];
  roots: [number, number[]][];
  entries: NativeEntry[];
  alternate: unknown;
  tupleConflict: unknown;
  duplicateCar: number[];
  higherForkCar: number[];
  recoveredRoots: number[][];
  badNested: {
    genesis: NativeAnchor['genesis'];
    genesisCid: string;
    appKey: string;
    appIdentity: PrefixFixture['appIdentity'];
    content: PrefixFixture['content'];
    car: number[];
    entries: NativeEntry[];
  };
  application: ApplicationFixture;
}
export async function nativePrefixFixture(): Promise<PrefixFixture> {
  const h = await AuthorityHarness.create();
  const roots: [number, number[]][] = [
    [0, [...(await authorityRepo(h.app.principal, h.app.key, h.appRecords, 0)).car]],
  ];
  let alternate: unknown, tupleConflict: unknown;
  const entries: NativeEntry[] = [];
  const recoveredRoots: number[][] = [];
  for (let n = 1; n <= 210; n++) {
    const request = await h.signed({
      $type: nativeRef('assignRole'),
      grant: { id: grantId(1), cid: link(h.anchor.cid) },
      epoch: link(h.anchor.cid),
      target: h.actor.principal,
      role: 'member',
      enabled: false,
      expectedAssignment: link(h.anchor.cid),
    });
    await h.append('prefix delta entry ' + n, request, { decision: 'ineffective', reason: 'grant_unadmitted' });
    const vector = h.vectors.at(-1)!;
    entries.push(decodeBlock(new Uint8Array(vector.entry)) as unknown as NativeEntry);
    if ([1, 2, 3, 4, 100, 101, 110, 200, 210].includes(n)) roots.push([n, vector.appCar]);
    if (n === 100) {
      recoveredRoots.push([...(await authorityRepo(h.app.principal, h.app.key, h.appRecords, 1)).car]);
      const extra = new Map(h.appRecords),
        body = { $type: NATIVE_NSID.content, version: 1, body: { note: 'Unrelated same-revision account record' } };
      extra.set(`${NATIVE_NSID.content}/${await contentCid(body)}`, encodeBlock(body));
      recoveredRoots.push([...(await authorityRepo(h.app.principal, h.app.key, extra, 100)).car]);
    }
    if (n === 1) {
      const { signNativeIntent } = await import('../../src/protocol/native-wire.ts');
      alternate = await signNativeIntent(request.intent, h.device);
      const changed: any = structuredClone(request.intent);
      changed.operation.enabled = true;
      tupleConflict = await signNativeIntent(changed, h.device);
    }
  }
  const forkRecords = new Map(h.appRecords);
  const { signNativeIntent } = await import('../../src/protocol/native-wire.ts');
  const forkSecond = {
    ...entries[1]!,
    request: await signNativeIntent({ ...(entries[1]!.request as any).intent, nonce: epochId(221) }, h.device),
  };
  const forkThird = { ...entries[2]!, prev: link(await contentCid(forkSecond)) },
    forkFourth = { ...entries[3]!, prev: link(await contentCid(forkThird)) };
  for (const entry of [forkSecond, forkThird, forkFourth])
    forkRecords.set(nativeEntryPath(h.anchor.cid, entry.position), encodeBlock(entry));
  forkRecords.set(
    nativeHeadPath(h.anchor.cid),
    encodeBlock(await nativeHeadAt(h.anchor, 4, await contentCid(forkFourth))),
  );
  const higherForkCar = [...(await authorityRepo(h.app.principal, h.app.key, forkRecords, 4)).car];
  const repeated: NativeEntry = { ...entries[0]!, position: 211, prev: link(await contentCid(entries.at(-1)!)) };
  h.appRecords.set(nativeEntryPath(h.anchor.cid, repeated.position), encodeBlock(repeated));
  h.appRecords.set(
    nativeHeadPath(h.anchor.cid),
    encodeBlock(await nativeHeadAt(h.anchor, repeated.position, await contentCid(repeated))),
  );
  const duplicateCar = [...(await authorityRepo(h.app.principal, h.app.key, h.appRecords, 211)).car];

  const application = await nativeApplicationFixture();
  // Genuine app publication containing a valid descriptor/chain and an invalid nested participant signature.
  const bad = await AuthorityHarness.create();
  const supported = {
    ...bad.anchor.genesis,
    semantics: application.genesis.semantics,
    definition: application.genesis.definition,
  };
  bad.anchor = await NativeAnchor.from(supported, { app: supported.app, genesis: await contentCid(supported) });
  bad.state = await openNativeAuthority(bad.anchor);
  bad.appRecords.clear();
  for (const [cid, raw] of bad.content) bad.appRecords.set(`${NATIVE_NSID.content}/${cid}`, raw);
  bad.appRecords.set(nativeGenesisPath(bad.anchor.cid), encodeBlock(bad.anchor.genesis));
  bad.appRecords.set(nativeHeadPath(bad.anchor.cid), encodeBlock(await nativeHeadAt(bad.anchor)));
  const epoch = await bad.epoch(1),
    grant = await bad.grant(1, epoch);
  const request = await bad.accountRequest({ $type: nativeRef('admitGrant'), grant }, [
    `${NATIVE_NSID.epochCurrent}/self`,
    `${NATIVE_NSID.epoch}/${epoch}`,
    `${NATIVE_NSID.grant}/${grant.id}`,
  ]);
  const oldDescriptor = decodeBlock(
    bad.content.get(request.observation.$link)!,
  ) as unknown as NativeContent<NativeObservation>;
  const proof = await authorityRepo(bad.actor.principal, bad.actor.key, bad.accountRecords, 1);
  const parsed = CAR.fromUint8Array(proof.car),
    blocks = new Map<string, Uint8Array>();
  for (const block of parsed) blocks.set(CID.toString(block.cid), new Uint8Array(block.bytes));
  const commit = decodeBlock(blocks.get(proof.root)!) as Record<string, unknown>;
  commit.sig = bytes(new Uint8Array(64));
  const corrupted = encodeBlock(commit),
    badRoot = await contentCid(commit);
  blocks.delete(proof.root);
  blocks.set(badRoot, corrupted);
  const { car } = await import('./native-proof-corpus.ts');
  const manifest = await bad.retained(await car(badRoot, blocks));
  const descriptor = { ...oldDescriptor.body, repositoryRoot: link(badRoot), proofs: [link(manifest)] };
  request.observation = link(await bad.stash(descriptor));
  const first: NativeEntry = {
    $type: NATIVE_NSID.entry,
    version: 2,
    app: bad.anchor.genesis.app,
    genesis: link(bad.anchor.cid),
    position: 1,
    prev: link(bad.anchor.cid),
    request,
  };
  const second: NativeEntry = {
    ...first,
    position: 2,
    prev: link(await contentCid(first)),
    request: await bad.signed({
      $type: nativeRef('assignRole'),
      grant,
      epoch: link(epoch),
      target: bad.actor.principal,
      role: 'member',
      enabled: false,
      expectedAssignment: link(bad.anchor.cid),
    }),
  };
  for (const entry of [first, second])
    bad.appRecords.set(nativeEntryPath(bad.anchor.cid, entry.position), encodeBlock(entry));
  bad.appRecords.set(
    nativeHeadPath(bad.anchor.cid),
    encodeBlock(await nativeHeadAt(bad.anchor, 2, await contentCid(second))),
  );
  return {
    genesis: h.anchor.genesis,
    genesisCid: h.anchor.cid,
    appKey: h.app.signing,
    appIdentity: {
      auditBytes: [...new TextEncoder().encode(JSON.stringify(h.app.rows))],
      selectedTipCid: h.app.selectedTipCid,
    },
    content: [...h.content].map(([cid, raw]) => [cid, [...raw]]),
    roots,
    entries,
    alternate,
    tupleConflict,
    duplicateCar,
    higherForkCar,
    recoveredRoots,
    badNested: {
      genesis: bad.anchor.genesis,
      genesisCid: bad.anchor.cid,
      appKey: bad.app.signing,
      appIdentity: {
        auditBytes: [...new TextEncoder().encode(JSON.stringify(bad.app.rows))],
        selectedTipCid: bad.app.selectedTipCid,
      },
      content: [...bad.content].map(([cid, raw]) => [cid, [...raw]]),
      car: [...(await authorityRepo(bad.app.principal, bad.app.key, bad.appRecords, 2)).car],
      entries: [first, second],
    },
    application,
  };
}
