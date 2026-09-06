import { P256PrivateKeyExportable } from '@atcute/crypto';
import { create, fromString, toString, CODEC_RAW } from '@atcute/cid';
import { writeCarStream } from '@atcute/car';
import { chartFixture, guitarFixture } from '../testdata/apps/fixtures.ts';
import { Anchor, headAt, randomNonce, sequence, signIntent, type Entry, type Intent } from '../src/protocol/log.ts';
import { applicationRuntimeCid as runtimeCid } from '../src/runtime/identity.ts';
import { contentCid, encodeBlock, link } from '../src/protocol/wire.ts';
import { LoadedDefinition } from '../src/definition/load.ts';
import { SourceBundle, type SourceReader } from '../src/definition/source.ts';
import { Folder, type Projection } from '../src/runtime/folder.ts';
import { Applications } from '../src/runtime/apps.ts';
import { canonicalJson, type Json } from '../src/runtime/values.ts';
import { PROFILE } from '../src/runtime/profile.ts';
import type { FixtureResult } from './corpus.ts';

const text = (s: string) => new TextEncoder().encode(s);
const json = (value: unknown) => text(JSON.stringify(value));
function equal(a: unknown, b: unknown) { if (a === b) return; if (canonicalJson(a, 2 ** 24) !== canonicalJson(b, 2 ** 24)) throw new Error(`Values differ: ${JSON.stringify(a)} / ${JSON.stringify(b)}`); }
async function rejects(run: () => unknown, code: string) {
  try { await run(); } catch (error) { if ((error as any)?.code === code) return; throw error; }
  throw new Error(`Expected ${code}`);
}
export async function fixtureApp(bundle: SourceBundle, app = 'did:plc:cccccccccccccccccccccccc') {
  const actor = await P256PrivateKeyExportable.createKeypair(), writer = await P256PrivateKeyExportable.createKeypair();
  const genesis = { $type: 'test.atseq.genesis', version: 0, app, profile: link(await runtimeCid()), definition: link(bundle.root), sequencerKey: await writer.exportPublicKey('did'), activationKeys: [await actor.exportPublicKey('did')] };
  const anchor = await Anchor.from(genesis, await contentCid(genesis));
  return { actor, writer, anchor, bundle };
}
export async function fixtureHistory(app: Awaited<ReturnType<typeof fixtureApp>>, acts: { action: string; payload: Record<string, Json>; definition?: string }[]) {
  let head = headAt(app.anchor); const entries: Entry[] = [];
  for (const act of acts) {
    const intent: Intent = { $type: 'test.atseq.defs#intent', version: 0, app: app.anchor.genesis.app, genesis: link(app.anchor.cid), definition: link(act.definition ?? app.bundle.root), actorKey: await app.actor.exportPublicKey('did'), nonce: randomNonce(), action: act.action, payload: act.payload };
    const entry = await sequence(await signIntent(intent, app.actor), app.anchor, head, app.writer);
    entries.push(entry); head = headAt(app.anchor, entry.position, await contentCid(entry));
  }
  return { head, entries };
}

export async function runRuntimeCorpus(): Promise<FixtureResult[]> {
  const results: FixtureResult[] = [];
  const check = async (name: string, run: () => unknown) => {
    try { await run(); results.push({ name, passed: true }); }
    catch (error) { results.push({ name, passed: false, detail: `${(error as any)?.code ?? 'error'}: ${(error as Error).message}` }); }
  };
  const chart = await chartFixture(), guitar = await guitarFixture();
  const app = await fixtureApp(chart.bundle);
  const acts = [{ action: chart.action, payload: { day: 'Monday', millimetres: 3 } }, { action: chart.action, payload: { day: 'Tuesday', millimetres: 4 } }];
  const history = await fixtureHistory(app, acts);
  const repack = (change: { manifest?: Record<string, unknown>; files?: Record<string, Uint8Array> }) => SourceBundle.pack({ ...chart.manifest, ...change.manifest }, { ...chart.files, ...change.files });
  const load = async (bundle: SourceBundle) => LoadedDefinition.load(bundle.root, bundle);
  await check('CAR round trip owns exact source bytes', async () => {
    const raw = await chart.bundle.write(), bundle = await SourceBundle.read(raw); raw.fill(0);
    equal(bundle.root, chart.bundle.root); equal([...await bundle.get(bundle.root)], [...await chart.bundle.get(chart.bundle.root)]);
  });
  await check('two unrelated definitions resolve schemas and retained views', async () => {
    for (const fixture of [chart, guitar]) {
      const definition = await load(fixture.bundle);
      equal(definition.manifest.actions[0]!.ref, fixture.action);
      const view = await definition.view('main', { count: 2 }); equal(view.length, 1);
    }
  });
  await check('initial state comes only from the pinned definition', async () => {
    const folder = await Folder.open(app.anchor, chart.bundle);
    equal(folder.snapshot().projection.state, { readings: [] }); equal(folder.snapshot().projection.frontier.position, 0);
  });
  await check('fold and query match independently specified values', async () => {
    const folder = await Folder.open(app.anchor, chart.bundle); await folder.catchUp(history.head, [...history.entries].reverse());
    equal(folder.snapshot().projection.state, { readings: [{ day: 'Monday', millimetres: 3 }, { day: 'Tuesday', millimetres: 4 }] });
    equal(folder.snapshot().projection.outcomes.map(x => x.outcome.$type), ['test.atseq.defs#effective', 'test.atseq.defs#effective']);
    const query = await folder.query('summary', {}); equal(query.result, { $type: 'test.atseq.defs#queryAvailable', value: { count: 2, total: 7 } }); equal(query.frontier.position, 2);
  });
  for (const [label, action, payload, definition, reason] of [
    ['malformed domain input', chart.action, { day: 'Monday', millimetres: 'wet' }, undefined, 'invalid_action'],
    ['unknown action', 'test.other.data#record', { day: 'Monday', millimetres: 3 }, undefined, 'unknown_action'],
    ['old definition intent', chart.action, { day: 'Monday', millimetres: 3 }, app.anchor.cid, 'definition_changed'],
  ] as const) await check(`${label} is retained ineffective`, async () => {
    const log = await fixtureHistory(app, [{ action, payload, ...(definition ? { definition } : {}) }]);
    const folder = await Folder.open(app.anchor, chart.bundle); const result = await folder.catchUp(log.head, log.entries);
    equal(result.projection.state, { readings: [] }); equal(result.projection.frontier.position, 1);
    equal(result.projection.outcomes[0]!.outcome, { $type: 'test.atseq.defs#ineffective', reason });
  });
  await check('domain refusal preserves complete prior state', async () => {
    const guitarApp = await fixtureApp(guitar.bundle, 'did:plc:dddddddddddddddddddddddd');
    const candidate = { action: guitar.action, payload: { id: 'a', title: 'Example guitar', pricePence: 12000 } };
    const log = await fixtureHistory(guitarApp, [candidate, candidate]);
    const folder = await Folder.open(guitarApp.anchor, guitar.bundle); const result = await folder.catchUp(log.head, log.entries);
    equal(result.projection.state, { candidates: [candidate.payload], selected: '' });
    equal(result.projection.outcomes[1]!.outcome, { $type: 'test.atseq.defs#ineffective', reason: 'already_listed' });
  });
  await check('restarting and replaying reproduces state outcomes and frontier', async () => {
    const first = await Folder.open(app.anchor, chart.bundle), rebuilt = await Folder.open(app.anchor, await SourceBundle.read(await chart.bundle.write()));
    equal(await first.catchUp(history.head, history.entries), await rebuilt.catchUp(history.head, history.entries));
  });
  await check('failed persistence advances neither state outcomes nor frontier', async () => {
    let failSecond = true, stored: Projection | undefined;
    const folder = await Folder.open(app.anchor, chart.bundle, async p => { if (p.frontier.position === 2 && failSecond) throw new Error('Injected cache write failure'); stored = p; });
    const result = await folder.catchUp(history.head, history.entries);
    equal(result.head.position, 2); equal(result.stalled?.position, 2); equal(result.projection.frontier.position, 1);
    equal(result.projection.outcomes.length, 1); equal(stored, result.projection);
    failSecond = false; const resumed = await folder.catchUp(history.head, history.entries);
    equal(resumed.projection.frontier.position, 2); equal(resumed.stalled, undefined);
  });
  await check('query captures its prefix before concurrent catch-up', async () => {
    const folder = await Folder.open(app.anchor, chart.bundle);
    await folder.catchUp(headAt(app.anchor, 1, await contentCid(history.entries[0])), history.entries.slice(0, 1));
    const query = folder.query('summary', {}); const advanced = folder.catchUp(history.head, history.entries);
    equal((await query).frontier.position, 1); await advanced; equal(folder.snapshot().projection.frontier.position, 2);
  });
  for (const [label, source, code] of [
    ['malformed fold result', '{"decision":"effective","state":{},"extra":true}', 'fold_output'],
    ['invalid successor schema', '{"decision":"effective","state":{}}', 'schema_value'],
    ['ineffective successor state', '{"decision":"ineffective","reason":"no","state":{}}', 'fold_output'],
    ['noninteger computed state', 'act.millimetres > 0 ? {"decision":"effective","state":{"readings":[{"day":"Monday","millimetres":1/2}]}} : {"decision":"effective","state":{"readings":[]}}', 'wire_number'],
  ]) await check(`${label} stalls without an invented outcome`, async () => {
    const bundle = await repack({ files: { 'record.jsonata': text(source!) } }); const target = await fixtureApp(bundle);
    const log = await fixtureHistory(target, acts.slice(0, 1)); const folder = await Folder.open(target.anchor, bundle);
    const result = await folder.catchUp(log.head, log.entries);
    equal(result.stalled?.code, code); equal(result.projection.state, { readings: [] }); equal(result.projection.outcomes, []); equal(result.projection.frontier.position, 0);
    equal((await folder.query('summary', {})).frontier.position, 0);
  });
  await check('invalid query output is unavailable at its exact unchanged prefix', async () => {
    const bundle = await repack({ files: { 'summary.jsonata': text('{"count":"wrong","total":0}') } }); const target = await fixtureApp(bundle);
    const folder = await Folder.open(target.anchor, bundle), before = folder.snapshot();
    const result = await folder.query('summary', {}); equal(result.result.$type, 'test.atseq.defs#queryUnavailable'); equal(folder.snapshot(), before);
  });
  await check('caller snapshot mutation cannot change the projection', async () => {
    const folder = await Folder.open(app.anchor, chart.bundle), snapshot = folder.snapshot();
    (snapshot.projection.state as any).readings.push({ day: 'forged', millimetres: 100 });
    equal(folder.snapshot().projection.state, { readings: [] });
  });
  await check('missing source pauses definition loading', async () => {
    const manifest = await load(chart.bundle), missing = manifest.manifest.files[0]!.cid;
    const reader: SourceReader = { get: async cid => { if (cid === missing) throw new Error('Unavailable'); return chart.bundle.get(cid); } };
    await rejects(() => LoadedDefinition.load(chart.bundle.root, reader), 'content_missing');
  });
  await check('tampered source fails its pinned CID', async () => {
    const manifest = await load(chart.bundle), damaged = manifest.manifest.files[0]!.cid;
    const reader: SourceReader = { get: async cid => cid === damaged ? text('tampered') : chart.bundle.get(cid) };
    await rejects(() => LoadedDefinition.load(chart.bundle.root, reader), 'content_corrupt');
  });
  await check('unsupported definition runtime is refused', async () => { await rejects(async () => load(await repack({ manifest: { profile: link(app.anchor.cid) } })), 'unsupported_runtime'); });
  await check('unsupported genesis runtime is refused even with a valid definition', async () => {
    const genesis = { ...app.anchor.genesis, profile: link(app.anchor.cid) };
    const anchor = await Anchor.from(genesis, await contentCid(genesis)); await rejects(() => Folder.open(anchor, chart.bundle), 'unsupported_runtime');
  });
  for (const [label, change, code] of [
    ['unknown binding field', { manifest: { invented: true } }, 'definition_manifest'],
    ['duplicate action binding', { manifest: { actions: [chart.manifest.actions[0], chart.manifest.actions[0]] } }, 'definition_duplicate'],
    ['missing binding schema', { manifest: { actions: [{ ref: 'test.missing.data#action', fold: 'record.jsonata' }] } }, 'definition_binding'],
    ['missing program file', { manifest: { actions: [{ ref: chart.action, fold: 'missing.jsonata' }] } }, 'definition_path'],
    ['escaping source path', { files: { '../outside': text('no') } }, 'definition_path'],
    ['ambient program', { files: { 'record.jsonata': text('$now()') } }, 'unsupported_function'],
    ['invalid program syntax', { files: { 'record.jsonata': text('(') } }, 'invalid_source'],
    ['noninteger program literal', { files: { 'record.jsonata': text('1.5') } }, 'wire_number'],
    ['null initial state', { files: { 'initial.json': text('null') } }, 'schema_value'],
    ['negative zero initial data', { files: { 'initial.json': text('{"readings":[],"number":-0}') } }, 'wire_number'],
  ] as const) await check(`definition refuses ${label}`, async () => { await rejects(async () => load(await repack(change as any)), code); });
  await check('source closure and initial state byte limits are enforced', async () => {
    await rejects(() => SourceBundle.read(new Uint8Array(PROFILE.definitionBytes + 1)), 'definition_size');
    const initial = { readings: [], padding: 'x'.repeat(PROFILE.stateBytes) };
    await rejects(async () => load(await repack({ files: { 'initial.json': json(initial) } })), 'value_bytes');
  });
  await check('exact state and program limits pass and the next byte fails', async () => {
    const initial = { readings: [], padding: '' }; initial.padding = 'x'.repeat(PROFILE.stateBytes - text(canonicalJson(initial)).length);
    equal(text(canonicalJson(initial)).length, PROFILE.stateBytes);
    await load(await repack({ files: { 'initial.json': json(initial) } }));
    initial.padding += 'x';
    await rejects(async () => load(await repack({ files: { 'initial.json': json(initial) } })), 'value_bytes');
    const source = ' '.repeat(PROFILE.programBytes - 1) + '1';
    await load(await repack({ files: { 'record.jsonata': text(source) } }));
    await rejects(async () => load(await repack({ files: { 'record.jsonata': text(source + ' ') } })), 'source_bytes');
  });
  await check('definition counts the manifest within the 64-file limit', async () => {
    const files: Record<string, Uint8Array> = { ...chart.files };
    while (Object.keys(files).length < 63) files[`extra-${Object.keys(files).length}.txt`] = text('same bytes');
    const valid = await SourceBundle.pack(chart.manifest, files); await load(valid);
    files['one-too-many.txt'] = text('same bytes');
    await rejects(async () => load(await SourceBundle.pack(chart.manifest, files)), 'definition_manifest');
  });
  await check('CAR blocks outside the declared closure are refused', async () => {
    const blocks = [];
    for (const cid of chart.bundle.identities()) blocks.push({ cid: fromString(cid).bytes, data: await chart.bundle.get(cid) });
    const data = text('not declared in this definition'), extra = await create(CODEC_RAW, data);
    blocks.push({ cid: extra.bytes, data });
    const chunks = []; for await (const chunk of writeCarStream([{ $link: chart.bundle.root }], blocks)) chunks.push(chunk);
    const bytes = new Uint8Array(chunks.reduce((size, c) => size + c.length, 0)); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const bundle = await SourceBundle.read(bytes); equal(bundle.identities().includes(toString(extra)), true);
    await rejects(() => load(bundle), 'source_car');
  });
  await check('work exhaustion preserves the prior projection and produces no domain verdict', async () => {
    const initial = { readings: [], padding: 'x'.repeat(40_000) };
    const source = `([${Array(30).fill('state').join(',')}]; {"decision":"effective","state":state})`;
    const bundle = await repack({ files: { 'initial.json': json(initial), 'record.jsonata': text(source) } });
    const target = await fixtureApp(bundle), log = await fixtureHistory(target, acts.slice(0, 1));
    const folder = await Folder.open(target.anchor, bundle), result = await folder.catchUp(log.head, log.entries);
    equal(result.stalled?.code, 'value_bytes'); equal(result.projection.state, initial); equal(result.projection.outcomes, []); equal(result.projection.frontier.position, 0);
  });
  await check('oversized action is refused before interpretation', async () => {
    await rejects(() => fixtureHistory(app, [{ action: chart.action, payload: { day: 'Monday', millimetres: 3, padding: 'x'.repeat(PROFILE.actionBytes) } }]), 'payload');
  });
  await check('unsupported schema constructs fail while loading the definition', async () => {
    const schema = JSON.parse(new TextDecoder().decode(chart.files['schemas/data.json'])); schema.defs.record.properties.extra = { type: 'blob' };
    await rejects(async () => load(await repack({ files: { 'schemas/data.json': json(schema) } })), 'unsupported_schema');
  });
  await check('application registry refuses anchor replacement', async () => {
    const apps = new Applications(); await apps.open(app.anchor.genesis, app.anchor.cid, chart.bundle);
    const genesis = { ...app.anchor.genesis, definition: link(guitar.bundle.root) };
    await rejects(async () => apps.open(genesis, await contentCid(genesis), guitar.bundle), 'anchor');
    equal(apps.get(app.anchor.genesis.app, app.anchor.cid).snapshot().projection.state, { readings: [] });
  });
  await check('concurrent anchor replacement cannot persist a conflicting initial state', async () => {
    const apps = new Applications(); let release!: () => void, started!: () => void, writes = 0;
    const gate = new Promise<void>(resolve => { release = resolve; });
    const fetching = new Promise<void>(resolve => { started = resolve; });
    const reader: SourceReader = { get: async cid => { started(); await gate; return chart.bundle.get(cid); } };
    const first = apps.open(app.anchor.genesis, app.anchor.cid, reader, async () => { writes++; });
    try {
      await fetching; const foreign = { ...app.anchor.genesis, definition: link(guitar.bundle.root) };
      await rejects(async () => apps.open(foreign, await contentCid(foreign), guitar.bundle, async () => { writes++; }), 'anchor');
      equal(writes, 0);
    } finally { release(); }
    await first; equal(writes, 1);
  });
  return results;
}
