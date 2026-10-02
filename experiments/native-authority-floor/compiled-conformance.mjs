/** Test-only TS transpilation; every executed production import uses real built dist output. */
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { ts } from 'ts-morph';
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const tests = new Map(),
  production = new Set(),
  modules = [];
async function compileTest(name) {
  if (tests.has(name)) return tests.get(name);
  const path = 'tests/support/' + name;
  const source = await readFile(new URL('../../' + path, import.meta.url), 'utf8');
  let output = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, verbatimModuleSyntax: true },
  }).outputText;
  const imports = [...output.matchAll(/from\s+(['"])([^'"]+)\1/g)];
  for (const match of imports) {
    const specifier = match[2];
    let replacement;
    if (specifier.startsWith('../../src/')) {
      const url = new URL(
        '../../dist/src/' + specifier.slice('../../src/'.length).replace(/\.ts$/, '.js'),
        import.meta.url,
      );
      production.add(url.pathname);
      replacement = url.href;
    } else if (specifier.startsWith('./')) replacement = await compileTest(specifier.slice(2));
    else {
      assert.ok(!specifier.startsWith('.'), `Unexpected test-relative import ${specifier}`);
      replacement = import.meta.resolve(specifier);
    }
    output = output.replace(match[0], 'from ' + JSON.stringify(replacement));
  }
  assert.ok(!/\/src\/[^'"\n]+\.ts/.test(output));
  modules.push({ path, sourceSha256: sha(source), emittedTestSha256: sha(output) });
  const url = 'data:text/javascript;base64,' + Buffer.from(output).toString('base64');
  tests.set(name, url);
  return url;
}
const producer = await import(await compileTest('native-authority-floor-fixture.ts'));
const corpus = await import(await compileTest('native-authority-floor-corpus.ts'));
for (const path of ['application/native-authority', 'application/native-authority-data', 'application/native-prefix'])
  assert.ok(production.has(new URL('../../dist/src/' + path + '.js', import.meta.url).pathname));
const fixture = await producer.produceFloorHistoryFixture();
const cases = await corpus.floorHistoryCorpus(fixture);
assert.equal(cases.length, 4);
const { canonicalJson } = await import('../../dist/src/core/values.js');
const fixtureBytes = Buffer.from(canonicalJson(fixture, 32 * 1024 * 1024, 32));
const evidence = {
  node: process.version,
  producer: 'genuine AuthorityHarness -> actual compiled nativeAuthorityHistory live prefix join',
  cases,
  fixtureBytes: fixtureBytes.length,
  fixtureSha256: sha(fixtureBytes),
  exactError: { code: 'envelope', message: 'Floor descriptor was not consumed' },
  actualProductionModules: await Promise.all(
    [...production]
      .sort()
      .map(async (path) => ({
        path: path.slice(new URL('../../', import.meta.url).pathname.length),
        sha256: sha(await readFile(path)),
      })),
  ),
  testModules: modules,
  dataOnly: true,
};
await writeFile(process.env.ATSEQ_R1_FLOOR_FIXTURE ?? '.atseq-local/r1-floor-compiled-fixture.json', fixtureBytes);
await writeFile(
  process.env.ATSEQ_R1_FLOOR_CAPTURE ?? '.atseq-local/r1-floor-compiled.json',
  JSON.stringify(evidence, null, 2) + '\n',
);
console.log(JSON.stringify(evidence));
