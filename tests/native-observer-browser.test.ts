import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { build } from 'vite';
import { chromium } from '@playwright/test';
import { nativeObserverHostCorpus } from './support/native-observer-fixture.ts';
test('Chromium verifies observer CAR rules and exact Node-produced retained authority/app handoffs', async () => {
  const fixtures = await nativeObserverHostCorpus();
  const built = await build({
    configFile: false,
    logLevel: 'error',
    build: {
      write: false,
      minify: true,
      lib: { entry: new URL('./support/native-observer-portable.ts', import.meta.url).pathname, formats: ['es'] },
    },
  });
  const chunks = (Array.isArray(built) ? built : [built])
    .flatMap((result) => ('output' in result ? result.output : []))
    .filter((file) => file.type === 'chunk');
  assert.equal(chunks.length, 1);
  const code = chunks[0]!.code;
  assert.ok(!/from\s*['"]node:/.test(code));
  const server = createServer((request, response) => {
    response.setHeader('content-type', request.url === '/probe.js' ? 'text/javascript' : 'text/html');
    response.end(request.url === '/probe.js' ? code : '<!doctype html><title>Observer retained replay</title>');
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:' + address.port);
    const result = await page.evaluate(async (fixtures) => {
      const path = '/probe.js',
        probe = await import(path);
      return {
        carCases: await probe.nativeObserverCarCorpus(),
        replayCases: await probe.replayObserverFixtures(fixtures.fixtures, fixtures.appCaptures),
      };
    }, fixtures);
    assert.equal(result.carCases.length, 20);
    assert.ok(result.replayCases.length >= 13);
    const output = process.env.ATSEQ_OBSERVER_TEST_OUTPUT ?? 'experiments/generated/native-observer';
    await mkdir(output, { recursive: true });
    await writeFile(
      output + '/chromium.json',
      JSON.stringify(
        {
          browser: 'Chromium',
          version: browser.version(),
          ...result,
          bundleBytes: Buffer.byteLength(code),
          bundleSha256: createHash('sha256').update(code).digest('hex'),
          sharedPublicFixtures: fixtures,
          actualBrowserExecution: true,
          hostObserverInBrowser: false,
          providerTrial: false,
        },
        null,
        2,
      ) + '\n',
    );
    console.log(
      JSON.stringify({
        browser: browser.version(),
        carCases: result.carCases.length,
        replayCases: result.replayCases.length,
        bundleBytes: Buffer.byteLength(code),
      }),
    );
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
