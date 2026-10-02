import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { build } from 'vite';
import { chromium } from '@playwright/test';
import { nativeDiscoveryFaultBundle } from './support/native-discovery-fault-bundle.ts';
test('actual Chrome executes genuine discovery, callsite races and full10k workloads', async () => {
  const directory = process.env.ATSEQ_NATIVE_DISCOVERY_BROWSER_CAPTURE_DIR ?? '.atseq-local/c1-kernel/chromium';
  await mkdir(directory, { recursive: true });
  const files = new Map<string, Buffer | string>();
  for (const [url, path] of [
    [
      '/fixture.json',
      process.env.ATSEQ_NATIVE_DISCOVERY_FIXTURE_PATH ?? '.atseq-local/c1-kernel/native-discovery-fixture-final2.json',
    ],
    [
      '/original.json',
      process.env.ATSEQ_NATIVE_APPLICATION_FIXTURE_PATH ?? '/private/tmp/atseq-c1-f1-oracle-20261002.json',
    ],
    [
      '/few.json',
      process.env.ATSEQ_NATIVE_DISCOVERY_WORKLOAD_FEW ??
        '.atseq-local/c1-kernel/native-discovery-workload-few-final.json',
    ],
    [
      '/many.json',
      process.env.ATSEQ_NATIVE_DISCOVERY_WORKLOAD_MANY ??
        '.atseq-local/c1-kernel/native-discovery-workload-many-final.json',
    ],
  ])
    files.set(url!, await readFile(path!));
  for (const [url, entry] of [
    ['/corpus.js', 'native-discovery-corpus.ts'],
    ['/workload.js', 'native-discovery-workload-corpus.ts'],
  ]) {
    const built = await build({
      configFile: false,
      logLevel: 'error',
      build: {
        write: false,
        minify: true,
        lib: { entry: new URL('./support/' + entry, import.meta.url).pathname, formats: ['es'] },
      },
    });
    const chunks = (Array.isArray(built) ? built : [built])
      .flatMap((r) => ('output' in r ? r.output : []))
      .filter((r) => r.type === 'chunk');
    assert.equal(chunks.length, 1);
    assert.ok(!/from\s*['"]node:/.test(chunks[0]!.code));
    files.set(url!, chunks[0]!.code);
  }
  files.set('/faults.js', await nativeDiscoveryFaultBundle());
  for (const [url, raw] of files) if (url.endsWith('.js')) await writeFile(directory + '/' + url.slice(1), raw);
  const server = createServer((request, response) => {
    const url = request.url ?? '/';
    response.setHeader(
      'content-type',
      url.endsWith('.js') ? 'text/javascript' : url.endsWith('.json') ? 'application/json' : 'text/html',
    );
    response.end(files.get(url) ?? '<!doctype html><title>Genuine native discovery</title>');
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const browser = await chromium.launch({ args: ['--enable-precise-memory-info'] });
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${address.port}`);
    const component = await page.evaluate(async () => {
      const corpus = await import('/corpus.js' as string),
        probe = await import('/faults.js' as string);
      const fixture = await (await fetch('/fixture.json')).json(),
        original = await (await fetch('/original.json')).json();
      return {
        cases: await corpus.nativeDiscoveryCorpus(fixture, original),
        faults: await probe.nativeDiscoveryFaultProbe(original),
      };
    });
    const hash = (raw: Buffer | string) => createHash('sha256').update(raw).digest('hex');
    await writeFile(
      directory + '/component.json',
      JSON.stringify(
        {
          node: process.version,
          chromium: browser.version(),
          ...component,
          files: [...files].map(([path, raw]) => ({ path, bytes: Buffer.byteLength(raw), sha256: hash(raw) })),
        },
        null,
        2,
      ) + '\n',
    );
    for (const profile of ['few', 'many']) {
      const result = await page.evaluate(async (profile) => {
        const corpus = await import('/workload.js' as string),
          fixture = await (await fetch('/' + profile + '.json')).json();
        return corpus.nativeDiscoveryWorkloadCorpus(fixture);
      }, profile);
      await writeFile(
        directory + '/' + profile + '.json',
        JSON.stringify({ chromium: browser.version(), result }, null, 2) + '\n',
      );
    }
    console.log(
      JSON.stringify({
        chromium: browser.version(),
        cases: component.cases.map((c: any) => c.id),
        faults: component.faults.map((c: any) => c.id),
        workloads: [100, 1000, 10000],
      }),
    );
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
