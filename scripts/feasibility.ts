import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { cpus, platform, arch } from 'node:os';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { build, preview } from 'vite';
import { chromium } from '@playwright/test';
import { runCorpus, type FixtureResult } from '../experiments/corpus.ts';
import { PROFILE } from '../src/runtime/profile.ts';

const generated = 'experiments/generated';
await mkdir(generated, { recursive: true });
const evidence = 'experiments/evidence';
await mkdir(evidence, { recursive: true });
const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));
const version = (name: string): string => lock.packages[`node_modules/${name}`].version;
const report: Record<string, any> = { stage: 'S0', passed: false, measuredAt: new Date().toISOString(), environment: { node: process.version, os: platform(), arch: arch(), cpu: cpus()[0]?.model }, profile: PROFILE, limitations: [
  'This gate covers engine feasibility only; PDS, signing, activation and archives have separate gates.',
  'Local forms and fixture routes here are experiment code. The separate S4 participation gate checks generic application interaction.',
  'One JSONata engine and candidate profile; only the documented expression/Lexicon subset is admitted.',
  'Chromium is the browser exercised here. No cross-browser or production isolation claim.',
  'No wall-time threshold defines semantic effectiveness. Watchdog failures pause interpretation.',
] };
function command(file: string, args: string[], options: { cwd?: string; env?: NodeJS.ProcessEnv } = {}) {
  return execFileSync(file, args, { encoding: 'utf8', timeout: 60_000, maxBuffer: 8 * 1024 * 1024, ...options });
}
async function files(dir: string): Promise<string[]> {
  const paths: string[] = [];
  for (const item of await readdir(dir)) { const path = `${dir}/${item}`; paths.push(...(await stat(path)).isDirectory() ? await files(path) : [path]); }
  return paths;
}
let server: Awaited<ReturnType<typeof preview>> | undefined;
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
try {
  // Replay the rejected candidate, including its real browser build; a setup
  // failure is never silently substituted for measured candidate evidence.
  report.goVersion = command('go', ['version']).trim();
  const goCwd = 'experiments/jsonataddl';
  const native = JSON.parse(command('go', ['run', '.'], { cwd: goCwd }));
  command('go', ['build', '-o', '../generated/jsonataddl.wasm', '.'], { cwd: goCwd, env: { ...process.env, GOOS: 'js', GOARCH: 'wasm' } });
  command(process.execPath, ['--import', 'tsx', 'scripts/probe-go.ts']);
  const goBrowser = JSON.parse(await readFile(`${generated}/go-browser.json`, 'utf8'));
  assert.equal(goBrowser.exit, 0, JSON.stringify(goBrowser.errors));
  assert.deepEqual(JSON.parse(goBrowser.logs[0]), native);
  report.candidates = {
    jsonataddl: { selected: false, module: JSON.parse(command('go', ['list', '-m', '-json', 'github.com/generalbusiness-ai/tailapps/jsonataddl'], { cwd: goCwd })), native, browser: goBrowser, reason: 'The generated state facade works in both environments. The published closed profile rejects the append and multiplication fixtures and exposes depth/range bounds plus a 2000 ms watchdog, but no deterministic operation counter. Using a private core fork is excluded; the planned single-engine fallback supplies those capabilities.' },
    jsonata: { selected: true, version: version('jsonata'), profile: PROFILE.id, engineForked: false },
    schemas: { selected: '@atproto/lexicon', version: version('@atproto/lexicon'), runtimeLoaded: true, perAppCodeGeneration: false },
    ui: { selected: '@inlay/core + @inlay/render', versions: [version('@inlay/core'), version('@inlay/render')], localTemplates: true, externalXrpc: false },
  };
  delete report.candidates.jsonataddl.module.Dir;
  delete report.candidates.jsonataddl.module.GoMod;
  report.licenseAssessment = {
    runtime: 'MIT declarations for jsonata and @atproto/lexicon; @inlay/core declares MIT. @inlay/render omits package license metadata, but its exact published gitHead README declares MIT.',
    inlayRenderEvidence: { revision: 'f6d4f5808e5a822ae98d330ee8efff866bab0346', source: 'https://tangled.org/danabra.mov/inlay/blob/f6d4f5808e5a822ae98d330ee8efff866bab0346/README.md', section: 'License', declaration: 'MIT' },
    buildTools: 'The lock includes MPL-2.0 lightningcss and permissively licensed tools. No dependency source is modified; runtime and build-tool notices remain with their packages.',
    go: 'The published probe uses Apache-2.0 jsonataddl, as recorded in the module source LICENSE; it is not an Atseq runtime dependency.',
  };
  const start = performance.now();
  report.nodeFixtures = await runCorpus(); report.nodeCorpusMs = performance.now() - start;
  await build({ root: resolve('experiments/browser'), logLevel: 'warn', build: { outDir: resolve(`${generated}/browser`), emptyOutDir: true }, worker: { format: 'es' } });
  const bundles = await Promise.all((await files(`${generated}/browser`)).map(async path => {
    const content = await readFile(path); return { path: path.replace(`${generated}/`, ''), bytes: content.length, gzipBytes: gzipSync(content).length, sha256: createHash('sha256').update(content).digest('hex') };
  }));
  report.browserBundles = bundles;
  server = await preview({ root: resolve('experiments/browser'), logLevel: 'warn', build: { outDir: resolve(`${generated}/browser`) }, preview: { host: '127.0.0.1', port: 0 } });
  browser = await chromium.launch();
  const origin = server.resolvedUrls?.local[0];
  assert.ok(origin, 'Preview server must report its local origin');
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const errors: string[] = []; const external: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!request.url().startsWith(origin) && !request.url().startsWith('data:')) external.push(request.url()); });
  await page.goto(origin);
  await page.waitForFunction(() => (window as any).atseqExperiment?.ready, undefined, { timeout: 20_000 });
  assert.equal(await page.evaluate(() => (window as any).atseqExperiment.submissions), 0);
  await page.getByRole('button', { name: 'Run browser checks' }).click();
  await page.waitForFunction(() => (window as any).atseqExperiment.fixtures.length > 0, undefined, { timeout: 20_000 });
  report.browserFixtures = await page.evaluate(() => (window as any).atseqExperiment.fixtures);
  report.browser = { version: browser.version(), loadMs: await page.evaluate(() => (window as any).atseqExperiment.loadMs) };
  assert.deepEqual(report.browserFixtures, report.nodeFixtures);
  await page.getByLabel('Amount', { exact: true }).fill('7');
  await page.getByLabel('Amount', { exact: true }).press('Tab');
  await page.getByRole('button', { name: 'Record amount' }).press('Enter');
  await page.getByText('Total recorded: 9', { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => (window as any).atseqExperiment.submissions), 1);
  await page.screenshot({ path: `${evidence}/desktop.png`, fullPage: true });
  await page.evaluate(() => (window as any).atseqExperiment.render('<img src="https://example.test/x" onerror="window.pwned=1"><script>window.pwned=1</script>'));
  assert.equal(await page.locator('#app img, #app script').count(), 0);
  assert.equal(await page.evaluate(() => (window as any).pwned), undefined);
  assert.equal(await page.evaluate(() => (window as any).atseqExperiment.submissions), 1);
  assert.equal(external.length, 0, JSON.stringify(external));
  await page.evaluate(() => (window as any).atseqExperiment.render('Total recorded: 9'));
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  await page.screenshot({ path: `${evidence}/mobile.png`, fullPage: true });
  assert.deepEqual(errors, []);
  report.browserControls = { keyboardSubmit: true, renderSubmissions: 0, explicitSubmissions: 1, escapedHostileText: true, externalRequests: external, mobileOverflow: false, pageErrors: errors };
  report.dependencies = Object.entries(lock.packages).filter(([path]) => path).map(([path, pkg]) => { const p = pkg as any; return { path, version: p.version, license: p.license ?? 'not declared', integrity: p.integrity, resolved: p.resolved }; });
  report.sourceHashes = Object.fromEntries(await Promise.all(([
    ...await files('src'), ...await files('scripts'), ...await files('experiments/browser'),
    ...await files('experiments/jsonataddl'), 'experiments/corpus.ts', 'experiments/fixtures.ts', 'experiments/boundaries.ts', 'package.json', 'package-lock.json', 'tsconfig.json',
  ]).map(async path => [path, createHash('sha256').update(await readFile(path)).digest('hex')])));
  report.screenshots = Object.fromEntries(await Promise.all((await files(evidence)).map(async path => [path, createHash('sha256').update(await readFile(path)).digest('hex')])));
  // Full graph is retained separately; the lockfile records all exact versions.
  await writeFile(`${generated}/npm-tree.json`, command('npm', ['ls', '--all', '--json']));
  await writeFile(`${generated}/go-modules.json`, command('go', ['list', '-m', '-json', 'all'], { cwd: goCwd }));
  report.passed = (report.nodeFixtures as FixtureResult[]).every(f => f.passed) && (report.browserFixtures as FixtureResult[]).every(f => f.passed);
} catch (error) {
  report.failure = { message: (error as Error).message, stack: (error as Error).stack };
  process.exitCode = 1;
} finally {
  await browser?.close();
  await new Promise<void>(resolve => server ? server.httpServer.close(() => resolve()) : resolve());
  await writeFile('experiments/feasibility.json', JSON.stringify(report, null, 2) + '\n');
  if (!report.passed) process.exitCode = 1;
  console.log(JSON.stringify({ passed: report.passed, nodeFixtures: report.nodeFixtures?.length, browserFixtures: report.browserFixtures?.length, failure: report.failure?.message, evidence: 'experiments/feasibility.json' }, null, 2));
}
