import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname, relative, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { ts } from 'ts-morph';
const root = process.cwd(),
  out = join(root, '.atseq-local/r0-native/compiled'),
  seen = new Set(),
  pins = {};
async function compile(file) {
  const target = join(out, relative(root, file).replace(/\.ts$/, '.js'));
  if (seen.has(file)) return target;
  seen.add(file);
  let source = await readFile(file, 'utf8');
  pins[relative(root, file)] = createHash('sha256').update(source).digest('hex');
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true),
    edits = [];
  for (const item of tree.statements) {
    if (!ts.isImportDeclaration(item) || item.importClause?.isTypeOnly || !ts.isStringLiteral(item.moduleSpecifier))
      continue;
    const name = item.moduleSpecifier.text;
    if (!name.startsWith('.')) continue;
    const original = resolve(dirname(file), name);
    const actual = original.startsWith(join(root, 'src') + '/')
      ? join(root, 'dist', relative(root, original).replace(/\.ts$/, '.js'))
      : await compile(original);
    edits.push({
      start: item.moduleSpecifier.getStart(tree),
      end: item.moduleSpecifier.end,
      value: JSON.stringify(pathToFileURL(actual).href),
    });
  }
  for (const edit of edits.reverse()) source = source.slice(0, edit.start) + edit.value + source.slice(edit.end);
  const code = ts.transpileModule(source, {
    fileName: file,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText;
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, code);
  return target;
}
const probe = await compile(join(root, 'experiments/r0-native/probe.ts'));
await writeFile(
  join(out, 'pins.json'),
  JSON.stringify(
    { probe, sourceHashes: pins, scope: 'experiment transpilation; all production src imports use actual dist' },
    null,
    2,
  ) + '\n',
);
console.log(JSON.stringify({ probe, pins: Object.keys(pins).length }));
