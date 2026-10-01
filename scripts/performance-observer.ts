/** Benchmark-only WebCrypto observation. Never imported by runtime code. */
export interface CryptoObservation {
  importKey: { calls: number; elapsedMs: number; failed: number };
  exportKey: { calls: number; elapsedMs: number; failed: number };
  verify: { calls: number; elapsedMs: number; failed: number };
  digest: { calls: number; elapsedMs: number; failed: number };
}
let observing = false;
export async function observeCrypto<T>(run: () => Promise<T>): Promise<{ result: T; crypto: CryptoObservation }> {
  if (observing) throw new Error('Crypto measurements must run in isolation');
  observing = true;
  const subtle = globalThis.crypto.subtle;
  const crypto: CryptoObservation = Object.fromEntries(
    ['importKey', 'exportKey', 'verify', 'digest'].map((name) => [name, { calls: 0, elapsedMs: 0, failed: 0 }]),
  ) as unknown as CryptoObservation;
  const restores: (() => void)[] = [];
  try {
    for (const name of ['importKey', 'exportKey', 'verify', 'digest'] as const) {
      const original = subtle[name],
        descriptor = Object.getOwnPropertyDescriptor(subtle, name);
      const wrapped = async (...args: unknown[]) => {
        const start = performance.now();
        crypto[name].calls++;
        try {
          return await Reflect.apply(original, subtle, args);
        } catch (error) {
          crypto[name].failed++;
          throw error;
        } finally {
          crypto[name].elapsedMs += performance.now() - start;
        }
      };
      Object.defineProperty(subtle, name, { configurable: true, writable: true, value: wrapped });
      restores.push(() =>
        descriptor ? Object.defineProperty(subtle, name, descriptor) : Reflect.deleteProperty(subtle, name),
      );
    }
    return { result: await run(), crypto };
  } finally {
    for (const restore of restores.reverse()) restore();
    observing = false;
  }
}
