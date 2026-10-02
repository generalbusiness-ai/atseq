/** Test-only substitutions exercise actual producer callsites; production offers no fault factory. */
import { applicationReplayContext } from './native-application-corpus.ts';
import type { ApplicationFixture } from './native-application-fixture.ts';
import { InterpretationError, AtseqError } from '../../src/core/errors.ts';
import { NATIVE_FOLD_FAILURE_STAGES } from '../../src/definition/native-source-contract.ts';
import { canonicalJson } from '../../src/core/values.ts';
function assert(value: unknown): asserts value {
  if (!value) throw new Error('Fault probe failed');
}
const globals = globalThis as any;
export async function nativeApplicationFaultProbe(fixture: ApplicationFixture): Promise<string[]> {
  const cases: string[] = [];
  async function context(persist?: NonNullable<Parameters<typeof applicationReplayContext>[1]>['persist']) {
    const result = await applicationReplayContext(fixture, { persist });
    for (let i = 0; i < 2; i++) await result.app.process(result.inputs[i]!);
    return result;
  }
  for (const code of NATIVE_FOLD_FAILURE_STAGES.evaluateAndFold) {
    const c = await context();
    globals.__nativeApplicationFoldFault = new InterpretationError(code as any, 'actual fold callsite');
    const result = await c.app.process(c.inputs[2]!);
    delete globals.__nativeApplicationFoldFault;
    assert(
      result.outcome.decision === 'ineffective' &&
        result.outcome.source === 'framework' &&
        result.outcome.reason === `fold_failed/${code}`,
    );
    assert((c.app.snapshot().state as any).count === 0);
    cases.push('actual designated fold callsite ' + code);
  }
  for (const fault of [
    new AtseqError('unicode', 'wrong constructor'),
    new (class Foreign extends InterpretationError {})('unicode', 'foreign subclass'),
    new InterpretationError('engine_error', 'engine fault'),
    new InterpretationError('invalid_source', 'static source fault'),
  ]) {
    const c = await context(),
      prior = canonicalJson(c.app.snapshot(), 32 * 1024 * 1024);
    globals.__nativeApplicationFoldFault = fault;
    let caught: unknown;
    try {
      await c.app.process(c.inputs[2]!);
    } catch (error) {
      caught = error;
    }
    delete globals.__nativeApplicationFoldFault;
    assert(caught === fault && canonicalJson(c.app.snapshot(), 32 * 1024 * 1024) === prior);
    cases.push('non-designated constructor/code escapes ' + fault.name + '/' + fault.code);
  }
  for (const code of ['unicode', 'value_bytes', 'reserved_key'] as const) {
    const c = await context(),
      prior = canonicalJson(c.app.snapshot(), 32 * 1024 * 1024);
    const fault = new InterpretationError(code, 'stored-state canonicalization wrong callsite');
    globals.__nativeApplicationStoredFault = fault;
    let caught: unknown;
    try {
      await c.app.process(c.inputs[2]!);
    } catch (error) {
      caught = error;
    }
    delete globals.__nativeApplicationStoredFault;
    assert(caught === fault && canonicalJson(c.app.snapshot(), 32 * 1024 * 1024) === prior);
    cases.push('same typed fold code from stored-state wrong callsite ' + code);
  }
  {
    const c = await context();
    globals.__nativeApplicationStaleBeforeCommit = true;
    let caught: unknown;
    try {
      await c.app.process(c.inputs[2]!);
    } catch (error) {
      caught = error;
    }
    delete globals.__nativeApplicationStaleBeforeCommit;
    assert(caught instanceof AtseqError && caught.code === 'runtime_fault');
    assert(c.app.snapshot().authority.frontier.position === 2);
    cases.push('stale generation after authentication refuses continuation');
  }
  {
    let writes = 0,
      stored: any;
    const c = await context(async (projection) => {
      writes++;
      stored = structuredClone(projection);
    });
    globals.__nativeApplicationPostPersistStale = true;
    let caught: unknown;
    try {
      await c.app.process(c.inputs[2]!);
    } catch (error) {
      caught = error;
    }
    delete globals.__nativeApplicationPostPersistStale;
    assert(caught instanceof AtseqError && caught.code === 'runtime_fault' && stored.authority.frontier.position === 3);
    const before = writes;
    let retry: unknown;
    try {
      await c.app.process(c.inputs[2]!);
    } catch (error) {
      retry = error;
    }
    assert(retry instanceof AtseqError && retry.code === 'runtime_fault' && writes === before);
    let query: unknown;
    try {
      await c.app.query('status', {});
    } catch (error) {
      query = error;
    }
    assert(query instanceof AtseqError && query.code === 'runtime_fault');
    cases.push('durable success then stale base poisons instance and forbids commits/results/queries');
  }
  return cases;
}
