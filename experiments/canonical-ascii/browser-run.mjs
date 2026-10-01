import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { build } from 'vite';
import { chromium } from '@playwright/test';
import { sources, compiled, output, basis } from './sources.mjs';

const browser = await chromium.launch();
const captures = [];
try {
  for (const variant of ['baseline', 'actual']) {
    const candidate = sources[variant];
    const built = await build({
      configFile: false,
      logLevel: 'error',
      resolve: { conditions: ['atseq-source', 'browser', 'module', 'production'] },
      plugins:
        variant === 'baseline'
          ? [
              {
                name: 'isolated-pre-change-guard',
                enforce: 'pre',
                transform(_source, path) {
                  if (path.split('?')[0].endsWith('/src/core/values.ts')) return { code: candidate, map: null };
                },
              },
            ]
          : [],
      build: {
        write: false,
        minify: false,
        lib: { entry: new URL('./browser.ts', import.meta.url).pathname, formats: ['es'] },
      },
    });
    const chunks = (Array.isArray(built) ? built : [built])
      .flatMap((result) => result.output)
      .filter((file) => file.type === 'chunk');
    assert.equal(chunks.length, 1);
    const code = chunks[0].code;
    const server = createServer((request, response) => {
      if (request.url === '/probe.js') {
        response.setHeader('content-type', 'text/javascript');
        response.end(code);
      } else {
        response.setHeader('content-type', 'text/html');
        response.end('<!doctype html><title>Canonical ASCII equivalence</title>');
      }
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const page = await browser.newPage();
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      const result = await page.evaluate(async (compiled) => {
        const probe = await import('/probe.js');
        return { differences: probe.differential(compiled), shared: await probe.shared() };
      }, compiled);
      for (const record of Object.values(result.differences.comparisons)) assert.deepEqual(record.mismatches, []);
      assert.deepEqual(
        result.shared.cases.filter((entry) => !entry.passed),
        [],
      );
      captures.push({
        variant,
        bundleBytes: Buffer.byteLength(code),
        bundleSha256: createHash('sha256').update(code).digest('hex'),
        ...result,
      });
    } finally {
      await page.close();
      await new Promise((resolve) => server.close(resolve));
    }
  }
  assert.deepEqual(captures[0].shared, captures[1].shared);
  const result = {
    capturedAt: new Date().toISOString(),
    basis,
    browser: 'Chromium',
    version: browser.version(),
    method:
      'Baseline Vite bundle substitutes only pre-change values.ts; actual bundle uses unchanged on-disk implementation without substitution. Both execute hostile differentials, current shared protocol/runtime assertions and controlled real schema/xrpc wrappers in Chromium. Node-only evolution assertions remain covered separately.',
    captures,
  };
  writeFileSync(output + 'browser.json', JSON.stringify(result, null, 2) + '\n');
  console.log(
    JSON.stringify({
      sharedCases: captures.map((row) => row.shared.cases.length),
      differentialCases: Object.values(captures[0].differences.comparisons)[0].cases,
      passed: true,
    }),
  );
} finally {
  await browser.close();
}
