import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, resolve, dirname, relative } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = resolve(process.argv[2]);
const label = process.argv[3];
if (!/^[a-z0-9-]+$/.test(label)) throw Error('Explicit unique capture label required');
const out = join(root, '.atseq-local', 'writer-compiled-' + label);
const productionRoot = process.argv[4] ? resolve(process.argv[4]) : root;
const { ts } = await import(pathToFileURL(join(root, 'node_modules/ts-morph/dist/ts-morph.js')));
const sourceHashes = {}, outputHashes = {}, productionOutputs = {}, emitted = new Set();
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
async function pinSource(file) {
  const bytes = await readFile(file);
  sourceHashes[relative(root, file)] = hash(bytes);
  return bytes;
}
async function compile(file) {
  const target = join(out, relative(root, file).replace(/\.ts$/, '.js'));
  if (emitted.has(file)) return target;
  emitted.add(file);
  let source = (await pinSource(file)).toString('utf8');
  if (relative(root, file) === 'tests/helpers/writer-process.ts') {
    const child = await compile(join(root, 'tests/helpers/writer-child.ts'));
    source = source.replace("new URL('./writer-child.ts', import.meta.url)", 'new URL(' + JSON.stringify(pathToFileURL(child).href) + ')')
      .replace("execArgv: ['--import', 'tsx']", 'execArgv: []');
  }
  if (['tests/native-account-writer.test.ts', 'tests/oauth-adapter.test.ts'].includes(relative(root, file))) {
    const probe = relative(root, file) === 'tests/oauth-adapter.test.ts' ? 'oauth-node-probe' : 'native-account-writer-node-probe';
    const child = await compile(join(root, 'tests/support/' + probe + '.ts'));
    const before = "['--conditions=atseq-source', '--import', 'tsx', 'tests/support/" + probe + ".ts']";
    if (!source.includes(before)) throw Error('Native child harness spelling changed');
    source = source.replace(before, '[' + JSON.stringify(child) + ']');
  }
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true), edits = [], imports = [];
  function visit(item) {
    if (ts.isImportDeclaration(item) && ts.isStringLiteral(item.moduleSpecifier)) imports.push(item.moduleSpecifier);
    if (ts.isCallExpression(item) && item.expression.kind === ts.SyntaxKind.ImportKeyword && ts.isStringLiteral(item.arguments[0])) imports.push(item.arguments[0]);
    ts.forEachChild(item, visit);
  }
  visit(tree);
  for (const specifier of imports) {
    const name = specifier.text;
    if (!name.startsWith('.')) continue;
    const original = resolve(dirname(file), name);
    if (!original.startsWith(root + '/')) throw Error('Input escaped root');
    let actual;
    if (original.startsWith(join(root, 'src') + '/')) {
      actual = join(productionRoot, 'dist', relative(root, original).replace(/\.ts$/, '.js'));
      productionOutputs[relative(productionRoot, actual)] = hash(await readFile(actual));
    } else if (original.endsWith('.ts')) actual = await compile(original);
    else { actual = original; await pinSource(original); }
    const importPath = relative(dirname(target), actual);
    edits.push({ start: specifier.getStart(tree), end: specifier.end,
      value: JSON.stringify(importPath.startsWith('.') ? importPath : './' + importPath) });
  }
  for (const edit of edits.reverse()) source = source.slice(0, edit.start) + edit.value + source.slice(edit.end);
  const code = ts.transpileModule(source, { fileName: file,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, code);
  outputHashes[relative(root, target)] = hash(code);
  return target;
}
const entries = {};
for (const entry of [
  'tests/host-availability.test.ts', 'tests/pds.test.ts',
  'tests/native-account-writer.test.ts', 'tests/native-account-writer-dispatch.test.ts',
  'tests/native-account-writer-handoff.test.ts', 'tests/oauth-adapter.test.ts',
  'tests/oauth-custody.test.ts', 'tests/oauth-custody-lifecycle.test.ts',
  'tests/native-account-writer-browser.test.ts', 'tests/support/native-account-writer-browser-probe.ts',
  'tests/support/native-account-writer-pds-probe.ts',
  'tests/support/native-upload-ownership-node-probe.ts',
  '.atseq-local/root-owned-blob-size-probe.ts',
]) entries[entry] = await compile(join(root, entry));
const compilerFiles = {};
for (const file of [
  'node_modules/ts-morph/package.json', 'node_modules/ts-morph/dist/ts-morph.js',
  'node_modules/@ts-morph/common/package.json', 'node_modules/@ts-morph/common/dist/typescript.js',
]) compilerFiles[file] = hash(await readFile(join(root, file)));
const script = fileURLToPath(import.meta.url);
await pinSource(script);
const provenance = await readFile(join(productionRoot, 'dist/build-provenance.json'));
await writeFile(join(out, 'compiled-pins.json'), JSON.stringify({
  format: 'native-writer-compiled-gates', version: 1, createdAt: new Date().toISOString(),
  preparationOnly: !label.startsWith('final-'), productionRoot, runtime: process.version, compiler: { name: 'ts-morph embedded TypeScript', version: ts.version, compilerFiles },
  script: relative(root, script), sourceHashes, outputHashes, productionOutputs,
  productionBuildProvenanceSHA256: hash(provenance),
  semantics: 'Production imports reference actual emitted dist/src files. Test-only wrappers are transpiled and pinned before execution. Writer children are plain Node without tsx or atseq-source. Reference-PDS JavaScript fixture is unchanged source, not a production component.',
  entries,
}, null, 2) + '\n');
console.log(JSON.stringify({ out, entries, sourceFiles: Object.keys(sourceHashes).length, outputs: Object.keys(outputHashes).length, compiler: ts.version }));
