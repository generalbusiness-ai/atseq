import { AtseqError } from '../../src/core/errors.ts';
import { canonicalJson } from '../../src/core/values.ts';
import {
  produceNativeCheckpoint,
  type NativeCheckpointProducerInput,
} from '../../src/protocol/native-checkpoint-producer.ts';
import {
  readCheckpointBytes,
  readCheckpointJson,
  readCheckpointAssertion,
  readCompleteCheckpointTable,
  readCompleteCheckpointOutcomes,
  checkpointPayloadIdentity,
} from '../../src/protocol/checkpoint-data.ts';
import { NativeAnchor } from '../../src/protocol/native-wire.ts';
import { readCheckpointAuthorityData } from '../../src/application/checkpoint-authority-data.ts';
import type { CheckpointFixture } from './checkpoint-data-corpus.ts';
const encode = (value: unknown) => new TextEncoder().encode(canonicalJson(value, 32 * 1024 * 1024, 32));
const hex = (raw: Uint8Array) => [...raw].map((byte) => byte.toString(16).padStart(2, '0')).join('');
const equal = (a: unknown, b: unknown) => {
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error('Exact DATA differs');
};
const ok: (value: unknown) => asserts value = (value) => {
  if (!value) throw new Error('Expected condition');
};
export async function nativeCheckpointProducerFixture(
  fixture: CheckpointFixture,
  position = 13,
): Promise<NativeCheckpointProducerInput> {
  const records = new Map(
    fixture.records.map(([cid, base64]) => [cid, Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))]),
  );
  const reader = {
    get: async (cid: string) => {
      const value = records.get(cid);
      ok(value);
      return value;
    },
  };
  const payloads = new Map<string, Uint8Array>();
  for (const item of fixture.payloads)
    payloads.set(
      item.file.slice('payloads/'.length),
      await readCheckpointBytes(item.manifest, reader, 32 * 1024 * 1024),
    );
  const get = (name: string) => {
    const raw = payloads.get(name);
    ok(raw);
    return raw;
  };
  async function table(kind: 'history' | 'sources' | 'evidence') {
    const raw = get(`${kind}-table.json`);
    const data: any = readCheckpointJson(raw, raw.length);
    const result = await readCompleteCheckpointTable(
      raw,
      await Promise.all(data.pages.map((p: any) => readCheckpointBytes(p.payload, reader, 128 * 1024, true))),
      kind as 'history',
      fixture.scope,
      48 * 1024 * 1024,
      100000,
    );
    return result;
  }
  const history = await table('history'),
    sources = await table('sources'),
    evidence = await table('evidence');
  const authority = get(`checkpoint-authority-${position}.json`);
  const data: any = readCheckpointJson(authority, authority.length);
  return {
    scope: fixture.scope,
    head: position === 0 ? { position: 0, entry: fixture.scope.genesis } : history.table.through,
    frontier: data.frontier,
    definition: data.activeDefinition,
    stall: null,
    state: get('domain-state.json'),
    authority,
    producer: get('claimed-producer.json'),
    history: history.rows.slice(0, position).map(encode),
    sources: sources.rows.map(encode),
    evidence: evidence.rows.map(encode),
    outcomes: history.rows
      .slice(0, position)
      .map((row: any) => encode({ position: row.position, entry: row.entry, outcome: { decision: 'effective' } })),
    payloads: [...payloads.entries()]
      .filter(([name]) => /^(entry-|request-|evidence-\d|source-)/.test(name))
      .map(([, raw]) => raw),
  };
}
export function checkpointProducerSummary(result: Awaited<ReturnType<typeof produceNativeCheckpoint>>) {
  return {
    assertion: { cid: result.assertion.cid, hex: hex(result.assertion.bytes) },
    tables: Object.fromEntries(
      Object.entries(result.tables).map(([kind, table]) => [
        kind,
        table === null
          ? null
          : {
              cid: table.payload.cid,
              hex: hex(table.payload.bytes),
              pages: table.pages.map((p) => ({ cid: p.cid, hex: hex(p.bytes) })),
            },
      ]),
    ),
    records: result.records.map((r) => ({ path: r.path, cid: r.cid, hex: hex(r.bytes) })),
    counters: result.counters,
  };
}
export async function nativeCheckpointProducerCorpus(fixture: CheckpointFixture, literal: unknown) {
  const input = await nativeCheckpointProducerFixture(fixture);
  const cases: string[] = [];
  const metrics: unknown[] = [];
  async function pass(name: string, action: () => unknown | Promise<unknown>) {
    await action();
    cases.push(name);
  }
  async function reject(name: string, code: string, action: () => unknown | Promise<unknown>) {
    try {
      await action();
    } catch (error) {
      if (error instanceof AtseqError && error.code === code) {
        cases.push(name);
        return;
      }
      throw error;
    }
    throw new Error(`Did not reject ${name}`);
  }
  const result = await produceNativeCheckpoint(input);
  await pass('independent-encoder-exact-all-records-and-counters', () =>
    equal(checkpointProducerSummary(result), literal),
  );
  const records = new Map(result.records.map((r) => [r.cid, r.bytes]));
  const reader = {
    get: async (cid: string) => {
      const raw = records.get(cid);
      ok(raw);
      return raw;
    },
  };
  await pass('exact-assertion-table-authority-source-unused-order-roundtrip', async () => {
    const assertion = readCheckpointAssertion(
      await readCheckpointBytes(result.assertion.cid, reader, 32 * 1024 * 1024),
      input.scope,
      32 * 1024 * 1024,
    );
    const anchor = await NativeAnchor.from(fixture.genesis, fixture.scope);
    const authority = await readCheckpointAuthorityData(
      await readCheckpointBytes(assertion.authority, reader, 32 * 1024 * 1024),
      anchor,
      32 * 1024 * 1024,
    );
    equal(authority.frontier, input.frontier);
    const sources = await readCompleteCheckpointTable(
      result.tables.sources.payload.bytes,
      result.tables.sources.pages.map((p) => p.bytes),
      'sources',
      input.scope,
      48 * 1024 * 1024,
      100000,
    );
    equal(
      sources.rows[0]!.files.map((f) => f.path),
      ['unused.bin', 'state.json', 'lexicon.json'],
    );
    const history = await readCompleteCheckpointTable(
      result.tables.history.payload.bytes,
      result.tables.history.pages.map((p) => p.bytes),
      'history',
      input.scope,
      48 * 1024 * 1024,
      100000,
    );
    ok(result.tables.outcomes);
    await readCompleteCheckpointOutcomes(
      result.tables.outcomes.payload.bytes,
      result.tables.outcomes.pages.map((p) => p.bytes),
      input.scope,
      input.frontier,
      history.rows,
      48 * 1024 * 1024,
      100000,
    );
  });
  metrics.push({ kind: 'genuine-projection-13', ...result.counters });
  await pass('selective-outcomes-export-null-and-empty-complete-zero', async () => {
    const selective = await produceNativeCheckpoint({ ...input, outcomes: input.outcomes!.slice(3, 6) });
    ok(selective.tables.outcomes === null);
    ok(readCheckpointAssertion(selective.assertion.bytes, input.scope, 32 * 1024 * 1024).outcomes === null);
    const zero = await produceNativeCheckpoint({
      ...(await nativeCheckpointProducerFixture(fixture, 0)),
      head: { position: 0, entry: input.scope.genesis },
      frontier: { position: 0, entry: input.scope.genesis },
      history: [],
      sources: [],
      evidence: [],
      outcomes: [],
      payloads: [],
    });
    for (const table of Object.values(zero.tables)) {
      ok(table);
      equal(table.pages, []);
    }
  });
  await pass('synchronous-owned-input-capture-before-await', async () => {
    const source = input.state.slice();
    const rows = input.history.slice();
    const pending = produceNativeCheckpoint({ ...input, state: source, history: rows });
    source.fill(32);
    rows.length = 0;
    equal(checkpointProducerSummary(await pending), literal);
  });
  for (const size of [0, 32768, 32769, 32 * 1024 * 1024])
    await pass(`chunk-boundary-${size}`, async () => {
      const raw = new Uint8Array(size);
      for (let i = 0; i < size; i++) raw[i] = i % 251;
      const emitted = await produceNativeCheckpoint({ ...input, payloads: [raw] });
      const map = new Map(emitted.records.map((r) => [r.cid, r.bytes]));
      const cid = await checkpointPayloadIdentity(raw);
      const restored = await readCheckpointBytes(
        cid,
        {
          get: async (key) => {
            const value = map.get(key);
            ok(value);
            return value;
          },
        },
        32 * 1024 * 1024,
      );
      equal(hex(restored.subarray(0, 100)), hex(raw.subarray(0, 100)));
      ok(restored.length === size && restored.every((byte, index) => byte === raw[index]));
      metrics.push({ kind: `chunk-${size}`, ...emitted.counters });
    });
  await reject('chunk-1025-refused', 'envelope', () =>
    produceNativeCheckpoint({ ...input, payloads: [new Uint8Array(32 * 1024 * 1024 + 1)] }),
  );
  await reject('noncanonical-original-row-refused', 'noncanonical', () =>
    produceNativeCheckpoint({ ...input, history: [new TextEncoder().encode(' { }')] }),
  );
  await reject('history-extra-field-refused', 'envelope', () =>
    produceNativeCheckpoint({
      ...input,
      history: [
        encode({ ...JSON.parse(new TextDecoder().decode(input.history[0])), extra: 1 }),
        ...input.history.slice(1),
      ],
    }),
  );
  await reject('history-gap-refused', 'envelope', () =>
    produceNativeCheckpoint({ ...input, history: input.history.slice(1) }),
  );
  await reject('scope-transplant-refused', 'envelope', () =>
    produceNativeCheckpoint({ ...input, scope: { ...input.scope, genesis: input.definition } }),
  );
  const assertion: any = readCheckpointJson(result.assertion.bytes, result.assertion.bytes.length);
  await reject('assertion-extra-field-refused', 'envelope', () =>
    readCheckpointAssertion(encode({ ...assertion, extra: 1 }), input.scope, 32 * 1024 * 1024),
  );
  await reject('assertion-cross-app-refused', 'envelope', () =>
    readCheckpointAssertion(result.assertion.bytes, { ...input.scope, app: 'did:web:other.example' }, 32 * 1024 * 1024),
  );
  await reject('assertion-noncanonical-refused', 'noncanonical', () =>
    readCheckpointAssertion(
      new TextEncoder().encode(JSON.stringify(assertion, null, 2)),
      input.scope,
      32 * 1024 * 1024,
    ),
  );
  await reject('page-substitution-refused', 'envelope', () =>
    readCompleteCheckpointTable(
      result.tables.history.payload.bytes,
      [result.tables.evidence.pages[0]!.bytes],
      'history',
      input.scope,
      48 * 1024 * 1024,
      100000,
    ),
  );
  // Source row paths give genuine existing row shapes at the exact byte boundary.
  const sample: any = JSON.parse(new TextDecoder().decode(input.sources[0]));
  const file = sample.files[0];
  const row = { definition: sample.definition, manifest: sample.manifest, files: [] as any[] };
  while (true) {
    row.files.push({ ...file, path: `f${row.files.length}` });
    if (encode(row).length + 2 > 128 * 1024) {
      row.files.pop();
      break;
    }
  }
  const remaining = 128 * 1024 - 2 - encode(row).length;
  ok(remaining >= 0 && remaining <= 200 - row.files.at(-1).path.length);
  row.files.at(-1).path += 'x'.repeat(remaining);
  await pass('exact-128KiB-page-greedy-and-next-row-new-page', async () => {
    const raw = encode(row);
    ok(raw.length + 2 === 128 * 1024);
    const emitted = await produceNativeCheckpoint({ ...input, sources: [raw] });
    ok(emitted.tables.sources.pages[0]!.bytes.length === 128 * 1024);
    metrics.push({ kind: 'exact-page', ...emitted.counters });
    const other = { ...sample, definition: input.scope.genesis };
    const both = [row, other].sort((a, b) => (a.definition < b.definition ? -1 : 1));
    const greedy = await produceNativeCheckpoint({ ...input, sources: both.map(encode) });
    ok(
      greedy.tables.sources.pages.length === 2 &&
        greedy.tables.sources.pages.some((page) => page.bytes.length === 128 * 1024),
    );
  });
  row.files.at(-1).path += 'x';
  await reject('one-row-page-plus-one-refused', 'envelope', () =>
    produceNativeCheckpoint({ ...input, sources: [encode(row)] }),
  );
  let nested: any = 0;
  for (let i = 0; i < 32; i++) nested = [nested];
  await pass('state-depth-32', () => produceNativeCheckpoint({ ...input, state: encode(nested) }));
  nested = [nested];
  await reject('state-depth-33', 'noncanonical', () =>
    produceNativeCheckpoint({ ...input, state: new TextEncoder().encode(JSON.stringify(nested)) }),
  );
  return { cases, metrics, noAdmission: true };
}
