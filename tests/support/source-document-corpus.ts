import taskboard from '../../testdata/source-documents/taskboard.atseq.json' with { type: 'json' };
import guitar from '../../testdata/source-documents/guitar.atseq.json' with { type: 'json' };
import ledger from '../../testdata/source-documents/ledger.atseq.json' with { type: 'json' };
import oldProfiles from '../vectors/profiles-v1.json' with { type: 'json' };
import {
  sourceDocumentToBundle,
  sourceDocumentFromBundle,
  serializeSourceDocument,
  type SourceDocument,
} from '../../src/definition/document.ts';
import { LoadedDefinition } from '../../src/definition/load.ts';
import { describeDefinition, validateDefinitionInfo, previewSource } from '../../src/application/definition.ts';
import { evaluate } from '../../src/runtime/evaluator.ts';
import { canonicalJson, type Json } from '../../src/core/values.ts';
import { bytes, contentCid } from '../../src/protocol/wire.ts';
import type { FixtureResult } from './corpus.ts';

export const viewlessExamples: {
  name: string;
  document: unknown;
  action: string;
  payload: Record<string, Json>;
  summary: Json;
}[] = [
  {
    name: 'taskboard',
    document: taskboard,
    action: 'add',
    payload: { id: 'one', title: 'Review the design' },
    summary: { count: 1, completed: 0 },
  },
  {
    name: 'guitar',
    document: guitar,
    action: 'add',
    payload: { id: 'one', title: 'Travel guitar', pricePence: 25900 },
    summary: { count: 1, totalPence: 25900 },
  },
  {
    name: 'ledger',
    document: ledger,
    action: 'record',
    payload: { id: 'one', description: 'Subscription', amountMinor: -1250 },
    summary: { count: 1, balanceMinor: -1250, currency: 'GBP' },
  },
];
function equal(actual: unknown, expected: unknown): void {
  if (canonicalJson(actual, 2 ** 24) !== canonicalJson(expected, 2 ** 24)) throw new Error('Values differ');
}
async function rejects(run: () => unknown, code?: string): Promise<void> {
  try {
    await run();
  } catch (error) {
    if (code && (error as any).code !== code) throw error;
    return;
  }
  throw new Error('Expected rejection');
}
export async function runSourceDocumentCorpus(): Promise<FixtureResult[]> {
  const results: FixtureResult[] = [];
  async function check(name: string, run: () => unknown) {
    try {
      await run();
      results.push({ name, passed: true });
    } catch (error) {
      results.push({ name, passed: false, detail: (error as Error).message });
    }
  }
  for (const example of viewlessExamples) {
    await check(`source document ${example.name} round trip and viewless preview`, async () => {
      const bundle = await sourceDocumentToBundle(example.document);
      const document = await sourceDocumentFromBundle(bundle);
      const rebuilt = await sourceDocumentToBundle(serializeSourceDocument(document));
      equal(rebuilt.root, bundle.root);
      equal([...rebuilt.identities()].sort(), [...bundle.identities()].sort());
      for (const cid of bundle.identities()) equal(bytes(await rebuilt.get(cid)), bytes(await bundle.get(cid)));
      equal(serializeSourceDocument(await sourceDocumentFromBundle(rebuilt)), serializeSourceDocument(document));
      const action = `ai.generalbusiness.atseq.examples.${example.name}.data#${example.action}`;
      const preview = await previewSource(await bundle.write(), action, example.payload);
      equal(preview.outcome, { decision: 'effective' });
      equal(preview.views, []);
      const definition = await LoadedDefinition.load(bundle.root, bundle);
      equal(
        (await evaluate(definition.text('summary.jsonata'), { state: preview.state, params: {} })).value,
        example.summary,
      );
      const discovered = await describeDefinition(definition);
      equal(discovered.cid, bundle.root);
      equal(discovered.version, 1);
      equal(Object.hasOwn(discovered, 'source'), false);
      equal((await validateDefinitionInfo(discovered)).cid, bundle.root);
      const complete = await describeDefinition(definition, true);
      equal((await validateDefinitionInfo(complete)).cid, bundle.root);
      const wrongSource = structuredClone(complete);
      wrongSource.cid = await contentCid({ different: 'source' });
      await rejects(() => validateDefinitionInfo(wrongSource));
      const wrongMetadata = structuredClone(complete);
      wrongMetadata.manifest.title = 'Other source';
      await rejects(() => validateDefinitionInfo(wrongMetadata));
      await rejects(() => validateDefinitionInfo({ ...discovered, version: 2 }));
      await rejects(() => validateDefinitionInfo({ ...discovered, unrecognized: true }));
    });
  }
  await check('source document guitar summary covers the maximum valid aggregate', async () => {
    const bundle = await sourceDocumentToBundle(guitar);
    const definition = await LoadedDefinition.load(bundle.root, bundle);
    const state = {
      candidates: Array.from({ length: 1000 }, (_, index) => ({
        id: `maximum-${index}`,
        title: 'Maximum price',
        pricePence: 1_000_000,
      })),
    };
    definition.schemas.validate(definition.manifest.state.ref, state);
    const query = definition.manifest.queries.find((binding) => binding.name === 'summary')!;
    definition.schemas.queryParams(query.ref, {});
    const { value } = await evaluate(definition.text(query.program), { state, params: {} });
    definition.schemas.queryResult(query.ref, value);
    equal(value, { count: 1000, totalPence: 1_000_000_000 });
  });
  await check('source document taskboard completes a retained task', async () => {
    const bundle = await sourceDocumentToBundle(taskboard),
      car = await bundle.write();
    const prefix = 'ai.generalbusiness.atseq.examples.taskboard.data#';
    const added = await previewSource(car, prefix + 'add', { id: 'one', title: 'Review' });
    const completed = await previewSource(car, prefix + 'complete', { id: 'one' }, added.state);
    equal(completed.outcome, { decision: 'effective' });
    const repeated = await previewSource(car, prefix + 'complete', { id: 'one' }, completed.state);
    equal(repeated.outcome, { decision: 'ineffective', reason: 'already_completed' });
  });
  await check('source documents refuse the historical application v1 profile', async () => {
    const source = structuredClone(taskboard) as any;
    source.manifest.profile = { $link: oldProfiles.profiles.find((profile) => profile.name === 'atseq-app-v1')!.cid };
    await rejects(() => sourceDocumentToBundle(source), 'unsupported_runtime');
  });
  await check('source document retains exact bytes, aliases, unused files and manifest order', async () => {
    const source = structuredClone(taskboard) as unknown as SourceDocument;
    const raw = new Uint8Array([0, 255, 13, 10, 0xc3, 0xa9, 32]);
    source.sources.push({ path: 'extra.bin', content: bytes(raw) }, { path: 'alias.bin', content: bytes(raw) });
    const packed = await sourceDocumentToBundle(source),
      exported = await sourceDocumentFromBundle(packed);
    exported.manifest.files!.reverse();
    const reordered = await sourceDocumentToBundle(exported);
    if (reordered.root === packed.root) throw new Error('Manifest table order should affect the root');
    const restored = await sourceDocumentToBundle(await sourceDocumentFromBundle(reordered));
    equal(restored.root, reordered.root);
    const loaded = await LoadedDefinition.load(restored.root, restored);
    equal(bytes(loaded.bytes('extra.bin')), bytes(raw));
    equal(bytes(loaded.bytes('alias.bin')), bytes(raw));
    const copy = loaded.bytes('extra.bin');
    copy[0] = 100;
    equal(bytes(loaded.bytes('extra.bin')), bytes(raw));
    equal(
      loaded.manifest.files!.map((file) => file.path),
      exported.manifest.files!.map((file) => file.path),
    );
  });
  await check('source document refuses path, version, byte and retained-table ambiguity', async () => {
    const valid = await sourceDocumentFromBundle(await sourceDocumentToBundle(taskboard));
    const mutations: ((copy: any) => void)[] = [
      (copy) => {
        copy.version = 2;
      },
      (copy) => {
        copy.extra = true;
      },
      (copy) => {
        copy.sources[0].extra = true;
      },
      (copy) => {
        copy.sources[0].content.extra = true;
      },
      (copy) => {
        copy.sources[0].content.$bytes = 'AA==';
      },
      (copy) => {
        copy.sources[0].content.$bytes = 'AB';
      },
      (copy) => {
        copy.sources[0].content.$bytes = 'A';
      },
      (copy) => {
        copy.sources.push(copy.sources[0]);
      },
      (copy) => {
        copy.manifest.files[0].cid = copy.manifest.files[1].cid;
      },
      (copy) => {
        copy.sources.push({ path: 'undeclared.txt', content: bytes(new Uint8Array()) });
      },
      (copy) => {
        copy.manifest.files.pop();
      },
      (copy) => {
        copy.manifest.profile = { $link: 'wrong' };
      },
      (copy) => {
        copy.manifest.state.initial = 'missing.json';
      },
    ];
    for (const pathname of [
      '',
      '/absolute',
      '../escape',
      'a/../b',
      'a//b',
      'a\\b',
      'https://example/a',
      'a'.repeat(201),
    ])
      mutations.push((copy) => {
        copy.sources[0].path = pathname;
      });
    for (const mutate of mutations) {
      const copy = structuredClone(valid);
      mutate(copy);
      await rejects(() => sourceDocumentToBundle(copy));
    }
    await rejects(() => sourceDocumentToBundle(' '.repeat(1024 * 1024 + 1)));
    const tooMany = structuredClone(taskboard) as any;
    while (tooMany.sources.length < 64)
      tooMany.sources.push({ path: `file${tooMany.sources.length}`, content: bytes(new Uint8Array()) });
    await rejects(() => sourceDocumentToBundle(tooMany));
    const tooLarge = structuredClone(taskboard) as any;
    tooLarge.sources.push({ path: 'large.bin', content: bytes(new Uint8Array(512 * 1024)) });
    await rejects(() => sourceDocumentToBundle(tooLarge));
    const accessor = structuredClone(taskboard);
    Object.defineProperty(accessor, 'version', {
      get() {
        throw new Error('Accessor evaluated');
      },
      enumerable: true,
    });
    await rejects(() => sourceDocumentToBundle(accessor));
    const wrongProfile = structuredClone(taskboard) as any;
    wrongProfile.manifest.profile = { $link: await contentCid({ different: 'runtime' }) };
    await rejects(() => sourceDocumentToBundle(wrongProfile));
  });
  return results;
}
