/** Internal deterministic checkpoint DATA production; no publication or accepted generation. */
import { AtseqError, ProtocolError } from '../core/errors.ts';
import { canonicalJson } from '../core/values.ts';
import { bytes, contentCid, encodeBlock, link } from './wire.ts';
import { NATIVE_NSID, nativeRef } from './native-schema.ts';
import {
  CHECKPOINT_DATA_BOUNDS,
  readCheckpointJson,
  readCheckpointAssertion,
  readCheckpointPage,
  readCompleteCheckpointTable,
  deriveCheckpointIndexes,
  type CheckpointAssertionData,
  type CheckpointHistoryRow,
  type CheckpointKind,
  type CheckpointPin,
  type CheckpointThrough,
} from './checkpoint-data.ts';

const CHUNK_BYTES = 32768;
const MAXIMUM_ROWS = 100000;
const MAXIMUM_INVENTORY_BYTES = 48 * 1024 * 1024;
const encoder = new TextEncoder();
// Capture genuine typed-array operations once; never dispatch caller byte methods.
const OwnedBytes = Uint8Array;
const typedArrayPrototype = Object.getPrototypeOf(OwnedBytes.prototype);
const byteLength = Object.getOwnPropertyDescriptor(typedArrayPrototype, 'length')!.get!;
const byteKind = Object.getOwnPropertyDescriptor(typedArrayPrototype, Symbol.toStringTag)!.get!;
const copyBytes = OwnedBytes.prototype.set;

export interface NativeCheckpointProducerInput {
  scope: CheckpointPin;
  head: CheckpointThrough;
  frontier: CheckpointThrough;
  definition: string;
  stall: CheckpointAssertionData['stall'];
  /** Owned original canonical JSON payloads, never proof of execution. */
  state: Uint8Array;
  authority: Uint8Array;
  producer: Uint8Array;
  /** One canonical closed row per byte array; source file order is retained. */
  history: readonly Uint8Array[];
  /** Original retained CBOR/file/evidence bytes named by projection rows. */
  payloads?: readonly Uint8Array[];
  sources: readonly Uint8Array[];
  evidence: readonly Uint8Array[];
  /** Selective local coverage is exported as null, not a sparse complete table. */
  outcomes: readonly Uint8Array[] | null;
}
export interface NativeCheckpointRecordData {
  path: string;
  cid: string;
  bytes: Uint8Array;
}
export interface NativeCheckpointPayloadData {
  cid: string;
  bytes: Uint8Array;
}
export interface NativeCheckpointTableData {
  payload: NativeCheckpointPayloadData;
  pages: NativeCheckpointPayloadData[];
}
export interface NativeCheckpointProducerData {
  assertion: NativeCheckpointPayloadData;
  tables: Record<'history' | 'sources' | 'evidence', NativeCheckpointTableData> & {
    outcomes: NativeCheckpointTableData | null;
  };
  records: NativeCheckpointRecordData[];
  counters: {
    records: number;
    recordBytes: number;
    chunks: number;
    manifests: number;
    pages: number;
    payloadBytes: number;
  };
}
function fail(message: string): never {
  throw new ProtocolError('envelope', message);
}
function limit(message: string): never {
  throw new AtseqError('content_unavailable', message);
}
function json(value: unknown, maximumBytes = CHECKPOINT_DATA_BOUNDS.payloadBytes): Uint8Array {
  return encoder.encode(canonicalJson(value, maximumBytes, CHECKPOINT_DATA_BOUNDS.depth));
}
/** Count, capture and canonical validation are synchronous, before hashing awaits. */
function capture(input: NativeCheckpointProducerInput) {
  const header = JSON.parse(
    canonicalJson(
      {
        scope: input.scope,
        head: input.head,
        frontier: input.frontier,
        definition: input.definition,
        stall: input.stall,
      },
      CHECKPOINT_DATA_BOUNDS.pageBytes,
      CHECKPOINT_DATA_BOUNDS.depth,
    ),
  );
  let capturedBytes = 0;
  function raw(value: Uint8Array, maximum = CHECKPOINT_DATA_BOUNDS.payloadBytes, canonical = true) {
    if (Reflect.apply(byteKind, value, []) !== 'Uint8Array')
      throw new ProtocolError('input', 'Expected original checkpoint bytes');
    const length = Reflect.apply(byteLength, value, []) as number;
    if (length > maximum) fail('Unsupported checkpoint payload bytes');
    if (length > MAXIMUM_INVENTORY_BYTES - capturedBytes) limit('Checkpoint input inventory exceeds byte capacity');
    const owned = new OwnedBytes(length);
    Reflect.apply(copyBytes, owned, [value]);
    if (canonical) readCheckpointJson(owned, maximum, maximum === CHECKPOINT_DATA_BOUNDS.pageBytes);
    capturedBytes += length;
    return owned;
  }
  let count = 0;
  function rows(values: readonly Uint8Array[], canonical = true) {
    if (!Array.isArray(values)) throw new ProtocolError('input', 'Expected checkpoint row bytes');
    const length = values.length;
    if (!Number.isSafeInteger(length) || Object.is(length, -0) || length < 0)
      throw new ProtocolError('input', 'Expected a safe checkpoint row count');
    if (length > MAXIMUM_ROWS - count) limit('Checkpoint input inventory exceeds row capacity');
    count += length;
    const result: Uint8Array[] = [];
    for (let index = 0; index < length; index++) {
      const descriptor = Object.getOwnPropertyDescriptor(values, String(index));
      if (!descriptor || !('value' in descriptor))
        throw new ProtocolError('input', 'Expected owned checkpoint row bytes');
      result.push(
        raw(
          descriptor.value,
          canonical ? CHECKPOINT_DATA_BOUNDS.pageBytes : CHECKPOINT_DATA_BOUNDS.payloadBytes,
          canonical,
        ),
      );
    }
    return result;
  }
  return {
    ...header,
    state: raw(input.state),
    authority: raw(input.authority),
    producer: raw(input.producer),
    payloads: rows(input.payloads ?? [], false),
    history: rows(input.history),
    sources: rows(input.sources),
    evidence: rows(input.evidence),
    outcomes: input.outcomes === null ? null : rows(input.outcomes),
  };
}
/** One invocation has one bounded transient content inventory; there is no retained cache. */
export async function produceNativeCheckpoint(
  input: NativeCheckpointProducerInput,
): Promise<NativeCheckpointProducerData> {
  const captured = capture(input);
  const inventory = new Map<string, NativeCheckpointRecordData>();
  const counters = { records: 0, recordBytes: 0, chunks: 0, manifests: 0, pages: 0, payloadBytes: 0 };
  async function record(value: unknown, kind: 'chunks' | 'manifests') {
    const raw = encodeBlock(value);
    const cid = await contentCid(value);
    if (!inventory.has(cid)) {
      if (inventory.size >= MAXIMUM_ROWS || raw.length > MAXIMUM_INVENTORY_BYTES - counters.recordBytes)
        limit('Checkpoint content inventory exceeds capacity');
      inventory.set(cid, { path: `${NATIVE_NSID.content}/${cid}`, cid, bytes: raw });
      counters.records++;
      counters.recordBytes += raw.length;
      counters[kind]++;
    }
    return cid;
  }
  async function payload(raw: Uint8Array): Promise<NativeCheckpointPayloadData> {
    if (raw.length > CHECKPOINT_DATA_BOUNDS.payloadBytes) fail('Unsupported checkpoint payload bytes');
    const chunks = [];
    for (let offset = 0; offset < raw.length; offset += CHUNK_BYTES)
      chunks.push(
        link(
          await record(
            {
              $type: NATIVE_NSID.content,
              version: 1,
              body: { $type: nativeRef('byteChunk'), bytes: bytes(raw.subarray(offset, offset + CHUNK_BYTES)) },
            },
            'chunks',
          ),
        ),
      );
    const cid = await record(
      {
        $type: NATIVE_NSID.content,
        version: 1,
        body: { $type: nativeRef('byteManifest'), byteLength: raw.length, chunks },
      },
      'manifests',
    );
    counters.payloadBytes += raw.length;
    return { cid, bytes: raw };
  }
  const scope: CheckpointPin = captured.scope;
  const authority: any = readCheckpointJson(captured.authority, CHECKPOINT_DATA_BOUNDS.payloadBytes);
  if (
    !authority ||
    typeof authority !== 'object' ||
    Array.isArray(authority) ||
    authority.format !== 'atseq-checkpoint-authority' ||
    authority.version !== 1 ||
    authority.app !== scope.app ||
    authority.genesis !== scope.genesis ||
    authority.activeDefinition !== captured.definition ||
    canonicalJson(authority.frontier) !== canonicalJson(captured.frontier)
  )
    fail('Authority payload differs from assertion scope/frontier/definition');

  const history = captured.history.map((raw: Uint8Array) =>
    readCheckpointJson(raw, CHECKPOINT_DATA_BOUNDS.pageBytes),
  ) as CheckpointHistoryRow[];
  for (const row of history)
    await readCheckpointPage(
      json([row], CHECKPOINT_DATA_BOUNDS.pageBytes),
      'history',
      scope,
      CHECKPOINT_DATA_BOUNDS.pageBytes,
      MAXIMUM_ROWS,
    );
  // Existing sole DATA index derivation checks complete positions and cross-page identities.
  deriveCheckpointIndexes(history, scope, captured.frontier.position);
  if (
    captured.frontier.entry !==
    (captured.frontier.position === 0 ? scope.genesis : history[captured.frontier.position - 1]?.entry)
  )
    fail('Checkpoint frontier differs from complete history');
  if (captured.stall !== null && captured.stall.entry !== history[captured.frontier.position]?.entry)
    fail('Checkpoint stall differs from first pending history entry');
  async function table(
    kind: CheckpointKind,
    originals: Uint8Array[],
    through: CheckpointThrough,
  ): Promise<NativeCheckpointTableData> {
    const pages: NativeCheckpointPayloadData[] = [];
    const pageRows: number[] = [];
    let parts: string[] = [];
    let pageBytes = 2;
    async function flush() {
      if (!parts.length) return;
      const raw = encoder.encode(`[${parts.join(',')}]`);
      // Existing row parser; container-depth is checked with the actual array wrapper.
      await readCheckpointPage(raw, kind as 'history', scope, CHECKPOINT_DATA_BOUNDS.pageBytes, MAXIMUM_ROWS);
      pages.push(await payload(raw));
      pageRows.push(parts.length);
      counters.pages++;
      parts = [];
      pageBytes = 2;
    }
    for (const raw of originals) {
      if (raw.length + 2 > CHECKPOINT_DATA_BOUNDS.pageBytes) fail('One checkpoint row exceeds page capacity');
      if (pageBytes + raw.length + (parts.length ? 1 : 0) > CHECKPOINT_DATA_BOUNDS.pageBytes) await flush();
      parts.push(new TextDecoder().decode(raw));
      pageBytes += raw.length + (parts.length > 1 ? 1 : 0);
    }
    await flush();
    const raw = json({
      format: 'atseq-checkpoint-table',
      version: 1,
      ...scope,
      kind,
      through,
      rows: originals.length,
      pages: pages.map((page, index) => ({ payload: page.cid, rows: pageRows[index] })),
    });
    // Shared complete reader checks cross-page order/counts/identities and boundary.
    await readCompleteCheckpointTable(
      raw,
      pages.map((page) => page.bytes),
      kind as 'history',
      scope,
      MAXIMUM_INVENTORY_BYTES,
      MAXIMUM_ROWS,
    );
    return { payload: await payload(raw), pages };
  }
  const tables: NativeCheckpointProducerData['tables'] = {
    history: await table('history', captured.history, captured.head),
    sources: await table('sources', captured.sources, captured.head),
    evidence: await table('evidence', captured.evidence, captured.head),
    outcomes: null,
  };
  if (captured.outcomes !== null) {
    const rows = captured.outcomes.map((raw: Uint8Array) => readCheckpointJson(raw, CHECKPOINT_DATA_BOUNDS.pageBytes));
    const positions = new Set<number>();
    for (const row of rows) {
      await readCheckpointPage(
        json([row], CHECKPOINT_DATA_BOUNDS.pageBytes),
        'outcomes',
        scope,
        CHECKPOINT_DATA_BOUNDS.pageBytes,
        MAXIMUM_ROWS,
      );
      if (
        row.position > captured.frontier.position ||
        positions.has(row.position) ||
        row.entry !== history[row.position - 1]?.entry
      )
        fail('Selective outcomes differ from history/frontier');
      positions.add(row.position);
    }
    if (rows.length === captured.frontier.position)
      tables.outcomes = await table('outcomes', captured.outcomes, captured.frontier);
  }
  for (const original of captured.payloads) await payload(original);
  const state = await payload(captured.state),
    authorityPayload = await payload(captured.authority),
    producer = await payload(captured.producer);
  const raw = json({
    format: 'atseq-checkpoint-assertion',
    version: 1,
    ...scope,
    head: captured.head,
    frontier: captured.frontier,
    definition: captured.definition,
    state: state.cid,
    authority: authorityPayload.cid,
    producer: producer.cid,
    history: tables.history.payload.cid,
    sources: tables.sources.payload.cid,
    evidence: tables.evidence.payload.cid,
    outcomes: tables.outcomes?.payload.cid ?? null,
    stall: captured.stall,
  });
  readCheckpointAssertion(raw, scope, CHECKPOINT_DATA_BOUNDS.payloadBytes);
  return {
    assertion: await payload(raw),
    tables,
    records: [...inventory.values()].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0)),
    counters,
  };
}
