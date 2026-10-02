/** Genuine C1 participants and publications; no discovery-generated expectations. */
import sourceVectors from '../../testdata/native-source/source-identity-vectors.json' with { type: 'json' };
import { P256PrivateKeyExportable } from '@atcute/crypto';
import { create, CODEC_RAW, toString } from '@atcute/cid';
import { AuthorityHarness, authorityRepo, grantId } from './native-authority-fixture.ts';
import { plcIdentityFixture } from './identity-corpus.ts';
import type { ApplicationFixture, ApplicationVector } from './native-application-fixture.ts';
import { NATIVE_NSID, nativeRef } from '../../src/protocol/native-schema.ts';
import {
  NativeAnchor,
  nativeGenesisPath,
  nativeEntryPath,
  nativeHeadPath,
  type NativeAccountOperation,
  type NativeEntry,
  type NativeRequest,
} from '../../src/protocol/native-wire.ts';
import { authenticateRepo } from '../../src/protocol/native-proof.ts';
import { contentCid, encodeBlock, link } from '../../src/protocol/wire.ts';
import { openNativeApplication, openNativeAuthority } from '../../src/application/native-authority.ts';
import {
  assessNativeGenesisSource,
  nativeSourceAction,
  readNativeSourceAction,
} from '../../src/definition/native-source.ts';
import { canonicalJson } from '../../src/core/values.ts';
import { AtseqError } from '../../src/core/errors.ts';

export interface DiscoveryFixtureGrant {
  principal: string;
  id: string;
  cid: string;
  epoch: string;
  actorKey: string;
}
export interface DiscoveryFixture {
  application: ApplicationFixture;
  /** A newer signed repository revision retaining exactly the same ordered head. */
  unchangedHeadCar: number[];
  subjects: {
    alice: { principal: string; actorKey: string };
    bob: { principal: string; actorKey: string };
    wrongKey: { principal: string; actorKey: string };
  };
  actions: {
    act: { ref: string; execution: string; role: string };
    edit: { ref: string; execution: string; role: string };
  };
  grants: Record<string, DiscoveryFixtureGrant>;
  /** Number of vectors to replay; zero is the genuine genesis generation. */
  stages: Record<string, number>;
  initialState: { count: number; version: number; owner: string; description: string };
  payloads: {
    valid: { amount: number; version: number };
    staleVersion: { amount: number; version: number };
    invalidAmount: { amount: number; version: number };
  };
}

export async function discoveryFixtureSource(owner: string) {
  const original = sourceVectors[0]!;
  const manifest: any = structuredClone(original.manifest);
  const named = new Map(
    original.files.map((file) => [file.path, Uint8Array.from(atob(file.base64), (c) => c.charCodeAt(0))]),
  );
  const encoder = new TextEncoder();
  const initial = { count: 0, version: 1, owner, description: 'demo' };
  const schema = JSON.parse(new TextDecoder().decode(named.get('schemas.json')));
  const action = {
    type: 'object',
    required: ['amount', 'version'],
    properties: {
      amount: { type: 'integer', minimum: 1, maximum: 10 },
      version: { type: 'integer', minimum: 0 },
    },
  };
  schema.defs.act = action;
  schema.defs.edit = structuredClone(action);
  schema.defs.state = {
    type: 'object',
    required: ['count', 'version', 'owner', 'description'],
    properties: {
      count: { type: 'integer', minimum: 0 },
      version: { type: 'integer', minimum: 1 },
      owner: { type: 'string', maxLength: 128 },
      description: { type: 'string', maxLength: 16 },
    },
  };
  const success =
    '{"decision":"effective","state":{"count":state.count+act.amount,"version":state.version+1,"owner":state.owner,"description":state.description}}';
  named.set(
    'fold.jsonata',
    encoder.encode(
      'meta.principal != state.owner ? {"decision":"ineffective","reason":"not_owner"} : act.version != state.version ? {"decision":"ineffective","reason":"version_changed"} : ' +
        success,
    ),
  );
  named.set(
    'edit.jsonata',
    encoder.encode('act.version != state.version ? {"decision":"ineffective","reason":"version_changed"} : ' + success),
  );
  named.set('initial.json', encoder.encode(JSON.stringify(initial)));
  named.set('schemas.json', encoder.encode(JSON.stringify(schema)));
  const act = 'ai.generalbusiness.atseq.example#act',
    edit = 'ai.generalbusiness.atseq.example#edit';
  manifest.actions = [
    { ref: act, fold: 'fold.jsonata', authorization: { $type: nativeRef('requiredRole'), role: 'member' } },
    { ref: edit, fold: 'edit.jsonata', authorization: { $type: nativeRef('requiredRole'), role: 'editor' } },
  ];
  manifest.files = await Promise.all(
    [...named].map(async ([path, raw]) => ({ path, cid: toString(await create(CODEC_RAW, raw)) })),
  );
  const root = await contentCid(manifest);
  const blocks = new Map<string, Uint8Array>([[root, encodeBlock(manifest)]]);
  for (const file of manifest.files) blocks.set(file.cid, named.get(file.path)!);
  const reader = {
    async get(cid: string) {
      const raw = blocks.get(cid);
      if (!raw) throw new AtseqError('content_unavailable', 'Missing discovery fixture source');
      return new Uint8Array(raw);
    },
  };
  const admitted = await assessNativeGenesisSource(root, reader);
  if (admitted.kind !== 'admitted') throw new Error('Discovery fixture source not admitted');
  return {
    root,
    blocks,
    reader,
    initial,
    actions: {
      act: {
        ref: act,
        execution: readNativeSourceAction(nativeSourceAction(admitted.definition, act)!).execution,
        role: 'member',
      },
      edit: {
        ref: edit,
        execution: readNativeSourceAction(nativeSourceAction(admitted.definition, edit)!).execution,
        role: 'editor',
      },
    },
  };
}

export async function nativeDiscoveryFixture(): Promise<DiscoveryFixture> {
  const h = await AuthorityHarness.create();
  const alice = h.actor,
    aliceDevice = h.device;
  const bob = await plcIdentityFixture(),
    bobDevice = await P256PrivateKeyExportable.createKeypair();
  const wrongDevice = await P256PrivateKeyExportable.createKeypair();
  const aliceRecords = h.accountRecords,
    bobRecords = new Map<string, Uint8Array>();
  const source = await discoveryFixtureSource(alice.principal);
  const genesis = {
    ...h.anchor.genesis,
    definition: link(source.root),
    roles: [
      { principal: alice.principal, role: 'member' },
      { principal: bob.principal, role: 'editor' },
    ].sort((a, b) => (JSON.stringify([a.principal, a.role]) < JSON.stringify([b.principal, b.role]) ? -1 : 1)),
  };
  const genesisCid = await contentCid(genesis);
  h.anchor = await NativeAnchor.from(genesis, { app: genesis.app, genesis: genesisCid });
  h.state = await openNativeAuthority(h.anchor);
  h.appRecords.clear();
  h.appRecords.set(nativeGenesisPath(genesisCid), encodeBlock(genesis));
  h.appRecords.set(
    nativeHeadPath(genesisCid),
    encodeBlock({
      $type: NATIVE_NSID.head,
      version: 2,
      app: genesis.app,
      genesis: link(genesisCid),
      position: 0,
      entry: link(genesisCid),
    }),
  );
  const app = await openNativeApplication({ anchor: h.anchor, sourceReader: source.reader });
  const vectors: ApplicationVector[] = [],
    stages: Record<string, number> = { genesis: 0 };
  const grants: Record<string, DiscoveryFixtureGrant> = {};
  const evidence = {
    assuranceClass: 'plc-audit-v1' as const,
    auditBytes: new TextEncoder().encode(JSON.stringify(h.app.rows)),
    selectedTipCid: h.app.selectedTipCid,
  };
  let expectedState = structuredClone(source.initial);
  let lastCar: number[] = [];
  const yes = { decision: 'effective' };
  const no = (reason: string) => ({ decision: 'ineffective', source: 'framework', reason });
  function select(principal: 'alice' | 'bob') {
    h.actor = principal === 'alice' ? alice : bob;
    h.device = principal === 'alice' ? aliceDevice : bobDevice;
    h.accountRecords = principal === 'alice' ? aliceRecords : bobRecords;
  }
  async function append(name: string, request: NativeRequest, outcome: unknown, state = expectedState) {
    const prior = app.snapshot().authority;
    const entry: NativeEntry = {
      $type: NATIVE_NSID.entry,
      version: 2,
      app: genesis.app,
      genesis: link(genesisCid),
      position: prior.frontier.position + 1,
      prev: link(prior.frontier.entry),
      request,
    };
    const entryCid = await contentCid(entry);
    h.appRecords.set(nativeEntryPath(genesisCid, entry.position), encodeBlock(entry));
    h.appRecords.set(
      nativeHeadPath(genesisCid),
      encodeBlock({
        $type: NATIVE_NSID.head,
        version: 2,
        app: genesis.app,
        genesis: link(genesisCid),
        position: entry.position,
        entry: link(entryCid),
      }),
    );
    const proof = await authorityRepo(h.app.principal, h.app.key, h.appRecords, entry.position);
    const appRepo = await authenticateRepo({
      carBytes: proof.car,
      expectedDid: h.app.principal,
      trustedSigningKeyDid: h.app.signing,
    });
    const result = await app
      .process({ entry, appRepo, reader: h.reader(), appIdentity: { before: evidence, after: evidence } })
      .catch((error) => {
        throw new Error(name + ': genuine processing failed', { cause: error });
      });
    if (canonicalJson(result.outcome) !== canonicalJson(outcome))
      throw new Error(name + ': wrong manually asserted outcome ' + canonicalJson(result.outcome));
    const expected = app.snapshot();
    if (canonicalJson(expected.state) !== canonicalJson(state) || expected.definition !== source.root)
      throw new Error(name + ': independent state/source assertion differs');
    expectedState = structuredClone(state);
    lastCar = [...proof.car];
    vectors.push({ name, entry, appCar: lastCar, expected });
    stages[name] = vectors.length;
  }
  async function account(name: string, operation: NativeAccountOperation['operation'], paths: string[]) {
    const prior = app.snapshot().authority,
      row = prior.principals.find((r) => r.principal === h.actor.principal);
    const request: NativeAccountOperation = {
      $type: nativeRef('accountOperation'),
      app: genesis.app,
      genesis: link(genesisCid),
      position: prior.frontier.position + 1,
      prev: link(prior.frontier.entry),
      principal: h.actor.principal,
      expectedEpoch: row?.epoch ? link(row.epoch) : null,
      expectedObservation: row?.observation ? link(row.observation.cid) : null,
      operation,
      observation: link(genesisCid),
    };
    request.observation = link(await h.observe(request, paths));
    await append(name, request, yes);
  }
  async function grant(name: string, n: number, epoch: string, actionNames: ('act' | 'edit')[], signer = h.device) {
    const id = grantId(n),
      actorKey = await signer.exportPublicKey('did');
    const cid = await h.account(NATIVE_NSID.grant, id, {
      $type: NATIVE_NSID.grant,
      version: 1,
      id,
      app: genesis.app,
      genesis: link(genesisCid),
      epoch: link(epoch),
      actorKey,
      actions: actionNames
        .map((key) => ({ action: source.actions[key].ref, execution: link(source.actions[key].execution) }))
        .sort((a, b) => (a.action < b.action ? -1 : 1)),
      assignRoles: ['member'],
    });
    grants[name] = { principal: h.actor.principal, id, cid, epoch, actorKey };
    await account(name, { $type: nativeRef('admitGrant'), grant: { id, cid: link(cid) } }, [
      `${NATIVE_NSID.epochCurrent}/self`,
      `${NATIVE_NSID.epoch}/${epoch}`,
      `${NATIVE_NSID.grant}/${id}`,
    ]);
    const admitted = app.snapshot().authority.grants.find((r) => r.principal === h.actor.principal && r.id === id);
    if (admitted?.cid !== cid || admitted.revoked) throw new Error(name + ': admitted authority assertion differs');
  }
  async function revoke(name: string, id: string) {
    const cid = await h.account(NATIVE_NSID.revoke, id, {
      $type: NATIVE_NSID.revoke,
      version: 1,
      id,
      app: genesis.app,
      genesis: link(genesisCid),
    });
    await account(name, { $type: nativeRef('revokeGrant'), revoke: { id, cid: link(cid) } }, [
      `${NATIVE_NSID.revoke}/${id}`,
    ]);
    if (!app.snapshot().authority.grants.find((r) => r.principal === h.actor.principal && r.id === id)?.revoked)
      throw new Error(name + ': revocation assertion differs');
  }
  async function signedAction(
    grantName: string,
    actionName: 'act' | 'edit',
    payload: { amount: number; version: number },
    signer = h.device,
    cid?: string,
  ) {
    const g = grants[grantName]!,
      a = source.actions[actionName];
    return h.signed(
      {
        $type: nativeRef('act'),
        action: a.ref,
        execution: link(a.execution),
        payload,
        grant: { id: g.id, cid: link(cid ?? g.cid) },
        epoch: link(g.epoch),
      },
      signer,
    );
  }
  async function role(name: string, target: string, value: string, enabled: boolean) {
    const prior = app.snapshot().authority,
      current = prior.roles.find((r) => r.principal === target && r.role === value);
    await append(
      name,
      await h.signed(
        {
          $type: nativeRef('setRole'),
          position: prior.frontier.position + 1,
          prev: link(prior.frontier.entry),
          controlTip: link(prior.control.tip),
          target,
          role: value,
          enabled,
          expectedAssignment: current ? link(current.revision) : null,
        },
        h.control,
      ),
      yes,
    );
  }

  const ep1 = await h.epoch(1);
  await revoke('tombstone', grantId(0));
  await grant('revokedGrantAdmitted', 1, ep1, ['act']);
  await revoke('revokedGrant', grantId(1));
  await grant('oldEpoch', 2, ep1, ['act']);
  const ep2 = await h.epoch(2, ep1);
  await account('advancedEpoch', { $type: nativeRef('advanceEpoch'), epoch: link(ep2) }, [
    `${NATIVE_NSID.epochCurrent}/self`,
    `${NATIVE_NSID.epoch}/${ep2}`,
  ]);
  await grant('wrongSigner', 3, ep2, ['act'], wrongDevice);
  await grant('outOfScope', 4, ep2, []);
  await grant('higherAdmitted', 9, ep2, ['act']);
  await grant('lowerAdmitted', 8, ep2, ['act']);
  if (!(grants.lowerAdmitted!.id < grants.higherAdmitted!.id)) throw new Error('Fixture grant ID order differs');
  await grant('separateEdit', 7, ep2, ['edit']);
  const predecessors = [
    grants.separateEdit!.id,
    grantId(0),
    grants.revokedGrantAdmitted!.id,
    grants.oldEpoch!.id,
    grants.wrongSigner!.id,
    grants.outOfScope!.id,
    grants.lowerAdmitted!.id,
    grants.higherAdmitted!.id,
  ];
  if (predecessors.some((id, index) => index > 0 && predecessors[index - 1]! >= id))
    throw new Error('Fixture explicit ASCII predecessor order differs');
  await role('aliceEditorEnabled', alice.principal, 'editor', true);
  select('bob');
  const bobEpoch = await h.epoch(11);
  await grant('bobEdit', 6, bobEpoch, ['edit']);
  await grant('bobAct', 5, bobEpoch, ['act']);
  select('alice');
  await append('effectiveOwnedAction', await signedAction('lowerAdmitted', 'act', { amount: 2, version: 1 }), yes, {
    ...expectedState,
    count: 2,
    version: 2,
  });
  await append('stalePayloadVersion', await signedAction('lowerAdmitted', 'act', { amount: 1, version: 1 }), {
    decision: 'ineffective',
    source: 'fold',
    reason: 'version_changed',
  });
  await append(
    'invalidPayloadAmount',
    await signedAction('lowerAdmitted', 'act', { amount: 11, version: 2 }),
    no('invalid_action'),
  );
  await role('bobMemberEnabled', bob.principal, 'member', true);
  select('bob');
  await append('differentPrincipalNotOwner', await signedAction('bobAct', 'act', { amount: 1, version: 2 }), {
    decision: 'ineffective',
    source: 'fold',
    reason: 'not_owner',
  });
  await append('effectiveEditorAction', await signedAction('bobEdit', 'edit', { amount: 3, version: 2 }), yes, {
    ...expectedState,
    count: 5,
    version: 3,
  });
  select('alice');
  await role('memberDisabled', alice.principal, 'member', false);
  await append('roleDenial', await signedAction('lowerAdmitted', 'act', { amount: 1, version: 3 }), no('role_missing'));
  await role('memberEnabled', alice.principal, 'member', true);
  stages.eligibleBeforeRevocation = vectors.length;
  await revoke('lowerRevoked', grants.lowerAdmitted!.id);
  await append(
    'staleSelectedSubmission',
    await signedAction('lowerAdmitted', 'act', { amount: 1, version: 3 }),
    no('grant_revoked'),
  );
  await append(
    'forgedGrantCidSubmission',
    await signedAction('higherAdmitted', 'act', { amount: 1, version: 3 }, aliceDevice, source.root),
    no('grant_conflict'),
  );
  await append(
    'wrongDeviceSubmission',
    await signedAction('higherAdmitted', 'act', { amount: 1, version: 3 }, wrongDevice),
    no('grant_signer'),
  );
  const scopeId = grantId(10),
    scopeActorKey = await aliceDevice.exportPublicKey('did'),
    scopeActions = [
      ...Array.from({ length: 62 }, (_, n) => ({
        action: `ai.generalbusiness.atseq.example#a${String(n).padStart(2, '0')}`,
        execution: link(source.actions.act.execution),
      })),
      { action: source.actions.act.ref, execution: link(source.actions.act.execution) },
    ];
  if (
    scopeActions.length !== 63 ||
    scopeActions.at(-1)!.action !== source.actions.act.ref ||
    scopeActions.some((pair, index) => index > 0 && scopeActions[index - 1]!.action >= pair.action)
  )
    throw new Error('Fixture maximum scope must be sorted, unique, and match act last');
  const scopeCid = await h.account(NATIVE_NSID.grant, scopeId, {
    $type: NATIVE_NSID.grant,
    version: 1,
    id: scopeId,
    app: genesis.app,
    genesis: link(genesisCid),
    epoch: link(ep2),
    actorKey: scopeActorKey,
    actions: scopeActions,
    assignRoles: ['member'],
  });
  grants.scope63 = { principal: alice.principal, id: scopeId, cid: scopeCid, epoch: ep2, actorKey: scopeActorKey };
  await account('scope63', { $type: nativeRef('admitGrant'), grant: { id: scopeId, cid: link(scopeCid) } }, [
    `${NATIVE_NSID.epochCurrent}/self`,
    `${NATIVE_NSID.epoch}/${ep2}`,
    `${NATIVE_NSID.grant}/${scopeId}`,
  ]);
  const scopeRow = app
    .snapshot()
    .authority.grants.find((row) => row.principal === alice.principal && row.id === scopeId);
  if (
    scopeRow?.cid !== scopeCid ||
    scopeRow.revoked ||
    canonicalJson(scopeRow.grant?.actions) !== canonicalJson(scopeActions)
  )
    throw new Error('Fixture maximum scope admission differs from independent record');
  const unchanged = await authorityRepo(h.app.principal, h.app.key, h.appRecords, vectors.length + 1);
  return {
    unchangedHeadCar: [...unchanged.car],
    application: {
      genesis,
      genesisCid,
      appKey: h.app.signing,
      appIdentity: { auditBytes: [...evidence.auditBytes], selectedTipCid: evidence.selectedTipCid },
      sourceBlocks: [...source.blocks].map(([cid, raw]) => [cid, [...raw]]),
      retainedContent: [...h.content].map(([cid, raw]) => [cid, [...raw]]),
      vectors,
      duplicateCar: lastCar,
    },
    subjects: {
      alice: { principal: alice.principal, actorKey: await aliceDevice.exportPublicKey('did') },
      bob: { principal: bob.principal, actorKey: await bobDevice.exportPublicKey('did') },
      wrongKey: { principal: alice.principal, actorKey: await wrongDevice.exportPublicKey('did') },
    },
    actions: source.actions,
    grants,
    stages,
    initialState: source.initial,
    payloads: {
      valid: { amount: 1, version: 1 },
      staleVersion: { amount: 1, version: 0 },
      invalidAmount: { amount: 11, version: 1 },
    },
  };
}
