import { fromBytes } from '@atcute/cbor';
import {
  Anchor,
  headAt,
  verifyHistory,
  runtimeDescriptor,
  runtimeCid,
  type Head,
  type Genesis,
  type Entry,
  type Invitation,
} from '../protocol/log.ts';
import type { Bytes } from '@atcute/cbor';
import { bytes, contentCid, ProtocolError } from '../protocol/wire.ts';
import { SourceBundle, SourcePool } from '../definition/source.ts';
import { LoadedDefinition } from '../definition/load.ts';
import { Folder } from '../application/folder.ts';
import { applicationRuntimeDescriptor, applicationRuntimeCid } from '../protocol/identity.ts';
import { activationPayload, ACTIVATE } from '../definition/control.ts';
import notices from './notices.json';

import { AtseqError } from '../core/errors.ts';
import { ARCHIVE_LIMIT } from './limits.ts';
export { ARCHIVE_LIMIT } from './limits.ts';
export const REPLAY =
  'Install the trusted Atseq runtime named by runtime.application (and its locked dependencies). Run the documented CLI replay operation with this archive and a new output directory. Archive content never installs or executes runtime code. A browser with this installed shell can import the archive offline. This is a retained copy; it does not grant write authority or recreate PDS credentials.';
export interface RetainedInput {
  genesis: Genesis;
  genesisCid: string;
  head: Head;
  entries: Entry[];
  source: Bytes;
  candidates?: { definition: string; source: Bytes }[];
}
export interface ArchiveNotice {
  name: string;
  version: string;
  license: string;
  texts: Record<string, string>;
}
export interface Archive {
  format: 'atseq-archive';
  version: 1;
  input: RetainedInput;
  runtime: { application: unknown; engine: unknown };
  inventory: { cid: string; bytes: number }[];
  licenses: ArchiveNotice[];
  replay: string;
}
function fields(value: unknown, allowed: string[]): asserts value is Record<string, unknown> {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.keys(value).some((key) => !allowed.includes(key))
  )
    throw new ProtocolError('archive', 'Unknown archive field or invalid object');
}
const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
function shape(input: RetainedInput) {
  if (
    !input ||
    !Array.isArray(input.entries) ||
    input.entries.length > 20000 ||
    !Array.isArray(input.candidates ?? []) ||
    (input.candidates?.length ?? 0) > 32
  )
    throw new ProtocolError('archive', 'Archive history or source count exceeds the installed bounds');
}
async function poolFor(input: RetainedInput, expected?: Invitation) {
  shape(input);
  if (
    Object.keys(input).some(
      (key) => !['genesis', 'genesisCid', 'head', 'entries', 'source', 'candidates'].includes(key),
    )
  )
    throw new ProtocolError('archive', 'Unknown retained input field');
  for (const candidate of input.candidates ?? [])
    if (!candidate || Object.keys(candidate).some((key) => !['definition', 'source'].includes(key)))
      throw new ProtocolError('archive', 'Unknown candidate field');
  fields(input.source, ['$bytes']);
  for (const candidate of input.candidates ?? []) fields(candidate.source, ['$bytes']);
  const anchor = await Anchor.from(input.genesis, expected ?? { app: input.genesis.app, genesis: input.genesisCid }),
    source = await SourceBundle.read(fromBytes(input.source));
  if (source.root !== anchor.genesis.definition.$link)
    throw new ProtocolError('archive', 'Archive initial definition differs from genesis');
  await LoadedDefinition.load(source.root, source);
  const pool = new SourcePool(),
    inventory = new Map<string, number>();
  for (const candidate of [{ definition: source.root, source: input.source }, ...(input.candidates ?? [])]) {
    const bundle = await SourceBundle.readClosure(fromBytes(candidate.source));
    if (bundle.root !== candidate.definition)
      throw new ProtocolError('archive', 'Archive candidate identity differs from its CAR');
    await pool.add(bundle);
    for (const cid of bundle.identities()) inventory.set(cid, (await bundle.get(cid)).length);
  }
  return {
    anchor,
    pool,
    inventory: [...inventory].sort(([a], [b]) => a.localeCompare(b)).map(([cid, bytes]) => ({ cid, bytes })),
  };
}
export async function replayInput(input: RetainedInput, expected?: Invitation) {
  const owned = structuredClone(input),
    { anchor, pool, inventory } = await poolFor(owned, expected);
  const history = await verifyHistory(anchor, owned.head, owned.entries),
    folder = await Folder.open(anchor, pool);
  const snapshot = await folder.catchUp(history.head, history.entries);
  const retries = [];
  for (const entry of history.entries)
    retries.push({
      actorKey: entry.signedIntent.intent.actorKey,
      nonce: entry.signedIntent.intent.nonce,
      receipt: await history.retries.lookup(entry.signedIntent.intent),
    });
  return { folder, snapshot, retries, inventory, history, anchor };
}
export async function exportArchive(input: RetainedInput, expected: Invitation, position?: number): Promise<Archive> {
  if (!expected?.app || !expected.genesis) throw new ProtocolError('anchor', 'Export requires both invitation pins');
  const pinned = { app: expected.app, genesis: expected.genesis };
  const checked = await replayInput(
      {
        genesis: input.genesis,
        genesisCid: input.genesisCid,
        head: input.head,
        entries: input.entries,
        source: input.source,
        candidates: input.candidates,
      },
      pinned,
    ),
    complete = checked.snapshot.projection.frontier.position;
  const chosen = position ?? complete;
  if (!Number.isSafeInteger(chosen) || chosen < 0 || chosen > complete)
    throw new ProtocolError('archive', `Only the complete interpreted prefix through ${complete} can be exported`);
  const entries = checked.history.entries.slice(0, chosen),
    head = headAt(checked.anchor, chosen, chosen ? await contentCid(entries[chosen - 1]) : checked.anchor.cid);
  const definitions = new Set<string>();
  for (const entry of entries) {
    if (
      entry.signedIntent.intent.action !== ACTIVATE ||
      !checked.anchor.genesis.activationKeys.includes(entry.signedIntent.intent.actorKey)
    )
      continue;
    try {
      definitions.add(activationPayload(entry.signedIntent.intent.payload).definition);
    } catch {
      /* A malformed control action needs no source. */
    }
  }
  // Construct only retained public inputs; never spread a host/device object.
  const retained: RetainedInput = {
    genesis: checked.anchor.genesis,
    genesisCid: checked.anchor.cid,
    head,
    entries,
    source: bytes(fromBytes(input.source)),
    candidates: (input.candidates ?? [])
      .filter((c) => definitions.has(c.definition))
      .map((c) => ({ definition: c.definition, source: bytes(fromBytes(c.source)) })),
  };
  const selected = await replayInput(retained, pinned);
  if (selected.snapshot.stalled || selected.snapshot.projection.frontier.position !== chosen)
    throw new ProtocolError('archive', 'Chosen archive prefix is incomplete');
  const archive: Archive = {
    format: 'atseq-archive',
    version: 1,
    input: retained,
    runtime: { application: applicationRuntimeDescriptor, engine: runtimeDescriptor },
    inventory: selected.inventory,
    licenses: archiveNotices(notices),
    replay: REPLAY,
  };
  encodeArchive(archive);
  return structuredClone(archive);
}
export function encodeArchive(archive: Archive): Uint8Array {
  const data = new TextEncoder().encode(JSON.stringify(archive));
  if (data.length > ARCHIVE_LIMIT) throw new ProtocolError('archive_size', 'Archive exceeds 48 MiB');
  return data;
}
export type ArchiveInvitation = Invitation;
function retainedInput(value: unknown): RetainedInput {
  fields(value, ['genesis', 'genesisCid', 'head', 'entries', 'source', 'candidates']);
  fields(value.genesis, ['$type', 'version', 'app', 'profile', 'definition', 'sequencerKey', 'activationKeys']);
  if (typeof value.genesis.app !== 'string' || typeof value.genesisCid !== 'string')
    throw new ProtocolError('archive', 'Invalid archive anchor');
  if (!Array.isArray(value.entries) || !Array.isArray(value.candidates ?? []))
    throw new ProtocolError('archive', 'Invalid archive history or candidates');
  fields(value.source, ['$bytes']);
  const source = bytes(fromBytes(value.source as unknown as Bytes));
  const candidates = (value.candidates ?? []) as unknown[];
  const retainedCandidates = candidates.map((candidate) => {
    fields(candidate, ['definition', 'source']);
    if (typeof candidate.definition !== 'string') throw new ProtocolError('archive', 'Invalid candidate identity');
    fields(candidate.source, ['$bytes']);
    return { definition: candidate.definition, source: bytes(fromBytes(candidate.source as unknown as Bytes)) };
  });
  // Genesis, head and entries are untrusted here. The protocol verifies their
  // complete schemas, identities, signatures and ordering before any return.
  return {
    genesis: value.genesis as unknown as Genesis,
    genesisCid: value.genesisCid,
    head: value.head as Head,
    entries: value.entries as Entry[],
    source,
    candidates: retainedCandidates,
  };
}
function archiveNotices(value: unknown): ArchiveNotice[] {
  if (!Array.isArray(value)) throw new ProtocolError('archive', 'Invalid archive notices');
  return value.map((item) => {
    fields(item, ['name', 'version', 'license', 'texts']);
    fields(item.texts, Object.keys(item.texts && typeof item.texts === 'object' ? item.texts : {}));
    if (
      typeof item.name !== 'string' ||
      typeof item.version !== 'string' ||
      typeof item.license !== 'string' ||
      Object.values(item.texts).some((text) => typeof text !== 'string')
    )
      throw new ProtocolError('archive', 'Invalid archive notices');
    return {
      name: item.name,
      version: item.version,
      license: item.license,
      texts: { ...item.texts } as Record<string, string>,
    };
  });
}
async function importVerifiedArchive(raw: Uint8Array, expected?: ArchiveInvitation | ArchiveInvitation[]) {
  if (raw.length > ARCHIVE_LIMIT) throw new ProtocolError('archive_size', 'Archive exceeds 48 MiB');
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(raw));
  } catch {
    throw new ProtocolError('archive', 'Archive is not valid UTF-8 JSON');
  }
  fields(parsed, ['format', 'version', 'input', 'runtime', 'inventory', 'licenses', 'replay']);
  if (parsed.format !== 'atseq-archive' || parsed.version !== 1)
    throw new ProtocolError('archive', 'Unsupported archive format');
  fields(parsed.runtime, ['application', 'engine']);
  if (
    (await contentCid(parsed.runtime.application)) !== (await applicationRuntimeCid()) ||
    (await contentCid(parsed.runtime.engine)) !== (await runtimeCid())
  )
    throw new ProtocolError('archive_runtime', 'Archive requires a different installed runtime');
  if (!Array.isArray(parsed.inventory) || parsed.inventory.length > 2048)
    throw new ProtocolError('archive_inventory', 'Invalid archive inventory');
  const inventory = parsed.inventory.map((item) => {
    fields(item, ['cid', 'bytes']);
    if (typeof item.cid !== 'string' || !Number.isSafeInteger(item.bytes) || (item.bytes as number) < 0)
      throw new ProtocolError('archive_inventory', 'Invalid archive inventory');
    return { cid: item.cid, bytes: item.bytes as number };
  });
  const input = retainedInput(parsed.input);
  const pins = Array.isArray(expected)
    ? expected.filter((pin) => pin.app === input.genesis.app)
    : expected
      ? [expected]
      : [];
  if (pins.some((pin) => input.genesis.app !== pin.app || input.genesisCid !== pin.genesis))
    throw new ProtocolError('archive_pin', 'Archive differs from the pinned invitation');
  const licenses = archiveNotices(parsed.licenses);
  if (typeof parsed.replay !== 'string') throw new ProtocolError('archive', 'Invalid archive replay instructions');
  const replay = await replayInput(input, pins[0]);
  if (replay.snapshot.stalled || replay.snapshot.projection.frontier.position !== replay.history.head.position)
    throw new ProtocolError(
      'archive_incomplete',
      `Archive is incomplete: ${replay.snapshot.stalled?.code ?? 'frontier'}`,
    );
  if (!equal(inventory, replay.inventory))
    throw new ProtocolError('archive_inventory', 'Archive inventory differs from verified content');
  const archive: Archive = {
    format: 'atseq-archive',
    version: 1,
    input: {
      genesis: replay.anchor.genesis,
      genesisCid: replay.anchor.cid,
      head: replay.history.head,
      entries: replay.history.entries,
      source: input.source,
      candidates: input.candidates,
    },
    runtime: { application: applicationRuntimeDescriptor, engine: runtimeDescriptor },
    inventory: replay.inventory,
    licenses,
    replay: parsed.replay,
  };
  // Return only owned, verified public data; never expose the parser's object.
  return { archive: structuredClone(archive), ...replay };
}

export async function importArchive(raw: Uint8Array, expected?: ArchiveInvitation | ArchiveInvitation[]) {
  try {
    return await importVerifiedArchive(new Uint8Array(raw), expected && structuredClone(expected));
  } catch (error) {
    if (error instanceof AtseqError) throw error;
    throw new ProtocolError('archive', 'Archive contains invalid public data');
  }
}
