import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve, relative } from 'node:path';
const allowed = {
  core: ['core'],
  protocol: ['core', 'protocol'],
  runtime: ['core', 'runtime'],
  view: ['core', 'view'],
  definition: ['core', 'protocol', 'runtime', 'view', 'definition'],
  application: ['core', 'protocol', 'runtime', 'view', 'definition', 'application'],
  transport: ['core', 'protocol', 'transport'],
  host: ['core', 'protocol', 'runtime', 'view', 'definition', 'application', 'transport', 'host'],
};
const failures = [];
async function check(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) {
      await check(file);
      continue;
    }
    if (!file.endsWith('.ts')) continue;
    const source = await readFile(file, 'utf8'),
      layer = relative('src', file).split('/')[0];
    for (const match of source.matchAll(/(?:from\s*|import\s*\(\s*)['"]([^'"]+)['"]/g)) {
      const name = match[1];
      if (!name.startsWith('.')) {
        if (
          ['core', 'protocol', 'runtime', 'view', 'definition', 'application', 'transport'].includes(layer) &&
          name.startsWith('node:')
        )
          failures.push(`${file}: portable layer imports ${name}`);
        continue;
      }
      const target = relative(resolve('src'), resolve(dirname(file), name));
      if (target.startsWith('../')) continue;
      const other = target.split('/')[0];
      if (allowed[layer] && !allowed[layer].includes(other))
        failures.push(`${file}: ${layer} imports ${other} (${name})`);
    }
    if (layer !== 'core' && /['"]test\.[a-z][a-z0-9.]*|candidate-[0-9]/.test(source))
      failures.push(`${file}: obsolete wire identity`);
  }
}
await check('src');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log('Source dependency directions and wire identities checked.');
