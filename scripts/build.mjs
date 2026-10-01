import { rm, readFile, writeFile, chmod } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
await rm(resolve(root, 'dist'), { recursive: true, force: true });
const compiled = spawnSync(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['exec', '--', 'tsc', '-p', 'tsconfig.build.json'],
  { cwd: root, stdio: 'inherit' },
);
if (compiled.status !== 0) process.exit(compiled.status ?? 1);
// TypeScript copies project JSON beside the emitted src tree. These two imports
// must keep referring to the installed package root, not create a package scope in dist.
const metadata = resolve(root, 'dist/src/core/dependencies.js');
await writeFile(
  metadata,
  (await readFile(metadata, 'utf8'))
    .replaceAll("from '../../node_modules/", "from '../../../node_modules/")
    .replace("from '../../package.json'", "from '../../../package.json'")
    .replace("from '../../npm-shrinkwrap.json'", "from '../../../npm-shrinkwrap.json'"),
);
for (const name of ['package.json', 'npm-shrinkwrap.json']) await rm(resolve(root, 'dist', name), { force: true });
for (const name of ['cli/main.js', 'host/main.js']) await chmod(resolve(root, 'dist/src', name), 0o755);
const { verifyInstalledDependencies } = await import('../dist/src/integrity/node.js');
verifyInstalledDependencies();
// Upstream Inlay emits an extensionless generated import that native Node cannot load.
// Bundle its core and renderer together so their element identity remains shared.
const { build } = await import('vite');
await build({
  configFile: false,
  logLevel: 'warn',
  build: {
    outDir: resolve(root, 'dist/vendor'),
    emptyOutDir: true,
    minify: false,
    lib: { entry: resolve(root, 'src/view/render-adapter.ts'), formats: ['es'], fileName: () => 'inlay.js' },
  },
});
await writeFile(
  resolve(root, 'dist/src/view/render-adapter.js'),
  "export { $, deserializeTree, isValidElement, render, MissingError } from '../../vendor/inlay.js';\n",
);
const outputHashes = {};
async function hash(directory, hashes) {
  for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) {
    const path = directory + '/' + entry.name;
    if (entry.isDirectory()) await hash(path, hashes);
    else
      hashes[path] = createHash('sha256')
        .update(await readFile(resolve(root, path)))
        .digest('hex');
  }
}
await hash('dist', outputHashes);
const sourceHashes = {};
for (const directory of ['src', 'lexicons']) await hash(directory, sourceHashes);
for (const path of ['scripts/build.mjs', 'tsconfig.json', 'tsconfig.build.json', 'package.json', 'npm-shrinkwrap.json'])
  sourceHashes[path] = createHash('sha256')
    .update(await readFile(resolve(root, path)))
    .digest('hex');
const { supportedProfiles } = await import('../dist/src/protocol/identity.js');
const compiler = JSON.parse(await readFile(resolve(root, 'node_modules/typescript/package.json'), 'utf8'));
await writeFile(
  resolve(root, 'dist/build-provenance.json'),
  JSON.stringify(
    {
      format: 'atseq-package-build-provenance',
      version: 1,
      node: process.version,
      compiler: { name: 'typescript', version: compiler.version },
      semanticContracts: await supportedProfiles(),
      sourceHashes,
      outputHashes,
    },
    null,
    2,
  ) + '\n',
);
console.log('TypeScript public APIs and executables built; installed runtime file closure verified.');
