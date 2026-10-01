import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { join, resolve, relative } from 'node:path';
import { tmpdir } from 'node:os';
import approved from '../src/core/dependencies-approved.json';
import { verifyInstalledDependencies } from '../src/integrity/node.ts';

test('package file patches and unlisted nested resolution fail before interpretation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'atseq-integrity-'));
  try {
    for (const path of Object.keys(approved.packages)) {
      const source = resolve(path);
      await cp(source, join(root, path), {
        recursive: true,
        filter: (file) => !relative(source, file).split('/').includes('node_modules'),
      });
    }
    assert.doesNotThrow(() => verifyInstalledDependencies(true, root));
    const engine = join(root, 'node_modules/jsonata/jsonata.js'),
      original = await readFile(engine);
    await writeFile(engine, Buffer.concat([original, Buffer.from('\n// drift\n')]));
    assert.throws(() => verifyInstalledDependencies(true, root), { code: 'dependency_mismatch' });
    await writeFile(engine, original);
    const nested = join(root, 'node_modules/@atcute/cbor/node_modules/@atcute/cid');
    await mkdir(nested, { recursive: true });
    await writeFile(
      join(nested, 'package.json'),
      JSON.stringify({ name: '@atcute/cid', version: '9.9.9', main: 'index.js' }),
    );
    await writeFile(join(nested, 'index.js'), 'export const wrong=true;');
    assert.throws(() => verifyInstalledDependencies(true, root), { code: 'dependency_mismatch' });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
