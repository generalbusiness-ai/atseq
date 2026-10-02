/** Internal checkpoint DATA only. No publication, replay, restore or writer authority. */
import { canonicalJson } from '../core/values.ts';
import { AtseqError, ProtocolError } from '../core/errors.ts';
import { parseStrictJson, StrictJsonError } from './strict-json.ts';
import { link, encodeBlock, decodeBlock, contentCid } from './wire.ts';
import { NATIVE_NSID, nativeRef } from './native-schema.ts';
import {
  readNativeRecord,
  readNativeValue,
  reconstructNativeBytes,
  validateNativeAccountDid,
  validateNativeDeviceKey,
  verifyNativeEntryContents,
  type ByteContentReader,
  type ByteManifest,
  type NativeContent,
  type NativeAnchor,
} from './native-wire.ts';
import { fromBytes } from '@atcute/cbor';
import { bytes } from './wire.ts';
import { create, fromString, toString, CODEC_RAW, CODEC_DCBOR } from '@atcute/cid';

export const CHECKPOINT_DATA_BOUNDS = Object.freeze({
  pageBytes: 128 * 1024,
  depth: 32,
  payloadBytes: 32 * 1024 * 1024,
});
export interface CheckpointPin {
  app: string;
  genesis: string;
}
export interface CheckpointThrough {
  position: number;
  entry: string;
}
export type CheckpointKind = 'history' | 'outcomes' | 'sources' | 'evidence';
export interface CheckpointTableData extends CheckpointPin {
  format: 'atseq-checkpoint-table';
  version: 1;
  kind: CheckpointKind;
  through: CheckpointThrough;
  rows: number;
  pages: { payload: string; rows: number }[];
}
export interface CheckpointHistoryRow {
  position: number;
  entry: string;
  request: string;
  actor: null | { actorKey: string; nonce: string };
  entryBytes: string;
  requestBytes: string;
  observations: string[];
}
export interface CheckpointSourceRow {
  definition: string;
  manifest: string;
  files: { path: string; cid: string; bytes: string }[];
}
export interface CheckpointEvidenceRow {
  cid: string;
  bytes: string;
}
export interface CheckpointIndexesData {
  requests: string[];
  retries: string[];
  consumedObservations: string[];
}
function fail(message: string): never {
  throw new ProtocolError('envelope', message);
}
function unavailable(message: string): never {
  throw new AtseqError('content_unavailable', message);
}
export function checkpointClosed(value: any, keys: readonly string[]): void {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).length !== keys.length ||
    keys.some((key) => !Object.hasOwn(value, key))
  )
    fail('Unknown or missing checkpoint fields');
}
function integer(value: any, positive = false): void {
  if (!Number.isSafeInteger(value) || Object.is(value, -0) || value < (positive ? 1 : 0))
    fail('Invalid checkpoint integer');
}
function budget(value: number): void {
  if (!Number.isSafeInteger(value) || value < 0) throw new ProtocolError('input', 'Invalid local checkpoint budget');
}
function pin(value: CheckpointPin): void {
  validateNativeAccountDid(value.app);
  link(value.genesis);
}
function through(value: any, genesis: string): void {
  checkpointClosed(value, ['position', 'entry']);
  integer(value.position);
  link(value.entry);
  if ((value.position === 0) !== (value.entry === genesis)) fail('Checkpoint zero position differs from genesis');
}
/** The strict parser's limits are facts; this adapter makes fixed format bounds malformed. */
export function readCheckpointJson(raw: Uint8Array, maximumBytes: number, page = false): unknown {
  budget(maximumBytes);
  if (!(raw instanceof Uint8Array)) throw new ProtocolError('input', 'Expected checkpoint bytes');
  const normative = page ? CHECKPOINT_DATA_BOUNDS.pageBytes : CHECKPOINT_DATA_BOUNDS.payloadBytes;
  if (raw.length > normative) fail('Checkpoint JSON exceeds supported format byte bound');
  if (raw.length > maximumBytes) unavailable('Checkpoint bytes exceed local budget');
  let value: unknown;
  try {
    value = parseStrictJson(raw, normative, CHECKPOINT_DATA_BOUNDS.depth);
  } catch (error) {
    if (!(error instanceof StrictJsonError)) throw error;
    throw new ProtocolError('noncanonical', `Malformed checkpoint JSON: ${error.reason}`);
  }
  const encoded = new TextEncoder().encode(canonicalJson(value, normative, CHECKPOINT_DATA_BOUNDS.depth));
  if (encoded.length !== raw.length || encoded.some((byte, index) => byte !== raw[index]))
    throw new ProtocolError('noncanonical', 'Checkpoint JSON does not reproduce canonical bytes');
  return value;
}
/** Existing deterministic native framing identity; no publication/retention proof. */
export async function checkpointPayloadIdentity(raw: Uint8Array): Promise<string> {
  if (!(raw instanceof Uint8Array) || raw.length > CHECKPOINT_DATA_BOUNDS.payloadBytes)
    fail('Unsupported checkpoint payload bytes');
  const chunks = [];
  for (let offset = 0; offset < raw.length; offset += 32768) {
    const chunk = {
      $type: NATIVE_NSID.content,
      version: 1,
      body: { $type: nativeRef('byteChunk'), bytes: bytes(raw.slice(offset, offset + 32768)) },
    };
    chunks.push(link(await contentCid(chunk)));
  }
  return contentCid({
    $type: NATIVE_NSID.content,
    version: 1,
    body: { $type: nativeRef('byteManifest'), byteLength: raw.length, chunks },
  });
}
async function payloadMatches(cid: string, raw: Uint8Array): Promise<void> {
  if ((await checkpointPayloadIdentity(raw)) !== cid) fail('Checkpoint payload differs from byte-manifest identity');
}
/** Native hashes/framing only; reader misses must be explicit unavailable errors. */
export async function readCheckpointBytes(
  cid: string,
  reader: ByteContentReader,
  maximumBytes: number,
  page = false,
): Promise<Uint8Array> {
  budget(maximumBytes);
  link(cid);
  const manifest = await readNativeRecord<NativeContent<ByteManifest>>(NATIVE_NSID.content, cid, await reader.get(cid));
  if (manifest.body.$type !== nativeRef('byteManifest')) fail('Expected checkpoint byte manifest');
  if (manifest.body.byteLength > (page ? CHECKPOINT_DATA_BOUNDS.pageBytes : CHECKPOINT_DATA_BOUNDS.payloadBytes))
    fail('Checkpoint payload exceeds supported format bound');
  if (manifest.body.byteLength > maximumBytes) unavailable('Checkpoint payload exceeds local budget');
  return reconstructNativeBytes(manifest, reader, maximumBytes);
}
export function readCheckpointTable(
  raw: Uint8Array,
  expectedKind: CheckpointKind,
  scope: CheckpointPin,
  maximumBytes: number,
): CheckpointTableData {
  pin(scope);
  if (!['history', 'outcomes', 'sources', 'evidence'].includes(expectedKind))
    throw new ProtocolError('input', 'Unsupported expected table kind');
  const value: any = readCheckpointJson(raw, maximumBytes);
  checkpointClosed(value, ['format', 'version', 'app', 'genesis', 'kind', 'through', 'rows', 'pages']);
  if (
    value.format !== 'atseq-checkpoint-table' ||
    value.version !== 1 ||
    value.kind !== expectedKind ||
    value.app !== scope.app ||
    value.genesis !== scope.genesis
  )
    fail('Checkpoint table differs from scope/kind/version');
  through(value.through, scope.genesis);
  integer(value.rows);
  if (!Array.isArray(value.pages)) fail('Expected checkpoint pages');
  let count = 0;
  for (const page of value.pages) {
    checkpointClosed(page, ['payload', 'rows']);
    link(page.payload);
    integer(page.rows, true);
    count += page.rows;
    if (!Number.isSafeInteger(count)) fail('Checkpoint row count overflow');
  }
  if (count !== value.rows || (value.rows === 0) !== (value.pages.length === 0)) fail('Checkpoint page counts differ');
  if (value.kind === 'history' && value.rows !== value.through.position) fail('History count differs from head');
  return value;
}
async function rawCid(value: string, genesis: string): Promise<void> {
  await readNativeValue(NATIVE_NSID.file, { $type: NATIVE_NSID.file, version: 1, cid: value, bytes: link(genesis) });
}
function ordered(values: string[]): void {
  if (values.some((value, index) => index > 0 && values[index - 1]! >= value))
    fail('Checkpoint rows must be sorted and unique');
}
export async function readCheckpointPage(
  raw: Uint8Array,
  kind: 'history',
  scope: CheckpointPin,
  maximumBytes: number,
  maximumRows: number,
): Promise<CheckpointHistoryRow[]>;
export async function readCheckpointPage(
  raw: Uint8Array,
  kind: 'sources',
  scope: CheckpointPin,
  maximumBytes: number,
  maximumRows: number,
): Promise<CheckpointSourceRow[]>;
export async function readCheckpointPage(
  raw: Uint8Array,
  kind: 'evidence',
  scope: CheckpointPin,
  maximumBytes: number,
  maximumRows: number,
): Promise<CheckpointEvidenceRow[]>;
export async function readCheckpointPage(
  raw: Uint8Array,
  kind: CheckpointKind,
  scope: CheckpointPin,
  maximumBytes: number,
  maximumRows: number,
): Promise<CheckpointHistoryRow[] | CheckpointSourceRow[] | CheckpointEvidenceRow[]> {
  pin(scope);
  budget(maximumRows);
  const rows: any = readCheckpointJson(raw, maximumBytes, true);
  if (!Array.isArray(rows) || !rows.length) fail('Checkpoint pages must contain rows');
  if (rows.length > maximumRows) unavailable('Checkpoint rows exceed local budget');
  if (kind === 'outcomes') unavailable('Exact outcome-row contract is not supported by this data foundation');
  if (!['history', 'sources', 'evidence'].includes(kind)) throw new ProtocolError('input', 'Unsupported table kind');
  for (const row of rows) {
    if (kind === 'history') {
      checkpointClosed(row, ['position', 'entry', 'request', 'actor', 'entryBytes', 'requestBytes', 'observations']);
      integer(row.position, true);
      [row.entry, row.request, row.entryBytes, row.requestBytes].forEach(link);
      if (row.actor !== null) {
        checkpointClosed(row.actor, ['actorKey', 'nonce']);
        await validateNativeDeviceKey(row.actor.actorKey);
        if (typeof row.actor.nonce !== 'string' || !/^[A-Za-z0-9+/]{22}$/.test(row.actor.nonce))
          fail('Expected original actor nonce');
        const nonce = new Uint8Array(fromBytes({ $bytes: row.actor.nonce }));
        if (nonce.length !== 16 || bytes(nonce).$bytes !== row.actor.nonce) fail('Noncanonical original actor nonce');
      }
      if (!Array.isArray(row.observations) || row.observations.length > 1) fail('Unsupported observation use list');
      row.observations.forEach(link);
    } else if (kind === 'sources') {
      checkpointClosed(row, ['definition', 'manifest', 'files']);
      link(row.definition);
      link(row.manifest);
      if (!Array.isArray(row.files)) fail('Expected source files');
      const paths = new Set<string>();
      for (const file of row.files) {
        checkpointClosed(file, ['path', 'cid', 'bytes']);
        link(file.bytes);
        if (
          typeof file.path !== 'string' ||
          file.path.length > 200 ||
          !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(file.path) ||
          file.path.split('/').some((part: string) => !part || part === '.' || part === '..') ||
          paths.has(file.path)
        )
          fail('Invalid or duplicate source path');
        paths.add(file.path);
        await rawCid(file.cid, scope.genesis);
      }
    } else {
      checkpointClosed(row, ['cid', 'bytes']);
      link(row.bytes);
      try {
        link(row.cid);
      } catch (error) {
        if (!(error instanceof ProtocolError) || error.code !== 'wire_cid') throw error;
        await rawCid(row.cid, scope.genesis);
      }
    }
  }
  if (kind === 'history') {
    for (let index = 1; index < rows.length; index++)
      if (rows[index].position !== rows[index - 1].position + 1) fail('Nonconsecutive history page');
  } else ordered(rows.map((row: any) => (kind === 'sources' ? row.definition : row.cid)));
  return rows;
}
/** Complete asserted coverage only. This is not a proof of history or prior absence. */
export function deriveCheckpointIndexes(
  history: readonly CheckpointHistoryRow[],
  scope: CheckpointPin,
  frontier: number,
): CheckpointIndexesData {
  pin(scope);
  integer(frontier);
  if (frontier > history.length) fail('Interpreted frontier exceeds complete history');
  const indexes = { requests: [] as string[], retries: [] as string[], consumedObservations: [] as string[] };
  const all = { requests: new Set<string>(), retries: new Set<string>(), consumedObservations: new Set<string>() };
  for (const [index, row] of history.entries()) {
    if (row.position !== index + 1) fail('Incomplete history positions');
    const tuple =
      row.actor === null ? null : JSON.stringify([scope.app, scope.genesis, row.actor.actorKey, row.actor.nonce]);
    for (const [kind, values] of Object.entries({
      requests: [row.request],
      retries: tuple === null ? [] : [tuple],
      consumedObservations: row.observations,
    })) {
      for (const value of values) {
        const key = kind as keyof typeof indexes;
        if (all[key].has(value)) fail('Duplicate history identity');
        all[key].add(value);
        if (row.position <= frontier) indexes[key].push(value);
      }
    }
  }
  for (const values of Object.values(indexes)) values.sort();
  return indexes;
}
/** Compare supplied original bytes with their history projection; no native membership is inferred. */
export async function checkCheckpointHistoryRecord(
  row: CheckpointHistoryRow,
  entryRaw: Uint8Array,
  requestRaw: Uint8Array,
  anchor: NativeAnchor,
  previous: string,
): Promise<void> {
  await payloadMatches(row.entryBytes, entryRaw);
  await payloadMatches(row.requestBytes, requestRaw);
  const checked = await verifyNativeEntryContents(decodeBlock(entryRaw), anchor);
  const signed = checked.entry.request.$type === nativeRef('signedRequest');
  const request: any = checked.entry.request;
  const unsigned = signed ? request.intent : request;
  const actor = signed ? { actorKey: unsigned.actorKey, nonce: unsigned.nonce.$bytes } : null;
  const observation = signed
    ? unsigned.operation.$type === nativeRef('recoverParticipant')
      ? unsigned.operation.observation.$link
      : null
    : unsigned.observation.$link;
  if (
    checked.entry.prev.$link !== previous ||
    row.position !== checked.entry.position ||
    row.entry !== checked.entryCid ||
    row.request !== checked.requestCid ||
    canonicalJson(row.actor) !== canonicalJson(actor) ||
    canonicalJson(row.observations) !== canonicalJson(observation === null ? [] : [observation])
  )
    fail('History projection differs from original entry');
  const expected = encodeBlock(request);
  if (expected.length !== requestRaw.length || expected.some((byte, index) => byte !== requestRaw[index]))
    fail('Original nested request bytes differ');
}
export async function checkCheckpointSourceRecord(
  row: CheckpointSourceRow,
  definitionRaw: Uint8Array,
  fileBytes: readonly Uint8Array[],
): Promise<void> {
  await payloadMatches(row.manifest, definitionRaw);
  for (const [index, raw] of fileBytes.entries()) {
    if (!row.files[index]) fail('Unexpected source file');
    await payloadMatches(row.files[index]!.bytes, raw);
  }
  const definition: any = await readNativeRecord(NATIVE_NSID.definition, row.definition, definitionRaw);
  if (
    canonicalJson(definition.files) !== canonicalJson(row.files.map(({ path, cid }) => ({ path, cid }))) ||
    fileBytes.length !== row.files.length
  )
    fail('Source file table differs from original manifest');
  for (const [index, raw] of fileBytes.entries())
    if (toString(await create(CODEC_RAW, raw)) !== row.files[index]!.cid)
      fail('Source bytes differ from immutable raw CID');
}
export async function checkCheckpointEvidenceRecord(row: CheckpointEvidenceRow, raw: Uint8Array): Promise<void> {
  await payloadMatches(row.bytes, raw);
  const cid = fromString(row.cid);
  if (cid.codec !== CODEC_RAW && cid.codec !== CODEC_DCBOR) fail('Unsupported evidence CID codec');
  if (toString(await create(cid.codec, raw)) !== row.cid) fail('Evidence bytes differ from immutable CID');
}
/** All pages supplied; coverage is asserted data, never authenticated absence. */
export async function readCompleteCheckpointTable(
  tableRaw: Uint8Array,
  pageBytes: readonly Uint8Array[],
  kind: 'history',
  scope: CheckpointPin,
  maximumBytes: number,
  maximumRows: number,
): Promise<{ table: CheckpointTableData; rows: CheckpointHistoryRow[] }>;
export async function readCompleteCheckpointTable(
  tableRaw: Uint8Array,
  pageBytes: readonly Uint8Array[],
  kind: 'sources',
  scope: CheckpointPin,
  maximumBytes: number,
  maximumRows: number,
): Promise<{ table: CheckpointTableData; rows: CheckpointSourceRow[] }>;
export async function readCompleteCheckpointTable(
  tableRaw: Uint8Array,
  pageBytes: readonly Uint8Array[],
  kind: 'evidence',
  scope: CheckpointPin,
  maximumBytes: number,
  maximumRows: number,
): Promise<{ table: CheckpointTableData; rows: CheckpointEvidenceRow[] }>;
export async function readCompleteCheckpointTable(
  tableRaw: Uint8Array,
  pageBytes: readonly Uint8Array[],
  kind: 'history' | 'sources' | 'evidence',
  scope: CheckpointPin,
  maximumBytes: number,
  maximumRows: number,
): Promise<{ table: CheckpointTableData; rows: any[] }> {
  budget(maximumBytes);
  budget(maximumRows);
  const table = readCheckpointTable(tableRaw, kind, scope, maximumBytes);
  if (table.rows > maximumRows) unavailable('Complete table exceeds local row budget');
  if (pageBytes.length < table.pages.length) unavailable('Required complete table pages are missing');
  if (pageBytes.length > table.pages.length) fail('Unexpected complete table pages');
  let used = tableRaw.length;
  const rows: any[] = [];
  for (const [index, raw] of pageBytes.entries()) {
    const page =
      kind === 'history'
        ? await readCheckpointPage(raw, 'history', scope, Math.max(0, maximumBytes - used), maximumRows)
        : kind === 'sources'
          ? await readCheckpointPage(raw, 'sources', scope, Math.max(0, maximumBytes - used), maximumRows)
          : await readCheckpointPage(raw, 'evidence', scope, Math.max(0, maximumBytes - used), maximumRows);
    const reference = table.pages[index]!;
    await payloadMatches(reference.payload, raw);
    if (page.length !== reference.rows) fail('Page count differs from inventory');
    rows.push(...page);
    used += raw.length;
  }
  if (rows.length !== table.rows) fail('Complete table row count differs');
  if (kind === 'history') {
    if (
      rows.some((row, index) => row.position !== index + 1) ||
      (rows.length && rows.at(-1)!.entry !== table.through.entry)
    )
      fail('History positions/boundary differ');
  } else ordered(rows.map((row) => (kind === 'sources' ? row.definition : row.cid)));
  return { table, rows };
}
export async function readCompleteCheckpointHistory(
  tableRaw: Uint8Array,
  pageBytes: readonly Uint8Array[],
  scope: CheckpointPin,
  frontier: number,
  maximumBytes: number,
  maximumRows: number,
): Promise<{ table: CheckpointTableData; rows: CheckpointHistoryRow[]; indexes: CheckpointIndexesData }> {
  const { table, rows } = await readCompleteCheckpointTable(
    tableRaw,
    pageBytes,
    'history',
    scope,
    maximumBytes,
    maximumRows,
  );
  return { table, rows, indexes: deriveCheckpointIndexes(rows, scope, frontier) };
}
