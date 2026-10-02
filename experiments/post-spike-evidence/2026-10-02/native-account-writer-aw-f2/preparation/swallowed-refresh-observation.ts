import assert from 'node:assert/strict';
import { loadNodeOAuthAdapter } from '../../../../../src/host/oauth-loader.ts';
import { NativeAccountWriter } from '../../../../../src/transport/native-account-writer.ts';
import { PdsError } from '../../../../../src/transport/pds-operations.ts';
import { NativeWriterFixture } from '../../../../../tests/support/native-account-writer-fixture.ts';
import { OAUTH_DID, OAUTH_SCOPE } from '../../../../../tests/support/oauth-fixture.ts';

const fixture = await new NativeWriterFixture().initialize();
fixture.refreshPadding = 65537;
globalThis.fetch = fixture.fetch;
const adapter = await loadNodeOAuthAdapter(fixture.options());
await adapter.begin(OAUTH_DID, OAUTH_SCOPE);
const handle = await adapter.complete(fixture.callback());
const writer = await NativeAccountWriter.open(handle, OAUTH_DID);
fixture.invalidTokenOnce = true;
let observed: { code: string; status: number } | undefined;
try { await writer.upload(new Uint8Array(524288)); }
catch (error) {
  assert.ok(error instanceof PdsError);
  observed = { code: error.code, status: error.status };
}
assert.deepEqual(observed, { code: 'RequestFailed', status: 401 });
assert.equal(fixture.count('/token'), 1);
assert.equal(fixture.paths.length, 1);
console.log(JSON.stringify({ node: process.version, maintainedSDK: true, syntheticAS: true, outgoingRefreshBlockedAt64KiB: true, tokenDispatches: fixture.count('/token'), resourceDispatches: fixture.paths.length, observed, nativeLocalSizeInputPreserved: false }));
