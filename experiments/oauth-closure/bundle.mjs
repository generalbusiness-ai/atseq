import { build, version } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';

const output = 'experiments/post-spike-evidence/2026-10-01/oauth-closure/';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const roots = {
  official: { node: '@atproto/oauth-client-node', browser: '@atproto/oauth-client-browser' },
  atcute: { node: '@atcute/oauth-node-client', browser: '@atcute/oauth-browser-client' },
  hybrid: { node: '@atcute/oauth-node-client', browser: '@atproto/oauth-client-browser' },
  'official-preserved': { node: '@atproto/oauth-client-node', browser: '@atproto/oauth-client-browser' },
  'hybrid-preserved': { node: '@atcute/oauth-node-client', browser: '@atproto/oauth-client-browser' },
};
const results = [];
for (const [variant, packages] of Object.entries(roots)) {
  const root = resolve('.tmp/oauth-closure/' + variant);
  for (const [platform, pkg] of Object.entries(packages)) {
    for (const mode of ['full', 'minimal']) {
      const selection = pkg.startsWith('@atproto/')
        ? platform === 'browser'
          ? ['BrowserOAuthClient']
          : ['NodeOAuthClient', 'requestLocalLock']
        : platform === 'browser'
          ? [
              'configureOAuth',
              'createAuthorizationUrl',
              'finalizeAuthorization',
              'getSession',
              'deleteStoredSession',
              'OAuthUserAgent',
            ]
          : ['OAuthClient', 'MemoryStore'];
      const source =
        mode === 'full'
          ? `export * from ${JSON.stringify(pkg)};\n`
          : `export { ${selection.join(', ')} } from ${JSON.stringify(pkg)};\n`;
      const prefix = `${variant}-${platform}${mode === 'full' ? '' : '-minimal'}`;
      const entry = join(root, `.probe-${platform}-${mode}.mjs`);
      writeFileSync(entry, source);
      try {
        const result = await build({
          entryPoints: [entry],
          bundle: true,
          write: false,
          minify: true,
          sourcemap: false,
          metafile: true,
          platform,
          format: 'esm',
          target: 'es2022',
          conditions: platform === 'browser' ? ['browser', 'import', 'default'] : ['node', 'import', 'default'],
          logLevel: 'silent',
        });
        const code = result.outputFiles[0].contents;
        const imports = Object.entries(result.metafile.inputs).map(([path, info]) => ({
          path: relative(root, resolve(path)),
          bytes: info.bytes,
          sha256: hash(readFileSync(path)),
          imports: info.imports,
        }));
        const capture = {
          variant,
          platform,
          mode,
          package: pkg,
          entrySource: source,
          bundleBytes: code.length,
          gzipBytes: gzipSync(code, { level: 9 }).length,
          bundleSha256: hash(code),
          importedFiles: imports.length,
          contributingFiles: Object.values(result.metafile.outputs)
            .flatMap((item) => Object.values(item.inputs))
            .filter((item) => item.bytesInOutput > 0).length,
          inputs: imports,
          externalImports: Object.values(result.metafile.outputs)
            .flatMap((item) => item.imports)
            .filter((item) => item.external),
          outputMetadata: result.metafile.outputs,
          warnings: result.warnings,
        };
        results.push(capture);
        writeFileSync(output + `${prefix}-bundle.js`, code);
        writeFileSync(output + `${prefix}-metafile.json`, JSON.stringify(result.metafile, null, 2) + '\n');
      } catch (error) {
        results.push({
          variant,
          platform,
          mode,
          package: pkg,
          failed: true,
          errors: error.errors ?? [],
          message: error.message,
        });
      }
    }
  }
}
writeFileSync(
  output + 'bundles.json',
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      node: process.version,
      bundler: { name: 'esbuild', version },
      method:
        'Full exported package API and selected minimal enrolment API; exact installed candidate dependency tree; ESM bundle, ES2022 target, minified, level-9 gzip. Metafile gives static import closure, including side-effect polyfills; dynamic imports/external Node builtins stay identified.',
      limits: [
        'Standalone library footprint, not implemented Atseq shell or incremental integrated bundle',
        'Static import analysis does not prove runtime execution or provider behavior',
      ],
      results,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  JSON.stringify(
    results.map((row) => ({
      variant: row.variant,
      platform: row.platform,
      mode: row.mode,
      bytes: row.bundleBytes,
      gzip: row.gzipBytes,
      importedFiles: row.importedFiles,
      failed: row.failed ?? false,
    })),
  ),
);
