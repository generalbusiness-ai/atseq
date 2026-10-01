import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, readlink, realpath, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';
import { preparePackageBuild } from '../../../../tests/helpers/package-build.ts';
import { verifyInstalledDependencies } from '../../../../src/integrity/node.ts';
const root = resolve('.'), directory = await mkdtemp(join(tmpdir(), 'atseq-copy-probe-'));
try {
  const stage = await preparePackageBuild(root, join(directory, 'build'));
  const original = await readFile(join(root, 'package.json'));
  assert.deepEqual(await readFile(join(stage, 'package.json')), original);
  assert.notEqual((await stat(join(root, 'package.json'))).ino, (await stat(join(stage, 'package.json'))).ino);
  await writeFile(join(stage, 'package.json'), Buffer.concat([original, Buffer.from('\n')]));
  assert.deepEqual(await readFile(join(root, 'package.json')), original);
  await writeFile(join(stage, 'package.json'), original);
  const binary = join(stage, 'node_modules/.bin/tsc'), target = await readlink(binary);
  assert.equal(isAbsolute(target), false);
  assert.ok((await realpath(binary)).startsWith((await realpath(stage)) + '/node_modules/'));
  await assert.rejects(stat(join(stage, 'dist')), { code: 'ENOENT' });
  const lock = 'node_modules/.package-lock.json';
  assert.deepEqual(await readFile(join(stage, lock)), await readFile(join(root, lock)));
  verifyInstalledDependencies(true, stage);
  console.log(JSON.stringify({
    node: process.version, platform: process.platform, architecture: process.arch,
    exactManifest: true, independentWritableCopy: true, relativeBinaryResolvesInsideStage: true,
    sharedDistExcluded: true, unchangedHiddenLockBytes: true, stagedDependencyIntegrity: true,
    helperSha256: createHash('sha256').update(await readFile('tests/helpers/package-build.ts')).digest('hex'),
  }, null, 2));
} finally {
  await rm(directory, { recursive: true, force: true });
}
