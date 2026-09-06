import { evaluate, fold } from '../src/runtime/evaluator.ts';
import { canonicalJson } from '../src/runtime/values.ts';
import { Schemas } from '../src/definition/schemas.ts';
import { resolveView, type LocalView } from '../src/ui/inlay.ts';
import { offersSchemas, totalsSchemas } from './fixtures.ts';

// These fixtures pin observable behavior of the profile and the selected engine.
// They run unchanged in Node and in the browser worker.
async function rejects(action: () => unknown, code: string) {
  try { await action(); } catch (error) {
    if ((error as any).code !== code) throw error;
    return;
  }
  throw new Error(`Expected ${code}`);
}
function equal(actual: unknown, expected: unknown) {
  if (actual !== expected) throw new Error(`Expected ${expected}, received ${actual}`);
}
function templateView(bodies: unknown[]): LocalView {
  const did = 'did:plc:localdemo';
  return { root: 'test.atseq.component0', imports: [did], records: Object.fromEntries(bodies.map((node, i) => [
    `at://${did}/at.inlay.component/test.atseq.component${i}`,
    { $type: 'at.inlay.component', imports: [did], body: { $type: 'at.inlay.component#bodyTemplate', node } },
  ])) };
}
function chainView(length: number) {
  return templateView(Array.from({ length }, (_, i) => i === length - 1 ? 'done' : { $: '$', type: `test.atseq.component${i + 1}`, props: {} }));
}
export const boundaryCases: [string, () => unknown][] = [
  ['engine evaluation nesting exact boundary', async () => {
    equal((await evaluate(Array(64).fill('1').join('+'), {})).value, 64);
    await rejects(() => evaluate(Array(65).fill('1').join('+'), {}), 'evaluation_depth');
  }],
  ['engine sequence exact boundary', async () => {
    equal(((await evaluate('$append(a,b)', { a: Array(8192).fill(1), b: Array(8192).fill(1) })).value as unknown[]).length, 16384);
    await rejects(() => evaluate('$append(a,b)', { a: Array(8192).fill(1), b: Array(8193).fill(1) }), 'sequence_limit');
  }],
  ['AST container count exact boundary in unevaluated branch', async () => {
    const source = (n: number) => `false ? [${Array(n).fill(1).join(',')}] : 1`;
    equal((await evaluate(source(4091), {})).value, 1);
    await rejects(() => evaluate(source(4092), {}), 'source_complexity');
  }],
  ['AST container depth exact boundary', async () => {
    await evaluate('['.repeat(32) + '1' + ']'.repeat(32), {});
    await rejects(() => evaluate('['.repeat(33) + '1' + ']'.repeat(33), {}), 'source_complexity');
  }],
  ['encoded-byte work budget exact boundary', async () => {
    // Repeated string scans dominate work, while the returned value stays tiny.
    const source = '($a:=s; rows.$length($a); p; 1)';
    const input = { s: 'x'.repeat(250380), rows: Array(64).fill(1), p: 'x'.repeat(325) };
    equal((await evaluate(source, input)).inspectedBytes, 16777216);
    await rejects(() => evaluate(source, { ...input, p: input.p + 'x' }), 'inspection_budget');
  }],
  ['large repeated intermediate strings exhaust byte budget', () => rejects(() => evaluate('($a:=s&s&s;$count(state.rows.$a))', { s: 'x'.repeat(200000), state: { rows: Array(4096).fill(1) } }), 'inspection_budget')],
  ['generated range rejected with stable code', () => rejects(() => evaluate('[1..100000000]', {}), 'unsupported_expression')],
  ['regex rejected with stable code', () => rejects(() => evaluate('/(a+)+$/', {}), 'unsupported_expression')],
  ['Unicode casing is outside the portable profile', async () => {
    for (const name of ['lowercase', 'uppercase']) await rejects(() => evaluate(`$${name}("İß")`, {}), 'unsupported_function');
  }],
  ['absent expression result is explicit', () => rejects(() => evaluate('missing', {}), 'absent_result')],
  ['negative zero input is not a wire integer', () => rejects(() => evaluate('$', { value: -0 }), 'wire_number')],
  ['malformed Unicode object key is rejected', () => rejects(() => evaluate('$', { ['\ud800']: 1 }), 'unicode')],
  ['fold input state exact byte cap', async () => {
    const state = { s: 'x'.repeat(131072 - 8) };
    const source = '{"decision":"ineffective","reason":"sample"}';
    await fold(source, { meta: {}, act: {}, state });
    await rejects(() => fold(source, { meta: {}, act: {}, state: { s: state.s + 'x' } }), 'value_bytes');
  }],
  ['fold successor state exact byte cap', async () => {
    const input = { meta: {}, act: {}, state: { s: 'x'.repeat(131072 - 8) } };
    await fold('{"decision":"effective","state":state}', input);
    await rejects(() => fold('{"decision":"effective","state":{"s":state.s & "x"}}', input), 'value_bytes');
  }],
  ['ineffective reason length and syntax', async () => {
    const run = (reason: string) => fold('{"decision":"ineffective","reason":act.reason}', { meta: {}, state: {}, act: { reason } });
    await run('a'.repeat(64)); await run('a_09');
    for (const reason of ['', 'A', '_a', 'has space', 'a-b', 'a\n', 'a'.repeat(65)]) await rejects(() => run(reason), 'fold_output');
  }],
  ['ineffective message must be a string', async () => {
    await fold('{"decision":"ineffective","reason":"sample","message":""}', { meta: {}, act: {}, state: {} });
    await rejects(() => fold('{"decision":"ineffective","reason":"sample","message":1}', { meta: {}, act: {}, state: {} }), 'fold_output');
  }],
  ['duplicate schema IDs rejected before validation', () => rejects(() => new Schemas([...totalsSchemas, ...totalsSchemas]), 'invalid_schema')],
  ['open union rejected at admission', () => {
    const docs = structuredClone(offersSchemas);
    (docs[0] as any).defs.offer.properties.availability.closed = false;
    return rejects(() => new Schemas(docs), 'unsupported_schema');
  }],
  ['inherited type names are ordinary unsupported schemas', async () => {
    for (const type of ['constructor', '__proto__']) await rejects(() => new Schemas([{ lexicon: 1, id: 'test.atseq.example', defs: { main: { type } } }]), 'unsupported_schema');
  }],
  ['native grapheme constraints rejected at admission', async () => {
    for (const constraint of ['minGraphemes', 'maxGraphemes']) await rejects(() => new Schemas([{ lexicon: 1, id: 'test.atseq.example', defs: { main: { type: 'string', [constraint]: 1 } } }]), 'unsupported_schema');
  }],
  ['Inlay source bytes exact boundary', async () => {
    const view = templateView(['']);
    const record = Object.values(view.records)[0] as any;
    record.body.node = 'x'.repeat(524288 - new TextEncoder().encode(canonicalJson(view)).length);
    await resolveView(view, {}); record.body.node += 'x';
    await rejects(() => resolveView(view, {}), 'value_bytes');
  }],
  ['Inlay source record count exact boundary', async () => {
    await resolveView(templateView(Array(64).fill('done')), {});
    await rejects(() => resolveView(templateView(Array(65).fill('done')), {}), 'view_limit');
  }],
  ['Inlay expanded node count exact boundary', async () => {
    equal((await resolveView(templateView([Array(2046).fill('x')]), {})).length, 2046);
    await rejects(() => resolveView(templateView([Array(2047).fill('x')]), {}), 'view_limit');
  }],
  ['Inlay expansion depth exact boundary', async () => {
    equal((await resolveView(chainView(24), {}))[0], 'done');
    await rejects(() => resolveView(chainView(25), {}), 'view_limit');
  }],
];
