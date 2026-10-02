import { AtseqError } from '../../src/core/errors.ts';
import { canonicalJson } from '../../src/core/values.ts';
import { contentCid, decodeBlock } from '../../src/protocol/wire.ts';
import { NativeAnchor } from '../../src/protocol/native-wire.ts';
import {
  readCheckpointBytes,
  readCheckpointJson,
  readCheckpointTable,
  readCheckpointPage,
  readCompleteCheckpointHistory,
  readCompleteCheckpointTable,
  checkpointPayloadIdentity,
  checkCheckpointHistoryRecord,
  checkCheckpointSourceRecord,
  checkCheckpointEvidenceRecord,
  type CheckpointHistoryRow,
} from '../../src/protocol/checkpoint-data.ts';
import {
  readCheckpointAuthorityData,
  checkCheckpointAuthorityHistory,
} from '../../src/application/checkpoint-authority-data.ts';
import { readNativeAuthoritySnapshot } from '../../src/application/native-authority-snapshot.ts';
import { nativeAuthoritySnapshot } from '../../src/application/native-authority.ts';
import { parseIdentityJson } from '../../src/protocol/identity-json.ts';
import { parseStrictJson, StrictJsonError } from '../../src/protocol/strict-json.ts';
export interface CheckpointFixture {
  source: string;
  sourceVectorsSha256: string;
  genesis: any;
  genesisCid: string;
  scope: { app: string; genesis: string };
  payloads: { file: string; manifest: string }[];
  records: [string, string][];
}
const encode = (value: unknown) => new TextEncoder().encode(canonicalJson(value, 32 * 1024 * 1024, 32));
function equal(a: unknown, b: unknown): void {
  if (canonicalJson(a, 32 * 1024 * 1024, 32) !== canonicalJson(b, 32 * 1024 * 1024, 32))
    throw new Error('Different exact data');
}
function ok(value: unknown): asserts value {
  if (!value) throw new Error('Expected condition');
}
export async function checkpointDataCorpus(fixture: CheckpointFixture): Promise<string[]> {
  const cases: string[] = [];
  const recordMap = new Map(
    fixture.records.map(([cid, b64]) => [cid, Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))]),
  );
  const reader = {
    get: async (cid: string) => {
      const raw = recordMap.get(cid);
      if (!raw) throw new AtseqError('content_unavailable', 'Missing retained bytes');
      return raw.slice();
    },
  };
  const cid = (name: string) => {
    const value = fixture.payloads.find((p) => p.file === `payloads/${name}`)?.manifest;
    ok(value);
    return value;
  };
  const payload = (name: string) => readCheckpointBytes(cid(name), reader, 32 * 1024 * 1024);
  const anchor = await NativeAnchor.from(fixture.genesis, fixture.scope);
  async function pass(name: string, action: () => Promise<unknown> | unknown) {
    await action();
    cases.push(name);
  }
  async function reject(name: string, code: string, action: () => Promise<unknown> | unknown) {
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
  for (const position of [0, 1, 2, 12, 13, 20])
    await pass(`authority-${position}-exact-data`, async () => {
      const full = await readNativeAuthoritySnapshot(
        readCheckpointJson(await payload(`authority-${position}.json`), 32 * 1024 * 1024),
        anchor,
      );
      const compact = await readCheckpointAuthorityData(
        await payload(`checkpoint-authority-${position}.json`),
        anchor,
        32 * 1024 * 1024,
      );
      const { requests, retries, consumedObservations, ...kernel } = full;
      equal(compact, { ...kernel, format: 'atseq-checkpoint-authority' });
      let rejected = false;
      try {
        nativeAuthoritySnapshot(compact as any);
      } catch (error) {
        rejected = error instanceof AtseqError && error.code === 'envelope';
      }
      ok(rejected);
      if (position === 20) {
        const row = compact.principals[0]!;
        ok(row.epochs.length === 3 && row.epochs.find((e) => e.cid === row.epoch)?.previous === null);
      }
    });
  const tableRaw = await payload('history-table.json');
  const table = readCheckpointTable(tableRaw, 'history', fixture.scope, 32768);
  const pageBytes = await Promise.all(table.pages.map((p) => readCheckpointBytes(p.payload, reader, 128 * 1024, true)));
  const complete = await readCompleteCheckpointHistory(tableRaw, pageBytes, fixture.scope, 13, 128 * 1024, 20);
  await pass('complete-13-history-exact-indexes', async () => {
    const full: any = readCheckpointJson(await payload('authority-13.json'), 32768);
    equal(complete.indexes, {
      requests: full.requests,
      retries: full.retries,
      consumedObservations: full.consumedObservations,
    });
  });
  for (const frontier of [2, 12, 13])
    await pass(`head13-frontier${frontier}-restricted-I2-data`, async () => {
      const actual = await checkCheckpointAuthorityHistory(
        await payload(`checkpoint-authority-${frontier}.json`),
        complete.rows,
        table.through,
        anchor,
        32768,
      );
      equal(actual, readCheckpointJson(await payload(`authority-${frontier}.json`), 32768));
    });
  for (const [index, row] of complete.rows.entries())
    await pass(`original-entry-request-${index + 1}`, async () => {
      await checkCheckpointHistoryRecord(
        row,
        await payload(`entry-${index + 1}.cbor`),
        await payload(`request-${index + 1}.cbor`),
        anchor,
        index === 0 ? anchor.cid : complete.rows[index - 1]!.entry,
      );
    });
  const sources = await readCheckpointPage(
    await payload('sources-page-1.json'),
    'sources',
    fixture.scope,
    128 * 1024,
    10,
  );
  const source = sources[0]!;
  const fileBytes = await Promise.all(source.files.map((f) => readCheckpointBytes(f.bytes, reader, 32768)));
  await pass('source-order-unused-binary-exact-bytes', async () => {
    equal(
      source.files.map((f) => f.path),
      ['unused.bin', 'state.json', 'lexicon.json'],
    );
    await checkCheckpointSourceRecord(source, await payload('source-definition.cbor'), fileBytes);
  });
  const evidence = await readCheckpointPage(
    await payload('evidence-page-1.json'),
    'evidence',
    fixture.scope,
    128 * 1024,
    100,
  );
  await pass('evidence-exact-hashes-separate-root-context', async () => {
    for (const row of evidence)
      await checkCheckpointEvidenceRecord(row, await readCheckpointBytes(row.bytes, reader, 32 * 1024 * 1024));
  });
  for (const size of [0, 32768, 32769])
    await pass(`native-chunk-boundary-${size}`, async () => {
      ok((await payload(`chunk-boundary-${size}.bin`)).length === size);
    });
  const text = (value: string) => new TextEncoder().encode(value);
  for (const [name, raw] of [
    ['duplicate-decoded-names', text('{"a":1,"\\u0061":2}')],
    ['BOM', new Uint8Array([239, 187, 191, 123, 125])],
    ['bad-UTF8', new Uint8Array([195, 40])],
    ['trailing-comma', text('[1,]')],
    ['comments', text('{/*x*/}')],
    ['whitespace', text('{ }')],
    ['negative-zero', text('-0')],
    ['unsafe-number', text('9007199254740992')],
    ['unpaired-surrogate', text('"\\ud800"')],
    ['unsorted-keys', text('{"b":0,"a":0}')],
  ] as const) {
    await reject(
      name,
      ['negative-zero', 'unsafe-number'].includes(name)
        ? 'wire_number'
        : name === 'unpaired-surrogate'
          ? 'unicode'
          : 'noncanonical',
      () => readCheckpointJson(raw, 1024, true),
    );
  }
  await reject('normative-page-depth33-malformed', 'noncanonical', () =>
    readCheckpointJson(text('['.repeat(33) + '0' + ']'.repeat(33)), 1024, true),
  );
  await reject('normative-page128KiB-plus1-malformed', 'envelope', () =>
    readCheckpointJson(new Uint8Array(128 * 1024 + 1), 200 * 1024, true),
  );
  await reject('smaller-local-byte-budget-unavailable', 'content_unavailable', () =>
    readCheckpointJson(text('{}'), 1, true),
  );
  await reject('I1-depth-unchanged-unavailable', 'content_unavailable', () =>
    parseIdentityJson(text('['.repeat(33) + '0' + ']'.repeat(33)), 1024),
  );
  await pass('pure-parser-typed-depth-fact', () => {
    try {
      parseStrictJson(text('[[0]]'), 1024, 1);
    } catch (error) {
      ok(error instanceof StrictJsonError && error.reason === 'depth');
      return;
    }
    throw new Error('No typed fault');
  });
  async function badTable(name: string, edit: (value: any) => void) {
    const value = structuredClone(table);
    edit(value);
    await reject(name, 'envelope', () => readCheckpointTable(encode(value), 'history', fixture.scope, 32768));
  }
  await badTable('table-extra-field', (v) => (v.requests = null));
  await badTable('table-old-request-kind', (v) => (v.kind = 'requests'));
  await badTable('table-scope-swap', (v) => (v.app = 'did:plc:mwqjepoibatkuye33gk5lg6v'));
  await badTable('table-zero-page-count', (v) => (v.pages[0].rows = 0));
  await badTable('table-count-mismatch', (v) => v.rows++);
  await badTable('table-count-overflow', (v) => (v.pages[0].rows = Number.MAX_SAFE_INTEGER));
  await badTable('table-genesis-position-mismatch', (v) => (v.through = { position: 0, entry: table.through.entry }));
  async function badPage(name: string, edit: (value: any[]) => void, code = 'envelope') {
    const value = JSON.parse(new TextDecoder().decode(pageBytes[0]));
    edit(value);
    await reject(name, code, () => readCheckpointPage(encode(value), 'history', fixture.scope, 128 * 1024, 20));
  }
  await badPage('history-missing-actor', (v) => delete v[0].actor);
  await badPage('history-extra-field', (v) => (v[0].verified = true));
  await badPage('history-gap', (v) => v[1].position++);
  await badPage('history-zero-position', (v) => (v[0].position = 0));
  await badPage('history-invalid-nonce', (v) => (v[1].actor.nonce = '!'));
  await badPage('history-device-account-confusion', (v) => (v[1].actor.actorKey = fixture.scope.app), 'key');
  await badPage('history-two-descriptors', (v) => (v[0].observations = [table.through.entry, table.through.entry]));
  await reject('local-page-row-budget-unavailable', 'content_unavailable', () =>
    readCheckpointPage(pageBytes[0]!, 'history', fixture.scope, 128 * 1024, 1),
  );
  await reject('missing-complete-page-unavailable', 'content_unavailable', () =>
    readCompleteCheckpointHistory(tableRaw, pageBytes.slice(1), fixture.scope, 13, 128 * 1024, 20),
  );
  await reject('missing-native-bytes-unavailable', 'content_unavailable', () =>
    readCheckpointBytes(
      cid('history-table.json'),
      {
        get: async () => {
          throw new AtseqError('content_unavailable', 'Missing');
        },
      },
      32768,
    ),
  );
  await pass('unexpected-reader-fault-preserved', async () => {
    const fault = new Error('Programmer fault');
    try {
      await readCheckpointBytes(
        cid('history-table.json'),
        {
          get: async () => {
            throw fault;
          },
        },
        32768,
      );
    } catch (error) {
      ok(error === fault);
      return;
    }
    throw new Error('Fault swallowed');
  });
  async function changedComplete(name: string, edit: (rows: CheckpointHistoryRow[]) => void) {
    const rows = structuredClone(complete.rows);
    edit(rows);
    const pages: Uint8Array[] = [];
    const refs: { payload: string; rows: number }[] = [];
    for (let offset = 0; offset < rows.length; offset += 2) {
      const raw = encode(rows.slice(offset, offset + 2));
      pages.push(raw);
      refs.push({ payload: await checkpointPayloadIdentity(raw), rows: Math.min(2, rows.length - offset) });
    }
    await reject(name, 'envelope', () =>
      readCompleteCheckpointHistory(encode({ ...table, pages: refs }), pages, fixture.scope, 12, 128 * 1024, 20),
    );
  }
  await changedComplete('cross-page-request-duplicate', (rows) => (rows[2]!.request = rows[0]!.request));
  await changedComplete('cross-page-retry-duplicate', (rows) => {
    const signed = rows.filter((r) => r.actor !== null);
    signed[2]!.actor = structuredClone(signed[0]!.actor);
  });
  await changedComplete('cross-page-descriptor-duplicate', (rows) => {
    const used = rows.filter((r) => r.observations.length);
    used[1]!.observations = [...used[0]!.observations];
  });
  await changedComplete('cross-page-position-gap', (rows) => rows[2]!.position++);
  const compact13: any = readCheckpointJson(await payload('checkpoint-authority-13.json'), 32768);
  async function badAuthority(name: string, edit: (value: any) => void, whole = false) {
    const value = structuredClone(compact13);
    edit(value);
    await reject(name, 'envelope', () =>
      whole
        ? checkCheckpointAuthorityHistory(encode(value), complete.rows, table.through, anchor, 32768)
        : readCheckpointAuthorityData(encode(value), anchor, 32768),
    );
  }
  await badAuthority('compact-no-invented-index-arrays', (v) => (v.requests = []));
  await badAuthority(
    'compact-recovery-policy-immutable',
    (v) => (v.control.recoverGovernance = !v.control.recoverGovernance),
  );
  await badAuthority('compact-epoch-id-reused', (v) => (v.principals[0].epochs[1].id = v.principals[0].epochs[0].id));
  await badAuthority('compact-epoch-immutable-cid', (v) => (v.principals[0].epochs[0].previous = fixture.genesisCid));
  await badAuthority('compact-current-epoch-missing', (v) => (v.principals[0].epoch = fixture.genesisCid));
  await badAuthority('compact-grant-tombstone-mismatch', (v) => (v.grants[0].cid = null));
  await badAuthority(
    'compact-historical-revision-needs-coverage',
    (v) => (v.roles[0].revision = v.activeDefinition),
    true,
  );
  await badAuthority(
    'compact-floor-needs-descriptor-coverage',
    (v) => (v.principals[0].observation.cid = fixture.genesisCid),
    true,
  );
  const genesis: any = readCheckpointJson(await payload('checkpoint-authority-0.json'), 32768);
  genesis.roles = [];
  await reject('compact-genesis-exact-initialization', 'envelope', () =>
    readCheckpointAuthorityData(encode(genesis), anchor, 32768),
  );
  await reject('unsigned-versus-signed-wrapper-identity', 'envelope', async () => {
    const row = structuredClone(complete.rows[1]!);
    row.request = await contentCid(decodeBlock(await payload('request-2.cbor')));
    await checkCheckpointHistoryRecord(
      row,
      await payload('entry-2.cbor'),
      await payload('request-2.cbor'),
      anchor,
      complete.rows[0]!.entry,
    );
  });
  await reject('original-request-bytes-unmodified', 'envelope', async () => {
    const raw = await payload('request-2.cbor');
    raw[raw.length - 1] = raw[raw.length - 1]! ^ 1;
    await checkCheckpointHistoryRecord(
      complete.rows[1]!,
      await payload('entry-2.cbor'),
      raw,
      anchor,
      complete.rows[0]!.entry,
    );
  });
  await reject('original-entry-chain-exact', 'envelope', async () =>
    checkCheckpointHistoryRecord(
      complete.rows[1]!,
      await payload('entry-2.cbor'),
      await payload('request-2.cbor'),
      anchor,
      fixture.genesisCid,
    ),
  );
  await reject('source-file-order-not-normalized', 'envelope', async () => {
    const row = structuredClone(source);
    row.files.reverse();
    await checkCheckpointSourceRecord(row, await payload('source-definition.cbor'), [...fileBytes].reverse());
  });
  await reject('source-original-binary-hash', 'envelope', async () => {
    const corrupted = fileBytes.map((b) => b.slice());
    corrupted[0]![0] = corrupted[0]![0]! ^ 1;
    await checkCheckpointSourceRecord(source, await payload('source-definition.cbor'), corrupted);
  });
  await pass('complete-source-table-exact', async () => {
    const full = await readCompleteCheckpointTable(
      await payload('sources-table.json'),
      [await payload('sources-page-1.json')],
      'sources',
      fixture.scope,
      128 * 1024,
      10,
    );
    equal(full.rows, sources);
  });
  await reject('sources-cross-page-duplicate', 'envelope', async () => {
    const raw = encode([source]);
    const reference = { payload: await checkpointPayloadIdentity(raw), rows: 1 };
    const inventory = { ...table, kind: 'sources', rows: 2, pages: [reference, reference] };
    await readCompleteCheckpointTable(encode(inventory), [raw, raw], 'sources', fixture.scope, 128 * 1024, 10);
  });
  await reject('evidence-cross-page-duplicate', 'envelope', async () => {
    const raw = encode([evidence[0]]);
    const reference = { payload: await checkpointPayloadIdentity(raw), rows: 1 };
    const inventory = { ...table, kind: 'evidence', rows: 2, pages: [reference, reference] };
    await readCompleteCheckpointTable(encode(inventory), [raw, raw], 'evidence', fixture.scope, 128 * 1024, 10);
  });
  await reject('unexpected-extra-history-page-malformed', 'envelope', () =>
    readCompleteCheckpointHistory(tableRaw, [...pageBytes, pageBytes[0]!], fixture.scope, 13, 128 * 1024, 20),
  );
  await reject('global-history-row-budget-unavailable', 'content_unavailable', () =>
    readCompleteCheckpointHistory(tableRaw, pageBytes, fixture.scope, 13, 128 * 1024, 12),
  );
  await reject('global-history-byte-budget-unavailable', 'content_unavailable', () =>
    readCompleteCheckpointHistory(tableRaw, pageBytes, fixture.scope, 13, tableRaw.length + pageBytes[0]!.length, 20),
  );
  await reject('history-page-identity-mismatch-malformed', 'envelope', () =>
    readCompleteCheckpointHistory(tableRaw, [...pageBytes].reverse(), fixture.scope, 13, 128 * 1024, 20),
  );
  await reject('outcome-exact-contract-still-gated', 'content_unavailable', () =>
    (readCheckpointPage as any)(
      encode([{ position: 1, entry: table.through.entry, outcome: { decision: 'effective' } }]),
      'outcomes',
      fixture.scope,
      128 * 1024,
      20,
    ),
  );
  await reject('compact-null-row-malformed', 'envelope', () =>
    readCheckpointAuthorityData(encode({ ...compact13, roles: [null] }), anchor, 32768),
  );
  await reject('source-duplicate-path-malformed', 'envelope', () =>
    readCheckpointPage(
      encode([{ ...source, files: [source.files[0], source.files[0]] }]),
      'sources',
      fixture.scope,
      128 * 1024,
      10,
    ),
  );
  await reject('compact-false-frontier-mapping-malformed', 'envelope', () =>
    checkCheckpointAuthorityHistory(
      encode({ ...compact13, frontier: { position: 12, entry: table.through.entry } }),
      complete.rows,
      table.through,
      anchor,
      32768,
    ),
  );
  await pass('owned-returned-data-cannot-change-retained-bytes', async () => {
    const raw = await payload('history-page-1.json');
    const first = await readCheckpointPage(raw, 'history', fixture.scope, 128 * 1024, 10);
    first[0]!.request = first[0]!.entry;
    equal(
      await readCheckpointPage(raw, 'history', fixture.scope, 128 * 1024, 10),
      JSON.parse(new TextDecoder().decode(raw)),
    );
  });
  return cases;
}
