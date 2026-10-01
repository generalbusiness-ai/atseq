import test from 'node:test';
import assert from 'node:assert/strict';
import { observeCrypto } from '../scripts/performance-observer.ts';

test('benchmark observation counts actual operations and restores WebCrypto after failure', async () => {
  const original = crypto.subtle.digest;
  const raw = new Uint8Array([1, 2, 3]);
  const expected = new Uint8Array(await crypto.subtle.digest('SHA-256', raw));
  const observed = await observeCrypto(async () => new Uint8Array(await crypto.subtle.digest('SHA-256', raw)));
  assert.deepEqual(observed.result, expected);
  assert.equal(observed.crypto.digest.calls, 1);
  assert.equal(observed.crypto.digest.failed, 0);
  assert.equal(crypto.subtle.digest, original);
  await assert.rejects(
    observeCrypto(async () => {
      await crypto.subtle.digest('unsupported', raw);
    }),
  );
  assert.equal(crypto.subtle.digest, original);
  const after = await observeCrypto(async () => {
    await assert.rejects(
      observeCrypto(async () => 1),
      /isolation/,
    );
    return crypto.subtle.digest('SHA-256', raw);
  });
  assert.equal(after.crypto.digest.calls, 1);
});
