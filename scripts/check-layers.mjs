import { readdir, readFile } from 'node:fs/promises';
import { builtinModules } from 'node:module';
import { dirname, join, resolve, relative } from 'node:path';
import { ts } from 'ts-morph';
const portable = ['core', 'protocol', 'runtime', 'view', 'definition', 'application', 'transport', 'archive', 'client'];
const lower = ['core', 'protocol', 'runtime', 'view', 'definition', 'application', 'transport'];
const allowed = {
  core: ['core'],
  protocol: ['core', 'protocol'],
  runtime: ['core', 'runtime'],
  view: ['core', 'view'],
  definition: ['core', 'protocol', 'runtime', 'view', 'definition'],
  application: ['core', 'protocol', 'runtime', 'view', 'definition', 'application'],
  transport: ['core', 'protocol', 'transport'],
  archive: [...lower, 'archive'],
  client: [...lower, 'client'],
  host: [...lower, 'host', 'integrity', 'storage'],
  cli: [...lower, 'archive', 'client', 'cli', 'storage'],
  browser: [...lower, 'archive', 'client', 'browser'],
  integrity: ['core', 'integrity'],
  storage: ['storage'],
};
const builtins = new Set(builtinModules.map((name) => name.replace(/^node:/, '')));
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
    if (!allowed[layer]) {
      failures.push(`${file}: undocumented source layer`);
      continue;
    }
    const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    function inspect(specifier) {
      if (!ts.isStringLiteralLike(specifier)) {
        failures.push(`${file}: computed import is not allowed`);
        return;
      }
      const name = specifier.text;
      if (name === '#atseq-integrity') {
        if (layer !== 'core') failures.push(`${file}: only core selects the conditional integrity adapter`);
        return;
      }
      if (!name.startsWith('.')) {
        if (portable.includes(layer) && (name.startsWith('node:') || builtins.has(name)))
          failures.push(`${file}: portable layer imports ${name}`);
        return;
      }
      const target = relative(resolve('src'), resolve(dirname(file), name));
      if (target.startsWith('../')) return;
      const other = target.split('/')[0];
      if (!allowed[layer].includes(other)) failures.push(`${file}: ${layer} imports ${other} (${name})`);
    }
    function visit(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier)
        inspect(node.moduleSpecifier);
      if (
        ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
      ) {
        if (!node.arguments[0]) failures.push(`${file}: empty dynamic import`);
        else inspect(node.arguments[0]);
      }
      ts.forEachChild(node, visit);
    }
    visit(tree);
    if (layer !== 'core' && /['"]test\.[a-z][a-z0-9.]*|candidate-[0-9]/.test(source))
      failures.push(`${file}: obsolete wire identity`);
  }
}
await check('src');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log('Every source layer, portable import and wire identity checked.');
