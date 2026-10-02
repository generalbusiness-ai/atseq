/** Test-only TypeScript is transpiled; every production import uses actual built dist bytes. */
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { ts } from 'ts-morph';
const root = new URL('../../', import.meta.url),
  directory = new URL('../../.atseq-local/p2-car-intake/compiled-modules/', import.meta.url),
  fixturesPath = process.env.ATSEQ_CAR_INTAKE_FIXTURES,
  capturePath = process.env.ATSEQ_CAR_INTAKE_COMPILED_CAPTURE;
assert.ok(fixturesPath && capturePath, 'Supply retained public fixtures and actual capture path');
const imported = new Set(),
  compiling = new Set(),
  compiled = new Map();
const hash = (raw) => createHash('sha256').update(raw).digest('hex');
async function compileTest(url) {
  const relative = url.pathname.slice(root.pathname.length);
  assert.ok(relative.startsWith('tests/'));
  const destination = new URL(relative.replace(/\.ts$/, '.mjs'), directory);
  if (compiling.has(url.href)) return destination;
  compiling.add(url.href);
  const raw = await readFile(url),
    output = ts.transpileModule(raw.toString(), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, verbatimModuleSyntax: true },
    }).outputText;
  let transformed = output;
  for (const match of [...output.matchAll(/(?:from\s+|import\s*)(['"])([^'"\n]+)\1/g)].reverse()) {
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
const mode = process.argv[2] ?? 'conformance';
if (mode === 'limits') {
  await import((await compileTest(new URL('../../tests/native-observer-limits.test.ts', import.meta.url))).href);
  await writeFile(
    capturePath,
    JSON.stringify(
      {
        node: process.version,
        mode,
        outcomeRecordedInProcessLog: true,
        actualProductionModules: await Promise.all(
          [...imported]
            .sort()
            .map(async (path) => ({ path: path.slice(root.pathname.length), sha256: hash(await readFile(path)) })),
        ),
        compiledTests: Object.fromEntries(compiled),
      },
      null,
      2,
    ) + '\n',
  );
} else {
  assert.equal(mode, 'conformance');
  const module = await import(
      (await compileTest(new URL('../../tests/support/native-car-intake.ts', import.meta.url))).href
    ),
    retained = JSON.parse(await readFile(fixturesPath, 'utf8')),
    result = await module.carIntakeConformance(retained.fixtures, retained.prefix);
  assert.equal(result.cases.length, 24);
  assert.equal(result.legacyCases.length, 20);
  assert.ok(result.proofCases.length >= 50);
  await writeFile(
    capturePath,
    JSON.stringify(
      {
        node: process.version,
        fixtureSha256: hash(await readFile(fixturesPath)),
        ...result,
        actualProductionModules: await Promise.all(
          [...imported]
            .sort()
            .map(async (path) => ({ path: path.slice(root.pathname.length), sha256: hash(await readFile(path)) })),
        ),
        compiledTests: Object.fromEntries(compiled),
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    JSON.stringify({
      node: process.version,
      cases: result.cases.length,
      legacy: result.legacyCases.length,
      proof: result.proofCases.length,
      outputs: result.outputs,
    }),
  );
}
