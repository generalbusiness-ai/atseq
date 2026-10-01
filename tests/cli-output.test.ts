import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, symlink, link, rm, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { writeOutput } from '../src/cli/output.ts';

test('outputs require explicit overwrite and never replace key/intent aliases', async () => {
  const root = await mkdtemp(join(tmpdir(), 'atseq-cli-output-'));
  try {
    const key = join(root, 'key.json'),
      output = join(root, 'output.json');
    await writeFile(key, 'secret', { mode: 0o600 });
    await writeOutput(output, 'first');
    await assert.rejects(() => writeOutput(output, 'second'), { code: 'file_exists' });
    assert.equal(await readFile(output, 'utf8'), 'first');
    await writeOutput(output, 'second', { overwrite: true });
    assert.equal(await readFile(output, 'utf8'), 'second');
    const alias = join(root, 'key-alias.json'),
      hard = join(root, 'hard-key.json');
    await symlink(key, alias);
    await link(key, hard);
    for (const path of [key, alias, hard])
      await assert.rejects(() => writeOutput(path, 'destroyed', { overwrite: true, protectedFiles: [key] }), {
        code: 'protected_file',
      });
    assert.equal(await readFile(key, 'utf8'), 'secret');
    assert.ok(!(await readdir(root)).some((name) => name.endsWith('.tmp')));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test('CAR output cannot enter its source through a directory alias or missing descendant', async () => {
  const root = await mkdtemp(join(tmpdir(), 'atseq-cli-source-'));
  try {
    const source = join(root, 'source'),
      alias = join(root, 'alias');
    await mkdir(source);
    await symlink(source, alias);
    await assert.rejects(
      () => writeOutput(join(alias, 'nested', 'definition.car'), 'bytes', { sourceDirectory: source }),
      { code: 'source_output' },
    );
    await writeOutput(join(root, 'definition.car'), 'bytes', { sourceDirectory: alias });
    assert.equal(await readFile(join(root, 'definition.car'), 'utf8'), 'bytes');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
