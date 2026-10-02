/** Test-only TS modules are transpiled; every production import resolves to actual dist output. */
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { ts } from 'ts-morph';
const fixturePath =
  process.env.ATSEQ_NATIVE_AUTHORITY_FIXTURE_PATH ??
  process.env.ATSEQ_NATIVE_PREFIX_FIXTURE_PATH ??
  '.atseq-local/native-prefix/fixture.json';
const raw = await readFile(fixturePath),
  fixture = JSON.parse(raw),
  imported = new Set(),
  compiledTests = [];
async function compileTest(name) {
  let source = await readFile(new URL('../../tests/support/' + name, import.meta.url), 'utf8');
  const local = new Map();
  if (name === 'native-prefix-corpus.ts')
    local.set('./native-application-corpus.ts', await compileTest('native-application-corpus.ts'));
  source = source.replace(/from\s+(['"])([^'"]+)\1/g, (original, quote, specifier) => {
    if (specifier.startsWith('../../src/')) {
      const url = new URL(
        '../../dist/src/' + specifier.slice('../../src/'.length).replace(/\.ts$/, '.js'),
        import.meta.url,
      );
      imported.add(url.pathname);
      return 'from ' + JSON.stringify(url.href);
    }
    if (local.has(specifier)) return 'from ' + JSON.stringify(local.get(specifier));
    if (!specifier.startsWith('.')) return 'from ' + JSON.stringify(import.meta.resolve(specifier));
    return original;
  });
  const output = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, verbatimModuleSyntax: true },
  }).outputText;
  assert.ok(!/\/src\/[^'"\n]+\.ts/.test(output));
  compiledTests.push({
    name,
    sourceSha256: createHash('sha256').update(source).digest('hex'),
    outputSha256: createHash('sha256').update(output).digest('hex'),
  });
  return 'data:text/javascript;base64,' + Buffer.from(output).toString('base64');
}
const authority = process.env.ATSEQ_NATIVE_AUTHORITY_FIXTURE_PATH !== undefined;
const corpus = await import(await compileTest(authority ? 'native-authority-corpus.ts' : 'native-prefix-corpus.ts'));
assert.ok(imported.has(new URL('../../dist/src/application/native-prefix.js', import.meta.url).pathname));
const result = authority
  ? { cases: await corpus.replayAuthorityFixtures(fixture) }
  : await corpus.nativePrefixCorpus(fixture);
const capture = {
  node: process.version,
  ...result,
  fixtureBytes: raw.length,
  fixtureSha256: createHash('sha256').update(raw).digest('hex'),
  actualProductionModules: await Promise.all(
    [...imported].sort().map(async (path) => ({
      path: path.slice(new URL('../../', import.meta.url).pathname.length),
      sha256: createHash('sha256')
        .update(await readFile(path))
        .digest('hex'),
    })),
  ),
  compiledTests,
};
await writeFile(
  process.env.ATSEQ_NATIVE_PREFIX_COMPILED_CAPTURE ?? '.atseq-local/native-prefix-compiled.json',
  JSON.stringify(capture, null, 2) + '\n',
);
console.log(JSON.stringify(capture));
