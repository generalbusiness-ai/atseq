/** One portable corpus for source Node, Chromium and compiled implementation conformance. */
import sourceVectors from '../../testdata/native-source/source-identity-vectors.json' with { type: 'json' };
import reachable from '../../testdata/native-source/reachable-schema-vectors.json' with { type: 'json' };
import carVector from '../../testdata/native-source/source-car-vector.json' with { type: 'json' };
import expected from '../../testdata/native-source/expected-identities.json' with { type: 'json' };
import retainedBlocks from '../../testdata/native-source/blocks.json' with { type: 'json' };
import { AtseqError, InterpretationError } from '../../src/core/errors.ts';
import { canonicalJson, type Json } from '../../src/core/values.ts';
import { create, fromDigest, fromString, toString, CODEC_RAW } from '@atcute/cid';
import { writeCarStream } from '@atcute/car';
import { sha256 } from '@noble/hashes/sha2';
import {
  assertNativeSourceContract,
  frameNativeSourceBytes,
  NATIVE_SOURCE_CONTRACT,
} from '../../src/definition/native-source-contract.ts';
import {
  nativeSchemaProjection,
  nativeProjectionBytes,
  nativeProjectionCid,
} from '../../src/definition/native-source-projection.ts';
import { readNativeSourceClosure, type NativeSourceReader } from '../../src/definition/native-source-transport.ts';
import {
  admitNativeSourceDefinition,
  assessNativeSource,
  readNativeSourceDefinition,
  readNativeSourceAction,
  nativeSourceAction,
  nativeSourceFile,
  nativeSourceActionFold,
  nativeSourceActionProjection,
  nativeSourceActionProjectionBlocks,
  type NativeSourceDefinition,
  type NativeSourceAction,
} from '../../src/definition/native-source.ts';
import { contentCid, encodeBlock, decodeBlock, sameBytes } from '../../src/protocol/wire.ts';
import { reconstructNativeBytes, type NativeContent, type ByteManifest } from '../../src/protocol/native-wire.ts';

function assert(value: unknown, detail = 'Corpus assertion failed'): asserts value {
  if (!value) throw new Error(detail);
}
function equal(actual: unknown, wanted: unknown): void {
  assert(canonicalJson(actual, 1024 * 1024) === canonicalJson(wanted, 1024 * 1024), 'Corpus values differ');
}
function raw(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}
interface Source {
  manifest: any;
  named: Map<string, Uint8Array>;
}
function baseline(): Source {
  const vector = sourceVectors[0]!;
  return {
    manifest: structuredClone(vector.manifest),
    named: new Map(vector.files.map((file) => [file.path, raw(file.base64)])),
  };
}
async function pack(source: Source) {
  source.manifest.files = await Promise.all(
    [...source.named].map(async ([path, raw]) => ({ path, cid: toString(await create(CODEC_RAW, raw)) })),
  );
  const root = await contentCid(source.manifest);
  const blocks = new Map<string, Uint8Array>([[root, encodeBlock(source.manifest)]]);
  for (const file of source.manifest.files) blocks.set(file.cid, source.named.get(file.path)!);
  const reader: NativeSourceReader = {
    async get(cid) {
      const bytes = blocks.get(cid);
      if (!bytes) throw new AtseqError('content_missing', 'Missing test block');
      return new Uint8Array(bytes);
    },
  };
  return { root, closure: [...blocks.keys()], blocks, reader };
}
async function rejects(run: () => unknown | Promise<unknown>, code: string): Promise<void> {
  try {
    await run();
  } catch (error) {
    assert(error instanceof AtseqError && error.code === code, `Expected ${code}, got ${String(error)}`);
    return;
  }
  throw new Error(`Expected ${code}`);
}
export async function nativeSourceCorpus(): Promise<string[]> {
  const passed: string[] = [];
  async function check(name: string, run: () => unknown | Promise<unknown>) {
    await run();
    passed.push(name);
  }
  await check('exact reviewed literal identities compile without registering a runnable profile', async () => {
    await assertNativeSourceContract();
    equal(NATIVE_SOURCE_CONTRACT, {
      native: expected.native,
      application: expected.application,
      evaluator: expected.evaluator,
    });
  });
  const contractClosure = new Set([
    ...expected.acyclicClosures.native,
    ...expected.acyclicClosures.application,
    expected.roles['action-example'],
    expected.roles['action-projection.chunk0'],
    expected.roles['action-projection.manifest'],
  ]);
  for (const block of retainedBlocks.filter((block) => contractClosure.has(block.cid))) {
    await check(`independent retained native/application block: ${block.cid}`, async () => {
      const encoded = encodeBlock(block.value);
      assert(sameBytes(encoded, raw(block.base64)));
      assert(encoded.length === block.bytes);
      assert((await contentCid(block.value)) === block.cid);
      const digest = [...sha256(encoded)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
      assert(digest === block.sha256);
    });
  }
  for (const vector of sourceVectors) {
    await check(`retained source identity: ${vector.name}`, async () => {
      const source = {
        manifest: structuredClone(vector.manifest),
        named: new Map(vector.files.map((file) => [file.path, raw(file.base64)])),
      };
      const packed = await pack(source);
      // Preserve the retained signed file-table order rather than pack helper insertion order.
      source.manifest.files = structuredClone(vector.manifest.files);
      const root = await contentCid(source.manifest);
      packed.blocks.delete(packed.root);
      packed.blocks.set(root, encodeBlock(source.manifest));
      const closure = [root, ...[...packed.blocks.keys()].filter((cid) => cid !== root)];
      assert(root === vector.definitionCid);
      const admitted = await admitNativeSourceDefinition(root, closure, packed.reader);
      const facts = readNativeSourceDefinition(admitted);
      assert(facts.stateProjectionCid === vector.stateProjectionRawCid);
      const action = nativeSourceAction(admitted, 'ai.generalbusiness.atseq.example#act');
      assert(action);
      const derived = readNativeSourceAction(action);
      assert(derived.execution === vector.executionCid);
      assert(derived.projectionCid === vector.actionProjectionRawCid);
      equal(derived.contract, vector.derivedContract);
      assert(nativeSourceAction(admitted, 'ai.generalbusiness.atseq.example#absent') === null);
      const blocks = nativeSourceActionProjectionBlocks(action);
      const byCid = new Map(blocks.map((block) => [block.cid, block.raw]));
      const manifest = decodeBlock(byCid.get(derived.projectionLocator)!) as unknown as NativeContent<ByteManifest>;
      const reconstructed = await reconstructNativeBytes(
        manifest,
        {
          async get(cid) {
            return byCid.get(cid)!;
          },
        },
        524288,
      );
      assert(sameBytes(reconstructed, nativeSourceActionProjection(action)));
      if (vector.name === 'baseline') {
        assert(facts.logicalCarBytes === carVector.carBytesIncludingFraming);
        assert(facts.decodedOccurrenceBytes === carVector.decodedNamedOccurrenceBytes);
      }
    });
  }
  await check('recursive and shared refs visit each identity once; literal ref-shaped strings survive', async () => {
    const document = reachable.recursiveDocument;
    const projected = nativeSchemaProjection([document as Json], document.id, `${document.id}#act`);
    equal(projected, reachable.expectedNormalizedProjection);
    assert(sameBytes(nativeProjectionBytes(projected), raw(reachable.canonicalProjectionBase64)));
    assert((await nativeProjectionCid(projected)) === reachable.rawCid);
  });
  await check('schema annotation stripping preserves literal description/const/default/enum data', () => {
    const doc = {
      lexicon: 1,
      id: 'ai.generalbusiness.atseq.literal',
      description: 'editorial',
      defs: {
        main: {
          type: 'object',
          description: 'editorial',
          properties: {
            description: {
              type: 'string',
              description: 'editorial',
              const: 'description',
              default: 'description',
              enum: ['description', '#literal'],
            },
          },
        },
      },
    };
    const projected: any = nativeSchemaProjection([doc], doc.id);
    const node = projected.definitions[`${doc.id}#main`];
    assert(!Object.hasOwn(node, 'description'));
    equal(node.properties.description, {
      type: 'string',
      const: 'description',
      default: 'description',
      enum: ['description', '#literal'],
    });
    assert(doc.defs.main.description === 'editorial');
  });
  await check('long reference chain is iterative and default refs normalize', () => {
    const defs: Record<string, any> = {};
    for (let i = 0; i < 3000; i++) defs[`n${i}`] = i === 2999 ? { type: 'string' } : { type: 'ref', ref: `#n${i + 1}` };
    const projection = nativeSchemaProjection(
      [{ lexicon: 1, id: 'ai.generalbusiness.atseq.chain', defs }],
      'ai.generalbusiness.atseq.chain#n0',
    );
    assert(Object.keys(projection.definitions).length === 3000);
  });
  await check('query output/error annotation stripping uses schema positions', () => {
    const doc = {
      lexicon: 1,
      id: 'ai.generalbusiness.atseq.queryprojection',
      defs: {
        main: { type: 'object', properties: { other: { type: 'ref', ref: '#query' } } },
        query: {
          type: 'query',
          description: 'editorial',
          parameters: { type: 'params', properties: { description: { type: 'string', const: 'literal' } } },
          output: {
            encoding: 'application/json',
            description: 'editorial',
            schema: { type: 'ref', description: 'editorial', ref: '#main' },
          },
          errors: [{ name: 'Oops', description: 'editorial' }],
        },
      },
    };
    const result: any = nativeSchemaProjection([doc], doc.id);
    const query = result.definitions[`${doc.id}#query`];
    assert(!Object.hasOwn(query, 'description'));
    assert(!Object.hasOwn(query.output, 'description'));
    assert(!Object.hasOwn(query.output.schema, 'description'));
    equal(query.errors, [{ name: 'Oops' }]);
    equal(query.parameters.properties.description, { type: 'string', const: 'literal' });
    assert(query.output.schema.ref === `${doc.id}#main`);
  });
  await check('projection framing uses exact full 32 KiB chunks followed by one short chunk', async () => {
    const input = new Uint8Array(65537).map((_, index) => index % 251);
    const framed = await frameNativeSourceBytes(input);
    const blocks = new Map(framed.blocks.map((block) => [block.cid, block.raw]));
    const result = await reconstructNativeBytes(
      framed.manifest,
      {
        async get(cid) {
          return blocks.get(cid)!;
        },
      },
      524288,
    );
    assert(sameBytes(result, input));
    assert(framed.blocks.length === 4);
  });
  await check('maintained incremental SHA-256 agrees with maintained one-shot CID over boundary sizes', async () => {
    for (const length of [0, 1, 55, 56, 63, 64, 65, 32767, 32768, 32769, 524289]) {
      const bytes = new Uint8Array(length).map((_, index) => index % 251);
      const oneShot = sha256(bytes);
      const state = sha256.create();
      for (let offset = 0; offset < bytes.length; offset += 37) state.update(bytes.subarray(offset, offset + 37));
      const incremental = state.digest();
      assert(sameBytes(oneShot, incremental));
      assert(toString(await create(CODEC_RAW, bytes)) === toString(fromDigest(CODEC_RAW, incremental)));
    }
  });
  await check('private source/action capabilities reject forged, copied and cross-type objects', async () => {
    const packed = await pack(baseline());
    const definition = await admitNativeSourceDefinition(packed.root, packed.closure, packed.reader);
    const action = nativeSourceAction(definition, 'ai.generalbusiness.atseq.example#act')!;
    for (const fake of [{}, { ...definition }, structuredClone(definition), action]) {
      let refused = false;
      try {
        readNativeSourceDefinition(fake as NativeSourceDefinition);
      } catch (error) {
        refused = error instanceof TypeError;
      }
      assert(refused);
    }
    for (const fake of [{}, { ...action }, structuredClone(action), definition]) {
      let refused = false;
      try {
        readNativeSourceAction(fake as NativeSourceAction);
      } catch (error) {
        refused = error instanceof TypeError;
      }
      assert(refused);
    }
    const file = nativeSourceFile(definition, 'fold.jsonata');
    file.fill(0);
    assert(nativeSourceActionFold(action).includes('decision'));
    const projection = nativeSourceActionProjection(action);
    projection.fill(0);
    assert(nativeSourceActionProjection(action)[0] === 123);
    const blocks = nativeSourceActionProjectionBlocks(action);
    blocks[0]!.raw.fill(0);
    assert(nativeSourceActionProjectionBlocks(action)[0]!.raw[0] !== 0);
    assert(Object.isFrozen(readNativeSourceAction(action).projection.definitions));
  });
  for (const [label, text] of [
    ['duplicate decoded key', '{"count":0,"\\u0063ount":0,"description":"demo"}'],
    ['trailing comma', '{"count":0,"description":"demo",}'],
    ['comment', '{"count":0,/*x*/"description":"demo"}'],
    ['trailing text', '{"count":0,"description":"demo"}null'],
    ['BOM', '\ufeff{"count":0,"description":"demo"}'],
  ]) {
    await check(`strict used JSON rejects ${label}`, async () => {
      const source = baseline();
      source.named.set('initial.json', new TextEncoder().encode(text));
      const packed = await pack(source);
      await rejects(() => admitNativeSourceDefinition(packed.root, packed.closure, packed.reader), 'source_json');
    });
  }
  for (const [label, text, code] of [
    ['unsafe number', '{"count":9007199254740992,"description":"demo"}', 'wire_number'],
    ['negative zero', '{"count":-0,"description":"demo"}', 'wire_number'],
    ['reserved key', '{"__proto__":{},"count":0,"description":"demo"}', 'reserved_key'],
    ['unpaired surrogate', '{"count":0,"description":"\\ud800"}', 'unicode'],
  ]) {
    await check(`owned used JSON rejects ${label}`, async () => {
      const source = baseline();
      source.named.set('initial.json', new TextEncoder().encode(text));
      const packed = await pack(source);
      await rejects(() => admitNativeSourceDefinition(packed.root, packed.closure, packed.reader), code!);
    });
  }
  await check('unused arbitrary-byte assets remain admitted and owned', async () => {
    const source = baseline();
    source.named.set('asset.bin', new Uint8Array([255, 0, 254]));
    const packed = await pack(source);
    const definition = await admitNativeSourceDefinition(packed.root, packed.closure, packed.reader);
    assert(nativeSourceFile(definition, 'asset.bin')[0] === 255);
  });
  await check('unsupported program in any action prevents complete admission', async () => {
    const source = baseline();
    source.manifest.actions.push({
      ...source.manifest.actions[0],
      ref: 'ai.generalbusiness.atseq.example#other',
      fold: 'bad.jsonata',
    });
    const doc = JSON.parse(new TextDecoder().decode(source.named.get('schemas.json')));
    doc.defs.other = doc.defs.act;
    source.named.set('schemas.json', new TextEncoder().encode(JSON.stringify(doc)));
    source.named.set('bad.jsonata', new TextEncoder().encode('$random()'));
    const packed = await pack(source);
    await rejects(
      () => admitNativeSourceDefinition(packed.root, packed.closure, packed.reader),
      'unsupported_function',
    );
  });
  for (const [name, mutate, code] of [
    ['duplicate lexicon path', (source: Source) => source.manifest.lexicons.push('schemas.json'), 'invalid_activation'],
    [
      'duplicate action ref',
      (source: Source) => source.manifest.actions.push(source.manifest.actions[0]),
      'invalid_activation',
    ],
    [
      'undeclared initial source',
      (source: Source) => {
        source.manifest.state.initial = 'missing.json';
      },
      'invalid_activation',
    ],
    [
      'undeclared fold source',
      (source: Source) => {
        source.manifest.actions[0].fold = 'missing.jsonata';
      },
      'invalid_activation',
    ],
    [
      'unsafe local path',
      (source: Source) => {
        source.named.set('../asset.bin', new Uint8Array([1]));
      },
      'invalid_activation',
    ],
    [
      'schema-invalid initial state',
      (source: Source) => {
        source.named.set('initial.json', new TextEncoder().encode('{"count":"wrong","description":"demo"}'));
      },
      'schema_value',
    ],
    [
      'malformed used view',
      (source: Source) => {
        source.named.set('view.json', new TextEncoder().encode('{}'));
        source.manifest.views.push({ name: 'bad', source: 'view.json' });
      },
      'view_source',
    ],
    [
      'view query binding must exist',
      (source: Source) => {
        source.named.set('view.json', new TextEncoder().encode('{}'));
        source.manifest.views.push({ name: 'bad', source: 'view.json', query: 'missing' });
      },
      'invalid_activation',
    ],
    [
      'invalid UTF-8 JSON',
      (source: Source) => {
        source.named.set('initial.json', new Uint8Array([255]));
      },
      'source_json',
    ],
    [
      'invalid UTF-8 program',
      (source: Source) => {
        source.named.set('fold.jsonata', new Uint8Array([255]));
      },
      'source_utf8',
    ],
    [
      'JSON container depth above 32',
      (source: Source) => {
        source.named.set('initial.json', new TextEncoder().encode('['.repeat(33) + '0' + ']'.repeat(33)));
      },
      'source_json',
    ],
  ] as const) {
    await check(`complete admission rejects ${name}`, async () => {
      const source = baseline();
      mutate(source);
      const packed = await pack(source);
      await rejects(() => admitNativeSourceDefinition(packed.root, packed.closure, packed.reader), code);
    });
  }
  for (const [name, mutate, code] of [
    [
      'unresolved ref',
      (doc: any) => {
        doc.defs.act.properties.missing = { type: 'ref', ref: '#missing' };
      },
      'invalid_schema',
    ],
    [
      'unsupported open union',
      (doc: any) => {
        doc.defs.act.properties.other = { type: 'union', refs: ['#state'], closed: false };
      },
      'unsupported_schema',
    ],
    [
      'unsupported default constraint',
      (doc: any) => {
        doc.defs.state.properties.count.default = 0;
      },
      'unsupported_schema',
    ],
  ] as const) {
    await check(`maintained admitted schema subset rejects ${name}`, async () => {
      const source = baseline();
      const doc = JSON.parse(new TextDecoder().decode(source.named.get('schemas.json')));
      mutate(doc);
      source.named.set('schemas.json', new TextEncoder().encode(JSON.stringify(doc)));
      const packed = await pack(source);
      await rejects(() => admitNativeSourceDefinition(packed.root, packed.closure, packed.reader), code);
    });
  }
  await check('duplicate authored document identity is not hidden by alias file paths', async () => {
    const source = baseline();
    source.named.set('alias.json', source.named.get('schemas.json')!);
    source.manifest.lexicons.push('alias.json');
    const packed = await pack(source);
    await rejects(() => admitNativeSourceDefinition(packed.root, packed.closure, packed.reader), 'invalid_schema');
  });
  await check('query program is statically checked even when no action uses it', async () => {
    const source = baseline();
    const doc = JSON.parse(new TextDecoder().decode(source.named.get('schemas.json')));
    doc.defs.query = {
      type: 'query',
      output: { encoding: 'application/json', schema: { type: 'ref', ref: '#state' } },
    };
    source.named.set('schemas.json', new TextEncoder().encode(JSON.stringify(doc)));
    source.named.set('query.jsonata', new TextEncoder().encode('$random()'));
    source.manifest.queries.push({ name: 'bad', ref: `${doc.id}#query`, program: 'query.jsonata' });
    const packed = await pack(source);
    await rejects(
      () => admitNativeSourceDefinition(packed.root, packed.closure, packed.reader),
      'unsupported_function',
    );
  });
  await check('63 named files are allowed; 64 are a decisive authenticated root count violation', async () => {
    const source = baseline();
    for (let index = source.named.size; index < 63; index++) source.named.set(`asset${index}.bin`, new Uint8Array([7]));
    let packed = await pack(source);
    const definition = await admitNativeSourceDefinition(packed.root, packed.closure, packed.reader);
    assert(readNativeSourceDefinition(definition).manifest.files.length === 63);
    source.named.set('excess.bin', new Uint8Array([8]));
    packed = await pack(source);
    await rejects(() => admitNativeSourceDefinition(packed.root, packed.closure, packed.reader), 'invalid_activation');
  });
  await check('semantic mismatch precedes unsupported target program', async () => {
    const source = baseline();
    source.manifest.profile.$link = NATIVE_SOURCE_CONTRACT.evaluator;
    source.named.set('fold.jsonata', new TextEncoder().encode('$random()'));
    const packed = await pack(source);
    await rejects(
      () => admitNativeSourceDefinition(packed.root, packed.closure, packed.reader),
      'incompatible_definition',
    );
  });
  await check('missing/corrupt source precedes compatibility or source interpretation', async () => {
    const source = baseline();
    source.manifest.profile.$link = NATIVE_SOURCE_CONTRACT.evaluator;
    const packed = await pack(source);
    const file = source.manifest.files[0].cid;
    packed.blocks.set(file, new Uint8Array([1]));
    await rejects(() => admitNativeSourceDefinition(packed.root, packed.closure, packed.reader), 'content_corrupt');
    packed.blocks.delete(file);
    await rejects(() => admitNativeSourceDefinition(packed.root, packed.closure, packed.reader), 'content_missing');
  });
  await check('complete closed set cannot be repaired from a global reader pool', async () => {
    const packed = await pack(baseline());
    await rejects(
      () => admitNativeSourceDefinition(packed.root, packed.closure.slice(0, -1), packed.reader),
      'invalid_activation',
    );
  });
  await check('extra listed blocks are verified before closed-set invalidity', async () => {
    const packed = await pack(baseline());
    const extra = new Uint8Array([7]);
    const cid = toString(await create(CODEC_RAW, extra));
    packed.blocks.set(cid, extra);
    await rejects(
      () => admitNativeSourceDefinition(packed.root, [...packed.closure, cid], packed.reader),
      'invalid_activation',
    );
    packed.blocks.set(cid, new Uint8Array([8]));
    await rejects(
      () => admitNativeSourceDefinition(packed.root, [...packed.closure, cid], packed.reader),
      'content_corrupt',
    );
  });
  await check('complete legal source with smaller local retention stalls', async () => {
    const packed = await pack(baseline());
    await rejects(
      () => admitNativeSourceDefinition(packed.root, packed.closure, packed.reader, { maximumRetainedBytes: 1 }),
      'content_unavailable',
    );
  });
  await check('actual typed-array bytes override spoofed length and subarray hints', async () => {
    const packed = await pack(baseline());
    const reader: NativeSourceReader = {
      async get(cid) {
        const chunk = new Uint8Array(packed.blocks.get(cid)!);
        Object.defineProperty(chunk, 'length', { value: 0 });
        Object.defineProperty(chunk, 'subarray', {
          value() {
            throw new Error('Caller subarray must not run');
          },
        });
        return chunk;
      },
    };
    const definition = await admitNativeSourceDefinition(packed.root, packed.closure, reader);
    assert(readNativeSourceDefinition(definition).cid === packed.root);
    await rejects(
      () => admitNativeSourceDefinition(packed.root, packed.closure, reader, { maximumReadBytes: 1 }),
      'content_unavailable',
    );
  });
  await check('empty chunk streams cannot accumulate retained objects or bypass operational read bounds', async () => {
    const packed = await pack(baseline());
    const reader: NativeSourceReader = {
      async get(cid) {
        if (cid === packed.root) return packed.blocks.get(cid)!;
        return (async function* () {
          for (let index = 0; index < 2001; index++) yield new Uint8Array();
          yield packed.blocks.get(cid)!;
        })();
      },
    };
    await rejects(
      () => admitNativeSourceDefinition(packed.root, packed.closure, reader, { maximumReadBytes: 2000 }),
      'content_unavailable',
    );
  });
  await check('fully hash-verified oversized streaming body proves invalidity with smaller retention', async () => {
    const source = baseline();
    source.named.set('large.bin', new Uint8Array(524289));
    const packed = await pack(source);
    let delivered = 0;
    const reader: NativeSourceReader = {
      async get(cid) {
        const bytes = packed.blocks.get(cid)!;
        return (async function* () {
          for (let offset = 0; offset < bytes.length; offset += 4096) {
            const chunk = bytes.subarray(offset, offset + 4096);
            delivered += chunk.length;
            yield chunk;
          }
        })();
      },
    };
    await rejects(
      () => admitNativeSourceDefinition(packed.root, packed.closure, reader, { maximumRetainedBytes: 1024 }),
      'invalid_activation',
    );
    assert(delivered > 524289);
    await rejects(
      () => admitNativeSourceDefinition(packed.root, packed.closure, reader, { maximumReadBytes: 10000 }),
      'content_unavailable',
    );
  });
  await check('oversized verified early block cannot mask later corrupt bytes', async () => {
    const source = baseline();
    source.named.set('large.bin', new Uint8Array(524289));
    const packed = await pack(source);
    const large = source.manifest.files.find((file: any) => file.path === 'large.bin').cid;
    const corrupt = source.manifest.files[0].cid;
    packed.blocks.set(corrupt, new Uint8Array([1]));
    const order = [packed.root, large, ...packed.closure.filter((cid) => cid !== packed.root && cid !== large)];
    await rejects(
      () => admitNativeSourceDefinition(packed.root, order, packed.reader, { maximumRetainedBytes: 1024 }),
      'content_corrupt',
    );
  });
  await check('decoded named aliases count separately despite block deduplication', async () => {
    const source = baseline();
    const shared = new Uint8Array(270000);
    source.named.set('one.bin', shared);
    source.named.set('two.bin', shared);
    const packed = await pack(source);
    assert(packed.closure.length < source.manifest.files.length + 1);
    await rejects(() => admitNativeSourceDefinition(packed.root, packed.closure, packed.reader), 'invalid_activation');
  });
  await check('canonical CAR framing can exceed the bound while decoded occurrences fit', async () => {
    const source = baseline();
    source.named.set('edge.bin', new Uint8Array(500000));
    await pack(source);
    const other = [...source.named]
      .filter(([path]) => path !== 'edge.bin')
      .reduce((sum, [, raw]) => sum + raw.length, 0);
    source.named.set('edge.bin', new Uint8Array(524287 - encodeBlock(source.manifest).length - other));
    const packed = await pack(source);
    assert(
      encodeBlock(source.manifest).length + [...source.named.values()].reduce((sum, raw) => sum + raw.length, 0) ===
        524287,
    );
    await rejects(() => admitNativeSourceDefinition(packed.root, packed.closure, packed.reader), 'invalid_activation');
  });
  await check('actual logical CAR size agrees with maintained serialization', async () => {
    const packed = await pack(baseline());
    const facts = await readNativeSourceClosure(packed.root, packed.closure, packed.reader);
    let actual = 0;
    for await (const chunk of writeCarStream(
      [{ $link: packed.root }],
      [...packed.blocks].map(([cid, raw]) => ({ cid: createCidBytes(cid), data: raw })),
    ))
      actual += chunk.length;
    assert(actual === facts.logicalCarBytes);
  });
  await check('foreign/runtime reader faults propagate without a source capability or invalidity verdict', async () => {
    const packed = await pack(baseline());
    const failure = new Error('invalid_source');
    let caught: unknown;
    try {
      await admitNativeSourceDefinition(packed.root, packed.closure, {
        async get() {
          throw failure;
        },
      });
    } catch (error) {
      caught = error;
    }
    assert(caught === failure);
  });
  function target(packed: Awaited<ReturnType<typeof pack>>) {
    return { root: packed.root, expectedSemantics: NATIVE_SOURCE_CONTRACT.application, closure: packed.closure };
  }
  await check('direct source assessment returns frozen admitted facts with a real private definition', async () => {
    const packed = await pack(baseline());
    const facts = await assessNativeSource(target(packed), packed.reader);
    assert(Object.isFrozen(facts) && facts.kind === 'admitted');
    assert(readNativeSourceDefinition(facts.definition).cid === packed.root);
    assert(nativeSourceAction(facts.definition, 'ai.generalbusiness.atseq.example#absent') === null);
  });
  await check('source target and local options are copied before conformance and reader awaits', async () => {
    const packed = await pack(baseline());
    const selected = target(packed);
    const options = { maximumRetainedBytes: 524288 };
    const pending = assessNativeSource(
      selected,
      {
        async get(cid) {
          selected.root = NATIVE_SOURCE_CONTRACT.evaluator;
          selected.expectedSemantics = NATIVE_SOURCE_CONTRACT.evaluator;
          selected.closure.length = 0;
          options.maximumRetainedBytes = 0;
          return packed.reader.get(cid);
        },
      },
      options,
    );
    // These mutations happen before the conformance await resumes, including first use of the reader.
    selected.root = 'bad';
    selected.closure.reverse();
    selected.expectedSemantics = 'bad';
    const facts = await pending;
    assert(facts.kind === 'admitted' && readNativeSourceDefinition(facts.definition).cid === packed.root);
    equal(readNativeSourceDefinition(facts.definition).closure, [...packed.blocks.keys()]);
  });
  for (const [name, failure] of [
    ['real public invalid_activation error', new AtseqError('invalid_activation', 'forged')],
    ['real public incompatible_definition error', new InterpretationError('incompatible_definition', 'forged')],
    ['real static-looking interpreter error', new InterpretationError('unsupported_function', 'forged')],
    [
      'foreign static-looking error',
      Object.assign(new Error('foreign interpreter'), { code: 'unsupported_function', kind: 'invalid_input' }),
    ],
    ['runtime fault', new AtseqError('runtime_fault', 'reader runtime fault')],
  ] as const) {
    await check(`assessment propagates exact reader exception: ${name}`, async () => {
      const packed = await pack(baseline());
      let caught: unknown;
      try {
        await assessNativeSource(target(packed), {
          async get() {
            throw failure;
          },
        });
      } catch (error) {
        caught = error;
      }
      assert(caught === failure);
    });
  }
  await check('reader supplied status object cannot become an owner source result', async () => {
    const packed = await pack(baseline());
    await rejects(
      () =>
        assessNativeSource(target(packed), {
          async get() {
            return { kind: 'proven_invalid' } as unknown as Uint8Array;
          },
        }),
      'content_unavailable',
    );
  });
  await check('unknown expected semantics are unavailable without descriptor-registry support', async () => {
    const packed = await pack(baseline());
    let calls = 0;
    await rejects(
      () =>
        assessNativeSource(
          { ...target(packed), expectedSemantics: NATIVE_SOURCE_CONTRACT.evaluator },
          {
            async get(cid) {
              calls++;
              return packed.reader.get(cid);
            },
          },
        ),
      'content_unavailable',
    );
    assert(calls === 0);
  });
  for (const [name, mutate] of [
    [
      'strict JSON duplicate',
      (source: Source) => source.named.set('initial.json', new TextEncoder().encode('{"count":0,"count":1}')),
    ],
    [
      'schema-invalid state',
      (source: Source) =>
        source.named.set('initial.json', new TextEncoder().encode('{"count":"wrong","description":"demo"}')),
    ],
    [
      'unsupported bound program',
      (source: Source) => source.named.set('fold.jsonata', new TextEncoder().encode('$random()')),
    ],
    [
      'invalid used view',
      (source: Source) => {
        source.named.set('view.json', new TextEncoder().encode('{}'));
        source.manifest.views.push({ name: 'bad', source: 'view.json' });
      },
    ],
    [
      'undeclared fold path',
      (source: Source) => {
        source.manifest.actions[0].fold = 'absent.jsonata';
      },
    ],
    ['full hash-verified oversized closure', (source: Source) => source.named.set('large.bin', new Uint8Array(524289))],
  ] as const) {
    await check(`checked source stage returns proven invalid: ${name}`, async () => {
      const source = baseline();
      mutate(source);
      const packed = await pack(source);
      const facts = await assessNativeSource(target(packed), packed.reader, {
        maximumRetainedBytes: name.includes('oversized') ? 1024 : 524288,
      });
      equal(facts, { kind: 'proven_invalid' });
      assert(Object.isFrozen(facts));
    });
  }
  await check('direct incompatible source result precedes unsupported target programs', async () => {
    const source = baseline();
    source.manifest.profile.$link = NATIVE_SOURCE_CONTRACT.evaluator;
    source.named.set('fold.jsonata', new TextEncoder().encode('$random()'));
    const packed = await pack(source);
    const facts = await assessNativeSource(target(packed), packed.reader);
    equal(facts, { kind: 'incompatible', actualSemantics: NATIVE_SOURCE_CONTRACT.evaluator });
    assert(Object.isFrozen(facts));
  });
  await check(
    'exact selected closed set proves omission and complete verified extras; corrupt extras escape',
    async () => {
      const packed = await pack(baseline());
      equal(await assessNativeSource({ ...target(packed), closure: packed.closure.slice(0, -1) }, packed.reader), {
        kind: 'proven_invalid',
      });
      const extra = new Uint8Array([7]);
      const cid = toString(await create(CODEC_RAW, extra));
      packed.blocks.set(cid, extra);
      const selected = { ...target(packed), closure: [...packed.closure, cid] };
      equal(await assessNativeSource(selected, packed.reader), { kind: 'proven_invalid' });
      packed.blocks.set(cid, new Uint8Array([8]));
      await rejects(() => assessNativeSource(selected, packed.reader), 'content_corrupt');
    },
  );
  await check('direct source assessment never classifies local retention, read or chunk exhaustion', async () => {
    const packed = await pack(baseline());
    await rejects(
      () => assessNativeSource(target(packed), packed.reader, { maximumRetainedBytes: 1 }),
      'content_unavailable',
    );
    await rejects(
      () => assessNativeSource(target(packed), packed.reader, { maximumReadBytes: 1 }),
      'content_unavailable',
    );
    await rejects(
      () =>
        assessNativeSource(
          target(packed),
          {
            async get(cid) {
              return (async function* () {
                for (let i = 0; i < 2001; i++) yield new Uint8Array();
                yield packed.blocks.get(cid)!;
              })();
            },
          },
          { maximumReadBytes: 2000 },
        ),
      'content_unavailable',
    );
  });
  await check('oversized earlier verified bytes never hide a later corrupt or missing selected block', async () => {
    const source = baseline();
    source.named.set('large.bin', new Uint8Array(524289));
    const packed = await pack(source);
    const large = source.manifest.files.find((file: any) => file.path === 'large.bin').cid;
    const other = source.manifest.files[0].cid;
    const selected = {
      ...target(packed),
      closure: [packed.root, large, ...packed.closure.filter((cid) => cid !== packed.root && cid !== large)],
    };
    packed.blocks.set(other, new Uint8Array([1]));
    await rejects(() => assessNativeSource(selected, packed.reader, { maximumRetainedBytes: 1024 }), 'content_corrupt');
    packed.blocks.delete(other);
    await rejects(() => assessNativeSource(selected, packed.reader, { maximumRetainedBytes: 1024 }), 'content_missing');
  });
  return passed;
}
function createCidBytes(cid: string) {
  return fromString(cid).bytes;
}
