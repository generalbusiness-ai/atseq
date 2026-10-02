/** Internal counter ABI probe; no application/discovery/simulation/host caller. */
import { evaluate, fold, foldEvaluation } from '../../src/runtime/evaluator.ts';
import { canonicalJson } from '../../src/core/values.ts';
import { InterpretationError } from '../../src/core/errors.ts';
function assert(value: unknown): asserts value {
  if (!value) throw new Error('Measured fold contract differs');
}
export async function nativeFoldMeasurements() {
  const input = {
    state: { count: 2 },
    act: { amount: 3 },
    meta: { app: 'did:plc:example', genesis: 'example', position: 1, principal: 'did:plc:actor', execution: 'example' },
  };
  const cases = [];
  for (const [name, program, expected] of [
    [
      'effective',
      '{"decision":"effective","state":{"count":state.count + act.amount}}',
      { decision: 'effective', state: { count: 5 } },
    ],
    [
      'authored denial',
      '{"decision":"ineffective","reason":"limit","message":"💡"}',
      { decision: 'ineffective', reason: 'limit', message: '💡' },
    ],
  ] as const) {
    // Separate reference evaluation checks the counters; the measured call itself evaluates once.
    const reference = await evaluate(program, input);
    const measured = await foldEvaluation(program, input);
    const publicResult = await fold(program, input);
    assert(canonicalJson(measured.result) === canonicalJson(expected));
    assert(canonicalJson(publicResult) === canonicalJson(expected));
    assert(measured.steps === reference.steps && measured.inspectedBytes === reference.inspectedBytes);
    assert(Number.isSafeInteger(measured.steps) && measured.steps > 0);
    assert(Number.isSafeInteger(measured.inspectedBytes) && measured.inspectedBytes > 0);
    assert(!Object.hasOwn(publicResult, 'steps') && !Object.hasOwn(publicResult, 'inspectedBytes'));
    cases.push({ name, result: measured.result, steps: measured.steps, inspectedBytes: measured.inspectedBytes });
  }
  for (const program of ['{}', '{"decision":"effective","state":[]}']) {
    for (const run of [fold, foldEvaluation]) {
      let caught: unknown;
      try {
        await run(program, input);
      } catch (error) {
        caught = error;
      }
      assert(caught instanceof InterpretationError && caught.constructor === InterpretationError);
      assert(caught.code === 'fold_output');
      assert(!Object.hasOwn(caught, 'steps') && !Object.hasOwn(caught, 'inspectedBytes'));
    }
    cases.push({ name: 'invalid output ' + program, failure: 'fold_output', evaluation: null });
  }
  assert(canonicalJson(input.state) === '{"count":2}');
  return cases;
}
