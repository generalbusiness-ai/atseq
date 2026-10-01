import test from 'node:test';
import assert from 'node:assert/strict';
import { chartFixture, guitarFixture } from '../testdata/apps/fixtures.ts';
import { LoadedDefinition } from '../src/definition/load.ts';
import { SourceBundle } from '../src/definition/source.ts';
import { AtseqError } from '../src/core/errors.ts';
import { encodeBlock, contentCid, decodeBlock } from '../src/protocol/wire.ts';

test('loader shape mutations remain coded input failures, including manifest and view edges', async (t) => {
  const values: unknown[] = [
    null,
    true,
    0,
    5,
    'bad',
    [],
    {},
    [null],
    { toString: 5 },
    { type: 'union', refs: 5, closed: true },
  ];
  let mutations = 0;
  async function attempt(load: () => Promise<LoadedDefinition>, label: string) {
    mutations++;
    try {
      await load();
    } catch (error) {
      assert.ok(error instanceof AtseqError, `${label}: ${String(error)}`);
      assert.notEqual(error.kind, 'runtime_fault', label);
    }
  }
  for (const fixture of [await chartFixture(), await guitarFixture()]) {
    // A rejected baseline would make a mutation pass meaningless.
    await LoadedDefinition.load(fixture.bundle.root, fixture.bundle);
    async function mutate(original: any, run: (changed: any, label: string) => Promise<void>, label: string) {
      const locations: string[][] = [];
      function visit(value: unknown, keys: string[] = []) {
        locations.push(keys);
        if (value && typeof value === 'object')
          for (const [key, child] of Object.entries(value)) visit(child, [...keys, key]);
      }
      visit(original);
      for (const keys of locations)
        for (const value of values) {
          let changed = structuredClone(original);
          if (!keys.length) changed = value;
          else {
            let parent = changed;
            for (const key of keys.slice(0, -1)) parent = parent[key];
            parent[keys.at(-1)!] = value;
          }
          await run(changed, `${label}/${keys.join('/')}: ${JSON.stringify(value)}`);
        }
    }
    for (const [path, raw] of Object.entries(fixture.files)) {
      if (!path.endsWith('.json')) continue;
      await mutate(
        JSON.parse(new TextDecoder().decode(raw)),
        async (changed, label) => {
          await attempt(async () => {
            const bundle = await SourceBundle.pack(fixture.manifest, {
              ...fixture.files,
              [path]: new TextEncoder().encode(JSON.stringify(changed)),
            });
            return LoadedDefinition.load(bundle.root, bundle);
          }, label);
        },
        path,
      );
    }
    const manifest = decodeBlock(await fixture.bundle.get(fixture.bundle.root));
    await mutate(
      manifest,
      async (changed, label) => {
        await attempt(async () => {
          const raw = encodeBlock(changed),
            cid = await contentCid(changed);
          return LoadedDefinition.load(cid, { get: async (id) => (id === cid ? raw : fixture.bundle.get(id)) });
        }, label);
      },
      'manifest',
    );
  }
  t.diagnostic(`${mutations} loader mutations checked against two loadable baselines`);
  assert.ok(mutations > 2500, `Only ${mutations} mutations ran`);
});
