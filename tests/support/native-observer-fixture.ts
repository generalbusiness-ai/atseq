/** Signed public method/repository fixtures; only HTTP delivery is simulated. */
import assert from 'node:assert/strict';
import * as CAR from '@atcute/car';
import * as CID from '@atcute/cid';
import * as CBOR from '@atcute/cbor';
import { signOperation } from '@atcute/did-plc';
import { P256PrivateKeyExportable } from '@atcute/crypto';
import { AtseqError } from '../../src/core/errors.ts';
import { IdentityFetch } from '../../src/host/identity-fetch.ts';
import { NativeObserver, type NativeObservationCapture } from '../../src/host/native-observer.ts';
import { nativeAuthoritySnapshot, openNativeAuthority } from '../../src/application/native-authority.ts';
import { authenticateRepo } from '../../src/protocol/native-proof.ts';
import { NATIVE_NSID, nativeRef } from '../../src/protocol/native-schema.ts';
import {
  NativeAnchor,
  nativeGenesisPath,
  nativeEntryPath,
  signNativeIntent,
  type NativeAccountOperation,
  type NativeIntent,
} from '../../src/protocol/native-wire.ts';
import { contentCid, encodeBlock, decodeBlock, link } from '../../src/protocol/wire.ts';
import {
  AuthorityHarness,
  authorityRepo,
  epochId,
  grantId,
  type AuthorityPublicFixture,
} from './native-authority-fixture.ts';
import { car } from './native-proof-corpus.ts';

function blocks(raw: Uint8Array) {
  return new Map([...CAR.fromUint8Array(raw)].map((block) => [CID.toString(block.cid), new Uint8Array(block.bytes)]));
}
const json = (value: unknown) => new TextEncoder().encode(JSON.stringify(value));
export class ObserverNetwork {
  calls: { endpoint: string; cids: string[]; url: string }[] = [];
  methods = 0;
  records = 0;
  repos = 0;
  revision = 0;
  roots: string[] = [];
  sparse = true;
  recordUnavailable = false;
  blocksUnavailable = false;
  omitBlock = false;
  extraBlock = false;
  afterUnavailable = false;
  afterInvalid = false;
  rotateTip = false;
  truncatedAudit = false;
  pruneEveryRoot = false;
  selected!: Awaited<ReturnType<typeof authorityRepo>>;
  all!: Map<string, Uint8Array>;
  next!: Awaited<ReturnType<typeof authorityRepo>>;
  nextAll!: Map<string, Uint8Array>;
  rotatedRows: unknown[] = [];
  constructor(readonly h: AuthorityHarness) {}
  async init() {
    this.selected = await authorityRepo(
      this.h.actor.principal,
      this.h.actor.key,
      this.h.accountRecords,
      ++this.revision,
    );
    this.all = blocks(this.selected.car);
    this.next = await authorityRepo(this.h.actor.principal, this.h.actor.key, this.h.accountRecords, this.revision + 1);
    this.nextAll = blocks(this.next.car);
    const operation = await signOperation(
      { ...this.h.actor.unsigned, prev: this.h.actor.selectedTipCid, alsoKnownAs: ['at://third.example'] },
      this.h.actor.key,
    );
    this.rotatedRows = [
      ...this.h.actor.rows,
      {
        did: this.h.actor.principal,
        operation,
        cid: CID.toString(CID.createSync(CID.CODEC_DCBOR, CBOR.encode(operation))),
        createdAt: '2026-10-01T00:02:00.000Z',
        nullified: false,
      },
    ];
  }
  async fetch(input: URL): Promise<Response> {
    const endpoint = input.pathname.split('/').at(-1)!;
    const cids = input.searchParams.getAll('cids[]');
    this.calls.push({ endpoint, cids, url: input.href });
    if (!input.pathname.startsWith('/xrpc/')) {
      this.methods++;
      if (this.methods % 2 === 0 && this.afterUnavailable) return new Response(null, { status: 503 });
      if (this.methods % 2 === 0 && this.afterInvalid) return new Response('{');
      if (this.h.app.principal === 'did:web:' + input.hostname)
        return new Response(
          json({
            id: this.h.app.principal,
            verificationMethod: [
              {
                id: '#atproto',
                type: 'Multikey',
                controller: this.h.app.principal,
                publicKeyMultibase: this.h.app.signing.slice('did:key:'.length),
              },
            ],
            service: [
              { id: '#atproto_pds', type: 'AtprotoPersonalDataServer', serviceEndpoint: 'https://pds.example' },
            ],
          }),
        );
      if (input.pathname.includes(this.h.app.principal)) return new Response(json(this.h.app.rows));
      if (this.h.actor.principal.startsWith('did:web:'))
        return new Response(
          json({
            id: this.h.actor.principal,
            verificationMethod: [
              {
                id: '#atproto',
                type: 'Multikey',
                controller: this.h.actor.principal,
                publicKeyMultibase: this.h.actor.signing.slice('did:key:'.length),
              },
            ],
            service: [
              { id: '#atproto_pds', type: 'AtprotoPersonalDataServer', serviceEndpoint: 'https://pds.example' },
            ],
          }),
        );
      return new Response(
        json(
          this.truncatedAudit
            ? this.h.actor.rows.slice(0, 1)
            : this.rotateTip && this.methods >= 2
              ? this.rotatedRows
              : this.h.actor.rows,
        ),
      );
    }
    if (input.searchParams.get('did') === this.h.app.principal) {
      const app = await authorityRepo(
        this.h.app.principal,
        this.h.app.key,
        this.h.appRecords,
        this.h.vectors.length + 1,
      );
      const appBlocks = blocks(app.car);
      if (endpoint === 'com.atproto.sync.getBlocks')
        return new Response(await car(app.root, new Map(cids.map((cid) => [cid, appBlocks.get(cid)!])), this.roots));
      if (endpoint === 'com.atproto.sync.getRecord' && this.sparse)
        return new Response(await car(app.root, new Map([[app.root, appBlocks.get(app.root)!]])));
      return new Response(app.car);
    }
    if (endpoint === 'com.atproto.sync.getRecord') {
      this.records++;
      if (this.recordUnavailable) return new Response(null, { status: 404 });
      if (this.pruneEveryRoot) {
        this.selected = await authorityRepo(
          this.h.actor.principal,
          this.h.actor.key,
          this.h.accountRecords,
          this.records * 2,
        );
        this.all = blocks(this.selected.car);
      }
      return new Response(
        this.sparse
          ? await car(this.selected.root, new Map([[this.selected.root, this.all.get(this.selected.root)!]]))
          : this.selected.car,
      );
    }
    if (endpoint === 'com.atproto.sync.getBlocks') {
      if (this.blocksUnavailable || this.pruneEveryRoot) return new Response(null, { status: 404 });
      const returned = new Map(
        cids.filter((_, index) => !this.omitBlock || index !== 0).map((cid) => [cid, this.all.get(cid)!]),
      );
      if (this.extraBlock) returned.set(this.selected.root, this.all.get(this.selected.root)!);
      return new Response(await car(this.selected.root, returned, this.roots));
    }
    if (endpoint === 'com.atproto.sync.getRepo') {
      this.repos++;
      if (this.pruneEveryRoot)
        return new Response(
          (await authorityRepo(this.h.actor.principal, this.h.actor.key, this.h.accountRecords, this.records * 2 + 1))
            .car,
        );
      return new Response(this.selected.car);
    }
    throw new Error('Unexpected fixture endpoint: ' + input.href);
  }
  async run<T>(body: () => Promise<T>): Promise<T> {
    const original = IdentityFetch.prototype.bytesFrom,
      network = this;
    IdentityFetch.prototype.bytesFrom = async function (url, maximumBytes, signal) {
      (this as unknown as { fetch: (url: URL) => Promise<Response> }).fetch = (input) => network.fetch(input);
      return original.call(this, url, maximumBytes, signal);
    };
    try {
      return await body();
    } finally {
      IdentityFetch.prototype.bytesFrom = original;
    }
  }
}
function subject(h: AuthorityHarness, operation: NativeAccountOperation['operation']) {
  const prior = nativeAuthoritySnapshot(h.state);
  return {
    $type: nativeRef('accountOperation'),
    app: prior.app,
    genesis: link(prior.genesis),
    position: prior.frontier.position + 1,
    prev: link(prior.frontier.entry),
    principal: h.actor.principal,
    ...h.expectations(),
    operation,
  };
}
async function captured(
  observer: NativeObserver,
  result: Awaited<ReturnType<NativeObserver['observePrepared']>>,
): Promise<NativeObservationCapture> {
  assert.equal(result.kind, 'captured');
  if (result.kind !== 'captured') throw new Error('Expected capture');
  return result.capture;
}
async function handoff(h: AuthorityHarness, observer: NativeObserver, capture: NativeObservationCapture) {
  const data = observer.readCapture(capture);
  for (const [cid, raw] of data.blocks) {
    h.content.set(cid, raw);
    h.appRecords.set(NATIVE_NSID.content + '/' + cid, raw);
  }
  assert.ok(data.completed);
  return data.completed;
}

export async function nativeObserverHostCorpus() {
  const cases: string[] = [],
    fixtures: AuthorityPublicFixture[] = [],
    appCaptures: object[] = [];
  for (const curve of ['p256', 'secp256k1'] as const)
    for (const method of ['plc', 'web'] as const) {
      const h = await AuthorityHarness.create(curve, method),
        epoch = await h.epoch(1),
        grant = await h.grant(1, epoch);
      const observer = await NativeObserver.fromAnchor(h.anchor, h.reader()),
        network = new ObserverNetwork(h);
      await network.init();
      network.roots = [network.next.root, h.anchor.cid];
      const prior = h.state,
        prep = await observer.prepareAccount(prior, subject(h, { $type: nativeRef('admitGrant'), grant }));
      const capture = await network.run(async () =>
        captured(observer, await observer.observePrepared(prep, { observedAt: '2026-10-02T00:00:00.000Z' })),
      );
      observer.assertCapturePrior(capture, prior);
      const first = observer.readCapture(capture),
        copy = observer.readCapture(capture);
      assert.equal(first.assuranceClass, method === 'plc' ? 'plc-audit-v1' : 'web-observation-v1');
      first.blocks.values().next().value!.fill(0);
      first.blocks.clear();
      first.completed = null;
      assert.deepEqual(observer.readCapture(capture), copy);
      assert.throws(() => observer.readCapture({} as NativeObservationCapture), { code: 'envelope' });
      assert.throws(() => observer.readCapture(structuredClone(capture)), { code: 'envelope' });
      assert.ok(network.calls.some((call) => call.endpoint.endsWith('getBlocks') && call.cids.length > 1));
      assert.ok(
        network.calls
          .filter((call) => call.endpoint.endsWith('getBlocks'))
          .every((call) => call.cids.length > 0 && call.cids.length <= 64),
      );
      const count = network.calls.length;
      await h.append(
        curve + '/' + method + '/observed grant',
        (await handoff(h, observer, capture)) as NativeAccountOperation,
        { decision: 'effective' },
      );
      assert.equal(network.calls.length, count); // Entire retained interpretation reads no network.
      assert.throws(() => observer.assertCapturePrior(capture, h.state), { code: 'envelope' });
      assert.throws(() => observer.assertCapturePrior(capture, nativeAuthoritySnapshot(h.state) as any), {
        code: 'envelope',
      });
      const app = await network.run(async () =>
        captured(observer, await observer.observeApp(decodeBlock(new Uint8Array(h.vectors[0]!.entry)))),
      );
      const appData = observer.readCapture(app);
      assert.equal(appData.kind, 'app');
      assert.equal(appData.completed, null);
      appCaptures.push({
        genesis: h.anchor.genesis,
        genesisCid: h.anchor.cid,
        entry: h.vectors[0]!.entry,
        data: { ...appData, blocks: [...appData.blocks].map(([cid, raw]) => [cid, [...raw]]) },
      });
      cases.push(curve + '/' + method + '/signed sparse capture, ownership, offline I2 handoff and app publication');
      fixtures.push(h.publicFixture());
    }
  async function fixture() {
    const h = await AuthorityHarness.create(),
      epoch = await h.epoch(1),
      grant = await h.grant(1, epoch);
    const observer = await NativeObserver.fromAnchor(h.anchor, h.reader()),
      network = new ObserverNetwork(h);
    await network.init();
    return { h, epoch, grant, observer, network };
  }
  for (const name of [
    'stable pointer mismatch',
    'D3-1 target absent',
    'D3-1 target replaced',
    'D3-2 advance unpublished',
    'after method unavailable',
    'after method invalid',
  ]) {
    const { h, epoch, observer, network } = await fixture();
    if (name === 'D3-2 advance unpublished') {
      const initial = await observer.prepareAccount(
        h.state,
        subject(h, { $type: nativeRef('admitGrant'), grant: await h.grant(1, epoch) }),
      );
      const admitted = await network.run(async () => captured(observer, await observer.observePrepared(initial)));
      await h.append(
        'establish prior epoch before unpublished advance',
        (await handoff(h, observer, admitted)) as NativeAccountOperation,
        { decision: 'effective' },
      );
      network.calls = [];
      network.methods = 0;
      network.records = 0;
    }
    const wanted = await contentCid({ $type: NATIVE_NSID.epoch, version: 1, id: epochId(9), previous: link(epoch) });
    const prep = await observer.prepareAccount(
      h.state,
      subject(h, { $type: nativeRef('advanceEpoch'), epoch: link(wanted) }),
    );
    if (name === 'D3-1 target replaced')
      h.accountRecords.set(
        NATIVE_NSID.epoch + '/' + wanted,
        encodeBlock({ $type: NATIVE_NSID.epoch, version: 1, id: epochId(8), previous: link(epoch) }),
      );
    await network.init();
    if (name === 'D3-1 target absent' || name === 'D3-1 target replaced') {
      const truth = await authenticateRepo({
        carBytes: network.selected.car,
        expectedDid: h.actor.principal,
        trustedSigningKeyDid: h.actor.signing,
      });
      const target = await truth.lookup(NATIVE_NSID.epoch + '/' + wanted);
      assert.equal(target.kind, name === 'D3-1 target absent' ? 'absent' : 'found');
      if (target.kind === 'found') assert.notEqual(target.cid, wanted);
    }
    network.afterUnavailable = name === 'after method unavailable';
    network.afterInvalid = name === 'after method invalid';
    await network.run(() =>
      assert.rejects(() => observer.observePrepared(prep), {
        code: network.afterUnavailable ? 'content_unavailable' : network.afterInvalid ? 'input' : 'envelope',
      }),
    );
    assert.equal(network.records, 1);
    assert.equal(network.methods, 2);
    assert.equal(nativeAuthoritySnapshot(h.state).frontier.position, name === 'D3-2 advance unpublished' ? 1 : 0);
    cases.push(name + ': stable pointer checked before target and no capture/retarget/nonce consumption');
    if (name === 'D3-2 advance unpublished') {
      await h.account(NATIVE_NSID.epoch, wanted, {
        $type: NATIVE_NSID.epoch,
        version: 1,
        id: epochId(9),
        previous: link(epoch),
      });
      await h.account(NATIVE_NSID.epochCurrent, 'self', {
        $type: NATIVE_NSID.epochCurrent,
        version: 1,
        id: epochId(9),
        epoch: link(wanted),
      });
      await network.init();
      const fresh = await observer.prepareAccount(
        h.state,
        subject(h, { $type: nativeRef('advanceEpoch'), epoch: link(wanted) }),
      );
      const result = await network.run(async () => captured(observer, await observer.observePrepared(fresh)));
      await h.append(
        'publish transition then explicitly prepare and accept advance',
        (await handoff(h, observer, result)) as NativeAccountOperation,
        { decision: 'effective' },
      );
      fixtures.push(h.publicFixture());
      cases.push('D3-2 explicit publication and new preparation succeeds; original refusal did not advance state');
    }
  }
  for (const name of [
    'rootless primary404 absent grant',
    'rootless primary404 pointer mismatch outranks absent target',
  ]) {
    const { h, grant, observer, network } = await fixture();
    if (name.endsWith('absent grant')) h.accountRecords.delete(NATIVE_NSID.grant + '/' + grant.id);
    await network.init();
    network.recordUnavailable = true;
    const operation = name.endsWith('absent grant')
      ? ({ $type: nativeRef('admitGrant'), grant } as const)
      : ({ $type: nativeRef('advanceEpoch'), epoch: link(await contentCid({ absentTarget: true })) } as const);
    const prep = await observer.prepareAccount(h.state, subject(h, operation));
    if (name.endsWith('absent grant')) {
      const result = await network.run(() => observer.observePrepared(prep));
      assert.equal(result.kind, 'refused');
      if (result.kind === 'refused') assert.equal(result.refusal.code, 'subject_absent');
    } else await network.run(() => assert.rejects(() => observer.observePrepared(prep), { code: 'envelope' }));
    assert.equal(network.repos, 1);
    assert.equal(network.methods, 2);
    cases.push(name + ': authenticated full export, never 404 as absence proof');
  }
  for (const name of ['grant absent', 'grant replaced', 'pointer absent']) {
    const { h, grant, observer, network } = await fixture();
    if (name === 'grant absent') h.accountRecords.delete(NATIVE_NSID.grant + '/' + grant.id);
    if (name === 'grant replaced') await h.grant(1, await h.epoch(2), ['member', 'other']);
    if (name === 'pointer absent') h.accountRecords.delete(NATIVE_NSID.epochCurrent + '/self');
    await network.init();
    const prep = await observer.prepareAccount(h.state, subject(h, { $type: nativeRef('admitGrant'), grant }));
    const result = await network.run(() => observer.observePrepared(prep));
    assert.equal(result.kind, 'refused');
    if (result.kind !== 'refused') throw new Error('Expected stable subject refusal');
    assert.equal(result.refusal.code, name === 'grant replaced' ? 'subject_replaced' : 'subject_absent');
    assert.equal(network.methods, 2);
    assert.equal(network.records, 1);
    assert.ok(Object.isFrozen(result.refusal));
    cases.push(name + ': one stable after-method observation and no automatic retry');
  }
  for (const name of [
    'primary404 full export',
    'blocks404 same-root full export',
    'omitted block full export',
    'extra block refused',
    'PLC unchanged-key tip restart',
    'busy pruning bounded',
  ]) {
    const { h, grant, observer, network } = await fixture();
    const prep = await observer.prepareAccount(h.state, subject(h, { $type: nativeRef('admitGrant'), grant }));
    network.recordUnavailable = name === 'primary404 full export';
    network.blocksUnavailable = name === 'blocks404 same-root full export';
    network.omitBlock = name === 'omitted block full export';
    network.extraBlock = name === 'extra block refused';
    network.rotateTip = name === 'PLC unchanged-key tip restart';
    network.pruneEveryRoot = name === 'busy pruning bounded';
    if (network.extraBlock || network.pruneEveryRoot)
      await network.run(() =>
        assert.rejects(() => observer.observePrepared(prep), {
          code: network.extraBlock ? 'input' : 'content_unavailable',
        }),
      );
    else await network.run(async () => captured(observer, await observer.observePrepared(prep)));
    if (network.rotateTip) {
      assert.equal(network.records, 2);
      assert.equal(network.methods, 4);
    }
    if (network.pruneEveryRoot) {
      assert.equal(network.records, 3);
      assert.equal(network.repos, 3);
    }
    if (network.recordUnavailable || network.blocksUnavailable || network.omitBlock) assert.equal(network.repos, 1);
    cases.push(name);
  }
  {
    const { h, grant, observer, network } = await fixture();
    h.accountRecords.delete(NATIVE_NSID.grant + '/' + grant.id);
    await network.init();
    network.rotateTip = true;
    const prep = await observer.prepareAccount(h.state, subject(h, { $type: nativeRef('admitGrant'), grant }));
    const result = await network.run(() => observer.observePrepared(prep));
    assert.equal(result.kind, 'refused');
    assert.equal(network.records, 2);
    assert.equal(network.methods, 4);
    cases.push('PLC tip change discards pending absence; stable successor attempt refuses once');
  }
  {
    const { h, grant, observer, network } = await fixture();
    network.truncatedAudit = true;
    const prep = await observer.prepareAccount(h.state, subject(h, { $type: nativeRef('admitGrant'), grant }));
    await network.run(async () => captured(observer, await observer.observePrepared(prep)));
    cases.push('valid truncated authorized PLC history remains authentic without proving latestness');
  }
  {
    const { h, grant, observer, network } = await fixture();
    const newKey = await P256PrivateKeyExportable.createKeypair(),
      signing = await newKey.exportPublicKey('did');
    const operation = await signOperation(
      { ...h.actor.unsigned, prev: h.actor.selectedTipCid, verificationMethods: { atproto: signing } },
      h.actor.key,
    );
    const row = {
      did: h.actor.principal as `did:plc:${string}`,
      operation,
      cid: CID.toString(CID.createSync(CID.CODEC_DCBOR, CBOR.encode(operation))),
      createdAt: '2026-10-01T00:02:00.000Z',
      nullified: false,
    };
    h.actor.rows.push(row);
    network.selected = await authorityRepo(h.actor.principal, h.actor.key, h.accountRecords, 1_000_000);
    network.all = blocks(network.selected.car);
    const prep = await observer.prepareAccount(h.state, subject(h, { $type: nativeRef('admitGrant'), grant }));
    await network.run(() => assert.rejects(() => observer.observePrepared(prep), { code: 'input' }));
    assert.equal(network.methods, 2);
    assert.equal(network.records, 1);
    cases.push('genuine retired-key root with invented high revision cannot regain newly observed key authority');
  }
  {
    const { h, epoch, grant, observer, network } = await fixture();
    const newKey = await P256PrivateKeyExportable.createKeypair(),
      signing = await newKey.exportPublicKey('did');
    const operation = await signOperation(
      {
        ...h.actor.unsigned,
        prev: h.actor.selectedTipCid,
        verificationMethods: { atproto: signing },
        services: { atproto_pds: { type: 'AtprotoPersonalDataServer', endpoint: 'https://migrated-pds.example' } },
      },
      h.actor.key,
    );
    const row = {
      did: h.actor.principal as `did:plc:${string}`,
      operation,
      cid: CID.toString(CID.createSync(CID.CODEC_DCBOR, CBOR.encode(operation))),
      createdAt: '2026-10-01T00:02:00.000Z',
      nullified: false,
    };
    const rows = [...h.actor.rows, row];
    const target = await h.epoch(2, epoch),
      migrated = await authorityRepo(h.actor.principal, newKey, h.accountRecords, 3),
      migratedBlocks = blocks(migrated.car);
    const original = network.fetch.bind(network);
    network.fetch = async (input) => {
      if (!input.pathname.startsWith('/xrpc/')) {
        network.calls.push({ endpoint: input.pathname.split('/').at(-1)!, cids: [], url: input.href });
        network.methods++;
        if (network.methods >= 2) {
          network.selected = migrated;
          network.all = migratedBlocks;
          return new Response(json(rows));
        }
        return new Response(json(h.actor.rows));
      }
      return original(input);
    };
    const prep = await observer.prepareAccount(
      h.state,
      subject(h, { $type: nativeRef('advanceEpoch'), epoch: link(target) }),
    );
    const capture = await network.run(async () => captured(observer, await observer.observePrepared(prep)));
    assert.equal(observer.readCapture(capture).root, migrated.root);
    assert.equal(network.records, 2);
    assert.equal(network.methods, 4);
    const requests = network.calls.filter((call) => call.endpoint.endsWith('getRecord'));
    assert.ok(requests[0]!.url.startsWith('https://pds.example/'));
    assert.ok(requests[1]!.url.startsWith('https://migrated-pds.example/'));
    cases.push(
      'key/PDS rotation discards pending pointer mismatch and restarts with new target/root; no mixed proof or retargeting',
    );
  }
  {
    const { h, grant, observer, network } = await fixture();
    const fault = new AtseqError('dependency_mismatch', 'Fixture runtime integrity fault');
    const original = network.fetch.bind(network);
    network.fetch = async (input) => (input.pathname.startsWith('/xrpc/') ? Promise.reject(fault) : original(input));
    const prep = await observer.prepareAccount(h.state, subject(h, { $type: nativeRef('admitGrant'), grant }));
    await network.run(() =>
      assert.rejects(
        () => observer.observePrepared(prep),
        (error) => error === fault,
      ),
    );
    assert.equal(network.methods, 1);
    cases.push('unexpected integrity fault preserved without after-method retry or reclassification');
  }
  {
    const { h, grant, observer, network } = await fixture();
    const good = subject(h, { $type: nativeRef('admitGrant'), grant });
    await assert.rejects(() => observer.prepareAccount({} as any, good), { code: 'envelope' });
    await assert.rejects(() => observer.prepareAccount(h.state, { ...good, expectedEpoch: grant.cid }), {
      code: 'envelope',
    });
    await assert.rejects(() => observer.prepareAccount(h.state, { ...good, position: 2 }), { code: 'envelope' });
    await assert.rejects(() => observer.prepareAccount(h.state, { ...good, observation: link(h.anchor.cid) }), {
      code: 'envelope',
    });
    const prep = await observer.prepareAccount(h.state, good);
    const other = await NativeObserver.fromAnchor(h.anchor, h.reader());
    await assert.rejects(() => other.observePrepared(prep), { code: 'envelope' });
    await assert.rejects(() => observer.observePrepared({} as any), { code: 'envelope' });
    await assert.rejects(() => observer.observePrepared(structuredClone(prep)), { code: 'envelope' });
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(() => observer.observePrepared(prep, { signal: controller.signal }), {
      code: 'content_unavailable',
    });
    await assert.rejects(() => observer.observePrepared(prep, { observedAt: 'bad' }), { code: 'envelope' });
    assert.equal(network.calls.length, 0);
    cases.push(
      'forged/cross-owner preparation, wrong prior/frontier/floor, pre-cancellation and diagnostic validation before network',
    );
  }
  {
    const { h, epoch, grant, observer, network } = await fixture();
    async function observeAccount(operation: NativeAccountOperation['operation']) {
      await network.init();
      const prep = await observer.prepareAccount(h.state, subject(h, operation));
      const result = await network.run(() => observer.observePrepared(prep));
      return handoff(h, observer, await captured(observer, result)) as Promise<NativeAccountOperation>;
    }
    await h.append('initial authority for recovery', await observeAccount({ $type: nativeRef('admitGrant'), grant }), {
      decision: 'effective',
    });
    const fresh = await h.epoch(2, epoch),
      prior = nativeAuthoritySnapshot(h.state);
    const intent: NativeIntent = {
      $type: nativeRef('intent'),
      version: 2,
      app: prior.app,
      genesis: link(prior.genesis),
      principal: h.actor.principal,
      actorKey: await h.control.exportPublicKey('did'),
      nonce: epochId(91),
      operation: {
        $type: nativeRef('recoverParticipant'),
        target: h.actor.principal,
        position: prior.frontier.position + 1,
        prev: link(prior.frontier.entry),
        controlTip: link(prior.control.tip),
        ...h.expectations(),
        epoch: link(fresh),
        observation: link(h.anchor.cid),
      },
    };
    const omitted = structuredClone(intent) as any;
    delete omitted.operation.observation;
    const unappointed = structuredClone(omitted);
    unappointed.actorKey = await h.device.exportPublicKey('did');
    unappointed.nonce = epochId(90);
    const unappointedPrep = await observer.prepareRecovery(h.state, unappointed);
    await network.init();
    const unappointedCapture = await network.run(async () =>
      captured(observer, await observer.observePrepared(unappointedPrep)),
    );
    await h.append(
      'observer does not authorize recovery controller',
      await signNativeIntent(await handoff(h, observer, unappointedCapture), h.device),
      { decision: 'ineffective', reason: 'control_unappointed' },
    );
    const current = nativeAuthoritySnapshot(h.state);
    omitted.operation.position = current.frontier.position + 1;
    omitted.operation.prev = link(current.frontier.entry);
    const prep = await observer.prepareRecovery(h.state, omitted);
    await network.init();
    const recoveryCapture = await network.run(async () => captured(observer, await observer.observePrepared(prep)));
    const completed = (await handoff(h, observer, recoveryCapture)) as NativeIntent;
    await h.append('observer recovery then genuine actor signature', await signNativeIntent(completed, h.control), {
      decision: 'effective',
    });
    const next = await h.epoch(3, fresh);
    await h.append('observed advance', await observeAccount({ $type: nativeRef('advanceEpoch'), epoch: link(next) }), {
      decision: 'effective',
    });
    const revokeCid = await h.account(NATIVE_NSID.revoke, grant.id, {
      $type: NATIVE_NSID.revoke,
      version: 1,
      id: grant.id,
      app: h.anchor.genesis.app,
      genesis: link(h.anchor.cid),
    });
    await h.append(
      'observed exact revoke',
      await observeAccount({ $type: nativeRef('revokeGrant'), revoke: { id: grant.id, cid: link(revokeCid) } }),
      { decision: 'effective' },
    );
    await h.epoch(4, next);
    const oldGrant = await h.grant(9, epoch);
    await h.append(
      'old epoch grant still captured for I2 result',
      await observeAccount({ $type: nativeRef('admitGrant'), grant: oldGrant }),
      { decision: 'ineffective', reason: 'epoch_conflict' },
    );
    const later = nativeAuthoritySnapshot(h.state),
      reused = structuredClone(omitted);
    reused.operation.position = later.frontier.position + 1;
    reused.operation.prev = link(later.frontier.entry);
    Object.assign(reused.operation, h.expectations());
    const calls = network.calls.length;
    await assert.rejects(() => observer.prepareRecovery(h.state, reused), { code: 'envelope' });
    assert.equal(network.calls.length, calls);
    fixtures.push(h.publicFixture());
    cases.push(
      'recovery capture remains unsigned until device signature and I2 authorization',
      'epoch advance and exact revoke offline acceptance',
      'old epoch grant captured then I2 epoch_conflict, no observer permission evaluator',
      'already consumed actor nonce rejected before network',
      'unappointed controller can obtain factual capture; only I2 returns control_unappointed',
    );
  }
  {
    const h = await AuthorityHarness.create();
    await h.epoch(1);
    (h.app as { principal: string }).principal = 'did:web:application.example';
    const genesis = { ...h.anchor.genesis, app: h.app.principal },
      genesisCid = await contentCid(genesis);
    h.anchor = await NativeAnchor.from(genesis, { app: h.app.principal, genesis: genesisCid });
    h.state = await openNativeAuthority(h.anchor);
    h.appRecords.clear();
    h.appRecords.set(nativeGenesisPath(genesisCid), encodeBlock(genesis));
    const observer = await NativeObserver.fromAnchor(h.anchor, h.reader()),
      network = new ObserverNetwork(h);
    await network.init();
    const capture = await network.run(async () => captured(observer, await observer.observeApp()));
    const data = observer.readCapture(capture);
    assert.equal(data.assuranceClass, 'web-observation-v1');
    appCaptures.push({
      genesis,
      genesisCid,
      entry: [],
      data: { ...data, blocks: [...data.blocks].map(([cid, raw]) => [cid, [...raw]]) },
    });
    cases.push('hostname web app bootstrap retains weaker assurance and explicit external genesis pin');
  }
  return {
    cases,
    fixtures,
    appCaptures,
    delivery: 'simulated public HTTP; genuine signed method/repository fixtures; no provider trial',
  };
}
