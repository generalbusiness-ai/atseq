/** Portable hostile input construction only; no session or writer authority. */
export const UPLOAD_OWNERSHIP_VALID = [
  'plain',
  'length-zero',
  'byte-properties-throw',
  'methods-constructor-iterator-tag-throw',
  'subclass',
  'offset',
  'shared-storage',
  'zero-byte-length-spoof',
] as const;
export const UPLOAD_OWNERSHIP_INVALID = [
  'oversize-length-zero',
  'prototype-fake',
  'proxy',
  'data-view',
  'clamped-view',
  'uint16-view',
  'array-buffer',
  'ordinary-array',
  'null',
  'undefined',
  'detached',
] as const;
const refuseCaller = () => {
  throw new Error('Caller private-secret accessor must not execute');
};
export function nativeUploadOwnershipInput(name: string): { input: unknown; expected?: Uint8Array } {
  let input: Uint8Array = new Uint8Array(17).fill(42);
  if (name === 'length-zero') {
    Object.defineProperty(input, 'length', { value: 0 });
    Object.defineProperty(input, 'byteLength', { value: 0 });
  } else if (name === 'byte-properties-throw') {
    for (const key of ['length', 'byteLength', 'byteOffset', 'buffer'])
      Object.defineProperty(input, key, { get: refuseCaller });
  } else if (name === 'methods-constructor-iterator-tag-throw') {
    for (const key of ['slice', 'subarray', 'set', 'copyWithin', 'constructor', Symbol.iterator, Symbol.toStringTag])
      Object.defineProperty(input, key, { get: refuseCaller });
  } else if (name === 'subclass') {
    class HostileBytes extends Uint8Array {
      override get length(): number {
        return refuseCaller();
      }
      override get byteLength(): number {
        return refuseCaller();
      }
      static get [Symbol.species]() {
        return refuseCaller();
      }
    }
    input = new HostileBytes(17).fill(42);
  } else if (name === 'offset') {
    input = new Uint8Array(new ArrayBuffer(64), 11, 17).fill(42);
    Object.defineProperty(input, 'byteOffset', { value: 0 });
  } else if (name === 'shared-storage') input = new Uint8Array(new SharedArrayBuffer(17)).fill(42);
  else if (name === 'zero-byte-length-spoof') {
    input = new Uint8Array();
    Object.defineProperty(input, 'length', { value: 17 });
    Object.defineProperty(input, 'byteLength', { value: 17 });
    return { input, expected: new Uint8Array() };
  } else if (name === 'oversize-length-zero') {
    input = new Uint8Array(1024 * 1024 + 1);
    Object.defineProperty(input, 'length', { value: 0 });
    Object.defineProperty(input, 'byteLength', { value: 0 });
    return { input };
  } else if (name === 'prototype-fake') {
    const fake = Object.create(Uint8Array.prototype);
    Object.defineProperty(fake, 'length', { value: 17 });
    Object.defineProperty(fake, 'byteLength', { value: 17 });
    Object.defineProperty(fake, Symbol.iterator, { get: refuseCaller });
    return { input: fake };
  } else if (name === 'proxy') return { input: new Proxy(input, {}) };
  else if (name === 'data-view') return { input: new DataView(new ArrayBuffer(17)) };
  else if (name === 'clamped-view') return { input: new Uint8ClampedArray(17) };
  else if (name === 'uint16-view') return { input: new Uint16Array(17) };
  else if (name === 'array-buffer') return { input: new ArrayBuffer(17) };
  else if (name === 'ordinary-array') return { input: Array(17).fill(42) };
  else if (name === 'null') return { input: null };
  else if (name === 'undefined') return { input: undefined };
  else if (name === 'detached') {
    const backing = new ArrayBuffer(17);
    input = new Uint8Array(backing);
    structuredClone(backing, { transfer: [backing] });
    return { input };
  } else if (name !== 'plain') throw new Error('Unknown upload ownership case');
  return { input, expected: new Uint8Array(17).fill(42) };
}
