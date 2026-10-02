import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { oauthUrl } from '../src/protocol/oauth.ts';

test('actual Node OAuth adapter uses maintained client, guarded edges, races and private custody', () => {
  const raw = execFileSync(
    process.execPath,
    ['--conditions=atseq-source', '--import', 'tsx', 'tests/support/oauth-node-probe.ts'],
    { encoding: 'utf8', timeout: 60_000 },
  );
  const result = JSON.parse(raw);
  assert.ok(result.cases.length >= 13);
  assert.ok(result.dispatcherCalls > 0);
  assert.equal(result.providerSuccess, false);
  console.log(JSON.stringify(result));
});

test('browser-visible OAuth URL policy refuses unsafe schemes, hosts, credentials and fragments', () => {
  for (const url of [
    'http://public.example/token',
    'https://127.1/token',
    'https://0x7f000001/token',
    'https://[::1]/token',
    'https://localhost/token',
    'https://a.localhost/token',
    'https://user:password@public.example/token',
    'https://public.example/token#fragment',
  ])
    assert.throws(() => oauthUrl(url));
  assert.equal(oauthUrl('https://public.example:8443/token').hostname, 'public.example');
});
