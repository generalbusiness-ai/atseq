import test from 'node:test';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { join, resolve, relative } from 'node:path';
import { realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import approved from '../src/core/dependencies-approved.json';
import { verifyInstalledDependencies } from '../src/integrity/node.ts';

test('Node resolution consumes stdin payloads larger than 64 KiB', () => {
  const installationRoot = realpathSync(resolve('.'));
  const edges = Array.from({ length: 4_096 }, () => ({
    parent: '',
    name: 'jsonata',
    target: 'node_modules/jsonata',
  }));
  const payloadBytes = Buffer.byteLength(
    JSON.stringify(
      edges.map((edge) => ({ ...edge, parent: pathToFileURL(join(installationRoot, 'package.json')).href })),
    ),
  );
  assert.ok(payloadBytes > 256 * 1024, `Regression must exceed 256 KiB: ${payloadBytes} bytes`);
  const probe = `import assert from 'node:assert/strict';
    import {resolveDependencyEdges} from ${JSON.stringify(resolve('src/integrity/node.ts'))};
    const edges=Array.from({length:4_096},()=>({parent:'',name:'jsonata',target:'node_modules/jsonata'}));
    const expected=${JSON.stringify(realpathSync(resolve('node_modules/jsonata/jsonata.js')))};
    for(let iteration=0;iteration<20;iteration++){
      const resolutions=resolveDependencyEdges(edges,${JSON.stringify(installationRoot)});
      assert.equal(resolutions.length,edges.length);
      for(const modes of resolutions)assert.deepEqual(modes,[expected,expected]);
    }
    process.stdout.write('20 complete batches');`;
  // A separate timed process bounds this regression even if its synchronous
  // adapter call deadlocks. It runs the production child, not a script copy.
  assert.equal(
    execFileSync(
      process.execPath,
      ['--import', resolve('node_modules/tsx/dist/loader.mjs'), '--input-type=module', '-e', probe],
      { encoding: 'utf8', timeout: 30_000 },
    ),
    '20 complete batches',
  );
});

test('package file patches and unlisted nested resolution fail before interpretation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'atseq-integrity-'));
  try {
    await cp(resolve('package.json'), join(root, 'package.json'));
    await cp(resolve('npm-shrinkwrap.json'), join(root, 'npm-shrinkwrap.json'));
    await cp(resolve('src'), join(root, 'src'), { recursive: true });
    await cp(resolve('lexicons'), join(root, 'lexicons'), { recursive: true });
    for (const path of Object.keys(approved.packages)) {
      const source = resolve(path);
      await cp(source, join(root, path), {
        recursive: true,
        filter: (file) => !relative(source, file).startsWith('node_modules'),
      });
    }
    assert.doesNotThrow(() => verifyInstalledDependencies(true, root));
    const engine = join(root, 'node_modules/jsonata/jsonata.js'),
      original = await readFile(engine);
    await writeFile(engine, Buffer.concat([original, Buffer.from('\n// drift\n')]));
    assert.throws(() => verifyInstalledDependencies(true, root), { code: 'dependency_mismatch' });
    const probe = `import {decodeBlock} from ${JSON.stringify(join(root, 'src/protocol/wire.ts'))};
      try{decodeBlock(new Uint8Array([0xa0]));process.exitCode=1;}
      catch(error){if(error.code!=='dependency_mismatch')throw error;}`;
    assert.doesNotThrow(() =>
      execFileSync(
        process.execPath,
        ['--import', resolve('node_modules/tsx/dist/loader.mjs'), '--input-type=module', '-e', probe],
        { cwd: root },
      ),
    );
    await writeFile(engine, original);
    const nested = join(root, 'node_modules/@atcute/cbor/node_modules/@atcute/cid');
    await mkdir(nested, { recursive: true });
    await writeFile(
      join(nested, 'package.json'),
      JSON.stringify({ name: '@atcute/cid', version: '9.9.9', main: 'index.js' }),
    );
    await writeFile(join(nested, 'index.js'), 'export const wrong=true;');
    assert.throws(() => verifyInstalledDependencies(true, root), { code: 'dependency_mismatch' });
    await rm(join(root, 'node_modules/@atcute/cbor/node_modules'), { recursive: true });
    for (const shadow of [
      'src/runtime/node_modules/jsonata',
      'node_modules/@atcute/cbor/dist/node_modules/@atcute/cid',
    ]) {
      await mkdir(join(root, shadow), { recursive: true });
      await writeFile(join(root, shadow, 'package.json'), JSON.stringify({ name: 'shadow', version: '9.9.9' }));
      assert.throws(() => verifyInstalledDependencies(true, root), { code: 'dependency_mismatch' });
      await rm(join(root, shadow.split('/node_modules/')[0]!, 'node_modules'), { recursive: true });
    }
    const manifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
    await writeFile(
      join(root, 'src/runtime/package.json'),
      JSON.stringify({ name: 'jsonata', exports: './shadow.cjs' }),
    );
    assert.throws(() => verifyInstalledDependencies(true, root), { code: 'dependency_mismatch' });
    await rm(join(root, 'src/runtime/package.json'));
    manifest.imports['#atseq-integrity'].node = './src/integrity/browser.ts';
    await writeFile(join(root, 'package.json'), JSON.stringify(manifest));
    assert.throws(() => verifyInstalledDependencies(true, root), { code: 'dependency_mismatch' });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
