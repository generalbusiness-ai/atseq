import { OAuthClient, WebcryptoKey } from '@atproto/oauth-client-browser';
import type {
  RuntimeImplementation,
  StateStore,
  SessionStore,
  OAuthClientMetadataInput,
} from '@atproto/oauth-client-browser';

// Compile-only support check: every named seam is a public package-root export.
declare const stateStore: StateStore;
declare const sessionStore: SessionStore;
declare const clientMetadata: OAuthClientMetadataInput;
const runtimeImplementation: RuntimeImplementation = {
  createKey: (algs) => WebcryptoKey.generate(algs, undefined, { extractable: false }),
  getRandomValues: (length) => crypto.getRandomValues(new Uint8Array(length)),
  digest: async (data, { name }) => new Uint8Array(await crypto.subtle.digest(name.replace('sha', 'SHA-'), data)),
  requestLock: async (name, work) => {
    if (!globalThis.isSecureContext || !navigator.locks) throw new Error('Secure Web Locks required');
    return navigator.locks.request(name, { mode: 'exclusive' }, async () => work());
  },
};
void new OAuthClient({ clientMetadata, responseMode: 'fragment', runtimeImplementation, stateStore, sessionStore });
