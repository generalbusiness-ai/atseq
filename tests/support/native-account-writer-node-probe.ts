import assert from 'node:assert/strict';
import { loadNodeOAuthAdapter } from '../../src/host/oauth-loader.ts';
import { runNativeWriterCorpus } from './native-account-writer-corpus.ts';
import type { NativeWriterFixture } from './native-account-writer-fixture.ts';

let fixture: NativeWriterFixture;
let dispatcherCalls = 0;
globalThis.fetch = async (input, init) => {
  assert.equal(typeof (init as RequestInit & { dispatcher: { dispatch: unknown } }).dispatcher.dispatch, 'function');
  dispatcherCalls++;
  return fixture.fetch(input, init);
};
const result = await runNativeWriterCorpus(async (value) => {
  fixture = value;
  return loadNodeOAuthAdapter(value.options());
});
console.log(
  JSON.stringify({
    node: process.version,
    cases: result.cases,
    nativeBatch: result.nativeBatch,
    dispatcherCalls,
    maintainedClient: true,
    syntheticASAndResource: true,
    publicProviderExecuted: false,
  }),
);
