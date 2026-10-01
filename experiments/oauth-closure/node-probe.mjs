import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';

const metadata = {
  client_id: 'https://client.example/oauth-client-metadata.json',
  application_type: 'web',
  redirect_uris: ['https://client.example/callback'],
  response_types: ['code'],
  grant_types: ['authorization_code', 'refresh_token'],
  token_endpoint_auth_method: 'none',
  dpop_bound_access_tokens: true,
  scope: 'atproto',
};
const outcomes = [];
for (const variant of ['official', 'atcute']) {
  const calls = { injected: [], ambient: [] };
  const stop = (kind) => async (input) => {
    calls[kind].push(input instanceof Request ? input.url : String(input));
    throw new Error(`probe-${kind}-network-refused`);
  };
  globalThis.fetch = stop('ambient');
  const packageName = variant === 'official' ? '@atproto/oauth-client-node' : '@atcute/oauth-node-client';
  let client, outcome;
  try {
    const module = await import(
      pathToFileURL(resolve(`.tmp/oauth-closure/${variant}/node_modules/${packageName}/dist/index.js`))
    );
    if (variant === 'official') {
      const store = () => {
        const values = new Map();
        return {
          get: (key) => values.get(key),
          set: (key, value) => values.set(key, value),
          del: (key) => values.delete(key),
        };
      };
      client = new module.NodeOAuthClient({
        clientMetadata: metadata,
        stateStore: store(),
        sessionStore: store(),
        fetch: stop('injected'),
        requestLock: module.requestLocalLock,
      });
      await client.authorize('https://pds.example', { scope: 'atproto' });
    } else {
      client = new module.OAuthClient({
        metadata,
        actorResolver: {
          resolve: async () => {
            throw new Error('identity resolution not requested by this service probe');
          },
        },
        stores: { states: new module.MemoryStore({ ttl: 600000, maxSize: 10 }), sessions: new module.MemoryStore() },
        fetch: stop('injected'),
      });
      await client.authorize({ target: { type: 'pds', serviceUrl: 'https://pds.example' }, scope: 'atproto' });
    }
    outcome = { completed: true };
  } catch (error) {
    outcome = { completed: false, name: error.name, message: error.message };
  }
  assert.ok(calls.injected.length > 0, `${variant} discovery must reach injected fetch`);
  assert.equal(calls.ambient.length, 0, `${variant} discovery must not escape to ambient fetch`);
  outcomes.push({ variant, package: packageName, calls, outcome });
}
const suffix = process.argv[2];
assert.ok(['current', 'floor'].includes(suffix));
writeFileSync(
  `experiments/post-spike-evidence/2026-10-01/oauth-closure/node-${suffix}.json`,
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      node: process.version,
      method:
        'Actual installed Node entry imports and public-client construction at Node version shown. Service discovery reaches injected sentinel fetch; ambient fetch is a failing sentinel in this isolated process. No provider network call, code/token or login.',
      outcomes,
      limits: [
        'Discovery seam only, not exhaustive fetch coverage or all minimum-version APIs',
        'No token exchange, refresh, grant publication or real provider success',
      ],
    },
    null,
    2,
  ) + '\n',
);
console.log(JSON.stringify({ node: process.version, outcomes, passed: true }));
