import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, relative, join } from 'node:path';
import { createHash } from 'node:crypto';

const output = 'experiments/post-spike-evidence/2026-10-01/oauth-closure/';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const results = {};
for (const variant of ['foundation', 'official', 'atcute', 'hybrid', 'official-preserved', 'hybrid-preserved']) {
  const root = resolve('.tmp/oauth-closure/' + variant);
  const project = JSON.parse(readFileSync(join(root, 'package.json')));
  const lock = JSON.parse(readFileSync(join(root, 'npm-shrinkwrap.json')));
  const nodes = new Map(),
    edges = [],
    excluded = [];
  function locate(parent, name) {
    for (let base = parent; base.startsWith(root); base = dirname(base)) {
      const candidate = join(base, 'node_modules', name);
      if (existsSync(join(candidate, 'package.json'))) return candidate;
      if (base === root) break;
    }
  }
  function files(path, base = path) {
    return readdirSync(path, { withFileTypes: true })
      .flatMap((entry) => {
        if (entry.name === 'node_modules') return [];
        const full = join(path, entry.name);
        if (entry.isDirectory()) return files(full, base);
        if (!entry.isFile()) return [];
        return [{ path: relative(base, full), bytes: statSync(full).size, sha256: hash(readFileSync(full)) }];
      })
      .sort((a, b) => a.path.localeCompare(b.path, 'en'));
  }
  function visit(path) {
    const name = relative(root, path);
    if (nodes.has(name)) return;
    const pkg = JSON.parse(readFileSync(join(path, 'package.json')));
    const listing = files(path),
      entry = lock.packages[name];
    assert.ok(entry, name);
    nodes.set(name, {
      path: name,
      name: pkg.name,
      version: pkg.version,
      engines: pkg.engines ?? null,
      resolved: entry.resolved ?? null,
      integrity: entry.integrity ?? null,
      dependencies: pkg.dependencies ?? {},
      peerDependencies: pkg.peerDependencies ?? {},
      peerDependenciesMeta: pkg.peerDependenciesMeta ?? {},
      optionalDependencies: pkg.optionalDependencies ?? {},
      bytes: listing.reduce((sum, file) => sum + file.bytes, 0),
      files: listing,
    });
    for (const kind of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
      for (const dependency of Object.keys(pkg[kind] ?? {}).sort()) {
        if (
          kind === 'peerDependencies' &&
          pkg.name === 'valibot' &&
          pkg.version === '1.5.0' &&
          dependency === 'typescript' &&
          pkg.peerDependencies?.typescript === '>=5' &&
          pkg.peerDependenciesMeta?.typescript?.optional === true
        ) {
          excluded.push({
            parent: name,
            kind,
            dependency,
            reason: 'I1 named non-executed optional Valibot TypeScript peer',
          });
          continue;
        }
        const child = locate(path, dependency);
        if (!child) {
          assert.ok(kind !== 'dependencies', `${name}: missing ${dependency}`);
          edges.push({ parent: name, kind, dependency, missing: true });
          continue;
        }
        edges.push({ parent: name, kind, dependency, range: pkg[kind][dependency], child: relative(root, child) });
        visit(child);
      }
    }
  }
  for (const name of Object.keys(project.dependencies).sort()) {
    const path = locate(root, name);
    assert.ok(path, name);
    edges.push({
      parent: '',
      kind: 'dependencies',
      dependency: name,
      range: project.dependencies[name],
      child: relative(root, path),
    });
    visit(path);
  }
  const sorted = [...nodes.values()].sort((a, b) => a.path.localeCompare(b.path, 'en'));
  results[variant] = {
    rootManifestSha256: hash(readFileSync(join(root, 'package.json'))),
    lockSha256: hash(readFileSync(join(root, 'npm-shrinkwrap.json'))),
    direct: project.dependencies,
    nodeFloor: project.engines,
    runtimePaths: sorted.length,
    bytes: sorted.reduce((sum, node) => sum + node.bytes, 0),
    nodes: sorted,
    edges,
    excluded,
  };
  writeFileSync(output + variant + '-package.json', readFileSync(join(root, 'package.json')));
  writeFileSync(output + variant + '-shrinkwrap.json', readFileSync(join(root, 'npm-shrinkwrap.json')));
}
const approved = JSON.parse(readFileSync(output + 'foundation-dependencies-approved.json'));
assert.deepEqual(results.foundation.nodes.map((node) => node.path).sort(), Object.keys(approved.packages).sort());
assert.equal(results.foundation.runtimePaths, 147);
for (const variant of ['official', 'atcute', 'hybrid', 'official-preserved', 'hybrid-preserved']) {
  const base = new Map(results.foundation.nodes.map((node) => [node.path, node]));
  const next = new Map(results[variant].nodes.map((node) => [node.path, node]));
  results[variant].delta = {
    added: [...next.keys()].filter((path) => !base.has(path)),
    removed: [...base.keys()].filter((path) => !next.has(path)),
    changed: [...base.keys()].filter(
      (path) => next.has(path) && JSON.stringify(base.get(path)) !== JSON.stringify(next.get(path)),
    ),
    runtimePaths: next.size - base.size,
    bytes: results[variant].bytes - results.foundation.bytes,
  };
}
writeFileSync(
  output + 'graphs.json',
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      node: process.version,
      method:
        'Exact installed runtime closure follows all direct, required, installed optional and installed peer edges. Only I1 named optional non-executed Valibot TypeScript peer is excluded. Bytes include actual files/docs/maps/declarations, excluding separately counted nested node_modules.',
      results,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  JSON.stringify(
    Object.fromEntries(
      Object.entries(results).map(([name, result]) => [
        name,
        { paths: result.runtimePaths, bytes: result.bytes, delta: result.delta },
      ]),
    ),
  ),
);
