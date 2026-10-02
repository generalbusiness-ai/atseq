import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { preparePackageBuild } from '../../../../../tests/helpers/package-build.ts';

const run = promisify(execFile);
const root = resolve('.');
const label = process.argv[2];
assert.match(label, /^node(?:22|24|26)$/);
const evidence = join(root, 'experiments/post-spike-evidence/2026-10-02/native-account-writer-aw-f2/final');
const directory = join(root, '.atseq-local', 'packed-writer-final-16f-' + label);
await mkdir(directory);
const env = { ...process.env };
delete env.NODE_OPTIONS;
const buildRoot = await preparePackageBuild(root, join(directory, 'build'));
const invoke = async (file: string, args: string[], cwd = directory) => {
  const result = await run(file, args, { cwd, env, maxBuffer: 16 * 1024 * 1024 });
  return result;
};
const build = await invoke('npm', ['run', 'build'], buildRoot);
await writeFile(join(evidence, 'packed-build-16f-' + label + '.log'), build.stdout + build.stderr);
const packed = await invoke('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', directory], buildRoot);
await writeFile(join(evidence, 'packed-pack-16f-' + label + '.json'), packed.stdout);
const [metadata] = JSON.parse(packed.stdout);
await writeFile(join(directory, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
const install = await invoke('npm', ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', join(directory, metadata.filename)]);
await writeFile(join(evidence, 'packed-install-16f-' + label + '.log'), install.stdout + install.stderr);
const installed = join(directory, 'node_modules/atseq');
const provenanceBytes = await readFile(join(installed, 'dist/build-provenance.json'));
const provenance = JSON.parse(provenanceBytes.toString());
const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
for (const [path, expected] of Object.entries(provenance.sourceHashes)) {
  assert.equal(hash(await readFile(join(root, path))), expected, path);
  assert.equal(hash(await readFile(join(installed, path))), expected, path);
}
for (const [path, expected] of Object.entries(provenance.outputHashes))
  assert.equal(hash(await readFile(join(installed, path))), expected, path);
const compiler = join(root, 'experiments/post-spike-evidence/2026-10-02/native-account-writer-aw-f2/preparation/compile-writer-gates.mjs');
const compiledLabel = 'final-packed-16f-' + label;
const compilation = await invoke(process.execPath, [compiler, root, compiledLabel, installed], root);
await writeFile(join(evidence, 'packed-compile-16f-' + label + '.log'), compilation.stdout + compilation.stderr);
const wrappers = join(root, '.atseq-local', 'writer-compiled-' + compiledLabel);
await writeFile(join(evidence, 'packed-compiled-pins-16f-' + label + '.json'), await readFile(join(wrappers, 'compiled-pins.json')));
await writeFile(join(evidence, 'packed-provenance-16f-' + label + '.json'), provenanceBytes);
await writeFile(join(evidence, 'packed-execution-pins-16f-' + label + '.json'), JSON.stringify({
  sourceProducer: '16f36988179a0ccacf1189eeb7b2b0e3453d6836',
  runtime: process.version, executable: process.execPath,
  executableSHA256: hash(await readFile(process.execPath)),
  tarball: metadata.filename, tarballSHA256: hash(await readFile(join(directory, metadata.filename))),
  npmMetadata: metadata, installed, wrappers,
  installedBuildProvenanceSHA256: hash(provenanceBytes),
  preparedBeforeExecution: new Date().toISOString(),
  boundary: 'Native writer remains internal: absolute installed dist import through test-only wrappers. No public export is added. Genuine Node OAuth loader and production integrity adapter use installed package outputs and its physical reviewed runtime closure. Synthetic AS and hostile configured SDK probes retain their separate labels.',
}, null, 2) + '\n');
const result = await invoke(process.execPath, ['--test',
  join(wrappers, 'tests/native-account-writer.test.js'),
  join(wrappers, 'tests/native-account-writer-dispatch.test.js'),
  join(wrappers, 'tests/native-account-writer-handoff.test.js'),
], root);
await writeFile(join(evidence, 'packed-native-16f-' + label + '.log'), result.stdout + result.stderr);
console.log(JSON.stringify({ runtime: process.version, producer: '16f36988179a0ccacf1189eeb7b2b0e3453d6836',
  installedSourceAndOutputHashesVerified: true, genuineMaintainedPackedNativeWriter: true, publicProviderExecuted: false }));
