import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fromBytes } from '@atcute/cbor';
import { SourceBundle } from '../src/definition/source.ts';
import { LoadedDefinition } from '../src/definition/load.ts';
import { canonicalJson, jsonCopy } from '../src/core/values.ts';
import { encodeBlock, contentCid } from '../src/protocol/wire.ts';
import { evaluate, fold } from '../src/runtime/evaluator.ts';

// These are separate kernels over the same admitted source. They are not
// additive attribution of a Folder catch-up, and do not change runtime code.
const file = 'experiments/generated/performance-stages/growing-1-1000.json';
const raw = await readFile(file);
const fixture = JSON.parse(raw.toString());
const source = await SourceBundle.read(fromBytes(fixture.source));
const definition = await LoadedDefinition.load(source.root, source);
const action = definition.manifest.actions[0]!;
const program = definition.text(action.fold);
const hash = (value: Uint8Array) => createHash('sha256').update(value).digest('hex');
const captures = [];
for (const length of [0, 99, 999, 9999]) {
  const state = { candidates: Array.from({ length }, (_, i) => i + 1), selected: String(length) };
  const input = {
    meta: {
      app: fixture.genesis.app,
      position: length + 1,
      actorKey: fixture.entries[0].signedIntent.intent.actorKey,
      definition: source.root,
    },
    act: { id: String(length + 1), title: 'Benchmark', pricePence: length + 1 },
    state,
  };
  for (let sample = 0; sample < 3; sample++) {
    const times: Record<string, number> = {};
    async function measure<T>(name: string, run: () => T | Promise<T>): Promise<T> {
      const start = performance.now();
      const result = await run();
      times[name] = performance.now() - start;
      return result;
    }
    const serialized = await measure('canonicalJsonMs', () => canonicalJson(state));
    const copied = await measure('jsonCopyMs', () => jsonCopy(state));
    assert.deepEqual(copied, state);
    assert.deepEqual(await measure('structuredCloneMs', () => structuredClone(state)), state);
    const encoded = await measure('cborEncodeMs', () => encodeBlock(state));
    const cid = await measure('contentCidMs', () => contentCid(state));
    await measure('schemaValidationMs', () => definition.schemas.validate(definition.manifest.state.ref, state));
    const evaluated = await measure('evaluationMs', () => evaluate(program, input));
    const folded = await measure('foldMs', () => fold(program, input));
    assert.equal(folded.decision, 'effective');
    assert.deepEqual(evaluated.value, folded);
    if (folded.decision === 'effective') {
      assert.equal((folded.state as typeof state).candidates.length, length + 1);
      await measure('resultValidationMs', () =>
        definition.schemas.validate(definition.manifest.state.ref, folded.state),
      );
    }
    captures.push({
      length,
      sample,
      stateJsonBytes: Buffer.byteLength(serialized),
      stateCborBytes: encoded.length,
      stateCid: cid,
      evaluationSteps: evaluated.steps,
      inspectedBytes: evaluated.inspectedBytes,
      times,
    });
  }
}
const results = {
  metadata: {
    version: 1,
    exactHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    harnessSha256: hash(await readFile(new URL(import.meta.url))),
    runtime: process.version,
    fixtureFile: file,
    fixtureSha256: hash(raw),
    sourceCid: source.root,
    limitations: [
      'Independent ordered kernels, not exclusive attribution of whole replay',
      'Timing includes measurement and Promise overhead; three samples on one machine',
      'Fold includes input/output canonical guards and evaluation; evaluation includes AST admission and budget inspections',
    ],
  },
  captures,
};
await writeFile('experiments/generated/performance-stages/kernels.json', JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify(results));
