/** Raw local storage only. No stored bytes or generation ID establish protocol trust. */
export type LocalRowKind =
  'history' | 'requests' | 'descriptors' | 'outcomes' | 'authority' | 'sources' | 'evidence' | 'pending';
export interface LocalGeneration {
  id: number;
  metadata: Uint8Array;
}
export interface LocalChange {
  kind: LocalRowKind;
  key: string;
  value: Uint8Array | null;
}
export interface LocalPage {
  rows: { key: string; value: Uint8Array }[];
  next?: string;
}
export interface LocalGenerations {
  current(): Promise<LocalGeneration | undefined>;
  read(id: number): Promise<LocalGeneration>;
  row(id: number, kind: LocalRowKind, key: string): Promise<Uint8Array | undefined>;
  page(id: number, kind: LocalRowKind, after?: string, limit?: number): Promise<LocalPage>;
  commit(expected: number | null, metadata: Uint8Array, changes: readonly LocalChange[]): Promise<number>;
  pin(id: number, reference: string): Promise<void>;
  release(reference: string): Promise<void>;
  close(): Promise<void>;
}
export class LocalStorageError extends Error {
  constructor(
    readonly code: 'input' | 'conflict' | 'quota' | 'missing' | 'closed' | 'corrupt' | 'busy',
    message: string,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = 'LocalStorageError';
  }
}
/** Operational limits; bytes count stored payloads/keys, not backend file overhead. */
export const LOCAL_STORAGE_LIMITS = Object.freeze({
  bytes: 48 * 1024 * 1024,
  rows: 100_000,
  generations: 4,
  pins: 16,
  changes: 1000,
  rowBytes: 1024 * 1024,
  metadataBytes: 128 * 1024,
  pageRows: 1000,
  pageBytes: 1024 * 1024,
});
export type LocalLimits = { -readonly [K in keyof typeof LOCAL_STORAGE_LIMITS]: number };
export function storageLimits(values: Partial<LocalLimits> = {}): LocalLimits {
  if (!values || typeof values !== 'object' || Array.isArray(values))
    throw new LocalStorageError('input', 'Invalid local storage limits');
  const limits: LocalLimits = { ...LOCAL_STORAGE_LIMITS };
  for (const [key, value] of Object.entries(values)) {
    if (!Object.hasOwn(limits, key) || !Number.isSafeInteger(value) || value <= 0)
      throw new LocalStorageError('input', 'Invalid local storage limit');
    limits[key as keyof LocalLimits] = value;
  }
  if (limits.generations < 2) throw new LocalStorageError('input', 'Retain current and previous generations');
  return limits;
}
export function storageId(id: number): void {
  if (!Number.isSafeInteger(id) || id <= 0)
    throw new LocalStorageError('input', 'Expected positive safe generation ID');
}
export function storageKey(key: string): void {
  if (typeof key !== 'string' || !/^[\x20-\x7e]{1,1024}$/.test(key))
    throw new LocalStorageError('input', 'Expected nonempty bounded ASCII storage key');
}
export function storageKind(kind: LocalRowKind): void {
  if (!['history', 'requests', 'descriptors', 'outcomes', 'authority', 'sources', 'evidence', 'pending'].includes(kind))
    throw new LocalStorageError('input', 'Unknown local row kind');
}
export function ownCommit(
  expected: number | null,
  metadata: Uint8Array,
  changes: readonly LocalChange[],
  limits: LocalLimits,
) {
  if (expected !== null) storageId(expected);
  if (!(metadata instanceof Uint8Array) || metadata.byteLength > limits.metadataBytes)
    throw new LocalStorageError('input', 'Invalid generation metadata bytes');
  if (!Array.isArray(changes) || changes.length > limits.changes)
    throw new LocalStorageError('input', 'Too many local changes');
  const seen = new Set<string>();
  let bytes = metadata.byteLength + 8;
  const owned: LocalChange[] = [];
  for (const change of changes) {
    if (!change || typeof change !== 'object') throw new LocalStorageError('input', 'Invalid local change');
    storageKind(change.kind);
    storageKey(change.key);
    const identity = `${change.kind}\0${change.key}`;
    if (seen.has(identity)) throw new LocalStorageError('input', 'Duplicate local change');
    seen.add(identity);
    if (change.value !== null && (!(change.value instanceof Uint8Array) || change.value.byteLength > limits.rowBytes))
      throw new LocalStorageError('input', 'Invalid local row bytes');
    bytes += rowSize(change);
    if (!Number.isSafeInteger(bytes) || bytes > limits.bytes)
      throw new LocalStorageError('quota', 'Local change exceeds byte quota');
    owned.push({
      kind: change.kind,
      key: change.key,
      value: change.value === null ? null : new Uint8Array(change.value),
    });
  }
  return { metadata: new Uint8Array(metadata), changes: owned };
}
export function rowSize(change: LocalChange): number {
  return change.kind.length + change.key.length + 8 + (change.value?.byteLength ?? 0);
}
export function retainGenerations(current: number, pins: readonly number[], limits: LocalLimits): number[] {
  const kept = [...new Set([current, ...(current > 1 ? [current - 1] : []), ...pins])].sort((a, b) => a - b);
  if (kept.length > limits.generations)
    throw new LocalStorageError('quota', 'Pinned generations exceed retention quota');
  return kept;
}
export function pageLimit(limit: number | undefined, limits: LocalLimits): number {
  const value = limit ?? limits.pageRows;
  if (!Number.isSafeInteger(value) || value <= 0 || value > limits.pageRows)
    throw new LocalStorageError('input', 'Invalid local page limit');
  return value;
}
