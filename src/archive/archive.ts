import { fromBytes } from '@atcute/cbor';
import { Anchor, headAt, verifyHistory, runtimeDescriptor, runtimeCid, type Head } from '../protocol/log.ts';
import { bytes, contentCid } from '../protocol/wire.ts';
import { SourceBundle, SourcePool } from '../definition/source.ts';
import { LoadedDefinition } from '../definition/load.ts';
import { Folder } from '../runtime/folder.ts';
import { applicationRuntimeDescriptor, applicationRuntimeCid } from '../runtime/identity.ts';
import { activationPayload, ACTIVATE } from '../definition/control.ts';
import notices from './notices.json';

import { ARCHIVE_LIMIT } from './limits.ts';
export { ARCHIVE_LIMIT } from './limits.ts';
export const REPLAY = 'Install the trusted Atseq runtime named by runtime.application (and its locked dependencies). Run the documented CLI replay operation with this archive and a new output directory. Archive content never installs or executes runtime code. A browser with this installed shell can import the archive offline. This is a retained copy; it does not grant write authority or recreate PDS credentials.';
export interface RetainedInput { genesis: any; genesisCid: string; head: Head; entries: any[]; source: any; candidates?: { definition: string; source: any }[] }
export interface Archive { format: 'atseq-archive'; version: 0; input: RetainedInput; runtime: { application: unknown; engine: unknown }; inventory: { cid: string; bytes: number }[]; licenses: typeof notices; replay: string }
const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
function shape(input: RetainedInput) {
  if (!input || !Array.isArray(input.entries) || input.entries.length > 20000 || !Array.isArray(input.candidates ?? []) || (input.candidates?.length ?? 0) > 32) throw new Error('Archive history or source count exceeds the installed bounds');
}
async function poolFor(input: RetainedInput) {
  shape(input);
  if (Object.keys(input).some(key => !['genesis','genesisCid','head','entries','source','candidates'].includes(key))) throw new Error('Unknown retained input field');
  for (const candidate of input.candidates ?? []) if (!candidate || Object.keys(candidate).some(key => !['definition','source'].includes(key))) throw new Error('Unknown candidate field');
  const anchor = await Anchor.from(input.genesis, input.genesisCid), source = await SourceBundle.read(fromBytes(input.source));
  if (source.root !== anchor.genesis.definition.$link) throw new Error('Archive initial definition differs from genesis');
  await LoadedDefinition.load(source.root, source);
  const pool = new SourcePool(), inventory = new Map<string, number>();
  for (const candidate of [{ definition: source.root, source: input.source }, ...(input.candidates ?? [])]) {
    const bundle = await SourceBundle.read(fromBytes(candidate.source));
    if (bundle.root !== candidate.definition) throw new Error('Archive candidate identity differs from its CAR');
    await pool.add(bundle);
    for (const cid of bundle.identities()) inventory.set(cid, (await bundle.get(cid)).length);
  }
  return { anchor, pool, inventory: [...inventory].sort(([a], [b]) => a.localeCompare(b)).map(([cid, bytes]) => ({ cid, bytes })) };
}
export async function replayInput(input: RetainedInput) {
  const owned = structuredClone(input), { anchor, pool, inventory } = await poolFor(owned);
  const history = await verifyHistory(anchor, owned.head, owned.entries), folder = await Folder.open(anchor, pool);
  const snapshot = await folder.catchUp(history.head, history.entries);
  const retries = [];
  for (const entry of history.entries) retries.push({ actorKey: entry.signedIntent.intent.actorKey, nonce: entry.signedIntent.intent.nonce, receipt: await history.retries.lookup(entry.signedIntent.intent) });
  return { folder, snapshot, retries, inventory, history, anchor };
}
export async function exportArchive(input: RetainedInput, position?: number): Promise<Archive> {
  const checked = await replayInput({genesis:input.genesis,genesisCid:input.genesisCid,head:input.head,entries:input.entries,source:input.source,candidates:input.candidates}), complete = checked.snapshot.projection.frontier.position;
  const chosen = position ?? complete;
  if (!Number.isSafeInteger(chosen) || chosen < 0 || chosen > complete) throw new Error(`Only the complete interpreted prefix through ${complete} can be exported`);
  const entries = checked.history.entries.slice(0, chosen), head = headAt(checked.anchor, chosen, chosen ? await contentCid(entries[chosen - 1]) : checked.anchor.cid);
  const definitions = new Set<string>();
  for (const entry of entries) {
    if (entry.signedIntent.intent.action !== ACTIVATE || !checked.anchor.genesis.activationKeys.includes(entry.signedIntent.intent.actorKey)) continue;
    try { definitions.add(activationPayload(entry.signedIntent.intent.payload).definition); } catch { /* A malformed control action needs no source. */ }
  }
  // Construct only retained public inputs; never spread a host/device object.
  const retained: RetainedInput = { genesis: checked.anchor.genesis, genesisCid: checked.anchor.cid, head, entries, source: bytes(fromBytes(input.source)), candidates: (input.candidates ?? []).filter(c => definitions.has(c.definition)).map(c => ({ definition: c.definition, source: bytes(fromBytes(c.source)) })) };
  const selected = await replayInput(retained);
  if (selected.snapshot.stalled || selected.snapshot.projection.frontier.position !== chosen) throw new Error('Chosen archive prefix is incomplete');
  const archive: Archive = { format: 'atseq-archive', version: 0, input: retained, runtime: { application: applicationRuntimeDescriptor, engine: runtimeDescriptor }, inventory: selected.inventory, licenses: notices, replay: REPLAY };
  encodeArchive(archive); return structuredClone(archive);
}
export function encodeArchive(archive: Archive): Uint8Array {
  const data = new TextEncoder().encode(JSON.stringify(archive));
  if (data.length > ARCHIVE_LIMIT) throw new Error('Archive exceeds 48 MiB'); return data;
}
export async function importArchive(raw: Uint8Array, expected?: { app: string; genesis: string }) {
  if (raw.length > ARCHIVE_LIMIT) throw new Error('Archive exceeds 48 MiB');
  const archive = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(raw)) as Archive;
  if (Object.keys(archive).some(key => !['format','version','input','runtime','inventory','licenses','replay'].includes(key))) throw new Error('Unknown archive field');
  if (archive.format !== 'atseq-archive' || archive.version !== 0 || !archive.runtime) throw new Error('Unsupported archive format');
  if (await contentCid(archive.runtime.application) !== await applicationRuntimeCid() || await contentCid(archive.runtime.engine) !== await runtimeCid()) throw new Error('Archive requires a different installed runtime');
  if (expected && (archive.input?.genesis?.app !== expected.app || archive.input?.genesisCid !== expected.genesis)) throw new Error('Archive differs from the pinned invitation');
  if (!equal(archive.licenses, notices) || archive.replay !== REPLAY) throw new Error('Archive runtime notices or replay instructions differ from the installed package');
  const replay = await replayInput(archive.input);
  if (replay.snapshot.stalled || replay.snapshot.projection.frontier.position !== replay.history.head.position) throw new Error(`Archive is incomplete: ${replay.snapshot.stalled?.code ?? 'frontier'}`);
  if (!equal(archive.inventory, replay.inventory)) throw new Error('Archive inventory differs from verified content');
  return { archive, ...replay };
}
