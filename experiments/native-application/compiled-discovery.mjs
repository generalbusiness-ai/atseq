/** Transpile only portable test corpus; import every production dependency from real dist. */
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { ts } from 'ts-morph';
const mode = process.argv[2] ?? 'component';
assert.ok(['component', 'workload'].includes(mode));
const file = mode === 'component' ? 'native-discovery-corpus.ts' : 'native-discovery-workload-corpus.ts';
let source = await readFile(new URL('../../tests/support/' + file, import.meta.url), 'utf8');
const imports = [];
source = source.replace(/from\s+(['"])([^'"]+)\1/g, (original, quote, specifier) => {
  if (!specifier.startsWith('../../src/')) return original;
  const url = new URL(
    '../../dist/src/' + specifier.slice('../../src/'.length).replace(/\.ts$/, '.js'),
    import.meta.url,
  );
  imports.push(url.pathname);
  return 'from ' + JSON.stringify(url.href);
});
const output = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, verbatimModuleSyntax: true },
}).outputText;
assert.ok(imports.includes(new URL('../../dist/src/application/native-authority.js', import.meta.url).pathname));
assert.ok(!/\/src\/[^'"\n]+\.ts/.test(output));
const corpus = await import('data:text/javascript;base64,' + Buffer.from(output).toString('base64'));
const directory = process.env.ATSEQ_NATIVE_DISCOVERY_COMPILED_CAPTURE_DIR ?? '.atseq-local/c1-kernel/compiled';
await mkdir(directory, { recursive: true });
const hash = (raw) => createHash('sha256').update(raw).digest('hex');
const provenance = {
  node: process.version,
  mode,
  actualProductionModules: await Promise.all(
    imports.map(async (path) => ({
      path: path.slice(new URL('../../', import.meta.url).pathname.length),
      sha256: hash(await readFile(path)),
    })),
  ),
  transformedCorpusSha256: hash(output),
  corpusSourceSha256: hash(await readFile(new URL('../../tests/support/' + file, import.meta.url))),
};
if (mode === 'component') {
  const raw = await readFile(
    process.env.ATSEQ_NATIVE_DISCOVERY_FIXTURE_PATH ?? '.atseq-local/c1-kernel/native-discovery-fixture-final2.json',
  );
  const original = await readFile(
    process.env.ATSEQ_NATIVE_APPLICATION_FIXTURE_PATH ?? '/private/tmp/atseq-c1-f1-oracle-20261002.json',
  );
  const cases = await corpus.nativeDiscoveryCorpus(JSON.parse(raw), JSON.parse(original));
  await writeFile(
    directory + '/component.json',
    JSON.stringify({ ...provenance, fixtureSha256: hash(raw), originalFixtureSha256: hash(original), cases }, null, 2) +
      '\n',
  );
  console.log(JSON.stringify({ ...provenance, cases: cases.map((c) => c.id) }));
} else {
  for (const profile of ['few', 'many']) {
    const raw = await readFile(
      process.env['ATSEQ_NATIVE_DISCOVERY_WORKLOAD_' + profile.toUpperCase()] ??
        '.atseq-local/c1-kernel/native-discovery-workload-' + profile + '-final.json',
    );
    const result = await corpus.nativeDiscoveryWorkloadCorpus(JSON.parse(raw));
    await writeFile(
      directory + '/' + profile + '.json',
      JSON.stringify({ ...provenance, fixtureSha256: hash(raw), result }, null, 2) + '\n',
    );
    console.log(
      JSON.stringify({ node: process.version, mode, profile, actions: result.rows.map((r) => r.actionCount) }),
    );
  }
}
