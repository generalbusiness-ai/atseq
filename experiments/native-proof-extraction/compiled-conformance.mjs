/** Transpile test modules only; all production imports use actual dist output. */
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { ts } from 'ts-morph';
const root = new URL('../../', import.meta.url),
  modules = new Map(),
  imported = new Set(),
  testModules = [];
async function compile(name) {
  if (modules.has(name)) return modules.get(name);
  const source = await readFile(new URL(name, root), 'utf8');
  let output = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, verbatimModuleSyntax: true },
  }).outputText;
  const matches = [...output.matchAll(/from\s+(['"])([^'"]+)\1/g)];
  for (const match of matches) {
    const specifier = match[2];
    let url;
    if (specifier.startsWith('.')) {
      const resolved = new URL(specifier, new URL(name, root));
      if (resolved.pathname.startsWith(new URL('src/', root).pathname)) {
        const relative = resolved.pathname.slice(new URL('src/', root).pathname.length).replace(/\.ts$/, '.js');
        url = new URL('dist/src/' + relative, root).href;
        imported.add(url);
      } else {
        assert.ok(resolved.pathname.startsWith(new URL('tests/support/', root).pathname));
        url = await compile(resolved.pathname.slice(root.pathname.length));
      }
    } else url = import.meta.resolve(specifier);
    output = output.replace(match[0], 'from ' + JSON.stringify(url));
  }
  assert.ok(!/\/src\/[^'"\n]+\.ts/.test(output));
  testModules.push({
    path: name,
    sourceSha256: createHash('sha256').update(source).digest('hex'),
    transformedSha256: createHash('sha256').update(output).digest('hex'),
  });
  const url = 'data:text/javascript;base64,' + Buffer.from(output).toString('base64');
  modules.set(name, url);
  return url;
}
const fixture = JSON.parse(await readFile(process.env.ATSEQ_NATIVE_EXTRACTION_FIXTURE_PATH, 'utf8'));
const workloads = JSON.parse(await readFile(process.env.ATSEQ_NATIVE_EXTRACTION_WORKLOAD_FIXTURE_PATH, 'utf8'));
const corpus = await import(await compile('tests/support/native-proof-extraction-corpus.ts'));
const work = await import(await compile('tests/support/native-proof-extraction-workload.ts'));
const original = await import(await compile('tests/support/native-proof-corpus.ts'));
assert.ok(imported.has(new URL('dist/src/protocol/native-proof.js', root).href));
const memoryBefore = process.memoryUsage();
const capture = {
  node: process.version,
  extraction: await corpus.nativeProofExtractionCorpus(fixture),
  workloads: await work.nativeProofExtractionWorkloads(workloads),
  originalP1Cases: await original.nativeProofCorpus(),
  testModules,
  actualProductionModules: await Promise.all(
    [...imported].sort().map(async (url) => ({
      path: new URL(url).pathname.slice(root.pathname.length),
      sha256: createHash('sha256')
        .update(await readFile(new URL(url)))
        .digest('hex'),
    })),
  ),
  memory: {
    before: memoryBefore,
    after: process.memoryUsage(),
    peakHeap: null,
    interpretation: 'Process snapshots across corpus/workload; no per-operation allocation or peak attribution',
  },
};
await writeFile(process.env.ATSEQ_NATIVE_EXTRACTION_COMPILED_CAPTURE, JSON.stringify(capture, null, 2) + '\n');
console.log(JSON.stringify(capture));
