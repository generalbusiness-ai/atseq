import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { gunzipSync } from 'node:zlib';
import { once } from 'node:events';
import { execFileSync } from 'node:child_process';
import { build } from 'vite';
import { chromium } from '@playwright/test';

const root = 'experiments/post-spike-evidence/2026-10-01/s0-replay';
const raw = gunzipSync(await readFile(root + '/public-inputs.json.gz'));
const probe = process.argv.includes('--probe');
const inputs = JSON.parse(raw).filter((x) => !probe || x.n === 100);
const built = await build({
  configFile: false,
  logLevel: 'error',
  resolve: { conditions: ['atseq-source', 'browser', 'module', 'production'] },
  build: {
    write: false,
    minify: true,
    lib: { entry: new URL('./replay.ts', import.meta.url).pathname, formats: ['es'] },
  },
});
const chunks = (Array.isArray(built) ? built : [built]).flatMap((x) => x.output).filter((x) => x.type === 'chunk');
assert.equal(chunks.length, 1);
const code = chunks[0].code;
assert.ok(!/from\s*['"]node:/.test(code));
const server = createServer((request, response) => {
  response.setHeader('content-type', request.url === '/probe.js' ? 'text/javascript' : 'text/html');
  response.end(request.url === '/probe.js' ? code : '<!doctype html><title>S0 whole replay</title>');
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const result = await page.evaluate(
    async ({ inputs, probe }) => {
      const module = await import('/probe.js');
      return module.measure(inputs, probe ? 1 : 2);
    },
    { inputs, probe },
  );
  const sha = (value) => createHash('sha256').update(value).digest('hex');
  const metadata = {
    capturedAt: new Date().toISOString(),
    exactHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    node: process.version,
    chromium: browser.version(),
    inputSha256: sha(raw),
    inputBytes: raw.length,
    bundleSha256: sha(code),
    bundleBytes: Buffer.byteLength(code),
    sourceHashes: Object.fromEntries(
      await Promise.all(
        ['prepare.ts', 'replay.ts', 'browser-run.mjs'].map(async (name) => [
          name,
          sha(await readFile(new URL(name, import.meta.url))),
        ]),
      ),
    ),
    method:
      'Actual portable Folder in a foreground Chromium page. Every timed span starts at frontier zero and interprets all N distinct entries once using catchUpVerifiedStatus. Browser/source loading, input transfer, signature/history verification, ten-entry warmup and final state/query/oracle checking are outside timing. No native/durable/checkpoint/worker-transfer claims.',
  };
  const label = probe ? 'chromium-probe' : 'chromium-timing';
  await writeFile(root + '/' + label + '.json', JSON.stringify({ metadata, ...result }, null, 2) + '\n');
  console.log(
    JSON.stringify({ label, cells: result.captures.length, chromium: browser.version(), failures: result.failures }),
  );
  if (result.failures.length) process.exitCode = 1;
} finally {
  await browser?.close();
  await new Promise((ok) => server.close(ok));
}
