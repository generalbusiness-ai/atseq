import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fromBytes } from '@atcute/cbor';
import { SourceBundle } from '../../src/definition/source.ts';
import { LoadedDefinition } from '../../src/definition/load.ts';
import { Folder } from '../../src/application/folder.ts';
import { exportArchive, encodeArchive, importArchive } from '../../src/archive/archive.ts';
import { bytes } from '../../src/protocol/wire.ts';
import { canonicalJson, type Json } from '../../src/core/values.ts';
import { fixtureApp, fixtureHistory } from '../../tests/support/runtime-corpus.ts';
import { byteLength, equal, type CapFixture } from './fixtures.ts';

// A small current-API correctness probe, not a timed native E1 workload.
const root = '.atseq-local/complete-state-cap';
const fixtures: CapFixture[] = JSON.parse(await readFile(root + '/fixtures.json', 'utf8'));
const captures = [];
const publicInputs = [];
for (const fixture of fixtures.filter((x) => x.size === 'at-cap')) {
  const original = await SourceBundle.read(fromBytes(fixture.source));
  const definition = await LoadedDefinition.load(original.root, original);
  const files = Object.fromEntries(definition.manifest.files.map((f) => [f.path, definition.bytes(f.path)]));
  // Put the exact prepared predecessor into the initial-state source. Other
  // bytes stay unchanged. This derivative definition has its own source CID.
  files[definition.manifest.state.initial] = new TextEncoder().encode(canonicalJson(fixture.predecessor));
  const { files: _files, ...manifest } = definition.manifest;
  const bundle = await SourceBundle.pack(manifest, files);
  const app = await fixtureApp(bundle);
  const history = await fixtureHistory(app, [
    { action: fixture.growingAction.ref, payload: fixture.growingAction.payload as Record<string, Json> },
  ]);
  const folder = await Folder.open(app.anchor, bundle);
  const snapshot = await folder.catchUp(history.head, history.entries);
  equal(snapshot.projection.state, fixture.state);
  equal(snapshot.projection.frontier.position, 1);
  if (snapshot.stalled !== undefined) throw new Error('One-action fixture stalled');
  equal(snapshot.projection.outcomes[0]!.outcome.$type, 'ai.generalbusiness.atseq.defs#effective');
  const query = await folder.query('summary', {});
  equal(query.result.$type, 'ai.generalbusiness.atseq.defs#queryAvailable');
  equal((query.result as any).value, fixture.expectedQuery);
  const input = {
    genesis: app.anchor.genesis,
    genesisCid: app.anchor.cid,
    ...history,
    source: bytes(await bundle.write()),
  };
  const invitation = { app: app.anchor.genesis.app, genesis: app.anchor.cid };
  const archive = await exportArchive(input, invitation);
  const archiveBytes = encodeArchive(archive);
  const imported = await importArchive(archiveBytes, invitation);
  equal(imported.snapshot.projection.state, fixture.state);
  equal(imported.snapshot.projection.frontier.position, 1);
  const sha = createHash('sha256').update(archiveBytes).digest('hex');
  captures.push({
    name: fixture.name,
    predecessorDefinitionCid: fixture.sourceCid,
    derivativeDefinitionCid: bundle.root,
    changedSourcePath: definition.manifest.state.initial,
    stateBytes: byteLength(snapshot.projection.state),
    frontier: 1,
    outcome: snapshot.projection.outcomes[0]!.outcome,
    queryValue: (query.result as any).value,
    archiveBytes: archiveBytes.length,
    archiveSha256: sha,
    archiveReplayed: true,
  });
  publicInputs.push({ name: fixture.name, input, invitation, archiveSha256: sha });
}
await writeFile(root + '/functional-public-inputs.json', JSON.stringify(publicInputs) + '\n');
await writeFile(
  root + '/functional-results.json',
  JSON.stringify(
    {
      exactHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
      node: process.version,
      captures,
      method:
        'Seven untimed one-action current Folder/query/archive probes. A derivative source replaces only initial-state bytes with each prepared predecessor. Public signed inputs retained without private keys. This does not exercise native vNext proofs/checkpoints, network transport, CLI or browser archive integration.',
    },
    null,
    2,
  ) + '\n',
);
console.log(
  JSON.stringify({
    fixtures: captures.length,
    passed: true,
    publicInputBytes: (await readFile(root + '/functional-public-inputs.json')).length,
  }),
);
