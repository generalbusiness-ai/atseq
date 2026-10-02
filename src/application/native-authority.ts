/** Pure ordered authority. A snapshot is data, never an accepted-state capability. */
import { deepFreeze } from '../core/freeze.ts';
import { canonicalJson, jsonCopy, type Json } from '../core/values.ts';
import { SerialQueue } from '../core/queue.ts';
import { InterpretationError, PROFILE } from '../core/profile.ts';
import { evaluate, foldEvaluation } from '../runtime/evaluator.ts';
import { readNativeOutcome, type NativeOutcomeData } from '../protocol/native-outcome.ts';
import {
  assessNativeGenesisSource,
  assessNativeSource,
  readNativeSourceDefinition,
  nativeSourceAction,
  readNativeSourceAction,
  nativeSourceActionFold,
  validateNativeSourceState,
  validateNativeSourceAction,
  nativeSourceQueryProgram,
  validateNativeSourceQueryParams,
  validateNativeSourceQueryResult,
  type NativeSourceDefinition,
} from '../definition/native-source.ts';
import {
  NATIVE_SOURCE_CONTRACT,
  NATIVE_FOLD_FAILURE_STAGES,
  assertNativeSourceContract,
} from '../definition/native-source-contract.ts';
import type { NativeSourceReader, NativeSourceReadOptions } from '../definition/native-source-transport.ts';
import { AtseqError, ProtocolError, errorCode } from '../core/errors.ts';
import { nativeRef, NATIVE_NSID } from '../protocol/native-schema.ts';
import {
  NativeAnchor,
  type ControlAppointment,
  type ControlPair,
  type NativeAccountOperation,
  type NativeAssignRole,
  type NativeAct,
  nativeFoldMetadata,
  nativeFoldMetadataValues,
  validateNativeAccountDid,
  validateNativeDeviceKey,
  validateNativeGrantId,
  type NativeControl,
  type NativeGrant,
  type NativeSignedRequest,
  type NativeEntry,
} from '../protocol/native-wire.ts';
import {
  authenticatedAuthorityEntry,
  authenticateAuthorityEntry,
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
/** Owned compact authority projection. Parsed DATA never accepts live state. */
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
}
declare const stateBrand: unique symbol;
export interface NativeAuthorityState {
  readonly [stateBrand]: true;
}
import {
  openNativePrefix,
  stageNativePrefix,
  acceptNativePrefix,
  assertNativePrefixExtension,
  nativePrefixEntry,
  nativePrefixCandidate,
  nativePrefixStatus,
  nativePrefixMethod,
  nativePrefixInventory,
  lookupNativeRetry,
  type NativePrefix,
  type NativePrefixPublication,
} from './native-prefix.ts';
import { readNativeValue } from '../protocol/native-wire.ts';
import { sameBytes, encodeBlock, contentCid, link, WIRE } from '../protocol/wire.ts';
import { checkpointPayloadIdentity, CHECKPOINT_DATA_BOUNDS } from '../protocol/checkpoint-data.ts';
import { checkpointAuthorityData } from './checkpoint-authority-data.ts';
const statePrefixes = new WeakMap<object, NativePrefix>();
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
function mint(value: NativeAuthoritySnapshot, prefix?: NativePrefix): NativeAuthorityState {
  value.roles.sort((a, b) => ascii(roleKey(a), roleKey(b)));
  value.principals.sort((a, b) => ascii(a.principal, b.principal));
  value.principals.forEach((row) => row.epochs.sort((a, b) => ascii(a.cid, b.cid)));
  value.grants.sort((a, b) => ascii(grantKey(a), grantKey(b)));
  value.control.appointments.sort((a, b) => ascii(key(a), key(b)));
  value.control.appointments.forEach((row) => row.powers.sort(ascii));
  const capability = Object.freeze({}) as NativeAuthorityState;
  states.set(capability, deepFreeze(value));
  if (prefix) statePrefixes.set(capability, prefix);
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
  });
}
/** An owned projection. Changing it cannot change the accepted authority. */
export function nativeAuthoritySnapshot(state: NativeAuthorityState): NativeAuthoritySnapshot {
  return structuredClone(stateData(state));
}
/** Content/signature must be checked first. This preflight does not authenticate publication. */
export function assertNativeAuthorityContext(prior: NativeAuthorityState, entry: NativeEntry): void {
  const state = stateData(prior);
  if (
    entry.app !== state.app ||
    entry.genesis.$link !== state.genesis ||
    state.frontier.position === Number.MAX_SAFE_INTEGER ||
    entry.position !== state.frontier.position + 1 ||
    entry.prev.$link !== state.frontier.entry
  )
    invalid('Authority entry does not extend accepted frontier');
}
export function nativeAuthorityFrontier(state: NativeAuthorityState) {
  return structuredClone(stateData(state).frontier);
}
export function nativeAuthorityPrefix(state: NativeAuthorityState): NativePrefix | null {
  stateData(state);
  return statePrefixes.get(state) ?? null;
}
/** Explicit full historical DATA export; no acceptance factory. */
export function nativeAuthorityHistory(state: NativeAuthorityState) {
  const snapshot = nativeAuthoritySnapshot(state),
    prefix = nativeAuthorityPrefix(state);
  if (!prefix && snapshot.frontier.position !== 0) invalid('Authority lacks verified history owner');
  return {
    ...snapshot,
    ...(prefix
      ? nativePrefixInventory(prefix, snapshot.frontier.position)
      : { requests: [], retries: [], consumedObservations: [] }),
  };
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
type GrantIdentity = Pick<NativeSignedRequest['intent'], 'principal' | 'actorKey'>;
type ActionAttempt = Pick<NativeAct, 'action' | 'execution'> & Partial<Pick<NativeAct, 'grant' | 'epoch'>>;
function eligibleGrantRow(
  row: AuthorityGrantRow | undefined,
  principalEpoch: string | null | undefined,
  identity: GrantIdentity,
  operation: Partial<Pick<NativeAct, 'grant' | 'epoch'>>,
): NativeAuthorityOutcome | NativeGrant {
  if (!row?.grant) return ineffective('grant_unadmitted');
  if (!operation.grant || !operation.epoch) throw new AtseqError('runtime_fault', 'Admitted grant context missing');
  if (row.cid !== operation.grant.cid.$link) return ineffective('grant_conflict');
  if (row.revoked) return ineffective('grant_revoked');
  if (row.grant.epoch.$link !== operation.epoch.$link || principalEpoch !== operation.epoch.$link)
    return ineffective('grant_epoch');
  if (row.grant.actorKey !== identity.actorKey) return ineffective('grant_signer');
  return row.grant;
}
function liveGrant(
  state: NativeAuthoritySnapshot,
  identity: GrantIdentity,
  operation: NativeAssignRole | NativeAct,
): NativeAuthorityOutcome | NativeGrant {
  const row = state.grants.find((row) => row.principal === identity.principal && row.id === operation.grant.id);
  // Preserve the ordinary lookup's short circuit and predicate order.
  const epoch =
    row?.grant &&
    !row.revoked &&
    row.cid === operation.grant.cid.$link &&
    row.grant.epoch.$link === operation.epoch.$link
      ? state.principals.find((row) => row.principal === identity.principal)?.epoch
      : undefined;
  return eligibleGrantRow(row, epoch, identity, operation);
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
  const grant = liveGrant(state, signed.intent, op);
  if ('decision' in grant) return grant;
  if (state.control.owner !== signed.intent.principal) return ineffective('role_owner');
  if (!grant.assignRoles.includes(op.role)) return ineffective('role_scope');
  return assignment(state, op.target, op.role, op.enabled, op.expectedAssignment, requestCid);
}
function controlPrefix(
  state: NativeAuthoritySnapshot,
  signed: NativeSignedRequest,
  actual: { position: number; prev: { $link: string } },
): NativeAuthorityOutcome | null {
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
  return null;
}
function control(
  state: NativeAuthoritySnapshot,
  signed: NativeSignedRequest,
  requestCid: string,
  observation: AuthorityObservation | null,
  actual: { position: number; prev: { $link: string } },
): NativeAuthorityOutcome {
  const op = signed.intent.operation as NativeControl;
  const denied = controlPrefix(state, signed, actual);
  if (denied) return denied;
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
  const data = authenticatedAuthorityEntry(authenticated, prior),
    next = nativeAuthoritySnapshot(prior),
    entry = data.entry;
  assertNativeAuthorityContext(prior, entry);
  let outcome: NativeAuthorityOutcome;
  if (entry.request.$type === nativeRef('accountOperation')) {
    if (!data.observation) invalid('Account operation lacks authenticated observation');
    outcome = accountOperation(next, entry.request as NativeAccountOperation, data.observation);
  } else {
    const signed = entry.request as NativeSignedRequest;
    if (signed.intent.operation.$type === nativeRef('act'))
      throw new AtseqError('content_unavailable', 'Supported native action-contract derivation is not integrated');
    outcome =
      signed.intent.operation.$type === nativeRef('assignRole')
        ? assignRole(next, signed, data.requestCid)
        : control(next, signed, data.requestCid, data.observation, entry);
  }
  return { state: finishAuthority(next, data), outcome: deepFreeze(outcome) };
}

function finishAuthority(
  next: NativeAuthoritySnapshot,
  data: ReturnType<typeof authenticatedAuthorityEntry>,
): NativeAuthorityState {
  next.frontier = { position: data.entry.position, entry: data.entryCid };
  return mint(next, data.prefix);
}
export interface NativeApplicationProjection {
  format: 'atseq-native-application';
  version: 1;
  app: string;
  genesis: string;
  definition: string;
  state: Json;
  authority: NativeAuthoritySnapshot;
  publication: ReturnType<typeof nativePrefixStatus> | null;
  outcomes: { position: number; entry: string; request: string; outcome: NativeOutcomeData }[];
}
/** A trusted local adapter could not determine whether its transaction committed.
 * This signal only blocks the instance; it cannot authorize restore or acceptance. */
export class NativePersistenceUncertain extends AtseqError {
  constructor() {
    super('persistence_failed', 'Native local commit requires durable inspection');
  }
}
interface ApplicationGeneration {
  source: NativeSourceDefinition;
  domain: Readonly<Json>;
  authority: NativeAuthorityState;
  outcomeBoundary: number;
  prefix: NativePrefix | null;
}
/** Internal kernel data. Supported package/barrel exports remain unchanged. */
export interface NativeSubjectSelector {
  principal: string;
  actorKey: string;
  grantId?: string;
}
export interface NativeDiscoveryLimits {
  rows?: number;
  bytes?: number;
}
export interface NativeDiscoveryWork {
  rowVisits: number;
  candidateVisits: number;
  scopeComparisons: number;
  ownerChargedBytes: number;
  byteAccounting: 'conservative-owner-bounds';
  memo: 'none' | 'computed' | 'awaited' | 'reused';
  opaqueAllocations: 'unmeasured';
}
export interface NativeActorBasis {
  app: string;
  genesis: string;
  definition: string;
  frontier: NativeAuthoritySnapshot['frontier'];
  nextPosition: number;
  publication: ReturnType<typeof nativePrefixStatus> | null;
  publicationMethod: ReturnType<typeof nativePrefixMethod> | null;
  executionAssurance: 'genesis-replay';
  principalObservation: AuthorityFloor | null;
  state: string;
  authority: string;
}
export type NativeActionDiscovery = {
  action: string;
  execution: string;
} & (
  | { kind: 'eligible'; grant: { id: string; cid: string; epoch: string } }
  | { kind: 'denied'; reason: string }
  | { kind: 'unavailable'; code: string }
);
type LocalUnavailable = { kind: 'unavailable'; code: string; work: NativeDiscoveryWork };
export type NativeActorDiscovery =
  | LocalUnavailable
  | {
      kind: 'available';
      label: 'advisory';
      subject: NativeSubjectSelector;
      basis: NativeActorBasis;
      actions: NativeActionDiscovery[];
      work: NativeDiscoveryWork;
    };
export type NativeActorSimulation =
  | LocalUnavailable
  | {
      kind: 'available';
      label: 'simulation';
      subject: NativeSubjectSelector;
      basis: NativeActorBasis;
      action: NativeActionDiscovery;
      payload: string;
      outcome: NativeOutcomeData;
      successor: Json | null;
      evaluation: { kind: 'available'; steps: number; inspectedBytes: number } | { kind: 'unavailable' };
      work: NativeDiscoveryWork;
    };
export type NativeActorPreflight =
  | LocalUnavailable
  | {
      kind: 'available';
      label: 'advisory';
      subject: NativeSubjectSelector;
      basis: NativeActorBasis;
      action: NativeActionDiscovery;
      payload: string;
      outcome: NativeOutcomeData;
      work: NativeDiscoveryWork;
    };
interface SubjectFacts {
  rows: AuthorityGrantRow[];
  epoch: string | null | undefined;
  roles: Set<string>;
  observation: AuthorityFloor | null;
}
interface CandidateFacts extends SubjectFacts {
  row: AuthorityGrantRow | undefined;
  ledger: DiscoveryLedger;
}
interface GenerationCommitments {
  state: string;
  authority: string;
}
interface CommitmentMemo {
  promise: Promise<GenerationCommitments>;
  complete: boolean;
}
const generationCommitments = new WeakMap<ApplicationGeneration, CommitmentMemo>();
const DISCOVERY_ROWS = 100_000,
  DISCOVERY_BYTES = 16 * 1024 * 1024;
const discoveryEncoder = new TextEncoder();
/** Owner policy, not interpretation semantics or a streaming/peak-heap limit.
 * Codec/schema dependencies remain unchanged. Bounds reserve known owner work;
 * opaque dependency/engine allocations are explicitly not measured by this ledger. */
class DiscoveryLedger {
  rowVisits = 0;
  candidateVisits = 0;
  scopeComparisons = 0;
  ownerChargedBytes = 0;
  memo: NativeDiscoveryWork['memo'] = 'none';
  lastCopyBound = 0;
  readonly rows: number;
  readonly bytes: number;
  constructor(options: NativeDiscoveryLimits = {}) {
    if (
      !options ||
      typeof options !== 'object' ||
      Array.isArray(options) ||
      Object.getPrototypeOf(options) !== Object.prototype ||
      Object.getOwnPropertySymbols(options).length
    )
      throw new ProtocolError('input', 'Expected plain local discovery limits');
    for (const key of Object.getOwnPropertyNames(options)) {
      const property = Object.getOwnPropertyDescriptor(options, key)!;
      if (!['rows', 'bytes'].includes(key) || !('value' in property) || !property.enumerable)
        throw new ProtocolError('input', 'Unknown local discovery limit');
      const maximum = key === 'rows' ? DISCOVERY_ROWS : DISCOVERY_BYTES;
      if (!Number.isSafeInteger(property.value) || property.value < 1 || property.value > maximum)
        throw new ProtocolError('input', 'Discovery limits must be smaller positive safe integers');
    }
    this.rows = options.rows ?? DISCOVERY_ROWS;
    this.bytes = options.bytes ?? DISCOVERY_BYTES;
  }
  row(candidate = false): void {
    if (this.rowVisits >= this.rows) throw new AtseqError('content_unavailable', 'Local discovery row budget');
    this.rowVisits++;
    if (candidate) this.candidateVisits++;
  }
  charge(bytes: number): void {
    if (!Number.isSafeInteger(bytes) || bytes < 0 || bytes > this.bytes - this.ownerChargedBytes)
      throw new AtseqError('content_unavailable', 'Local discovery byte budget');
    this.ownerChargedBytes += bytes;
  }
  text(value: unknown, maximum = PROFILE.inputBytes): string {
    return canonicalJson(value, maximum, 32, (size) => this.charge(size));
  }
  copy(value: unknown, maximum = PROFILE.inputBytes): Json {
    const text = this.text(value, maximum);
    // UTF-8 output length was charged by canonicalJson; parse ownership gets
    // a conservative 3x bound from UTF-16 length before the actual parse.
    this.charge(3 * text.length);
    this.lastCopyBound = 3 * text.length;
    return JSON.parse(text) as Json;
  }
  raw(value: unknown, maximum: number): Uint8Array {
    const text = this.text(value, maximum);
    this.charge(3 * text.length);
    return discoveryEncoder.encode(text);
  }
  schema(knownCanonicalBytes: number): void {
    // Two passes over supplied data plus one possibly changed result, each
    // still subject to the existing schema PROFILE.inputBytes cap.
    this.charge(2 * knownCanonicalBytes + PROFILE.inputBytes);
  }
  codec(knownCanonicalBytes: number): void {
    // Canonical validation, wrappers/link work and conservative CBOR
    // encode/copy/hash upper bounds. This is not actual encoded byte telemetry.
    this.charge(8 * knownCanonicalBytes + 4 * WIRE.blockBytes);
  }
  checkpoint(rawBytes: number): void {
    // Reserve each unchanged 32-KiB chunk and the unchanged manifest once.
    // Frame overhead includes ASCII type/key text and container headers.
    const chunkFrame = 2 * (NATIVE_NSID.content.length + nativeRef('byteChunk').length) + 128;
    const manifestFrame = 2 * (NATIVE_NSID.content.length + nativeRef('byteManifest').length) + 128;
    const chunks = Math.ceil(rawBytes / 32768);
    let bound = 0;
    for (let offset = 0; offset < rawBytes; offset += 32768) {
      const n = Math.min(32768, rawBytes - offset),
        json = 4 * Math.ceil(n / 3) + chunkFrame;
      // JSON + base64 checks, raw slice/conversion passes, CBOR copy/hash,
      // and fixed-size CID formatting. No second framing/encoding is run.
      bound += 2 * json + 4 * n + 2 * (n + chunkFrame) + 128;
    }
    // SHA-256 DAG-CBOR links use fewer than 128 JSON / 64 CBOR bytes each.
    const manifestJson = manifestFrame + 128 * chunks + String(rawBytes).length;
    bound += 2 * manifestJson + 2 * (manifestFrame + 64 * chunks) + 128 * (chunks + 1);
    this.charge(bound);
  }
  work(): NativeDiscoveryWork {
    return {
      rowVisits: this.rowVisits,
      candidateVisits: this.candidateVisits,
      scopeComparisons: this.scopeComparisons,
      ownerChargedBytes: this.ownerChargedBytes,
      byteAccounting: 'conservative-owner-bounds',
      memo: this.memo,
      opaqueAllocations: 'unmeasured',
    };
  }
}
function authorityMetadataLength(basis: NativeActorBasis, selector: NativeSubjectSelector, execution: string): number {
  return 3 * (basis.app.length + basis.genesis.length + selector.principal.length + execution.length) + 128;
}
type ProcessInput = Omit<NativePrefixPublication, 'anchor'> & { entry: unknown };
export interface NativeApplication {
  discover(subject: unknown, limits?: NativeDiscoveryLimits): Promise<NativeActorDiscovery>;
  simulate(
    subject: unknown,
    action: string,
    payload: unknown,
    limits?: NativeDiscoveryLimits,
  ): Promise<NativeActorSimulation>;
  preflight(
    subject: unknown,
    action: string,
    payload: unknown,
    limits?: NativeDiscoveryLimits,
  ): Promise<NativeActorPreflight>;
  snapshot(): NativeApplicationProjection;
  prefix(): NativePrefix | null;
  publication(): ReturnType<typeof nativePrefixStatus> | null;
  retry(request: unknown): Promise<{
    receipt: Awaited<ReturnType<typeof lookupNativeRetry>>;
    outcome: NativeOutcomeData | null;
    frontier: NativeAuthoritySnapshot['frontier'];
    publication: ReturnType<typeof nativePrefixStatus>;
  }>;
  process(input: ProcessInput): Promise<{ frontier: { position: number; entry: string }; outcome: NativeOutcomeData }>;
  query(
    name: string,
    params: unknown,
  ): Promise<{
    frontier: { position: number; entry: string };
    result: { kind: 'available'; value: Json } | { kind: 'unavailable'; code: string };
  }>;
}
function framework(reason: string): NativeOutcomeData {
  return deepFreeze(readNativeOutcome({ decision: 'ineffective', source: 'framework', reason }));
}
function authorityOutcome(outcome: NativeAuthorityOutcome): NativeOutcomeData {
  return outcome.decision === 'effective' ? deepFreeze({ decision: 'effective' }) : framework(outcome.reason);
}
function stageError(error: unknown, codes: readonly string[]): error is InterpretationError {
  return (
    error instanceof InterpretationError && error.constructor === InterpretationError && codes.includes(error.code)
  );
}
/** Internal only: constructor is not exported or reachable through an application instance. */
class NativeApplicationOwner {
  #current: ApplicationGeneration;
  #rows: NativeApplicationProjection['outcomes'] = [];
  #queue = new SerialQueue();
  #poisoned = false;
  constructor(
    private readonly anchor: NativeAnchor,
    private readonly reader: NativeSourceReader,
    private readonly localOptions: NativeSourceReadOptions,
    private readonly persist: ((projection: NativeApplicationProjection) => Promise<void>) | undefined,
    initial: ApplicationGeneration,
  ) {
    this.#current = initial;
  }
  async #persist(projection: NativeApplicationProjection): Promise<void> {
    try {
      await this.persist?.(projection);
    } catch (error) {
      if (error instanceof NativePersistenceUncertain) this.#poisoned = true;
      throw error;
    }
  }
  #healthy(): void {
    if (this.#poisoned) throw new AtseqError('runtime_fault', 'Native application requires durable reconciliation');
  }
  #same(base: ApplicationGeneration): void {
    this.#healthy();
    if (this.#current !== base)
      throw new AtseqError('runtime_fault', 'Native application generation changed during interpretation');
  }
  #retained(base: ApplicationGeneration, ledger?: DiscoveryLedger): void {
    this.#healthy();
    if (base.prefix && ledger) ledger.charge(8 * (this.anchor.genesis.app.length + this.anchor.cid.length + 1024));
    if (base.prefix && nativePrefixStatus(base.prefix).contradiction)
      throw new AtseqError('content_unavailable', 'Captured native publication is contradicted');
  }
  #actionGate(
    source: NativeSourceDefinition,
    authority: NativeAuthoritySnapshot,
    identity: GrantIdentity,
    action: ActionAttempt,
    prepared?: CandidateFacts,
  ): { outcome: NativeOutcomeData } | { selected: NonNullable<ReturnType<typeof nativeSourceAction>> } {
    if (prepared) prepared.ledger.row(true);
    const grant = prepared
      ? eligibleGrantRow(prepared.row, prepared.epoch, identity, action)
      : liveGrant(authority, identity, action as NativeAct);
    if ('decision' in grant) return { outcome: authorityOutcome(grant) };
    if (
      !grant.actions.some((pair) => {
        if (prepared) prepared.ledger.scopeComparisons++;
        return pair.action === action.action && pair.execution.$link === action.execution.$link;
      })
    )
      return { outcome: framework('grant_scope') };
    const selected = nativeSourceAction(source, action.action);
    if (!selected) return { outcome: framework('unknown_action') };
    const facts = readNativeSourceAction(selected);
    const authorization = facts.contract.body as { authorization: { $type: string; role?: string } };
    const rule = authorization.authorization;
    if (
      rule.$type === nativeRef('requiredRole') &&
      !(prepared
        ? prepared.roles.has(rule.role!)
        : authority.roles.some((row) => row.principal === identity.principal && row.role === rule.role && row.enabled))
    )
      return { outcome: framework('role_missing') };
    if (facts.execution !== action.execution.$link) return { outcome: framework('execution_changed') };
    return { selected };
  }
  #actionInput(
    source: NativeSourceDefinition,
    selected: NonNullable<ReturnType<typeof nativeSourceAction>>,
    payload: Json,
    ledger?: DiscoveryLedger,
    canonicalBytes?: number,
  ): NativeOutcomeData | null {
    if (ledger) ledger.schema(canonicalBytes!);
    let inputDenied = false;
    try {
      validateNativeSourceAction(source, selected, payload);
    } catch (error) {
      if (!stageError(error, Object.keys(NATIVE_FOLD_FAILURE_STAGES.inputSchema))) throw error;
      inputDenied = true;
    }
    return inputDenied ? framework('invalid_action') : null;
  }
  async #action(
    base: ApplicationGeneration,
    authority: NativeAuthoritySnapshot,
    domain: Json,
    identity: GrantIdentity,
    action: NativeAct,
    metadata: Record<string, Json>,
    guard: 'ordered' | 'retained',
    prepared?: CandidateFacts,
    ledger?: DiscoveryLedger,
    canonicalBytes?: number,
  ): Promise<{
    outcome: NativeOutcomeData;
    successor: Json | null;
    evaluation: { steps: number; inspectedBytes: number } | null;
  }> {
    const gate = this.#actionGate(base.source, authority, identity, action, prepared);
    if ('outcome' in gate) return { outcome: gate.outcome, successor: null, evaluation: null };
    // Program/metadata retrieval and the caller's stored-state ownership stay outside stage catches.
    const program = nativeSourceActionFold(gate.selected);
    const inputDenied = this.#actionInput(base.source, gate.selected, action.payload, ledger, canonicalBytes);
    if (inputDenied) return { outcome: inputDenied, successor: null, evaluation: null };
    let evaluated: Awaited<ReturnType<typeof foldEvaluation>> | undefined;
    let foldDenied: NativeOutcomeData | undefined;
    try {
      evaluated = await foldEvaluation(program, { state: domain, act: action.payload, meta: metadata });
    } catch (error) {
      if (!stageError(error, NATIVE_FOLD_FAILURE_STAGES.evaluateAndFold)) throw error;
      foldDenied = framework(`fold_failed/${error.code}`);
    }
    if (guard === 'ordered') this.#same(base);
    else this.#retained(base, ledger);
    if (foldDenied) return { outcome: foldDenied, successor: null, evaluation: null };
    const result = evaluated!.result;
    const evaluation = { steps: evaluated!.steps, inspectedBytes: evaluated!.inspectedBytes };
    if (result.decision === 'ineffective')
      return { outcome: deepFreeze(readNativeOutcome({ ...result, source: 'fold' })), successor: null, evaluation };
    let stateDenied: NativeOutcomeData | undefined;
    if (ledger) ledger.schema(PROFILE.stateBytes);
    try {
      validateNativeSourceState(base.source, result.state);
    } catch (error) {
      if (!stageError(error, NATIVE_FOLD_FAILURE_STAGES.successorState)) throw error;
      stateDenied = framework(`fold_failed/${error.code}`);
    }
    return {
      outcome: stateDenied ?? deepFreeze({ decision: 'effective' }),
      successor: stateDenied ? null : result.state,
      evaluation,
    };
  }
  #selector(value: unknown, ledger: DiscoveryLedger): NativeSubjectSelector {
    const selector = ledger.copy(value) as unknown as NativeSubjectSelector;
    if (
      !selector ||
      typeof selector !== 'object' ||
      Array.isArray(selector) ||
      Object.keys(selector).some((name) => !['principal', 'actorKey', 'grantId'].includes(name)) ||
      typeof selector.principal !== 'string' ||
      typeof selector.actorKey !== 'string'
    )
      throw new ProtocolError('input', 'Expected a complete principal/device selector');
    validateNativeAccountDid(selector.principal);
    if (selector.grantId !== undefined) validateNativeGrantId(selector.grantId);
    return selector;
  }
  #subject(
    selector: NativeSubjectSelector,
    authority: Readonly<NativeAuthoritySnapshot>,
    ledger: DiscoveryLedger,
  ): SubjectFacts {
    const facts: SubjectFacts = { rows: [], epoch: undefined, roles: new Set(), observation: null };
    for (const row of authority.principals) {
      ledger.row();
      if (row.principal === selector.principal) {
        facts.epoch = row.epoch;
        facts.observation = row.observation;
      }
    }
    for (const row of authority.roles) {
      ledger.row();
      if (row.principal === selector.principal && row.enabled) {
        ledger.charge(3 * row.role.length);
        facts.roles.add(row.role);
      }
    }
    for (const row of authority.grants) {
      ledger.row();
      if (
        row.principal === selector.principal &&
        (selector.grantId === undefined ? row.grant !== null : row.id === selector.grantId)
      ) {
        ledger.charge(16); // Conservative reference-collection work, not heap telemetry.
        facts.rows.push(row);
      }
    }
    return facts;
  }
  #authorityRows(authority: Readonly<NativeAuthoritySnapshot>, ledger: DiscoveryLedger): void {
    ledger.row();
    for (const row of authority.control.appointments) {
      ledger.row();
      for (const _ of row.powers) ledger.row();
    }
    for (const _ of authority.roles) ledger.row();
    for (const row of authority.principals) {
      ledger.row();
      for (const _ of row.epochs) ledger.row();
      if (row.observation) ledger.row();
    }
    for (const row of authority.grants) {
      ledger.row();
      if (row.grant) {
        ledger.row();
        for (const _ of row.grant.actions) ledger.row();
        for (const _ of row.grant.assignRoles) ledger.row();
      }
    }
  }
  async #commitments(base: ApplicationGeneration, ledger: DiscoveryLedger): Promise<GenerationCommitments> {
    const existing = generationCommitments.get(base);
    if (existing) {
      ledger.memo = existing.complete ? 'reused' : 'awaited';
      return existing.promise;
    }
    ledger.memo = 'computed';
    const memo: CommitmentMemo = { complete: false, promise: undefined! };
    memo.promise = Promise.resolve()
      .then(async () => {
        const authority = stateData(base.authority);
        this.#retained(base, ledger);
        this.#authorityRows(authority, ledger);
        const state = ledger.raw(base.domain, PROFILE.stateBytes);
        const compact = ledger.raw(checkpointAuthorityData(authority), CHECKPOINT_DATA_BOUNDS.payloadBytes);
        ledger.checkpoint(state.length);
        const stateCid = await checkpointPayloadIdentity(state);
        this.#retained(base, ledger);
        ledger.checkpoint(compact.length);
        const authorityCid = await checkpointPayloadIdentity(compact);
        this.#retained(base, ledger);
        memo.complete = true;
        return Object.freeze({ state: stateCid, authority: authorityCid });
      })
      .catch((error) => {
        if (generationCommitments.get(base) === memo) generationCommitments.delete(base);
        throw error;
      });
    generationCommitments.set(base, memo);
    return memo.promise;
  }
  async #basis(base: ApplicationGeneration, facts: SubjectFacts, ledger: DiscoveryLedger): Promise<NativeActorBasis> {
    this.#retained(base, ledger);
    const authority = stateData(base.authority);
    if (!Number.isSafeInteger(authority.frontier.position + 1))
      throw new AtseqError('content_unavailable', 'No safe simulated successor position');
    if (base.prefix) ledger.charge(8 * (this.anchor.genesis.app.length + this.anchor.cid.length + 1024));
    const publication = base.prefix ? nativePrefixStatus(base.prefix) : null;
    // Fixed-size metadata copy plus owned principal floor are charged in result
    // ownership; there is no identity evidence/history inventory copy here.
    const commitments = await this.#commitments(base, ledger);
    this.#retained(base, ledger);
    return {
      app: authority.app,
      genesis: authority.genesis,
      definition: authority.activeDefinition,
      frontier: { ...authority.frontier },
      nextPosition: authority.frontier.position + 1,
      publication,
      publicationMethod: base.prefix ? nativePrefixMethod(base.prefix) : null,
      executionAssurance: 'genesis-replay',
      principalObservation: facts.observation,
      ...commitments,
    };
  }
  #select(
    base: ApplicationGeneration,
    selector: NativeSubjectSelector,
    facts: SubjectFacts,
    name: string,
    ledger: DiscoveryLedger,
  ): { result: NativeActionDiscovery; attempt: ActionAttempt; prepared: CandidateFacts } {
    ledger.row();
    const sourceAction = nativeSourceAction(base.source, name);
    if (!sourceAction) throw new ProtocolError('input', 'Action is absent from admitted definition');
    const execution = readNativeSourceAction(sourceAction).execution;
    const action = { action: name, execution: link(execution) };
    let first: NativeOutcomeData | undefined;
    const authority = stateData(base.authority);
    for (const row of facts.rows) {
      const attempt: ActionAttempt = row.grant
        ? {
            ...action,
            grant: { id: row.id, cid: link(row.cid!) },
            epoch: row.grant.epoch,
          }
        : action;
      const prepared: CandidateFacts = { ...facts, row, ledger };
      const gate = this.#actionGate(base.source, authority, selector, attempt, prepared);
      if (!('outcome' in gate))
        return {
          result: {
            ...action,
            execution,
            kind: 'eligible',
            grant: {
              id: row.id,
              cid: row.cid!,
              epoch: row.grant!.epoch.$link,
            },
          },
          attempt,
          prepared,
        };
      first ??= gate.outcome;
    }
    const prepared: CandidateFacts = { ...facts, row: facts.rows[0], ledger };
    // No fabricated grant CID/context is used for missing or tombstoned rows.
    const reason = first && first.decision === 'ineffective' ? first.reason : 'grant_unadmitted';
    return { result: { ...action, execution, kind: 'denied', reason }, attempt: action, prepared };
  }
  #unavailable(error: unknown, ledger?: DiscoveryLedger): LocalUnavailable {
    return {
      kind: 'unavailable',
      code: errorCode(error),
      work: ledger
        ? ledger.work()
        : {
            rowVisits: 0,
            candidateVisits: 0,
            scopeComparisons: 0,
            ownerChargedBytes: 0,
            byteAccounting: 'conservative-owner-bounds',
            memo: 'none',
            opaqueAllocations: 'unmeasured',
          },
    };
  }
  async discover(value: unknown, limits?: NativeDiscoveryLimits): Promise<NativeActorDiscovery> {
    let ledger: DiscoveryLedger | undefined;
    try {
      this.#healthy();
      ledger = new DiscoveryLedger(limits);
      // Own caller input and capture genuine current state before the first await.
      const selector = this.#selector(value, ledger);
      const base = this.#current;
      const facts = this.#subject(selector, stateData(base.authority), ledger);
      await validateNativeDeviceKey(selector.actorKey);
      this.#retained(base, ledger);
      const basis = await this.#basis(base, facts, ledger);
      const actions: NativeActionDiscovery[] = [];
      let exhausted = false;
      for (const declared of readNativeSourceDefinition(base.source).manifest.actions) {
        if (exhausted) {
          const execution = readNativeSourceAction(nativeSourceAction(base.source, declared.ref)!).execution;
          actions.push({ action: declared.ref, execution, kind: 'unavailable', code: 'content_unavailable' });
          continue;
        }
        try {
          actions.push(this.#select(base, selector, facts, declared.ref, ledger).result);
        } catch (error) {
          if (!(error instanceof AtseqError) || error.code !== 'content_unavailable') throw error;
          exhausted = true;
          const execution = readNativeSourceAction(nativeSourceAction(base.source, declared.ref)!).execution;
          actions.push({ action: declared.ref, execution, kind: 'unavailable', code: error.code });
        }
      }
      this.#retained(base, ledger);
      const result = ledger.copy({
        kind: 'available',
        label: 'advisory',
        subject: selector,
        basis,
        actions,
      }) as unknown as Omit<Extract<NativeActorDiscovery, { kind: 'available' }>, 'work'>;
      this.#retained(base, ledger);
      return { ...result, work: ledger.work() };
    } catch (error) {
      return this.#unavailable(error, ledger);
    }
  }
  async #readAction(
    value: unknown,
    name: string,
    payload: unknown,
    limits: NativeDiscoveryLimits | undefined,
    operation: 'simulate' | 'preflight',
  ): Promise<NativeActorSimulation | NativeActorPreflight> {
    let ledger: DiscoveryLedger | undefined;
    try {
      this.#healthy();
      ledger = new DiscoveryLedger(limits);
      const ownedName = ledger.copy(name);
      if (typeof ownedName !== 'string') throw new ProtocolError('input', 'Expected action reference');
      const ownedPayload = ledger.copy(payload, WIRE.jsonBytes);
      const payloadBound = ledger.lastCopyBound;
      const selector = this.#selector(value, ledger);
      const base = this.#current;
      const facts = this.#subject(selector, stateData(base.authority), ledger);
      await validateNativeDeviceKey(selector.actorKey);
      this.#retained(base, ledger);
      const basis = await this.#basis(base, facts, ledger);
      const selected = this.#select(base, selector, facts, ownedName, ledger);
      ledger.codec(payloadBound);
      const payloadCid = await contentCid(ownedPayload);
      this.#retained(base, ledger);
      let outcome: NativeOutcomeData,
        successor: Json | null = null;
      let evaluation: Extract<NativeActorSimulation, { kind: 'available' }>['evaluation'] = { kind: 'unavailable' };
      if (selected.result.kind === 'denied') outcome = framework(selected.result.reason);
      else if (selected.result.kind !== 'eligible') throw new AtseqError('content_unavailable', 'Action unavailable');
      else {
        const action = { $type: nativeRef('act'), ...selected.attempt, payload: ownedPayload } as NativeAct;
        if (operation === 'preflight') {
          const gate = this.#actionGate(base.source, stateData(base.authority), selector, action, selected.prepared);
          outcome =
            'outcome' in gate
              ? gate.outcome
              : (this.#actionInput(base.source, gate.selected, ownedPayload, ledger, payloadBound) ??
                deepFreeze({ decision: 'effective' }));
        } else {
          const domain = ledger.copy(base.domain, PROFILE.stateBytes);
          ledger.charge(4 * authorityMetadataLength(basis, selector, selected.result.execution));
          const acted = await this.#action(
            base,
            stateData(base.authority),
            domain,
            selector,
            action,
            nativeFoldMetadataValues({
              app: basis.app,
              genesis: basis.genesis,
              position: basis.nextPosition,
              principal: selector.principal,
              execution: selected.result.execution,
            }),
            'retained',
            selected.prepared,
            ledger,
            payloadBound,
          );
          outcome = acted.outcome;
          successor = acted.successor;
          if (acted.evaluation) evaluation = { kind: 'available', ...acted.evaluation };
        }
      }
      this.#retained(base, ledger);
      const common = {
        kind: 'available',
        subject: selector,
        basis,
        action: selected.result,
        payload: payloadCid,
        outcome,
      };
      const result = ledger.copy(
        operation === 'simulate'
          ? { ...common, label: 'simulation', successor, evaluation }
          : { ...common, label: 'advisory' },
      ) as unknown as Omit<Extract<NativeActorSimulation | NativeActorPreflight, { kind: 'available' }>, 'work'>;
      this.#retained(base, ledger);
      return { ...result, work: ledger.work() } as NativeActorSimulation | NativeActorPreflight;
    } catch (error) {
      return this.#unavailable(error, ledger);
    }
  }
  simulate(
    subject: unknown,
    action: string,
    payload: unknown,
    limits?: NativeDiscoveryLimits,
  ): Promise<NativeActorSimulation> {
    return this.#readAction(subject, action, payload, limits, 'simulate') as Promise<NativeActorSimulation>;
  }
  preflight(
    subject: unknown,
    action: string,
    payload: unknown,
    limits?: NativeDiscoveryLimits,
  ): Promise<NativeActorPreflight> {
    return this.#readAction(subject, action, payload, limits, 'preflight') as Promise<NativeActorPreflight>;
  }
  #projection(
    generation: ApplicationGeneration,
    extra?: NativeApplicationProjection['outcomes'][number],
  ): NativeApplicationProjection {
    const outcomes = this.#rows.slice(0, generation.outcomeBoundary);
    if (extra) outcomes.push(extra);
    return structuredClone({
      format: 'atseq-native-application',
      version: 1,
      app: this.anchor.genesis.app,
      genesis: this.anchor.cid,
      definition: readNativeSourceDefinition(generation.source).cid,
      state: jsonCopy(generation.domain, PROFILE.stateBytes),
      authority: nativeAuthoritySnapshot(generation.authority),
      publication: generation.prefix ? nativePrefixStatus(generation.prefix) : null,
      outcomes,
    });
  }
  prefix(): NativePrefix | null {
    this.#healthy();
    return this.#current.prefix;
  }
  publication() {
    this.#healthy();
    return this.#current.prefix ? nativePrefixStatus(this.#current.prefix) : null;
  }
  async retry(request: unknown) {
    this.#healthy();
    const base = this.#current;
    if (!base.prefix) throw new AtseqError('content_unavailable', 'No verified ordering prefix');
    const frontier = nativeAuthorityFrontier(base.authority),
      publication = nativePrefixStatus(base.prefix);
    const receipt = await lookupNativeRetry(base.prefix, request);
    this.#healthy();
    const row = receipt && receipt.position <= base.outcomeBoundary ? this.#rows[receipt.position - 1] : null;
    if (receipt && receipt.position <= base.outcomeBoundary && !row)
      throw new AtseqError('runtime_fault', 'Committed outcome coverage has a gap');
    return { receipt, outcome: row ? structuredClone(row.outcome) : null, frontier, publication };
  }
  snapshot(): NativeApplicationProjection {
    this.#healthy();
    return this.#projection(this.#current);
  }
  process(input: ProcessInput): Promise<{ frontier: { position: number; entry: string }; outcome: NativeOutcomeData }> {
    // Own caller data before entering the asynchronous queue; real proof capability keeps identity.
    const captured = { ...input, entry: structuredClone(input.entry), appIdentity: structuredClone(input.appIdentity) };
    return this.#queue.run(async () => {
      this.#healthy();
      const base = this.#current;
      // Untrusted entry is an exact requested publication expectation, never a checked-fact mint.
      const claimed = { entry: await readNativeValue<NativeEntry>(NATIVE_NSID.entry, captured.entry) };
      const publication = { ...captured, anchor: this.anchor };
      const candidate = base.prefix ? await stageNativePrefix(base.prefix, publication) : null;
      const prefix = candidate ? null : await openNativePrefix(publication);
      this.#same(base);
      const selected = prefix ?? base.prefix!;
      const evidencePrefix = candidate ? nativePrefixCandidate(candidate) : selected;
      if (candidate) assertNativePrefixExtension(base.prefix!, candidate);
      const checkedRow = nativePrefixEntry(evidencePrefix, claimed.entry.position).row;
      if (!sameBytes(encodeBlock(checkedRow.entry), encodeBlock(claimed.entry)))
        invalid('Requested entry differs from selected published bytes');
      assertNativeAuthorityContext(base.authority, checkedRow.entry);
      const retainOrdering = async () => {
        if (candidate) assertNativePrefixExtension(base.prefix!, candidate);
        if (this.persist) {
          try {
            await this.#persist(this.#projection(Object.freeze({ ...base, prefix: evidencePrefix })));
          } catch (error) {
            if (nativePrefixStatus(evidencePrefix).contradiction) this.#poisoned = true;
            throw error;
          }
          try {
            this.#same(base);
            if (candidate) assertNativePrefixExtension(base.prefix!, candidate);
          } catch (error) {
            this.#poisoned = true;
            throw error;
          }
        }
        this.#same(base);
        const accepted = candidate ? acceptNativePrefix(base.prefix!, candidate) : evidencePrefix;
        this.#current = Object.freeze({ ...base, prefix: accepted });
      };
      let authenticated: AuthenticatedAuthorityEntry;
      try {
        authenticated = await authenticateAuthorityEntry({
          prefix: evidencePrefix,
          prior: base.authority,
          reader: captured.reader,
        });
      } catch (error) {
        if (
          (error instanceof AtseqError && ['content_unavailable', 'native_proof_limit'].includes(error.code)) ||
          nativePrefixStatus(evidencePrefix).contradiction
        )
          await retainOrdering();
        throw error;
      }
      this.#same(base);
      const data = authenticatedAuthorityEntry(authenticated, base.authority);
      let publishing = false;
      try {
        const nextAuthority = nativeAuthoritySnapshot(base.authority);
        assertNativeAuthorityContext(base.authority, data.entry);
        const domain = jsonCopy(base.domain, PROFILE.stateBytes);
        let nextDomain = domain,
          source = base.source,
          outcome: NativeOutcomeData;
        if (data.entry.request.$type === nativeRef('accountOperation')) {
          if (!data.observation) invalid('Account operation lacks authenticated observation');
          outcome = authorityOutcome(
            accountOperation(nextAuthority, data.entry.request as NativeAccountOperation, data.observation),
          );
        } else {
          const signed = data.entry.request as NativeSignedRequest;
          const op = signed.intent.operation;
          if (op.$type === nativeRef('act')) {
            const acted = await this.#action(
              base,
              nextAuthority,
              domain,
              signed.intent,
              op as NativeAct,
              nativeFoldMetadata(data.entry),
              'ordered',
            );
            outcome = acted.outcome;
            if (acted.successor !== null) nextDomain = acted.successor;
          } else if (op.$type === nativeRef('activate')) {
            const denied = controlPrefix(nextAuthority, signed, data.entry);
            if (denied) outcome = authorityOutcome(denied);
            else if (op.expected.$link !== nextAuthority.activeDefinition) outcome = framework('definition_changed');
            else {
              const assessed = await assessNativeSource(
                {
                  root: op.definition.$link,
                  expectedSemantics: NATIVE_SOURCE_CONTRACT.application,
                  closure: op.closure,
                },
                this.reader,
                this.localOptions,
              );
              this.#same(base);
              if (assessed.kind === 'proven_invalid') outcome = framework('invalid_activation');
              else if (assessed.kind === 'incompatible') outcome = framework('incompatible_definition');
              else {
                const oldFacts = readNativeSourceDefinition(base.source),
                  newFacts = readNativeSourceDefinition(assessed.definition);
                if (
                  canonicalJson(oldFacts.stateProjection, PROFILE.definitionBytes) !==
                  canonicalJson(newFacts.stateProjection, PROFILE.definitionBytes)
                )
                  outcome = framework('incompatible_definition');
                else {
                  let rejected = false;
                  try {
                    validateNativeSourceState(assessed.definition, domain);
                  } catch (error) {
                    if (!stageError(error, NATIVE_FOLD_FAILURE_STAGES.successorState)) throw error;
                    rejected = true;
                  }
                  outcome = rejected ? framework('invalid_activation') : deepFreeze({ decision: 'effective' });
                  if (!rejected) {
                    source = assessed.definition;
                    nextAuthority.activeDefinition = newFacts.cid;
                    nextAuthority.control.tip = data.requestCid;
                  }
                }
              }
            }
          } else
            outcome = authorityOutcome(
              op.$type === nativeRef('assignRole')
                ? assignRole(nextAuthority, signed, data.requestCid)
                : control(nextAuthority, signed, data.requestCid, data.observation, data.entry),
            );
        }
        this.#same(base);
        // Wrong-callsite failures while owning/parsing stored output escape, never become fold failures.
        const next: ApplicationGeneration = Object.freeze({
          source,
          domain: deepFreeze(jsonCopy(nextDomain, PROFILE.stateBytes)),
          authority: finishAuthority(nextAuthority, data),
          outcomeBoundary: base.outcomeBoundary + 1,
          prefix: evidencePrefix,
        });
        const row = deepFreeze({
          position: data.entry.position,
          entry: data.entryCid,
          request: data.requestCid,
          outcome: deepFreeze(readNativeOutcome(outcome)),
        });
        publishing = true;
        if (candidate) assertNativePrefixExtension(base.prefix!, candidate);
        if (this.persist) {
          await this.#persist(this.#projection(next, row));
          // A durable success plus impossible stale memory is ambiguous storage, never a retry.
          if (this.#current !== base || this.#poisoned) {
            this.#poisoned = true;
            throw new AtseqError(
              'runtime_fault',
              'Persistence succeeded with a different generation; durable reconciliation required',
            );
          }
        }
        this.#same(base);
        try {
          if (candidate) assertNativePrefixExtension(base.prefix!, candidate);
        } catch (error) {
          if (this.persist) this.#poisoned = true;
          throw error;
        }
        const accepted = candidate ? acceptNativePrefix(base.prefix!, candidate) : evidencePrefix;
        this.#rows.push(row);
        this.#current = Object.freeze({ ...next, prefix: accepted });
        return structuredClone({ frontier: nativeAuthorityFrontier(next.authority), outcome });
      } catch (error) {
        if (
          !publishing &&
          error instanceof AtseqError &&
          ['content_unavailable', 'native_proof_limit'].includes(error.code)
        )
          await retainOrdering();
        throw error;
      }
    });
  }
  async query(name: string, params: unknown): Promise<Awaited<ReturnType<NativeApplication['query']>>> {
    this.#healthy();
    const base = this.#current;
    const frontier = nativeAuthorityFrontier(base.authority);
    try {
      const state = jsonCopy(base.domain, PROFILE.stateBytes),
        ownedParams = jsonCopy(params);
      const program = nativeSourceQueryProgram(base.source, name);
      validateNativeSourceQueryParams(base.source, name, ownedParams);
      const result = await evaluate(program, { state, params: ownedParams });
      this.#healthy();
      validateNativeSourceQueryResult(base.source, name, result.value);
      return { frontier, result: { kind: 'available', value: jsonCopy(result.value) } };
    } catch (error) {
      this.#healthy();
      return {
        frontier,
        result: { kind: 'unavailable', code: error instanceof AtseqError ? error.code : 'runtime_fault' },
      };
    }
  }
}
/** Internal checked construction only, deliberately absent from public application exports. */
export async function openNativeApplication(options: {
  anchor: NativeAnchor;
  sourceReader: NativeSourceReader;
  sourceOptions?: NativeSourceReadOptions;
  /** Trusted configured adapter: resolution confirms commit; ordinary rejection guarantees no commit.
   * If that outcome is unknown, throw NativePersistenceUncertain. Raw-store shape/error text grants no trust.
   * Actual adapter transactions/provenance and inspection remain the separate P3 integration gate. */
  persist?: (projection: NativeApplicationProjection) => Promise<void>;
}): Promise<NativeApplication> {
  const reader = options.sourceReader,
    localOptions = Object.freeze({ ...options.sourceOptions }),
    persist = options.persist;
  const genesis = structuredClone(options.anchor.genesis),
    pin = { app: genesis.app, genesis: options.anchor.cid };
  const anchor = await NativeAnchor.from(genesis, pin);
  await assertNativeSourceContract();
  if (anchor.genesis.semantics.$link !== NATIVE_SOURCE_CONTRACT.native)
    throw new AtseqError('content_unavailable', 'Unsupported native application semantics');
  const source = await assessNativeGenesisSource(anchor.genesis.definition.$link, reader, localOptions);
  if (source.kind !== 'admitted')
    throw new InterpretationError(
      source.kind === 'incompatible' ? 'incompatible_definition' : 'invalid_activation',
      'Pinned genesis source is not a valid supported application',
    );
  const initial = Object.freeze({
    source: source.definition,
    domain: deepFreeze(jsonCopy(readNativeSourceDefinition(source.definition).initialState, PROFILE.stateBytes)),
    authority: await openNativeAuthority(anchor),
    outcomeBoundary: 0,
    prefix: null,
  });
  const owner = new NativeApplicationOwner(anchor, reader, localOptions, persist, initial);
  if (persist) await persist(owner.snapshot());
  // A frozen facade hides the nonexported runtime constructor and every private capture.
  return Object.freeze({
    discover: (subject: unknown, limits?: NativeDiscoveryLimits) => owner.discover(subject, limits),
    simulate: (subject: unknown, action: string, payload: unknown, limits?: NativeDiscoveryLimits) =>
      owner.simulate(subject, action, payload, limits),
    preflight: (subject: unknown, action: string, payload: unknown, limits?: NativeDiscoveryLimits) =>
      owner.preflight(subject, action, payload, limits),
    snapshot: () => owner.snapshot(),
    prefix: () => owner.prefix(),
    publication: () => owner.publication(),
    retry: (request: unknown) => owner.retry(request),
    process: (input: ProcessInput) => owner.process(input),
    query: (name: string, params: unknown) => owner.query(name, params),
  });
}
