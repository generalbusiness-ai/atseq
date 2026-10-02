/** Shared signed proof and retained-observation replay. No host or network import. */
import * as CAR from '@atcute/car';
import * as CID from '@atcute/cid';
import { AtseqError } from '../../src/core/errors.ts';
import { NativeObserverCar } from '../../src/protocol/native-observer-car.ts';
import { authenticateRepo } from '../../src/protocol/native-proof.ts';
import { deriveIdentityBinding, sameIdentityObservation } from '../../src/protocol/identity-binding.ts';
import {
  NativeAnchor,
  nativeGenesisPath,
  nativeEntryPath,
  readNativeRecord,
  reconstructNativeBytes,
  type ByteManifest,
  type NativeContent,
  type NativeMethodEvidence,
  type NativeEntry,
} from '../../src/protocol/native-wire.ts';
import { NATIVE_NSID, nativeRef } from '../../src/protocol/native-schema.ts';
import { decodeBlock } from '../../src/protocol/wire.ts';
import { car, nativeFixture } from './native-proof-corpus.ts';
import { replayAuthorityFixtures } from './native-authority-corpus.ts';
import type { AuthorityPublicFixture } from './native-authority-fixture.ts';
function check(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}
async function refuses(body: () => unknown | Promise<unknown>, code: string) {
  let caught: unknown;
  try {
    await body();
  } catch (error) {
    caught = error;
  }
  check(caught instanceof AtseqError && caught.code === code, 'Expected ' + code + ', got ' + String(caught));
}
export async function nativeObserverCarCorpus() {
  const cases: string[] = [];
  for (const curve of ['p256', 'secp256k1'] as const) {
    const fixture = await nativeFixture(curve),
      all = new Map(
        [...CAR.fromUint8Array(fixture.options.carBytes)].map((block) => [
          CID.toString(block.cid),
          new Uint8Array(block.bytes),
        ]),
      );
    const root = fixture.options.expectedRoot ?? CAR.fromUint8Array(fixture.options.carBytes).roots[0]!.$link;
    const initial = await car(root, new Map([[root, all.get(root)!]])),
      wantedAll = [...all.keys()].filter((cid) => cid !== root),
      wanted = wantedAll.slice(0, 60);
    check(wanted.length > 0 && wanted.length <= 60, 'Expected bounded non-commit request');
    for (const [name, roots] of [
      ['empty', []],
      ['same', [root]],
      ['other', [wanted[0]!]],
      ['multiple', [root, wanted[0]!]],
    ] as [string, string[]][]) {
      const collector = new NativeObserverCar(initial);
      for (let offset = 0; offset < wantedAll.length; offset += 64) {
        const requested = wantedAll.slice(offset, offset + 64);
        const response = await car(root, new Map(requested.map((cid) => [cid, all.get(cid)!])), roots);
        collector.addExact(response, requested);
        response.fill(0); // Private copied input.
      }
      const repo = await collector.authenticate(fixture.options.expectedDid, fixture.options.trustedSigningKeyDid);
      check(
        repo.root === root && (await repo.lookup('ai.generalbusiness.atseq.probe/00000001')).kind === 'found',
        'Header metadata selected authority or lost membership',
      );
      const owned = await collector.bytes();
      owned.fill(0);
      check(
        (await collector.authenticate(fixture.options.expectedDid, fixture.options.trustedSigningKeyDid)).root === root,
        'Output mutation changed private proof',
      );
      cases.push(curve + '/header ' + name + '/same signed root and private bytes');
    }
    const response = await car(root, new Map(wanted.map((cid) => [cid, all.get(cid)!])), []);
    const extra = await car(root, new Map([...wanted, root].map((cid) => [cid, all.get(cid)!])), [root]);
    await refuses(() => new NativeObserverCar(initial).addExact(extra, wanted), 'input');
    cases.push(curve + '/unrequested body root rejected');
    const omitted = await car(root, new Map(), wanted);
    await refuses(() => new NativeObserverCar(initial).addExact(omitted, wanted), 'content_unavailable');
    cases.push(curve + '/header does not supply omitted body');
    const corrupt = new Uint8Array(response);
    corrupt[corrupt.length - 1] = corrupt[corrupt.length - 1]! ^ 1;
    await refuses(() => new NativeObserverCar(initial).addExact(corrupt, wanted), 'input');
    cases.push(curve + '/body hash verified');
    const duplicates: CAR.CarBlock[] = [];
    const one = wanted[0]!;
    for (let n = 0; n < 65; n++) duplicates.push({ cid: CID.fromString(one).bytes, data: all.get(one)! });
    async function duplicateCar(count: number) {
      const chunks: Uint8Array[] = [];
      for await (const chunk of CAR.writeCarStream([], duplicates.slice(0, count))) chunks.push(chunk);
      const raw = new Uint8Array(chunks.reduce((n, part) => n + part.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        raw.set(chunk, offset);
        offset += chunk.length;
      }
      return raw;
    }
    new NativeObserverCar(initial).addExact(await duplicateCar(64), [one]);
    cases.push(curve + '/64 repeated entries hash checked and deduplicated');
    const tooMany = await duplicateCar(65);
    await refuses(() => new NativeObserverCar(initial).addExact(tooMany, [one]), 'native_proof_limit');
    cases.push(curve + '/65 repeated entries exceed response cap');
    await refuses(() => new NativeObserverCar(new Uint8Array([0])), 'input');
    cases.push(curve + '/invalid header refused');
  }
  return cases;
}
export interface ObserverAppFixture {
  genesis: unknown;
  genesisCid: string;
  entry: number[];
  data: {
    principal: string;
    root: string;
    rev: string;
    descriptor: string;
    proofs: string[];
    assuranceClass: string;
    blocks: [string, number[]][];
  };
}
export async function replayObserverFixtures(fixtures: AuthorityPublicFixture[], apps: ObserverAppFixture[]) {
  const cases = await replayAuthorityFixtures(fixtures);
  for (const fixture of apps) {
    const content = new Map(fixture.data.blocks.map(([cid, raw]) => [cid, new Uint8Array(raw)]));
    const reader = {
      get: async (cid: string) => {
        const raw = content.get(cid);
        if (!raw) throw new AtseqError('content_unavailable', 'Shared observer content missing');
        return new Uint8Array(raw);
      },
    };
    const anchor = await NativeAnchor.from(fixture.genesis, {
      app: fixture.data.principal,
      genesis: fixture.genesisCid,
    });
    const descriptor = await readNativeRecord<NativeContent<any>>(
      NATIVE_NSID.content,
      fixture.data.descriptor,
      await reader.get(fixture.data.descriptor),
    );
    check(
      descriptor.body.$type === nativeRef('appBinding') &&
        descriptor.body.policy.$link === anchor.genesis.observationPolicy.$link,
      'App binding policy differs from external genesis pin',
    );
    async function retained(cid: string, maximum: number) {
      const record = await readNativeRecord<NativeContent<ByteManifest>>(
        NATIVE_NSID.content,
        cid,
        await reader.get(cid),
      );
      return reconstructNativeBytes(record, reader, maximum);
    }
    async function method(value: NativeMethodEvidence) {
      return deriveIdentityBinding(
        fixture.data.principal,
        value.$type === nativeRef('plcAudit')
          ? {
              assuranceClass: 'plc-audit-v1',
              auditBytes: await retained(value.bytes.$link, 1024 * 1024),
              selectedTipCid: value.selectedTip.$link,
            }
          : { assuranceClass: 'web-observation-v1', documentBytes: await retained(value.bytes.$link, 32 * 1024) },
      );
    }
    const before = await method(descriptor.body.before),
      after = await method(descriptor.body.after);
    check(
      sameIdentityObservation(before, after) && before.assuranceClass === fixture.data.assuranceClass,
      'Shared app retained methods differ',
    );
    const repo = await authenticateRepo({
      carBytes: await retained(fixture.data.proofs[0]!, 16 * 1024 * 1024),
      expectedDid: fixture.data.principal,
      trustedSigningKeyDid: before.signingKeyDid,
      expectedRoot: fixture.data.root,
    });
    check(
      repo.root === descriptor.body.repositoryRoot.$link && repo.rev === fixture.data.rev,
      'Shared app selected proof differs',
    );
    check(
      (await repo.lookup(nativeGenesisPath(anchor.cid), anchor.cid)).kind === 'found',
      'Shared app genesis missing',
    );
    if (fixture.entry.length) {
      const entry = decodeBlock(new Uint8Array(fixture.entry)) as unknown as NativeEntry;
      const entryCid = CID.toString(CID.createSync(CID.CODEC_DCBOR, new Uint8Array(fixture.entry)));
      check(
        (await repo.lookup(nativeEntryPath(anchor.cid, entry.position), entryCid)).kind === 'found',
        'Shared app entry missing',
      );
    }
    cases.push('app publication/' + before.assuranceClass + '/' + before.signingKeyDid);
  }
  return cases;
}
