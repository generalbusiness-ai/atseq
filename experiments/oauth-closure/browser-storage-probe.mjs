import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { chromium } from '@playwright/test';
const output = 'experiments/post-spike-evidence/2026-10-01/oauth-closure/';
const browser = await chromium.launch();
const outcomes = [];
try {
  for (const variant of ['official', 'atcute']) {
    const code = readFileSync(output + `${variant}-browser-bundle.js`);
    const server = createServer((request, response) => {
      response.setHeader('content-type', request.url === '/probe.js' ? 'text/javascript' : 'text/html');
      response.end(request.url === '/probe.js' ? code : '<!doctype html><title>OAuth storage namespaces</title>');
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const page = await browser.newPage();
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      const result = await page.evaluate(async (variant) => {
        const module = await import('/probe.js');
        const clients = [];
        const fetch = async () => {
          throw new Error('probe-network-refused');
        };
        const identityResolver = {
          resolve: async () => {
            throw new Error('probe-identity-refused');
          },
        };
        for (const label of ['runtime', 'publisher']) {
          if (variant === 'official') {
            clients.push(
              new module.BrowserOAuthClient({
                clientMetadata: {
                  client_id: `https://${label}.example/oauth.json`,
                  redirect_uris: [`https://${label}.example/callback`],
                  application_type: 'web',
                  response_types: ['code'],
                  grant_types: ['authorization_code', 'refresh_token'],
                  token_endpoint_auth_method: 'none',
                  dpop_bound_access_tokens: true,
                  scope: 'atproto',
                },
                fetch,
                identityResolver,
                // Not supported by BrowserOAuthClient. Probe records that the public constructor does not forward a database name.
                storageName: `atseq-${label}`,
              }),
            );
          } else {
            module.configureOAuth({
              metadata: {
                client_id: `https://${label}.example/oauth.json`,
                redirect_uri: `https://${label}.example/callback`,
              },
              identityResolver,
              storageName: `atseq-${label}`,
            });
          }
        }
        // Public disposal waits for pending database opens before closing them.
        for (const client of clients) await client.dispose();
        const databases = await indexedDB.databases();
        const result = {
          variant,
          indexedDBNames: databases.map(({ name }) => name),
          localStorageKeys: Object.keys(localStorage).sort(),
          clientIDs: ['https://runtime.example/oauth.json', 'https://publisher.example/oauth.json'],
        };
        return result;
      }, variant);
      console.log(JSON.stringify(result));
      if (variant === 'official') assert.deepEqual(result.indexedDBNames, ['@atproto-oauth-client']);
      else assert.deepEqual(result.localStorageKeys, ['atseq-publisher:version', 'atseq-runtime:version']);
      outcomes.push(result);
    } finally {
      await page.close();
      await new Promise((resolve) => server.close(resolve));
    }
  }
  writeFileSync(
    output + 'browser-storage.json',
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        browser: 'Chromium',
        version: browser.version(),
        method:
          'Two different synthetic client IDs on one loopback origin, public constructors/configuration, no token/state/session writes or provider calls. Official unsupported extra storageName option documents its absence; internal database constructor is not called.',
        outcomes,
        limits: [
          'Storage naming observation, not credential leak or successful login evidence',
          'Exact source separately shows official session keys use account DID and fixed default database; Atcute configured storageName scopes all record prefixes',
          'LocalStorage namespaces are logical separation, not protection from same-origin script access',
        ],
      },
      null,
      2,
    ) + '\n',
  );
  console.log(JSON.stringify(outcomes));
} finally {
  await browser.close();
}
