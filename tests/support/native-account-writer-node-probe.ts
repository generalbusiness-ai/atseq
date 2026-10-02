import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { loadNodeOAuthAdapter } from '../../src/host/oauth-loader.ts';
import { runNativeWriterCorpus } from './native-account-writer-corpus.ts';
import { NativeWriterFixture } from './native-account-writer-fixture.ts';
import { NativeAccountWriter } from '../../src/transport/native-account-writer.ts';
import { OAUTH_DID, OAUTH_SCOPE } from './oauth-fixture.ts';
import { AtseqError } from '../../src/core/errors.ts';

let fixture: NativeWriterFixture;
let dispatcherCalls = 0;
const nativeFetch = globalThis.fetch;
let faultURL: string | undefined;
globalThis.fetch = async (input, init) => {
  assert.equal(typeof (init as RequestInit & { dispatcher: { dispatch: unknown } }).dispatcher.dispatch, 'function');
  dispatcherCalls++;
  const request = input instanceof Request ? input : new Request(input, init);
  if (faultURL && new URL(request.url).pathname.startsWith('/xrpc/')) {
    // A real local socket receives only the signal, never OAuth headers/body.
    const response = await nativeFetch(faultURL, { signal: request.signal, redirect: 'error' });
    return new Response(response.body, { status: response.status, headers: response.headers });
  }
  return fixture.fetch(input, init);
};
const result = await runNativeWriterCorpus(async (value) => {
  fixture = value;
  return loadNodeOAuthAdapter(value.options());
});
const faultServer = createServer((request, response) => {
  if (request.url === '/drop') {
    request.socket.destroy();
    return;
  }
  response.writeHead(200, { 'content-type': 'application/json' });
  response.flushHeaders();
  if (request.url === '/body-drop') {
    response.write('{');
    setTimeout(() => request.socket.destroy(), 10);
  }
});
await new Promise<void>((resolve) => faultServer.listen(0, '127.0.0.1', resolve));
const address = faultServer.address();
assert.ok(address && typeof address !== 'string');
const realNetwork: { path: string; code: string; elapsedMs: number }[] = [];
try {
  for (const path of ['/drop', '/body-drop', '/deadline']) {
    fixture = await new NativeWriterFixture().initialize();
    const adapter = await loadNodeOAuthAdapter(fixture.options());
    await adapter.begin(OAUTH_DID, OAUTH_SCOPE);
    const handle = await adapter.complete(fixture.callback());
    const writer = await NativeAccountWriter.open(handle, OAUTH_DID);
    faultURL = 'http://127.0.0.1:' + address.port + path;
    const started = performance.now();
    await assert.rejects(
      () => writer.upload(new Uint8Array(524288)),
      (error: unknown) => error instanceof AtseqError && error.code === 'content_unavailable',
    );
    const elapsedMs = performance.now() - started;
    if (path === '/deadline') assert.ok(elapsedMs >= 29900 && elapsedMs < 45000);
    realNetwork.push({ path, code: 'content_unavailable', elapsedMs });
    faultURL = undefined;
  }
} finally {
  faultURL = undefined;
  faultServer.closeAllConnections();
  await new Promise<void>((resolve, reject) => faultServer.close((error) => (error ? reject(error) : resolve())));
}
console.log(
  JSON.stringify({
    node: process.version,
    cases: result.cases,
    nativeBatch: result.nativeBatch,
    credentialRecovery: result.credentialRecovery,
    realNetwork,
    dispatcherCalls,
    maintainedClient: true,
    syntheticASAndResource: true,
    publicProviderExecuted: false,
  }),
);
