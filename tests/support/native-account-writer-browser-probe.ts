import { loadBrowserOAuthAdapter } from '../../src/browser/oauth-loader.ts';
import { NativeAccountWriter } from '../../src/transport/native-account-writer.ts';
import { OAuthSessionHandle, type OAuthAdapter } from '../../src/protocol/oauth.ts';
import { OAUTH_DID, OAUTH_SCOPE, OAUTH_CUSTODY, oauthMetadata } from './oauth-fixture.ts';
import { WRITER_COLLECTION } from './native-account-writer-fixture.ts';

let adapter: OAuthAdapter;
let handle: OAuthSessionHandle;
let writer: NativeAccountWriter;
export async function create() {
  adapter = await loadBrowserOAuthAdapter({
    metadata: oauthMetadata,
    resolveIdentity: async (identifier, { fetch, signal }) => {
      const response = await fetch('https://identity.atseq-probe.net/' + encodeURIComponent(identifier), { signal });
      const { did } = await response.json();
      return {
        did,
        handle: 'handle.invalid',
        didDoc: {
          id: did,
          service: [
            { id: '#atproto_pds', type: 'AtprotoPersonalDataServer', serviceEndpoint: 'https://pds.atseq-probe.net' },
          ],
        },
      };
    },
    custodyOrigin: OAUTH_CUSTODY,
    publisherOrigin: 'https://publisher.atseq-probe.net',
    applicationOrigin: 'https://application.atseq-probe.net',
  });
}
export const begin = () => adapter.begin(OAUTH_DID, OAUTH_SCOPE);
export async function complete(params: string) {
  handle = await adapter.complete(new URLSearchParams(params));
  writer = await NativeAccountWriter.open(handle, OAUTH_DID);
  return { did: writer.did, frozen: Object.isFrozen(writer), serialized: JSON.stringify(writer) };
}
export async function restore() {
  handle = await adapter.restore(OAUTH_DID, OAUTH_SCOPE);
  writer = await NativeAccountWriter.open(handle, OAUTH_DID);
  return writer.did;
}
export const get = () => writer.get(WRITER_COLLECTION, 'first');
export const list = (cursor?: string) => writer.list(WRITER_COLLECTION, { cursor });
export const latest = () => writer.latestCommit();
export const upload = (size: number, cancel = false) => {
  const bytes = new Uint8Array(size).fill(17);
  const pending = writer.upload(bytes, 'application/octet-stream', {
    signal: cancel ? AbortSignal.abort() : undefined,
  });
  bytes.fill(23);
  return pending;
};
export const apply = (swapCommit: string) => {
  const writes = [
    {
      $type: 'com.atproto.repo.applyWrites#create',
      collection: WRITER_COLLECTION,
      rkey: 'browser',
      value: { text: 'before' },
    },
  ];
  const pending = writer.applyConditional(writes, swapCommit);
  writes[0]!.value.text = 'after';
  return pending;
};
export const ordinary = (size: number) =>
  handle
    .request('/xrpc/ai.generalbusiness.atseq.synthetic', { method: 'POST', body: new Uint8Array(size) })
    .then((response) => response.status);
export const mutate = () => {
  handle.info = handle.request = (() => {
    throw new Error('Caller method must not execute');
  }) as any;
  return writer.latestCommit();
};
export async function forgeries() {
  let refused = 0;
  for (const fake of [
    {},
    Object.create(OAuthSessionHandle.prototype),
    structuredClone(handle),
    new OAuthSessionHandle({} as any, {} as any, {} as any),
  ]) {
    try {
      await NativeAccountWriter.open(fake as OAuthSessionHandle, OAUTH_DID);
    } catch {
      refused++;
    }
  }
  return refused;
}
