import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { ts } from 'ts-morph';

/** Compile the shared test cases, redirecting every src import to the installed package. */
export async function preparePackageConformance(root: string, installed: string) {
  const emitted = new Set<string>(),
    sourceHashes: Record<string, string> = {},
    directory = join(installed, '.conformance');
  async function compile(path: string): Promise<string> {
    const destination = join(directory, relative(root, path).replace(/\.ts$/, '.js'));
    if (emitted.has(path)) return destination;
    emitted.add(path);
    let source = await readFile(path, 'utf8');
    sourceHashes[relative(root, path)] = createHash('sha256').update(source).digest('hex');
    if (path.endsWith('.json')) {
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, source);
      return destination;
    }
    const parsed = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true),
      edits: { start: number; end: number; value: string }[] = [];
    for (const statement of parsed.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
      const specifier = statement.moduleSpecifier.text;
      if (!specifier.startsWith('.')) continue;
      const target = resolve(dirname(path), specifier);
      if (!target.startsWith(root + '/')) throw new Error('Conformance import escaped the checkout');
      const targetPath = target.startsWith(join(root, 'src') + '/')
        ? join(installed, 'dist', relative(root, target).replace(/\.ts$/, '.js'))
        : await compile(target);
      edits.push({
        start: statement.moduleSpecifier.getStart(parsed),
        end: statement.moduleSpecifier.end,
        value: JSON.stringify(pathToFileURL(targetPath).href),
      });
    }
    for (const edit of edits.reverse()) source = source.slice(0, edit.start) + edit.value + source.slice(edit.end);
    const result = ts.transpileModule(source, {
      fileName: path,
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    });
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, result.outputText);
    return destination;
  }
  const modules = await Promise.all(
    ['corpus', 'runtime-corpus', 'evolution-corpus', 'source-document-corpus'].map((name) =>
      compile(join(root, 'tests/support', name + '.ts')),
    ),
  );
  const runner = join(directory, 'run.mjs');
  await writeFile(
    runner,
    `import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {runCorpus} from ${JSON.stringify(pathToFileURL(modules[0]!).href)};
import {runRuntimeCorpus} from ${JSON.stringify(pathToFileURL(modules[1]!).href)};
import {runEvolutionCorpus} from ${JSON.stringify(pathToFileURL(modules[2]!).href)};
import {runSourceDocumentCorpus} from ${JSON.stringify(pathToFileURL(modules[3]!).href)};
const cases = [...await runCorpus(), ...await runRuntimeCorpus(), ...await runSourceDocumentCorpus()];
await runEvolutionCorpus(async (name, run) => {
  try { await run(); cases.push({name, passed:true}); }
  catch(error) { cases.push({name, passed:false, detail:error.message}); }
});
await writeFile(process.argv[2], JSON.stringify(cases, null, 2));
assert.deepEqual(cases.filter(x => !x.passed), []);
console.log('Compiled package conformance passed: ' + cases.length + ' cases');
`,
  );
  return { runner, sourceHashes };
}
