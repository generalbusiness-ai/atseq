import { integrityEnvironment } from '#atseq-integrity';
import { assertDependencies } from '../../src/core/dependencies.ts';
import { canonicalJson } from '../../src/core/values.ts';
import { evaluate, fold } from '../../src/runtime/evaluator.ts';
import { validateFramework } from '../../src/protocol/schemas.ts';
import { NSID } from '../../src/core/nsids.ts';
import { errorCode } from '../../src/core/errors.ts';
import type { FixtureResult } from '../../experiments/corpus.ts';

/** Expected values are hand-specified; this same corpus runs in Node and Chromium. */
export async function runProfileCorpus(): Promise<FixtureResult[]> {
  const results: FixtureResult[] = [];
  async function check(name: string, run: () => Promise<void>) {
    try {
      await run();
      results.push({ name, passed: true });
    } catch (error) {
      results.push({ name, passed: false, detail: `${errorCode(error)}: ${(error as Error).message}` });
    }
  }
  function equal(a: unknown, b: unknown) {
    if (canonicalJson(a) !== canonicalJson(b))
      throw new Error(`Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
  }
  async function rejects(run: () => Promise<unknown>, code: string) {
    try {
      await run();
    } catch (error) {
      equal(errorCode(error), code);
      return;
    }
    throw new Error(`Expected ${code}`);
  }
  await check('64 sibling object values do not consume nesting depth', async () => {
    const value = Object.fromEntries(Array.from({ length: 64 }, (_, i) => [`field${i}`, i]));
    equal((await evaluate(JSON.stringify(value), {})).value, value);
  });
  await check('100 grouped values do not consume nesting depth', async () => {
    const items = Array.from({ length: 100 }, (_, i) => ({ key: `k${i}`, value: i }));
    equal(
      (await evaluate('items{key:value}', { items })).value,
      Object.fromEntries(items.map((x) => [x.key, x.value])),
    );
  });
  await check('intermediate negative zero can be consumed as integer zero', async () => {
    equal((await evaluate('(-0)+1', {})).value, 1);
    equal((await evaluate('$sum([-0,1])', {})).value, 1);
  });
  await check('negative zero remains invalid at input and output boundaries', async () => {
    await rejects(() => evaluate('value', { value: -0 }), 'wire_number');
    await rejects(() => evaluate('-0', {}), 'wire_number');
    await rejects(() => evaluate('{"value":-0}', {}), 'wire_number');
  });
  await check('sum checks exact intermediate integers before cancellation', async () => {
    equal((await evaluate('$sum([9007199254740991,-9007199254740991,2])', {})).value, 2);
    await rejects(() => evaluate('$sum([9007199254740991,2,-9007199254740991])', {}), 'sum_overflow');
    await rejects(() => evaluate('$sum([-9007199254740991,-2,9007199254740991])', {}), 'sum_overflow');
  });
  await check('ineffective messages count Unicode code points and stop at 1024', async () => {
    const source = '{"decision":"ineffective","reason":"refused","message":act.message}';
    const input = { state: {}, meta: {}, act: { message: '🦉'.repeat(1024) } };
    const result = await fold(source, input);
    equal(result.decision, 'ineffective');
    if (result.decision === 'ineffective')
      validateFramework(NSID.defsIneffective, {
        $type: NSID.defsIneffective,
        reason: result.reason,
        message: result.message,
      });
    await rejects(() => fold(source, { ...input, act: { message: '🦉'.repeat(1025) } }), 'fold_message');
  });
  await check('conditional integrity adapter matches the running environment', async () => {
    equal(integrityEnvironment, typeof process === 'undefined' ? 'browser' : 'node');
  });
  await check('unmatched dependency closure fails closed in either environment', async () => {
    await rejects(async () => assertDependencies([]), 'dependency_mismatch');
  });
  return results;
}
