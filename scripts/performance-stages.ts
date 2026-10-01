import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import { P256PrivateKeyExportable } from '@atcute/crypto';
import { fixtureApp } from '../tests/support/runtime-corpus.ts';
import { guitarFixture } from '../testdata/apps/fixtures.ts';
import { SourceBundle } from '../src/definition/source.ts';
import { Folder } from '../src/application/folder.ts';
import { headAt, randomNonce, sequence, signIntent, verifyHistory, type Entry } from '../src/protocol/log.ts';
import { bytes, contentCid, encodeBlock, link } from '../src/protocol/wire.ts';
import { canonicalJson } from '../src/core/values.ts';
import { observeCrypto } from './performance-observer.ts';

const sizes = (process.env.ATSEQ_BENCH_SIZES ?? '100,1000,10000').split(',').map(Number);
const actorCounts = (process.env.ATSEQ_BENCH_ACTORS ?? '1,16').split(',').map(Number);
const repeats = Number(process.env.ATSEQ_BENCH_REPEATS ?? 3);
if (
  !sizes.every((n) => Number.isSafeInteger(n) && n > 0 && n <= 10000) ||
  !actorCounts.every((n) => Number.isSafeInteger(n) && n > 0 && n <= 100) ||
  !Number.isSafeInteger(repeats) ||
  repeats < 1 ||
  repeats > 20
)
  throw new Error('Invalid bounded benchmark matrix');
const text = (value: string) => new TextEncoder().encode(value);
const hash = (raw: Uint8Array) => createHash('sha256').update(raw).digest('hex');
const captures: unknown[] = [];
const metadata = {
  version: 1,
  exactHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  harnessSha256: hash(new Uint8Array(await (await import('node:fs/promises')).readFile(new URL(import.meta.url)))),
  runtime: process.version,
  hardware: {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    cpu: os.cpus()[0]?.model,
    logicalCpus: os.cpus().length,
    totalMemory: os.totalmem(),
  },
  sizes,
  actorCounts,
  repeats,
  limitations: [
    'In-memory baseline; no PDS/network/browser measurements here',
    'Summed WebCrypto durations overlap under concurrency and include observer overhead',
    'CBOR/hash timings below measure an explicit separate entry traversal, not internal attribution of verifyHistory',
    'State transition time includes domain fold, validation, per-entry CIDs and snapshot copy; no inferred split',
    'RSS/heap are boundary samples, not peak memory',
    'Unsigned randomness changes fixtures across runs; exact public fixture captures are retained',
  ],
};
await mkdir('experiments/generated/performance-stages', { recursive: true });
for (const growing of [false, true]) {
  const base = await guitarFixture('ai.generalbusiness.atseq.examples.benchmark');
  const data = JSON.parse(new TextDecoder().decode(base.files['schemas/data.json']));
  data.defs.state.properties.candidates = { type: 'array', maxLength: 10000, items: { type: 'integer' } };
  const source = await SourceBundle.pack(
    { ...base.manifest, views: [] },
    {
      ...base.files,
      'schemas/data.json': text(JSON.stringify(data)),
      'candidate.jsonata': text(
        growing
          ? '{"decision":"effective","state":{"candidates":$append(state.candidates,act.pricePence),"selected":act.id}}'
          : '{"decision":"effective","state":{"candidates":[],"selected":act.id}}',
      ),
    },
  );
  for (const actors of actorCounts) {
    const app = await fixtureApp(source);
    const signers = await Promise.all(Array.from({ length: actors }, () => P256PrivateKeyExportable.createKeypair()));
    const keys = await Promise.all(signers.map((s) => s.exportPublicKey('did')));
    let head = headAt(app.anchor);
    const entries: Entry[] = [];
    for (const size of sizes) {
      if (size < head.position) throw new Error('Sizes must increase');
      while (head.position < size) {
        const position = head.position + 1,
          signer = (position - 1) % actors;
        const signed = await signIntent(
          {
            $type: 'ai.generalbusiness.atseq.defs#intent',
            version: 1,
            app: app.anchor.genesis.app,
            genesis: link(app.anchor.cid),
            definition: link(source.root),
            actorKey: keys[signer]!,
            nonce: randomNonce(),
            action: base.action,
            payload: { id: String(position), title: 'Benchmark', pricePence: position },
          },
          signers[signer]!,
        );
        const entry = await sequence(signed, app.anchor, head, app.writer);
        entries.push(entry);
        head = headAt(app.anchor, position, await contentCid(entry));
      }
      const fixture = {
        genesis: app.anchor.genesis,
        genesisCid: app.anchor.cid,
        head,
        entries,
        source: bytes(await source.write()),
      };
      const fixtureRaw = text(JSON.stringify(fixture));
      const fixtureName = `${growing ? 'growing' : 'bounded'}-${actors}-${size}`;
      await writeFile(`experiments/generated/performance-stages/${fixtureName}.json`, fixtureRaw);
      for (let sample = 0; sample < repeats; sample++) {
        const memoryBefore = process.memoryUsage();
        let start = performance.now();
        const verified = await observeCrypto(() => verifyHistory(app.anchor, head, entries));
        const verificationMs = performance.now() - start;
        // Guard observer instrumentation against silently missing crypto operations.
        assert.equal(verified.crypto.verify.calls, 2 * size);
        start = performance.now();
        for (const entry of entries) await contentCid(entry);
        const explicitEntryCidTraversalMs = performance.now() - start;
        start = performance.now();
        const folder = await Folder.open(app.anchor, source);
        const loadMs = performance.now() - start;
        start = performance.now();
        const interpreted = await folder.catchUpVerified(verified.result);
        const interpretationMs = performance.now() - start;
        assert.equal(interpreted.stalled, undefined);
        assert.equal(interpreted.projection.frontier.position, size);
        assert.equal((interpreted.projection.state as { selected: string }).selected, String(size));
        assert.equal((interpreted.projection.state as { candidates: number[] }).candidates.length, growing ? size : 0);
        start = performance.now();
        folder.snapshot();
        const snapshotCopyMs = performance.now() - start;
        const capture = {
          fixtureName,
          fixtureSha256: hash(fixtureRaw),
          size,
          actors,
          growing,
          sample,
          verificationMs,
          crypto: verified.crypto,
          explicitEntryCidTraversalMs,
          loadMs,
          interpretationMs,
          snapshotCopyMs,
          stateBytes: Buffer.byteLength(canonicalJson(interpreted.projection.state, 2 ** 24)),
          historyBytes: fixtureRaw.length,
          memoryBefore,
          memoryAfter: process.memoryUsage(),
          correctness: 'verified full prefix; expected state/frontier; no stall',
        };
        captures.push(capture);
        console.log(JSON.stringify(capture));
        await writeFile(
          'experiments/generated/performance-stages/results.json',
          JSON.stringify({ metadata, captures }, null, 2) + '\n',
        );
      }
    }
  }
}
