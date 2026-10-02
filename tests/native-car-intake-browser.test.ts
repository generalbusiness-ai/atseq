import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { build } from 'vite';
import { chromium } from '@playwright/test';
import { intakeFixtures, intakePrefixFixture } from './support/native-car-intake.ts';
test('Chromium executes bounded intake, genuine P1 and legacy CAR predicates on the same retained bytes', async () => {
  const fixtures = process.env.ATSEQ_CAR_INTAKE_FIXTURES
      ? JSON.parse(await readFile(process.env.ATSEQ_CAR_INTAKE_FIXTURES, 'utf8'))
      : { fixtures: await intakeFixtures(), prefix: await intakePrefixFixture() },
    built = await build({
      configFile: false,
      logLevel: 'error',
      build: {
        write: false,
        minify: true,
        lib: { entry: new URL('./support/native-car-intake.ts', import.meta.url).pathname, formats: ['es'] },
      },
    }),
    chunks = (Array.isArray(built) ? built : [built])
      .flatMap((result) => ('output' in result ? result.output : []))
      .filter((file) => file.type === 'chunk');
  assert.equal(chunks.length, 1);
  const code = chunks[0]!.code;
  assert.ok(!/from\s*['"]node:/.test(code));
  const server = createServer((request, response) => {
    response.setHeader('content-type', request.url === '/probe.js' ? 'text/javascript' : 'text/html');
    response.end(request.url === '/probe.js' ? code : '<!doctype html><title>Bounded CAR intake</title>');
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
        module = await import(path);
      return module.carIntakeConformance(fixtures.fixtures, fixtures.prefix);
    }, fixtures);
    assert.equal(result.cases.length, 24);
    assert.equal(result.legacyCases.length, 20);
    assert.ok(result.proofCases.length >= 50);
    const output = process.env.ATSEQ_CAR_INTAKE_OUTPUT ?? '.atseq-local/p2-car-intake';
    await mkdir(output, { recursive: true });
    await writeFile(output + '/chromium-bundle.js', code);
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
        cases: result.cases.length,
        legacy: result.legacyCases.length,
        proof: result.proofCases.length,
        bundleBytes: Buffer.byteLength(code),
        outputs: result.outputs,
      }),
    );
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
