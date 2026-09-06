import test from 'node:test';
import assert from 'node:assert/strict';
import { P256PrivateKeyExportable } from '@atcute/crypto';
import { guitarEvolution } from '../testdata/apps/evolution.ts';
import { fixtureApp, fixtureHistory } from '../experiments/runtime-corpus.ts';
import { SourceBundle, SourcePool, type SourceReader } from '../src/definition/source.ts';
import { Folder } from '../src/runtime/folder.ts';
import { ACTIVATE } from '../src/definition/control.ts';
import { LoadedDefinition } from '../src/definition/load.ts';
import { compatibleDefinition } from '../src/definition/activation.ts';
import { recordFlowEvidence, type MeasuredCase } from './helpers/evidence.ts';

test('compatible activation preserves its exact interpretation boundary', async t => {
  const results: MeasuredCase[] = [];
  const check = async (name: string, run: () => Promise<void>) => {
    let fault: unknown;
    await t.test(name, async () => { const started = performance.now(); let passed = false; try { await run(); passed = true; } catch (error) { fault = error; throw error; } finally { results.push({ name, passed, elapsedMs: Math.round(performance.now() - started) }); } });
    if (fault) throw fault;
  };
  const next = await guitarEvolution(), old = next.old, app = await fixtureApp(old.bundle);
  const pool = new SourcePool(); await pool.add(old.bundle); await pool.add(next.bundle);
  const payload = { expected: old.bundle.root, definition: next.bundle.root, closure: next.bundle.identities().sort() };
  const candidate = { id: 'one', title: 'Example', pricePence: 12300 };
  const acts = [
    { action: old.action, payload: candidate },
    { action: ACTIVATE, payload },
    { action: next.action, payload: { id: 'one' }, definition: next.bundle.root },
    { action: old.action, payload: { id: 'two', title: 'Late', pricePence: 1000 } },
    { action: ACTIVATE, payload },
  ];
  const log = await fixtureHistory(app, acts), folder = await Folder.open(app.anchor, pool);
  try {
    await check('activation at N preserves state and N+1 uses the new interface', async () => {
      const result = await folder.catchUp(log.head, log.entries);
      assert.equal(result.stalled, undefined); assert.equal(result.projection.definition, next.bundle.root);
      assert.deepEqual(result.projection.state, { candidates: [candidate], selected: 'one' });
      assert.deepEqual(result.projection.outcomes.map(o => o.outcome), [
        { $type: 'test.atseq.defs#effective' }, { $type: 'test.atseq.defs#effective' }, { $type: 'test.atseq.defs#effective' },
        { $type: 'test.atseq.defs#ineffective', reason: 'definition_changed' }, { $type: 'test.atseq.defs#ineffective', reason: 'definition_changed' },
      ]);
      assert.deepEqual((await folder.query('selection', {})).result, { $type: 'test.atseq.defs#queryAvailable', value: { selected: 'one' } });
    });
    await check('a full replay uses each definition at its original boundary', async () => {
      const replay = await Folder.open(app.anchor, pool); await replay.catchUp(log.head, log.entries);
      assert.deepEqual(replay.snapshot().projection, folder.snapshot().projection);
    });
    await check('unavailable candidate pauses at N and resumes the same entry after repair', async () => {
      const available = new SourcePool(); await available.add(old.bundle);
      const replay = await Folder.open(app.anchor, available), before = await replay.catchUp(log.head, log.entries);
      assert.equal(before.stalled?.position, 2); assert.equal(before.stalled?.code, 'content_missing');
      assert.equal(before.projection.frontier.position, 1); assert.equal(before.projection.definition, old.bundle.root);
      assert.deepEqual(before.projection.state, { candidates: [candidate], selected: '' });
      await available.add(next.bundle); await replay.catchUp(log.head, log.entries);
      assert.deepEqual(replay.snapshot().projection, folder.snapshot().projection);
    });
    await check('corrupt candidate content cannot fabricate an invalid-activation verdict', async () => {
      let corrupt = true;
      const reader: SourceReader = { get: async cid => cid === next.bundle.root && corrupt ? new Uint8Array([0]) : pool.get(cid) };
      const replay = await Folder.open(app.anchor, reader); const before = await replay.catchUp(log.head, log.entries);
      assert.equal(before.stalled?.code, 'content_corrupt'); assert.equal(before.projection.outcomes.length, 1);
      corrupt = false; await replay.catchUp(log.head, log.entries); assert.deepEqual(replay.snapshot().projection, folder.snapshot().projection);
    });
    await check('failed persistence leaves both definition and state before activation', async () => {
      let fail = true;
      const replay = await Folder.open(app.anchor, pool, async p => { if (p.frontier.position === 2 && fail) throw new Error('Fixture disk failure'); });
      const before = await replay.catchUp(log.head, log.entries); assert.equal(before.projection.frontier.position, 1);
      assert.equal(replay.activeDefinition().cid, old.bundle.root);
      fail = false; await replay.catchUp(log.head, log.entries); assert.deepEqual(replay.snapshot().projection, folder.snapshot().projection);
    });
    await check('another actor cannot activate or force a missing-content fetch', async () => {
      const attacker = await P256PrivateKeyExportable.createKeypair();
      const history = await fixtureHistory({ ...app, actor: attacker }, [{ action: ACTIVATE, payload }]);
      const replay = await Folder.open(app.anchor, old.bundle); const result = await replay.catchUp(history.head, history.entries);
      assert.equal(result.stalled, undefined); assert.equal(result.projection.definition, old.bundle.root);
      assert.deepEqual(result.projection.outcomes[0]!.outcome, { $type: 'test.atseq.defs#ineffective', reason: 'unauthorized_activation' });
    });
    await check('available invalid candidate code is retained ineffective', async () => {
      const invalid = await SourceBundle.pack(next.manifest, { ...next.files, 'select.jsonata': new TextEncoder().encode('$eval("true")') });
      const available = new SourcePool(); await available.add(old.bundle); await available.add(invalid);
      const history = await fixtureHistory(app, [{ action: ACTIVATE, payload: { expected: old.bundle.root, definition: invalid.root, closure: invalid.identities().sort() } }]);
      const result = await (await Folder.open(app.anchor, available)).catchUp(history.head, history.entries);
      assert.equal(result.stalled, undefined); assert.equal(result.projection.definition, old.bundle.root);
      assert.deepEqual(result.projection.outcomes[0]!.outcome, { $type: 'test.atseq.defs#ineffective', reason: 'invalid_activation' });
    });
    await check('state compatibility includes transitive schemas and ignores unrelated additions', async () => {
      const current = await LoadedDefinition.load(old.bundle.root, old.bundle), candidate = await LoadedDefinition.load(next.bundle.root, next.bundle);
      compatibleDefinition(current, candidate, current.initialState);
      const changed = JSON.parse(new TextDecoder().decode(next.files['schemas/data.json'])); changed.defs.state.properties.selected.maxLength = 119;
      const incompatible = await SourceBundle.pack(next.manifest, { ...next.files, 'schemas/data.json': new TextEncoder().encode(JSON.stringify(changed)) });
      const available = new SourcePool(); await available.add(old.bundle); await available.add(incompatible);
      const history = await fixtureHistory(app, [{ action: ACTIVATE, payload: { expected: old.bundle.root, definition: incompatible.root, closure: incompatible.identities().sort() } }]);
      const result = await (await Folder.open(app.anchor, available)).catchUp(history.head, history.entries);
      assert.deepEqual(result.projection.outcomes[0]!.outcome, { $type: 'test.atseq.defs#ineffective', reason: 'incompatible_definition' });
      const refOld = JSON.parse(new TextDecoder().decode(old.files['schemas/data.json']));
      refOld.defs.selectionValue = refOld.defs.state.properties.selected;
      refOld.defs.state.properties.selected = { type: 'ref', ref: '#selectionValue' };
      const refNew = structuredClone(refOld); refNew.defs.selectionValue.maxLength = 119;
      const beforeBundle = await SourceBundle.pack(old.manifest, { ...old.files, 'schemas/data.json': new TextEncoder().encode(JSON.stringify(refOld)) });
      const afterBundle = await SourceBundle.pack(old.manifest, { ...old.files, 'schemas/data.json': new TextEncoder().encode(JSON.stringify(refNew)) });
      const before = await LoadedDefinition.load(beforeBundle.root, beforeBundle), after = await LoadedDefinition.load(afterBundle.root, afterBundle);
      assert.throws(() => compatibleDefinition(before, after, before.initialState), { code: 'incompatible_definition' });
    });
    await check('malformed closure and control-action rebinding are refused', async () => {
      const history = await fixtureHistory(app, [{ action: ACTIVATE, payload: { ...payload, closure: [...payload.closure].reverse() } }]);
      const result = await (await Folder.open(app.anchor, pool)).catchUp(history.head, history.entries);
      assert.deepEqual(result.projection.outcomes[0]!.outcome, { $type: 'test.atseq.defs#ineffective', reason: 'invalid_activation' });
      const rebound = await SourceBundle.pack({ ...next.manifest, actions: [{ ref: ACTIVATE, fold: 'select.jsonata' }] }, next.files);
      await assert.rejects(() => LoadedDefinition.load(rebound.root, rebound), { code: 'definition_binding' });
    });
  } finally { await recordFlowEvidence('evolution-runtime', results, { expectedCases: 9 }); }
});
