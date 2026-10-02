/** Same exact public fixture replay in Node, Chromium and actual compiled production output. */
import { openNativeApplication } from '../../src/application/native-authority.ts';
import { NativeAnchor } from '../../src/protocol/native-wire.ts';
import { authenticateRepo } from '../../src/protocol/native-proof.ts';
import { AtseqError, InterpretationError } from '../../src/core/errors.ts';
import { contentCid, encodeBlock, decodeBlock } from '../../src/protocol/wire.ts';
import { create, toString, CODEC_RAW } from '@atcute/cid';
import { canonicalJson } from '../../src/core/values.ts';
import {
  assessNativeGenesisSource,
  nativeSourceAction,
  validateNativeSourceAction,
  validateNativeSourceState,
  type NativeSourceDefinition,
} from '../../src/definition/native-source.ts';
import { NATIVE_SOURCE_CONTRACT } from '../../src/definition/native-source-contract.ts';
import type { ApplicationFixture, ApplicationVector } from './native-application-fixture.ts';
function assert(value: unknown, detail = 'Application corpus assertion failed'): asserts value {
  if (!value) throw new Error(detail);
}
function equal(actual: unknown, expected: unknown) {
  assert(
    canonicalJson(actual, 32 * 1024 * 1024) === canonicalJson(expected, 32 * 1024 * 1024),
    'Exact application projection differs',
  );
}
async function rejection(run: () => unknown | Promise<unknown>, check: (error: unknown) => boolean) {
  try {
    await run();
  } catch (error) {
    assert(check(error), 'Unexpected refusal ' + String(error));
    return;
  }
  throw new Error('Expected refusal');
}
export async function applicationReplayContext(
  fixture: ApplicationFixture,
  options: {
    persist?: Parameters<typeof openNativeApplication>[0]['persist'];
    sourceFault?: (cid: string) => void;
    evidenceFault?: (cid: string) => void;
  } = {},
) {
  const anchor = await NativeAnchor.from(fixture.genesis, { app: fixture.genesis.app, genesis: fixture.genesisCid });
  const source = new Map(fixture.sourceBlocks.map(([cid, bytes]) => [cid, new Uint8Array(bytes)]));
  const retained = new Map(fixture.retainedContent.map(([cid, bytes]) => [cid, new Uint8Array(bytes)]));
  const reads: string[] = [];
  const sourceReader = {
    async get(cid: string) {
      reads.push(cid);
      options.sourceFault?.(cid);
      const raw = source.get(cid);
      if (!raw) throw new AtseqError('content_unavailable', 'Missing source');
      return new Uint8Array(raw);
    },
  };
  const app = await openNativeApplication({ anchor, sourceReader, persist: options.persist });
  const evidence = {
    assuranceClass: 'plc-audit-v1' as const,
    auditBytes: new Uint8Array(fixture.appIdentity.auditBytes),
    selectedTipCid: fixture.appIdentity.selectedTipCid,
  };
  const inputs = await Promise.all(
    fixture.vectors.map(async (vector) => ({
      entry: vector.entry,
      appRepo: await authenticateRepo({
        carBytes: new Uint8Array(vector.appCar),
        expectedDid: fixture.genesis.app,
        trustedSigningKeyDid: fixture.appKey,
      }),
      reader: {
        async get(cid: string) {
          options.evidenceFault?.(cid);
          const raw = retained.get(cid);
          if (!raw) throw new AtseqError('content_unavailable', 'Missing evidence');
          return new Uint8Array(raw);
        },
      },
      appIdentity: { before: evidence, after: evidence },
    })),
  );
  return { app, anchor, inputs, reads, sourceReader };
}
export async function nativeApplicationCorpus(fixture: ApplicationFixture): Promise<string[]> {
  const cases: string[] = [];
  async function check(name: string, run: () => unknown | Promise<unknown>) {
    await run();
    cases.push(name);
  }
  const healthy = await applicationReplayContext(fixture);
  await check('genesis derives only root-declared set and reads verified root once', () => {
    assert(healthy.reads.filter((cid) => cid === fixture.genesis.definition.$link).length === 1);
    const rootRaw = fixture.sourceBlocks.find(([cid]) => cid === fixture.genesis.definition.$link)![1];
    assert(rootRaw.length > 0 && healthy.reads.length < fixture.sourceBlocks.length);
    assert(healthy.app.snapshot().authority.frontier.position === 0);
    assert(healthy.app.snapshot().outcomes.length === 0);
    assert(Object.getPrototypeOf(healthy.app) === Object.prototype && Object.isFrozen(healthy.app));
  });
  for (let i = 0; i < fixture.vectors.length; i++)
    await check(fixture.vectors[i]!.name, async () => {
      const vector = fixture.vectors[i]!;
      const beforeReads = healthy.reads.length;
      const result = await healthy.app.process(healthy.inputs[i]!);
      if (vector.name.includes('before target fetch') || vector.name === 'stale expected source before fetch')
        assert(healthy.reads.length === beforeReads);
      equal(result.outcome, vector.expected.outcomes.at(-1)!.outcome);
      equal(healthy.app.snapshot(), vector.expected);
    });
  await check('query returns coherent current captured state and frontier', async () => {
    const answer = await healthy.app.query('status', {});
    equal(answer.frontier, healthy.app.snapshot().authority.frontier);
    assert(answer.result.kind === 'available');
    equal(answer.result.value, healthy.app.snapshot().state);
  });
  await check('unknown or malformed query is unavailable and changes no projection', async () => {
    const prior = healthy.app.snapshot();
    assert((await healthy.app.query('missing', {})).result.kind === 'unavailable');
    assert((await healthy.app.query('status', { constructor: 'bad' })).result.kind === 'unavailable');
    equal(healthy.app.snapshot(), prior);
  });
  await check('snapshot mutation cannot alter domain authority outcomes or frontier', () => {
    const before = healthy.app.snapshot(),
      copy = healthy.app.snapshot();
    copy.state = { count: 999 };
    copy.authority.frontier.position = 0;
    copy.outcomes.length = 0;
    equal(healthy.app.snapshot(), before);
  });
  await check('second ordered copy is invalid history without identity consumption', async () => {
    const prior = healthy.app.snapshot();
    const repeated = {
      ...healthy.inputs.at(-1)!,
      appRepo: await authenticateRepo({
        carBytes: new Uint8Array(fixture.duplicateCar),
        expectedDid: fixture.genesis.app,
        trustedSigningKeyDid: fixture.appKey,
      }),
      entry: {
        ...fixture.vectors.at(-1)!.entry,
        position: prior.authority.frontier.position + 1,
        prev: { $link: prior.authority.frontier.entry },
      },
    };
    await rejection(
      () => healthy.app.process(repeated),
      (error) =>
        error instanceof AtseqError &&
        error.code === 'envelope' &&
        error.message === 'A request occurs twice in ordered history',
    );
    equal(healthy.app.snapshot(), prior);
  });
  await check('captured caller entry cannot be changed while queued', async () => {
    const context = await applicationReplayContext(fixture),
      input = { ...context.inputs[0]!, entry: structuredClone(fixture.vectors[0]!.entry) };
    const pending = context.app.process(input);
    input.entry.position = 500;
    await pending;
    equal(context.app.snapshot(), fixture.vectors[0]!.expected);
  });
  await check('real public source-like errors from evidence reader escape unchanged', async () => {
    let fault: unknown;
    const context = await applicationReplayContext(fixture, {
      evidenceFault: () => {
        if (fault) throw fault;
      },
    });
    const prior = context.app.snapshot();
    for (const code of [
      'invalid_activation',
      'incompatible_definition',
      'unicode',
      'value_bytes',
      'reserved_key',
    ] as const) {
      fault = new InterpretationError(code, 'forged callback');
      await rejection(
        () => context.app.process(context.inputs[0]!),
        (error) => error === fault,
      );
      equal(context.app.snapshot(), prior);
    }
    fault = undefined;
    await context.app.process(context.inputs[0]!);
    equal(context.app.snapshot(), fixture.vectors[0]!.expected);
  });
  await check('persistence refusal leaves all projection fields unchanged and live retry equivalent', async () => {
    const failed = new Error('atomic persistence rejected');
    let refuse = false;
    const context = await applicationReplayContext(fixture, {
      persist: async (projection) => {
        if (refuse) throw failed;
        projection.state = { count: 999 };
        projection.outcomes.length = 0;
      },
    });
    for (let i = 0; i < context.inputs.length; i++) {
      const before = context.app.snapshot();
      refuse = true;
      await rejection(
        () => context.app.process(context.inputs[i]!),
        (error) => error === failed,
      );
      equal(context.app.snapshot(), before);
      refuse = false;
      await context.app.process(context.inputs[i]!);
      equal(context.app.snapshot(), fixture.vectors[i]!.expected);
    }
    equal(context.app.snapshot(), healthy.app.snapshot());
  });
  await check('source unavailability at activation stalls then exact retry equals healthy replay', async () => {
    let unavailable = false;
    const missing = new AtseqError('content_unavailable', 'temporary source unavailable');
    const context = await applicationReplayContext(fixture, {
      sourceFault: () => {
        if (unavailable) throw missing;
      },
    });
    const index = fixture.vectors.findIndex(
      (vector) => vector.name === 'activation retains current state instead of new initial',
    );
    for (let i = 0; i < context.inputs.length; i++) {
      if (i === index) {
        const prior = context.app.snapshot();
        unavailable = true;
        await rejection(
          () => context.app.process(context.inputs[i]!),
          (error) => error === missing,
        );
        const after = context.app.snapshot();
        equal({ ...after, publication: null }, { ...prior, publication: null });
        assert(after.publication?.head.position === i + 1 && after.authority.frontier.position === i);
        unavailable = false;
      }
      await context.app.process(context.inputs[i]!);
      equal(context.app.snapshot(), fixture.vectors[i]!.expected);
    }
    equal(context.app.snapshot(), healthy.app.snapshot());
  });
  await check('forged source capability cannot invoke private validators', () => {
    const forged = {} as NativeSourceDefinition;
    for (const value of [forged, { ...forged }, Object.create(forged), structuredClone(forged)]) {
      let caught = false;
      try {
        validateNativeSourceState(value, {});
      } catch (error) {
        caught = error instanceof TypeError;
      }
      assert(caught);
    }
  });
  await check('wrong admitted source action capability cannot select another validator', async () => {
    const first = await assessNativeGenesisSource(fixture.genesis.definition.$link, healthy.sourceReader);
    const target = fixture.vectors.find(
      (vector) => vector.name === 'activation retains current state instead of new initial',
    )!.expected.definition;
    const second = await assessNativeGenesisSource(target, healthy.sourceReader);
    assert(first.kind === 'admitted' && second.kind === 'admitted');
    const action = nativeSourceAction(second.definition, 'ai.generalbusiness.atseq.example#act')!;
    await rejection(
      () => validateNativeSourceAction(first.definition, action, { amount: 1 }),
      (error) => error instanceof TypeError,
    );
  });
  await check('unsupported genesis semantics produces no executable instance', async () => {
    const genesis = { ...fixture.genesis, semantics: { $link: NATIVE_SOURCE_CONTRACT.evaluator } };
    const anchor = await NativeAnchor.from(genesis, { app: genesis.app, genesis: await contentCid(genesis) });
    await rejection(
      () => openNativeApplication({ anchor, sourceReader: healthy.sourceReader }),
      (error) => error instanceof AtseqError && error.code === 'content_unavailable',
    );
  });
  await check(
    'forged copied or prototype-derived native repository proof cannot authenticate publication',
    async () => {
      const context = await applicationReplayContext(fixture),
        prior = context.app.snapshot(),
        real = context.inputs[0]!.appRepo;
      for (const fake of [{}, { ...real }, Object.create(real)]) {
        await rejection(
          () => context.app.process({ ...context.inputs[0]!, appRepo: fake as any }),
          (error) => error instanceof AtseqError,
        );
        equal(context.app.snapshot(), prior);
      }
    },
  );
  await check('cancelled reader work leaves no committed outcome and serial queue remains usable', async () => {
    let cancel = true;
    const fault = new Error('AbortError');
    fault.name = 'AbortError';
    const context = await applicationReplayContext(fixture, {
        evidenceFault: () => {
          if (cancel) throw fault;
        },
      }),
      prior = context.app.snapshot();
    await rejection(
      () => context.app.process(context.inputs[0]!),
      (error) => error === fault,
    );
    equal(context.app.snapshot(), prior);
    cancel = false;
    await context.app.process(context.inputs[0]!);
    equal(context.app.snapshot(), fixture.vectors[0]!.expected);
  });
  await check('genesis missing or corrupt bytes cannot initialize authority', async () => {
    await rejection(
      () =>
        openNativeApplication({
          anchor: healthy.anchor,
          sourceReader: {
            async get() {
              throw new AtseqError('content_unavailable', 'missing');
            },
          },
        }),
      (error) => error instanceof AtseqError && error.code === 'content_unavailable',
    );
    await rejection(
      () =>
        openNativeApplication({
          anchor: healthy.anchor,
          sourceReader: {
            async get() {
              return new Uint8Array([1, 2, 3]);
            },
          },
        }),
      (error) => error instanceof AtseqError && error.code === 'content_corrupt',
    );
  });
  await check('genesis alias occurrences remain charged independently after internal set derivation', async () => {
    const blocks = new Map(fixture.sourceBlocks.map(([cid, bytes]) => [cid, new Uint8Array(bytes)]));
    const root: any = decodeBlock(blocks.get(fixture.genesis.definition.$link)!);
    const raw = new Uint8Array(200000),
      cid = toString(await create(CODEC_RAW, raw));
    blocks.set(cid, raw);
    for (let i = 0; i < 3; i++) root.files.push({ path: 'alias' + i + '.bin', cid });
    const rootCid = await contentCid(root);
    blocks.set(rootCid, encodeBlock(root));
    const genesis = { ...fixture.genesis, definition: { $link: rootCid } };
    const anchor = await NativeAnchor.from(genesis, { app: genesis.app, genesis: await contentCid(genesis) });
    let reads = 0;
    await rejection(
      () =>
        openNativeApplication({
          anchor,
          sourceReader: {
            async get(selected) {
              if (selected === cid) reads++;
              return new Uint8Array(blocks.get(selected)!);
            },
          },
        }),
      (error) => error instanceof InterpretationError && error.code === 'invalid_activation',
    );
    assert(reads === 1);
  });
  await check('fresh replay is byte-identical to healthy and live resumed processing', async () => {
    const fresh = await applicationReplayContext(fixture);
    for (const input of fresh.inputs) await fresh.app.process(input);
    equal(fresh.app.snapshot(), healthy.app.snapshot());
  });
  await check('query capture cannot be relabeled by a concurrent commit', async () => {
    const context = await applicationReplayContext(fixture);
    for (let i = 0; i < 2; i++) await context.app.process(context.inputs[i]!);
    const prior = context.app.snapshot(),
      query = context.app.query('status', {});
    await context.app.process(context.inputs[2]!);
    const answer = await query;
    equal(answer.frontier, prior.authority.frontier);
    assert(answer.result.kind === 'available');
    equal(answer.result.value, prior.state);
  });
  return cases;
}
