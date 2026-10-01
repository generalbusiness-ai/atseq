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
      response.end(request.url === '/probe.js' ? code : '<!doctype html><title>OAuth transport seam</title>');
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const page = await browser.newPage();
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      const outcome = await page.evaluate(async (variant) => {
        const calls = { injected: [], ambient: [] };
        const stop = (kind) => async (input) => {
          calls[kind].push(input instanceof Request ? input.url : String(input));
          throw new Error(`probe-${kind}-network-refused`);
        };
        globalThis.fetch = stop('ambient');
        const module = await import('/probe.js');
        let client, result;
        try {
          if (variant === 'official') {
            client = new module.BrowserOAuthClient({
              clientMetadata: {
                client_id: 'https://client.example/oauth-client-metadata.json',
                application_type: 'web',
                redirect_uris: ['https://client.example/callback'],
                response_types: ['code'],
                grant_types: ['authorization_code', 'refresh_token'],
                token_endpoint_auth_method: 'none',
                dpop_bound_access_tokens: true,
                scope: 'atproto',
              },
              fetch: stop('injected'),
              identityResolver: {
                resolve: async () => {
                  throw new Error('identity not requested by this service probe');
                },
              },
            });
            await client.authorize('https://pds.example', { scope: 'atproto' });
          } else {
            module.configureOAuth({
              metadata: {
                client_id: 'https://client.example/oauth-client-metadata.json',
                redirect_uri: 'https://client.example/callback',
              },
              identityResolver: {
                resolve: async () => {
                  throw new Error('identity not requested by this service probe');
                },
              },
              storageName: 'atseq-probe-client-runtime',
              // Unsupported extra option is intentionally supplied as JavaScript to expose its behavior.
              fetch: stop('injected'),
            });
            await module.createAuthorizationUrl({
              target: { type: 'pds', serviceUrl: 'https://pds.example' },
              scope: 'atproto',
            });
          }
          result = { completed: true };
        } catch (error) {
          result = { completed: false, name: error.name, message: error.message };
        } finally {
          if (client) await client.dispose();
        }
        return {
          variant,
          calls,
          result,
          storageKeys: Object.keys(localStorage),
          secureContext: isSecureContext,
          webLocks: Boolean(navigator.locks),
        };
      }, variant);
      console.log(JSON.stringify(outcome));
      if (variant === 'official') {
        assert.ok(outcome.calls.injected.length > 0);
        assert.equal(outcome.calls.ambient.length, 0);
      } else {
        assert.ok(outcome.calls.ambient.length > 0);
        assert.equal(outcome.calls.injected.length, 0);
      }
      outcomes.push(outcome);
    } finally {
      await page.close();
      await new Promise((resolve) => server.close(resolve));
    }
  }
  writeFileSync(
    output + 'browser-seams.json',
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        browser: 'Chromium',
        version: browser.version(),
        method:
          'Real Chromium imports exact installed-package bundles and constructs public browser clients. Service discovery is stopped by sentinel fetches. No provider network call or real login.',
        outcomes,
        limits: [
          'Atcute extra fetch option is not its declared API and is ignored; ambient sentinel observes the source gap',
          'Discovery seam only; token/refresh/resource edges are separately traced in exact source',
          'No browser DNS pinning or real provider success claimed',
        ],
      },
      null,
      2,
    ) + '\n',
  );
  console.log(JSON.stringify({ browser: browser.version(), outcomes, passed: true }));
} finally {
  await browser.close();
}
