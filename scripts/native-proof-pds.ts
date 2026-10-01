/** Reference-PDS correctness evidence, not an uncontended performance benchmark. */
import assert from 'node:assert/strict';
import { randomBytes, createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { platform, arch } from 'node:os';
import { startEnvironment, resetDisposable } from '../tests/support/pds/environment.mjs';
import { fromUint8Array as readCar } from '@atcute/car';
import { decode, encode } from '@atcute/cbor';
import { toString as cidString, createSync, CODEC_DCBOR } from '@atcute/cid';
import { isNodeData } from '@atcute/mst';
import { getPublicKeyFromDidController } from '@atcute/crypto';
import { formatDidKey } from '../tests/support/pds/node_modules/@atproto/crypto/dist/index.js';
import {
  authenticateRepo,
  VerifiedRepoBlocks,
  normalizeRepoSigningKey,
  NATIVE_CACHE_HOST,
  type AuthenticateRepoOptions,
} from '../src/protocol/native-proof.ts';
import { decodeBlock } from '../src/protocol/wire.ts';
import { car } from '../tests/support/native-proof-corpus.ts';

const smoke = process.argv.includes('--smoke');
const env = await startEnvironment(),
  results: unknown[] = [],
  collection = 'ai.generalbusiness.atseq.probe',
  out = smoke ? 'experiments/generated/native-proof/pds-smoke' : 'experiments/generated/native-proof/pds';
const key = (n: number) => String(n).padStart(12, '0');
const digest = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const index = (bytes: Uint8Array) =>
  new Map([...readCar(bytes)].map((block) => [cidString(block.cid), new Uint8Array(block.bytes)]));
try {
  await mkdir(out, { recursive: true });
  const config = JSON.parse(await readFile(`${env.dir}/pds-secrets.json`, 'utf8'));
  for (const size of smoke ? [100] : [1000, 10000]) {
    const response = await fetch(`${env.url}/xrpc/com.atproto.server.createAccount`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        handle: `large${randomBytes(5).toString('hex')}.test`,
        email: `probe${randomBytes(6).toString('hex')}@example.test`,
        password: randomBytes(24).toString('hex'),
      }),
    });
    assert.equal(response.status, 200);
    const account = await response.json();
    const write = async (writes: unknown[]) => {
      const result = await fetch(`${env.url}/xrpc/com.atproto.repo.applyWrites`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${account.accessJwt}` },
        body: JSON.stringify({ repo: account.did, writes, validate: false }),
      });
      const text = await result.text();
      assert.equal(result.status, 200, text);
    };
    const value = (n: number) => ({
      $type: collection,
      position: n,
      purpose: 'P1 public fixture; not an Atseq wire contract',
    });
    const entryCid = (n: number) => cidString(createSync(CODEC_DCBOR, encode(value(n))));
    const entries = (from: number, to: number) =>
      Array.from({ length: to - from + 1 }, (_, offset) => ({
        $type: 'com.atproto.repo.applyWrites#create',
        collection,
        rkey: key(from + offset),
        value: value(from + offset),
      }));
    for (let start = 1; start <= size; start += 200) await write(entries(start, Math.min(size, start + 199)));
    await write([
      {
        $type: 'com.atproto.repo.applyWrites#create',
        collection,
        rkey: 'head',
        value: { $type: collection, position: size, entry: { $link: entryCid(size) } },
      },
    ]);
    const get = async (since?: string) => {
      const result = await fetch(
        `${env.url}/xrpc/com.atproto.sync.getRepo?did=${account.did}${since ? `&since=${since}` : ''}`,
      );
      assert.equal(result.status, 200);
      return new Uint8Array(await result.arrayBuffer());
    };
    const doc = await (await fetch(`${config.didPlcUrl}/${account.did}`)).json(),
      controller = doc.verificationMethod.find(
        (v: { id: string }) => v.id === `${account.did}#atproto` || v.id === '#atproto',
      );
    assert.ok(controller);
    const legacy = getPublicKeyFromDidController(controller),
      trustedSigningKeyDid = await normalizeRepoSigningKey(legacy);
    assert.equal(trustedSigningKeyDid, formatDidKey(legacy.jwtAlg, legacy.publicKeyBytes));
    const before = await get(),
      beforeBlocks = index(before),
      beforeRoot = readCar(before).roots[0]!.$link,
      beforeRev = decode(beforeBlocks.get(beforeRoot)!).rev as string;
    const base: Omit<AuthenticateRepoOptions, 'carBytes'> = { expectedDid: account.did, trustedSigningKeyDid };
    await writeFile(`${out}/${size}-before.car`, before);
    for (const delta of smoke ? [1] : [1, 100]) {
      await write([
        ...entries(size + (delta === 1 ? 1 : 2), size + delta),
        {
          $type: 'com.atproto.repo.applyWrites#update',
          collection,
          rkey: 'head',
          value: { $type: collection, position: size + delta, entry: { $link: entryCid(size + delta) } },
        },
      ]);
      const diff = await get(beforeRev),
        full = await get(),
        diffBlocks = index(diff),
        root = readCar(diff).roots[0]!.$link;
      assert.ok(diff.length < full.length, 'partial diff must be smaller than current full export');
      const retained = new VerifiedRepoBlocks(NATIVE_CACHE_HOST);
      await authenticateRepo({ ...base, carBytes: before, blocks: retained });
      const selected = await authenticateRepo({ ...base, carBytes: diff, blocks: retained });
      assert.equal(selected.root, root);
      assert.ok(selected.rev > beforeRev);
      for (let n = size + 1; n <= size + delta; n++) {
        const result = await selected.lookup(`${collection}/${key(n)}`, entryCid(n));
        assert.equal(result.kind, 'found');
        if (result.kind === 'found') assert.deepEqual(decodeBlock(result.bytes), value(n));
      }
      const head = await selected.lookup(`${collection}/head`);
      assert.equal(head.kind, 'found');
      if (head.kind === 'found')
        assert.equal((decodeBlock(head.bytes) as { entry: { $link: string } }).entry.$link, entryCid(size + delta));
      const complete = await selected.validateTree();
      assert.equal(complete.kind, 'complete');
      if (complete.kind === 'complete') assert.equal(complete.records, size + delta + 1);
      const diffOnly = await authenticateRepo({ ...base, carBytes: diff });
      let missing: { path: string; cid: string } | undefined;
      for (let n = 1; n <= size; n++) {
        const target = `${collection}/${key(n)}`,
          result = await diffOnly.lookup(target);
        if (
          result.kind === 'missing' &&
          beforeBlocks.has(result.cid) &&
          !diffBlocks.has(result.cid) &&
          isNodeData(decode(beforeBlocks.get(result.cid)!))
        ) {
          missing = { path: target, cid: result.cid };
          break;
        }
      }
      assert.ok(missing, 'must encounter an old path requiring a retained MST node');
      assert.equal((await selected.lookup(missing.path)).kind, 'found');
      const deficient = new VerifiedRepoBlocks(NATIVE_CACHE_HOST),
        omitted = new Map(beforeBlocks);
      omitted.delete(missing.cid);
      await authenticateRepo({ ...base, carBytes: await car(beforeRoot, omitted), blocks: deficient });
      const lacking = await authenticateRepo({ ...base, carBytes: diff, blocks: deficient }),
        missingResult = await lacking.lookup(missing.path);
      assert.deepEqual(missingResult, { kind: 'missing', cid: missing.cid });
      await authenticateRepo({ ...base, carBytes: full, blocks: deficient, expectedRoot: root });
      assert.equal((await lacking.lookup(missing.path)).kind, 'found');
      await writeFile(`${out}/${size}-delta${delta}.car`, diff);
      await writeFile(`${out}/${size}-delta${delta}-full.car`, full);
      const result = {
        size,
        delta,
        existingRecords: size + 1,
        root,
        beforeRoot,
        beforeRev,
        rev: selected.rev,
        did: account.did,
        trustedSigningKeyDid,
        beforeBytes: before.length,
        diffBytes: diff.length,
        fullBytes: full.length,
        diffRatio: diff.length / full.length,
        beforeSha256: digest(before),
        diffSha256: digest(diff),
        fullSha256: digest(full),
        newEntriesAndHeadVerified: delta + 1,
        canonicalTree: complete,
        oldPathMissingFromDiff: missing,
        oldPathResolvedWithRetainedBlocks: true,
        deliberatelyOmittedNeededNode: 'missing',
        fullExportRecovery: true,
        retainedCacheBytes: retained.bytes,
        retainedCacheBlocks: retained.size,
      };
      results.push(result);
      console.log(JSON.stringify(result));
    }
  }
  const peak = process.resourceUsage().maxRSS;
  await writeFile(
    `${out}/results.json`,
    JSON.stringify(
      {
        node: process.version,
        platform: platform(),
        arch: arch(),
        pds: '0.5.31',
        pdsFixtureLockSha256: digest(new Uint8Array(await readFile('tests/support/pds/package-lock.json'))),
        mockPlc: true,
        peakRss: {
          value: peak,
          units: 'KiB',
          bytes: peak * 1024,
          method: 'process.resourceUsage().maxRSS',
          scope:
            'whole probe Node process including setup and all cases; excludes child PDS and no proof-only attribution',
        },
        results,
        limitations: [
          'Correctness/size evidence collected while other correctness work may run; no uncontended performance claim',
          'Mock PLC, not a live provider/currentness or recovery trial',
          'Fixture records/head demonstrate native map membership, not the final Atseq wire contract',
        ],
      },
      null,
      2,
    ) + '\n',
  );
} finally {
  await env.close();
  await resetDisposable(env.dir);
}
