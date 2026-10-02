import {
  AtseqError,
  BrowserOAuthCustody,
  OAuthAdapter,
  deepFreeze,
  oauthTransport,
  oauthUrl
} from "./chunk-WK77AKTB.js";
import "./chunk-CZ7CSFO4.js";

// dist/src/browser/oauth-adapter.js
var CLIENT_PIN = "atseq.oauth.client.v1";
async function browserOAuthAdapter(input) {
  const options = { ...input, metadata: deepFreeze(input.metadata) };
  const origin = oauthUrl(options.custodyOrigin).origin;
  if (!globalThis.isSecureContext || !navigator.locks || location.origin !== origin || oauthUrl(options.metadata.client_id).origin !== origin || oauthUrl(options.publisherOrigin).origin === origin || oauthUrl(options.applicationOrigin).origin === origin || options.metadata.redirect_uris.some((uri) => oauthUrl(uri).origin !== origin))
    throw new AtseqError("origin", "OAuth requires its dedicated secure custody origin and Web Locks");
  const name = `atseq.oauth.custody:${origin}`;
  const lock = (work) => navigator.locks.request(name, work);
  await lock(async () => {
    const pinned = localStorage.getItem(CLIENT_PIN);
    if (pinned && pinned !== options.metadata.client_id)
      throw new AtseqError("origin", "OAuth custody origin is pinned to another client");
    localStorage.setItem(CLIENT_PIN, options.metadata.client_id);
  });
  if ((await indexedDB.databases()).some((database) => database.name === "@atproto-oauth-client"))
    throw new AtseqError("origin", "OAuth custody requires explicit origin reset or re-enrolment on a fresh origin");
  let custody;
  const owner = () => {
    if (!custody)
      throw new AtseqError("input", "OAuth custody is not initialized");
    return custody;
  };
  const adapter = new OAuthAdapter(options, {
    list: () => owner().transactions.list(),
    set: (transaction) => owner().transactions.set(transaction),
    take: (id) => owner().transactions.take(id)
  }, lock, oauthTransport(globalThis.fetch.bind(globalThis)), async (fetch, identityResolver) => {
    const { OAuthClient, WebcryptoKey } = await import("./dist-Q6ZHUMY6.js");
    custody = new BrowserOAuthCustody(WebcryptoKey);
    class CustodyClient extends OAuthClient {
      async readApplicationState(callbackState) {
        return (await this.stateStore.get(callbackState))?.appState;
      }
    }
    return new CustodyClient({
      clientMetadata: options.metadata,
      responseMode: "query",
      fetch,
      identityResolver,
      stateStore: custody.stateStore,
      sessionStore: custody.sessionStore,
      runtimeImplementation: custody.runtime()
    });
  }, {
    prepare: (client) => owner().prepare(client),
    touch: (did, conservative) => owner().touch(did, conservative),
    tokenRequestDispatched: () => owner().tokenRequestDispatched(),
    finish: (client, successful) => owner().finish(client, successful)
  });
  await adapter.cleanupCustody();
  let cleanup;
  const startCleanup = () => {
    cleanup ??= setInterval(() => {
      void adapter.cleanupCustody().catch(() => {
        dispatchEvent(new Event("atseq-oauth-custody-unavailable"));
      });
    }, 6e4);
  };
  addEventListener("pagehide", () => {
    clearInterval(cleanup);
    cleanup = void 0;
  });
  addEventListener("pageshow", startCleanup);
  startCleanup();
  return adapter;
}
async function resetBrowserOAuthCustody(input) {
  const origin = oauthUrl(input.custodyOrigin).origin;
  if (!isSecureContext || !navigator.locks || location.origin !== origin || oauthUrl(input.metadata.client_id).origin !== origin || oauthUrl(input.publisherOrigin).origin === origin || oauthUrl(input.applicationOrigin).origin === origin)
    throw new AtseqError("origin", "OAuth reset requires its dedicated secure custody origin and Web Locks");
  await navigator.locks.request(`atseq.oauth.custody:${origin}`, async () => {
    const pinned = localStorage.getItem(CLIENT_PIN);
    if (pinned && pinned !== input.metadata.client_id)
      throw new AtseqError("origin", "OAuth custody origin is pinned to another client");
    for (const name of ["atseq.oauth.custody.v1", "@atproto-oauth-client"]) {
      await new Promise((resolve, reject) => {
        const deletion = indexedDB.deleteDatabase(name);
        deletion.onsuccess = () => resolve();
        deletion.onerror = () => reject(deletion.error);
        deletion.onblocked = () => reject(new AtseqError("input", "OAuth custody reset is blocked"));
      });
    }
    localStorage.removeItem("atseq.oauth.transactions.v1");
    localStorage.removeItem(CLIENT_PIN);
  });
}
export {
  browserOAuthAdapter,
  resetBrowserOAuthCustody
};
