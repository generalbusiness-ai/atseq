import { AtseqError } from '../../src/core/errors.ts';
import { canonicalJson } from '../../src/core/values.ts';
import {
  readNativeOutcome,
  NATIVE_FRAMEWORK_REASONS,
  NATIVE_FOLD_FAILURE_CODES,
} from '../../src/protocol/native-outcome.ts';
import {
  readCheckpointBytes,
  readCheckpointTable,
  readCompleteCheckpointHistory,
  readCompleteCheckpointOutcomes,
  readCheckpointPage,
  checkpointPayloadIdentity,
} from '../../src/protocol/checkpoint-data.ts';
import type { CheckpointFixture } from './checkpoint-data-corpus.ts';
export interface OutcomeLiteralFixture {
  tables: { frameworkReasons: string[]; foldFailureCodes: string[]; closedOutcomeSchema: any };
  vectors: { input: unknown; valid: boolean }[];
}
const encode = (value: unknown) => new TextEncoder().encode(canonicalJson(value, 32 * 1024 * 1024, 32));
function equal(a: unknown, b: unknown) {
  if (canonicalJson(a, 32 * 1024 * 1024, 32) !== canonicalJson(b, 32 * 1024 * 1024, 32))
    throw new Error('Different outcome data');
}
function ok(value: unknown): asserts value {
  if (!value) throw new Error('Expected outcome condition');
}
export async function nativeOutcomeCorpus(
  literals: OutcomeLiteralFixture,
  fixture: CheckpointFixture,
): Promise<string[]> {
  const cases: string[] = [];
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
  await pass('exact-adopted-30-framework-17-prefix-tables', () => {
    equal(NATIVE_FRAMEWORK_REASONS, literals.tables.frameworkReasons);
    equal(NATIVE_FOLD_FAILURE_CODES, literals.tables.foldFailureCodes);
    ok(NATIVE_FRAMEWORK_REASONS.length === 30 && NATIVE_FOLD_FAILURE_CODES.length === 17);
    equal(literals.tables.closedOutcomeSchema.oneOf[1].properties.reason.enum, [
      ...NATIVE_FRAMEWORK_REASONS,
      ...NATIVE_FOLD_FAILURE_CODES.map((code) => `fold_failed/${code}`),
    ]);
    ok(Object.isFrozen(NATIVE_FRAMEWORK_REASONS) && Object.isFrozen(NATIVE_FOLD_FAILURE_CODES));
  });
  for (const [index, vector] of literals.vectors.entries()) {
    await pass(`adopted-outcome-literal-${index + 1}-${vector.valid ? 'valid' : 'invalid'}`, () => {
      let parsed;
      try {
        parsed = readNativeOutcome(vector.input);
      } catch (error) {
        if (!vector.valid && error instanceof AtseqError) return;
        throw error;
      }
      ok(vector.valid);
      equal(parsed, vector.input);
    });
  }
  const hostile = [
    null,
    [],
    { decision: 'effective', reason: 'ignored' },
    { decision: 'effective', verified: true },
    { decision: 'stalled' },
    { decision: 'ineffective', source: 'unknown', reason: 'grant_revoked' },
    { decision: 'ineffective', source: 'framework', reason: 'future_framework' },
    { decision: 'ineffective', source: 'framework', reason: 'fold_failed/content_unavailable' },
    { decision: 'ineffective', source: 'framework', reason: 'fold_failed/invalid_source' },
    { decision: 'ineffective', source: 'framework', reason: 'fold_failed/engine_error' },
    { decision: 'ineffective', source: 'framework', reason: 'fold_failed/absent_result', message: 'authored' },
    { decision: 'ineffective', source: 'fold', reason: 'fold_failed/wire_value' },
    { decision: 'ineffective', source: 'fold', reason: 'Grant_revoked' },
    { decision: 'ineffective', source: 'fold', reason: '' },
    { decision: 'ineffective', source: 'fold', reason: 'x', producer: 'framework' },
    { decision: 'ineffective', source: 'fold', reason: 'x', message: null },
    { decision: 'ineffective', source: 'fold', reason: 'x', message: 'x'.repeat(1025) },
  ];
  for (const [index, value] of hostile.entries())
    await reject(`hostile-closed-outcome-${index + 1}`, 'envelope', () => readNativeOutcome(value));
  await reject('unpaired-surrogate-message-invalid', 'unicode', () =>
    readNativeOutcome({ decision: 'ineffective', source: 'fold', reason: 'x', message: '\ud800' }),
  );
  await pass('fold-1024-codepoint-4096-byte-message-exact', () => {
    const input = { decision: 'ineffective', source: 'fold', reason: 'x', message: '😀'.repeat(1024) };
    equal(readNativeOutcome(input), input);
    ok(new TextEncoder().encode(input.message).length === 4096);
  });
  await pass('same-denial-name-has-separate-parsed-namespaces', () => {
    const a = readNativeOutcome({ decision: 'ineffective', source: 'framework', reason: 'grant_revoked' });
    const b = readNativeOutcome({ decision: 'ineffective', source: 'fold', reason: 'grant_revoked' });
    ok(a.decision === 'ineffective' && a.source === 'framework' && b.decision === 'ineffective' && b.source === 'fold');
  });
  await pass('parsed-outcome-owned-data-not-producer-certificate', () => {
    const input = { decision: 'ineffective', source: 'fold', reason: 'x', message: 'original' };
    const parsed = readNativeOutcome(input);
    input.message = 'changed';
    ok(parsed.decision === 'ineffective' && parsed.source === 'fold' && parsed.message === 'original');
  });
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
  const payload = async (name: string) => {
    const cid = fixture.payloads.find((p) => p.file === `payloads/${name}`)?.manifest;
    ok(cid);
    return readCheckpointBytes(cid, reader, 32 * 1024 * 1024);
  };
  const historyTableRaw = await payload('history-table.json');
  const historyTable = readCheckpointTable(historyTableRaw, 'history', fixture.scope, 32768);
  const historyPages = await Promise.all(
    historyTable.pages.map((p) => readCheckpointBytes(p.payload, reader, 128 * 1024, true)),
  );
  const history = await readCompleteCheckpointHistory(historyTableRaw, historyPages, fixture.scope, 13, 128 * 1024, 20);
  for (const n of [12, 13])
    await pass(`exact-outcome-table-through-${n}-head13`, async () => {
      const tableRaw = await payload(n === 13 ? 'outcomes-table.json' : 'outcomes12-table.json');
      const table = readCheckpointTable(tableRaw, 'outcomes', fixture.scope, 32768);
      const pages = await Promise.all(table.pages.map((p) => readCheckpointBytes(p.payload, reader, 128 * 1024, true)));
      const parsed = await readCompleteCheckpointOutcomes(
        tableRaw,
        pages,
        fixture.scope,
        table.through,
        history.rows,
        128 * 1024,
        20,
      );
      ok(parsed.rows.length === n);
      for (const row of parsed.rows) equal(row.outcome, readNativeOutcome(row.outcome));
    });
  const outcomeTableRaw = await payload('outcomes-table.json');
  const outcomeTable = readCheckpointTable(outcomeTableRaw, 'outcomes', fixture.scope, 32768);
  const outcomePages = await Promise.all(
    outcomeTable.pages.map((p) => readCheckpointBytes(p.payload, reader, 128 * 1024, true)),
  );
  const original = await readCompleteCheckpointOutcomes(
    outcomeTableRaw,
    outcomePages,
    fixture.scope,
    outcomeTable.through,
    history.rows,
    128 * 1024,
    20,
  );
  async function changed(name: string, edit: (rows: any[]) => void) {
    const rows = structuredClone(original.rows);
    edit(rows);
    const pages: Uint8Array[] = [];
    const refs: { payload: string; rows: number }[] = [];
    for (let offset = 0; offset < rows.length; offset += 2) {
      const raw = encode(rows.slice(offset, offset + 2));
      pages.push(raw);
      refs.push({ payload: await checkpointPayloadIdentity(raw), rows: Math.min(2, rows.length - offset) });
    }
    await reject(name, 'envelope', () =>
      readCompleteCheckpointOutcomes(
        encode({ ...outcomeTable, pages: refs }),
        pages,
        fixture.scope,
        outcomeTable.through,
        history.rows,
        128 * 1024,
        20,
      ),
    );
  }
  await changed('outcome-cross-page-position-duplicate', (rows) => (rows[2].position = 2));
  await changed('outcome-cross-page-position-gap', (rows) => (rows[2].position = 4));
  await changed('outcome-entry-does-not-match-history', (rows) => (rows[0].entry = history.rows[1]!.entry));
  await changed('outcome-extra-row-field', (rows) => (rows[0].verified = true));
  await changed(
    'outcome-forged-framework-reason',
    (rows) => (rows[0].outcome = { decision: 'ineffective', source: 'framework', reason: 'unreviewed' }),
  );
  await changed(
    'outcome-unavailable-is-not-replicated-denial',
    (rows) =>
      (rows[0].outcome = { decision: 'ineffective', source: 'framework', reason: 'fold_failed/content_unavailable' }),
  );
  await changed('outcome-pending-is-not-replicated-result', (rows) => (rows[0].outcome = { decision: 'pending' }));
  await reject('outcome-nonnull-partial-coverage-invalid', 'envelope', () =>
    readCheckpointTable(encode({ ...outcomeTable, rows: 12 }), 'outcomes', fixture.scope, 32768),
  );
  await reject('outcome-frontier-target-mismatch', 'envelope', () =>
    readCompleteCheckpointOutcomes(
      outcomeTableRaw,
      outcomePages,
      fixture.scope,
      { position: 12, entry: history.rows[11]!.entry },
      history.rows,
      128 * 1024,
      20,
    ),
  );
  await reject('outcome-missing-page-unavailable', 'content_unavailable', () =>
    readCompleteCheckpointOutcomes(
      outcomeTableRaw,
      outcomePages.slice(1),
      fixture.scope,
      outcomeTable.through,
      history.rows,
      128 * 1024,
      20,
    ),
  );
  await reject('outcome-extra-page-malformed', 'envelope', () =>
    readCompleteCheckpointOutcomes(
      outcomeTableRaw,
      [...outcomePages, outcomePages[0]!],
      fixture.scope,
      outcomeTable.through,
      history.rows,
      128 * 1024,
      20,
    ),
  );
  await reject('outcome-page-inventory-count-malformed', 'envelope', () =>
    readCheckpointTable(
      encode({
        ...outcomeTable,
        pages: outcomeTable.pages.map((p, index) => ({ ...p, rows: p.rows + (index ? 0 : 1) })),
      }),
      'outcomes',
      fixture.scope,
      32768,
    ),
  );
  await reject('outcome-needed-history-unavailable', 'content_unavailable', () =>
    readCompleteCheckpointOutcomes(
      outcomeTableRaw,
      outcomePages,
      fixture.scope,
      outcomeTable.through,
      history.rows.slice(0, 12),
      128 * 1024,
      20,
    ),
  );
  await reject('outcome-supplied-history-position-malformed', 'envelope', () =>
    readCompleteCheckpointOutcomes(
      outcomeTableRaw,
      outcomePages,
      fixture.scope,
      outcomeTable.through,
      history.rows.map((row, index) => (index === 1 ? { ...row, position: 1 } : row)),
      128 * 1024,
      20,
    ),
  );
  await reject('outcome-local-row-limit-unavailable', 'content_unavailable', () =>
    readCompleteCheckpointOutcomes(
      outcomeTableRaw,
      outcomePages,
      fixture.scope,
      outcomeTable.through,
      history.rows,
      128 * 1024,
      12,
    ),
  );
  await reject('outcome-local-byte-limit-unavailable', 'content_unavailable', () =>
    readCompleteCheckpointOutcomes(
      outcomeTableRaw,
      outcomePages,
      fixture.scope,
      outcomeTable.through,
      history.rows,
      outcomeTableRaw.length,
      20,
    ),
  );
  await reject('outcome-page-hash-order-mismatch', 'envelope', () =>
    readCompleteCheckpointOutcomes(
      outcomeTableRaw,
      [...outcomePages].reverse(),
      fixture.scope,
      outcomeTable.through,
      history.rows,
      128 * 1024,
      20,
    ),
  );
  await pass('outcome-genesis-empty-complete-table', async () => {
    const through = { position: 0, entry: fixture.scope.genesis };
    const parsed = await readCompleteCheckpointOutcomes(
      encode({ ...outcomeTable, through, rows: 0, pages: [] }),
      [],
      fixture.scope,
      through,
      history.rows,
      32768,
      20,
    );
    ok(parsed.rows.length === 0);
  });
  await reject('outcome-row-original-extra-scope', 'envelope', () =>
    readCheckpointPage(
      encode([{ ...original.rows[0], app: fixture.scope.app }]),
      'outcomes',
      fixture.scope,
      128 * 1024,
      20,
    ),
  );
  return cases;
}
