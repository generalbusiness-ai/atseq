/** Genuine owner instances; test-only source callsite barriers are labelled separately. */
import { discoveryContext, discoveryAssert as assert, discoveryEqual as equal } from './native-discovery-corpus.ts';
import type { ApplicationFixture } from './native-application-fixture.ts';
import { AtseqError, InterpretationError } from '../../src/core/errors.ts';
import { NativePersistenceUncertain } from '../../src/application/native-authority.ts';
import { contradictNativePrefix } from '../../src/application/native-prefix.ts';
const globals = globalThis as any;
function barrier() {
  let release!: () => void, entered!: () => void;
  const wait = new Promise<void>((resolve) => (release = resolve)),
    ready = new Promise<void>((resolve) => (entered = resolve));
  return {
    ready,
    release,
    hold: async () => {
      entered();
      await wait;
    },
  };
}
function clear() {
  for (const key of Object.keys(globals)) if (key.startsWith('__nativeDiscovery')) delete globals[key];
}
export async function nativeDiscoveryFaultProbe(fixture: ApplicationFixture) {
  const cases: { id: string; name: string; evidence: 'test-only-callsite-bundle'; actual: unknown }[] = [];
  const signed = fixture.vectors[2]!.entry.request as any;
  const subject = { principal: signed.intent.principal, actorKey: signed.intent.actorKey },
    action = 'ai.generalbusiness.atseq.example#act';
  async function check(id: string, name: string, run: () => unknown | Promise<unknown>) {
    try {
      cases.push({ id, name, evidence: 'test-only-callsite-bundle', actual: await run() });
    } finally {
      clear();
    }
  }
  await check('K1-05', 'captured contradiction and real persistence poison withhold a pending read', async () => {
    const c = await discoveryContext(fixture, 2),
      hold = barrier();
    globals.__nativeDiscoveryFoldBarrier = hold.hold;
    const pending = c.app.simulate(subject, action, { amount: 1 });
    await hold.ready;
    contradictNativePrefix(c.app.prefix()!, 2, 'known-test-contradiction');
    hold.release();
    const result = await pending;
    assert(result.kind === 'unavailable', 'Contradicted read withheld');
    clear();
    let uncertain = false;
    const d = await discoveryContext(fixture, 2, {
      async persist() {
        if (uncertain) throw new NativePersistenceUncertain();
      },
    });
    const held = barrier();
    globals.__nativeDiscoveryFoldBarrier = held.hold;
    const poisoned = d.app.simulate(subject, action, { amount: 1 });
    await held.ready;
    uncertain = true;
    let error: unknown;
    try {
      await d.app.process(d.inputs[2]!);
    } catch (caught) {
      error = caught;
    }
    assert(error instanceof NativePersistenceUncertain, 'Actual configured persistence uncertainty');
    held.release();
    const withheld = await poisoned;
    assert(withheld.kind === 'unavailable', 'Poisoned read withheld');
    return { contradiction: result, poison: withheld };
  });
  await check('K3-03', 'unexpected actual source/program-callsite errors become local unavailable only', async () => {
    const results = [];
    for (const fault of [
      new AtseqError('unicode', 'foreign constructor'),
      new (class Foreign extends InterpretationError {})('unicode', 'subclass'),
      new InterpretationError('engine_error', 'wrong designated stage'),
      new InterpretationError('value_bytes', 'program retrieval wrong callsite'),
    ]) {
      const c = await discoveryContext(fixture, 2),
        before = c.app.snapshot();
      globals.__nativeDiscoveryFoldFault = fault;
      const result = await c.app.simulate(subject, action, { amount: 1 });
      assert(result.kind === 'unavailable' && !('outcome' in result), 'Local unavailable');
      equal(c.app.snapshot(), before, 'No simulated outcome appended');
      let thrown: unknown;
      try {
        await c.app.process(c.inputs[2]!);
      } catch (error) {
        thrown = error;
      }
      assert(thrown === fault, 'Ordered error object identity escapes');
      results.push(result);
      clear();
    }
    return results;
  });
  await check('K3-04', 'one real concurrent commit permits old-labelled retained simulation', async () => {
    const c = await discoveryContext(fixture, 2),
      hold = barrier();
    globals.__nativeDiscoveryFoldBarrier = hold.hold;
    const pending = c.app.simulate(subject, action, { amount: 1 });
    await hold.ready;
    await c.app.process(c.inputs[2]!);
    // A contradiction strictly beyond this old fixed head does not taint its facts.
    contradictNativePrefix(c.app.prefix()!, 3, 'later-test-contradiction');
    hold.release();
    const result = await pending;
    assert(
      result.kind === 'available' &&
        result.basis.frontier.position === 2 &&
        result.basis.publication!.head.position === 2,
      'Old basis retained',
    );
    equal(result.successor, { count: 1, description: 'demo' }, 'Old state, one actual fold');
    assert(c.app.snapshot().authority.frontier.position === 3, 'Real commit occurred');
    return result;
  });
  await check('K3-05', 'actual five metadata fields plus separately substituted overflow guard boundary', async () => {
    const c = await discoveryContext(fixture, 2),
      captures: unknown[] = [];
    globals.__nativeDiscoveryMetadata = (metadata: unknown) => captures.push(structuredClone(metadata));
    const result = await c.app.simulate(subject, action, { amount: 1 });
    assert(result.kind === 'available', 'Simulation');
    await c.app.process(c.inputs[2]!);
    assert(captures.length === 2, 'One simulation and one ordered actual full path');
    equal(captures[0], captures[1], 'Same five genuine values at same position');
    equal(
      Object.keys(captures[0] as object).sort(),
      ['app', 'execution', 'genesis', 'position', 'principal'],
      'Exactly five',
    );
    globals.__nativeDiscoveryOverflowBoundary = true;
    const overflow = await c.app.simulate(subject, action, { amount: 1 });
    assert(overflow.kind === 'unavailable' && overflow.code === 'content_unavailable', 'Refusal guard branch');
    assert(!Number.isSafeInteger(Number.MAX_SAFE_INTEGER + 1), 'Actual safe-integer boundary');
    return {
      captures,
      result,
      overflow,
      overflowReachability: 'test-only guard substitution; no 2^53 genuine history claim',
    };
  });
  await check('K5-02', 'concurrent readers share one pending pair and wait for both commitments', async () => {
    const c = await discoveryContext(fixture, 2),
      hold = barrier();
    let computations = 0,
      waited!: () => void;
    const joined = new Promise<void>((resolve) => (waited = resolve));
    globals.__nativeDiscoveryCommitmentBarrier = hold.hold;
    globals.__nativeDiscoveryCommitmentCalls = () => computations++;
    globals.__nativeDiscoveryMemoWaiter = (status: string) => {
      assert(status === 'awaited', 'Pending memo');
      waited();
    };
    let done = false;
    const first = c.app.discover(subject).then((result) => {
      done = true;
      return result;
    });
    await hold.ready;
    const second = c.app.discover(subject);
    await joined;
    assert(!done, 'No eligible result before both hashes');
    hold.release();
    const results = await Promise.all([first, second]);
    assert(results.every((r) => r.kind === 'available') && computations === 1, 'One actual pair computation');
    assert(results[0]!.work.memo === 'computed' && results[1]!.work.memo === 'awaited', 'Actual fixed memo schedule');
    if (results[0]!.kind === 'available' && results[1]!.kind === 'available')
      equal(results[0]!.basis, results[1]!.basis, 'Complete shared pair');
    return { computations, results };
  });
  await check(
    'K5-03',
    'pending small-budget failure rejects waiters without reset then explicit retry succeeds',
    async () => {
      let partial = 0;
      const calibration = await discoveryContext(fixture, 2);
      globals.__nativeDiscoveryBeforeAuthority = (bytes: number) => (partial = bytes);
      assert((await calibration.app.discover(subject)).kind === 'available', 'Calibration genuine completed pair');
      clear();
      const c = await discoveryContext(fixture, 2),
        hold = barrier();
      let waited!: () => void;
      const joined = new Promise<void>((resolve) => (waited = resolve));
      globals.__nativeDiscoveryCommitmentBarrier = hold.hold;
      globals.__nativeDiscoveryMemoWaiter = () => waited();
      const first = c.app.discover(subject, { bytes: partial + 1 });
      await hold.ready;
      const second = c.app.discover(subject);
      await joined;
      hold.release();
      const failed = await Promise.all([first, second]);
      assert(
        failed.every((r) => r.kind === 'unavailable'),
        'No transparent retry',
      );
      clear();
      const retry = await c.app.discover(subject);
      assert(retry.kind === 'available' && retry.work.memo === 'computed', 'Exact failed pending entry removed');
      return { failed, retry, initialByteLimit: partial + 1 };
    },
  );
  return cases;
}
