import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { installedTree } from '../src/integrity/node.ts';
const json = (file: string) => JSON.parse(readFileSync(file, 'utf8'));
const historical = (file: string) =>
  JSON.parse(
    execFileSync('git', ['show', '3a40d2c5e230cd7698f9cd4b9e8e9729054be33e:' + file], {
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    }),
  );
const old = historical('src/integrity/files-approved.json');
const current = json('src/integrity/files-approved.json');
const oldPackages = historical('src/core/dependencies-approved.json');
const packages = json('src/core/dependencies-approved.json');
const added = Object.keys(current).filter((path) => !old[path]);
assert.equal(Object.keys(old).length, 147);
assert.equal(added.length, 47);
for (const path of Object.keys(old)) {
  assert.deepEqual(current[path], old[path]);
  assert.deepEqual(installedTree(path), old[path]);
  assert.deepEqual(packages.packages[path], oldPackages.packages[path]);
}
const before = historical('src/archive/notices.json');
const after = json('src/archive/notices.json');
const key = (entry: { name: string; version: string }) => entry.name + '@' + entry.version;
const names = new Set(before.map(key));
const result = {
  basis: '3a40d2c5e230cd7698f9cd4b9e8e9729054be33e',
  paths: 194,
  oldPaths: 147,
  preservedFiles: true,
  added,
  addedPackages: Object.fromEntries(added.map((path) => [path, packages.packages[path]])),
  noticeDelta: {
    before: before.length,
    after: after.length,
    added: after
      .filter((entry: any) => !names.has(key(entry)))
      .map(({ name, version, license }: any) => ({ name, version, license })),
    removed: before.filter((entry: any) => !after.some((candidate: any) => key(entry) === key(candidate))).map(key),
  },
  generatorChanged: false,
};
writeFileSync(
  'experiments/post-spike-evidence/2026-10-01/oauth-adapters/dependency-delta.json',
  JSON.stringify(result, null, 2) + '\n',
);
console.log(JSON.stringify({ paths: 194, added: added.length, preserved: 147, notices: result.noticeDelta }));
