import * as CAR from '@atcute/car';
import { ProtocolError } from '../../src/core/errors.ts';
import { NodeStore } from '@atcute/mst';
import { P256PublicKey } from '@atcute/crypto';
import {
  authenticateRepo,
  extractNativeRepoPaths,
  VerifiedRepoBlocks,
  NATIVE_CACHE_HOST,
} from '../../src/protocol/native-proof.ts';
import { extractionOptions, extractionPath, type ExtractionFixture } from './native-proof-extraction-fixture.ts';
export async function nativeProofExtractionWorkloads(fixtures: Record<string, ExtractionFixture>) {
  const measurements: Record<string, unknown>[] = [];
  for (const records of [100, 1000, 10000]) {
    const options = await extractionOptions(fixtures[String(records)]!),
      repo = await authenticateRepo({ ...options, blocks: new VerifiedRepoBlocks(NATIVE_CACHE_HOST) });
    for (const [context, requested] of [
      ['all records', records],
      ['warm delta request set', 0],
      ['warm delta request set', 1],
      ['warm delta request set', 100],
    ] as const) {
      const requests = Array.from({ length: requested }, (_, n) => ({ path: extractionPath(n + 1) }));
      let nodes = 0,
        signatures = 0;
      const get = NodeStore.prototype.get,
        verify = P256PublicKey.prototype.verify;
      NodeStore.prototype.get = async function (cid) {
        nodes++;
        return get.call(this, cid);
      };
      P256PublicKey.prototype.verify = async function (...args) {
        signatures++;
        return verify.apply(this, args);
      };
      const started = performance.now();
      let raw: Uint8Array;
      try {
        raw = await extractNativeRepoPaths(repo, requests);
      } finally {
        NodeStore.prototype.get = get;
        P256PublicKey.prototype.verify = verify;
      }
      const elapsedMs = performance.now() - started,
        reader = CAR.fromUint8Array(raw!),
        blocks = [...reader];
      const offline = await authenticateRepo({ ...options, carBytes: raw!, blocks: new VerifiedRepoBlocks() });
      if (requested === records) {
        const tree = await offline.validateTree();
        if (tree.kind !== 'complete' || tree.records !== records)
          throw Error('Complete requested generic tree failed offline validation');
      } else if (requested) {
        for (const n of [1, requested])
          if ((await offline.lookup(extractionPath(n))).kind !== 'found')
            throw Error('Selected generic path failed offline lookup');
      }
      measurements.push({
        genericMstRecords: records,
        requestedPaths: requested,
        context,
        elapsedMs,
        nodeStoreGets: nodes,
        signatureVerifications: signatures,
        uniqueBlocks: blocks.length,
        framedCarBytes: raw!.length,
        copiedCollectorBlockBytes: blocks.reduce((n, row) => n + row.bytes.length, 0),
        hashes: null,
        keyNormalization: null,
        peakHeap: null,
      });
    }
  }
  const boundOptions = await extractionOptions(fixtures['40000']!),
    completeBlocks = [...CAR.fromUint8Array(boundOptions.carBytes)];
  if (completeBlocks.length <= 50000 || boundOptions.carBytes.length >= 16 * 1024 * 1024)
    throw Error('Actual portable unique-block fixture does not isolate block ceiling');
  const retained = new VerifiedRepoBlocks(NATIVE_CACHE_HOST),
    boundRepo = await authenticateRepo({ ...boundOptions, blocks: retained }),
    size = retained.size,
    bytes = retained.bytes;
  const started = performance.now();
  let caught: unknown;
  try {
    await extractNativeRepoPaths(
      boundRepo,
      Array.from({ length: 40000 }, (_, n) => ({ path: extractionPath(n + 1) })),
    );
  } catch (error) {
    caught = error;
  }
  if (
    !(caught instanceof ProtocolError) ||
    caught.code !== 'native_proof_limit' ||
    retained.size !== size ||
    retained.bytes !== bytes
  )
    throw Error('Actual portable block ceiling failed or changed retained inventory');
  measurements.push({
    genericMstRecords: 40000,
    requestedPaths: 40000,
    context: 'actual portable unique-block refusal',
    completeInputBlocks: completeBlocks.length,
    completeInputCarBytes: boundOptions.carBytes.length,
    portableUniqueBlockCap: 50000,
    portableCarByteCap: 16 * 1024 * 1024,
    refusal: caught.code,
    elapsedMs: performance.now() - started,
    partialOutput: false,
    retainedCacheInventoryUnchanged: true,
    peakHeap: null,
  });
  return {
    claim:
      'Generic genuinely signed MST record/path extraction; not native ordered action replay or shared observer delta integration',
    measurements,
  };
}
