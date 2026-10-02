import test from 'node:test';
import assert from 'node:assert/strict';
import * as CBOR from '@atcute/cbor';
import * as CID from '@atcute/cid';
import * as CAR from '@atcute/car';
import { signOperation } from '@atcute/did-plc';
import { NativeObserver } from '../src/host/native-observer.ts';
import { NativeObserverCar } from '../src/protocol/native-observer-car.ts';
import { nativeAuthoritySnapshot } from '../src/application/native-authority.ts';
import { nativeRef } from '../src/protocol/native-schema.ts';
import { link } from '../src/protocol/wire.ts';
import { AuthorityHarness, authorityRepo } from './support/native-authority-fixture.ts';
import { ObserverNetwork } from './support/native-observer-fixture.ts';

async function fixture() {
  const h = await AuthorityHarness.create(),
    epoch = await h.epoch(1),
    grant = await h.grant(1, epoch);
  const observer = await NativeObserver.fromAnchor(h.anchor, h.reader()),
    network = new ObserverNetwork(h);
  await network.init();
  const prior = nativeAuthoritySnapshot(h.state);
  const prep = await observer.prepareAccount(h.state, {
    $type: nativeRef('accountOperation'),
    app: prior.app,
    genesis: link(prior.genesis),
    position: 1,
    prev: link(prior.frontier.entry),
    principal: h.actor.principal,
    ...h.expectations(),
    operation: { $type: nativeRef('admitGrant'), grant },
  });
  return { h, observer, network, prep };
}

test('caller cancellation during final proof construction prevents account and app capture', async () => {
  for (const kind of ['account', 'app'] as const) {
    const { h, observer, network, prep } = await fixture(),
      controller = new AbortController();
    const original = NativeObserverCar.prototype.bytes;
    let finalConstructionReached = false;
    NativeObserverCar.prototype.bytes = async function () {
      if (network.methods >= 2) {
        finalConstructionReached = true;
        controller.abort();
      }
      return original.call(this);
    };
    try {
      await network.run(() =>
        assert.rejects(
          () =>
            kind === 'account'
              ? observer.observePrepared(prep, { signal: controller.signal })
              : observer.observeApp(undefined, { signal: controller.signal }),
          { code: 'content_unavailable' },
        ),
      );
      assert.equal(finalConstructionReached, true);
      assert.equal(controller.signal.aborted, true);
      assert.equal(nativeAuthoritySnapshot(h.state).frontier.position, 0);
    } finally {
      NativeObserverCar.prototype.bytes = original;
    }
  }
});

test('the actual existing 30-second reservation expires during final evidence construction', async () => {
  const { h, observer, network, prep } = await fixture();
  const original = NativeObserverCar.prototype.bytes;
  let finalConstructionReached = false;
  NativeObserverCar.prototype.bytes = async function () {
    if (network.methods >= 2 && !finalConstructionReached) {
      finalConstructionReached = true;
      // Delay the existing final proof serialization seam. The production
      // timeout is unchanged, and the event loop lets its real signal expire.
      await new Promise((resolve) => setTimeout(resolve, 30_100));
    }
    return original.call(this);
  };
  const started = performance.now();
  try {
    await network.run(() => assert.rejects(() => observer.observePrepared(prep), { code: 'content_unavailable' }));
    assert.equal(finalConstructionReached, true);
    assert.ok(performance.now() - started >= 30_000);
    assert.equal(nativeAuthoritySnapshot(h.state).frontier.position, 0);
    console.log(
      JSON.stringify({
        actualReservationMilliseconds: 30_000,
        delayPhase: 'final proof construction after both method reads',
        elapsedMilliseconds: performance.now() - started,
        node: process.version,
        captureCreated: false,
        timeoutReplaced: false,
      }),
    );
  } finally {
    NativeObserverCar.prototype.bytes = original;
  }
});

test('complete binding-change retries share the cumulative 32 MiB response reservation', async () => {
  const { h, observer, network, prep } = await fixture();
  for (let n = 0; n < 16; n++)
    h.accountRecords.set('ai.generalbusiness.atseq.bulk/' + n, CBOR.encode({ n, padding: 'x'.repeat(950_000) }));
  network.selected = await authorityRepo(h.actor.principal, h.actor.key, h.accountRecords, 2);
  network.all = new Map(
    [...CAR.fromUint8Array(network.selected.car)].map((block) => [
      CID.toString(block.cid),
      new Uint8Array(block.bytes),
    ]),
  );
  network.sparse = false;
  assert.ok(network.selected.car.length > 14 * 1024 * 1024 && network.selected.car.length < 16 * 1024 * 1024);
  const rows = [...h.actor.rows];
  for (let n = 0; n < 4; n++) {
    const operation = await signOperation(
      { ...h.actor.unsigned, prev: rows.at(-1)!.cid, alsoKnownAs: ['at://rotate-' + n + '.example'] },
      h.actor.key,
    );
    rows.push({
      did: h.actor.principal as `did:plc:${string}`,
      operation,
      cid: CID.toString(CID.createSync(CID.CODEC_DCBOR, CBOR.encode(operation))),
      createdAt: '2026-10-01T00:0' + (n + 2) + ':00.000Z',
      nullified: false,
    });
  }
  const original = network.fetch.bind(network);
  network.fetch = async (input) => {
    if (!input.pathname.startsWith('/xrpc/')) {
      network.methods++;
      network.calls.push({ endpoint: input.pathname.split('/').at(-1)!, cids: [], url: input.href });
      return new Response(JSON.stringify(rows.slice(0, Math.min(rows.length, network.methods + 1))));
    }
    return original(input);
  };
  await network.run(() => assert.rejects(() => observer.observePrepared(prep), { code: 'content_unavailable' }));
  assert.equal(network.records, 3);
  assert.equal(network.repos, 0);
  assert.equal(network.methods, 5);
  assert.equal(nativeAuthoritySnapshot(h.state).frontier.position, 0);
  console.log(
    JSON.stringify({
      sharedCumulativeBytes: 32 * 1024 * 1024,
      oneSignedProofBytes: network.selected.car.length,
      recordDispatches: network.records,
      methodDispatches: network.methods,
      finalCapture: false,
      perRetryBudgetReset: false,
    }),
  );
});
