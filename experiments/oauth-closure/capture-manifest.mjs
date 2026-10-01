import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
const output = 'experiments/post-spike-evidence/2026-10-01/oauth-closure/';
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
mkdirSync(output + 'logs', { recursive: true });
for (const name of readdirSync('/tmp')
  .filter((name) => /^atseq-oauth-.*\.log$/.test(name) && name !== 'atseq-oauth-manifest.log')
  .sort()) {
  copyFileSync('/tmp/' + name, output + 'logs/' + name);
}
const graphs = JSON.parse(readFileSync(output + 'graphs.json')).results;
const engines = Object.fromEntries(
  Object.entries(graphs).map(([variant, graph]) => [
    variant,
    graph.nodes
      .filter((node) => node.engines?.node)
      .map(({ path, name, version, engines }) => ({ path, name, version, range: engines.node })),
  ]),
);
writeFileSync(
  output + 'node-engines.json',
  JSON.stringify(
    {
      method: 'Installed package Node engine declarations, not an execution claim for each package',
      effectiveFoundationFloor: '22.19.0',
      results: engines,
    },
    null,
    2,
  ) + '\n',
);
const commands = {
  basis:
    'git show fb5acd9ac3876de93917348e3ac12e080a885ef0:<package.json|npm-shrinkwrap.json|dependency and file approvals>',
  tools: 'npm ci --no-audit --ignore-scripts (worktree tools only; root manifest/lock unchanged)',
  candidateFoundation:
    'npm ci --omit=dev --ignore-scripts --no-audit --no-fund (each of six isolated manifest/shrinkwrap copies)',
  candidateInstall:
    'npm install --save-exact --omit=dev --ignore-scripts --no-audit --no-fund <exact pins in retained candidate manifest>; foundation has no install additions',
  graph: 'node experiments/oauth-closure/graph.mjs',
  bundles: 'node experiments/oauth-closure/bundle.mjs',
  nodeCurrent: 'node experiments/oauth-closure/node-probe.mjs current',
  nodeFloor: 'npm exec --yes --package=node@22.19.0 -- node experiments/oauth-closure/node-probe.mjs floor',
  browserDiscovery: 'node experiments/oauth-closure/browser-probe.mjs',
  browserStorage: 'node experiments/oauth-closure/browser-storage-probe.mjs',
  publishedSources: 'node experiments/oauth-closure/source-capture.mjs',
  evidenceAssertions: 'node experiments/oauth-closure/validate-evidence.mjs',
};
const failures = [
  {
    logs: ['logs/atseq-oauth-browser-probe.log'],
    kind: 'Harness assertion failed before sufficient outcome logging; retained original stderr',
  },
  {
    logs: ['logs/atseq-oauth-browser-probe-attempt2.log'],
    kind: 'Harness omitted official required identityResolver/handleResolver option; corrected resolver stub in final public construction',
  },
  {
    logs: ['browser-storage-attempt1.log'],
    kind: 'Harness observed databases before asynchronous open completed; public dispose waits for opens in corrected probe',
  },
  {
    logs: ['browser-storage-attempt2.log'],
    kind: 'Harness diagnostic referenced result before initialization; corrected',
  },
  {
    logs: ['logs/atseq-oauth-node-probe-final.log'],
    kind: 'Harness invocation omitted required current/floor argument; both final explicit-argument commands succeeded',
  },
];
for (const failure of failures) for (const path of failure.logs) assert.ok(statSync(output + path).isFile());
function files(root) {
  return readdirSync(root, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(root, entry.name);
      if (entry.isDirectory()) return files(path);
      if (!entry.isFile() || entry.name === 'capture-manifest.json') return [];
      const bytes = readFileSync(path);
      return [{ path: relative(output, path), bytes: bytes.length, sha256: sha256(bytes) }];
    })
    .sort((a, b) => a.path.localeCompare(b.path, 'en'));
}
const sources = readdirSync('experiments/oauth-closure')
  .filter((name) => name.endsWith('.mjs') || name.endsWith('.py'))
  .sort()
  .map((name) => ({
    path: 'experiments/oauth-closure/' + name,
    sha256: sha256(readFileSync('experiments/oauth-closure/' + name)),
  }));
writeFileSync(
  output + 'capture-manifest.json',
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      worktreeBase: '4b6ebab532d0ae1de5adbbe3326d70e0a80f0136',
      projectedFoundation: 'fb5acd9ac3876de93917348e3ac12e080a885ef0',
      node: process.version,
      commands,
      successfulFinalExitCodes: {
        candidateCI: 0,
        candidateInstalls: 0,
        graph: 0,
        bundles: 0,
        nodeCurrent: 0,
        nodeFloor: 0,
        browserDiscovery: 0,
        browserStorage: 0,
        publishedSources: 0,
        evidenceAssertions: 0,
      },
      failures,
      sources,
      report: {
        path: 'notes/2026-10-01-atseq-oauth-client-comparison.md',
        sha256: sha256(readFileSync('notes/2026-10-01-atseq-oauth-client-comparison.md')),
      },
      instructions: {
        path: 'experiments/oauth-closure/README.md',
        sha256: sha256(readFileSync('experiments/oauth-closure/README.md')),
      },
      files: files(output),
      limits: [
        'Public registry downloads and loopback synthetic browser probes only; no live credentials or provider communication',
        'A global fetch sentinel is an isolated observation tool, not an adopted production seam',
        'No production implementation, family decision, build/full-suite/provider acceptance or performance measurement',
      ],
    },
    null,
    2,
  ) + '\n',
);
console.log('Capture inventory written');
