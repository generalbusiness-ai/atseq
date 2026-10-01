import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { P256PrivateKeyExportable } from '@atcute/crypto';
import * as CAR from '@atcute/car';
import * as CID from '@atcute/cid';
import { AuthorityHarness, grantId, authorityRepo } from './support/native-authority-fixture.ts';
import { car } from './support/native-proof-corpus.ts';
import { replayAuthorityFixtures } from './support/native-authority-corpus.ts';
import { nativeRef, NATIVE_NSID } from '../src/protocol/native-schema.ts';
import {
  nativeAuthoritySnapshot,
  interpretNativeAuthority,
  type NativeAuthorityState,
} from '../src/application/native-authority.ts';
import { readNativeAuthoritySnapshot } from '../src/application/native-authority-snapshot.ts';
import {
  authenticatedAuthorityEntry,
  type AuthenticatedAuthorityEntry,
} from '../src/application/native-authority-evidence.ts';
import { encodeBlock, decodeBlock, contentCid, link, bytes } from '../src/protocol/wire.ts';
import {
  nativeEntryPath,
  nativeGenesisPath,
  type NativeEntry,
  type NativeContent,
  type NativeObservation,
  type ByteManifest,
} from '../src/protocol/native-wire.ts';

test('native participant authority, role revisions and recovery use authenticated retained evidence', async () => {
  const h = await AuthorityHarness.create(),
    ep1 = await h.epoch(1),
    g1 = await h.grant(1, ep1),
    g2 = await h.grant(2, ep1, ['auditor']);
  const current = `${NATIVE_NSID.epochCurrent}/self`,
    epoch = (cid: string) => `${NATIVE_NSID.epoch}/${cid}`;
  const grant = (id: string) => `${NATIVE_NSID.grant}/${id}`,
    revoke = (id: string) => `${NATIVE_NSID.revoke}/${id}`;
  const effective = { decision: 'effective' as const },
    no = (reason: string) => ({ decision: 'ineffective' as const, reason });
  const admit = async (reference: typeof g1, epochs: string[], revision?: number) =>
    h.accountRequest(
      { $type: nativeRef('admitGrant'), grant: reference },
      [current, ...epochs.map(epoch), grant(reference.id)],
      revision,
    );
  const advance = async (selected: string, epochs: string[], revision?: number) =>
    h.accountRequest(
      { $type: nativeRef('advanceEpoch'), epoch: link(selected) },
      [current, ...epochs.map(epoch)],
      revision,
    );
  const assign = async (
    reference: typeof g1,
    selected: string,
    role: string,
    enabled: boolean,
    expected: string | null,
  ) =>
    h.signed({
      $type: nativeRef('assignRole'),
      grant: reference,
      epoch: link(selected),
      target: h.actor.principal,
      role,
      enabled,
      expectedAssignment: expected === null ? null : link(expected),
    });
  const roleRevision = (role: string) =>
    nativeAuthoritySnapshot(h.state).roles.find((row) => row.role === role)?.revision ?? null;
  const controlContext = () => {
    const state = nativeAuthoritySnapshot(h.state);
    return {
      position: state.frontier.position + 1,
      prev: link(state.frontier.entry),
      controlTip: link(state.control.tip),
    };
  };
  await h.append('initial selected epoch and immutable grant admission', await admit(g1, [ep1]), effective);
  assert.equal(roleRevision('member'), h.anchor.cid);
  await h.append(
    'genesis role disable changes revision to unsigned request CID',
    await assign(g1, ep1, 'member', false, h.anchor.cid),
    effective,
  );
  const disabled = roleRevision('member');
  assert.ok(disabled && disabled !== h.anchor.cid);
  await h.append(
    'stale assignment cannot revive disabled role',
    await assign(g1, ep1, 'member', true, h.anchor.cid),
    no('role_stale'),
  );
  await h.append('second immutable grant admission', await admit(g2, [ep1]), effective);
  await h.append(
    'one referenced grant cannot union another grant role scope',
    await assign(g1, ep1, 'auditor', true, null),
    no('role_scope'),
  );
  await h.append(
    'explicit one-grant owner role administration',
    await assign(g2, ep1, 'auditor', true, null),
    effective,
  );
  await h.append(
    'role no-change retains its effective revision',
    await assign(g2, ep1, 'auditor', true, roleRevision('auditor')),
    no('role_unchanged'),
  );
  h.accountRecords.delete(grant(g1.id));
  await h.append(
    'source grant deletion does not revoke retained device authority',
    await assign(g1, ep1, 'member', true, disabled),
    effective,
  );
  const unknown = grantId(3);
  const revokeCid = await h.account(NATIVE_NSID.revoke, unknown, {
    $type: NATIVE_NSID.revoke,
    version: 1,
    id: unknown,
    app: h.anchor.genesis.app,
    genesis: link(h.anchor.cid),
  });
  const importRevoke = async () =>
    h.accountRequest({ $type: nativeRef('revokeGrant'), revoke: { id: unknown, cid: link(revokeCid) } }, [
      revoke(unknown),
    ]);
  await h.append(
    'terminal revoke before first grant admission needs no target grant or epoch',
    await importRevoke(),
    effective,
  );
  const g3 = await h.grant(3, ep1);
  await h.append(
    'never-admitted terminal revoked grant cannot be revived',
    await admit(g3, [ep1]),
    no('grant_revoked'),
  );
  const previousFloor = nativeAuthoritySnapshot(h.state).principals[0]!.observation!.cid;
  await h.append(
    'fresh repeated revoke no-op advances observation floor',
    await importRevoke(),
    no('authority_unchanged'),
  );
  assert.notEqual(nativeAuthoritySnapshot(h.state).principals[0]!.observation!.cid, previousFloor);
  const key2 = await P256PrivateKeyExportable.createKeypair();
  const conflict = await h.grant(1, ep1, ['member'], await key2.exportPublicKey('did'));
  await h.append(
    'same grant path with different CID cannot edit admitted signer',
    await admit(conflict, [ep1]),
    no('grant_conflict'),
  );
  assert.equal(nativeAuthoritySnapshot(h.state).grants.find((row) => row.id === g1.id)!.cid, g1.cid.$link);
  const ep2 = await h.epoch(2, ep1);
  await h.append(
    'linked epoch reset retires all earlier grants without walking them',
    await advance(ep2, [ep2]),
    effective,
  );
  await h.append(
    'queued old-epoch device operation is ineffective',
    await assign(g1, ep1, 'member', false, roleRevision('member')),
    no('grant_epoch'),
  );
  const old = await h.grant(4, ep1);
  await h.append(
    'never-seen pre-reset grant cannot enter current epoch',
    await admit(old, [ep2]),
    no('epoch_conflict'),
  );
  const g5 = await h.grant(5, ep2);
  await h.append('fresh reset epoch needs fresh exact grant admission', await admit(g5, [ep2]), effective);
  await h.epoch(1);
  await h.append('copied backup cannot restore a retired epoch', await advance(ep1, [ep1]), no('epoch_reused'));
  const ep3 = await h.epoch(3);
  await h.append(
    'authentic lower repository revision cannot lower ordinary admission floor',
    await advance(ep3, [ep3], 1),
    no('observation_rollback'),
  );
  await h.append(
    'greater revision does not repair a conflicting epoch predecessor',
    await advance(ep3, [ep3], 50),
    no('epoch_conflict'),
  );
  async function recover(selected: string, revision: number, stale = false) {
    const context = controlContext();
    if (stale) context.position--;
    const intent = {
      $type: nativeRef('intent'),
      version: 2 as const,
      app: h.anchor.genesis.app,
      genesis: link(h.anchor.cid),
      principal: h.actor.principal,
      actorKey: await h.control.exportPublicKey('did'),
      nonce: { $bytes: '' },
      operation: {
        $type: nativeRef('recoverParticipant'),
        ...context,
        target: h.actor.principal,
        ...h.expectations(),
        epoch: link(selected),
        observation: link(h.anchor.cid),
      },
    };
    // Use the same canonical unsigned fields for subject hashing and signature.
    const { epochId } = await import('./support/native-authority-fixture.ts');
    intent.nonce = epochId(h.nonce++);
    intent.operation.observation = link(await h.observe(intent, [current, epoch(selected)], revision));
    const { signNativeIntent } = await import('../src/protocol/native-wire.ts');
    return signNativeIntent(intent, h.control);
  }
  await h.append(
    'appointed recovery permits lower floor only with never-accepted fresh epoch',
    await recover(ep3, 1),
    effective,
  );
  assert.equal(nativeAuthoritySnapshot(h.state).principals[0]!.epoch, ep3);
  assert.equal(nativeAuthoritySnapshot(h.state).principals[0]!.observation!.rev, '2222222222223');
  await h.epoch(2, ep1);
  const retainedFloor = nativeAuthoritySnapshot(h.state).principals[0]!.observation;
  await h.append(
    'appointed recovery cannot revive a retired epoch',
    await recover(ep2, 100),
    no('recovery_epoch_reused'),
  );
  assert.deepEqual(nativeAuthoritySnapshot(h.state).principals[0]!.observation, retainedFloor);
  const ep4 = await h.epoch(4);
  await h.append(
    'stale signed recovery consumes descriptor but changes no epoch or floor',
    await recover(ep4, 101, true),
    no('control_context_stale'),
  );
  assert.deepEqual(nativeAuthoritySnapshot(h.state).principals[0]!.observation, retainedFloor);
  await h.append(
    'govern may explicitly remove owner without revoking devices',
    await h.signed({ $type: nativeRef('setOwner'), ...controlContext(), owner: null }, h.control),
    effective,
  );
  await h.epoch(3);
  const g7 = await h.grant(7, ep3);
  await h.append('routine admission after recovery preserves fresh scope', await admit(g7, [ep3], 102), effective);
  await h.append(
    'participation grant does not appoint owner/admin authority',
    await assign(g7, ep3, 'member', false, roleRevision('member')),
    no('role_owner'),
  );
  await h.append(
    'appointed governance assigns domain role without target device grant',
    await h.signed(
      {
        $type: nativeRef('setRole'),
        ...controlContext(),
        target: 'did:web:other.example',
        role: 'visitor',
        enabled: true,
        expectedAssignment: null,
      },
      h.control,
    ),
    effective,
  );
  const initialControl = nativeAuthoritySnapshot(h.state).control.appointments;
  const certifiers = [];
  for (let n = 0; n < 15; n++)
    certifiers.push({
      principal: 'did:web:certifier.example',
      actorKey: await (await P256PrivateKeyExportable.createKeypair()).exportPublicKey('did'),
      powers: ['certify' as const],
    });
  const sortPairs = <T extends { principal: string; actorKey: string }>(rows: T[]) =>
    rows.sort((a, b) => {
      const left = JSON.stringify([a.principal, a.actorKey]),
        right = JSON.stringify([b.principal, b.actorKey]);
      return left < right ? -1 : left > right ? 1 : 0;
    });
  await h.append(
    'govern adds fifteen certify-only pairs while preserving mixed recovery exactly',
    await h.signed(
      { $type: nativeRef('setControl'), ...controlContext(), control: sortPairs([...initialControl, ...certifiers]) },
      h.control,
    ),
    effective,
  );
  const replacement = await P256PrivateKeyExportable.createKeypair();
  const recoveryPair = { principal: h.actor.principal, actorKey: await replacement.exportPublicKey('did') };
  await h.append(
    'recovery input bound does not waive sixteen combined-pair capacity',
    await h.signed({ $type: nativeRef('setRecovery'), ...controlContext(), recovery: [recoveryPair] }, h.control),
    no('control_map_limit'),
  );
  const mixed = initialControl[0]!;
  await h.append(
    'govern cannot alter lower powers on a mixed recover pair',
    await h.signed(
      {
        $type: nativeRef('setControl'),
        ...controlContext(),
        control: sortPairs([{ ...mixed, powers: ['recover'] }, ...certifiers]),
      },
      h.control,
    ),
    no('control_power'),
  );
  await h.append(
    'specific capacity route first prunes one non-recover certifier by govern',
    await h.signed(
      {
        $type: nativeRef('setControl'),
        ...controlContext(),
        control: sortPairs([...initialControl, ...certifiers.slice(1)]),
      },
      h.control,
    ),
    effective,
  );
  await h.append(
    'specific capacity route then rotates recovery preserving old governance',
    await h.signed({ $type: nativeRef('setRecovery'), ...controlContext(), recovery: [recoveryPair] }, h.control),
    effective,
  );
  assert.deepEqual(
    nativeAuthoritySnapshot(h.state).control.appointments.find((row) => row.actorKey === mixed.actorKey)?.powers,
    ['govern'],
  );
  await h.append(
    'removed recovery signer cannot rotate newly appointed peers',
    await h.signed(
      {
        $type: nativeRef('setRecovery'),
        ...controlContext(),
        recovery: [{ principal: h.actor.principal, actorKey: mixed.actorKey }],
      },
      h.control,
    ),
    no('control_power'),
  );
  await h.append(
    'specific capacity route newly appointed recovery replaces governance only',
    await h.signed(
      {
        $type: nativeRef('recoverGovernance'),
        ...controlContext(),
        governance: [{ principal: h.actor.principal, actorKey: mixed.actorKey }],
      },
      replacement,
    ),
    no('control_unchanged'),
  );
  await h.append(
    'one recovery signer may remove all existing governance without removing certify',
    await h.signed({ $type: nativeRef('recoverGovernance'), ...controlContext(), governance: [] }, replacement),
    effective,
  );
  assert.equal(
    nativeAuthoritySnapshot(h.state).control.appointments.filter((row) => row.powers.includes('certify')).length,
    14,
  );
  await h.append(
    'one recovery signer may restore a selected governance pair',
    await h.signed(
      {
        $type: nativeRef('recoverGovernance'),
        ...controlContext(),
        governance: [{ principal: h.actor.principal, actorKey: mixed.actorKey }],
      },
      replacement,
    ),
    effective,
  );
  await readNativeAuthoritySnapshot(nativeAuthoritySnapshot(h.state), h.anchor);
  await h.append(
    'whole-map replacement equality ignores object property insertion order',
    await h.signed(
      {
        $type: nativeRef('setControl'),
        ...controlContext(),
        control: nativeAuthoritySnapshot(h.state).control.appointments,
      },
      h.control,
    ),
    no('control_unchanged'),
  );
  const snapshot = nativeAuthoritySnapshot(h.state);
  snapshot.control.owner = h.actor.principal;
  assert.equal(nativeAuthoritySnapshot(h.state).control.owner, null);
  assert.throws(() => nativeAuthoritySnapshot(snapshot as unknown as NativeAuthorityState), { code: 'envelope' });
  assert.throws(() => authenticatedAuthorityEntry({} as AuthenticatedAuthorityEntry), { code: 'envelope' });
  assert.throws(() => interpretNativeAuthority({} as NativeAuthorityState, {} as AuthenticatedAuthorityEntry), {
    code: 'envelope',
  });
  await assert.rejects(() => readNativeAuthoritySnapshot({ ...snapshot, trusted: true }, h.anchor), {
    code: 'envelope',
  });
  const malformed = nativeAuthoritySnapshot(h.state);
  malformed.grants[0]!.cid = h.anchor.cid;
  await assert.rejects(() => readNativeAuthoritySnapshot(malformed, h.anchor), { code: 'envelope' });
  const first = h.vectors[0]!,
    roleVector = h.vectors[1]!;
  const firstEntry = decodeBlock(new Uint8Array(first.entry)) as unknown as NativeEntry;
  const counterfeitAppKey = await P256PrivateKeyExportable.createKeypair();
  const counterfeitApp = await authorityRepo(h.app.principal, counterfeitAppKey, h.appRecords, 199);
  h.hostile.push({
    name: 'claimed-key P1 root cannot substitute for authentic retained app identity',
    entry: first.entry,
    appCar: [...counterfeitApp.car],
    claimedAppKey: await counterfeitAppKey.exportPublicKey('did'),
    missingContent: null,
    expectedCode: 'envelope',
  });
  h.hostile.push({
    name: 'authentic app history truncation changes before/after tip even with unchanged key and PDS',
    entry: first.entry,
    appCar: first.appCar,
    appIdentityAfter: {
      auditBytes: [...new TextEncoder().encode(JSON.stringify([h.app.rows[0]]))],
      selectedTipCid: h.app.rows[0]!.cid,
    },
    missingContent: null,
    expectedCode: 'envelope',
  });
  const absent = await authorityRepo(
    h.app.principal,
    h.app.key,
    new Map([[nativeGenesisPath(h.anchor.cid), encodeBlock(h.anchor.genesis)]]),
    200,
  );
  h.hostile.push({
    name: 'complete selected root proves claimed entry absent: invalid history',
    entry: first.entry,
    appCar: [...absent.car],
    missingContent: null,
    expectedCode: 'envelope',
  });
  const parsedCar = CAR.fromUint8Array(new Uint8Array(first.appCar)),
    blocks = new Map<string, Uint8Array>();
  for (const block of parsedCar) blocks.set(CID.toString(block.cid), new Uint8Array(block.bytes));
  const root = parsedCar.roots[0]!.$link,
    commit = decodeBlock(blocks.get(root)!) as { data: { $link: string } };
  blocks.delete(commit.data.$link);
  h.hostile.push({
    name: 'missing native tree node stalls without proven absence',
    entry: first.entry,
    appCar: [...(await car(root, blocks))],
    missingContent: null,
    expectedCode: 'content_unavailable',
  });
  const firstRequest = firstEntry.request as import('../src/protocol/native-wire.ts').NativeAccountOperation;
  const descriptor = decodeBlock(
    h.content.get(firstRequest.observation.$link)!,
  ) as unknown as NativeContent<NativeObservation>;
  const manifest = decodeBlock(
    h.content.get(descriptor.body.before.bytes.$link)!,
  ) as unknown as NativeContent<ByteManifest>;
  h.hostile.push({
    name: 'missing exact retained method chunk stalls rather than granting authority',
    entry: first.entry,
    appCar: first.appCar,
    missingContent: manifest.body.chunks[0]!.$link,
    expectedCode: 'content_unavailable',
  });
  const badSignature = decodeBlock(new Uint8Array(roleVector.entry)) as unknown as NativeEntry;
  (badSignature.request as import('../src/protocol/native-wire.ts').NativeSignedRequest).sig = bytes(
    new Uint8Array(64),
  );
  h.hostile.push({
    name: 'invalid device signature stays invalid before delegated checks',
    entry: [...encodeBlock(badSignature)],
    appCar: roleVector.appCar,
    missingContent: null,
    expectedCode: 'signature',
  });
  const changed = structuredClone(descriptor);
  changed.body.context.subject = link(h.anchor.cid);
  const changedCid = await contentCid(changed),
    changedEntry = structuredClone(firstEntry);
  (changedEntry.request as import('../src/protocol/native-wire.ts').NativeAccountOperation).observation =
    link(changedCid);
  const changedPublication = new Map([
    [nativeGenesisPath(h.anchor.cid), encodeBlock(h.anchor.genesis)],
    [`${NATIVE_NSID.content}/${changedCid}`, encodeBlock(changed)],
    [nativeEntryPath(h.anchor.cid, changedEntry.position), encodeBlock(changedEntry)],
  ]);
  const changedRepo = await authorityRepo(h.app.principal, h.app.key, changedPublication, 201);
  h.hostile.push({
    name: 'authentic app publication cannot rebind descriptor subject',
    entry: [...encodeBlock(changedEntry)],
    appCar: [...changedRepo.car],
    missingContent: null,
    expectedCode: 'envelope',
  });
  async function duplicatePublication(request: NativeEntry['request']) {
    const state = nativeAuthoritySnapshot(h.state),
      entry: NativeEntry = {
        $type: NATIVE_NSID.entry,
        version: 2,
        app: state.app,
        genesis: link(state.genesis),
        position: state.frontier.position + 1,
        prev: link(state.frontier.entry),
        request,
      };
    const records = new Map(h.appRecords);
    records.set(nativeEntryPath(state.genesis, entry.position), encodeBlock(entry));
    const repo = await authorityRepo(h.app.principal, h.app.key, records, 202);
    return { entry: [...encodeBlock(entry)], appCar: [...repo.car] };
  }
  const recoverVector = h.vectors.find(
    (row) => row.name === 'appointed recovery permits lower floor only with never-accepted fresh epoch',
  )!;
  h.hostile.push({
    name: 'signed published ordinary action stalls without supported source/action derivation and preserves prior',
    ...(await duplicatePublication(
      await h.signed({
        $type: nativeRef('act'),
        grant: g1,
        epoch: link(ep1),
        action: 'ai.generalbusiness.sample.action#main',
        execution: link(h.anchor.cid),
        payload: {},
      }),
    )),
    missingContent: null,
    expectedCode: 'content_unavailable',
    stage: 'interpret',
  });
  const repeatedRecovery = decodeBlock(new Uint8Array(recoverVector.entry)) as unknown as NativeEntry;
  h.hostile.push({
    name: 'repeated recovery request/descriptor is invalid before missing observation fetch',
    ...(await duplicatePublication(repeatedRecovery.request)),
    missingContent: manifest.body.chunks[0]!.$link,
    expectedCode: 'envelope',
  });
  const earlierRole = (decodeBlock(new Uint8Array(roleVector.entry)) as unknown as NativeEntry)
    .request as import('../src/protocol/native-wire.ts').NativeSignedRequest;
  const differentIntent = structuredClone(earlierRole.intent);
  (differentIntent.operation as import('../src/protocol/native-wire.ts').NativeAssignRole).enabled = true;
  const { signNativeIntent } = await import('../src/protocol/native-wire.ts');
  h.hostile.push({
    name: 'same actor nonce with changed signed contents is invalid before live-grant denial',
    ...(await duplicatePublication(await signNativeIntent(differentIntent, h.device))),
    missingContent: null,
    expectedCode: 'envelope',
  });
  const secp = await AuthorityHarness.create('secp256k1'),
    secpOldEpoch = await secp.epoch(1),
    secpEpoch = await secp.epoch(2, secpOldEpoch),
    secpGrant = await secp.grant(1, secpEpoch);
  await secp.append(
    'unknown app initializes current epoch without replaying pre-app resets; secp256k1 repo and P-256 device',
    await secp.accountRequest({ $type: nativeRef('admitGrant'), grant: secpGrant }, [
      current,
      epoch(secpEpoch),
      grant(secpGrant.id),
    ]),
    effective,
  );
  await secp.append(
    'secp256k1 repository key does not change P-256 owner role authorization',
    await secp.signed({
      $type: nativeRef('assignRole'),
      grant: secpGrant,
      epoch: link(secpEpoch),
      target: secp.actor.principal,
      role: 'member',
      enabled: false,
      expectedAssignment: link(secp.anchor.cid),
    }),
    effective,
  );
  const web = await AuthorityHarness.create('p256', 'web'),
    webEpoch = await web.epoch(1),
    webGrant = await web.grant(1, webEpoch);
  await web.append(
    'hostname web observation/native grant retains weaker assurance class',
    await web.accountRequest({ $type: nativeRef('admitGrant'), grant: webGrant }, [
      current,
      epoch(webEpoch),
      grant(webGrant.id),
    ]),
    effective,
  );
  assert.equal(nativeAuthoritySnapshot(web.state).principals[0]!.observation!.assuranceClass, 'web-observation-v1');
  await web.append(
    'web account publication still needs a separate P-256 actor signature and owner scope',
    await web.signed({
      $type: nativeRef('assignRole'),
      grant: webGrant,
      epoch: link(webEpoch),
      target: web.actor.principal,
      role: 'member',
      enabled: false,
      expectedAssignment: link(web.anchor.cid),
    }),
    effective,
  );
  const blocked = await AuthorityHarness.create('p256', 'plc', 'mixed-recovery-blocked');
  const blockedContext = () => {
    const state = nativeAuthoritySnapshot(blocked.state);
    return {
      position: state.frontier.position + 1,
      prev: link(state.frontier.entry),
      controlTip: link(state.control.tip),
    };
  };
  const newRecovery = {
    principal: blocked.actor.principal,
    actorKey: await (await P256PrivateKeyExportable.createKeypair()).exportPublicKey('did'),
  };
  await blocked.append(
    'sixteen mixed recover/certify pairs cannot add a new recovery pair without govern',
    await blocked.signed(
      {
        $type: nativeRef('setRecovery'),
        ...blockedContext(),
        recovery: [newRecovery],
      },
      blocked.control,
    ),
    no('control_map_limit'),
  );
  await blocked.append(
    'disabled recovery-to-govern policy cannot manufacture a capacity escape',
    await blocked.signed(
      {
        $type: nativeRef('recoverGovernance'),
        ...blockedContext(),
        governance: [newRecovery],
      },
      blocked.control,
    ),
    no('control_power'),
  );
  await blocked.append(
    'recover/certify alone cannot prune lower powers through setControl',
    await blocked.signed(
      {
        $type: nativeRef('setControl'),
        ...blockedContext(),
        control: [],
      },
      blocked.control,
    ),
    no('control_power'),
  );
  await blocked.append(
    'native app repository key cannot appoint governance by itself',
    await blocked.signed(
      {
        $type: nativeRef('setOwner'),
        ...blockedContext(),
        owner: null,
      },
      blocked.app.key as P256PrivateKeyExportable,
    ),
    no('control_unappointed'),
  );
  const fixtures = [h.publicFixture(), secp.publicFixture(), web.publicFixture(), blocked.publicFixture()],
    cases = await replayAuthorityFixtures(fixtures);
  assert.equal(
    cases.length,
    h.vectors.length + secp.vectors.length + web.vectors.length + blocked.vectors.length + h.hostile.length,
  );
  await mkdir('.atseq-local', { recursive: true });
  await writeFile(
    process.env.ATSEQ_I2_CAPTURE_PATH ?? '.atseq-local/i2-public-vectors.json',
    JSON.stringify(fixtures) + '\n',
  );
  console.log(
    JSON.stringify({
      cases,
      authoritySnapshotBytes: Buffer.byteLength(JSON.stringify(nativeAuthoritySnapshot(h.state))),
      retainedPublicFixtureBytes: Buffer.byteLength(JSON.stringify(fixtures)),
      noPrivateKeysRetained: true,
    }),
  );
});
