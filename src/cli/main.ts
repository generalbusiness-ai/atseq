import { readFile, readdir, lstat, mkdir, open, link as linkFile, rm } from 'node:fs/promises';
import { resolve, dirname, join, relative } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fromBytes } from '@atcute/cbor';
import { AtseqClient } from '../client/api.ts';
import { createIdentity, prepareIntent, type Identity } from '../client/identity.ts';
import { ACTIVATE, activationPayload } from '../definition/control.ts';
import { Folder } from '../runtime/folder.ts';
import { SourceBundle, SourcePool } from '../definition/source.ts';
import { LoadedDefinition } from '../definition/load.ts';
import { Anchor, verifyIntent } from '../protocol/log.ts';
import { bytes, contentCid, decodeBlock } from '../protocol/wire.ts';
import { atomicFile } from '../host/files.ts';

async function privateJson(path: string) {
  const stat = await lstat(path);
  if (!stat.isFile() || (stat.mode & 0o077) !== 0) throw new Error('Key/intent file must be a regular owner-readable file (0600)');
  try { return JSON.parse(await readFile(path, 'utf8')); } catch { throw new Error('Invalid local key or intent file'); }
}
async function createOnce(path: string, value: unknown): Promise<any> {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const temp = `${path}.${randomUUID()}.tmp`, file = await open(temp, 'wx', 0o600);
  try {
    await file.writeFile(JSON.stringify(value)); await file.sync(); await file.close();
    try { await linkFile(temp, path); const dir = await open(dirname(path), 'r'); try { await dir.sync(); } finally { await dir.close(); } }
    catch (e) { if ((e as any).code !== 'EEXIST') throw e; }
  } finally { await file.close().catch(() => {}); await rm(temp, { force: true }); }
  return privateJson(path);
}
async function pack(directory: string): Promise<SourceBundle> {
  const root = resolve(directory), manifest = JSON.parse(await readFile(join(root, 'manifest.json'), 'utf8'));
  if (manifest.files) throw new Error('Authoring manifest omits files; pack derives the retained closure');
  const files: Record<string, Uint8Array> = {}; let size = 0, count = 0;
  async function walk(path: string, depth = 0) {
    if (depth > 16) throw new Error('Source directory is too deep');
    for (const name of await readdir(path)) {
      const child = join(path, name), stat = await lstat(child);
      if (stat.isSymbolicLink()) throw new Error('Source symlinks are not accepted');
      if (stat.isDirectory()) await walk(child, depth + 1);
      else if (stat.isFile() && child !== join(root, 'manifest.json')) {
        size += stat.size; if (++count > 63 || size > 512 * 1024) throw new Error('Source closure exceeds profile limits');
        files[relative(root, child)] = await readFile(child);
      }
    }
  }
  await walk(root); return SourceBundle.pack(manifest, files);
}
export async function execute(input: any): Promise<unknown> {
  const prepareOnly = input.operation === 'prepare';
  if (prepareOnly) input = { ...input, operation: 'submit' };
  if (input.operation === 'activate') input = { ...input, operation: 'submit', action: ACTIVATE, payload: { expected: input.definition, definition: input.candidate, closure: input.closure } };
  if (input.operation === 'identity') {
    const identity = await createOnce(resolve(input.keyFile), await createIdentity(input.name));
    return { name: identity.name, publicKey: identity.publicKey };
  }
  if (input.operation === 'pack') {
    const source = await pack(input.directory); await LoadedDefinition.load(source.root, source);
    const output = resolve(input.output), root = resolve(input.directory);
    if (output.startsWith(root + '/')) throw new Error('Write the CAR outside its source folder');
    await atomicFile(output, await source.write()); return { definition: source.root, output };
  }
  const api = new AtseqClient(input.host);
  const target = { app: input.app, genesis: input.genesis };
  switch (input.operation) {
    case 'list': return api.call('list');
    case 'describe': return api.call('describe', target);
    case 'validate': return api.call('validateDraft', { source: bytes(await readFile(input.source)) });
    case 'compare': return api.call('compareDefinition', { ...target, expected: input.definition, source: bytes(await readFile(input.source)) });
    case 'stage': return api.call('stageDefinition', { ...target, expected: input.definition, source: bytes(await readFile(input.source)) });
    case 'preview': return api.call('preview', { source: bytes(await readFile(input.source)), ...(input.action ? { action: input.action, payload: input.payload } : {}), ...(input.state !== undefined ? { state: input.state } : {}) });
    case 'create': {
      const identity = await privateJson(input.keyFile) as Identity;
      return api.call('create', { source: bytes(await readFile(input.source)), activationKeys: [identity.publicKey] }, input.creationId);
    }
    case 'submit': {
      const identity = await privateJson(input.keyFile) as Identity, path = resolve(input.intentFile);
      let pending;
      try { pending = await privateJson(path); } catch (error) { if ((error as any).code !== 'ENOENT') throw error; }
      const requested = { ...target, definition: input.definition, action: input.action, payload: input.payload, actorKey: identity.publicKey };
      if (!pending) {
        const retained = await api.call('sync', target), source = await SourceBundle.read(fromBytes(retained.source));
        const anchor = await Anchor.from(retained.genesis, target.genesis);
        if (anchor.genesis.app !== target.app || source.root !== anchor.genesis.definition.$link) throw new Error('Source differs from the pinned invitation');
        await LoadedDefinition.load(source.root, source);
        const pool = new SourcePool(); await pool.add(source);
        for (const candidate of retained.candidates ?? []) {
          const bundle = await SourceBundle.read(fromBytes(candidate.source)); if (bundle.root !== candidate.definition) throw new Error('Candidate source identity differs'); await pool.add(bundle);
        }
        const folder = await Folder.open(anchor, pool); const snapshot = await folder.catchUp(retained.head, retained.entries);
        if (snapshot.stalled) throw new Error('History is paused; restore its source before signing a new action');
        const definition = folder.activeDefinition();
        if (definition.cid !== input.definition) throw new Error('Definition changed; review before signing a new intent');
        if (input.action === ACTIVATE) {
          const control = activationPayload(input.payload);
          if (control.expected !== definition.cid || !anchor.genesis.activationKeys.includes(identity.publicKey)) throw new Error('Identity has no activation grant for this definition');
        } else {
          if (!definition.manifest.actions.some(a => a.ref === input.action)) throw new Error('Unknown action');
          definition.schemas.validate(input.action, input.payload);
        }
        const prepared = await prepareIntent(identity, target, input.definition, input.action, input.payload);
        pending = await createOnce(path, { requested, ...prepared });
      }
      if (JSON.stringify(pending.requested) !== JSON.stringify(requested)) throw new Error('Intent file already names different work; retain it and use a new file for a reviewed replacement');
      // The retained signed bytes, including their original nonce, survive retries.
      const described = await api.call('describe', target);
      const verified = await verifyIntent(decodeBlock(new Uint8Array(pending.block)), await Anchor.from(described.genesis, target.genesis));
      const intent = verified.signed.intent;
      if (verified.intentCid !== pending.cid || await contentCid(verified.signed) !== await contentCid(pending.signed) || intent.actorKey !== requested.actorKey || intent.definition.$link !== requested.definition || intent.action !== requested.action || await contentCid(intent.payload) !== await contentCid(requested.payload)) throw new Error('Retained intent bytes differ from their recorded work');
      if (prepareOnly) return { intent: pending.cid, intentFile: path, status: 'prepared' };
      return { intent: pending.cid, ...await api.call('submit', { block: bytes(new Uint8Array(pending.block)) }) };
    }
    case 'query': return api.call('query', { ...target, name: input.name, params: JSON.stringify(input.params ?? {}) });
    case 'outcome': return api.call('receipt', { ...target, intent: input.intent });
    default: throw new Error('Unknown operation');
  }
}
// One JSON request on stdin, one JSON result on stdout. Errors never expose keys.
let raw = '';
try {
  for await (const chunk of process.stdin) { raw += chunk; if (Buffer.byteLength(raw) > 1024 * 1024) throw new Error('CLI request exceeds 1 MiB'); }
  console.log(JSON.stringify({ ok: true, result: await execute(JSON.parse(raw)) }));
} catch (error) { console.log(JSON.stringify({ ok: false, error: (error as Error).message })); process.exitCode = 1; }
