import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { execFileSync } from 'node:child_process';
import { build } from 'vite';
import { chromium } from '@playwright/test';

const output = '.atseq-local/complete-state-cap';
const measured = process.argv.includes('--measure');
const fixturesRaw = await readFile(output + '/fixtures.json');
const fixtures = JSON.parse(fixturesRaw);
const expected = JSON.parse(await readFile(output + '/node-structural.json', 'utf8')).results;
const built = await build({
  configFile: false,
  logLevel: 'error',
  resolve: { conditions: ['atseq-source', 'browser', 'module', 'production'] },
  build: {
    write: false,
    minify: true,
    lib: { entry: new URL('./browser.ts', import.meta.url).pathname, formats: ['es'] },
  },
});
const chunks = (Array.isArray(built) ? built : [built]).flatMap((x) => x.output).filter((x) => x.type === 'chunk');
assert.equal(chunks.length, 1);
const code = chunks[0].code;
assert.ok(!/from\s*['"]node:/.test(code));
const server = createServer((request, response) => {
  response.setHeader('content-type', request.url === '/probe.js' ? 'text/javascript' : 'text/html');
  response.end(request.url === '/probe.js' ? code : '<!doctype html><title>Complete state cap</title>');
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const result = await page.evaluate(
    async ({ fixtures, measured }) => {
      const probe = await import('/probe.js');
      return probe.run(fixtures, measured);
    },
    { fixtures, measured },
  );
  assert.deepEqual(measured ? result.captures.map((x) => x.reference) : result.results, expected);
  const sha = (value) => createHash('sha256').update(value).digest('hex');
  const metadata = {
    phase: measured ? 'quiet-window-kernels' : 'untimed-correctness-and-structural-counts',
    exactHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    node: process.version,
    chromium: browser.version(),
    fixtureSha256: sha(fixturesRaw),
    bundleBytes: Buffer.byteLength(code),
    bundleSha256: sha(code),
    sourceHashes: Object.fromEntries(
      await Promise.all(
        ['fixtures.ts', 'kernels.ts', 'measure.ts', 'browser.ts', 'browser-run.mjs'].map(async (name) => [
          name,
          sha(await readFile(new URL(name, import.meta.url))),
        ]),
      ),
    ),
    method:
      'Actual portable source in Chromium page. Fixture transfer, source reconstruction, module loading, warmups and instrumented correctness are outside each timed method. Not a worker latency/transfer or native end-to-end measurement.',
  };
  await writeFile(
    output + (measured ? '/chromium-timing.json' : '/chromium-structural.json'),
    JSON.stringify({ metadata, ...result }, null, 2) + '\n',
  );
  console.log(
    JSON.stringify({ phase: metadata.phase, fixtures: fixtures.length, passed: true, chromium: metadata.chromium }),
  );
} finally {
  await browser.close();
  await new Promise((ok) => server.close(ok));
}
