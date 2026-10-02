/** Post-freeze reproducibility only; never runs a benchmark or writes the measured worktree. */
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve, relative, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
const original = resolve(process.argv[2]);
const output = resolve(process.argv[3]);
if (!process.argv[3]) throw Error('Usage: recompile-wrappers.mjs ORIGINAL_FROZEN_WORKTREE CORRECTION_DIRECTORY');
const measuredHead = '91fa28f54238ce6fff0e9a18de4b720297f1980d';
if (execFileSync('git', ['rev-parse', 'HEAD'], { cwd: original, encoding: 'utf8' }).trim() !== measuredHead)
  throw Error('Measured worktree is not frozen91fa');
const require = createRequire(join(original, 'package.json'));
const { ts } = require('ts-morph');
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const compilerPaths = [
  'node_modules/ts-morph/package.json',
  'node_modules/ts-morph/dist/ts-morph.js',
  'node_modules/@ts-morph/common/package.json',
  'node_modules/@ts-morph/common/dist/ts-morph-common.js',
  'node_modules/@ts-morph/common/dist/typescript.js',
  'node_modules/typescript/package.json',
];
const compilerFiles = [];
for (const path of compilerPaths) {
  const bytes = await readFile(join(original, path));
  compilerFiles.push({ path, bytes: bytes.length, sha256: digest(bytes) });
}
const wrapperDirectory = join(original, '.atseq-local/r0-native/compiled');
async function compilation() {
  const outputs = new Map(),
    sourceHashes = {};
  async function compile(file) {
    const target = join(wrapperDirectory, relative(original, file).replace(/\.ts$/, '.js'));
    if (outputs.has(file)) return target;
    let source = await readFile(file, 'utf8');
    sourceHashes[relative(original, file)] = digest(source);
    const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true),
      edits = [];
    for (const item of tree.statements) {
      if (!ts.isImportDeclaration(item) || item.importClause?.isTypeOnly || !ts.isStringLiteral(item.moduleSpecifier))
        continue;
      const name = item.moduleSpecifier.text;
      if (!name.startsWith('.')) continue;
      const sourceImport = resolve(dirname(file), name);
      const actual = sourceImport.startsWith(join(original, 'src') + '/')
        ? join(original, 'dist', relative(original, sourceImport).replace(/\.ts$/, '.js'))
        : await compile(sourceImport);
      edits.push({
        start: item.moduleSpecifier.getStart(tree),
        end: item.moduleSpecifier.end,
        value: JSON.stringify(pathToFileURL(actual).href),
      });
    }
    for (const edit of edits.reverse()) source = source.slice(0, edit.start) + edit.value + source.slice(edit.end);
    const bytes = Buffer.from(
      ts.transpileModule(source, {
        fileName: file,
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      }).outputText,
    );
    outputs.set(file, { target, bytes });
    return target;
  }
  await compile(join(original, 'experiments/r0-native/probe.ts'));
  return { outputs, sourceHashes };
}
const started = new Date().toISOString(),
  first = await compilation(),
  second = await compilation();
const wrappers = [];
for (const [file, value] of first.outputs) {
  const repeated = second.outputs.get(file);
  if (!value.bytes.equals(repeated.bytes)) throw Error('Non-deterministic present recompilation');
  const existing = await readFile(value.target);
  if (!value.bytes.equals(existing)) throw Error('Present physical wrapper differs from recompilation');
  const path = relative(wrapperDirectory, value.target),
    copy = join(output, 'recompiled-' + path.split('/').at(-1));
  await writeFile(copy, value.bytes);
  wrappers.push({
    source: relative(original, file),
    sourceSha256: first.sourceHashes[relative(original, file)],
    originalPhysicalPath: value.target,
    bytes: value.bytes.length,
    currentPhysicalSha256: digest(existing),
    postFreezeRecompiledSha256: digest(value.bytes),
    repeatedCompilationIdentical: true,
    currentPhysicalIdentical: true,
    retainedCopy: relative(process.cwd(), copy),
    historicallyRecordedExecutionHash: null,
  });
}
const recipe = await readFile(join(original, 'experiments/r0-native/compile.mjs'));
await writeFile(
  join(output, 'wrapper-recompilation.json'),
  JSON.stringify(
    {
      scope:
        'POST-FREEZE deterministic reproduction and present physical-byte comparison only. Historical compiled wrapper execution-output digests were not recorded and remain unknown.',
      started,
      finished: new Date().toISOString(),
      node: process.version,
      measuredFrozenHead: measuredHead,
      originalRoot: original,
      historicalRecipe: {
        path: 'experiments/r0-native/compile.mjs',
        sha256: digest(recipe),
        historicalOutputHashCapture: 'none; original pins recorded experiment sources only',
      },
      observedCurrentCompiler: {
        typescriptVersion: ts.version,
        publicOwner: 'ts-morph ts export',
        tsMorphVersion: JSON.parse(await readFile(join(original, 'node_modules/ts-morph/package.json'))).version,
        commonVersion: JSON.parse(await readFile(join(original, 'node_modules/@ts-morph/common/package.json'))).version,
        productionCompilerVersion: JSON.parse(await readFile(join(original, 'node_modules/typescript/package.json')))
          .version,
        files: compilerFiles,
      },
      sourceHashes: first.sourceHashes,
      wrappers,
      absoluteImportMapping:
        'Original absolute file URLs deliberately preserved to reproduce exact current wrapper bytes; this is not a portable-path output claim.',
      benchmarkRerun: false,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  JSON.stringify({
    scope: 'post-freeze only',
    typescript: ts.version,
    wrappers: wrappers.map((row) => ({ source: row.source, bytes: row.bytes, sha256: row.postFreezeRecompiledSha256 })),
    historicalOutputHashes: 'unrecorded',
    benchmarkRerun: false,
  }),
);
