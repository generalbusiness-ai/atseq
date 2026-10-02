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

const { gunzipSync } = await import('node:zlib');
const fixture = JSON.parse(
  gunzipSync(await readFile(new URL('tests/vectors/checkpoint-data.json.gz', root))).toString(),
);
const literal = JSON.parse(await readFile(new URL('tests/vectors/native-checkpoint-producer.json', root), 'utf8'));
const corpus = await import(await compile('tests/support/native-checkpoint-producer-corpus.ts'));
const owned = await import(await compile('tests/support/native-checkpoint-producer-owned-input-corpus.ts'));
const original = await import(await compile('tests/support/checkpoint-data-corpus.ts'));
const outcome = await import(await compile('tests/support/native-outcome-corpus.ts'));
const tables = JSON.parse(
  gunzipSync(await readFile(new URL('tests/vectors/native-outcome/shared-outcome-tables.json.gz', root))).toString(),
);
const vectors = JSON.parse(
  gunzipSync(await readFile(new URL('tests/vectors/native-outcome/outcome-vectors.json.gz', root))).toString(),
);
assert.ok(imported.has(new URL('dist/src/protocol/native-checkpoint-producer.js', root).href));
const capture = {
  node: process.version,
  producer: await corpus.nativeCheckpointProducerCorpus(fixture, literal),
  ownedInput: await owned.nativeCheckpointProducerOwnedInputCorpus(fixture, literal),
  originalData: await original.checkpointDataCorpus(fixture),
  originalOutcome: await outcome.nativeOutcomeCorpus({ tables, vectors }, fixture),
  testModules,
  actualProductionModules: await Promise.all(
    [...imported].sort().map(async (url) => ({
      path: new URL(url).pathname.slice(root.pathname.length),
      sha256: createHash('sha256')
        .update(await readFile(new URL(url)))
        .digest('hex'),
    })),
  ),
};
await writeFile(
  process.env.ATSEQ_P4F1_OWNED_EMITTED_CAPTURE_PATH ??
    '.atseq-local/native-checkpoint-producer-owned-input/emitted.json',
  JSON.stringify(capture, null, 2) + '\n',
);
console.log(JSON.stringify(capture));
