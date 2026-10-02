/** Genuine public-owner cases shared by source, actual emitted modules and Chrome. */
import { canonicalJson } from '../../src/core/values.ts';
import { AtseqError } from '../../src/core/errors.ts';
import {
  openNativeApplication,
  type NativeActorDiscovery,
  type NativeActorSimulation,
} from '../../src/application/native-authority.ts';
import { NativeAnchor } from '../../src/protocol/native-wire.ts';
import { authenticateRepo } from '../../src/protocol/native-proof.ts';
import { contentCid } from '../../src/protocol/wire.ts';
import { checkpointPayloadIdentity } from '../../src/protocol/checkpoint-data.ts';
import { checkpointAuthorityData } from '../../src/application/checkpoint-authority-data.ts';
import {
  stageNativePrefix,
  acceptNativePrefix,
  nativePrefixStatus,
  nativePrefixMethod,
  nativePrefixProvenance,
} from '../../src/application/native-prefix.ts';
import type { ApplicationFixture } from './native-application-fixture.ts';
import type { DiscoveryFixture } from './native-discovery-fixture.ts';

export function discoveryAssert(value: unknown, detail: string): asserts value {
  if (!value) throw new Error(detail);
}
export function discoveryEqual(actual: unknown, expected: unknown, detail: string) {
  discoveryAssert(canonicalJson(actual, 32 * 1024 * 1024) === canonicalJson(expected, 32 * 1024 * 1024), detail);
}
export async function discoveryContext(
  fixture: ApplicationFixture,
  through: number,
  options: {
    persist?: Parameters<typeof openNativeApplication>[0]['persist'];
    sourceFault?: (cid: string) => void;
  } = {},
) {
  const anchor = await NativeAnchor.from(fixture.genesis, { app: fixture.genesis.app, genesis: fixture.genesisCid });
  const source = new Map(fixture.sourceBlocks.map(([cid, raw]) => [cid, new Uint8Array(raw)]));
  const retained = new Map(fixture.retainedContent.map(([cid, raw]) => [cid, new Uint8Array(raw)]));
  const reads: string[] = [];
  const app = await openNativeApplication({
    anchor,
    persist: options.persist,
    sourceReader: {
      async get(cid) {
        reads.push(cid);
        options.sourceFault?.(cid);
        const raw = source.get(cid);
        if (!raw) throw new AtseqError('content_unavailable', 'Missing discovery test source');
        return new Uint8Array(raw);
      },
    },
  });
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
      appIdentity: { before: evidence, after: evidence },
      reader: {
        async get(cid: string) {
          reads.push(cid);
          const raw = retained.get(cid);
          if (!raw) throw new AtseqError('content_unavailable', 'Missing discovery test evidence');
          return new Uint8Array(raw);
        },
      },
    })),
  );
  for (let i = 0; i < through; i++) {
    const result = await app.process(inputs[i]!);
    discoveryEqual(result.outcome, fixture.vectors[i]!.expected.outcomes.at(-1)!.outcome, 'Genuine replay outcome');
  }
  if (through)
    discoveryEqual(app.snapshot(), fixture.vectors[through - 1]!.expected, 'Exact genuine replay projection');
  return { app, anchor, inputs, reads };
}
function available(
  result: NativeActorDiscovery,
): asserts result is Extract<NativeActorDiscovery, { kind: 'available' }> {
  discoveryAssert(result.kind === 'available', 'Expected complete discovery: ' + canonicalJson(result));
}
function simulation(
  result: NativeActorSimulation,
): asserts result is Extract<NativeActorSimulation, { kind: 'available' }> {
  discoveryAssert(result.kind === 'available', 'Expected complete simulation: ' + canonicalJson(result));
}
export async function nativeDiscoveryCorpus(f: DiscoveryFixture, original: ApplicationFixture) {
  const cases: { id: string; name: string; actual: unknown }[] = [];
  async function check(id: string, name: string, run: () => unknown | Promise<unknown>) {
    cases.push({ id, name, actual: await run() });
  }
  const fresh = (stage: string) => discoveryContext(f.application, f.stages[stage]!);
  const act = f.actions.act.ref,
    edit = f.actions.edit.ref;
  const selected = (result: NativeActorDiscovery, name = act) => {
    available(result);
    const row = result.actions.find((r) => r.action === name)!;
    discoveryAssert(row, 'Declared action row missing');
    return row;
  };
  await check('K1-01', 'owned selector and payload survive immediate caller mutation', async () => {
    const c = await fresh('lowerAdmitted'),
      subject = structuredClone(f.subjects.alice),
      payload = { amount: 2, version: 1 };
    const pending = c.app.simulate(subject, act, payload);
    subject.principal = f.subjects.bob.principal;
    payload.amount = 10;
    const result = await pending;
    simulation(result);
    discoveryEqual(result.subject, f.subjects.alice, 'Selector ownership');
    discoveryAssert(result.payload === (await contentCid({ amount: 2, version: 1 })), 'Exact original payload CID');
    discoveryEqual(result.successor, { ...f.initialState, count: 2, version: 2 }, 'Owned payload fold');
    return result;
  });
  await check('K1-02', 'snapshots and caller permission fields cannot authorize', async () => {
    const c = await fresh('lowerAdmitted');
    const results = [];
    for (const selector of [
      c.app.snapshot(),
      { principal: f.subjects.alice.principal },
      { ...f.subjects.alice, role: 'editor' },
      { ...f.subjects.alice, authority: c.app.snapshot().authority },
      { ...f.subjects.alice, allow: true },
      { grantId: f.grants.lowerAdmitted!.id },
    ]) {
      const result = await c.app.discover(selector);
      discoveryAssert(result.kind === 'unavailable', 'No input permission fields');
      results.push(result);
    }
    return results;
  });
  await check('K1-03', 'genuine genesis has external pin and no repository publication', async () => {
    const c = await fresh('genesis'),
      result = await c.app.discover(f.subjects.alice);
    available(result);
    discoveryAssert(
      result.basis.publication === null && result.basis.publicationMethod === null,
      'No fabricated genesis publication',
    );
    discoveryAssert(result.basis.frontier.position === 0 && result.basis.nextPosition === 1, 'Genesis frontier');
    discoveryAssert(
      result.actions.every((r) => r.kind === 'denied' && r.reason === 'grant_unadmitted'),
      'Genesis denial',
    );
    return result;
  });
  await check('K1-04', 'a genuine retained ordering tail is distinct from interpreted frontier', async () => {
    let unavailable = false;
    const target = (original.vectors[17]!.entry.request as any).intent.operation.definition.$link;
    const c = await discoveryContext(original, 17, {
      sourceFault(cid) {
        if (unavailable && cid === target)
          throw new AtseqError('content_unavailable', 'Actual retained tail source miss');
      },
    });
    const signed = original.vectors[2]!.entry.request as any;
    const subject = { principal: signed.intent.principal, actorKey: signed.intent.actorKey };
    const before = await c.app.discover(subject);
    available(before);
    unavailable = true;
    let error: unknown;
    try {
      await c.app.process(c.inputs[17]!);
    } catch (caught) {
      error = caught;
    }
    discoveryAssert(error instanceof AtseqError && error.code === 'content_unavailable', 'Actual source miss');
    const after = await c.app.discover(subject);
    available(after);
    discoveryAssert(
      after.basis.frontier.position === 17 &&
        after.basis.publication!.head.position === 18 &&
        after.basis.nextPosition === 18,
      'Simulated position is frontier+1, not append head+1',
    );
    discoveryAssert(
      after.work.memo === 'computed' &&
        before.basis.state === after.basis.state &&
        before.basis.authority === after.basis.authority,
      'Prefix-only genuine generation is cold',
    );
    return { before, after };
  });
  await check('K1-06', 'selected-root method accessor uses genuine current view, not historical row', async () => {
    const c = await fresh('scope63'),
      prior = c.app.prefix()!;
    const appRepo = await authenticateRepo({
      carBytes: new Uint8Array(f.unchangedHeadCar),
      expectedDid: f.application.genesis.app,
      trustedSigningKeyDid: f.application.appKey,
    });
    const evidence = {
      assuranceClass: 'plc-audit-v1' as const,
      auditBytes: new Uint8Array(f.application.appIdentity.auditBytes),
      selectedTipCid: f.application.appIdentity.selectedTipCid,
    };
    const content = new Map(f.application.retainedContent.map(([cid, raw]) => [cid, new Uint8Array(raw)]));
    const next = acceptNativePrefix(
      prior,
      await stageNativePrefix(prior, {
        anchor: c.anchor,
        appRepo,
        appIdentity: { before: evidence, after: evidence },
        reader: {
          async get(cid) {
            const raw = content.get(cid);
            if (!raw) throw new AtseqError('content_unavailable', 'Missing method fixture');
            return raw;
          },
        },
      }),
    );
    const selected = nativePrefixStatus(next),
      original = nativePrefixProvenance(next, selected.head.position),
      method = nativePrefixMethod(next);
    discoveryAssert(
      selected.root !== original.root && selected.head.position === f.application.vectors.length,
      'Genuine unchanged-head root differs from historical entry root',
    );
    discoveryEqual(
      method,
      { assuranceClass: 'plc-audit-v1', policy: f.application.genesis.observationPolicy.$link },
      'Selected view method facts',
    );
    return {
      selected,
      originalRoot: original.root,
      method,
      limitation: 'Pure prefix accessor; coordinator root-only ingestion is outside current kernel',
    };
  });
  await check('K2-01', 'later admitted lower ID beats earlier admitted higher ID', async () => {
    const before = await fresh('higherAdmitted'),
      after = await fresh('lowerAdmitted');
    const a = await before.app.discover(f.subjects.alice),
      b = await after.app.discover(f.subjects.alice);
    const aa = selected(a),
      bb = selected(b);
    discoveryAssert(aa.kind === 'eligible' && aa.grant.id === f.grants.higherAdmitted!.id, 'Higher ID initially');
    discoveryAssert(bb.kind === 'eligible' && bb.grant.id === f.grants.lowerAdmitted!.id, 'Lower bytewise ID later');
    return { before: a, after: b };
  });
  await check('K2-02', 'shared grant reasons and later eligible candidate', async () => {
    const c = await fresh('lowerAdmitted'),
      results = [];
    for (const [name, reason] of [
      ['revokedGrantAdmitted', 'grant_revoked'],
      ['oldEpoch', 'grant_epoch'],
      ['wrongSigner', 'grant_signer'],
      ['outOfScope', 'grant_scope'],
    ] as const) {
      const result = await c.app.discover({ ...f.subjects.alice, grantId: f.grants[name]!.id });
      const row = selected(result);
      discoveryAssert(row.kind === 'denied' && row.reason === reason, name);
      results.push(result);
    }
    const result = await c.app.discover(f.subjects.alice);
    discoveryAssert(selected(result).kind === 'eligible', 'Predecessors do not mask eligibility');
    return { filtered: results, unfiltered: result };
  });
  await check('K2-03', 'exact missing and tombstone filters share unadmitted reason', async () => {
    const c = await fresh('lowerAdmitted'),
      tombstone = c.app.snapshot().authority.grants.find((r) => !r.grant)!;
    const results = [];
    for (const grantId of [tombstone.id, 'aaaaaaaaaaaaaaaaaaaaaaaaae']) {
      const result = await c.app.discover({ ...f.subjects.alice, grantId }),
        row = selected(result);
      discoveryAssert(row.kind === 'denied' && row.reason === 'grant_unadmitted', 'Missing/tombstoned grant');
      results.push(result);
    }
    return results;
  });
  await check('K2-04', 'all fail returns first admitted bytewise ID reason', async () => {
    const c = await fresh('advancedEpoch'),
      result = await c.app.discover(f.subjects.alice),
      row = selected(result);
    discoveryAssert(row.kind === 'denied' && row.reason === 'grant_revoked', 'First row reason beats later epoch');
    return result;
  });
  await check('K2-05', 'two actions each use one grant without scope or role union', async () => {
    const c = await fresh('aliceEditorEnabled'),
      result = await c.app.discover(f.subjects.alice);
    const a = selected(result),
      b = selected(result, edit);
    discoveryAssert(
      a.kind === 'eligible' && b.kind === 'eligible' && a.grant.id !== b.grant.id,
      'Single distinct grants',
    );
    const x = await c.app.discover({ ...f.subjects.alice, grantId: f.grants.lowerAdmitted!.id });
    const y = await c.app.discover({ ...f.subjects.alice, grantId: f.grants.separateEdit!.id });
    const xx = selected(x, edit),
      yy = selected(y);
    discoveryAssert(
      xx.kind === 'denied' && xx.reason === 'grant_scope' && yy.kind === 'denied' && yy.reason === 'grant_scope',
      'No scope union',
    );
    return { result, actOnly: x, editOnly: y };
  });
  await check('K2-06', 'discovery requires no history, outcome or transport reads', async () => {
    const c = await fresh('bobAct'),
      reads = c.reads.length,
      result = await c.app.discover(f.subjects.alice);
    discoveryAssert(c.reads.length === reads, 'Zero discovery transport reads');
    return result;
  });
  await check('K2-07', 'all principal rows visited once in warm subject preparation', async () => {
    const c = await fresh('bobAct'),
      cold = await c.app.discover(f.subjects.alice),
      warm = await c.app.discover(f.subjects.alice);
    available(cold);
    available(warm);
    const state = c.app.snapshot().authority;
    discoveryAssert(
      warm.work.rowVisits ===
        state.principals.length +
          state.roles.length +
          state.grants.length +
          warm.actions.length +
          warm.work.candidateVisits,
      'Exact charged rows, no repeated grant lookup',
    );
    return { cold, warm };
  });
  await check('K3-01', 'preflight runs gate and schema, with zero folds/evaluations', async () => {
    const c = await fresh('lowerAdmitted'),
      before = canonicalJson(c.app.snapshot(), 32 * 1024 * 1024);
    const valid = await c.app.preflight(f.subjects.alice, act, f.payloads.valid);
    const invalid = await c.app.preflight(f.subjects.alice, act, f.payloads.invalidAmount);
    discoveryAssert(valid.kind === 'available' && valid.outcome.decision === 'effective', 'Valid preflight');
    discoveryAssert(
      invalid.kind === 'available' &&
        invalid.outcome.decision === 'ineffective' &&
        invalid.outcome.source === 'framework' &&
        invalid.outcome.reason === 'invalid_action',
      'Schema preflight denial',
    );
    discoveryAssert(!('evaluation' in valid) && !('successor' in valid), 'No preflight fold result');
    discoveryEqual(canonicalJson(c.app.snapshot(), 32 * 1024 * 1024), before, 'Preflight no mutation');
    return { valid, invalid };
  });
  await check('K3-02', 'same genuine payload fold and ordered source outcomes', async () => {
    const c = await fresh('bobAct');
    const effective = await c.app.simulate(f.subjects.alice, act, { amount: 2, version: 1 });
    simulation(effective);
    const denied = await c.app.simulate(f.subjects.alice, act, { amount: 1, version: 0 });
    simulation(denied);
    const invalid = await c.app.simulate(f.subjects.alice, act, f.payloads.invalidAmount);
    simulation(invalid);
    const next = f.application.vectors[f.stages.effectiveOwnedAction! - 1]!;
    discoveryEqual(effective.outcome, next.expected.outcomes.at(-1)!.outcome, 'Same ordered effective outcome');
    discoveryEqual(effective.successor, next.expected.state, 'Same ordered successor');
    discoveryAssert(
      denied.outcome.decision === 'ineffective' &&
        denied.outcome.source === 'fold' &&
        denied.outcome.reason === 'version_changed',
      'Authored payload denial',
    );
    discoveryAssert(
      invalid.outcome.decision === 'ineffective' &&
        invalid.outcome.source === 'framework' &&
        invalid.outcome.reason === 'invalid_action',
      'Shared input stage',
    );
    const rejected = await discoveryContext(original, 29);
    const signed = original.vectors[2]!.entry.request as any;
    const successorRejected = await rejected.app.simulate(
      { principal: signed.intent.principal, actorKey: signed.intent.actorKey },
      'ai.generalbusiness.atseq.example#act',
      { amount: 1 },
    );
    simulation(successorRejected);
    discoveryAssert(
      successorRejected.outcome.decision === 'ineffective' &&
        successorRejected.outcome.reason === 'fold_failed/schema_value' &&
        successorRejected.successor === null &&
        successorRejected.evaluation.kind === 'available',
      'Actual successor stage retains measured fold',
    );
    return { effective, denied, invalid, successorRejected };
  });
  await check('K3-06', 'above fold action cap retains schema-before-fold precedence', async () => {
    const c = await discoveryContext(original, 2);
    const signed = original.vectors[2]!.entry.request as any;
    const subject = { principal: signed.intent.principal, actorKey: signed.intent.actorKey };
    const result = await c.app.simulate(subject, 'ai.generalbusiness.atseq.example#act', {
      amount: 1,
      padding: 'x'.repeat(33000),
    });
    simulation(result);
    discoveryAssert(
      result.outcome.decision === 'ineffective' &&
        result.outcome.source === 'framework' &&
        result.outcome.reason === 'fold_failed/value_bytes',
      'Fold cap, not early copy cap',
    );
    return result;
  });
  await check('K3-07', 'successful engine counters are actual; pre-fold denial is unavailable', async () => {
    const c = await fresh('lowerAdmitted'),
      effective = await c.app.simulate(f.subjects.alice, act, f.payloads.valid);
    const invalid = await c.app.simulate(f.subjects.alice, act, f.payloads.invalidAmount);
    simulation(effective);
    simulation(invalid);
    discoveryAssert(
      effective.evaluation.kind === 'available' &&
        effective.evaluation.steps > 0 &&
        effective.evaluation.inspectedBytes > 0,
      'Actual fold counters',
    );
    discoveryAssert(invalid.evaluation.kind === 'unavailable', 'No invented zero evaluation');
    return { effective, invalid };
  });
  await check('K3-08', 'version and owner make exact payload authority conditional', async () => {
    const c = await fresh('bobMemberEnabled');
    const valid = await c.app.simulate(f.subjects.alice, act, { amount: 1, version: 2 });
    const stale = await c.app.simulate(f.subjects.alice, act, { amount: 1, version: 1 });
    const bob = await c.app.simulate(f.subjects.bob, act, { amount: 1, version: 2 });
    simulation(valid);
    simulation(stale);
    simulation(bob);
    discoveryAssert(valid.outcome.decision === 'effective', 'Current owned payload');
    discoveryAssert(
      stale.outcome.decision === 'ineffective' && stale.outcome.reason === 'version_changed',
      'Version dependent',
    );
    discoveryAssert(
      bob.outcome.decision === 'ineffective' && bob.outcome.reason === 'not_owner',
      'Actual principal-dependent fold',
    );
    discoveryAssert(valid.payload !== stale.payload, 'Exact payload identity differs');
    return { valid, stale, bob };
  });
  await check('K4-01', 'same unchanged checkpoint framing for state and compact authority', async () => {
    const c = await fresh('lowerAdmitted'),
      result = await c.app.discover(f.subjects.alice);
    available(result);
    const state = c.app.snapshot(),
      encoder = new TextEncoder();
    discoveryAssert(
      result.basis.state === (await checkpointPayloadIdentity(encoder.encode(canonicalJson(state.state)))),
      'Same state framing',
    );
    discoveryAssert(
      result.basis.authority ===
        (await checkpointPayloadIdentity(encoder.encode(canonicalJson(checkpointAuthorityData(state.authority))))),
      'Same compact authority framing',
    );
    const boundaries = [];
    for (const size of [0, 32767, 32768, 32769, 65536, 32 * 1024 * 1024])
      boundaries.push({ size, cid: await checkpointPayloadIdentity(new Uint8Array(size)) });
    return { result, boundaries, accounting: 'CK-1 conservative bounds; shared codec unchanged' };
  });
  await check('K4-02', 'actual payload CID and conservative codec reservation are distinct', async () => {
    const c = await fresh('lowerAdmitted'),
      result = await c.app.simulate(f.subjects.alice, act, f.payloads.valid);
    simulation(result);
    discoveryAssert(result.payload === (await contentCid(f.payloads.valid)), 'Unchanged DAG-CBOR payload identity');
    discoveryAssert(
      result.work.byteAccounting === 'conservative-owner-bounds' && result.work.opaqueAllocations === 'unmeasured',
      'No exact codec/heap claim',
    );
    return result;
  });
  await check('K4-03', 'same untouched schema stage with conservative reservation', async () => {
    const c = await fresh('lowerAdmitted'),
      result = await c.app.simulate(f.subjects.alice, act, f.payloads.invalidAmount);
    simulation(result);
    discoveryAssert(
      result.outcome.decision === 'ineffective' &&
        result.outcome.reason === 'invalid_action' &&
        result.evaluation.kind === 'unavailable',
      'Original schema denial',
    );
    return result;
  });
  await check('K4-04', 'nested authority commitment work charged once', async () => {
    const c = await fresh('lowerAdmitted'),
      cold = await c.app.discover(f.subjects.alice),
      warm = await c.app.discover(f.subjects.alice);
    available(cold);
    available(warm);
    discoveryAssert(
      cold.work.rowVisits > warm.work.rowVisits && cold.work.ownerChargedBytes > warm.work.ownerChargedBytes,
      'Cold nested rows/passes charged',
    );
    const maxScope = await fresh('scope63');
    await maxScope.app.discover(f.subjects.alice);
    const exact = await maxScope.app.discover({ ...f.subjects.alice, grantId: f.grants.scope63!.id });
    available(exact);
    discoveryAssert(
      exact.work.scopeComparisons === 126 && exact.work.candidateVisits === 2,
      'Actual maximum63 comparisons for each of two declared actions',
    );
    const maxAct = selected(exact);
    discoveryAssert(
      maxAct.kind === 'eligible' && maxAct.grant.id === f.grants.scope63!.id,
      'Actual max-scope eligible grant',
    );
    return { cold, warm, exact };
  });
  await check('K4-05', 'preparation refusal produces no partial authority or commitment', async () => {
    const c = await fresh('lowerAdmitted'),
      row = await c.app.discover(f.subjects.alice, { rows: 1 }),
      byte = await c.app.discover(f.subjects.alice, { bytes: 1 });
    discoveryAssert(
      row.kind === 'unavailable' && byte.kind === 'unavailable' && !('basis' in row) && !('actions' in byte),
      'Whole actor unavailable',
    );
    return { row, byte };
  });
  await check('K4-06', 'candidate exhaustion retains completed rows and marks remainder unavailable', async () => {
    const c = await fresh('aliceEditorEnabled');
    await c.app.discover(f.subjects.alice);
    const state = c.app.snapshot().authority,
      preparation = state.principals.length + state.roles.length + state.grants.length + 2;
    const reference = await c.app.discover(f.subjects.alice);
    available(reference);
    // Enough candidates to finish act, then one fewer than the edit search needs.
    const actCandidates = (await c.app.discover({ ...f.subjects.alice, grantId: f.grants.lowerAdmitted!.id })).work
      .candidateVisits;
    discoveryAssert(actCandidates === 2, 'Two filtered action candidates');
    const result = await c.app.discover(f.subjects.alice, { rows: preparation + reference.work.candidateVisits - 1 });
    available(result);
    discoveryAssert(
      result.actions[0]!.kind === 'eligible' && result.actions[1]!.kind === 'unavailable',
      'No false denied partial search',
    );
    return result;
  });
  await check('K4-07', 'local simulation budget refusal never becomes ordered outcome', async () => {
    const c = await fresh('lowerAdmitted'),
      before = canonicalJson(c.app.snapshot(), 32 * 1024 * 1024);
    await c.app.discover(f.subjects.alice);
    const reference = await c.app.simulate(f.subjects.alice, act, f.payloads.valid);
    simulation(reference);
    const result = await c.app.simulate(f.subjects.alice, act, f.payloads.valid, {
      bytes: reference.work.ownerChargedBytes - 1,
    });
    discoveryAssert(result.kind === 'unavailable' && !('outcome' in result), 'Local result withheld');
    discoveryEqual(canonicalJson(c.app.snapshot(), 32 * 1024 * 1024), before, 'No simulation commit');
    return result;
  });
  await check('K4-08', 'oversized or unsupported inputs have honest partial work', async () => {
    const c = await fresh('lowerAdmitted');
    const result = await c.app.simulate(f.subjects.alice, act, { amount: 1, version: 1, text: 'x'.repeat(131073) });
    discoveryAssert(result.kind === 'unavailable' && !('evaluation' in result), 'No invented engine measurement');
    return result;
  });
  await check('K5-01', 'cold then warm shares one successful pair with paid copies', async () => {
    const c = await fresh('lowerAdmitted'),
      cold = await c.app.discover(f.subjects.alice),
      warm = await c.app.discover(f.subjects.alice);
    available(cold);
    available(warm);
    discoveryEqual(cold.basis, warm.basis, 'Same commitment pair');
    discoveryAssert(
      cold.work.memo === 'computed' && warm.work.memo === 'reused' && warm.work.ownerChargedBytes > 0,
      'Paid warm result',
    );
    return { cold, warm };
  });
  await check('K5-03', 'failed small computation is deleted and later explicit operation succeeds', async () => {
    const c = await fresh('lowerAdmitted'),
      failed = await c.app.discover(f.subjects.alice, { bytes: 16000 });
    discoveryAssert(failed.kind === 'unavailable', 'Expected failed small attempt');
    const retry = await c.app.discover(f.subjects.alice);
    available(retry);
    discoveryAssert(retry.work.memo === 'computed', 'Failed entry removed');
    return { failed, retry };
  });
  await check('K5-04', 'real new generation is cold and old labels remain fixed', async () => {
    const c = await fresh('lowerAdmitted'),
      before = await c.app.discover(f.subjects.alice);
    available(before);
    await c.app.process(c.inputs[f.stages.lowerAdmitted!]!);
    const after = await c.app.discover(f.subjects.alice);
    available(after);
    discoveryAssert(
      after.work.memo === 'computed' && after.basis.frontier.position === before.basis.frontier.position + 1,
      'New genuine generation cold',
    );
    return { before, after };
  });
  await check('K5-05', 'serialized caches and snapshots cannot seed generation memo', async () => {
    const c = await fresh('lowerAdmitted'),
      cache = await c.app.discover({ ...f.subjects.alice, state: 'caller', authority: 'caller' });
    discoveryAssert(cache.kind === 'unavailable', 'No caller cache fields');
    const actual = await c.app.discover(f.subjects.alice);
    available(actual);
    discoveryAssert(actual.work.memo === 'computed', 'No memo seeding');
    return { cache, actual };
  });
  await check('FULL-01', 'genuine two principals, stale selected grant, and forged direct ordering', async () => {
    const c = await fresh('eligibleBeforeRevocation'),
      before = await c.app.discover(f.subjects.alice);
    available(before);
    const first = selected(before);
    discoveryAssert(first.kind === 'eligible' && first.grant.id === f.grants.lowerAdmitted!.id, 'Initially eligible');
    for (let i = f.stages.eligibleBeforeRevocation!; i < f.application.vectors.length; i++)
      await c.app.process(c.inputs[i]!);
    const after = await c.app.discover(f.subjects.alice);
    available(after);
    const outcomes = ['staleSelectedSubmission', 'forgedGrantCidSubmission', 'wrongDeviceSubmission'].map(
      (name) => c.app.snapshot().outcomes[f.stages[name]! - 1]!.outcome,
    );
    discoveryEqual(
      outcomes,
      ['grant_revoked', 'grant_conflict', 'grant_signer'].map((reason) => ({
        decision: 'ineffective',
        source: 'framework',
        reason,
      })),
      'Ordered actual grant rechecks',
    );
    discoveryAssert(f.subjects.alice.principal !== f.subjects.bob.principal, 'Two real principals');
    return { before, after, outcomes };
  });
  await check('FULL-02', 'offline retained accepted subject is labelled simulation and public inspection', async () => {
    const c = await fresh('bobMemberEnabled'),
      reads = c.reads.length;
    const result = await c.app.simulate(f.subjects.bob, act, { amount: 1, version: 2 });
    simulation(result);
    discoveryAssert(
      result.label === 'simulation' && result.subject.actorKey !== '' && c.reads.length === reads,
      'Offline retained subject, no empty-key participation',
    );
    const anonymous = await c.app.simulate({ principal: '', actorKey: '' }, act, { amount: 1, version: 2 });
    discoveryAssert(anonymous.kind === 'unavailable', 'Anonymous is not authenticated subject');
    return { result, anonymous };
  });
  return cases;
}
