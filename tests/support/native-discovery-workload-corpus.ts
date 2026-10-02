/** Actual genesis replay and private reads, with environment measurements kept separate. */
import { openNativeApplication } from '../../src/application/native-authority.ts';
import { NativeAnchor } from '../../src/protocol/native-wire.ts';
import { authenticateRepo } from '../../src/protocol/native-proof.ts';
import { AtseqError } from '../../src/core/errors.ts';
import { canonicalJson } from '../../src/core/values.ts';
import type { NativeDiscoveryWorkload } from './native-discovery-workload-fixture.ts';
function assert(value: unknown, detail: string): asserts value {
  if (!value) throw new Error(detail);
}
function heap() {
  const environment = globalThis as any;
  if (environment.process?.memoryUsage)
    return { kind: 'node-process-heap-used', bytes: environment.process.memoryUsage().heapUsed as number };
  if (environment.performance?.memory)
    return { kind: 'chrome-js-heap-used', bytes: environment.performance.memory.usedJSHeapSize as number };
  return { kind: 'unavailable', bytes: null };
}
async function measure<T>(run: () => Promise<T>) {
  const before = heap(),
    start = performance.now(),
    result = await run(),
    elapsedMs = performance.now() - start,
    after = heap();
  return {
    result,
    measurement: {
      elapsedMs,
      before,
      after,
      heapDelta: before.bytes === null || after.bytes === null ? null : after.bytes - before.bytes,
      peakHeap: 'unmeasured',
      garbageCollection: 'not-forced',
    },
  };
}
export async function nativeDiscoveryWorkloadCorpus(f: NativeDiscoveryWorkload) {
  const anchor = await NativeAnchor.from(f.genesis, { app: f.genesis.app, genesis: f.genesisCid });
  const source = new Map(f.sourceBlocks.map(([cid, raw]) => [cid, new Uint8Array(raw)]));
  const retained = new Map(f.retainedContent.map(([cid, raw]) => [cid, new Uint8Array(raw)]));
  let transportReads = 0;
  const app = await openNativeApplication({
    anchor,
    sourceReader: {
      async get(cid) {
        transportReads++;
        const raw = source.get(cid);
        if (!raw) throw new AtseqError('content_unavailable', 'Missing workload source');
        return raw;
      },
    },
  });
  const evidence = {
    assuranceClass: 'plc-audit-v1' as const,
    auditBytes: new Uint8Array(f.appIdentity.auditBytes),
    selectedTipCid: f.appIdentity.selectedTipCid,
  };
  const reader = {
    async get(cid: string) {
      transportReads++;
      const raw = retained.get(cid);
      if (!raw) throw new AtseqError('content_unavailable', 'Missing workload authority evidence');
      return raw;
    },
  };
  const rows = [];
  let start = 0,
    effective = 0;
  for (const checkpoint of f.checkpoints) {
    const authenticated = await measure(() =>
      authenticateRepo({
        carBytes: new Uint8Array(checkpoint.appCar),
        expectedDid: f.genesis.app,
        trustedSigningKeyDid: f.appKey,
      }),
    );
    const replay = await measure(async () => {
      for (let i = start; i < checkpoint.totalEntries; i++) {
        const result = await app.process({
          entry: f.entries[i]!,
          appRepo: authenticated.result,
          appIdentity: { before: evidence, after: evidence },
          reader,
        });
        assert(
          result.outcome.decision === 'effective',
          'Every manually specified signed workload transition effective at ' + i,
        );
        effective++;
      }
    });
    start = checkpoint.totalEntries;
    const snapshot = app.snapshot();
    assert(
      canonicalJson(snapshot.state) === canonicalJson(checkpoint.expectedState),
      'Independent workload state expectation',
    );
    assert(
      snapshot.authority.frontier.position === checkpoint.totalEntries && effective === checkpoint.expectedEffective,
      'Complete genuine fold frontier',
    );
    const readsBefore = transportReads;
    const cold = await measure(() => app.discover(f.subject));
    const warm = await measure(() => app.discover(f.subject));
    const concurrent = await measure(() => Promise.all([app.discover(f.subject), app.discover(f.subject)]));
    for (const result of [cold.result, warm.result, ...concurrent.result]) {
      assert(result.kind === 'available', 'Complete workload discovery');
      const action = result.actions.find((row) => row.action === f.action.ref)!;
      assert(
        action.kind === 'eligible' && action.grant.id === f.selectedGrant.id,
        'One genuine selected workload grant',
      );
      assert(
        result.basis.frontier.position === checkpoint.totalEntries &&
          result.basis.nextPosition === checkpoint.totalEntries + 1,
        'Actual checkpoint frontier basis',
      );
    }
    assert(
      cold.result.work.memo === 'computed' && warm.result.work.memo === 'reused',
      'Exact cold/warm generation memo',
    );
    assert(
      concurrent.result.every((r) => r.work.memo === 'reused'),
      'Concurrent warm readers share completed pair',
    );
    assert(transportReads === readsBefore, 'Zero discovery history/outcome/content loads');
    rows.push({
      actionCount: checkpoint.actionCount,
      totalEntries: checkpoint.totalEntries,
      grantCount: f.grantCount,
      selectedProofBytes: checkpoint.carBytes,
      coldDefaultPrefixRefusal: checkpoint.coldDefaultRefusal,
      bootstrap: replay.measurement,
      repositoryAuthentication: authenticated.measurement,
      reads: { discoveryTransport: transportReads - readsBefore, selectionHistory: 0, selectionOutcomes: 0 },
      cold,
      warm,
      concurrent,
    });
  }
  return {
    profile: f.profile,
    grantCount: f.grantCount,
    rows,
    limits: '100→1000→10000 genuine ordering extension; no default prefix/quota/schema changes',
    recommendations:
      'History is absent from discovery selection; characterize bootstrap separately. Only1/32 grants measured; no capacity/latency target or peak-heap claim.',
  };
}
