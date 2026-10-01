import { Lexicons } from '@atproto/lexicon';
import { fromBytes } from '@atcute/cbor';
import { canonicalJson, jsonCopy, type Json } from '../../src/core/values.ts';
import { PROFILE } from '../../src/core/profile.ts';
import { SourceBundle } from '../../src/definition/source.ts';
import { LoadedDefinition } from '../../src/definition/load.ts';
import { evaluate, fold } from '../../src/runtime/evaluator.ts';
import { contentCid, encodeBlock } from '../../src/protocol/wire.ts';
import { equal, byteLength, type CapFixture } from './fixtures.ts';

export interface Operation {
  name: string;
  run(): unknown | Promise<unknown>;
}
export async function admitFixture(fixture: CapFixture) {
  const bundle = await SourceBundle.read(fromBytes(fixture.source));
  equal(bundle.root, fixture.sourceCid);
  const definition = await LoadedDefinition.load(bundle.root, bundle);
  const stateRef = definition.manifest.state.ref;
  canonicalJson(fixture.state, PROFILE.stateBytes);
  canonicalJson(fixture.predecessor, PROFILE.stateBytes);
  definition.schemas.validate(stateRef, fixture.state);
  definition.schemas.validate(stateRef, fixture.predecessor);
  const grow = definition.manifest.actions.find((x) => x.ref === fixture.growingAction.ref)!;
  const bounded = definition.manifest.actions.find((x) => x.ref === fixture.boundedAction.ref)!;
  const query = definition.manifest.queries.find((x) => x.name === 'summary')!;
  if (!grow || !bounded || !query) throw new Error('Missing fixture bindings');
  const meta = { app: 'did:plc:aaaaaaaaaaaaaaaaaaaaaaaa', position: 1, actorKey: '', definition: definition.cid };
  const growInput = { meta, act: fixture.growingAction.payload, state: fixture.predecessor };
  const boundedInput = { meta, act: fixture.boundedAction.payload, state: fixture.state };
  const operations: Operation[] = [
    { name: 'canonicalState', run: () => canonicalJson(fixture.state, PROFILE.stateBytes) },
    { name: 'jsonCopyState', run: () => jsonCopy(fixture.state, PROFILE.stateBytes) },
    { name: 'structuredCloneState', run: () => structuredClone(fixture.state) },
    { name: 'cborEncodeState', run: () => encodeBlock(fixture.state) },
    { name: 'stateCid', run: () => contentCid(fixture.state) },
    { name: 'stateSchema', run: () => definition.schemas.validate(stateRef, fixture.state) },
    { name: 'actionSchema', run: () => definition.schemas.validate(grow.ref, growInput.act) },
    { name: 'evaluateGrowing', run: () => evaluate(definition.text(grow.fold), growInput) },
    { name: 'foldGrowing', run: () => fold(definition.text(grow.fold), growInput) },
    { name: 'foldBounded', run: () => fold(definition.text(bounded.fold), boundedInput) },
    {
      name: 'admitSuccessor',
      async run() {
        definition.schemas.validate(grow.ref, growInput.act);
        const result = await fold(definition.text(grow.fold), growInput);
        if (result.decision === 'effective') definition.schemas.validate(stateRef, result.state);
        return result;
      },
    },
    {
      name: 'queryEvaluate',
      run: () => evaluate(definition.text(query.program), { state: fixture.state, params: {} }),
    },
    {
      name: 'queryCaptureAndValidate',
      async run() {
        // Mirrors the owned state part of Folder.query, without a Folder/history.
        const state = structuredClone(fixture.state);
        definition.schemas.queryParams(query.ref, {});
        const result = await evaluate(definition.text(query.program), { state, params: {} });
        definition.schemas.queryResult(query.ref, result.value);
        return result;
      },
    },
  ];
  return { definition, operations, stateRef, meta };
}

export function shapeCounts(value: unknown) {
  const result = {
    objects: 0,
    arrays: 0,
    objectKeys: 0,
    arrayElements: 0,
    strings: 0,
    scalarValues: 0,
    maximumObjectWidth: 0,
    maximumArrayLength: 0,
  };
  function walk(v: unknown) {
    if (Array.isArray(v)) {
      result.arrays++;
      result.arrayElements += v.length;
      result.maximumArrayLength = Math.max(result.maximumArrayLength, v.length);
      v.forEach(walk);
    } else if (v !== null && typeof v === 'object') {
      const keys = Object.keys(v);
      result.objects++;
      result.objectKeys += keys.length;
      result.maximumObjectWidth = Math.max(result.maximumObjectWidth, keys.length);
      Object.values(v).forEach(walk);
    } else {
      result.scalarValues++;
      if (typeof v === 'string') result.strings++;
    }
  }
  walk(value);
  return result;
}

// Structural runs delegate to the real methods, restore every hook, and never
// collect elapsed time. The extra observations are not present in timing runs.
export async function observeStructure(operation: Operation) {
  const result = {
    encoderCalls: 0,
    encodedBytes: 0,
    lexiconValidateCalls: 0,
    lexiconQueryParamsCalls: 0,
    lexiconQueryResultCalls: 0,
    structuredCloneCalls: 0,
    cloneArgumentJsonBytes: 0,
  };
  const originalEncode = TextEncoder.prototype.encode;
  const originalClone = globalThis.structuredClone;
  const encoder = new TextEncoder();
  TextEncoder.prototype.encode = function (input) {
    const bytes = Reflect.apply(originalEncode, this, [input]);
    result.encoderCalls++;
    result.encodedBytes += bytes.length;
    return bytes;
  };
  globalThis.structuredClone = function (value, options) {
    result.structuredCloneCalls++;
    result.cloneArgumentJsonBytes += Reflect.apply(originalEncode, encoder, [JSON.stringify(value)]).length;
    return originalClone(value, options);
  };
  const methods = ['validate', 'assertValidXrpcParams', 'assertValidXrpcOutput'] as const;
  const counters = ['lexiconValidateCalls', 'lexiconQueryParamsCalls', 'lexiconQueryResultCalls'] as const;
  const restores = methods.map((name, index) => {
    const original = Lexicons.prototype[name];
    (Lexicons.prototype as any)[name] = function (...args: unknown[]) {
      result[counters[index]!]++;
      return Reflect.apply(original, this, args);
    };
    return () => {
      (Lexicons.prototype as any)[name] = original;
    };
  });
  try {
    return { value: await operation.run(), counts: result };
  } finally {
    for (const restore of restores.reverse()) restore();
    TextEncoder.prototype.encode = originalEncode;
    globalThis.structuredClone = originalClone;
  }
}

async function rejects(run: () => unknown, expected: string) {
  try {
    await run();
  } catch (error) {
    equal((error as { code: string }).code, expected);
    return expected;
  }
  throw new Error('Expected rejection: ' + expected);
}
export async function characterize(fixture: CapFixture) {
  const { definition, operations, stateRef, meta } = await admitFixture(fixture);
  const expectedStateText = canonicalJson(fixture.state, PROFILE.stateBytes);
  const stateCid = await contentCid(fixture.state);
  const captures = [];
  for (const operation of operations) {
    const { value, counts } = await observeStructure(operation);
    if (operation.name === 'canonicalState') equal(value, expectedStateText);
    if (operation.name === 'jsonCopyState' || operation.name === 'structuredCloneState') equal(value, fixture.state);
    if (['foldGrowing', 'admitSuccessor'].includes(operation.name)) equal(value, fixture.growingAction.expected);
    if (operation.name === 'foldBounded') equal(value, fixture.boundedAction.expected);
    if (operation.name === 'evaluateGrowing') equal((value as any).value, fixture.growingAction.expected);
    if (operation.name.startsWith('query')) equal((value as any).value, fixture.expectedQuery);
    if (operation.name === 'stateCid') equal(value, stateCid);
    if (operation.name === 'cborEncodeState') equal([...(value as Uint8Array)], [...encodeBlock(fixture.state)]);
    captures.push({
      name: operation.name,
      counts,
      ...(value && typeof value === 'object' && 'steps' in value
        ? { evaluationSteps: (value as any).steps, inspectedBytes: (value as any).inspectedBytes }
        : {}),
      ...(operation.name.startsWith('fold') || operation.name === 'admitSuccessor'
        ? { result: (value as any).decision, outputCid: await contentCid(value) }
        : {}),
    });
  }
  let tokenCharges = 0,
    chargedBytes = 0;
  equal(
    canonicalJson(fixture.state, PROFILE.stateBytes, PROFILE.inputDepth, (bytes) => {
      tokenCharges++;
      chargedBytes += bytes;
    }),
    expectedStateText,
  );
  equal(chargedBytes, fixture.canonicalBytes);
  const controls: Record<string, string> = {};
  if (fixture.size === 'at-cap') {
    const oversized: any = structuredClone(fixture.state);
    if (fixture.preparation === 'generic experimental definition') oversized.padding += 'x';
    else {
      const key = { taskboard: 'tasks', guitar: 'candidates', ledger: 'entries' }[fixture.family as 'taskboard'];
      const field = fixture.family === 'ledger' ? 'description' : 'title';
      oversized[key].at(-1)[field] += 'x';
    }
    equal(byteLength(oversized), PROFILE.stateBytes + 1);
    controls.overcapState = await rejects(() => canonicalJson(oversized, PROFILE.stateBytes), 'value_bytes');
    const binding = definition.manifest.actions.find((x) => x.ref === fixture.boundedAction.ref)!;
    controls.overcapFoldInput = await rejects(
      () => fold(definition.text(binding.fold), { meta, state: oversized, act: fixture.boundedAction.payload }),
      'value_bytes',
    );
    // A hash-valid source containing that initial state must also be refused.
    const files = Object.fromEntries(definition.manifest.files.map((f) => [f.path, definition.bytes(f.path)]));
    files[definition.manifest.state.initial] = new TextEncoder().encode(canonicalJson(oversized));
    const { files: _files, ...manifest } = definition.manifest;
    const wrong = await SourceBundle.pack(manifest, files);
    controls.overcapInitialSource = await rejects(() => LoadedDefinition.load(wrong.root, wrong), 'value_bytes');
  }
  if (fixture.preparation === 'unchanged sample definition' && fixture.size === 'small') {
    const key = { taskboard: 'tasks', guitar: 'candidates', ledger: 'entries' }[fixture.family as 'taskboard'];
    const base: any = structuredClone(fixture.state);
    base[key] = Array.from({ length: 1001 }, (_, i) => ({ ...base[key][0], id: 'limit-' + i }));
    canonicalJson(base, PROFILE.stateBytes);
    controls.sampleRows = await rejects(() => definition.schemas.validate(stateRef, base), 'schema_value');
    const badText: any = structuredClone(fixture.state);
    badText[key][0][fixture.family === 'ledger' ? 'description' : 'title'] = 'x'.repeat(121);
    controls.sampleText = await rejects(() => definition.schemas.validate(stateRef, badText), 'schema_value');
  }
  return {
    name: fixture.name,
    family: fixture.family,
    size: fixture.size,
    preparation: fixture.preparation,
    sourceCid: fixture.sourceCid,
    rowCount: fixture.rowCount,
    stateJsonBytes: fixture.canonicalBytes,
    predecessorJsonBytes: byteLength(fixture.predecessor),
    stateCborBytes: encodeBlock(fixture.state).length,
    stateCid,
    shape: shapeCounts(fixture.state),
    canonicalTokenCharges: tokenCharges,
    canonicalChargedBytes: chargedBytes,
    expectedQuery: fixture.expectedQuery,
    queryCid: await contentCid(fixture.expectedQuery),
    operations: captures,
    controls,
  };
}
