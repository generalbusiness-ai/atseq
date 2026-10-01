import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const output = 'experiments/post-spike-evidence/2026-10-01/oauth-closure/';
mkdirSync(output + 'published', { recursive: true });
const selections = {
  official: [
    '@atproto/oauth-client-node',
    '@atproto/oauth-client-browser',
    '@atproto/oauth-client',
    '@atproto/oauth-types',
    '@atproto/jwk-webcrypto',
    '@atproto/jwk-jose',
    '@atproto-labs/identity-resolver',
    'jose',
  ],
  atcute: [
    '@atcute/oauth-node-client',
    '@atcute/oauth-browser-client',
    '@atcute/oauth-crypto',
    '@atcute/oauth-types',
    '@atcute/identity-resolver',
    '@atcute/util-fetch',
  ],
};
const graphs = JSON.parse(readFileSync(output + 'graphs.json'));
const results = [];
for (const [variant, names] of Object.entries(selections)) {
  for (const name of names) {
    const pkg = JSON.parse(readFileSync(resolve('.tmp/oauth-closure', variant, 'node_modules', name, 'package.json')));
    const metadataUrl = `https://registry.npmjs.org/${encodeURIComponent(name)}/${pkg.version}`;
    const response = await fetch(metadataUrl, { credentials: 'omit', redirect: 'error' });
    assert.equal(response.status, 200);
    const metadata = await response.json();
    assert.equal(metadata.version, pkg.version);
    assert.equal(metadata.name, name);
    const url = new URL(metadata.dist.tarball);
    assert.equal(url.protocol, 'https:');
    assert.equal(url.hostname, 'registry.npmjs.org');
    const archive = await fetch(url, { credentials: 'omit', redirect: 'error' });
    assert.equal(archive.status, 200);
    const bytes = Buffer.from(await archive.arrayBuffer());
    const integrity = 'sha512-' + createHash('sha512').update(bytes).digest('base64');
    assert.equal(integrity, metadata.dist.integrity);
    const locked = graphs.results[variant].nodes.find((node) => node.path === 'node_modules/' + name);
    assert.equal(locked.version, pkg.version);
    assert.equal(integrity, locked.integrity);
    assert.equal(url.href, locked.resolved);
    const prefix = name.replace(/^@/, '').replaceAll('/', '-') + '-' + pkg.version;
    writeFileSync(output + `published/${prefix}-registry.json`, JSON.stringify(metadata, null, 2) + '\n');
    writeFileSync(output + `published/${prefix}.tgz`, bytes);
    results.push({
      variant,
      name,
      version: pkg.version,
      metadataUrl,
      tarballUrl: url.href,
      integrity,
      archive: `published/${prefix}.tgz`,
      bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
    });
  }
}
writeFileSync(
  output + 'published-sources.json',
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      method:
        'Credential-free exact version registry metadata and published tarballs; SHA-512 SRI verified before capture. Installed file SHA-256 manifests are in graphs.json. Archive source includes package licenses and declarations.',
      results,
    },
    null,
    2,
  ) + '\n',
);
console.log(JSON.stringify(results.map(({ name, version, bytes }) => ({ name, version, bytes }))));
