/** Test-only helpers are transpiled; production imports resolve to the actual built dist files. */
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { ts } from 'ts-morph';
const root = new URL('../../', import.meta.url);
const directory = new URL('../../.atseq-local/e1-r1-integration/compiled-modules/', import.meta.url);
const fixtureDirectory = process.env.ATSEQ_E1_FIXTURE_DIRECTORY;
assert.ok(fixtureDirectory, 'Use the retained immutable fixtures; no generation in this gate');
const imported = new Set(),
  compiling = new Set(),
  compiled = new Map();
const hash = (raw) => createHash('sha256').update(raw).digest('hex');
async function compileTest(url) {
  const relative = url.pathname.slice(root.pathname.length);
  assert.ok(relative.startsWith('tests/') || relative.startsWith('experiments/'));
  const destination = new URL(relative.replace(/\.ts$/, '.mjs'), directory);
  if (compiling.has(url.href)) return destination;
  compiling.add(url.href);
  const raw = await readFile(url);
  const output = ts.transpileModule(raw.toString(), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, verbatimModuleSyntax: true },
  }).outputText;
  const matches = [...output.matchAll(/(?:from\s+|import\s*)(['"])([^'"\n]+)\1/g)];
  let transformed = output;
  for (const match of matches.reverse()) {
    const specifier = match[2];
    let target;
    if (specifier.startsWith('.')) {
      const selected = new URL(specifier, url);
      if (selected.pathname.startsWith(new URL('src/', root).pathname)) {
        target = new URL('dist/' + selected.pathname.slice(root.pathname.length).replace(/\.ts$/, '.js'), root);
        imported.add(target.pathname);
      } else if (selected.pathname.endsWith('.ts')) target = await compileTest(selected);
      else target = selected;
    } else target = new URL(import.meta.resolve(specifier));
    const replacement = match[0].replace(match[1] + specifier + match[1], JSON.stringify(target.href));
    transformed = transformed.slice(0, match.index) + replacement + transformed.slice(match.index + match[0].length);
  }
  assert.ok(!/\/src\/[^'"\n]+\.ts/.test(transformed));
  await mkdir(new URL('./', destination), { recursive: true });
  await writeFile(destination, transformed);
  compiled.set(relative, { sourceSha256: hash(raw), outputSha256: hash(transformed), output: transformed });
  return destination;
}
const module = await import((await compileTest(new URL('validate.ts', import.meta.url))).href);
assert.ok(imported.has(new URL('dist/src/application/native-authority.js', root).pathname));
assert.ok(imported.has(new URL('dist/src/protocol/native-proof.js', root).pathname));
const values = await import(new URL('dist/src/core/values.js', root).href);
const results = [];
for (const name of ['bounded-one-actor', 'growing-many-actors-activation-invalid-action']) {
  const raw = await readFile(fixtureDirectory + '/' + name + '-100.json.gz');
  const fixture = JSON.parse(gunzipSync(raw).toString());
  const validation = await module.verifyFixture(fixture);
  const snapshot = await module.replaySmall(fixture);
  assert.deepEqual(await module.replaySmall(fixture), snapshot);
  assert.equal(snapshot.state.count, name === 'bounded-one-actor' ? 540 : 666);
  const tampered = structuredClone(fixture);
  tampered.expected.state.count++;
  await assert.rejects(module.verifyFixture(tampered), /Stored expected state differs/);
  results.push({
    name,
    fixtureGzipSha256: hash(raw),
    validation,
    snapshotSha256: hash(values.canonicalJson(snapshot)),
  });
}
const capture = {
  node: process.version,
  scope:
    'same two retained signed fixtures and independent semantic predicates; actual dist production; no reader timing',
  results,
  actualProductionModules: await Promise.all(
    [...imported]
      .sort()
      .map(async (path) => ({ path: path.slice(root.pathname.length), sha256: hash(await readFile(path)) })),
  ),
  compiledTests: Object.fromEntries(compiled),
};
await writeFile(process.env.ATSEQ_E1_COMPILED_CAPTURE, JSON.stringify(capture, null, 2) + '\n');
console.log(
  JSON.stringify({
    ...capture,
    compiledTests: Object.fromEntries([...compiled].map(([path, row]) => [path, { ...row, output: undefined }])),
  }),
);
