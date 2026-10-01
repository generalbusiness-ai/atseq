import * as CBOR from '@atcute/cbor';
import {
  defs,
  normalizeOp,
  processIndexedEntry,
  PlcError,
  type IndexedEntryLog,
  type IndexedEntryWithSigner,
} from '@atcute/did-plc';
import { fromBase64Url, toBase64Url } from '@atcute/multibase';
import { isDidPlc } from '@atproto/did';
import * as v from 'valibot';
import { ProtocolError } from '../core/errors.ts';
import { assertDependencies } from '../core/dependencies.ts';
import { assertCid } from './wire.ts';
import { identityInput, identityObject, parseIdentityJson } from './identity-json.ts';
import { identityPdsOrigin, normalizeIdentityDidKey } from './identity-key.ts';

export const PLC_EVIDENCE_LIMITS = Object.freeze({ bytes: 1024 * 1024, rows: 512, operationBytes: 7500, entries: 64 });
const fields = {
  create: ['type', 'prev', 'sig', 'signingKey', 'recoveryKey', 'handle', 'service'],
  plc_operation: ['type', 'prev', 'sig', 'rotationKeys', 'verificationMethods', 'alsoKnownAs', 'services'],
  plc_tombstone: ['type', 'prev', 'sig'],
} as const;
function strictFields(value: unknown, allowed: readonly string[]) {
  if (!identityObject(value) || Object.keys(value).some((name) => !allowed.includes(name)))
    identityInput('Unknown or invalid signed PLC fields');
}
function boundedContainers(value: unknown): void {
  if (Array.isArray(value)) {
    if (value.length > PLC_EVIDENCE_LIMITS.entries) identityInput('PLC operation array exceeds budget');
    for (const child of value) boundedContainers(child);
  } else if (identityObject(value)) {
    const values = Object.values(value);
    if (values.length > PLC_EVIDENCE_LIMITS.entries) identityInput('PLC operation map exceeds budget');
    for (const child of values) boundedContainers(child);
  }
}
function plcCid(value: string) {
  try {
    assertCid(value);
  } catch (error) {
    if (error instanceof ProtocolError && error.kind === 'invalid_input') identityInput(error.message);
    throw error;
  }
}
function signature(value: string) {
  if (!/^[A-Za-z0-9_-]{86}$/.test(value)) identityInput('PLC signature must use canonical compact base64url');
  const bytes = fromBase64Url(value);
  if (bytes.length !== 64 || toBase64Url(bytes) !== value) identityInput('Noncanonical PLC signature');
  // The maintained verifier's p256/k256 verify default rejects high-S signatures.
}
function timestamp(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) identityInput('Invalid PLC UTC timestamp');
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString() !== value) identityInput('Invalid PLC UTC timestamp');
  return parsed.getTime();
}
/** Authenticates retained history, not directory completeness or currentness. */
export async function verifyPlcAudit(principal: string, raw: Uint8Array, selectedTipCid: string) {
  assertDependencies();
  if (!isDidPlc(principal)) identityInput('Expected PLC principal');
  plcCid(selectedTipCid);
  const parsed = parseIdentityJson(raw, PLC_EVIDENCE_LIMITS.bytes);
  if (!Array.isArray(parsed) || parsed.length < 1 || parsed.length > PLC_EVIDENCE_LIMITS.rows)
    identityInput('PLC audit row budget exceeded');
  for (const row of parsed) {
    if (!identityObject(row) || !identityObject(row.operation)) identityInput('Invalid PLC audit row');
    const op = row.operation;
    if (typeof op.type !== 'string' || !Object.hasOwn(fields, op.type)) identityInput('Unsupported PLC operation');
    strictFields(op, fields[op.type as keyof typeof fields]);
    boundedContainers(op);
    if (identityObject(op.services))
      for (const service of Object.values(op.services)) {
        strictFields(service, ['type', 'endpoint']);
        if (!v.safeParse(defs.service, service).success) identityInput('Invalid signed PLC service');
      }
    if (identityObject(op.verificationMethods))
      for (const method of Object.values(op.verificationMethods))
        if (!v.safeParse(defs.permissiveDidKeyString, method).success)
          identityInput('Invalid signed PLC verification method');
  }
  if (!v.safeParse(defs.indexedEntryLog, parsed).success) identityInput('Invalid PLC audit schema');
  // Schema results are prechecks only. Preserve raw signed operation fields for
  // their original hashes/signatures rather than using a parser projection.
  const rows = parsed as IndexedEntryLog;
  let canonical: IndexedEntryWithSigner[] = [],
    previousDate = -Infinity;
  const nullified = new Set<string>(),
    seen = new Set<string>(),
    checkedKeys = new Set<string>();
  for (const row of rows) {
    if (row.did !== principal || seen.has(row.cid)) identityInput('PLC row issuer or duplicate CID');
    seen.add(row.cid);
    plcCid(row.cid);
    if (row.operation.prev !== null) plcCid(row.operation.prev);
    if (CBOR.encode(row.operation).length > PLC_EVIDENCE_LIMITS.operationBytes)
      identityInput('PLC operation exceeds byte budget');
    signature(row.operation.sig);
    const date = timestamp(row.createdAt);
    if (date < previousDate) identityInput('PLC audit timestamps are unordered');
    previousDate = date;
    const previousTip = canonical.at(-1);
    if (previousTip && row.operation.prev !== previousTip.cid && date <= timestamp(previousTip.createdAt))
      identityInput('PLC recovery must follow the previous canonical tip timestamp');
    const rotationKeys =
      row.operation.type === 'create'
        ? [row.operation.recoveryKey, row.operation.signingKey]
        : row.operation.type === 'plc_operation'
          ? row.operation.rotationKeys
          : [];
    for (const key of rotationKeys)
      if (!checkedKeys.has(key)) {
        await normalizeIdentityDidKey(key);
        checkedKeys.add(key);
      }
    try {
      const result = await processIndexedEntry(principal, canonical, row);
      canonical = result.ops;
      for (const entry of result.nullified) nullified.add(entry.cid);
    } catch (error) {
      if (error instanceof PlcError) identityInput(error.message);
      throw error;
    }
  }
  for (const row of rows)
    if (row.nullified !== nullified.has(row.cid))
      identityInput('PLC nullification annotation disagrees with verified history');
  const tip = canonical.at(-1);
  if (!tip || tip.cid !== selectedTipCid) identityInput('Selected PLC operation is not the computed canonical tip');
  if (tip.operation.type === 'plc_tombstone') identityInput('PLC principal is tombstoned');
  const op = normalizeOp(tip.operation);
  if (!Object.hasOwn(op.verificationMethods, 'atproto') || !Object.hasOwn(op.services, 'atproto_pds'))
    identityInput('PLC tip lacks ATproto account binding');
  const service = op.services.atproto_pds!;
  if (service.type !== 'AtprotoPersonalDataServer') identityInput('PLC tip has invalid ATproto PDS service');
  return Object.freeze({
    selectedTipCid: tip.cid,
    signingKeyDid: await normalizeIdentityDidKey(op.verificationMethods.atproto),
    pdsOrigin: identityPdsOrigin(service.endpoint),
  });
}
