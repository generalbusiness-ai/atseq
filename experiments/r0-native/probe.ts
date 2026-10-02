/** Actual DATA and raw-adapter costs. This module cannot restore accepted state. */
import { fromUint8Array as readCar } from '@atcute/car';
import { toString as cidString } from '@atcute/cid';
import { NATIVE_NSID } from '../../src/protocol/native-schema.ts';
import { canonicalJson } from '../../src/core/values.ts';
import { NativeAnchor } from '../../src/protocol/native-wire.ts';
import { decodeBlock } from '../../src/protocol/wire.ts';
import {
  readCheckpointBytes,
  readCompleteCheckpointHistory,
  readCompleteCheckpointTable,
  readCompleteCheckpointOutcomes,
  checkCheckpointHistoryRecord,
  checkCheckpointSourceRecord,
  checkCheckpointEvidenceRecord,
} from '../../src/protocol/checkpoint-data.ts';
import {
  readCheckpointAuthorityData,
  checkCheckpointAuthorityHistory,
} from '../../src/application/checkpoint-authority-data.ts';
import {
  assessNativeGenesisSource,
  nativeSourceAction,
  nativeSourceActionFold,
  validateNativeSourceAction,
  validateNativeSourceState,
} from '../../src/definition/native-source.ts';
import { evaluate } from '../../src/runtime/evaluator.ts';
import type { LocalGenerations } from '../../src/core/local-generations.ts';
import type { CostFixture } from './fixture.ts';
import { allocatorProbe, counterAlternatives } from './unsupported-counters.ts';

export const raw = (value: string): Uint8Array => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
const text = (value: unknown) => canonicalJson(value, 32 * 1024 * 1024, 32);
const encoded = (value: unknown) => new TextEncoder().encode(text(value));
function equal(actual: unknown, expected: unknown, label: string) {
  if (text(actual) !== text(expected)) throw Error('Mismatch: ' + label);
}
function check(value: unknown, label: string): asserts value {
  if (!value) throw Error('Check failed: ' + label);
}
export interface R1Api {
  prefix: any;
  wire: any;
  proof: any;
  identity: any;
  authority: any;
}
export async function probe(
  fixture: CostFixture,
  r1: R1Api,
  openStore: (name: string) => Promise<LocalGenerations>,
  memory: () => unknown,
) {
  const times: Record<string, number> = {},
    memories: { phase: string; value: unknown }[] = [];
  const failures: { stage: string; code: string | null; message: string }[] = [];
  async function phase<T>(name: string, operation: () => T | Promise<T>): Promise<T> {
    memories.push({ phase: name + ':before', value: memory() });
    const started = performance.now();
    try {
      return await operation();
    } finally {
      times[name] = performance.now() - started;
      memories.push({ phase: name + ':after', value: memory() });
    }
  }
  function failure(stage: string, error: any) {
    failures.push({ stage, code: typeof error?.code === 'string' ? error.code : null, message: String(error) });
  }
  const maps = await phase('base64DecodeAndOwnedBlockMaps', () => ({
    framed: new Map(fixture.framed.map(([cid, value]) => [cid, raw(value)])),
    content: new Map(fixture.content.map(([cid, value]) => [cid, raw(value)])),
    sources: new Map(fixture.sources.map(([cid, value]) => [cid, raw(value)])),
  }));
  const scope = { app: fixture.genesis.app, genesis: fixture.genesisCid };
  const anchor = await NativeAnchor.from(fixture.genesis, scope);
  const gets = { checkpointReads: 0, checkpointBytes: 0, retainedReads: 0, retainedBytes: 0 };
  const frameReader = {
    get: async (cid: string) => {
      const found = maps.framed.get(cid) ?? maps.content.get(cid);
      if (!found) throw Error('Missing framed native block ' + cid);
      gets.checkpointReads++;
      gets.checkpointBytes += found.length;
      return new Uint8Array(found);
    },
  };
  const contentReader = {
    get: async (cid: string) => {
      const found = maps.content.get(cid);
      if (!found) throw Error('Missing retained native block ' + cid);
      gets.retainedReads++;
      gets.retainedBytes += found.length;
      return new Uint8Array(found);
    },
  };
  const history = await phase('historyDecodeIndexAndFramingIdentity', () =>
    readCompleteCheckpointHistory(
      raw(fixture.history.table),
      fixture.history.pages.map(raw),
      scope,
      fixture.counts.totalEntries,
      32 * 1024 * 1024,
      fixture.counts.totalEntries,
    ),
  );
  check(history.rows.length === fixture.counts.totalEntries, 'total entry count');
  check(history.indexes.requests.length === fixture.counts.totalEntries, 'complete original requests');
  check(history.indexes.retries.length === fixture.actions, 'domain-action prevention tuples');
  check(history.indexes.consumedObservations.length === fixture.counts.descriptors, 'authority descriptors');
  await phase('historyOriginalBytesHashSignatureAndChain', async () => {
    let previous = fixture.genesisCid;
    for (const row of history.rows) {
      const entry = await readCheckpointBytes(row.entryBytes, frameReader, 32 * 1024 * 1024);
      const request = await readCheckpointBytes(row.requestBytes, frameReader, 32 * 1024 * 1024);
      await checkCheckpointHistoryRecord(row, entry, request, anchor, previous);
      previous = row.entry;
    }
  });
  const outcomes = await phase('outcomeDecodeValidationAndFramingIdentity', () =>
    readCompleteCheckpointOutcomes(
      raw(fixture.outcomes.table),
      fixture.outcomes.pages.map(raw),
      scope,
      history.table.through,
      history.rows,
      32 * 1024 * 1024,
      fixture.counts.totalEntries,
    ),
  );
  equal(outcomes.rows, fixture.oracle.outcomes, 'ordinary TypeScript outcome oracle');
  const authorityBytes = await phase('compactAuthorityNativeFramingReconstruction', () =>
    readCheckpointBytes(fixture.authorityManifest, frameReader, 32 * 1024 * 1024),
  );
  check(authorityBytes.length === raw(fixture.authority).length, 'authority framed length');
  const authority = await phase('compactAuthorityDecodeValidateAndCopy', () =>
    readCheckpointAuthorityData(authorityBytes, anchor, 32 * 1024 * 1024),
  );
  equal(authority, fixture.oracle.authority, 'ordinary TypeScript authority oracle');
  await phase('authorityHistoryCrosscheckAndTemporaryIndexes', () =>
    checkCheckpointAuthorityHistory(
      raw(fixture.authority),
      history.rows,
      history.table.through,
      anchor,
      32 * 1024 * 1024,
    ),
  );
  const source = await phase('sourceAdmission', () =>
    assessNativeGenesisSource(fixture.genesis.definition.$link, {
      get: async (cid: string) => {
        const found = maps.sources.get(cid);
        if (!found) throw Error('Missing source');
        return new Uint8Array(found);
      },
    }),
  );
  check(source.kind === 'admitted', 'actual supported source admission');
  const sourceData = await phase('sourceDataDecodeAndOriginalFiles', async () => {
    const result = await readCompleteCheckpointTable(
      raw(fixture.sourceTable.table),
      fixture.sourceTable.pages.map(raw),
      'sources',
      scope,
      32 * 1024 * 1024,
      64,
    );
    for (const row of result.rows)
      await checkCheckpointSourceRecord(
        row,
        await readCheckpointBytes(row.manifest, frameReader, 32 * 1024 * 1024),
        await Promise.all(
          row.files.map(async (file: any) => await readCheckpointBytes(file.bytes, frameReader, 32 * 1024 * 1024)),
        ),
      );
    return result;
  });
  const evidence = await phase('evidenceDataDecodeAndExactNativeBytes', async () => {
    const result = await readCompleteCheckpointTable(
      raw(fixture.evidence.table),
      fixture.evidence.pages.map(raw),
      'evidence',
      scope,
      32 * 1024 * 1024,
      100_000,
    );
    for (const row of result.rows)
      await checkCheckpointEvidenceRecord(row, await readCheckpointBytes(row.bytes, frameReader, 32 * 1024 * 1024));
    return result;
  });
  const participantProofs = await phase('participantMethodRootAndExactMstProofValidation', async () => {
    const bindings = new Map<string, any>();
    let roots = 0,
      recordLookups = 0,
      treeNodeLoads = 0,
      carBytes = 0;
    async function methodBinding(principal: string, method: any) {
      const key = JSON.stringify([principal, method.bytes.$link, method.selectedTip.$link]);
      if (!bindings.has(key))
        bindings.set(
          key,
          await r1.identity.deriveIdentityBinding(principal, {
            assuranceClass: 'plc-audit-v1',
            auditBytes: await readCheckpointBytes(method.bytes.$link, contentReader, 32 * 1024 * 1024),
            selectedTipCid: method.selectedTip.$link,
          }),
        );
      return bindings.get(key);
    }
    for (const row of history.rows)
      for (const cid of row.observations) {
        const record = await r1.wire.readNativeRecord(NATIVE_NSID.content, cid, await contentReader.get(cid)),
          observation = record.body;
        const before = await methodBinding(observation.principal, observation.before),
          after = await methodBinding(observation.principal, observation.after);
        check(
          before.signingKeyDid === after.signingKeyDid && before.pdsOrigin === after.pdsOrigin,
          'captured before/after participant method binding',
        );
        for (const proof of observation.proofs) {
          const bytes = await readCheckpointBytes(proof.$link, contentReader, 32 * 1024 * 1024);
          carBytes += bytes.length;
          const repo = await r1.proof.authenticateRepo({
            carBytes: bytes,
            expectedDid: observation.principal,
            trustedSigningKeyDid: before.signingKeyDid,
            expectedRoot: observation.repositoryRoot.$link,
          });
          roots++;
          for (const selected of observation.records) {
            const found = await repo.lookup(selected.path, selected.cid.$link);
            recordLookups++;
            check(
              found.kind === 'found' && found.cid === selected.cid.$link,
              'actual selected participant record proof',
            );
          }
          const tree = await repo.validateTree();
          check(tree.kind === 'complete', 'participant native MST completeness');
          treeNodeLoads += tree.nodeLoads;
        }
      }
    check(roots === fixture.counts.descriptors, 'all genuine participant roots');
    return {
      methodBindingsChecked: bindings.size,
      authenticatedRoots: roots,
      recordLookups,
      treeNodeLoads,
      carBytes,
      assurance:
        'retained PLC audit and native root/path authentication; not online currentness or whole-prefix authority execution',
    };
  });
  const copied = await phase('explicitFullDataProjectionCopy', () =>
    structuredClone({ history: history.rows, indexes: history.indexes, authority, outcomes: outcomes.rows }),
  );
  equal(copied.history, history.rows, 'owned history copy');
  const isolatedState = await phase('isolatedSupportedSourceFoldAndValidation', async () => {
    let state: any = { count: 0, description: 'demo' };
    for (const row of history.rows)
      if (row.actor) {
        const entry: any = decodeBlock(await readCheckpointBytes(row.entryBytes, frameReader, 32 * 1024 * 1024));
        const action = nativeSourceAction(source.definition, entry.request.intent.operation.action);
        check(action, 'admitted source action');
        validateNativeSourceAction(source.definition, action, entry.request.intent.operation.payload);
        const result = await evaluate(nativeSourceActionFold(action), {
          state,
          act: entry.request.intent.operation.payload,
          meta: {
            app: scope.app,
            genesis: scope.genesis,
            position: row.position,
            principal: entry.request.intent.principal,
            execution: entry.request.intent.operation.execution.$link,
          },
        });
        const value: any = result.value;
        check(value.decision === 'effective', 'bounded fixture source decision');
        validateNativeSourceState(source.definition, value.state);
        state = value.state;
      }
    equal(state, fixture.oracle.state, 'independent arithmetic state oracle');
    return state;
  });
  // These are actual source folds, not an accepted native authority/application restore.
  let receipts: any = { status: 'unavailable', lookups: [] },
    prefix: any = null;
  let repo: any = null;
  const method = {
    assuranceClass: 'plc-audit-v1',
    auditBytes: raw(fixture.appIdentity.auditBytes),
    selectedTipCid: fixture.appIdentity.selectedTipCid,
  };
  try {
    const r1Anchor = await r1.wire.NativeAnchor.from(fixture.genesis, scope);
    const binding = await phase('coldR1IdentityReauthentication', () =>
      r1.identity.deriveIdentityBinding(scope.app, method),
    );
    repo = await phase('coldR1DefaultNativeCarAuthentication', () =>
      r1.proof.authenticateRepo({
        carBytes: raw(fixture.appCar),
        expectedDid: scope.app,
        trustedSigningKeyDid: binding.signingKeyDid,
      }),
    );
    prefix = await phase('coldR1DefaultCompletePrefixReverification', () =>
      r1.prefix.openNativePrefix({
        anchor: r1Anchor,
        appRepo: repo,
        reader: contentReader,
        appIdentity: { before: method, after: method },
      }),
    );
    const before = r1.prefix.nativePrefixInventory(prefix);
    receipts = { status: 'complete-from-genesis', lookups: [], projection: r1.prefix.nativePrefixStatus(prefix) };
    for (const item of fixture.probes) {
      const original = await phase(`receipt-${item.ordinal}-original`, () =>
        r1.prefix.lookupNativeRetry(prefix, item.original),
      );
      const alternate = await phase(`receipt-${item.ordinal}-alternate-signature`, () =>
        r1.prefix.lookupNativeRetry(prefix, item.alternate),
      );
      check(original?.position === item.position, 'original receipt position');
      equal(alternate, original, 'alternate signature original receipt');
      equal(original.entry.request, item.original, 'preserved first stored signature');
      const expected = history.rows[item.position - 1]!;
      check(original.requestCid === expected.request && original.entryCid === expected.entry, 'original CID pointers');
      let code: any = null;
      try {
        await phase(`receipt-${item.ordinal}-conflict`, () => r1.prefix.lookupNativeRetry(prefix, item.conflict));
      } catch (error: any) {
        code = error?.code;
      }
      check(code === 'retry_conflict', 'same signer nonce content conflict');
      receipts.lookups.push({
        ordinal: item.ordinal,
        position: item.position,
        request: original.requestCid,
        entry: original.entryCid,
        originalAndAlternateAgree: true,
        firstSignaturePreserved: true,
        conflictCode: code,
      });
    }
    equal(r1.prefix.nativePrefixInventory(prefix), before, 'retry inventory unchanged');
    // A second fresh owner demonstrates independent reconstruction, not persisted capability revival.
    const second = await phase('secondFreshDefaultPrefixReconstruction', () =>
      r1.prefix.openNativePrefix({
        anchor: r1Anchor,
        appRepo: repo,
        reader: contentReader,
        appIdentity: { before: method, after: method },
      }),
    );
    for (const item of fixture.probes) {
      const receipt = await r1.prefix.lookupNativeRetry(second, item.original);
      check(
        receipt.position === item.position && receipt.entryCid === history.rows[item.position - 1]!.entry,
        'fresh owner receipt',
      );
    }
    await phase('missingOldNativePublicationBlockRefusal', async () => {
      const whole = raw(fixture.appCar),
        parsed = readCar(whole),
        oldest = history.rows[fixture.probes[0]!.position - 1]!.entry;
      const pieces = [whole.subarray(0, parsed.header.headerEnd)];
      let removed = 0;
      for (const block of parsed) {
        if (cidString(block.cid) === oldest) removed++;
        else pieces.push(whole.subarray(block.entryStart, block.entryEnd));
      }
      check(removed === 1, 'removed exactly oldest published entry bytes');
      const sparse = new Uint8Array(pieces.reduce((n, part) => n + part.length, 0));
      let offset = 0;
      for (const part of pieces) {
        sparse.set(part, offset);
        offset += part.length;
      }
      const sparseRepo = await r1.proof.authenticateRepo({
        carBytes: sparse,
        expectedDid: scope.app,
        trustedSigningKeyDid: binding.signingKeyDid,
      });
      let code: any = null;
      try {
        await r1.prefix.openNativePrefix({
          anchor: r1Anchor,
          appRepo: sparseRepo,
          reader: contentReader,
          appIdentity: { before: method, after: method },
        });
      } catch (error: any) {
        code = error?.code;
      }
      check(code === 'content_unavailable', 'missing old native proof is unavailable, not absent or a receipt');
      receipts.missingOldPublicationBlockCode = code;
      equal(r1.prefix.nativePrefixInventory(prefix), before, 'failed cold reconstruction cannot alter accepted owner');
    });
    const live = await phase('actualR1ApplicationAuthorityAndSourceReplay', async () => {
      const app = await r1.authority.openNativeApplication({
        anchor: r1Anchor,
        sourceReader: {
          get: async (cid: string) => {
            const found = maps.sources.get(cid) ?? maps.content.get(cid);
            if (!found) throw Error('Missing application evidence');
            return new Uint8Array(found);
          },
        },
      });
      for (const row of history.rows) {
        const entry = decodeBlock(await readCheckpointBytes(row.entryBytes, frameReader, 32 * 1024 * 1024));
        await app.process({
          entry,
          appRepo: repo,
          appIdentity: { before: method, after: method },
          reader: contentReader,
        });
      }
      const projection = app.snapshot();
      equal(projection.state, fixture.oracle.state, 'actual R1 independent state oracle');
      equal(
        projection.authority,
        { ...fixture.oracle.authority, format: 'atseq-native-authority' },
        'actual R1 independent authority oracle',
      );
      equal(
        projection.outcomes.map(({ position, entry, outcome }: any) => ({ position, entry, outcome })),
        fixture.oracle.outcomes,
        'actual R1 independent outcome oracle',
      );
      for (const item of fixture.probes) {
        const result = await app.retry(item.alternate);
        check(
          result.receipt?.position === item.position && result.outcome?.decision === 'effective',
          'historical receipt and outcome after grant retirement',
        );
      }
      return {
        state: projection.state,
        authority: projection.authority,
        outcomes: projection.outcomes.map(({ position, entry, outcome }: any) => ({ position, entry, outcome })),
      };
    });
    receipts.actualApplicationOracleMatch = true;
  } catch (error: any) {
    if (!['content_unavailable', 'native_proof_limit'].includes(error?.code)) throw error;
    failure('genuineR1DefaultColdReconstruction', error);
  }
  const persistentRows: any[] = [
    ...fixture.framed.map(([cid, value]) => ({ kind: 'evidence', key: cid, value: raw(value) })),
    ...fixture.content.map(([cid, value]) => ({ kind: 'evidence', key: cid, value: raw(value) })),
    ...fixture.sources.map(([cid, value]) => ({ kind: 'sources', key: cid, value: raw(value) })),
    ...history.rows.map((row) => ({
      kind: 'history',
      key: String(row.position).padStart(16, '0'),
      value: encoded(row),
    })),
    ...outcomes.rows.map((row) => ({
      kind: 'outcomes',
      key: String(row.position).padStart(16, '0'),
      value: encoded(row),
    })),
    { kind: 'authority', key: 'compact-framed-pointer', value: encoded({ bytes: fixture.authorityManifest }) },
  ];
  const unique = new Map(persistentRows.map((row) => [row.kind + '\0' + row.key, row]));
  const rows = [...unique.values()];
  let persistence: any = { status: 'unavailable', commits: 0, confirmedRows: 0, requestedRows: unique.size };
  let store: LocalGenerations | undefined;
  try {
    store = await openStore('native');
    let current: number | null = null;
    await phase('rawStoreDefaultBatchedCommits', async () => {
      for (let offset = 0; offset < rows.length; offset += 1000) {
        current = await store!.commit(
          current,
          encoded({ scope, through: history.table.through, rawDataOnly: true }),
          rows.slice(offset, offset + 1000),
        );
        persistence.commits++;
        persistence.confirmedRows += Math.min(1000, rows.length - offset);
      }
      await store!.pin(current!, 'r0-experiment-read');
    });
    await phase('rawStoreClose', () => store!.close());
    store = undefined;
    store = await phase('rawStoreReopen', () => openStore('native'));
    await phase('rawStoreExactReadAfterReopen', async () => {
      for (const row of rows) {
        const restored = await store!.row(current!, row.kind, row.key);
        check(
          restored !== undefined &&
            restored.length === row.value.length &&
            restored.every((byte, i) => byte === row.value[i]),
          'exact durable row bytes',
        );
      }
      for (const kind of ['history', 'outcomes', 'evidence', 'sources', 'authority'] as const) {
        let after: string | undefined,
          total = 0;
        do {
          const page = await store!.page(current!, kind, after);
          total += page.rows.length;
          after = page.next;
        } while (after);
        check(total === rows.filter((row) => row.kind === kind).length, 'bounded page durable count');
      }
      await store!.release('r0-experiment-read');
    });
    persistence.status = 'exact-raw-data-reopen';
    persistence.generation = current;
    persistence.logicalValueBytes = rows.reduce((n, row) => n + row.value.length, 0);
    persistence.rawMultiCommitIsNotAtomicAcceptedRestore = true;
  } catch (error: any) {
    if (error?.code !== 'quota') throw error;
    failure('rawStoreDefaultPersistence', error);
    await store?.close();
    store = undefined;
    store = await phase('rawStoreReopenAfterRefusal', () => openStore('native'));
    const retained = await store.current();
    if (persistence.commits) {
      check(retained?.id === persistence.commits, 'failed commit retains previous generation');
      let count = 0;
      for (const kind of ['history', 'outcomes', 'evidence', 'sources', 'authority'] as const) {
        let after: string | undefined;
        do {
          const page = await store.page(retained!.id, kind, after);
          count += page.rows.length;
          after = page.next;
        } while (after);
      }
      check(count === persistence.confirmedRows, 'failed commit retains complete prior raw batches');
      for (const row of rows.slice(0, persistence.confirmedRows)) {
        const restored = await store.row(retained!.id, row.kind, row.key);
        check(
          restored !== undefined &&
            restored.length === row.value.length &&
            restored.every((byte, i) => byte === row.value[i]),
          'refused commit preserves exact confirmed bytes',
        );
      }
      persistence.confirmedPrefixReopened = true;
    } else check(retained === undefined, 'initial refusal leaves no generation');
  } finally {
    await store?.close();
  }
  const counters = counterAlternatives(history.rows, fixture);
  const allocator = await phase('unsupportedCounterDurableAllocatorRaces', () => allocatorProbe(openStore));
  const tableBytes = (table: CostFixture['history']) =>
    raw(table.table).length + table.pages.reduce((n, page) => n + raw(page).length, 0);
  const nativeBlocks = new Map([...maps.content, ...maps.framed]);
  const componentHashes = await phase('canonicalDataComparisonHashes', async () => {
    const values: any = {
      state: isolatedState,
      history: history.rows,
      indexes: history.indexes,
      authority,
      outcomes: outcomes.rows,
      sourceDefinitions: sourceData.rows.map((row: any) => row.definition),
      evidenceCids: evidence.rows.map((row: any) => row.cid),
    };
    const hashes: Record<string, string> = {};
    for (const [name, value] of Object.entries(values)) {
      const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', encoded(value)));
      hashes[name] = [...digest].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    }
    return hashes;
  });
  let fullProjectionCopyJsonBytes: number | null = null;
  try {
    fullProjectionCopyJsonBytes = encoded(copied).length;
  } catch (error) {
    failure('boundedFullProjectionDiagnosticSerialization', error);
  }
  return {
    actions: fixture.actions,
    pattern: fixture.pattern,
    counts: fixture.counts,
    costs: {
      ...fixture.costs,
      deduplicatedNativeEvidenceBlocks: nativeBlocks.size,
      deduplicatedNativeEvidenceBytes: [...nativeBlocks.values()].reduce((n, bytes) => n + bytes.length, 0),
      retainedAuthorityGrantDiagnosticJsonBytes: encoded(authority.grants).length,
      retiredAuthorityGrantDiagnosticJsonBytes: encoded(authority.grants.filter((row: any) => row.revoked)).length,
      authorityEpochDiagnosticJsonBytes: encoded(authority.principals).length,
      historyDataBytes: tableBytes(fixture.history),
      outcomeDataBytes: tableBytes(fixture.outcomes),
      sourceDataBytes: tableBytes(fixture.sourceTable),
      evidenceDataBytes: tableBytes(fixture.evidence),
      derivedIndexDiagnosticJsonBytes: encoded(history.indexes).length,
      preventionTupleDiagnosticJsonBytes: encoded(history.indexes.retries).length,
      receiptPointerDiagnosticJsonBytes: encoded(
        history.rows.map(({ position, entry, request, entryBytes, requestBytes }) => ({
          position,
          entry,
          request,
          entryBytes,
          requestBytes,
        })),
      ).length,
      fullProjectionCopyJsonBytes,
    },
    times,
    memories,
    gets,
    participantProofs,
    failures,
    receipts,
    persistence,
    counters,
    allocator,
    equality: {
      state: isolatedState,
      counts: fixture.counts,
      componentHashes,
      participantProofs,
      receiptLookups: receipts.lookups,
      receiptStatus: receipts.status,
      actualApplicationOracleMatch: receipts.actualApplicationOracleMatch ?? false,
      missingOldPublicationBlockCode: receipts.missingOldPublicationBlockCode ?? null,
      persistenceStatus: persistence.status,
      allocator,
    },
    scope:
      'DATA/source-fold/raw-store/default cold R1 reconstruction only; no accepted restore, deferred bootstrap or public receipt proof',
  };
}
