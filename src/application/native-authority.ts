/** Pure ordered authority. A snapshot is data, never an accepted-state capability. */
import { deepFreeze } from '../core/freeze.ts';
import { canonicalJson } from '../core/values.ts';
import { AtseqError, ProtocolError } from '../core/errors.ts';
import { nativeRef } from '../protocol/native-schema.ts';
import {
  NativeAnchor,
  nativeRetryIdentity,
  type ControlAppointment,
  type ControlPair,
  type NativeAccountOperation,
  type NativeAssignRole,
  type NativeControl,
  type NativeGrant,
  type NativeSignedRequest,
  type NativeEntry,
} from '../protocol/native-wire.ts';
import {
  authenticatedAuthorityEntry,
  type AuthenticatedAuthorityEntry,
  type AuthorityObservation,
} from './native-authority-evidence.ts';

export interface AuthorityEpochRow {
  cid: string;
  id: string;
  previous: string | null;
}
export interface AuthorityFloor {
  cid: string;
  root: string;
  rev: string;
  signingKeyDid: string;
  pdsOrigin: string;
  assuranceClass: 'plc-audit-v1' | 'web-observation-v1';
}
export interface AuthorityPrincipalRow {
  principal: string;
  epoch: string | null;
  epochs: AuthorityEpochRow[];
  observation: AuthorityFloor | null;
}
export interface AuthorityGrantRow {
  principal: string;
  id: string;
  cid: string | null;
  grant: NativeGrant | null;
  revoked: boolean;
}
export interface AuthorityRoleRow {
  principal: string;
  role: string;
  enabled: boolean;
  revision: string;
}
/** Closed plain-JSON checkpoint projection. No proof, token, private key or live resolver state. */
export interface NativeAuthoritySnapshot {
  format: 'atseq-native-authority';
  version: 1;
  app: string;
  genesis: string;
  activeDefinition: string;
  frontier: { position: number; entry: string };
  control: { tip: string; appointments: ControlAppointment[]; owner: string | null; recoverGovernance: boolean };
  roles: AuthorityRoleRow[];
  principals: AuthorityPrincipalRow[];
  grants: AuthorityGrantRow[];
  consumedObservations: string[];
  requests: string[];
  retries: string[];
}
declare const stateBrand: unique symbol;
export interface NativeAuthorityState {
  readonly [stateBrand]: true;
}
const states = new WeakMap<object, Readonly<NativeAuthoritySnapshot>>();
export type NativeAuthorityOutcome = { decision: 'effective' } | { decision: 'ineffective'; reason: string };
function invalid(message: string): never {
  throw new ProtocolError('envelope', message);
}
function stateData(value: NativeAuthorityState): Readonly<NativeAuthoritySnapshot> {
  const data = value && typeof value === 'object' ? states.get(value) : undefined;
  if (!data) invalid('Expected accepted native authority state capability');
  return data;
}
const ineffective = (reason: string): NativeAuthorityOutcome => ({ decision: 'ineffective', reason });
const effective = (): NativeAuthorityOutcome => ({ decision: 'effective' });
function key(pair: ControlPair) {
  return JSON.stringify([pair.principal, pair.actorKey]);
}
function roleKey(pair: { principal: string; role: string }) {
  return JSON.stringify([pair.principal, pair.role]);
}
function grantKey(row: { principal: string; id: string }) {
  return JSON.stringify([row.principal, row.id]);
}
function ascii(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}
function mint(value: NativeAuthoritySnapshot): NativeAuthorityState {
  value.roles.sort((a, b) => ascii(roleKey(a), roleKey(b)));
  value.principals.sort((a, b) => ascii(a.principal, b.principal));
  value.principals.forEach((row) => row.epochs.sort((a, b) => ascii(a.cid, b.cid)));
  value.grants.sort((a, b) => ascii(grantKey(a), grantKey(b)));
  value.control.appointments.sort((a, b) => ascii(key(a), key(b)));
  value.control.appointments.forEach((row) => row.powers.sort(ascii));
  value.requests.sort(ascii);
  value.retries.sort(ascii);
  value.consumedObservations.sort(ascii);
  const capability = Object.freeze({}) as NativeAuthorityState;
  states.set(capability, deepFreeze(value));
  return capability;
}
/** Explicit external app/genesis trust choice; no native publication inferred here. */
export async function openNativeAuthority(anchor: NativeAnchor): Promise<NativeAuthorityState> {
  const verified = await NativeAnchor.from(anchor.genesis, { app: anchor.genesis.app, genesis: anchor.cid });
  return mint({
    format: 'atseq-native-authority',
    version: 1,
    app: verified.genesis.app,
    genesis: verified.cid,
    activeDefinition: verified.genesis.definition.$link,
    frontier: { position: 0, entry: verified.cid },
    control: {
      tip: verified.cid,
      appointments: structuredClone(verified.genesis.control),
      owner: verified.genesis.owner,
      recoverGovernance: verified.genesis.recoverGovernance,
    },
    roles: verified.genesis.roles.map((row) => ({ ...row, enabled: true, revision: verified.cid })),
    principals: [],
    grants: [],
    consumedObservations: [],
    requests: [],
    retries: [],
  });
}
/** An owned projection. Changing it cannot change the accepted authority. */
export function nativeAuthoritySnapshot(state: NativeAuthorityState): NativeAuthoritySnapshot {
  return structuredClone(stateData(state));
}
/** Content/signature must be checked first. This preflight does not authenticate publication. */
export function assertNativeAuthorityContext(
  prior: NativeAuthorityState,
  entry: NativeEntry,
  requestCid: string,
): void {
  const state = stateData(prior);
  if (
    entry.app !== state.app ||
    entry.genesis.$link !== state.genesis ||
    state.frontier.position === Number.MAX_SAFE_INTEGER ||
    entry.position !== state.frontier.position + 1 ||
    entry.prev.$link !== state.frontier.entry
  )
    invalid('Authority entry does not extend accepted frontier');
  if (state.requests.includes(requestCid)) invalid('A request occurs twice in ordered history');
  let descriptor: string | undefined;
  if (entry.request.$type === nativeRef('accountOperation'))
    descriptor = (entry.request as NativeAccountOperation).observation.$link;
  else {
    const intent = (entry.request as NativeSignedRequest).intent;
    if (state.retries.includes(nativeRetryIdentity(intent))) invalid('Actor nonce occurs twice in ordered history');
    if (intent.operation.$type === nativeRef('recoverParticipant')) descriptor = intent.operation.observation.$link;
  }
  if (descriptor && state.consumedObservations.includes(descriptor))
    invalid('An observation descriptor is consumed twice');
}
function principal(state: NativeAuthoritySnapshot, did: string): AuthorityPrincipalRow {
  let row = state.principals.find((row) => row.principal === did);
  if (!row) {
    row = { principal: did, epoch: null, epochs: [], observation: null };
    state.principals.push(row);
  }
  return row;
}
function grantRow(state: NativeAuthoritySnapshot, did: string, id: string): AuthorityGrantRow {
  let row = state.grants.find((row) => row.principal === did && row.id === id);
  if (!row) {
    row = { principal: did, id, cid: null, grant: null, revoked: false };
    state.grants.push(row);
  }
  return row;
}
function floor(observation: AuthorityObservation): AuthorityFloor {
  const { cid, root, rev, signingKeyDid, pdsOrigin, assuranceClass } = observation;
  return { cid, root, rev, signingKeyDid, pdsOrigin, assuranceClass };
}
function normalFloor(row: AuthorityPrincipalRow, observation: AuthorityObservation): string | null {
  if (row.observation && observation.rev < row.observation.rev) return 'observation_rollback';
  if (row.observation && observation.rev === row.observation.rev && observation.root !== row.observation.root)
    return 'observation_conflict';
  // Observation freshness is independent of the requested delegated change.
  row.observation = floor(observation);
  return null;
}
function expected(
  row: AuthorityPrincipalRow,
  operation: { expectedEpoch: { $link: string } | null; expectedObservation: { $link: string } | null },
): boolean {
  return (
    row.epoch === (operation.expectedEpoch?.$link ?? null) &&
    (row.observation?.cid ?? null) === (operation.expectedObservation?.$link ?? null)
  );
}
function progressEpoch(row: AuthorityPrincipalRow, observation: AuthorityObservation, recovery = false): string | null {
  if (!observation.current || !observation.epochs.length) invalid('Operation lacks selected current epoch');
  const selected = observation.current.epoch.$link;
  if (
    recovery &&
    observation.epochs.some((candidate) =>
      row.epochs.some((old) => old.cid === candidate.cid || old.id === candidate.record.id.$bytes),
    )
  )
    return 'recovery_epoch_reused';
  if (!recovery && selected === row.epoch) return null;
  if (new Set(observation.epochs.map((candidate) => candidate.record.id.$bytes)).size !== observation.epochs.length)
    return recovery ? 'recovery_epoch_reused' : 'epoch_reused';
  for (const candidate of observation.epochs) {
    if (row.epochs.some((old) => old.cid === candidate.cid || old.id === candidate.record.id.$bytes))
      return 'epoch_reused';
  }
  if (!recovery && row.epoch !== null && observation.epochs.at(-1)!.record.previous?.$link !== row.epoch)
    return 'epoch_conflict';
  for (const candidate of observation.epochs)
    row.epochs.push({
      cid: candidate.cid,
      id: candidate.record.id.$bytes,
      previous: candidate.record.previous?.$link ?? null,
    });
  row.epoch = selected;
  return null;
}
function accountOperation(
  state: NativeAuthoritySnapshot,
  op: NativeAccountOperation,
  observation: AuthorityObservation,
): NativeAuthorityOutcome {
  const row = principal(state, op.principal),
    expectation = expected(row, op);
  const floorFailure = normalFloor(row, observation);
  if (floorFailure) return ineffective(floorFailure);
  if (!expectation) return ineffective('authority_stale');
  if (op.operation.$type === nativeRef('revokeGrant')) {
    const revoke = observation.revoke;
    if (!revoke) invalid('Revoke evidence missing from authenticated operation');
    if (revoke.app !== state.app || revoke.genesis.$link !== state.genesis) return ineffective('grant_scope');
    const target = grantRow(state, op.principal, revoke.id);
    if (target.revoked) return ineffective('authority_unchanged');
    target.revoked = true;
    return effective();
  }
  if (op.operation.$type === nativeRef('admitGrant')) {
    const grant = observation.grant;
    if (!grant) invalid('Grant evidence missing from authenticated operation');
    if (grant.app !== state.app || grant.genesis.$link !== state.genesis) return ineffective('grant_scope');
    const target = state.grants.find((row) => row.principal === op.principal && row.id === grant.id);
    if (target?.revoked) return ineffective('grant_revoked');
    if (target?.cid && target.cid !== op.operation.grant.cid.$link) return ineffective('grant_conflict');
    if (grant.epoch.$link !== observation.current?.epoch.$link) return ineffective('epoch_conflict');
    const epochFailure = progressEpoch(row, observation);
    if (epochFailure) return ineffective(epochFailure);
    if (target?.cid) return ineffective('authority_unchanged');
    Object.assign(grantRow(state, op.principal, grant.id), { cid: op.operation.grant.cid.$link, grant });
    return effective();
  }
  const previousEpoch = row.epoch;
  const epochFailure = progressEpoch(row, observation);
  if (epochFailure) return ineffective(epochFailure);
  return previousEpoch === row.epoch ? ineffective('authority_unchanged') : effective();
}
function liveGrant(
  state: NativeAuthoritySnapshot,
  signed: NativeSignedRequest,
  operation: NativeAssignRole,
): NativeAuthorityOutcome | NativeGrant {
  const intent = signed.intent,
    row = state.grants.find((row) => row.principal === intent.principal && row.id === operation.grant.id);
  if (!row?.grant) return ineffective('grant_unadmitted');
  if (row.cid !== operation.grant.cid.$link) return ineffective('grant_conflict');
  if (row.revoked) return ineffective('grant_revoked');
  if (
    row.grant.epoch.$link !== operation.epoch.$link ||
    state.principals.find((row) => row.principal === intent.principal)?.epoch !== operation.epoch.$link
  )
    return ineffective('grant_epoch');
  if (row.grant.actorKey !== intent.actorKey) return ineffective('grant_signer');
  return row.grant;
}
function assignment(
  state: NativeAuthoritySnapshot,
  target: string,
  role: string,
  enabled: boolean,
  expectedAssignment: { $link: string } | null,
  requestCid: string,
): NativeAuthorityOutcome {
  const current = state.roles.find((row) => row.principal === target && row.role === role);
  if ((current?.revision ?? null) !== (expectedAssignment?.$link ?? null)) return ineffective('role_stale');
  if ((current?.enabled ?? false) === enabled) return ineffective('role_unchanged');
  if (current) Object.assign(current, { enabled, revision: requestCid });
  else state.roles.push({ principal: target, role, enabled, revision: requestCid });
  return effective();
}
function assignRole(
  state: NativeAuthoritySnapshot,
  signed: NativeSignedRequest,
  requestCid: string,
): NativeAuthorityOutcome {
  const op = signed.intent.operation as NativeAssignRole;
  const grant = liveGrant(state, signed, op);
  if ('decision' in grant) return grant;
  if (state.control.owner !== signed.intent.principal) return ineffective('role_owner');
  if (!grant.assignRoles.includes(op.role)) return ineffective('role_scope');
  return assignment(state, op.target, op.role, op.enabled, op.expectedAssignment, requestCid);
}
function control(
  state: NativeAuthoritySnapshot,
  signed: NativeSignedRequest,
  requestCid: string,
  observation: AuthorityObservation | null,
  actual: { position: number; prev: { $link: string } },
): NativeAuthorityOutcome {
  const op = signed.intent.operation as NativeControl;
  if (op.position !== actual.position || op.prev.$link !== actual.prev.$link)
    return ineffective('control_context_stale');
  if (op.controlTip.$link !== state.control.tip) return ineffective('control_tip_stale');
  const appointment = state.control.appointments.find(
    (row) => row.principal === signed.intent.principal && row.actorKey === signed.intent.actorKey,
  );
  if (!appointment) return ineffective('control_unappointed');
  const recovery = new Set<string>([
    nativeRef('setRecovery'),
    nativeRef('recoverGovernance'),
    nativeRef('recoverParticipant'),
  ]).has(op.$type);
  if (!appointment.powers.includes(recovery ? 'recover' : 'govern')) return ineffective('control_power');
  let outcome: NativeAuthorityOutcome;
  if (op.$type === nativeRef('recoverParticipant')) {
    if (!observation) invalid('Recovery lacks authenticated observation');
    const existing = state.principals.find((row) => row.principal === op.target);
    const row = existing ?? { principal: op.target, epoch: null, epochs: [], observation: null };
    if (!expected(row, op)) return ineffective('authority_stale');
    const epochFailure = progressEpoch(row, observation, true);
    if (epochFailure) return ineffective(epochFailure);
    row.observation = floor(observation);
    if (!existing) state.principals.push(row);
    outcome = effective();
  } else if (op.$type === nativeRef('setOwner')) {
    if (state.control.owner === op.owner) return ineffective('control_unchanged');
    state.control.owner = op.owner;
    outcome = effective();
  } else if (op.$type === nativeRef('setRole')) {
    outcome = assignment(state, op.target, op.role, op.enabled, op.expectedAssignment, requestCid);
  } else if (op.$type === nativeRef('activate')) {
    throw new AtseqError('content_unavailable', 'Native activation/source derivation is not integrated');
  } else {
    let next: ControlAppointment[];
    if (op.$type === nativeRef('setControl')) {
      if (
        state.control.appointments.some(
          (old) =>
            old.powers.includes('recover') &&
            !op.control.some((row) => key(row) === key(old) && row.powers.join(',') === old.powers.join(',')),
        ) ||
        op.control.some(
          (row) =>
            row.powers.includes('recover') &&
            !state.control.appointments.some((old) => key(row) === key(old) && old.powers.includes('recover')),
        )
      )
        return ineffective('control_power');
      next = structuredClone(op.control);
    } else {
      const replaceRecover = op.$type === nativeRef('setRecovery');
      if (!replaceRecover && !state.control.recoverGovernance) return ineffective('control_power');
      const power = replaceRecover ? 'recover' : 'govern',
        selected = replaceRecover ? op.recovery : op.governance;
      next = state.control.appointments.map((row) => ({
        ...row,
        powers: row.powers.filter((value) => value !== power),
      }));
      for (const pair of selected) {
        let row = next.find((row) => key(row) === key(pair));
        if (!row) {
          row = { ...pair, powers: [] };
          next.push(row);
        }
        row.powers.push(power);
        row.powers.sort(ascii);
      }
      next = next.filter((row) => row.powers.length > 0).sort((a, b) => ascii(key(a), key(b)));
    }
    if (next.length > 16) return ineffective('control_map_limit');
    if (canonicalJson(next, 128 * 1024) === canonicalJson(state.control.appointments, 128 * 1024))
      return ineffective('control_unchanged');
    state.control.appointments = next;
    outcome = effective();
  }
  if (outcome.decision === 'effective') state.control.tip = requestCid;
  return outcome;
}

/** Atomic pure transition: any thrown missing/invalid/runtime failure leaves prior unchanged. */
export function interpretNativeAuthority(
  prior: NativeAuthorityState,
  authenticated: AuthenticatedAuthorityEntry,
): {
  state: NativeAuthorityState;
  outcome: NativeAuthorityOutcome;
} {
  const data = authenticatedAuthorityEntry(authenticated),
    next = nativeAuthoritySnapshot(prior),
    entry = data.entry;
  assertNativeAuthorityContext(prior, entry, data.requestCid);
  let outcome: NativeAuthorityOutcome;
  if (entry.request.$type === nativeRef('accountOperation')) {
    if (!data.observation) invalid('Account operation lacks authenticated observation');
    outcome = accountOperation(next, entry.request as NativeAccountOperation, data.observation);
  } else {
    const signed = entry.request as NativeSignedRequest,
      retry = nativeRetryIdentity(signed.intent);
    if (signed.intent.operation.$type === nativeRef('act'))
      throw new AtseqError('content_unavailable', 'Supported native action-contract derivation is not integrated');
    outcome =
      signed.intent.operation.$type === nativeRef('assignRole')
        ? assignRole(next, signed, data.requestCid)
        : control(next, signed, data.requestCid, data.observation, entry);
    next.retries.push(retry);
  }
  if (data.observation) next.consumedObservations.push(data.observation.cid);
  next.requests.push(data.requestCid);
  next.frontier = { position: entry.position, entry: data.entryCid };
  return { state: mint(next), outcome: deepFreeze(outcome) };
}
