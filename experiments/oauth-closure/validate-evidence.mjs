import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const output = 'experiments/post-spike-evidence/2026-10-01/oauth-closure/';
const read = (name) => JSON.parse(readFileSync(output + name));
const graphs = read('graphs.json').results;
assert.equal(graphs.foundation.runtimePaths, 147);
assert.deepEqual(graphs.atcute.delta.changed, []);
for (const variant of ['official-preserved', 'hybrid-preserved']) {
  assert.deepEqual(graphs[variant].delta.changed, []);
  assert.deepEqual(graphs[variant].delta.removed, []);
}
const bundles = read('bundles.json').results;
assert.equal(bundles.length, 20);
assert.ok(bundles.every((row) => !row.failed));
for (const row of bundles) {
  const prefix = `${row.variant}-${row.platform}${row.mode === 'full' ? '' : '-minimal'}`;
  const bytes = readFileSync(output + prefix + '-bundle.js');
  assert.equal(bytes.length, row.bundleBytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), row.bundleSha256);
}
for (const variant of ['hybrid', 'official-preserved', 'hybrid-preserved']) {
  for (const mode of ['full', 'minimal']) {
    const row = bundles.find((r) => r.variant === variant && r.platform === 'browser' && r.mode === mode);
    const base = bundles.find((r) => r.variant === 'official' && r.platform === 'browser' && r.mode === mode);
    assert.equal(row.bundleSha256, base.bundleSha256);
  }
}
for (const suffix of ['current', 'floor']) {
  const probe = read(`node-${suffix}.json`);
  if (suffix === 'floor') assert.equal(probe.node, 'v22.19.0');
  assert.equal(probe.outcomes.length, 2);
  for (const row of probe.outcomes) {
    assert.ok(row.calls.injected.length > 0);
    assert.equal(row.calls.ambient.length, 0);
  }
}
const browser = read('browser-seams.json');
assert.equal(browser.outcomes[0].calls.ambient.length, 0);
assert.ok(browser.outcomes[0].calls.injected.length > 0);
assert.equal(browser.outcomes[1].calls.injected.length, 0);
assert.ok(browser.outcomes[1].calls.ambient.length > 0);
const storage = read('browser-storage.json');
assert.deepEqual(storage.outcomes[0].indexedDBNames, ['@atproto-oauth-client']);
assert.deepEqual(storage.outcomes[1].localStorageKeys, ['atseq-publisher:version', 'atseq-runtime:version']);
const published = read('published-sources.json');
for (const row of published.results) {
  const bytes = readFileSync(output + row.archive);
  assert.equal('sha512-' + createHash('sha512').update(bytes).digest('base64'), row.integrity);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), row.sha256);
}
writeFileSync(
  output + 'evidence-validation.json',
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      node: process.version,
      passed: true,
      checked: {
        foundationPaths: 147,
        preservedVariants: 2,
        bundleRows: bundles.length,
        minimumNode: '22.19.0',
        nodeDiscoveryClients: 2,
        browserDiscoveryClients: 2,
        browserStorageClients: 2,
        publishedArchives: published.results.length,
      },
      limits: [
        'Source/isolated-candidate evidence only; no production implementation or provider success',
        'All-network source trace still needs adapter edge tests before enrolment acceptance',
      ],
    },
    null,
    2,
  ) + '\n',
);
console.log('Evidence assertions passed');
