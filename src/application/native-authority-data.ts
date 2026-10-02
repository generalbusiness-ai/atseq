/** Shared closed authority DATA validation. No accepted-state capability is minted. */
import { canonicalJson } from '../core/values.ts';
import { AtseqError, ProtocolError } from '../core/errors.ts';
import { fromBytes } from '@atcute/cbor';
import { identityPdsOrigin, normalizeIdentityDidKey } from '../protocol/identity-key.ts';
import { NATIVE_NSID, nativeRef } from '../protocol/native-schema.ts';
import {
  readNativeValue,
  validateNativeDeviceKey,
  validateNativeAccountDid,
  type NativeAnchor,
} from '../protocol/native-wire.ts';
import { contentCid, link, bytes } from '../protocol/wire.ts';
import type { NativeAuthoritySnapshot } from './native-authority.ts';
function fail(message: string): never {
  throw new ProtocolError('envelope', message);
}
function closed(value: any, keys: string[]) {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).sort().join(',') !== [...keys].sort().join(',')
  )
    fail('Authority snapshot row has unknown or missing fields');
}
function sorted(values: string[]) {
  if (values.some((value, index) => typeof value !== 'string' || (index > 0 && values[index - 1]! >= value)))
    fail('Authority snapshot rows must be sorted and unique');
}
function did(value: any) {
  validateNativeAccountDid(value);
}
function cid(value: any) {
  link(value);
}
function nullableCid(value: any) {
  if (value !== null) cid(value);
}
/** Local capacity refusal is unavailable; syntactic/self-consistency checks are not provenance. */
export type CompactAuthorityData = Omit<
  NativeAuthoritySnapshot,
  'format' | 'consumedObservations' | 'requests' | 'retries'
> & { format: 'atseq-checkpoint-authority' };
export async function readAuthorityData(
  value: unknown,
  anchor: NativeAnchor,
  compact: false,
  maximumBytes?: number,
): Promise<NativeAuthoritySnapshot>;
export async function readAuthorityData(
  value: unknown,
  anchor: NativeAnchor,
  compact: true,
  maximumBytes?: number,
): Promise<CompactAuthorityData>;
export async function readAuthorityData(
  value: unknown,
  anchor: NativeAnchor,
  compact: boolean,
  maximumBytes = 32 * 1024 * 1024,
): Promise<NativeAuthoritySnapshot | CompactAuthorityData> {
  if (!Number.isSafeInteger(maximumBytes) || maximumBytes < 1)
    throw new ProtocolError('input', 'Invalid snapshot byte budget');
  let text: string;
  try {
    text = canonicalJson(value, maximumBytes, 32);
  } catch (error) {
    if (error instanceof AtseqError && ['value_bytes', 'value_depth'].includes(error.code))
      throw new AtseqError('content_unavailable', 'Authority snapshot exceeds local resource budget');
    throw error;
  }
  const state: NativeAuthoritySnapshot = JSON.parse(text);
  closed(state, [
    'format',
    'version',
    'app',
    'genesis',
    'activeDefinition',
    'frontier',
    'control',
    'roles',
    'principals',
    'grants',
    ...(!compact ? ['consumedObservations', 'requests', 'retries'] : []),
  ]);
  if (
    (state.format as string) !== (compact ? 'atseq-checkpoint-authority' : 'atseq-native-authority') ||
    state.version !== 1 ||
    state.app !== anchor.genesis.app ||
    state.genesis !== anchor.cid
  )
    fail('Authority snapshot differs from pinned scope/version');
  cid(state.activeDefinition);
  closed(state.frontier, ['position', 'entry']);
  if (
    !Number.isSafeInteger(state.frontier.position) ||
    state.frontier.position < 0 ||
    Object.is(state.frontier.position, -0)
  )
    fail('Invalid authority snapshot frontier');
  cid(state.frontier.entry);
  if ((state.frontier.position === 0) !== (state.frontier.entry === state.genesis))
    fail('Invalid genesis snapshot frontier');
  closed(state.control, ['tip', 'appointments', 'owner', 'recoverGovernance']);
  cid(state.control.tip);
  if (state.control.owner !== null) did(state.control.owner);
  if (state.control.recoverGovernance !== anchor.genesis.recoverGovernance)
    fail('Immutable recovery policy changed in snapshot');
  await readNativeValue(nativeRef('setControl'), {
    $type: nativeRef('setControl'),
    position: 1,
    prev: link(state.genesis),
    controlTip: link(state.genesis),
    control: state.control.appointments,
  });
  for (const pair of state.control.appointments) did(pair.principal);
  for (const name of [
    'roles',
    'principals',
    'grants',
    ...(!compact ? (['consumedObservations', 'requests', 'retries'] as const) : []),
  ] as const)
    if (!Array.isArray(state[name])) fail('Expected authority snapshot row array');
  if (compact) {
    // Compact input has no historical arrays. Validate row objects before using
    // their keys in sortedness checks; this does not alter the existing full reader.
    for (const row of state.roles) closed(row, ['principal', 'role', 'enabled', 'revision']);
    for (const row of state.principals) {
      closed(row, ['principal', 'epoch', 'epochs', 'observation']);
      if (!Array.isArray(row.epochs)) fail('Expected accepted epoch rows');
      for (const epoch of row.epochs) closed(epoch, ['cid', 'id', 'previous']);
    }
    for (const row of state.grants) closed(row, ['principal', 'id', 'cid', 'grant', 'revoked']);
  }
  if (!compact) {
    sorted(state.consumedObservations);
    sorted(state.requests);
    sorted(state.retries);
    state.consumedObservations.forEach(cid);
    state.requests.forEach(cid);
    if (state.retries.length > state.requests.length) fail('Snapshot has more actor tuples than requests');
    for (const retry of state.retries) {
      let tuple: unknown;
      try {
        tuple = JSON.parse(retry);
      } catch {
        fail('Invalid actor retry tuple');
      }
      if (
        !Array.isArray(tuple) ||
        tuple.length !== 4 ||
        tuple[0] !== state.app ||
        tuple[1] !== state.genesis ||
        typeof tuple[2] !== 'string' ||
        typeof tuple[3] !== 'string' ||
        JSON.stringify(tuple) !== retry
      )
        fail('Actor retry tuple differs from snapshot scope');
      await validateNativeDeviceKey(tuple[2]);
      const nonce = new Uint8Array(fromBytes({ $bytes: tuple[3] }));
      if (nonce.length !== 16 || bytes(nonce).$bytes !== tuple[3]) fail('Invalid actor retry nonce');
    }
    if (state.requests.length !== state.frontier.position) fail('Authority snapshot omits ordered request identities');
    if (state.control.tip !== state.genesis && !state.requests.includes(state.control.tip))
      fail('Control tip lacks an ordered request');
  }
  sorted(state.roles.map((row) => JSON.stringify([row.principal, row.role])));
  for (const row of state.roles) {
    closed(row, ['principal', 'role', 'enabled', 'revision']);
    did(row.principal);
    cid(row.revision);
    if (typeof row.enabled !== 'boolean') fail('Invalid assignment state');
    await readNativeValue(nativeRef('requiredRole'), { $type: nativeRef('requiredRole'), role: row.role });
    if (!compact && row.revision !== state.genesis && !state.requests.includes(row.revision))
      fail('Role revision lacks an ordered request');
    if (
      row.revision === state.genesis &&
      (!row.enabled ||
        !anchor.genesis.roles.some((initial) => initial.principal === row.principal && initial.role === row.role))
    )
      fail('Genesis assignment differs from pinned initial roles');
  }
  sorted(state.principals.map((row) => row.principal));
  for (const row of state.principals) {
    closed(row, ['principal', 'epoch', 'epochs', 'observation']);
    did(row.principal);
    nullableCid(row.epoch);
    if (!Array.isArray(row.epochs)) fail('Expected accepted epoch rows');
    sorted(row.epochs.map((epoch) => epoch.cid));
    if (new Set(row.epochs.map((epoch) => epoch.id)).size !== row.epochs.length) fail('Epoch ID reused in snapshot');
    for (const epoch of row.epochs) {
      closed(epoch, ['cid', 'id', 'previous']);
      cid(epoch.cid);
      nullableCid(epoch.previous);
      const record = await readNativeValue(NATIVE_NSID.epoch, {
        $type: NATIVE_NSID.epoch,
        version: 1,
        id: { $bytes: epoch.id },
        previous: epoch.previous === null ? null : link(epoch.previous),
      });
      if ((await contentCid(record)) !== epoch.cid) fail('Epoch row differs from immutable CID');
    }
    if (row.epoch !== null && !row.epochs.some((epoch) => epoch.cid === row.epoch))
      fail('Current epoch is not retained');
    if (row.observation !== null) {
      closed(row.observation, ['cid', 'root', 'rev', 'signingKeyDid', 'pdsOrigin', 'assuranceClass']);
      cid(row.observation.cid);
      cid(row.observation.root);
      if (!compact && !state.consumedObservations.includes(row.observation.cid))
        fail('Floor descriptor was not consumed');
      if (!/^[234567abcdefghij][234567a-z]{12}$/.test(row.observation.rev)) fail('Invalid repository floor revision');
      if (
        row.observation.assuranceClass !==
        (row.principal.startsWith('did:plc:') ? 'plc-audit-v1' : 'web-observation-v1')
      )
        fail('Snapshot floor assurance differs from principal method');
      if (
        (await normalizeIdentityDidKey(row.observation.signingKeyDid)) !== row.observation.signingKeyDid ||
        identityPdsOrigin(row.observation.pdsOrigin) !== row.observation.pdsOrigin
      )
        fail('Noncanonical snapshot binding');
    }
  }
  sorted(state.grants.map((row) => JSON.stringify([row.principal, row.id])));
  for (const row of state.grants) {
    closed(row, ['principal', 'id', 'cid', 'grant', 'revoked']);
    did(row.principal);
    nullableCid(row.cid);
    await readNativeValue(NATIVE_NSID.revoke, {
      $type: NATIVE_NSID.revoke,
      version: 1,
      id: row.id,
      app: state.app,
      genesis: link(state.genesis),
    });
    if (
      typeof row.revoked !== 'boolean' ||
      (row.cid === null) !== (row.grant === null) ||
      (row.cid === null && !row.revoked)
    )
      fail('Invalid grant/tombstone row');
    if (!state.principals.some((principal) => principal.principal === row.principal))
      fail('Grant principal has no retained authority row');
    if (row.grant !== null) {
      const grant = await readNativeValue<NativeAuthoritySnapshot['grants'][number]['grant']>(
        NATIVE_NSID.grant,
        row.grant,
      );
      if (
        !grant ||
        grant.id !== row.id ||
        grant.app !== state.app ||
        grant.genesis.$link !== state.genesis ||
        (await contentCid(grant)) !== row.cid
      )
        fail('Admitted grant row differs from immutable scope/CID');
      if (
        !state.principals
          .find((principal) => principal.principal === row.principal)!
          .epochs.some((epoch) => epoch.cid === grant.epoch.$link)
      )
        fail('Admitted grant epoch was not retained');
    }
  }
  return state;
}
