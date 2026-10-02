import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { build } from 'vite';
import { chromium } from '@playwright/test';
test('actual Chromium executes genuine scoped extraction and unchanged P1 corpus', async () => {
  const fixture = JSON.parse(
    await readFile(
      process.env.ATSEQ_NATIVE_EXTRACTION_FIXTURE_PATH ?? '.atseq-local/native-proof-extraction/fixture.json',
      'utf8',
    ),
  );
  const workloads = JSON.parse(
    await readFile(
      process.env.ATSEQ_NATIVE_EXTRACTION_WORKLOAD_FIXTURE_PATH ??
        '.atseq-local/native-proof-extraction/workload-fixture.json',
      'utf8',
    ),
  );
  const built = await build({
    configFile: false,
    logLevel: 'error',
    build: {
      write: false,
      minify: true,
      lib: {
        entry: new URL('./support/native-proof-extraction-browser.ts', import.meta.url).pathname,
        formats: ['es'],
      },
    },
  });
  const chunks = (Array.isArray(built) ? built : [built])
    .flatMap((result) => ('output' in result ? result.output : []))
    .filter((file) => file.type === 'chunk');
  assert.equal(chunks.length, 1);
  const code = chunks[0]!.code;
  assert.ok(!/from\s*['"]node:/.test(code));
  const server = createServer((request, response) => {
    if (request.url === '/probe.js') {
      response.setHeader('content-type', 'text/javascript');
      response.end(code);
    } else {
      response.setHeader('content-type', 'text/html');
      response.end('<!doctype html><title>Native extraction</title>');
    }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${address.port}`);
    const result = await page.evaluate(
      async ({ fixture, workloads }) => {
        const module = '/probe.js',
          probe = await import(module);
        return {
          extraction: await probe.nativeProofExtractionCorpus(fixture),
          workloads: await probe.nativeProofExtractionWorkloads(workloads),
          originalP1Cases: await probe.nativeProofCorpus(),
        };
      },
      { fixture, workloads },
    );
    assert.equal(result.extraction.cases.length, 17);
    assert.equal(result.workloads.measurements.length, 13);
    assert.ok(result.originalP1Cases.length >= 25);
    const directory =
      process.env.ATSEQ_NATIVE_EXTRACTION_BROWSER_CAPTURE_DIR ?? '.atseq-local/native-proof-extraction-browser';
    await mkdir(directory, { recursive: true });
    await writeFile(directory + '/probe.js', code);
    const capture = {
      browser: 'Chromium',
      version: browser.version(),
      ...result,
      bundleBytes: Buffer.byteLength(code),
      bundleSha256: createHash('sha256').update(code).digest('hex'),
      actualExecution: true,
      browserInstalledProvenanceAcceptance: false,
    };
    await writeFile(directory + '/chromium.json', JSON.stringify(capture, null, 2) + '\n');
    console.log(
      JSON.stringify({
        browser: browser.version(),
        extractionCases: result.extraction.cases.length,
        workloadMeasurements: result.workloads.measurements.length,
        originalP1Cases: result.originalP1Cases.length,
        bundleBytes: Buffer.byteLength(code),
      }),
    );
  } finally {
    if (browser) await browser.close();
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
