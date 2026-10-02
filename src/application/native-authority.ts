/** Pure ordered authority. A snapshot is data, never an accepted-state capability. */
import { deepFreeze } from '../core/freeze.ts';
import { canonicalJson, jsonCopy, type Json } from '../core/values.ts';
import { SerialQueue } from '../core/queue.ts';
import { InterpretationError, PROFILE } from '../core/profile.ts';
import { evaluate, fold } from '../runtime/evaluator.ts';
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
import { AtseqError, ProtocolError } from '../core/errors.ts';
import { nativeRef, NATIVE_NSID } from '../protocol/native-schema.ts';
import {
  NativeAnchor,
  type ControlAppointment,
  type ControlPair,
  type NativeAccountOperation,
  type NativeAssignRole,
  type NativeAct,
  nativeFoldMetadata,
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
  nativePrefixInventory,
  lookupNativeRetry,
  type NativePrefix,
  type NativePrefixPublication,
} from './native-prefix.ts';
import { readNativeValue } from '../protocol/native-wire.ts';
import { sameBytes, encodeBlock } from '../protocol/wire.ts';
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
function liveGrant(
  state: NativeAuthoritySnapshot,
  signed: NativeSignedRequest,
  operation: NativeAssignRole | NativeAct,
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
type ProcessInput = Omit<NativePrefixPublication, 'anchor'> & { entry: unknown };
export interface NativeApplication {
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
            const action = op as NativeAct;
            // One private ordered gate, consumed directly here; no callback or extra token.
            const grant = liveGrant(nextAuthority, signed, action);
            if ('decision' in grant) outcome = authorityOutcome(grant);
            else if (
              !grant.actions.some(
                (pair) => pair.action === action.action && pair.execution.$link === action.execution.$link,
              )
            )
              outcome = framework('grant_scope');
            else {
              const selected = nativeSourceAction(base.source, action.action);
              if (!selected) outcome = framework('unknown_action');
              else {
                const facts = readNativeSourceAction(selected);
                const authorization = facts.contract.body as { authorization: { $type: string; role?: string } };
                const rule = authorization.authorization;
                if (
                  rule.$type === nativeRef('requiredRole') &&
                  !nextAuthority.roles.some(
                    (row) => row.principal === signed.intent.principal && row.role === rule.role && row.enabled,
                  )
                )
                  outcome = framework('role_missing');
                else if (facts.execution !== action.execution.$link) outcome = framework('execution_changed');
                else {
                  // Program/metadata retrieval and stored-state ownership are outside every stage catch.
                  const program = nativeSourceActionFold(selected),
                    metadata = nativeFoldMetadata(data.entry);
                  let inputDenied = false;
                  try {
                    validateNativeSourceAction(base.source, selected, action.payload);
                  } catch (error) {
                    if (!stageError(error, Object.keys(NATIVE_FOLD_FAILURE_STAGES.inputSchema))) throw error;
                    inputDenied = true;
                  }
                  if (inputDenied) outcome = framework('invalid_action');
                  else {
                    let result: Awaited<ReturnType<typeof fold>> | undefined;
                    let foldDenied: NativeOutcomeData | undefined;
                    try {
                      result = await fold(program, { state: domain, act: action.payload, meta: metadata });
                    } catch (error) {
                      if (!stageError(error, NATIVE_FOLD_FAILURE_STAGES.evaluateAndFold)) throw error;
                      foldDenied = framework(`fold_failed/${error.code}`);
                    }
                    this.#same(base);
                    if (foldDenied) outcome = foldDenied;
                    else if (result!.decision === 'ineffective') {
                      outcome = deepFreeze(readNativeOutcome({ ...result!, source: 'fold' }));
                    } else {
                      let stateDenied: NativeOutcomeData | undefined;
                      try {
                        validateNativeSourceState(base.source, result!.state);
                      } catch (error) {
                        if (!stageError(error, NATIVE_FOLD_FAILURE_STAGES.successorState)) throw error;
                        stateDenied = framework(`fold_failed/${error.code}`);
                      }
                      outcome = stateDenied ?? deepFreeze({ decision: 'effective' });
                      if (!stateDenied) nextDomain = result!.state;
                    }
                  }
                }
              }
            }
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
    snapshot: () => owner.snapshot(),
    prefix: () => owner.prefix(),
    publication: () => owner.publication(),
    retry: (request: unknown) => owner.retry(request),
    process: (input: ProcessInput) => owner.process(input),
    query: (name: string, params: unknown) => owner.query(name, params),
  });
}
