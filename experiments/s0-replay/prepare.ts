import { readFile, writeFile } from 'node:fs/promises';
import { gunzipSync, gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { fromBytes } from '@atcute/cbor';
import { SourceBundle } from '../../src/definition/source.ts';
import { LoadedDefinition } from '../../src/definition/load.ts';
import { canonicalJson } from '../../src/core/values.ts';
import { bytes } from '../../src/protocol/wire.ts';
import { fixtureApp, fixtureHistory } from '../../tests/support/runtime-corpus.ts';
import { guitarEvolution } from '../../testdata/apps/evolution.ts';
import { byteLength, equal, type CapFixture } from '../complete-state-cap/fixtures.ts';
import type { ReplayInput } from './replay.ts';

const output = 'experiments/post-spike-evidence/2026-10-01/s0-replay';
const raw = gunzipSync(
  await readFile('experiments/post-spike-evidence/2026-10-01/complete-state-cap/fixtures.json.gz'),
);
const fixtures: CapFixture[] = JSON.parse(raw.toString());
const sha = (value: Uint8Array) => createHash('sha256').update(value).digest('hex');
equal(sha(raw), 'bc0ead4ddb710a1a5c3cb5d1d3836d19a60b33360f8ca36d0138a37aac663b4d');
const owned = (value: any) => JSON.parse(canonicalJson(value, 2 ** 24));
const cap = (family: string) => fixtures.find((x) => x.size === 'at-cap' && x.family === family)!;
const inputs: ReplayInput[] = [];
function shortenTitles(state: any, rows: any[]) {
  let excess = byteLength(state) - 131072;
  for (const row of rows) {
    const removed = Math.min(excess, row.title.length - 1);
    row.title = row.title.slice(0, row.title.length - removed);
    excess -= removed;
    if (excess === 0) break;
  }
  equal(excess, 0);
  equal(byteLength(state), 131072);
}
for (const n of [100, 1000]) {
  for (const family of ['row-array', 'taskboard', 'guitar-selection', 'ledger']) {
    const fixture = cap(family === 'guitar-selection' ? 'guitar' : family);
    let original = await SourceBundle.read(fromBytes(fixture.source));
    if (family === 'guitar-selection') original = (await guitarEvolution()).bundle;
    const definition = await LoadedDefinition.load(original.root, original);
    let initial: any,
      expected: any,
      acts: any[],
      query = 'summary',
      expectedQuery: any;
    if (family === 'row-array') {
      initial = owned(fixture.state);
      expected = owned(initial);
      expected.revision = n % 2;
      acts = Array.from({ length: n }, () => ({ action: fixture.boundedAction.ref, payload: {} }));
      expectedQuery = { ...(fixture.expectedQuery as any) };
    } else if (family === 'taskboard') {
      expected = owned(fixture.state);
      expected.completed = expected.tasks.map((row: any) => row.id);
      shortenTitles(expected, expected.tasks);
      initial = owned(expected);
      initial.completed = expected.completed.slice(0, 1000 - n);
      acts = expected.completed.slice(1000 - n).map((id: string) => ({
        action: 'ai.generalbusiness.atseq.examples.taskboard.data#complete',
        payload: { id },
      }));
      expectedQuery = { count: 1000, completed: 1000 };
    } else if (family === 'guitar-selection') {
      expected = { ...owned(fixture.state), selected: (fixture.state as any).candidates.at(-1).id };
      shortenTitles(expected, expected.candidates);
      initial = { ...owned(expected), selected: '' };
      acts = Array.from({ length: n }, (_, i) => ({
        action: 'ai.generalbusiness.atseq.examples.guitar.data#select',
        payload: { id: expected.candidates[i % 2 === 0 ? 0 : 999].id },
      }));
      query = 'selection';
      expectedQuery = { selected: expected.selected };
    } else {
      expected = owned(fixture.state);
      initial = { ...owned(expected), entries: expected.entries.slice(0, 1000 - n) };
      initial.balanceMinor = initial.entries.reduce((sum: number, row: any) => sum + row.amountMinor, 0);
      acts = expected.entries.slice(1000 - n).map((payload: any) => ({ action: fixture.growingAction.ref, payload }));
      expectedQuery = fixture.expectedQuery;
    }
    definition.schemas.validate(definition.manifest.state.ref, initial);
    definition.schemas.validate(definition.manifest.state.ref, expected);
    const files = Object.fromEntries(definition.manifest.files.map((f) => [f.path, definition.bytes(f.path)]));
    files[definition.manifest.state.initial] = new TextEncoder().encode(canonicalJson(initial));
    const { files: _files, ...manifest } = definition.manifest;
    const bundle = await SourceBundle.pack(manifest, files);
    const app = await fixtureApp(bundle);
    const history = await fixtureHistory(app, acts);
    inputs.push({
      name: `${family}-${n}`,
      family,
      n,
      basis:
        family === 'guitar-selection'
          ? 'existing guitarEvolution schema and programs; retained cap candidates with shortened title padding'
          : `${fixture.name}; existing schema and programs`,
      originalSourceCid: original.root,
      derivativeSourceCid: bundle.root,
      changedSourcePaths: original.root === bundle.root ? [] : [definition.manifest.state.initial],
      initialStateBytes: byteLength(initial),
      finalStateBytes: byteLength(expected),
      initialRows: family === 'ledger' ? 1000 - n : 1000,
      finalRows: 1000,
      genesis: app.anchor.genesis,
      genesisCid: app.anchor.cid,
      source: bytes(await bundle.write()),
      ...history,
      expectedState: expected,
      query,
      expectedQuery,
    });
    console.log(
      JSON.stringify({
        prepared: `${family}-${n}`,
        initialBytes: byteLength(initial),
        finalBytes: byteLength(expected),
      }),
    );
  }
}
const publicRaw = Buffer.from(JSON.stringify(inputs) + '\n');
await writeFile(output + '/public-inputs.json.gz', gzipSync(publicRaw, { level: 9 }));
await writeFile(
  output + '/input-manifest.json',
  JSON.stringify(
    {
      inheritedFixtureSha256: sha(raw),
      inheritedFixtureBytes: raw.length,
      publicInputSha256: sha(publicRaw),
      publicInputBytes: publicRaw.length,
      request: '1c284142e7488e4242a77a67ec1cda349efd8151',
      promise: '98cc092fcd4b0c9522438fe68352fec188216fa2',
      inputs: inputs.map(({ genesis, genesisCid, source, entries, head, expectedState, ...metadata }) => metadata),
      privateKeysRetained: false,
    },
    null,
    2,
  ) + '\n',
);
