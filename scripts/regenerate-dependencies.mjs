// Run only after an independently reviewed dependency decision, from its clean
// installed candidate. Regeneration records bytes; it does not approve them.
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { installedTree, resolvedPackage } from '../src/integrity/node.ts';
import { isNonExecutedPeer, NON_EXECUTED_PEERS } from '../src/core/dependency-peers.ts';
const root = process.cwd();
const manifest = JSON.parse(await readFile('package.json', 'utf8'));
const lock = JSON.parse(await readFile('npm-shrinkwrap.json', 'utf8'));
const approval = JSON.parse(await readFile('src/core/dependencies-approved.json', 'utf8'));
const seen = new Set();
async function visit(path) {
  assert.ok(path, 'Missing installed dependency');
  if (seen.has(path)) return;
  seen.add(path);
  const actual = JSON.parse(await readFile(path + '/package.json', 'utf8'));
  assert.equal(actual.version, lock.packages[path].version, path);
  for (const name of Object.keys(actual.dependencies ?? {})) await visit(resolvedPackage(path, name, root));
  for (const name of [
    ...Object.keys(actual.optionalDependencies ?? {}),
    ...Object.keys(actual.peerDependencies ?? {}),
  ]) {
    if (isNonExecutedPeer(actual, name)) continue;
    const target = resolvedPackage(path, name, root);
    if (target) await visit(target);
  }
}
for (const name of Object.keys(manifest.dependencies)) await visit(resolvedPackage('', name, root));
const paths = [...seen].sort(),
  packages = {},
  files = {};
for (const path of paths) {
  const actual = JSON.parse(await readFile(path + '/package.json', 'utf8'));
  packages[path] = {
    version: actual.version,
    integrity: lock.packages[path].integrity,
    ...Object.fromEntries(
      ['dependencies', 'optionalDependencies', 'peerDependencies', 'peerDependenciesMeta']
        .filter((key) => actual[key] !== undefined)
        .map((key) => [key, actual[key]]),
    ),
  };
  files[path] = installedTree(path, root);
  lock.packages[path].inBundle = true;
}
assert.equal(manifest.bundleDependencies, true, 'Bundle the full runtime closure');
lock.packages[''].bundleDependencies = true;
approval.direct = manifest.dependencies;
approval.packages = packages;
approval.nonExecutedPeers = NON_EXECUTED_PEERS;
approval.approval =
  'I1 maintained PLC/parser/transport additions under ratified cc21a77c and e00cf34a; exact-head conformance required; atseq-app-v2 unchanged';
approval.imports = manifest.imports;
const sourcePath = 'src/core/dependencies.ts';
let source = await readFile(sourcePath, 'utf8');
source = source.replace(
  /import installed0[\s\S]*?(?=import approved)/,
  paths
    .map((path, index) => `import installed${index} from '../../${path}/package.json' with { type: 'json' };`)
    .join('\n') + '\n',
);
source = source.replace(
  /const installed: \[string, unknown\]\[\] = \[[\s\S]*?\n\];/,
  'const installed: [string, unknown][] = [\n' +
    paths.map((path, index) => `  ['${path}', installed${index}],`).join('\n') +
    '\n];',
);
await writeFile(sourcePath, source);
await writeFile('src/core/dependencies-approved.json', JSON.stringify(approval, null, 2) + '\n');
await writeFile('src/integrity/files-approved.json', JSON.stringify(files, null, 2) + '\n');
await writeFile('npm-shrinkwrap.json', JSON.stringify(lock, null, 2) + '\n');
console.log('Recorded installed runtime closure:', paths.length, 'paths; optional valibot typechecking peer excluded.');
