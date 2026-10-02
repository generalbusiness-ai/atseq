/** The shared corpus imports actual production dist modules, not TS production sources. */
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { ts } from 'ts-morph';
const corpusUrl = new URL('../../tests/support/native-fold-measurement.ts', import.meta.url);
let source = await readFile(corpusUrl, 'utf8');
const imported = [];
source = source.replace(/from\s+(['"])([^'"]+)\1/g, (original, quote, specifier) => {
  if (specifier.startsWith('../../src/')) {
    const url = new URL(
      '../../dist/src/' + specifier.slice('../../src/'.length).replace(/\.ts$/, '.js'),
      import.meta.url,
    );
    imported.push(url.pathname);
    return 'from ' + JSON.stringify(url.href);
  }
  if (!specifier.startsWith('.')) return 'from ' + JSON.stringify(import.meta.resolve(specifier));
  return original;
});
const output = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, verbatimModuleSyntax: true },
}).outputText;
assert.ok(imported.includes(new URL('../../dist/src/runtime/evaluator.js', import.meta.url).pathname));
assert.ok(!/\/src\/[^'"\n]+\.ts/.test(output));
const corpus = await import('data:text/javascript;base64,' + Buffer.from(output).toString('base64'));
const cases = await corpus.nativeFoldMeasurements();
const evidence = {
  node: process.version,
  cases,
  actualProductionModules: await Promise.all(
    imported.map(async (path) => ({
      path: path.slice(new URL('../../', import.meta.url).pathname.length),
      sha256: createHash('sha256')
        .update(await readFile(path))
        .digest('hex'),
    })),
  ),
  testCorpusSha256: createHash('sha256').update(source).digest('hex'),
  transpiledTestCorpusSha256: createHash('sha256').update(output).digest('hex'),
};
const capture = process.env.ATSEQ_NATIVE_FOLD_COMPILED_CAPTURE ?? '.atseq-local/native-fold-compiled.json';
await writeFile(capture, JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify(evidence));
