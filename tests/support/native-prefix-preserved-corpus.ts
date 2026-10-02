/** Genuine roots and owners; the maintained walker hook only delays or counts actual lookups. */
import { NodeWalker } from '@atcute/mst';
import { P256PublicKey } from '@atcute/crypto';
import { AtseqError } from '../../src/core/errors.ts';
import { canonicalJson } from '../../src/core/values.ts';
import { authenticateRepo, type AuthenticatedRepo } from '../../src/protocol/native-proof.ts';
import { NativeAnchor, nativeGenesisPath, nativeHeadPath, nativeEntryPath } from '../../src/protocol/native-wire.ts';
import {
  assertNativePrefixPreserved,
  openNativePrefix,
  stageNativePrefix,
  acceptNativePrefix,
  nativePrefixCandidate,
  nativePrefixStatus,
  nativePrefixInventory,
  nativePrefixEntry,
  nativePrefixProvenance,
  lookupNativeRetry,
  contradictNativePrefix,
  type NativePrefix,
} from '../../src/application/native-prefix.ts';
import type { PreservedFixture } from './native-prefix-preserved-fixture.ts';
function assert(value: unknown, message = 'Preservation predicate failed'): asserts value {
  if (!value) throw new Error(message);
}
const exact = (value: unknown) =>
  canonicalJson(
    JSON.parse(JSON.stringify(value, (_key, row) => (row instanceof Uint8Array ? [...row] : row))),
    32 * 1024 * 1024,
    32,
  );
async function refuses(run: () => unknown | Promise<unknown>, code: string, message?: string) {
  let caught: unknown;
  try {
    await run();
  } catch (error) {
    caught = error;
  }
  assert(
    caught instanceof AtseqError && caught.code === code && (!message || caught.message === message),
    'Unexpected refusal: ' + String(caught),
  );
  return caught;
}
export async function nativePrefixPreservedCorpus(fixture: PreservedFixture) {
  const cases: string[] = [],
    work: unknown[] = [];
  const anchor = await NativeAnchor.from(fixture.genesis, { app: fixture.genesis.app, genesis: fixture.genesisCid });
  const evidence = {
    assuranceClass: 'plc-audit-v1' as const,
    auditBytes: new Uint8Array(fixture.identity.auditBytes),
    selectedTipCid: fixture.identity.selectedTipCid,
  };
  const blocks = new Map(fixture.content.map(([cid, raw]) => [cid, new Uint8Array(raw)]));
  let contentReads = 0;
  const reader = {
    async get(cid: string) {
      contentReads++;
      const raw = blocks.get(cid);
      assert(raw, 'Missing producer content');
      return new Uint8Array(raw);
    },
  };
  async function repo(name: string) {
    return authenticateRepo({
      carBytes: new Uint8Array(fixture.roots[name]!),
      expectedDid: fixture.genesis.app,
      trustedSigningKeyDid: fixture.key,
    });
  }
  async function publication(name: string) {
    return { anchor, reader, appIdentity: { before: evidence, after: evidence }, appRepo: await repo(name) };
  }
  async function open(name: string) {
    return openNativePrefix(await publication(name));
  }
  async function check(name: string, run: () => unknown | Promise<unknown>) {
    await run();
    cases.push(name);
  }
  async function inventory(prefix: NativePrefix) {
    const count = nativePrefixStatus(prefix).head.position;
    return exact({
      status: nativePrefixStatus(prefix),
      identities: nativePrefixInventory(prefix),
      entries: Array.from({ length: count }, (_, n) => ({
        entry: nativePrefixEntry(prefix, n + 1).row,
        provenance: nativePrefixProvenance(prefix, n + 1),
      })),
      receipt: count ? await lookupNativeRetry(prefix, fixture.original) : null,
    });
  }
  async function measured(prefix: NativePrefix, selected: AuthenticatedRepo) {
    const paths: string[] = [],
      originalWalk = NodeWalker.prototype.findRpath,
      originalVerify = P256PublicKey.prototype.verify;
    const reads = contentReads;
    let cryptoChecks = 0;
    NodeWalker.prototype.findRpath = async function (path) {
      paths.push(path);
      return originalWalk.call(this, path);
    };
    P256PublicKey.prototype.verify = async function (...args) {
      cryptoChecks++;
      return originalVerify.apply(this, args);
    };
    try {
      const result = await assertNativePrefixPreserved(prefix, selected);
      assert(result === undefined, 'Audit returned authority DATA');
    } finally {
      NodeWalker.prototype.findRpath = originalWalk;
      P256PublicKey.prototype.verify = originalVerify;
    }
    assert(cryptoChecks === 0 && contentReads === reads, 'Audit ran actor/identity crypto or content reader');
    return { paths, cryptoChecks, contentReads: contentReads - reads };
  }
  const zero = await open('0');
  await check('zero-genesis-has-no-invented-entry-or-effects', async () => {
    const before = await inventory(zero),
      result = await measured(zero, await repo('0'));
    assert(exact(result.paths) === exact([nativeGenesisPath(anchor.cid), nativeHeadPath(anchor.cid)]));
    assert((await inventory(zero)) === before);
    work.push({ kind: 'zero', ...result });
  });
  await check('cloned-or-asserted-DATA-and-fake-repository-cannot-enter-private-owner', async () => {
    const selected = await repo('4');
    for (const fake of [
      {},
      structuredClone(zero),
      Object.create(zero),
      { ...nativePrefixStatus(zero), origin: { kind: 'native-publication' } },
    ])
      await refuses(() => assertNativePrefixPreserved(fake as NativePrefix, selected), 'envelope');
    await refuses(() => assertNativePrefixPreserved(zero, { ...selected } as AuthenticatedRepo), 'input');
    const foreign = await authenticateRepo({
      carBytes: new Uint8Array(fixture.foreign.car),
      expectedDid: fixture.foreign.did,
      trustedSigningKeyDid: fixture.foreign.key,
    });
    await refuses(() => assertNativePrefixPreserved(zero, foreign), 'envelope');
  });
  const old = await open('1'),
    current = acceptNativePrefix(old, await stageNativePrefix(old, await publication('2')));
  await check('old-view-audits-current-boundary-and-all-retained-interiors', async () => {
    const before = await inventory(current),
      oldBefore = await inventory(old),
      result = await measured(old, await repo('4'));
    assert(
      exact(result.paths) ===
        exact([
          nativeGenesisPath(anchor.cid),
          nativeHeadPath(anchor.cid),
          nativeEntryPath(anchor.cid, 2),
          nativeEntryPath(anchor.cid, 1),
        ]),
    );
    assert((await inventory(current)) === before && (await inventory(old)) === oldBefore);
    work.push({ kind: 'current-not-old', ...result });
  });
  await check('current-known-boundary-cannot-be-lowered-through-old-view', async () => {
    const lower = await repo('1');
    await refuses(() => assertNativePrefixPreserved(old, lower), 'envelope');
  });
  // Capture a higher fully verified extension and deliberately leave it unaccepted.
  await stageNativePrefix(current, await publication('3'));
  await check('higher-discarded-floor-is-required-without-installing-rows', async () => {
    const before = await inventory(current),
      result = await measured(old, await repo('4'));
    assert(
      exact(result.paths) ===
        exact([
          nativeGenesisPath(anchor.cid),
          nativeHeadPath(anchor.cid),
          nativeEntryPath(anchor.cid, 2),
          nativeEntryPath(anchor.cid, 3),
          nativeEntryPath(anchor.cid, 1),
        ]),
    );
    assert((await inventory(current)) === before && nativePrefixStatus(current).head.position === 2);
    work.push({ kind: 'higher-unaccepted', ...result });
    const lower = await repo('2');
    await refuses(() => assertNativePrefixPreserved(old, lower), 'envelope');
  });
  await check('unrelated-large-unavailable-suffix-is-not-inspected', async () => {
    const before = await inventory(current),
      result = await measured(old, await repo('unrelated-suffix'));
    assert(result.paths.length === 5 && result.paths.every((path) => path !== nativeEntryPath(anchor.cid, 5)));
    assert((await inventory(current)) === before);
    work.push({ kind: 'unrelated-suffix', ...result });
    // A successful audit did not raise the floor to the selected 100001 head.
    await stageNativePrefix(current, await publication('3'));
  });
  await check('genuine-unavailable-authority-descriptor-does-not-block-negative-audit', async () => {
    const known = await open('4'),
      selected = await repo('unrelated-descriptor');
    const before = await inventory(known),
      result = await measured(known, selected);
    assert(result.paths.length === 6 && (await inventory(known)) === before);
    work.push({ kind: 'unavailable-descriptor', ...result });
    const input = await publication('unrelated-descriptor');
    await refuses(
      () => stageNativePrefix(known, input),
      'content_unavailable',
      'Required native prefix proof block is missing',
    );
    assert((await inventory(known)) === before);
  });
  for (const name of ['absent-genesis', 'absent-head', 'absent-interior', 'absent-boundary', 'absent-floor'])
    await check(name + '-is-invalid-and-inventory-unchanged', async () => {
      const before = await inventory(current),
        selected = await repo(name);
      await refuses(() => assertNativePrefixPreserved(old, selected), 'envelope');
      assert((await inventory(current)) === before);
    });
  for (const name of ['changed-genesis', 'changed-interior', 'changed-boundary', 'changed-floor'])
    await check(name + '-preserves-P1-invalid-CID-mismatch', async () => {
      const before = await inventory(current),
        selected = await repo(name);
      await refuses(
        () => assertNativePrefixPreserved(old, selected),
        'input',
        'Record CID differs from expected record',
      );
      assert((await inventory(current)) === before);
    });
  for (const name of ['wrong-head-scope', 'changed-head-at-floor'])
    await check(name + '-is-invalid', async () => {
      const selected = await repo(name);
      await refuses(
        () => assertNativePrefixPreserved(old, selected),
        name === 'wrong-head-scope' ? 'target' : 'envelope',
      );
    });
  for (const name of ['missing-genesis', 'missing-head', 'missing-interior', 'missing-boundary', 'missing-floor'])
    await check(name + '-is-unavailable-and-inventory-unchanged', async () => {
      const before = await inventory(current),
        selected = await repo(name);
      await refuses(
        () => assertNativePrefixPreserved(old, selected),
        'content_unavailable',
        'Required native prefix proof block is missing',
      );
      assert((await inventory(current)) === before);
    });
  await check('accepted-equals-floor-deduplicates-boundary', async () => {
    const prefix = await open('2'),
      result = await measured(prefix, await repo('4'));
    assert(result.paths.length === 4);
    work.push({ kind: 'deduplicated', ...result });
  });
  async function concurrent(
    change: (prefix: NativePrefix) => Promise<NativePrefix | void> | NativePrefix | void,
    poisoned = false,
  ) {
    const prefix = await open('1'),
      selected = await repo('4');
    const original = NodeWalker.prototype.findRpath;
    let entered!: () => void,
      release!: () => void,
      held = false;
    const started = new Promise<void>((resolve) => {
        entered = resolve;
      }),
      barrier = new Promise<void>((resolve) => {
        release = resolve;
      });
    NodeWalker.prototype.findRpath = async function (path) {
      if (!held && path === nativeGenesisPath(anchor.cid)) {
        held = true;
        entered();
        await barrier;
      }
      return original.call(this, path);
    };
    const pending = assertNativePrefixPreserved(prefix, selected);
    try {
      await started;
      const changed = await change(prefix),
        remaining = changed ?? prefix;
      const before = await inventory(remaining);
      release();
      await refuses(
        () => pending,
        'envelope',
        poisoned
          ? 'Native prefix has exposed contradictory interpretation evidence'
          : 'Native prefix knowledge changed while checking preservation',
      );
      assert((await inventory(remaining)) === before, 'Audit mutated concurrent owner after refusal');
    } finally {
      release();
      NodeWalker.prototype.findRpath = original;
    }
  }
  await check('concurrent-higher-discarded-floor-withholds-completion', async () => {
    await concurrent(async (prefix) => {
      await stageNativePrefix(prefix, await publication('3'));
    });
  });
  await check('concurrent-current-acceptance-withholds-completion', async () => {
    await concurrent(async (prefix) => {
      return acceptNativePrefix(prefix, await stageNativePrefix(prefix, await publication('2')));
    });
  });
  await check('concurrent-current-contradiction-withholds-completion', async () => {
    await concurrent((prefix) => contradictNativePrefix(prefix, 1, 'envelope'), true);
  });
  await check('concurrent-pending-fault-withholds-completion', async () => {
    await concurrent(async (prefix) => {
      const extension = await stageNativePrefix(prefix, await publication('2'));
      contradictNativePrefix(nativePrefixCandidate(extension), 2, 'envelope');
    }, true);
  });
  await check('concurrent-same-head-new-current-view-is-stale', async () => {
    await concurrent(async (prefix) =>
      acceptNativePrefix(prefix, await stageNativePrefix(prefix, await publication('1'))),
    );
  });
  await check('failed-audits-do-not-raise-the-observed-floor', async () => {
    await stageNativePrefix(current, await publication('3'));
  });
  await check('genuine-walker-runtime-fault-keeps-identity-and-no-effects', async () => {
    const prefix = await open('2'),
      selected = await repo('4'),
      before = await inventory(prefix);
    const original = NodeWalker.prototype.findRpath,
      marker = new Error('Owned test runtime fault');
    NodeWalker.prototype.findRpath = async function () {
      throw marker;
    };
    let caught: unknown;
    try {
      await assertNativePrefixPreserved(prefix, selected);
    } catch (error) {
      caught = error;
    } finally {
      NodeWalker.prototype.findRpath = original;
    }
    assert(caught === marker && (await inventory(prefix)) === before, 'Runtime fault changed identity or prefix');
  });
  await check('existing-poison-is-not-cleared-or-reconciled', async () => {
    const prefix = await open('1');
    contradictNativePrefix(prefix, 1, 'envelope');
    const before = await inventory(prefix),
      selected = await repo('4');
    await refuses(() => assertNativePrefixPreserved(prefix, selected), 'envelope');
    assert((await inventory(prefix)) === before);
    const next = await publication('2');
    await refuses(() => stageNativePrefix(prefix, next), 'envelope');
  });
  return { cases, work };
}
