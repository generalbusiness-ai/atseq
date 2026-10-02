/** Direct hostile owned-byte/count controls; predecessor corpus remains byte-exact. */
import { AtseqError } from '../../src/core/errors.ts';
import { produceNativeCheckpoint } from '../../src/protocol/native-checkpoint-producer.ts';
import { checkpointPayloadIdentity, readCheckpointAssertion } from '../../src/protocol/checkpoint-data.ts';
import { nativeCheckpointProducerFixture, checkpointProducerSummary } from './native-checkpoint-producer-corpus.ts';
import type { CheckpointFixture } from './checkpoint-data-corpus.ts';
const encode = (text: string) => new TextEncoder().encode(text);
const ok: (value: unknown) => asserts value = (value) => {
  if (!value) throw new Error('Expected ownership condition');
};
export async function nativeCheckpointProducerOwnedInputCorpus(fixture: CheckpointFixture, literal: unknown) {
  const input = await nativeCheckpointProducerFixture(fixture);
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
  const original = await checkpointPayloadIdentity(encode('{"x":1}'));
  const mutated = await checkpointPayloadIdentity(encode('{"x":2}'));
  await pass('root-alias-slice-later-mutation-retains-original-state', async () => {
    const raw = encode('{"x":1}');
    let calls = 0;
    Object.defineProperty(raw, 'slice', {
      value: () => {
        calls++;
        return raw;
      },
    });
    const pending = produceNativeCheckpoint({ ...input, state: raw });
    raw.set(encode('{"x":2}'));
    const result = await pending;
    ok(
      readCheckpointAssertion(result.assertion.bytes, input.scope, 32 * 1024 * 1024).state === original && calls === 0,
    );
    ok(original !== mutated);
  });
  await pass('own-byte-fields-methods-iterator-constructor-never-dispatched', async () => {
    const raw = encode('{"x":1}');
    let calls = 0;
    for (const field of [
      'length',
      'byteLength',
      'buffer',
      'byteOffset',
      'slice',
      'constructor',
      Symbol.iterator,
      Symbol.toStringTag,
    ])
      Object.defineProperty(raw, field, {
        get() {
          calls++;
          throw new Error('Caller byte property executed');
        },
      });
    const pending = produceNativeCheckpoint({ ...input, state: raw });
    Uint8Array.prototype.set.call(raw, encode('{"x":2}'));
    const result = await pending;
    ok(
      readCheckpointAssertion(result.assertion.bytes, input.scope, 32 * 1024 * 1024).state === original && calls === 0,
    );
  });
  await pass('genuine-subclass-copied-without-species-or-slice', async () => {
    class HostileBytes extends Uint8Array {
      override slice(): Uint8Array<ArrayBuffer> {
        throw new Error('Subclass slice');
      }
    }
    const raw = new HostileBytes(encode('{"x":1}'));
    Object.defineProperty(raw, 'constructor', {
      get() {
        throw new Error('Subclass species');
      },
    });
    const pending = produceNativeCheckpoint({ ...input, state: raw });
    raw.set(encode('{"x":2}'));
    const result = await pending;
    ok(readCheckpointAssertion(result.assertion.bytes, input.scope, 32 * 1024 * 1024).state === original);
  });
  await pass('original-binary-payload-owned-before-await', async () => {
    const raw = encode('abc');
    Object.defineProperty(raw, 'slice', { value: () => raw });
    const pending = produceNativeCheckpoint({ ...input, payloads: [raw] });
    raw.set(encode('xyz'));
    const result = await pending;
    const originalCID = await checkpointPayloadIdentity(encode('abc')),
      mutatedCID = await checkpointPayloadIdentity(encode('xyz'));
    ok(
      result.records.some((record) => record.cid === originalCID) &&
        !result.records.some((record) => record.cid === mutatedCID),
    );
  });
  await pass('original-row-owned-before-await', async () => {
    const row = input.history[0]!.slice();
    Object.defineProperty(row, 'slice', { value: () => row });
    const pending = produceNativeCheckpoint({ ...input, history: [row, ...input.history.slice(1)] });
    row.fill(32);
    const result = await pending;
    ok(JSON.stringify(checkpointProducerSummary(result)) === JSON.stringify(literal));
  });
  let proxyFields = 0;
  const proxy = new Proxy(encode('{"x":1}'), {
    get() {
      proxyFields++;
      throw new Error('Proxy byte field');
    },
  });
  await reject('proxy-byte-view-refused-before-caller-field', 'input', () =>
    produceNativeCheckpoint({ ...input, state: proxy }),
  );
  ok(proxyFields === 0);
  await reject('forged-byte-prototype-refused', 'input', () =>
    produceNativeCheckpoint({ ...input, state: Object.create(Uint8Array.prototype) }),
  );
  await reject('different-typed-array-kind-refused', 'input', () =>
    produceNativeCheckpoint({ ...input, state: new Uint8ClampedArray(7) as unknown as Uint8Array }),
  );
  let oversizedProperties = 0;
  const oversized = new Uint8Array(32 * 1024 * 1024 + 1);
  for (const field of ['length', 'byteLength', 'slice'])
    Object.defineProperty(oversized, field, {
      get() {
        oversizedProperties++;
        return field === 'slice' ? () => new Uint8Array(0) : 0;
      },
    });
  await reject('intrinsic-per-payload-size-cannot-be-hidden', 'envelope', () =>
    produceNativeCheckpoint({ ...input, payloads: [oversized] }),
  );
  ok(oversizedProperties === 0);
  let aggregateProperties = 0;
  const large = new Uint8Array(25 * 1024 * 1024);
  Object.defineProperty(large, 'length', {
    get() {
      aggregateProperties++;
      return 0;
    },
  });
  Object.defineProperty(large, 'slice', {
    get() {
      aggregateProperties++;
      return () => new Uint8Array(0);
    },
  });
  await reject('intrinsic-aggregate-byte-charge-cannot-be-hidden', 'content_unavailable', () =>
    produceNativeCheckpoint({ ...input, payloads: [large, large] }),
  );
  ok(aggregateProperties === 0);
  for (const value of [-1, -0, NaN, Infinity, 1.5, '1', null]) {
    let descriptors = 0;
    const rows = new Proxy([], {
      get(target, key, receiver) {
        return key === 'length' ? value : Reflect.get(target, key, receiver);
      },
      getOwnPropertyDescriptor() {
        descriptors++;
        throw new Error('Unsafe count enumerated');
      },
    });
    await reject(
      `unsafe-row-count-${String(value)}-${Object.is(value, -0) ? 'negative-zero' : typeof value}`,
      'input',
      () => produceNativeCheckpoint({ ...input, payloads: rows as Uint8Array[] }),
    );
    ok(descriptors === 0);
  }
  let descriptors = 0;
  const tooMany = new Proxy([], {
    get(target, key, receiver) {
      return key === 'length' ? 100001 : Reflect.get(target, key, receiver);
    },
    getOwnPropertyDescriptor() {
      descriptors++;
      throw new Error('Oversized count enumerated');
    },
  });
  await reject('row-count-cap-before-descriptor-enumeration', 'content_unavailable', () =>
    produceNativeCheckpoint({ ...input, payloads: tooMany }),
  );
  ok(descriptors === 0);
  await pass('safe-row-count-captured-once-no-array-iterator', async () => {
    let reads = 0;
    const rows = new Proxy(input.history, {
      get(target, key, receiver) {
        if (key === 'length') {
          reads++;
          return target.length;
        }
        if (key === Symbol.iterator) throw new Error('Caller iterator');
        return Reflect.get(target, key, receiver);
      },
    });
    const result = await produceNativeCheckpoint({ ...input, history: rows });
    ok(reads === 1 && JSON.stringify(checkpointProducerSummary(result)) === JSON.stringify(literal));
  });
  let rowGetter = 0;
  const accessorRows = [] as Uint8Array[];
  Object.defineProperty(accessorRows, '0', {
    get() {
      rowGetter++;
      return input.history[0];
    },
    enumerable: true,
    configurable: true,
  });
  await reject('row-accessor-refused-without-executing-getter', 'input', () =>
    produceNativeCheckpoint({ ...input, history: accessorRows }),
  );
  ok(rowGetter === 0);
  await pass('foreign-row-length-getter-fault-keeps-identity', async () => {
    const marker = new TypeError('foreign row count getter');
    const rows = new Proxy([], {
      get(target, key, receiver) {
        if (key === 'length') throw marker;
        return Reflect.get(target, key, receiver);
      },
    });
    try {
      await produceNativeCheckpoint({ ...input, payloads: rows });
    } catch (error) {
      ok(error === marker);
      return;
    }
    throw new Error('Foreign getter fault was swallowed');
  });
  return {
    cases,
    noAdmission: true,
    rootProbe: { original, mutated, capturedOriginal: true, usedLaterMutation: false },
    allocatorCounters: null,
  };
}
