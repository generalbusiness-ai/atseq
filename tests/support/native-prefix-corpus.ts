/** One portable genuine-producer corpus, shared by source, compiled consumers and Chromium. */
import { AtseqError, ProtocolError } from '../../src/core/errors.ts';
import { canonicalJson } from '../../src/core/values.ts';
import { NativeAnchor } from '../../src/protocol/native-wire.ts';
import { authenticateRepo } from '../../src/protocol/native-proof.ts';
import { bytes, contentCid, link } from '../../src/protocol/wire.ts';
import {
  openNativePrefix,
  stageNativePrefix,
  acceptNativePrefix,
  nativePrefixCandidate,
  contradictNativePrefix,
  nativePrefixEntry,
  nativePrefixStatus,
  nativePrefixInventory,
  nativePrefixHas,
  nativePrefixWork,
  nativePrefixProvenance,
  lookupNativeRetry,
  type NativePrefix,
} from '../../src/application/native-prefix.ts';
import { authenticateAuthorityEntry } from '../../src/application/native-authority-evidence.ts';
import {
  openNativeApplication,
  openNativeAuthority,
  nativeAuthoritySnapshot,
  nativeAuthorityHistory,
  interpretNativeAuthority,
  NativePersistenceUncertain,
} from '../../src/application/native-authority.ts';
import { applicationReplayContext } from './native-application-corpus.ts';
import type { PrefixFixture } from './native-prefix-fixture.ts';
function assert(value: unknown, message = 'Prefix predicate failed'): asserts value {
  if (!value) throw new Error(message);
}
function equal(left: unknown, right: unknown) {
  assert(
    canonicalJson(left, 32 * 1024 * 1024) === canonicalJson(right, 32 * 1024 * 1024),
    'Exact prefix projection differs',
  );
}
async function refuses(run: () => unknown | Promise<unknown>, code?: string) {
  try {
    await run();
  } catch (error) {
    assert(error instanceof AtseqError && (!code || error.code === code), 'Unexpected refusal ' + String(error));
    return error;
  }
  throw new Error('Expected refusal');
}
export async function nativePrefixCorpus(fixture: PrefixFixture) {
  const cases: string[] = [],
    work: unknown[] = [];
  async function check(name: string, run: () => unknown | Promise<unknown>) {
    await run();
    cases.push(name);
  }
  const anchor = await NativeAnchor.from(fixture.genesis, { app: fixture.genesis.app, genesis: fixture.genesisCid });
  const evidence = {
    assuranceClass: 'plc-audit-v1' as const,
    auditBytes: new Uint8Array(fixture.appIdentity.auditBytes),
    selectedTipCid: fixture.appIdentity.selectedTipCid,
  };
  const blocks = new Map(fixture.content.map(([cid, raw]) => [cid, new Uint8Array(raw)]));
  const reader = {
    async get(cid: string) {
      const raw = blocks.get(cid);
      if (!raw) throw new AtseqError('content_unavailable', 'Missing fixture');
      return new Uint8Array(raw);
    },
  };
  async function publication(position: number) {
    return {
      anchor,
      reader,
      appIdentity: { before: evidence, after: evidence },
      appRepo: await authenticateRepo({
        carBytes: new Uint8Array(new Map(fixture.roots).get(position)!),
        expectedDid: fixture.genesis.app,
        trustedSigningKeyDid: fixture.appKey,
      }),
    };
  }
  const lowerPublication = await publication(0);
  const genuineInitial = await openNativeAuthority(anchor);
  let prefix = await openNativePrefix(lowerPublication);
  await check('unknown native semantics cannot issue a genuine prefix or supported coverage', async () => {
    const changed = { ...fixture.genesis, semantics: link(fixture.genesis.definition.$link) };
    const unknown = await NativeAnchor.from(changed, { app: changed.app, genesis: await contentCid(changed) });
    await refuses(() => openNativePrefix({ ...lowerPublication, anchor: unknown }), 'content_unavailable');
  });
  await check('cold zero head authenticates actual genesis/head and complete empty coverage', () => {
    assert(nativePrefixStatus(prefix).head.position === 0);
    equal(nativePrefixInventory(prefix), { requests: [], retries: [], consumedObservations: [] });
  });
  await check('cloned copied prototype and snapshot prefix handles cannot mint views or evidence', async () => {
    for (const fake of [
      {},
      { ...prefix },
      structuredClone(prefix),
      Object.create(prefix),
      nativePrefixStatus(prefix),
    ]) {
      await refuses(() => stageNativePrefix(fake as NativePrefix, lowerPublication), 'envelope');
      await refuses(
        () => authenticateAuthorityEntry({ prefix: fake as NativePrefix, prior: genuineInitial, reader }),
        'envelope',
      );
    }
  });
  const zero = prefix;
  await check('delta zero still checks genesis/head and returns no signature or identity writes', async () => {
    const candidate = await stageNativePrefix(prefix, await publication(0));
    const counts = nativePrefixWork(candidate);
    equal(counts, {
      signatureChecks: 0,
      entryLoads: 0,
      reusedEntries: 0,
      descriptorLoads: 0,
      indexReads: 0,
      stagedIndexWrites: 0,
      indexWrites: 0,
      publicationLookups: 2,
    });
    work.push({ delta: 0, ...counts });
    prefix = acceptNativePrefix(prefix, candidate);
  });
  await check('delta one stages privately and accepted fixed old view cannot see new identities', async () => {
    const base = prefix,
      candidate = await stageNativePrefix(base, await publication(1));
    equal(nativePrefixInventory(base), nativePrefixInventory(zero));
    assert(nativePrefixStatus(nativePrefixCandidate(candidate)).head.position === 1);
    const counts = nativePrefixWork(candidate);
    assert(
      counts.signatureChecks === 1 &&
        counts.indexWrites === 0 &&
        counts.stagedIndexWrites === 2 &&
        counts.entryLoads === 1,
    );
    prefix = acceptNativePrefix(base, candidate);
    work.push({ delta: 1, ...nativePrefixWork(candidate) });
    assert(!nativePrefixHas(base, 'requests', nativePrefixEntry(prefix, 1).row.requestCid));
  });
  await check('cold and staged publication capture delta budget and reader before asynchronous work', async () => {
    for (const cold of [true, false]) {
      const base = await openNativePrefix(await publication(0));
      const input = { ...(await publication(1)), maximumDelta: 0 };
      let release!: () => void, entered!: () => void;
      const held = new Promise<void>((resolve) => {
        release = resolve;
      });
      const started = new Promise<void>((resolve) => {
        entered = resolve;
      });
      const original = input.reader.get.bind(input.reader);
      input.reader = {
        get: async (cid: string) => {
          entered();
          await held;
          return original(cid);
        },
      };
      const pending = cold ? openNativePrefix(input) : stageNativePrefix(base, input);
      await started;
      input.maximumDelta = 1;
      input.reader.get = async () => {
        throw new Error('Mutated reader must not be selected');
      };
      release();
      await refuses(() => pending, 'content_unavailable');
      assert(nativePrefixStatus(base).head.position === 0);
    }
    // A lowered caller budget also cannot reject work that was captured as allowed.
    const base = await openNativePrefix(await publication(0));
    const input = { ...(await publication(1)), maximumDelta: 1 };
    let release!: () => void, entered!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const original = input.reader.get.bind(input.reader);
    input.reader = {
      get: async (cid: string) => {
        entered();
        await held;
        return original(cid);
      },
    };
    const pending = stageNativePrefix(base, input);
    await started;
    input.maximumDelta = 0;
    input.reader.get = async () => {
      throw new Error('Mutated reader must not be selected');
    };
    release();
    const accepted = acceptNativePrefix(base, await pending);
    assert(nativePrefixStatus(accepted).head.position === 1);
  });
  await check('unpublished candidates cannot report missing retries or mint receipts before acceptance', async () => {
    const base = await openNativePrefix(await publication(0));
    const extension = await stageNativePrefix(base, await publication(1));
    const staged = nativePrefixCandidate(extension);
    assert(nativePrefixHas(staged, 'requests', nativePrefixEntry(staged, 1).row.requestCid));
    await refuses(() => lookupNativeRetry(staged, fixture.alternate), 'content_unavailable');
    await refuses(() => lookupNativeRetry(staged, fixture.tupleConflict), 'content_unavailable');
    assert((await lookupNativeRetry(base, fixture.alternate)) === null);
    const accepted = acceptNativePrefix(base, extension);
    assert(accepted === staged);
    assert((await lookupNativeRetry(accepted, fixture.alternate))?.position === 1);
    await refuses(() => lookupNativeRetry(accepted, fixture.tupleConflict), 'retry_conflict');
  });
  await check('a fixed old view cannot acquire a contradiction beyond its authenticated head', async () => {
    const base = await openNativePrefix(await publication(1));
    const inventory = nativePrefixInventory(base);
    const next = acceptNativePrefix(base, await stageNativePrefix(base, await publication(2)));
    contradictNativePrefix(next, 2, 'envelope');
    assert(nativePrefixStatus(next).contradiction?.position === 2);
    assert(nativePrefixStatus(base).contradiction === null && nativePrefixStatus(base).head.position === 1);
    equal(nativePrefixInventory(base), inventory);
    const publication3 = await publication(3);
    await refuses(() => stageNativePrefix(next, publication3), 'envelope');
  });
  await check('cloned staged extension and stale exact base cannot publish or insert rows', async () => {
    const base = prefix,
      first = await stageNativePrefix(base, await publication(2)),
      competing = await stageNativePrefix(base, await publication(2));
    await refuses(() => acceptNativePrefix(base, structuredClone(first)), 'envelope');
    prefix = acceptNativePrefix(base, first);
    const before = nativePrefixInventory(prefix);
    await refuses(() => acceptNativePrefix(base, competing), 'envelope');
    const stalePublication = await publication(2);
    await refuses(() => stageNativePrefix(base, stalePublication), 'envelope');
    equal(nativePrefixInventory(prefix), before);
  });
  await check('delta100 adds only suffix checks and writes while old views remain fixed', async () => {
    const base = await openNativePrefix(await publication(1)),
      candidate = await stageNativePrefix(base, await publication(101)),
      counts = nativePrefixWork(candidate);
    assert(
      counts.signatureChecks === 100 &&
        counts.entryLoads === 100 &&
        counts.reusedEntries === 1 &&
        counts.indexWrites === 0 &&
        counts.stagedIndexWrites === 200 &&
        counts.indexReads === 400,
    );
    const accepted = acceptNativePrefix(base, candidate);
    work.push({ prior: 1, delta: 100, ...nativePrefixWork(candidate) });
    assert(
      nativePrefixInventory(accepted).requests.length === 101 && nativePrefixInventory(base).requests.length === 1,
    );
  });
  await check('warm N100 delta0/1/100 uses only suffix signatures and identity writes', async () => {
    for (const delta of [0, 1, 100]) {
      const base = await openNativePrefix(await publication(100));
      const candidate = await stageNativePrefix(base, await publication(100 + delta)),
        counts = nativePrefixWork(candidate);
      assert(
        counts.signatureChecks === delta &&
          counts.entryLoads === delta &&
          counts.reusedEntries === 1 &&
          counts.indexReads === delta * 4 &&
          counts.stagedIndexWrites === delta * 2 &&
          counts.indexWrites === 0,
      );
      acceptNativePrefix(base, candidate);
      work.push({ prior: 100, delta, ...nativePrefixWork(candidate) });
      assert(nativePrefixInventory(base).requests.length === 100);
    }
  });
  await check(
    'lower revision and equal-revision changed root recover all retained paths without lowering app floor',
    async () => {
      for (const raw of fixture.recoveredRoots) {
        const base = await openNativePrefix(await publication(100)),
          publicationBase = await publication(100);
        const repo = await authenticateRepo({
          carBytes: new Uint8Array(raw),
          expectedDid: fixture.genesis.app,
          trustedSigningKeyDid: fixture.appKey,
        });
        const candidate = await stageNativePrefix(base, { ...publicationBase, appRepo: repo }),
          counts = nativePrefixWork(candidate);
        assert(
          counts.signatureChecks === 0 &&
            counts.entryLoads === 0 &&
            counts.reusedEntries === 100 &&
            counts.indexWrites === 0,
        );
        const accepted = acceptNativePrefix(base, candidate);
        equal(nativePrefixInventory(accepted), nativePrefixInventory(base));
        assert(nativePrefixStatus(accepted).head.position === 100);
      }
    },
  );
  await check(
    'fully checked unpublished floor survives discard and rejects lower or higher fork while allowing samefloor and descendant',
    async () => {
      const base = await openNativePrefix(await publication(1));
      const high = await stageNativePrefix(base, await publication(3));
      assert(nativePrefixStatus(base).head.position === 1 && nativePrefixInventory(base).requests.length === 1);
      assert((await lookupNativeRetry(base, fixture.entries[2]!.request)) === null);
      const lower = await publication(2);
      await refuses(() => stageNativePrefix(base, lower), 'envelope');
      const fork = await authenticateRepo({
        carBytes: new Uint8Array(fixture.higherForkCar),
        expectedDid: fixture.genesis.app,
        trustedSigningKeyDid: fixture.appKey,
      });
      const forkPublication = { ...(await publication(4)), appRepo: fork };
      await refuses(() => stageNativePrefix(base, forkPublication), 'envelope');
      const same = await stageNativePrefix(base, await publication(3));
      assert(nativePrefixWork(same).signatureChecks === 2 && nativePrefixWork(same).indexWrites === 0);
      const descendant = await stageNativePrefix(base, await publication(4));
      await refuses(() => acceptNativePrefix(base, high), 'envelope');
      const accepted = acceptNativePrefix(base, descendant);
      assert(nativePrefixStatus(accepted).head.position === 4 && nativePrefixInventory(base).requests.length === 1);
    },
  );
  await check('concurrent low staging cannot publish after a higher complete observed floor', async () => {
    const base = await openNativePrefix(await publication(1));
    let release!: () => void, entered!: () => void;
    const held = new Promise<void>((resolve) => {
        release = resolve;
      }),
      started = new Promise<void>((resolve) => {
        entered = resolve;
      });
    const lowPub = await publication(2);
    const low = stageNativePrefix(base, {
      ...lowPub,
      reader: {
        async get(cid) {
          entered();
          await held;
          return reader.get(cid);
        },
      },
    });
    await started;
    const high = await stageNativePrefix(base, await publication(3));
    release();
    await refuses(() => low, 'envelope');
    assert(nativePrefixInventory(base).requests.length === 1);
    const accepted = acceptNativePrefix(base, high);
    assert(nativePrefixStatus(accepted).head.position === 3);
  });
  await check('bounded suffix refusal occurs before enumerating any delta paths', async () => {
    const target = await publication(110);
    await refuses(() => stageNativePrefix(prefix, { ...target, maximumDelta: 1 }), 'content_unavailable');
    assert(nativePrefixStatus(prefix).head.position === 2);
  });
  await check('complete selected root cannot lower retained application ordering floor', async () => {
    await refuses(() => stageNativePrefix(prefix, lowerPublication), 'envelope');
  });
  await check('published duplicate request is invalid despite current grant denial', async () => {
    const appRepo = await authenticateRepo({
      carBytes: new Uint8Array(fixture.duplicateCar),
      expectedDid: fixture.genesis.app,
      trustedSigningKeyDid: fixture.appKey,
    });
    await refuses(
      () => openNativePrefix({ anchor, reader, appIdentity: { before: evidence, after: evidence }, appRepo }),
      'envelope',
    );
  });
  await check('CID retry precedes tuple conflict and preserves first low-S signed entry bytes', async () => {
    const found = await lookupNativeRetry(prefix, fixture.alternate);
    assert(found?.position === 1);
    equal(found.entry, fixture.entries[0]);
    await refuses(() => lookupNativeRetry(prefix, fixture.tupleConflict), 'retry_conflict');
    const bad: any = structuredClone(fixture.alternate);
    bad.sig = bytes(new Uint8Array(64));
    await refuses(() => lookupNativeRetry(prefix, bad), 'signature');
  });
  await check(
    'original publication method provenance is retained separately and exported copies cannot alter it',
    () => {
      const original = nativePrefixProvenance(prefix, 1),
        copy = nativePrefixProvenance(prefix, 1);
      copy.appIdentity.before.assuranceClass === 'plc-audit-v1' && copy.appIdentity.before.auditBytes.fill(0);
      equal(JSON.parse(JSON.stringify(nativePrefixProvenance(prefix, 1))), JSON.parse(JSON.stringify(original)));
      assert(original.binding.signingKeyDid === fixture.appKey);
    },
  );
  await check('authenticated entry is bound to exact genuine prior and copied capabilities cannot fold', async () => {
    const prior = await openNativeAuthority(anchor),
      cap = await authenticateAuthorityEntry({ prefix, prior, reader });
    const next = interpretNativeAuthority(prior, cap).state;
    assert(!Object.hasOwn(nativeAuthoritySnapshot(next), 'requests'));
    assert(nativeAuthorityHistory(next).requests.length === 1);
    const other = await openNativeAuthority(anchor);
    await refuses(() => interpretNativeAuthority(other, cap), 'envelope');
    await refuses(() => interpretNativeAuthority(prior, structuredClone(cap)), 'envelope');
  });
  await check('evidence cannot replace a compact prior with a cold lineage or lower retained tail', async () => {
    const complete = await openNativePrefix(await publication(2)),
      initial = await openNativeAuthority(anchor);
    const first = await authenticateAuthorityEntry({ prefix: complete, prior: initial, reader });
    const prior = interpretNativeAuthority(initial, first).state;
    const foreign = await openNativePrefix(await publication(2));
    await refuses(() => authenticateAuthorityEntry({ prefix: foreign, prior, reader }), 'envelope');
    await refuses(() => authenticateAuthorityEntry({ prefix: zero, prior, reader }), 'envelope');
    const forgedPrior = structuredClone(prior);
    await refuses(() => authenticateAuthorityEntry({ prefix: complete, prior: forgedPrior, reader }), 'envelope');
    const rawPublication = await publication(2);
    await refuses(
      () =>
        (authenticateAuthorityEntry as any)({
          anchor,
          appRepo: rawPublication.appRepo,
          entry: fixture.entries[1],
          prior,
          reader,
          appIdentity: { before: evidence, after: evidence },
        }),
      'envelope',
    );
    assert(nativeAuthoritySnapshot(prior).frontier.position === 1);
  });
  await check('pending participant bytes preserve verified head and every later consumed identity', async () => {
    const bad = fixture.badNested,
      badAnchor = await NativeAnchor.from(bad.genesis, { app: bad.genesis.app, genesis: bad.genesisCid });
    const badEvidence = {
      assuranceClass: 'plc-audit-v1' as const,
      auditBytes: new Uint8Array(bad.appIdentity.auditBytes),
      selectedTipCid: bad.appIdentity.selectedTipCid,
    };
    const retained = new Map(bad.content.map(([cid, raw]) => [cid, new Uint8Array(raw)]));
    const baseReader = {
      async get(cid: string) {
        const raw = retained.get(cid);
        if (!raw) throw new AtseqError('content_unavailable', 'Missing');
        return new Uint8Array(raw);
      },
    };
    const pub = {
      anchor: badAnchor,
      appRepo: await authenticateRepo({
        carBytes: new Uint8Array(bad.car),
        expectedDid: bad.genesis.app,
        trustedSigningKeyDid: bad.appKey,
      }),
      reader: baseReader,
      appIdentity: { before: badEvidence, after: badEvidence },
    };
    const accepted = await openNativePrefix(pub),
      prior = await openNativeAuthority(badAnchor),
      before = nativePrefixInventory(accepted);
    assert(before.requests.length === 2 && before.retries.length === 1 && before.consumedObservations.length === 1);
    const missing = nativePrefixEntry(accepted, 1).row.descriptor!.proofs[0]!.$link;
    await refuses(
      () =>
        authenticateAuthorityEntry({
          prefix: accepted,
          prior,
          reader: {
            async get(cid) {
              if (cid === missing) throw new AtseqError('content_unavailable', 'Nested proof unavailable');
              return baseReader.get(cid);
            },
          },
        }),
      'content_unavailable',
    );
    assert(
      nativePrefixStatus(accepted).head.position === 2 &&
        nativePrefixStatus(accepted).contradiction === null &&
        nativeAuthoritySnapshot(prior).frontier.position === 0,
    );
    equal(nativePrefixInventory(accepted), before);
    const local = new ProtocolError('input', 'Reader deliberately threw a public code');
    try {
      await authenticateAuthorityEntry({
        prefix: accepted,
        prior,
        reader: {
          async get() {
            throw local;
          },
        },
      });
    } catch (error) {
      assert(error === local);
    }
    assert(nativePrefixStatus(accepted).contradiction === null);
    await refuses(() => authenticateAuthorityEntry({ prefix: accepted, prior, reader: baseReader }));
    const after = nativePrefixStatus(accepted);
    assert(
      after.head.position === 2 &&
        after.contradiction?.position === 1 &&
        nativeAuthoritySnapshot(prior).frontier.position === 0,
    );
    equal(nativePrefixInventory(accepted), before);
    await refuses(() => stageNativePrefix(accepted, pub), 'envelope');
    assert((await lookupNativeRetry(accepted, bad.entries[1]!.request))?.position === 2);
  });
  await check(
    'coordinator retains a larger pending head then resumed execution equals fresh healthy replay',
    async () => {
      let missing: string | null = null;
      const context = await applicationReplayContext(fixture.application, {
        evidenceFault: (cid: string) => {
          if (cid === missing) throw new AtseqError('content_unavailable', 'Nested unavailable');
        },
      });
      const root = context.inputs[2]!.appRepo;
      await context.app.process({ ...context.inputs[0]!, appRepo: root });
      const first = context.app.snapshot(),
        prefix = context.app.prefix()!;
      assert(
        first.authority.frontier.position === 1 &&
          first.publication?.head.position === 3 &&
          nativePrefixInventory(prefix).requests.length === 3,
      );
      missing = nativePrefixEntry(prefix, 2).row.descriptor!.proofs[0]!.$link;
      await refuses(() => context.app.process({ ...context.inputs[1]!, appRepo: root }), 'content_unavailable');
      equal(context.app.snapshot(), first);
      assert(nativePrefixInventory(context.app.prefix()!).requests.length === 3);
      missing = null;
      for (let i = 1; i < context.inputs.length; i++)
        await context.app.process(i < 3 ? { ...context.inputs[i]!, appRepo: root } : context.inputs[i]!);
      equal(context.app.snapshot(), fixture.application.vectors.at(-1)!.expected);
      const retry = await context.app.retry(fixture.application.vectors[2]!.entry.request);
      assert(retry.receipt?.position === 3 && retry.outcome?.decision === 'effective');
      equal(retry.receipt!.entry, fixture.application.vectors[2]!.entry);
    },
  );
  await check(
    'pending-tail persistence confirmed abort inserts no identities; successful retry retains all tail rows',
    async () => {
      let refuse = false,
        missing: string | null = null,
        writes = 0;
      const failure = new Error('Confirmed local abort');
      const context = await applicationReplayContext(fixture.application, {
        persist: async () => {
          writes++;
          if (refuse) throw failure;
        },
        evidenceFault: (cid: string) => {
          if (cid === missing) throw new AtseqError('content_unavailable', 'Nested unavailable');
        },
      });
      await context.app.process(context.inputs[0]!);
      const before = context.app.snapshot(),
        old = context.app.prefix()!;
      // Obtain the published descriptor from a checked temporary complete view for fault targeting only.
      const proposed = await stageNativePrefix(old, { anchor: context.anchor, ...context.inputs[2]! });
      missing = nativePrefixEntry(nativePrefixCandidate(proposed), 2).row.descriptor!.proofs[0]!.$link;
      refuse = true;
      const priorWrites = writes;
      try {
        await context.app.process({ ...context.inputs[1]!, appRepo: context.inputs[2]!.appRepo });
      } catch (error) {
        assert(error === failure);
      }
      equal(context.app.snapshot(), before);
      assert(nativePrefixInventory(old).requests.length === 1 && writes === priorWrites + 1);
      await refuses(() => context.app.process(context.inputs[1]!), 'envelope');
      assert(writes === priorWrites + 1);
      equal(context.app.snapshot(), before);
      refuse = false;
      await refuses(
        () => context.app.process({ ...context.inputs[1]!, appRepo: context.inputs[2]!.appRepo }),
        'content_unavailable',
      );
      assert(
        context.app.publication()?.head.position === 3 &&
          context.app.snapshot().authority.frontier.position === 1 &&
          nativePrefixInventory(context.app.prefix()!).requests.length === 3,
      );
    },
  );
  await check('pending-tail uncertain local commit poisons queries retries and further publication', async () => {
    let unknown = false,
      missing: string | null = null,
      writes = 0;
    const context = await applicationReplayContext(fixture.application, {
      persist: async () => {
        writes++;
        if (unknown) throw new NativePersistenceUncertain();
      },
      evidenceFault: (cid: string) => {
        if (cid === missing) throw new AtseqError('content_unavailable', 'Nested unavailable');
      },
    });
    await context.app.process(context.inputs[0]!);
    const old = context.app.prefix()!;
    const staged = await stageNativePrefix(old, { anchor: context.anchor, ...context.inputs[2]! });
    missing = nativePrefixEntry(nativePrefixCandidate(staged), 2).row.descriptor!.proofs[0]!.$link;
    unknown = true;
    await refuses(
      () => context.app.process({ ...context.inputs[1]!, appRepo: context.inputs[2]!.appRepo }),
      'persistence_failed',
    );
    assert(nativePrefixInventory(old).requests.length === 1);
    const afterWrites = writes;
    await refuses(() => context.app.query('status', {}), 'runtime_fault');
    await refuses(() => context.app.retry(fixture.application.vectors[0]!.entry.request), 'runtime_fault');
    await refuses(() => context.app.process(context.inputs[1]!), 'runtime_fault');
    assert(writes === afterWrites);
  });
  await check(
    'late participant contradiction is persisted with the retained head and all later consumed identities',
    async () => {
      const bad = fixture.badNested,
        badAnchor = await NativeAnchor.from(bad.genesis, { app: bad.genesis.app, genesis: bad.genesisCid });
      const source = new Map(fixture.application.sourceBlocks.map(([cid, raw]) => [cid, new Uint8Array(raw)]));
      const retained = new Map(bad.content.map(([cid, raw]) => [cid, new Uint8Array(raw)]));
      const ev = {
        assuranceClass: 'plc-audit-v1' as const,
        auditBytes: new Uint8Array(bad.appIdentity.auditBytes),
        selectedTipCid: bad.appIdentity.selectedTipCid,
      };
      const repo = await authenticateRepo({
        carBytes: new Uint8Array(bad.car),
        expectedDid: bad.genesis.app,
        trustedSigningKeyDid: bad.appKey,
      });
      let missing = true,
        stored: any,
        writes = 0;
      const app = await openNativeApplication({
        anchor: badAnchor,
        sourceReader: {
          async get(cid) {
            const raw = source.get(cid);
            if (!raw) throw new AtseqError('content_unavailable', 'Source unavailable');
            return raw;
          },
        },
        persist: async (projection) => {
          stored = projection;
          writes++;
        },
      });
      const input = {
        entry: bad.entries[0],
        appRepo: repo,
        appIdentity: { before: ev, after: ev },
        reader: {
          async get(cid: string) {
            if (missing && cid !== bad.genesis.observationPolicy.$link)
              throw new AtseqError('content_unavailable', 'Missing nested bytes');
            const raw = retained.get(cid);
            if (!raw) throw new AtseqError('content_unavailable', 'Missing retained bytes');
            return raw;
          },
        },
      };
      await refuses(() => app.process(input), 'content_unavailable');
      const prefix = app.prefix()!,
        inventory = nativePrefixInventory(prefix),
        before = app.snapshot();
      assert(
        before.publication?.head.position === 2 &&
          before.authority.frontier.position === 0 &&
          before.outcomes.length === 0 &&
          inventory.requests.length === 2,
      );
      missing = false;
      const previousWrites = writes;
      await refuses(() => app.process(input));
      const after = app.snapshot();
      assert(
        after.publication?.head.position === 2 &&
          after.publication?.contradiction?.position === 1 &&
          after.authority.frontier.position === 0 &&
          writes === previousWrites + 1,
      );
      equal({ ...after, publication: null }, { ...before, publication: null });
      equal(nativePrefixInventory(app.prefix()!), inventory);
      equal(stored, after);
      await refuses(() => app.process(input), 'envelope');
      assert((await app.retry(bad.entries[1]!.request)).receipt?.position === 2);
    },
  );
  await check('failed contradiction persistence poisons and the same prefix owner blocks further staging', async () => {
    const bad = fixture.badNested,
      badAnchor = await NativeAnchor.from(bad.genesis, { app: bad.genesis.app, genesis: bad.genesisCid });
    const source = new Map(fixture.application.sourceBlocks.map(([cid, raw]) => [cid, new Uint8Array(raw)])),
      retained = new Map(bad.content.map(([cid, raw]) => [cid, new Uint8Array(raw)]));
    const ev = {
        assuranceClass: 'plc-audit-v1' as const,
        auditBytes: new Uint8Array(bad.appIdentity.auditBytes),
        selectedTipCid: bad.appIdentity.selectedTipCid,
      },
      repo = await authenticateRepo({
        carBytes: new Uint8Array(bad.car),
        expectedDid: bad.genesis.app,
        trustedSigningKeyDid: bad.appKey,
      });
    let missing = true,
      refuse = false;
    const error = new Error('Confirmed abort while saving fault');
    const app = await openNativeApplication({
      anchor: badAnchor,
      sourceReader: {
        async get(cid) {
          return source.get(cid)!;
        },
      },
      persist: async () => {
        if (refuse) throw error;
      },
    });
    const input = {
      entry: bad.entries[0],
      appRepo: repo,
      appIdentity: { before: ev, after: ev },
      reader: {
        async get(cid: string) {
          if (missing && cid !== bad.genesis.observationPolicy.$link)
            throw new AtseqError('content_unavailable', 'Nested missing');
          return retained.get(cid)!;
        },
      },
    };
    await refuses(() => app.process(input), 'content_unavailable');
    const old = app.prefix()!,
      inventory = nativePrefixInventory(old);
    missing = false;
    refuse = true;
    try {
      await app.process(input);
    } catch (caught) {
      assert(caught === error);
    }
    equal(nativePrefixInventory(old), inventory);
    assert(nativePrefixStatus(old).head.position === 2);
    await refuses(() => app.query('status', {}), 'runtime_fault');
    await refuses(() => stageNativePrefix(old, { anchor: badAnchor, ...input }), 'envelope');
  });
  await check('pending-tail durable success with stale prefix owner poisons before exposure', async () => {
    let stale: (() => void) | null = null,
      missing: string | null = null,
      writes = 0,
      stored: any;
    const context = await applicationReplayContext(fixture.application, {
      persist: async (projection) => {
        writes++;
        stored = projection;
        stale?.();
      },
      evidenceFault: (cid: string) => {
        if (cid === missing) throw new AtseqError('content_unavailable', 'Nested missing');
      },
    });
    await context.app.process(context.inputs[0]!);
    const old = context.app.prefix()!,
      staged = await stageNativePrefix(old, { anchor: context.anchor, ...context.inputs[2]! });
    missing = nativePrefixEntry(nativePrefixCandidate(staged), 2).row.descriptor!.proofs[0]!.$link;
    stale = () => {
      acceptNativePrefix(old, staged);
      stale = null;
    };
    await refuses(
      () => context.app.process({ ...context.inputs[1]!, appRepo: context.inputs[2]!.appRepo }),
      'envelope',
    );
    assert(
      stored.publication.head.position === 3 &&
        stored.authority.frontier.position === 1 &&
        nativePrefixInventory(old).requests.length === 1,
    );
    const before = writes;
    await refuses(() => context.app.query('status', {}), 'runtime_fault');
    await refuses(() => context.app.process(context.inputs[1]!), 'runtime_fault');
    assert(writes === before);
  });
  await check(
    'higher staging during successful pending-tail persistence poisons without inserting either suffix',
    async () => {
      let held = false,
        missing: string | null = null,
        writes = 0,
        stored: any;
      let release!: () => void, entered!: () => void;
      const wait = new Promise<void>((resolve) => {
        release = resolve;
      });
      const started = new Promise<void>((resolve) => {
        entered = resolve;
      });
      const context = await applicationReplayContext(fixture.application, {
        persist: async (projection) => {
          writes++;
          stored = projection;
          if (held) {
            entered();
            await wait;
          }
        },
        evidenceFault: (cid: string) => {
          if (cid === missing) throw new AtseqError('content_unavailable', 'Nested missing');
        },
      });
      await context.app.process(context.inputs[0]!);
      const before = context.app.snapshot(),
        old = context.app.prefix()!;
      const selected = await stageNativePrefix(old, { anchor: context.anchor, ...context.inputs[1]! });
      missing = nativePrefixEntry(nativePrefixCandidate(selected), 2).row.descriptor!.proofs[0]!.$link;
      held = true;
      const pending = context.app.process(context.inputs[1]!);
      await started;
      const high = await stageNativePrefix(old, { anchor: context.anchor, ...context.inputs[2]! });
      assert(nativePrefixWork(high).indexWrites === 0);
      release();
      await refuses(() => pending, 'envelope');
      assert(stored.publication.head.position === 2 && nativePrefixStatus(old).head.position === 1);
      equal({ ...stored, publication: null }, { ...before, publication: null });
      assert(nativePrefixInventory(old).requests.length === 1);
      const priorWrites = writes;
      await refuses(() => context.app.query('status', {}), 'runtime_fault');
      await refuses(() => context.app.process(context.inputs[1]!), 'runtime_fault');
      assert(writes === priorWrites);
    },
  );
  return { cases, work };
}
