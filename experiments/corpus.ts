import { evaluate, fold } from '../src/runtime/evaluator.ts';
import { canonicalJson } from '../src/runtime/values.ts';
import { PROFILE } from '../src/runtime/profile.ts';
import { Schemas } from '../src/definition/schemas.ts';
import { resolveView } from '../src/ui/inlay.ts';
import { totalsSchemas, offersSchemas, totalFold, summaryQuery, baseInput, localView } from './fixtures.ts';

export interface FixtureResult { name: string; passed: boolean; detail?: string }
function equal(actual: unknown, expected: unknown) { if (canonicalJson(actual) !== canonicalJson(expected)) throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`); }
async function rejects(action: () => unknown, code?: string) {
  try { await action(); } catch (error) {
    if (code && (error as any).code !== code) throw error;
    return;
  }
  throw new Error('Expected rejection');
}

/** The exact same authored sources, inputs, and expected results run in both hosts. */
export async function runCorpus(): Promise<FixtureResult[]> {
  const results: FixtureResult[] = [];
  async function check(name: string, test: () => unknown) {
    try { await test(); results.push({ name, passed: true }); }
    catch (error) { results.push({ name, passed: false, detail: `${(error as any).code ?? 'error'}: ${(error as Error).message}` }); }
  }
  await check('effective state fold', async () => equal(await fold(totalFold, baseInput), { decision: 'effective', state: { total: 5 } }));
  await check('ineffective leaves input state unchanged', async () => {
    const input = structuredClone(baseInput); input.act.delta = 0;
    equal(await fold(totalFold, input), { decision: 'ineffective', reason: 'not_positive' }); equal(input.state, { total: 2 });
  });
  await check('pure query', async () => equal((await evaluate(summaryQuery, { params: {}, state: { total: 5 } })).value, { summary: 'Total recorded: 5' }));
  await check('array append and multiplication', async () => equal((await evaluate('{"items":$append(state.items,act.item),"cost":act.price * act.quantity}', { state: { items: ['one'] }, act: { item: 'two', price: 120, quantity: 3 } })).value, { items: ['one', 'two'], cost: 360 }));
  await check('malformed fold output', () => rejects(() => fold('{"decision":"effective"}', baseInput), 'fold_output'));
  await check('ineffective cannot carry state', () => rejects(() => fold('{"decision":"ineffective","reason":"no","state":state}', baseInput), 'fold_output'));
  await check('no floating output', () => rejects(() => evaluate('1/2', {}), 'wire_number'));
  await check('invalid syntax', () => rejects(() => evaluate('({', {}), 'invalid_source'));
  for (const source of ['$now()', '$millis()', '$random()', '$shuffle([1,2])', '$eval("1")', 'function($x){$x}(1)', '($v_f := $now; $v_f())', '[1..100000000]', '/(a+)+$/', '$pad("a",100000000)', '$map([1],function($x){$x})', '$lookup({},"constructor")()']) {
    await check(`forbidden: ${source}`, () => rejects(() => evaluate(source, {})));
  }
  await check('literal ambient-function text is data', async () => equal((await evaluate('"$now() is text"', {})).value, '$now() is text'));
  await check('deterministic work exhaustion', async () => {
    const source = '($v_rows := state.rows; $count($v_rows.($v_rows.(1))))';
    const outcomes: string[] = [];
    for (let i = 0; i < 2; i++) {
      try { await evaluate(source, { state: { rows: Array(400).fill(1) } }); throw new Error('Budget did not fire'); }
      catch (e) { const code = (e as any).code; if (!['step_budget', 'inspection_budget'].includes(code)) throw e; outcomes.push(code); }
    }
    equal(outcomes[0], outcomes[1]);
  });
  await check('program bytes exact cap', async () => { await evaluate('1' + ' '.repeat(PROFILE.programBytes - 1), {}); await rejects(() => evaluate('1' + ' '.repeat(PROFILE.programBytes), {}), 'source_bytes'); });
  await check('action bytes exact cap', async () => {
    const act = { s: 'x'.repeat(PROFILE.actionBytes - 8) };
    await fold('{"decision":"ineffective","reason":"sample"}', { meta: {}, act, state: {} });
    await rejects(() => fold('{"decision":"ineffective","reason":"sample"}', { meta: {}, act: { s: act.s + 'x' }, state: {} }), 'value_bytes');
  });
  await check('complete input bytes exact cap', async () => {
    const input = { s: 'x'.repeat(PROFILE.inputBytes - 8) };
    await evaluate('1', input);
    await rejects(() => evaluate('1', { s: input.s + 'x' }), 'value_bytes');
  });
  await check('query output bytes exact cap', async () => {
    const input = { s: 'x'.repeat(PROFILE.outputBytes / 2 - 1) };
    const result = await evaluate('s & s', input);
    equal(new TextEncoder().encode(canonicalJson(result.value, PROFILE.outputBytes)).length, PROFILE.outputBytes);
    await rejects(() => evaluate('s & s & "x"', input), 'value_bytes');
  });
  await check('source complexity rejected before evaluation', () => rejects(() => evaluate('['.repeat(40) + '1' + ']'.repeat(40), {}), 'source_complexity'));
  await check('intermediate growth is bounded', () => rejects(() => evaluate('($a:=s&s; $b:=$a&$a; $c:=$b&$b; 1)', { s: 'x'.repeat(150_000) }), 'value_bytes'));
  await check('ordinary JSONata locals need no custom naming', async () => equal((await evaluate('($amount:=act.delta; $amount * state.total)', baseInput)).value, 6));
  await check('built-in callable cannot be replaced', () => rejects(() => evaluate('($sum:=1; $sum([1]))', {}), 'unsupported_variable'));
  await check('state bytes exact cap', () => { const state = { s: 'x'.repeat(PROFILE.stateBytes - 8) }; equal(new TextEncoder().encode(canonicalJson(state, PROFILE.stateBytes)).length, PROFILE.stateBytes); return rejects(() => canonicalJson({ s: state.s + 'x' }, PROFILE.stateBytes), 'value_bytes'); });
  await check('input depth exact cap', async () => { let value: any = 1; for (let i = 0; i < PROFILE.inputDepth; i++) value = [value]; canonicalJson(value); await rejects(() => canonicalJson([value]), 'value_depth'); });
  await check('safe integer boundaries', async () => { equal((await evaluate('$', { high: Number.MAX_SAFE_INTEGER, low: Number.MIN_SAFE_INTEGER })).value, { high: Number.MAX_SAFE_INTEGER, low: Number.MIN_SAFE_INTEGER }); await rejects(() => evaluate('$', { bad: Number.MAX_SAFE_INTEGER + 1 }), 'wire_number'); });
  await check('null, absent, extras, array order preserved', async () => { const value = { nil: null, extra: { values: [2, 1] } }; equal((await evaluate('$', value)).value, value); });
  await check('prototype and invalid Unicode refused', async () => { await rejects(() => evaluate('$', JSON.parse('{"__proto__":1}')), 'reserved_key'); await rejects(() => evaluate('$', '\ud800'), 'unicode'); });
  const totals = new Schemas(totalsSchemas);
  await check('runtime-loaded state schema', () => { totals.validate('test.atseq.totals', { total: 3, extra: 'retained' }); });
  await check('runtime-loaded query contract', () => { totals.queryParams('test.atseq.totals#summary', {}); totals.queryResult('test.atseq.totals#summary', { summary: 'three' }); });
  await check('domain type validation does not coerce', () => rejects(() => totals.validate('test.atseq.totals', { total: '3' }), 'schema_value'));
  await check('query output validated', () => rejects(() => totals.queryResult('test.atseq.totals#summary', { summary: 3 }), 'schema_value'));
  await check('second bundle: nested refs, arrays and closed union', () => {
    const offers = new Schemas(offersSchemas);
    offers.validate('test.atseq.offers', { offers: [{ name: 'Sam', note: null, availability: { $type: 'test.atseq.availability#weekend', day: 'Saturday' } }, { name: 'Alex', availability: { $type: 'test.atseq.availability#weekday', hours: [9, 15] } }] });
  });
  await check('closed union rejects unknown member', () => rejects(() => new Schemas(offersSchemas).validate('test.atseq.offers', { offers: [{ name: 'Sam', availability: { $type: 'test.atseq.availability#unknown' } }] }), 'schema_value'));
  await check('optional does not mean nullable', () => rejects(() => totals.validate('test.atseq.totals', { total: null }), 'schema_value'));
  await check('missing ref fails before data use', () => { const docs = structuredClone(offersSchemas); (docs[0] as any).defs.offer.properties.availability.refs.push('test.missing.defs#entry'); return rejects(() => new Schemas(docs), 'invalid_schema'); });
  await check('defaulting rejected at source admission', () => { const docs = structuredClone(totalsSchemas); (docs[0] as any).defs.main.properties.total.default = 0; return rejects(() => new Schemas(docs), 'unsupported_schema'); });
  await check('schema closure bytes exact cap', async () => {
    const docs: any[] = structuredClone(totalsSchemas); docs[0].description = '';
    const overhead = new TextEncoder().encode(canonicalJson(docs)).length;
    docs[0].description = 'x'.repeat(PROFILE.definitionBytes - overhead);
    new Schemas(docs); docs[0].description += 'x';
    await rejects(() => new Schemas(docs), 'value_bytes');
  });
  await check('schema file count exact cap', async () => {
    const docs = Array.from({ length: 64 }, (_, i) => ({ lexicon: 1, id: `test.atseq.schema${i}`, defs: { main: { type: 'object', properties: {} } } }));
    new Schemas(docs); docs.push({ ...docs[0]!, id: 'test.atseq.extra' });
    await rejects(() => new Schemas(docs), 'schema_count');
  });
  await check('Inlay local template and query binding', async () => {
    const nodes = await resolveView(localView(), { summary: 'Total: 5' });
    equal(nodes, [{ type: 'test.atseq.ui.Panel', props: {}, children: [{ type: 'test.atseq.ui.Text', props: {}, children: ['Total: 5'] }, { type: 'test.atseq.ui.Action', props: { action: 'add', label: 'Record amount' }, children: [] }] }]);
  });
  await check('Inlay absent component fails explicitly', () => { const view = localView(); delete view.records[`at://${view.imports[0]}/at.inlay.component/test.atseq.ui.Action`]; return rejects(() => resolveView(view, { summary: 'x' })); });
  await check('Inlay external body refused without I/O', () => { const view = localView(); (Object.values(view.records).at(-1) as any).body = { $type: 'at.inlay.component#bodyExternal', uri: 'https://example.test' }; return rejects(() => resolveView(view, {}), 'external_view'); });
  await check('Inlay cannot access signing scope', () => { const view = localView(); const record = Object.values(view.records).at(-1) as any; record.body.node.props.children[0].props.children[0].props.path = ['props', 'signingKey']; return rejects(() => resolveView(view, { summary: 'x' })); });
  await check('Inlay auto-submit property refused', () => { const view = localView(); const record = Object.values(view.records).at(-1) as any; record.body.node.props.children[1].props.autoSubmit = true; return rejects(() => resolveView(view, { summary: 'x' }), 'view_props'); });
  return results;
}
