import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, relative } from 'node:path';
import { gzipSync, gunzipSync } from 'node:zlib';
import { build } from 'esbuild';

const basis = '3a40d2c5e230cd7698f9cd4b9e8e9729054be33e';
const baselineFiles = new Set([
  'src/core/dependencies.ts',
  'src/core/dependencies-approved.json',
  'src/integrity/files-approved.json',
  'src/archive/notices.json',
  'package.json',
  'npm-shrinkwrap.json',
]);
// Exact historical bytes are retained locally so shallow clones and source archives
// run the same before/after comparison without Git history or network access.
const compressedBaseline = readFileSync(new URL('./vectors/oauth-predecessor.json.gz', import.meta.url));
assert.equal(
  createHash('sha256').update(compressedBaseline).digest('hex'),
  '5decbad7dbfca3686542f5d8d775613fd3a78de5322a53f95873b6b9964b4bca',
);
const baseline: {
  schema: number;
  basis: string;
  files: { path: string; bytes: number; sha256: string; text: string }[];
} = JSON.parse(gunzipSync(compressedBaseline, { maxOutputLength: 2 * 1024 * 1024 }).toString('utf8'));
assert.equal(baseline.schema, 1);
assert.equal(baseline.basis, basis);
assert.deepEqual(baseline.files.map((file) => file.path).sort(), [...baselineFiles].sort());
const previousFiles = new Map(
  baseline.files.map((file) => {
    const bytes = Buffer.from(file.text, 'utf8');
    assert.equal(bytes.length, file.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256);
    return [file.path, file.text] as const;
  }),
);
const previous = (file: string) => {
  const text = previousFiles.get(file);
  assert.notEqual(text, undefined, 'Historical overlay must name a retained baseline file');
  return text!;
};
const old = JSON.parse(previous('src/core/dependencies-approved.json'));
const current = JSON.parse(readFileSync('src/core/dependencies-approved.json', 'utf8'));
const added: string[] = Object.keys(current.packages).filter((path) => !old.packages[path]);
const executable = (path: string) => /\.(?:[cm]?js|tsx?)$/.test(path);
const underAdded = (path: string) => added.some((directory) => path.startsWith(directory + '/'));
// Test outputs are disposable; published predecessor captures are immutable.
const evidence = '.atseq-local/oauth-bundles/';

test('actual ordinary browser/verifier/Node start graphs retain only added OAuth manifests, never executable modules', async () => {
  assert.equal(added.length, 47);
  const results = [];
  const entrypoints = [
    ['browser-app', 'src/browser/main.ts', 'browser'],
    ['browser-worker', 'src/browser/worker.ts', 'browser'],
    ['portable-verifier', 'src/protocol/index.ts', 'browser'],
    ['node-cli-start', 'src/cli/main.ts', 'node'],
    ['node-host-start', 'src/host/main.ts', 'node'],
  ] as const;
  const group = await build({
    stdin: {
      contents:
        added.map((path, i) => `import p${i} from './${path}/package.json';`).join('\n') +
        `\nexport const manifests = [${added.map((_, i) => 'p' + i).join(',')}];`,
      resolveDir: process.cwd(),
      sourcefile: 'oauth-manifest-group.ts',
    },
    bundle: true,
    minify: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    write: false,
  });
  const grouped = group.outputFiles[0]!.contents;
  for (const [name, entry, platform] of entrypoints) {
    const captures = [];
    for (const before of [true, false]) {
      const built = await build({
        entryPoints: [entry],
        outfile: '.atseq-local/oauth-bundles/initial.js',
        bundle: true,
        minify: true,
        format: 'esm',
        platform,
        target: 'es2022',
        conditions: ['atseq-source', ...(platform === 'browser' ? ['browser'] : ['node'])],
        write: false,
        metafile: true,
        logLevel: 'silent',
        plugins: before
          ? [
              {
                name: 'pre-OAuth-provenance',
                setup(builder) {
                  builder.onLoad({ filter: /\.(?:json|ts)$/ }, (args) => {
                    const path = relative(process.cwd(), args.path);
                    if (!baselineFiles.has(path)) return;
                    return { contents: previous(path), loader: path.endsWith('.json') ? 'json' : 'ts' };
                  });
                },
              },
            ]
          : [],
      });
      const code = built.outputFiles.find((file) => file.path.endsWith('.js'))!.contents;
      const inputs = Object.keys(built.metafile.inputs);
      const addedInputs = inputs.filter(underAdded);
      assert.ok(addedInputs.every((path) => path.endsWith('/package.json')));
      const modules = inputs.filter((path) => path.startsWith('node_modules/') && executable(path)).sort();
      const metadataRaw = Object.values(built.metafile.outputs).reduce(
        (sum, output) =>
          sum +
          Object.entries(output.inputs)
            .filter(([path]) => underAdded(path))
            .reduce((value, [, input]) => value + input.bytesInOutput, 0),
        0,
      );
      captures.push({
        phase: before ? 'pre-OAuth-provenance' : 'current',
        codeBytes: code.length,
        gzipBytes: gzipSync(code, { level: 9 }).length,
        metadataRawBytesInOutput: metadataRaw,
        addedInputs,
        executableModules: modules,
      });
      mkdirSync('.atseq-local/oauth-bundles', { recursive: true });
      writeFileSync(`.atseq-local/oauth-bundles/${name}-${before ? 'before' : 'after'}.js`, code);
      writeFileSync(
        `.atseq-local/oauth-bundles/${name}-${before ? 'before' : 'after'}-metafile.json`,
        JSON.stringify(built.metafile, null, 2),
      );
    }
    assert.deepEqual(captures[1]!.executableModules, captures[0]!.executableModules);
    assert.deepEqual(captures[0]!.addedInputs, []);
    results.push({
      name,
      entry,
      platform,
      ...Object.fromEntries(captures.map((row) => [row.phase, row])),
      wholeBundleDelta: {
        raw: captures[1]!.codeBytes - captures[0]!.codeBytes,
        gzip: captures[1]!.gzipBytes - captures[0]!.gzipBytes,
      },
      groupedMetadataCapture: {
        raw: grouped.length,
        gzip: gzipSync(grouped, { level: 9 }).length,
        method:
          'Separate standalone minified JS array of the same 47 exact manifests; gzip is not an additive contribution in the ordinary bundle',
      },
    });
  }
  mkdirSync(evidence, { recursive: true });
  writeFileSync('.atseq-local/oauth-bundles/grouped-metadata.js', grouped);
  writeFileSync(
    evidence + 'initial-bundle-costs.json',
    JSON.stringify(
      {
        basis,
        method:
          'Actual current source entrypoints; pre-OAuth overlay replaces only six provenance/notices/manifest files with the 147-path source basis. Old installed package files are preserved. No executable input changes. Does not measure startup time.',
        results,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    JSON.stringify(
      results.map((row) => ({
        name: row.name,
        delta: row.wholeBundleDelta,
        metadataRawBytesInOutput: (row as any).current.metadataRawBytesInOutput,
        grouped: row.groupedMetadataCapture,
      })),
    ),
  );
});

test('OAuth enrolment loaders retain a dynamic adapter/client chunk boundary', async () => {
  const rows = [];
  for (const [name, entry, platform] of [
    ['browser', 'src/browser/oauth-loader.ts', 'browser'],
    ['node', 'src/host/oauth-loader.ts', 'node'],
  ] as const) {
    const root = resolve('.atseq-local/oauth-lazy-' + name);
    const built = await build({
      entryPoints: [entry],
      bundle: true,
      splitting: true,
      outdir: root,
      format: 'esm',
      platform,
      target: 'es2022',
      conditions: ['atseq-source', platform],
      write: false,
      metafile: true,
      minify: true,
      logLevel: 'silent',
    });
    const outputs = Object.entries(built.metafile.outputs);
    const initial = outputs.find(([, value]) => value.entryPoint === entry)!;
    assert.ok(initial);
    const byPath = new Map(outputs);
    const staticPaths = new Set<string>();
    const visit = (path: string) => {
      if (staticPaths.has(path)) return;
      staticPaths.add(path);
      const output = byPath.get(path);
      assert.ok(output, 'Static chunk must be retained in the metafile');
      for (const edge of output.imports) if (!edge.external && edge.kind !== 'dynamic-import') visit(edge.path);
    };
    visit(initial[0]);
    const initialInputs = [...new Set([...staticPaths].flatMap((path) => Object.keys(byPath.get(path)!.inputs)))];
    assert.ok(initialInputs.filter(underAdded).every((path) => path.endsWith('/package.json')));
    const dynamic = outputs.flatMap(([from, output]) =>
      output.imports.filter((edge) => edge.kind === 'dynamic-import').map((edge) => ({ from, to: edge.path })),
    );
    assert.ok(dynamic.length >= 2); // adapter, then maintained client
    assert.ok(
      outputs.some(([, output]) => Object.keys(output.inputs).some((path) => underAdded(path) && executable(path))),
    );
    rows.push({
      platform,
      initialEntry: initial[0],
      initialStaticGraph: [...staticPaths],
      initialAddedInputs: initialInputs.filter(underAdded),
      initialStaticChunks: built.outputFiles
        .filter((file) => staticPaths.has(relative(process.cwd(), file.path)))
        .map((file) => ({
          path: relative(root, file.path),
          rawBytes: file.contents.length,
          gzipBytes: gzipSync(file.contents, { level: 9 }).length,
        })),
      dynamic,
      chunks: built.outputFiles.map((file) => ({
        path: relative(root, file.path),
        rawBytes: file.contents.length,
        gzipBytes: gzipSync(file.contents, { level: 9 }).length,
      })),
      outputs: built.metafile.outputs,
    });
    mkdirSync(root, { recursive: true });
    for (const file of built.outputFiles) writeFileSync(file.path, file.contents);
    writeFileSync(root + '/metafile.json', JSON.stringify(built.metafile, null, 2));
  }
  mkdirSync(evidence, { recursive: true });
  writeFileSync(
    evidence + 'lazy-chunks.json',
    JSON.stringify(
      {
        method:
          'Production internal enrolment loaders with esbuild splitting; exact current installed tree; raw and gzip chunk bytes, not startup time',
        rows,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    JSON.stringify(
      rows.map((row) => ({ platform: row.platform, dynamicImports: row.dynamic.length, chunks: row.chunks })),
    ),
  );
});
