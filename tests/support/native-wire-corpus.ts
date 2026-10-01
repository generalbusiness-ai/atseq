import profiles from '../vectors/profiles-v2.json' with { type: 'json' };
import { supportedProfiles } from '../../src/protocol/identity.ts';
import { nativeFoundationDescriptor } from '../../src/protocol/native-contract.ts';
import fixtures from '../vectors/native-foundation.json' with { type: 'json' };
import { NATIVE_NSID as N, nativeRef as tag, validateNativeShape } from '../../src/protocol/native-schema.ts';
import {
  NativeAnchor,
  readNativeValue,
  readNativeRecord,
  nativeEntryPath,
  nativeGenesisPath,
  nativeHeadPath,
  nativePositionKey,
  parseNativePositionKey,
  nativeHeadAt,
  readNativeHead,
  verifyNativeSigned,
  verifyNativeEntryContents,
  createNativeEntry,
  nativeRetryIdentity,
  nativeObservationSubject,
  nativeFoldMetadata,
  reconstructNativeFile,
  reconstructNativeBytes,
  validateNativeDeviceKey,
  type NativeEntry,
  type NativeIntent,
  type NativeAccountOperation,
  type NativeFile,
  type NativeContent,
  type ByteManifest,
} from '../../src/protocol/native-wire.ts';
import { encodeBlock, decodeBlock, contentCid, link, bytes, ProtocolError } from '../../src/protocol/wire.ts';
export interface NativeCorpusResult {
  name: string;
  passed: boolean;
  detail?: string;
}
const F: any = fixtures;
const clone = <T>(value: T): T => structuredClone(value);
const hex = (bytes: Uint8Array) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
const unhex = (value: string) => Uint8Array.from(value.match(/../g)!.map((x) => parseInt(x, 16)));
const equal = (a: unknown, b: unknown) => {
  const stable = (v: any): any =>
    Array.isArray(v)
      ? v.map(stable)
      : v && typeof v === 'object'
        ? Object.fromEntries(
            Object.keys(v)
              .sort()
              .map((k) => [k, stable(v[k])]),
          )
        : v;
  if (JSON.stringify(stable(a)) !== JSON.stringify(stable(b))) throw Error('Values differ');
};
const okay = (condition: unknown) => {
  if (!condition) throw Error('Assertion failed');
};
async function rejected(work: () => unknown | Promise<unknown>, code?: string) {
  try {
    await work();
  } catch (e) {
    if (code) okay(e instanceof ProtocolError && e.code === code);
    return;
  }
  throw Error('Expected rejection');
}
export async function runNativeWireCorpus(): Promise<NativeCorpusResult[]> {
  const results: NativeCorpusResult[] = [];
  const run = async (name: string, work: () => unknown | Promise<unknown>) => {
    try {
      await work();
      results.push({ name, passed: true });
    } catch (e) {
      results.push({ name, passed: false, detail: e instanceof Error ? e.message : String(e) });
    }
  };
  const genesis = F.blocks.genesis.value,
    G = F.blocks.genesis.cid;
  const anchor = await NativeAnchor.from(genesis, { app: genesis.app, genesis: G });
  for (const [name, item] of Object.entries(F.blocks) as [string, any][])
    await run(`independent exact block ${name}`, async () => {
      equal(hex(encodeBlock(item.value)), item.cborHex);
      equal(await contentCid(item.value), item.cid);
      equal(hex(new Uint8Array(await crypto.subtle.digest('SHA-256', unhex(item.cborHex)))), item.sha256);
      equal(hex(encodeBlock(decodeBlock(unhex(item.cborHex)))), item.cborHex);
      await readNativeValue(item.value.$type, item.value);
    });
  await run('native record canonical keys and exact owned bytes', async () => {
    for (const name of [
      'genesis',
      'epoch',
      'epochCurrent',
      'grant',
      'revoke',
      'entry',
      'head',
      'file',
      'manifest',
      'chunk0',
      'chunk1',
    ]) {
      const f = F.blocks[name],
        v = f.value;
      const key =
        name === 'epochCurrent'
          ? 'self'
          : name === 'grant' || name === 'revoke'
            ? v.id
            : name === 'entry'
              ? `${G}.0000000000000001`
              : name === 'head'
                ? G
                : name === 'file'
                  ? v.cid
                  : f.cid;
      equal(hex(encodeBlock(await readNativeRecord(v.$type, key, unhex(f.cborHex)))), f.cborHex);
      await rejected(() => readNativeRecord(v.$type, 'wrong', unhex(f.cborHex)), 'path');
    }
  });
  await run('positive safe positions and full genesis paths', () => {
    for (const p of [1, 10, 10000, Number.MAX_SAFE_INTEGER]) {
      equal(parseNativePositionKey(nativePositionKey(p)), p);
      equal(nativeEntryPath(G, p), `${N.entry}/${G}.${String(p).padStart(16, '0')}`);
    }
    equal(nativeEntryPath(G, 1).split('/')[1]!.length, 76);
    equal(nativeGenesisPath(G), `${N.genesis}/${G}`);
    equal(nativeHeadPath(G), `${N.head}/${G}`);
    for (const bad of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, Infinity]) {
      try {
        nativePositionKey(bad);
      } catch {
        continue;
      }
      throw Error('Accepted bad position');
    }
    for (const bad of ['1', '0000000000000000', '9007199254740992', '+000000000000001']) {
      try {
        parseNativePositionKey(bad);
      } catch {
        continue;
      }
      throw Error('Accepted bad key');
    }
  });
  await run('genesis external pin is exact and required', async () => {
    await rejected(() => NativeAnchor.from(genesis, { app: 'did:web:other.example', genesis: G }), 'target');
    await rejected(() => NativeAnchor.from(genesis, { app: genesis.app, genesis: F.blocks.epoch.cid }), 'target');
    await rejected(() => NativeAnchor.from(genesis, { app: genesis.app, genesis: G, trust: true } as any), 'target');
  });
  await run('head zero/genesis equivalence and append overflow', async () => {
    equal((await nativeHeadAt(anchor)).entry.$link, G);
    await rejected(() => readNativeHead({ ...F.blocks.head.value, position: 0 }, anchor), 'envelope');
    const max = await nativeHeadAt(anchor, Number.MAX_SAFE_INTEGER, F.blocks.entry.cid);
    await rejected(() => createNativeEntry(F.blocks.signed.value, anchor, max), 'position');
  });
  await run('two valid signatures share unsigned request and retry identity', async () => {
    const first = await verifyNativeSigned(F.blocks.signed.value, anchor);
    const alternate = await verifyNativeSigned({ ...F.blocks.signed.value, sig: F.alternateSignature }, anchor);
    equal(first.requestCid, F.blocks.intent.cid);
    equal(first.requestCid, alternate.requestCid);
    equal(nativeRetryIdentity(first.signed.intent), nativeRetryIdentity(alternate.signed.intent));
    okay((await contentCid(first.signed)) !== (await contentCid(alternate.signed)));
  });
  await run('every mutated signed binding fails verification', async () => {
    const mutations = [
      (v: any) => (v.intent.principal = 'did:web:other.example'),
      (v: any) => (v.intent.nonce = bytes(new Uint8Array(16))),
      (v: any) => v.intent.operation.payload.delta++,
      (v: any) => (v.intent.operation.epoch = link(F.blocks.genesis.cid)),
      (v: any) => (v.intent.operation.execution = link(F.blocks.genesis.cid)),
      (v: any) => (v.intent.operation.grant.cid = link(F.blocks.genesis.cid)),
    ];
    for (const mutation of mutations) {
      const v = clone(F.blocks.signed.value);
      mutation(v);
      await rejected(() => verifyNativeSigned(v, anchor), 'signature');
    }
  });
  await run('P256 devices and control; dual repository curve representation', async () => {
    await validateNativeDeviceKey(F.keys.actor);
    await validateNativeDeviceKey(F.keys.control);
    await rejected(() => validateNativeDeviceKey(F.keys.repository), 'key');
    const obs = clone(F.blocks.observation.value);
    obs.body.binding.signingKeyDid = F.keys.actor;
    await readNativeValue(N.content, obs);
    await readNativeValue(N.content, F.blocks.observation.value);
    const control = clone(F.blocks.setRecovery.value);
    control.recovery[0].actorKey = F.keys.repository;
    await rejected(() => readNativeValue(tag('setRecovery'), control), 'key');
  });
  await run('closed schemas reject extra fields, unknown unions and coercion', async () => {
    const mutations = [
      (v: any) => (v.extra = true),
      (v: any) => (v.version = 1),
      (v: any) => (v.request.extra = true),
      (v: any) => (v.request.intent.operation.$type = tag('unreviewed')),
      (v: any) => (v.position = '1'),
      (v: any) => (v.request.sig = { $bytes: v.request.sig.$bytes, extra: true }),
    ];
    for (const mutation of mutations) {
      const v = clone(F.blocks.entry.value);
      mutation(v);
      await rejected(() => readNativeValue(N.entry, v));
    }
    await rejected(
      () => readNativeValue(tag('setRecovery'), { ...F.blocks.setRecovery.value, recovery: [] }),
      'envelope',
    );
  });
  await run('ordinary entry content needs no extra ordering signature', async () => {
    const verified = await verifyNativeEntryContents(F.blocks.entry.value, anchor);
    equal(verified.requestCid, F.blocks.intent.cid);
    equal(verified.entryCid, F.blocks.entry.cid);
    const made = await createNativeEntry(F.blocks.signed.value, anchor, await nativeHeadAt(anchor));
    equal(await contentCid(made), F.blocks.entry.cid);
    await rejected(
      () => readNativeValue(N.entry, { ...F.blocks.entry.value, sig: F.blocks.signed.value.sig }),
      'envelope',
    );
  });
  await run('proof-derived outer context mismatch is invalid content', async () => {
    equal((await verifyNativeEntryContents(F.blocks.accountEntry.value, anchor)).requestCid, F.blocks.account.cid);
    const v = clone(F.blocks.accountEntry.value);
    v.request.position++;
    await rejected(() => verifyNativeEntryContents(v, anchor), 'envelope');
    const other = clone(F.blocks.accountEntry.value);
    other.request.prev = link(G);
    await rejected(() => verifyNativeEntryContents(other, anchor), 'envelope');
  });
  await run('observation projection binds everything except observation reference', async () => {
    const account = F.blocks.account.value as NativeAccountOperation;
    equal(await nativeObservationSubject(account), F.observationSubject);
    equal(await nativeObservationSubject({ ...account, observation: link(G) }), F.observationSubject);
    for (const mutate of [
      (v: any) => v.position++,
      (v: any) => (v.principal = 'did:web:other.example'),
      (v: any) => (v.expectedEpoch = null),
      (v: any) => (v.operation.grant.cid = link(G)),
    ]) {
      const v = clone(account);
      mutate(v);
      okay((await nativeObservationSubject(v)) !== F.observationSubject);
    }
    const recover: NativeIntent = {
      ...clone(F.blocks.intent.value),
      operation: clone(F.blocks.recoverParticipant.value),
    };
    const a = await nativeObservationSubject(recover);
    recover.operation = { ...recover.operation, observation: link(G) } as any;
    equal(await nativeObservationSubject(recover), a);
    await rejected(() => nativeObservationSubject(F.blocks.intent.value), 'envelope');
  });
  await run('five-field metadata excludes enrolment identity', () => {
    const entry = F.blocks.entry.value as NativeEntry;
    equal(Object.keys(nativeFoldMetadata(entry)).sort(), ['app', 'execution', 'genesis', 'position', 'principal']);
    const other = clone(entry) as any;
    other.request.intent.actorKey = F.keys.control;
    other.request.intent.operation.epoch = link(G);
    other.request.intent.operation.grant = { id: other.request.intent.operation.grant.id, cid: link(G) };
    equal(nativeFoldMetadata(other), nativeFoldMetadata(entry));
    okay(Object.isFrozen(nativeFoldMetadata(entry)));
  });
  const reader = {
    get: async (cid: string) => {
      const found = (Object.values(F.blocks) as any[]).find((b) => b.cid === cid);
      if (!found) throw new ProtocolError('content_missing', 'Missing retained bytes');
      return unhex(found.cborHex);
    },
  };
  await run('chunked exact bytes keep raw file and native locator identities distinct', async () => {
    const file = F.blocks.file.value as NativeFile;
    okay(file.cid !== F.blocks.file.cid);
    equal(hex(await reconstructNativeFile(file, reader, 32771)), F.rawFileHex);
    equal(
      hex(await reconstructNativeBytes(F.blocks.manifest.value as NativeContent<ByteManifest>, reader, 32771)),
      F.rawFileHex,
    );
    await readNativeRecord(N.file, file.cid, unhex(F.blocks.file.cborHex));
    await rejected(() => readNativeRecord(N.file, F.blocks.file.cid, unhex(F.blocks.file.cborHex)), 'path');
  });
  await run('missing bytes and local limits stay transient', async () => {
    await rejected(() => reconstructNativeFile(F.blocks.file.value, reader, 32770), 'native_proof_limit');
    const missing = {
      get: async () => {
        throw new ProtocolError('content_missing', 'Retained block absent');
      },
    };
    await rejected(() => reconstructNativeFile(F.blocks.file.value, missing, 32771), 'content_missing');
    for (const code of ['native_proof_limit', 'content_missing'])
      okay(new ProtocolError(code as any, 'x').kind === 'transient');
  });
  await run('chunk tampering and noncanonical chunk lengths fail', async () => {
    const bad = clone(F.blocks.chunk1.value);
    bad.body.bytes = bytes(new Uint8Array([1, 2, 3]));
    await rejected(
      () =>
        reconstructNativeFile(
          F.blocks.file.value,
          { get: async (cid) => (cid === F.blocks.chunk1.cid ? encodeBlock(bad) : reader.get(cid)) },
          32771,
        ),
      'path',
    );
    const manifest = clone(F.blocks.manifest.value);
    manifest.body.byteLength = 32772;
    await rejected(() => reconstructNativeBytes(manifest, reader, 32772), 'envelope');
    await rejected(
      () => readNativeValue(N.content, { ...manifest, body: { ...manifest.body, byteLength: 1 } }),
      'envelope',
    );
  });
  await run('typed shape remains separate from native authority acceptance', async () => {
    // Placeholder proof/root bytes deliberately validate only shape, never I1 membership or authority.
    const observed = await readNativeValue(N.content, F.blocks.observation.value);
    okay(observed);
    okay(!('authenticated' in (observed as object)));
    const stale = clone(F.blocks.setControl.value);
    stale.position = 1;
    await readNativeValue(tag('setControl'), stale);
    // This foundation cannot decide whether an old control context is effective.
  });
  await run('account principals use PLC or hostname web throughout', async () => {
    const bad = [
      'did:key:' + F.keys.actor.slice(8),
      'did:webvh:example.test',
      'did:plc:short',
      'did:web:example.test:account',
      'did:web:example.test%3A8443',
      'did:web:localhost%3A8000',
    ];
    for (const did of bad) {
      for (const change of [
        (v: any) => (v.app = did),
        (v: any) => (v.owner = did),
        (v: any) => (v.control[0].principal = did),
        (v: any) => (v.roles[0].principal = did),
      ]) {
        const v = clone(genesis);
        change(v);
        await rejected(() => readNativeValue(N.genesis, v), 'envelope');
      }
      const target = clone(F.blocks.setRole.value);
      target.target = did;
      await rejected(() => readNativeValue(tag('setRole'), target), 'envelope');
    }
    const web = clone(genesis);
    web.app = 'did:web:example.test';
    web.owner = 'did:web:owner.example';
    await readNativeValue(N.genesis, web);
  });
  await run('retained file-table order and unused assets remain exact identity', async () => {
    const v = F.blocks.definition.value;
    const owned: any = await readNativeValue(N.definition, v);
    equal(owned.files, v.files);
    okay(owned.files.some((f: any) => f.path === 'unused.txt'));
    const sorted = clone(v);
    sorted.files.sort((a: any, b: any) => (a.path < b.path ? -1 : 1));
    await readNativeValue(N.definition, sorted);
    okay((await contentCid(sorted)) !== F.blocks.definition.cid);
    const pruned = clone(v);
    pruned.files = pruned.files.filter((f: any) => f.path !== 'unused.txt');
    await readNativeValue(N.definition, pruned);
    okay((await contentCid(pruned)) !== F.blocks.definition.cid);
    const duplicate = clone(v);
    duplicate.files.push(duplicate.files[0]);
    await rejected(() => readNativeValue(N.definition, duplicate), 'envelope');
    await readNativeRecord(N.definition, F.blocks.definition.cid, unhex(F.blocks.definition.cborHex));
    const locator = clone(v);
    locator.files[0].cid = F.blocks.file.cid;
    await rejected(() => readNativeValue(N.definition, locator), 'envelope');
  });
  await run('high-S signatures do not create accepted retry aliases', async () => {
    const signed = clone(F.blocks.signed.value);
    const raw = unhex(hex(new Uint8Array(Uint8Array.from(atob(signed.sig.$bytes), (c) => c.charCodeAt(0)))));
    const order = BigInt('0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551');
    const low = BigInt('0x' + hex(raw.subarray(32)));
    raw.set(unhex((order - low).toString(16).padStart(64, '0')), 32);
    signed.sig = bytes(raw);
    await rejected(() => verifyNativeSigned(signed, anchor), 'signature');
  });
  await run('sparse receipt is closed framing, never self-appointed assurance', async () => {
    const receipt = F.blocks.receipt.value;
    await readNativeValue(tag('receipt'), receipt);
    await readNativeValue(tag('receipt'), { ...receipt, publication: { ...receipt.publication, head: null } });
    await rejected(() => readNativeValue(tag('receipt'), { ...receipt, trusted: true }), 'envelope');
    await rejected(
      () => readNativeValue(tag('receipt'), { ...receipt, publication: { ...receipt.publication, proofs: [] } }),
      'envelope',
    );
    await rejected(() => readNativeValue(tag('receipt'), { ...receipt, position: 0 }), 'envelope');
    // Whether these placeholders prove publication/prefix/state is deliberately undecidable here.
  });
  await run('native preparation does not advertise a new supported profile', async () => {
    const supported = await supportedProfiles();
    equal(
      supported.map(({ name, cid }) => ({ name, cid })),
      profiles.profiles,
    );
    okay(!supported.some((p) => p.name === nativeFoundationDescriptor.name));
    const descriptor = await contentCid(nativeFoundationDescriptor);
    const changed = clone(nativeFoundationDescriptor) as any;
    changed.metadata.push('actorKey');
    okay((await contentCid(changed)) !== descriptor);
    // No routine service RPC schema is part of this isolated preparation descriptor.
    okay(
      !nativeFoundationDescriptor.schemas.some(
        (s) => (s.defs.main as any)?.type === 'query' || (s.defs.main as any)?.type === 'procedure',
      ),
    );
  });
  await run('native shape returns owned immutable content and bounds enclosing blocks', async () => {
    const input = clone(genesis),
      owned: any = await readNativeValue(N.genesis, input);
    input.control[0].powers.pop();
    equal(owned.control[0].powers, ['govern', 'recover']);
    okay(Object.isFrozen(owned.control[0].powers));
    const big = clone(F.blocks.intent.value);
    big.operation.payload = { text: 'x'.repeat(65536) };
    await rejected(() => readNativeValue(tag('intent'), big));
    const long = clone(genesis);
    long.roles = Array.from({ length: 64 }, (_, i) => ({ principal: genesis.app, role: `r${i}` }));
    await rejected(() => readNativeValue(N.genesis, long), 'envelope');
  });
  return results;
}
