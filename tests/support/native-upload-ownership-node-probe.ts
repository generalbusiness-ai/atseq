import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { create, toString, CODEC_RAW } from '@atcute/cid';
import { loadNodeOAuthAdapter } from '../../src/host/oauth-loader.ts';
import { NativeAccountWriter } from '../../src/transport/native-account-writer.ts';
import { NativeWriterFixture } from './native-account-writer-fixture.ts';
import { OAUTH_DID, OAUTH_SCOPE } from './oauth-fixture.ts';
import {
  nativeUploadOwnershipInput,
  UPLOAD_OWNERSHIP_VALID,
  UPLOAD_OWNERSHIP_INVALID,
} from './native-upload-ownership-inputs.ts';

const fixture = await new NativeWriterFixture().initialize();
const nativeFetch = globalThis.fetch;
globalThis.fetch = fixture.fetch;
const cases: string[] = [];
try {
  const adapter = await loadNodeOAuthAdapter(fixture.options());
  await adapter.begin(OAUTH_DID, OAUTH_SCOPE);
  const writer = await NativeAccountWriter.open(await adapter.complete(fixture.callback()), OAUTH_DID);
  for (const name of UPLOAD_OWNERSHIP_VALID) {
    const { input, expected } = nativeUploadOwnershipInput(name);
    const pending = writer.upload(input as Uint8Array);
    Uint8Array.prototype.fill.call(input, 23);
    const blob = await pending;
    assert.equal(blob.size, expected!.byteLength);
    assert.deepEqual(fixture.bodies.at(-1), expected);
    cases.push('valid-owned-' + name);
  }
  const buffer = Buffer.alloc(17, 42);
  Object.defineProperty(buffer, 'length', { value: 0 });
  Object.defineProperty(buffer, 'constructor', {
    get: () => {
      throw new Error('Caller constructor');
    },
  });
  const pendingBuffer = writer.upload(buffer);
  Uint8Array.prototype.fill.call(buffer, 23);
  assert.equal((await pendingBuffer).size, 17);
  assert.deepEqual(fixture.bodies.at(-1), new Uint8Array(17).fill(42));
  cases.push('valid-owned-Node-Buffer');
  for (const name of UPLOAD_OWNERSHIP_INVALID) {
    const { input } = nativeUploadOwnershipInput(name);
    const before = fixture.calls.length;
    await assert.rejects(() => writer.upload(input as Uint8Array), { code: 'input' });
    assert.equal(fixture.calls.length, before);
    cases.push('local-refusal-' + name);
  }
  const crossRealm = runInNewContext('new Uint8Array(17)');
  const beforeRealm = fixture.calls.length;
  await assert.rejects(() => writer.upload(crossRealm), { code: 'input' });
  assert.equal(fixture.calls.length, beforeRealm);
  cases.push('explicit-cross-realm-refusal-before-any-HTTP');
  const over = new Uint8Array(1024 * 1024);
  assert.equal((await writer.upload(over)).size, over.byteLength);
  cases.push('exact-fixed-1MiB-positive');
  const content = new Uint8Array(17).fill(42);
  Object.defineProperty(content, 'length', { value: 0 });
  let sentBytes = 0;
  fixture.overrideResponse = async (_request, body) => {
    sentBytes = body.byteLength;
    return new Response(
      JSON.stringify({
        blob: {
          $type: 'blob',
          ref: { $link: toString(await create(CODEC_RAW, body)) },
          mimeType: 'application/octet-stream',
          size: 0,
        },
      }),
    );
  };
  await assert.rejects(() => writer.upload(content), { code: 'InvalidResponse' });
  assert.equal(sentBytes, 17);
  cases.push('root-17-sent-own-length-zero-malformed-size-zero-refused');
  fixture.overrideResponse = undefined;
  assert.equal((await writer.upload(content)).size, 17);
  assert.equal((await writer.upload(new Uint8Array())).size, 0);
  cases.push('valid-17-and-zero-replies-after-malformed-refusal');
  console.log(
    JSON.stringify({
      node: process.version,
      cases,
      maintainedClient: true,
      syntheticASAndResource: true,
      publicProviderExecuted: false,
      crossRealmSupported: false,
      fixedOutgoingLimitBytes: 1024 * 1024,
    }),
  );
} finally {
  globalThis.fetch = nativeFetch;
}
