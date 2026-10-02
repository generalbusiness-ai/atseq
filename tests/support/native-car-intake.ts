import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';
import * as CAR from '@atcute/car';
import { encode as encodeVarint, encodingLength } from '@atcute/varint';
import { AtseqError, ProtocolError } from '../../src/core/errors.ts';
import { authenticateRepo, assertAuthenticatedRepo, VerifiedRepoBlocks } from '../../src/protocol/native-proof.ts';
import {
  NativeObserverCar,
  selectNativeObservationCommit,
  exactAdmissionCar,
} from '../../src/protocol/native-observer-car.ts';
import { car, nativeFixture, nativeProofCorpus } from './native-proof-corpus.ts';
import { nativeObserverCarCorpus } from './native-observer-portable.ts';
import { AuthorityHarness, authorityRepo, grantId } from './native-authority-fixture.ts';
import { NativeAnchor } from '../../src/protocol/native-wire.ts';
import { nativeRef } from '../../src/protocol/native-schema.ts';
import { link } from '../../src/protocol/wire.ts';
import {
  openNativePrefix,
  nativePrefixStatus,
  nativePrefixInventory,
  nativePrefixWork,
  stageNativePrefix,
} from '../../src/application/native-prefix.ts';

export type IntakeFixture = {
  curve: 'p256' | 'secp256k1';
  root: string;
  did: string;
  key: string;
  blocks: [string, number[]][];
};
export async function intakeFixtures(): Promise<IntakeFixture[]> {
  const fixtures: IntakeFixture[] = [];
  for (const curve of ['p256', 'secp256k1'] as const) {
    const f = await nativeFixture(curve, 'selected-CAR-intake');
    fixtures.push({
      curve,
      root: f.root,
      did: f.options.expectedDid,
      key: f.options.trustedSigningKeyDid,
      blocks: [...f.blocks].map(([cid, raw]) => [cid, [...raw]]),
    });
  }
  return fixtures;
}
export async function intakePrefixFixture() {
  const h = await AuthorityHarness.create(),
    zero = [...(await authorityRepo(h.app.principal, h.app.key, h.appRecords, 0)).car],
    request = await h.signed({
      $type: nativeRef('assignRole'),
      grant: { id: grantId(1), cid: link(h.anchor.cid) },
      epoch: link(h.anchor.cid),
      target: h.actor.principal,
      role: 'member',
      enabled: false,
      expectedAssignment: link(h.anchor.cid),
    });
  await h.append('intake private floor preservation', request, { decision: 'ineffective', reason: 'grant_unadmitted' });
  return {
    genesis: h.anchor.genesis,
    genesisCid: h.anchor.cid,
    key: h.app.signing,
    auditBytes: [...new TextEncoder().encode(JSON.stringify(h.app.rows))],
    selectedTipCid: h.app.selectedTipCid,
    content: [...h.content].map(([cid, raw]) => [cid, [...raw]] as [string, number[]]),
    car: zero,
    higherCar: [...(await authorityRepo(h.app.principal, h.app.key, h.appRecords, 1)).car],
  };
}
export type IntakePrefixFixture = Awaited<ReturnType<typeof intakePrefixFixture>>;
function check(value: unknown, message: string): asserts value {
  if (!value) throw Error(message);
}
async function refusal(run: () => unknown | Promise<unknown>, code: string) {
  let caught: unknown;
  try {
    await run();
  } catch (error) {
    caught = error;
  }
  check(caught instanceof AtseqError && caught.code === code, `Expected ${code}; got ${String(caught)}`);
  if (code === 'input') check(caught instanceof ProtocolError && caught.kind === 'invalid_input', 'Input kind differs');
  if (code === 'native_proof_limit') check(caught.kind === 'transient', 'Limit kind differs');
}
async function digest(raw: Uint8Array) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new Uint8Array(raw)))]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
}
function equal(a: Uint8Array, b: Uint8Array, message: string) {
  check(a.length === b.length && a.every((value, i) => value === b[i]), message);
}
async function physicalCar(root: string, entries: [string, Uint8Array][], roots: string[] = [root]) {
  const parts: Uint8Array[] = [];
  for await (const part of CAR.writeCarStream(
    roots.map((root) => ({ $link: root })),
    entries.map(([cid, data]) => ({ cid: CID.fromString(cid).bytes, data })),
  ))
    parts.push(part);
  const result = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}
function block(raw: Uint8Array): [string, Uint8Array] {
  return [CID.toString(CID.createSync(CID.CODEC_DCBOR, raw)), raw];
}
function paddedBlock(length: number, tag: number): [string, Uint8Array] {
  // Five-byte canonical CBOR byte-string prefix at all tested payload sizes.
  const raw = new Uint8Array(length),
    payload = length - 5;
  raw[0] = 0x5a;
  new DataView(raw.buffer).setUint32(1, payload);
  raw[5] = tag;
  return block(raw);
}
function headerCar(value: unknown) {
  const header = CBOR.encode(value),
    prefix = new Uint8Array(encodingLength(header.length)),
    output = new Uint8Array(prefix.length + header.length);
  encodeVarint(header.length, prefix);
  output.set(prefix);
  output.set(header, prefix.length);
  return output;
}

/** Actual public signed fixtures; expected CARs use the maintained writer independently of the helper. */
export async function carIntakeCorpus(fixtures: IntakeFixture[], prefixFixture: IntakePrefixFixture) {
  const cases: string[] = [],
    outputs: { name: string; bytes: number; blocks: number; sha256: string }[] = [],
    work: {
      curve: string;
      retainedBlocks: number;
      responseBlocks: number;
      outputBlocks: number;
      milliseconds: number;
    }[] = [];
  const passed = (id: string, predicate: string) => cases.push(`${id}: ${predicate}`);
  check(fixtures.length === 2, 'Both genuine signing curves are required');
  for (const fixture of fixtures) {
    const label = fixture.curve,
      blocks = new Map(fixture.blocks.map(([cid, raw]) => [cid, new Uint8Array(raw)])),
      root = fixture.root,
      commit = blocks.get(root)!;
    check(commit, 'Retained signed commit missing');
    const full = await car(root, blocks),
      selected = selectNativeObservationCommit(full),
      options = { expectedRoot: root, expectedDid: fixture.did, trustedSigningKeyDid: fixture.key };
    check(selected.root === root, 'Selected root differs');
    equal(selected.bytes, commit, 'Selected commit bytes differ');
    await refusal(() => assertAuthenticatedRepo(selected), 'input');
    const owner = new NativeObserverCar(full);
    equal(
      await owner.bytes(),
      await car(root, new Map([...blocks].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))),
      'Legacy constructor bytes changed',
    );
    for (const roots of [[], [root, root]]) {
      const raw = await car(root, blocks, roots);
      await refusal(() => selectNativeObservationCommit(raw), 'input');
      await refusal(() => new NativeObserverCar(raw), 'input');
    }
    await refusal(async () => selectNativeObservationCommit(await car(root, new Map())), 'input');
    const damaged = new Uint8Array(full);
    damaged[damaged.length - 1]! ^= 1;
    await refusal(() => selectNativeObservationCommit(damaged), 'input');
    passed('CI1', `${label} shared initial selection, hash checks, owned DATA without authenticated brand`);

    class OverrideProbe extends VerifiedRepoBlocks {
      override async authenticate(): Promise<never> {
        throw Error('Caller override must not dispatch');
      }
    }
    const cache = new OverrideProbe({
        bytes: [...blocks.values()].reduce((n, raw) => n + raw.length, 0),
        blocks: blocks.size,
      }),
      original = await authenticateRepo({
        ...options,
        blocks: cache,
        carBytes: await car(root, new Map([[root, commit]])),
      });
    const identity = original,
      path = 'ai.generalbusiness.atseq.probe/00000001';
    check((await original.lookup(path)).kind === 'missing', 'Commit-only proof is not missing');
    const nonCommit = [...blocks].filter(([cid]) => cid !== root);
    for (let offset = 0; offset < nonCommit.length; offset += 64) {
      const batch = nonCommit.slice(offset, offset + 64),
        requests = batch.map(([cid]) => cid),
        response = await car(root, new Map(batch), []),
        started = performance.now(),
        admission = await exactAdmissionCar(response, requests, selected),
        milliseconds = performance.now() - started,
        expected = await car(
          root,
          new Map([...new Map([[root, commit], ...batch])].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))),
        );
      equal(admission, expected, 'Exact admission differs from independent maintained writer');
      const parsed = CAR.fromUint8Array(admission);
      check(parsed.roots.length === 1 && parsed.roots[0]!.$link === root, 'Response roots chose authority');
      check([...parsed].length === batch.length + 1, 'Retained map leaked into bounded output');
      work.push({
        curve: label,
        retainedBlocks: blocks.size,
        responseBlocks: batch.length,
        outputBlocks: batch.length + 1,
        milliseconds,
      });
      outputs.push({
        name: `${label}/batch-${offset / 64}`,
        bytes: admission.length,
        blocks: batch.length + 1,
        sha256: await digest(admission),
      });
      await authenticateRepo({ ...options, blocks: cache, carBytes: admission }); // New capability deliberately discarded.
      check(
        original === identity && original.root === root && original.did === fixture.did,
        'Original capability changed',
      );
    }
    check(
      (await original.lookup(path)).kind === 'found' && (await original.validateTree()).kind === 'complete',
      'Same-cache fill did not recover original capability',
    );
    passed('CI7', `${label} genuine same-cache original-prototype P1 admission`);
    passed('CI8', `${label} original capability identity and fixed root/DID/key retained after every fill`);
    passed('CI9', `${label} exact new blocks plus commit, independent bytes and observed preparation time`);

    const item = nonCommit[0]!,
      one = await car(root, new Map([item]), []),
      requests = [item[0]],
      expected = await exactAdmissionCar(one, requests, selected);
    const omitted = await car(root, new Map(), []),
      extra = await car(root, new Map([item, nonCommit[1]!]), []),
      corrupt = new Uint8Array(one);
    corrupt[corrupt.length - 1]! ^= 1;
    for (const [raw, code] of [
      [omitted, 'content_unavailable'],
      [extra, 'input'],
      [corrupt, 'input'],
      [one.slice(0, -1), 'input'],
    ] as const) {
      await refusal(() => exactAdmissionCar(raw, requests, selected), code);
      const legacy = new NativeObserverCar(full),
        before = await legacy.bytes();
      await refusal(() => legacy.addExact(raw, requests), code);
      equal(await legacy.bytes(), before, 'Legacy rejected response changed owned inventory');
    }
    passed('CI2', `${label} extra/missing/hash/truncation distinction and atomic legacy refusal`);
    const duplicate64 = await physicalCar(
        root,
        Array.from({ length: 64 }, () => item),
        [],
      ),
      duplicate65 = await physicalCar(
        root,
        Array.from({ length: 65 }, () => item),
        [],
      );
    equal(
      await exactAdmissionCar(duplicate64, requests, selected),
      expected,
      '64 physical duplicates changed exact set',
    );
    await refusal(() => exactAdmissionCar(duplicate65, requests, selected), 'native_proof_limit');
    passed('CI3', `${label} physical 64 accepted and 65 refused before deduplication`);
    for (const roots of [[], [root], [item[0]], [root, item[0]]])
      equal(
        await exactAdmissionCar(await car(root, new Map([item]), roots), requests, selected),
        expected,
        'Syntax-only response roots changed selection',
      );
    passed('CI4', `${label} zero/multiple/foreign response roots preserve original selected root`);
    const mutableRaw = new Uint8Array(one),
      mutableRequests = [...requests],
      mutableSelected = { root, bytes: new Uint8Array(commit) },
      pending = exactAdmissionCar(mutableRaw, mutableRequests, mutableSelected);
    mutableRaw.fill(0);
    mutableRequests[0] = root;
    mutableSelected.root = item[0];
    mutableSelected.bytes.fill(0);
    equal(await pending, expected, 'Mutation across first await changed owned admission');
    selected.bytes.fill(0);
    equal(selectNativeObservationCommit(full).bytes, commit, 'Selected returned-byte mutation leaked');
    selected.bytes = new Uint8Array(commit);
    await refusal(() => exactAdmissionCar(one, requests, { root, bytes: new Uint8Array(commit).fill(0) }), 'input');
    for (const foreign of [
      new Error('not a valid cid string'),
      new SyntaxError('invalid base string'),
      new RangeError('incorrect cid version (got v0)'),
    ]) {
      const throwing = Object.defineProperty({ bytes: commit }, 'root', {
        get() {
          throw foreign;
        },
      });
      let caught: unknown;
      try {
        await exactAdmissionCar(one, requests, throwing as { root: string; bytes: Uint8Array });
      } catch (error) {
        caught = error;
      }
      check(caught === foreign, 'Foreign getter runtime error changed identity');
    }
    passed(
      'CI5',
      `${label} raw/list/selected DATA captured before await, forged hash refused and foreign error preserved`,
    );
    for (const list of [[], Array(65).fill(item[0]), [item[0], item[0]], ['invalid'], [item[0].toUpperCase()]])
      await refusal(() => exactAdmissionCar(one, list, selected), 'input');
    const rawCodec = CID.toString(CID.createSync(CID.CODEC_RAW, item[1]));
    await refusal(() => exactAdmissionCar(one, [rawCodec], selected), 'input');
    for (const bad of ['b' + '!'.repeat(58), item[0].slice(0, -1) + 'b']) {
      await refusal(() => exactAdmissionCar(one, [bad], selected), 'input');
      await refusal(() => exactAdmissionCar(one, requests, { root: bad, bytes: commit }), 'input');
    }
    const parsedCid = CID.fromString(item[0]);
    for (const [position, value] of [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 31],
    ] as const) {
      const bytes = new Uint8Array(parsedCid.bytes);
      bytes[position] = value;
      const bad = CID.toString({ ...parsedCid, bytes });
      await refusal(() => exactAdmissionCar(one, [bad], selected), 'input');
      await refusal(() => exactAdmissionCar(one, requests, { root: bad, bytes: commit }), 'input');
    }
    passed('CI6', `${label} canonical CBOR unique request count 1..64`);

    const before = { bytes: cache.bytes, size: cache.size },
      badCommit = CBOR.decode(commit),
      badSig = new Uint8Array(CBOR.fromBytes(badCommit.sig));
    badSig[0]! ^= 1;
    const altered = block(CBOR.encode({ ...badCommit, sig: CBOR.toBytes(badSig) })),
      alteredSelection = { root: altered[0], bytes: altered[1] },
      alteredAdmission = await exactAdmissionCar(one, requests, alteredSelection);
    for (const change of [
      { expectedDid: 'did:plc:bbbbbbbbbbbbbbbbbbbbbbbb', carBytes: expected },
      { trustedSigningKeyDid: fixtures.find((f) => f.curve !== fixture.curve)!.key, carBytes: expected },
      { expectedRoot: item[0], carBytes: expected },
      { expectedRoot: altered[0], carBytes: alteredAdmission },
      { carBytes: new Uint8Array(expected).fill(0) },
    ]) {
      await refusal(() => authenticateRepo({ ...options, ...change, blocks: cache }), 'input');
      check(
        cache.bytes === before.bytes && cache.size === before.size && (await original.lookup(path)).kind === 'found',
        'Failed P1 admission evicted accepted inventory',
      );
    }
    const large = block(CBOR.encode({ pad: 'x'.repeat(before.bytes + 100) })),
      largeAdmission = await exactAdmissionCar(await car(root, new Map([large]), []), [large[0]], selected);
    await refusal(
      () => authenticateRepo({ ...options, blocks: cache, carBytes: largeAdmission }),
      'native_proof_limit',
    );
    check(
      cache.bytes === before.bytes && cache.size === before.size && (await original.lookup(path)).kind === 'found',
      'Oversized P1 batch evicted accepted inventory',
    );
    await refusal(
      () => authenticateRepo({ ...options, blocks: cache, carBytes: expected, limits: { blockBytes: 1 } }),
      'native_proof_limit',
    );
    passed(
      'CI10',
      `${label} helper hash-valid DATA does not bypass fixed binding/signature/limits or atomic cache refusal`,
    );
  }

  const first = fixtures[0]!,
    commit = new Uint8Array(first.blocks.find(([cid]) => cid === first.root)![1]),
    selected = { root: first.root, bytes: commit },
    tiny = block(CBOR.encode({ n: 1 })),
    tinyResponse = await car(first.root, new Map([tiny]), []);
  await refusal(() => selectNativeObservationCommit(new Uint8Array(32 * 1024 * 1024 + 1)), 'native_proof_limit');
  await refusal(
    () => exactAdmissionCar(new Uint8Array(32 * 1024 * 1024 + 1), [tiny[0]], selected),
    'native_proof_limit',
  );
  const oversized = paddedBlock(1024 * 1024 + 1, 1);
  await refusal(
    async () => exactAdmissionCar(await car(first.root, new Map([oversized]), []), [oversized[0]], selected),
    'native_proof_limit',
  );
  await refusal(
    () => exactAdmissionCar(tinyResponse, [tiny[0]], { root: oversized[0], bytes: oversized[1] }),
    'native_proof_limit',
  );
  const bigHeader = headerCar({ roots: [], version: 1, padding: 'x'.repeat(16 * 1024) });
  await refusal(() => exactAdmissionCar(bigHeader, [tiny[0]], selected), 'native_proof_limit');
  let nested: unknown = null;
  for (let depth = 0; depth < 65; depth++) nested = [nested];
  await refusal(
    () => exactAdmissionCar(headerCar({ roots: [], version: 1, padding: nested }), [tiny[0]], selected),
    'native_proof_limit',
  );
  passed('CI6', 'Raw32MiB/header16KiB/depth64/block1MiB remain enforced without raised limits');

  const max = 16 * 1024 * 1024,
    largeBlocks = Array.from({ length: 15 }, (_, tag) => paddedBlock(1024 * 1024, tag + 1)),
    initial = new Map([[first.root, commit], ...largeBlocks]),
    serialized = await car(first.root, initial),
    needed = max - serialized.length - 40; // 36-byte CID plus three-byte length varint, adjusted by oracle below.
  let last = paddedBlock(needed, 100),
    full = await car(first.root, new Map([...initial, last]));
  last = paddedBlock(needed + max - full.length, 100);
  const atLimit = new Map([...initial, last]),
    exactExpected = await car(first.root, new Map([...atLimit].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))));
  check(exactExpected.length === max, 'Independent framed-limit fixture not exactly 16MiB');
  const responseBlocks = new Map([...largeBlocks, last]),
    response = await car(first.root, responseBlocks, []),
    atLimitOutput = await exactAdmissionCar(response, [...responseBlocks.keys()], selected);
  equal(atLimitOutput, exactExpected, 'Exact 16MiB frame not admitted');
  outputs.push({
    name: 'framed-16MiB',
    bytes: atLimitOutput.length,
    blocks: responseBlocks.size + 1,
    sha256: await digest(atLimitOutput),
  });
  const over = paddedBlock(last[1].length + 1, 100),
    overMap = new Map([...largeBlocks, over]),
    overResponse = await car(first.root, overMap, []),
    initialOver = await car(first.root, new Map([[first.root, commit], ...overMap]));
  await refusal(() => exactAdmissionCar(overResponse, [...overMap.keys()], selected), 'native_proof_limit');
  // Initial unique raw bytes fit although serialization framing puts this CAR one byte over.
  check(
    [...new Map([[first.root, commit], ...overMap]).values()].reduce((n, raw) => n + raw.length, 0) < max,
    'Raw/frame distinction fixture invalid',
  );
  check(
    selectNativeObservationCommit(initialOver).root === first.root,
    'Initial unique-raw budget was tightened to framed budget',
  );
  const legacyOver = new NativeObserverCar(initialOver);
  await refusal(() => legacyOver.bytes(), 'native_proof_limit');
  const rawOver = await car(first.root, new Map([[first.root, commit], ...overMap, paddedBlock(1024, 101)]));
  await refusal(() => selectNativeObservationCommit(rawOver), 'native_proof_limit');
  await refusal(() => new NativeObserverCar(rawOver), 'native_proof_limit');
  passed('CI6', 'Independent writer exact16MiB frame accepted/+1 refused; initial unique raw budget stays distinct');
  const sixtyFour = new Map(Array.from({ length: 64 }, (_, n) => block(CBOR.encode({ n: n + 1000 }))));
  const sixtyFiveOutput = await exactAdmissionCar(
    await car(first.root, sixtyFour, []),
    [...sixtyFour.keys()],
    selected,
  );
  check([...CAR.fromUint8Array(sixtyFiveOutput)].length === 65, 'Commit plus64 response blocks not65');
  const includingCommit = new Map([[first.root, commit], ...[...sixtyFour].slice(0, 63)]),
    included = await exactAdmissionCar(
      await car(first.root, includingCommit, []),
      [...includingCommit.keys()],
      selected,
    );
  check([...CAR.fromUint8Array(included)].length === 64, 'Selected commit was duplicated in output');
  outputs.push({
    name: '65-unique-with-commit',
    bytes: sixtyFiveOutput.length,
    blocks: 65,
    sha256: await digest(sixtyFiveOutput),
  });
  passed('CI6', '64 unique response blocks produce exactly65 incl selected commit, or64 when commit already requested');
  const anchor = await NativeAnchor.from(prefixFixture.genesis, {
      app: prefixFixture.genesis.app,
      genesis: prefixFixture.genesisCid,
    }),
    content = new Map(prefixFixture.content.map(([cid, raw]) => [cid, new Uint8Array(raw)])),
    reader = {
      async get(cid: string) {
        const raw = content.get(cid);
        if (!raw) throw new AtseqError('content_unavailable', 'Missing intake fixture');
        return new Uint8Array(raw);
      },
    },
    evidence = {
      assuranceClass: 'plc-audit-v1' as const,
      auditBytes: new Uint8Array(prefixFixture.auditBytes),
      selectedTipCid: prefixFixture.selectedTipCid,
    },
    publication = {
      anchor,
      reader,
      appIdentity: { before: evidence, after: evidence },
      appRepo: await authenticateRepo({
        carBytes: new Uint8Array(prefixFixture.car),
        expectedDid: anchor.genesis.app,
        trustedSigningKeyDid: prefixFixture.key,
      }),
    },
    prefix = await openNativePrefix(publication),
    candidate = await stageNativePrefix(prefix, {
      ...publication,
      appRepo: await authenticateRepo({
        carBytes: new Uint8Array(prefixFixture.higherCar),
        expectedDid: anchor.genesis.app,
        trustedSigningKeyDid: prefixFixture.key,
      }),
    }),
    beforePrefix = JSON.stringify({
      status: nativePrefixStatus(prefix),
      inventory: nativePrefixInventory(prefix),
      work: nativePrefixWork(candidate),
    });
  await refusal(() => stageNativePrefix(prefix, publication), 'envelope');
  const output = await exactAdmissionCar(tinyResponse, [tiny[0]], selected);
  await refusal(() => assertAuthenticatedRepo(output), 'input');
  await refusal(() => nativePrefixInventory(output as never), 'envelope');
  check(
    JSON.stringify({
      status: nativePrefixStatus(prefix),
      inventory: nativePrefixInventory(prefix),
      work: nativePrefixWork(candidate),
    }) === beforePrefix,
    'Byte helper changed genuine prefix inventory/floor/work',
  );
  await refusal(() => stageNativePrefix(prefix, publication), 'envelope');
  passed(
    'CI12',
    'Byte DATA cannot mint P1/prefix capability; genuine fixed views/candidate work and observed-floor rollback refusal remain unchanged',
  );
  return {
    cases,
    outputs,
    work,
    unobservable: { hashCalls: null, peakMemoryBytes: null, allocations: null },
    fullP2Complete: false,
  };
}

export async function carIntakeConformance(fixtures: IntakeFixture[], prefix: IntakePrefixFixture) {
  const result = await carIntakeCorpus(fixtures, prefix),
    legacyCases = await nativeObserverCarCorpus(),
    proofCases = await nativeProofCorpus();
  check(legacyCases.length === 20, 'Original observer CAR corpus was dropped');
  return { ...result, legacyCases, proofCases };
}
