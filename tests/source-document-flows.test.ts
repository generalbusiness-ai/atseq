import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, symlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { build } from 'vite';
import { chromium, expect } from '@playwright/test';
import { startEnvironment, resetDisposable } from './support/pds/environment.mjs';
import { viewlessExamples } from './support/source-document-corpus.ts';
import { sourceDocumentToBundle } from '../src/definition/document.ts';
import { bytes } from '../src/protocol/wire.ts';
import { ApplicationHost } from '../src/host/application.ts';
import { LocalAccounts } from '../src/host/accounts.ts';
import { startApplicationService } from '../src/host/http.ts';
import { AtseqClient } from '../src/client/api.ts';
import { readHostToken } from '../src/host/token.ts';
import { cli } from './helpers/cli.ts';
import { recordFlowEvidence, type MeasuredCase } from './helpers/evidence.ts';

test('single documents support generic CLI, host discovery and viewless browser participation', async (t) => {
  const environment = await startEnvironment(),
    directory = join(environment.dir, 'apps');
  const root = resolve('experiments/generated/source-document-app');
  const host = new ApplicationHost(directory, new LocalAccounts(environment.url, directory));
  let service: Awaited<ReturnType<typeof startApplicationService>> | undefined;
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  const results: MeasuredCase[] = [];
  async function check(name: string, run: () => Promise<void>) {
    let failure: unknown;
    await t.test(name, async () => {
      const started = performance.now();
      let passed = false;
      try {
        await run();
        passed = true;
      } catch (error) {
        failure = error;
        throw error;
      } finally {
        results.push({ name, passed, elapsedMs: Math.round(performance.now() - started) });
      }
    });
    if (failure) throw failure;
  }
  try {
    await build({ root: resolve('src/browser'), logLevel: 'silent', build: { outDir: root, emptyOutDir: true } });
    service = await startApplicationService(host, { staticRoot: root });
    const api = new AtseqClient(service.url, await readHostToken(service.tokenFile));
    const keyFile = join(environment.dir, 'author.json');
    await cli({ operation: 'identity', keyFile, name: 'Document author' });
    let taskboard: { app: string; genesis: string } | undefined;
    for (const example of viewlessExamples) {
      await check(`${example.name}: pack, validate, preview, create, submit, query and outcome`, async () => {
        const documentPath = join(environment.dir, example.name + '.atseq.json');
        const sourcePath = join(environment.dir, example.name + '.car');
        const exportedPath = join(environment.dir, example.name + '.exported.json');
        await writeFile(documentPath, JSON.stringify(example.document));
        const packed = await cli({ operation: 'packDocument', source: documentPath, output: sourcePath });
        const bundle = await sourceDocumentToBundle(example.document);
        assert.equal(packed.definition, bundle.root);
        await cli({ operation: 'unpackDocument', source: sourcePath, output: exportedPath });
        assert.equal((await sourceDocumentToBundle(await readFile(exportedPath, 'utf8'))).root, bundle.root);
        await assert.rejects(() => cli({ operation: 'packDocument', source: documentPath, output: sourcePath }));
        await assert.rejects(() =>
          cli({ operation: 'packDocument', source: documentPath, output: documentPath, overwrite: true }),
        );
        const alias = join(environment.dir, example.name + '.alias.json');
        await symlink(documentPath, alias);
        await assert.rejects(() => cli({ operation: 'packDocument', source: alias, output: alias + '.car' }));
        const common = { host: service!.url, hostTokenFile: service!.tokenFile, source: sourcePath };
        assert.equal((await cli({ operation: 'validate', ...common })).definition.cid, bundle.root);
        const action = `ai.generalbusiness.atseq.examples.${example.name}.data#${example.action}`;
        const preview = await cli({ operation: 'preview', ...common, action, payload: example.payload });
        assert.deepEqual(preview.views, []);
        assert.equal(preview.outcome.decision, 'effective');
        const created = await cli({ operation: 'create', ...common, keyFile, creationId: randomUUID() });
        const invitation = { app: created.genesis.app, genesis: created.genesisCid.$link };
        if (example.name === 'taskboard') taskboard = invitation;
        const submitted = await cli({
          operation: 'submit',
          ...common,
          ...invitation,
          definition: bundle.root,
          action,
          payload: example.payload,
          keyFile,
          intentFile: join(environment.dir, example.name + '.intent.json'),
        });
        assert.equal(submitted.receipt.position, 1);
        const outcome = await cli({
          operation: 'outcome',
          host: service!.url,
          ...invitation,
          intent: submitted.intent,
        });
        assert.equal(outcome.outcome.$type, 'ai.generalbusiness.atseq.defs#effective');
        const query = await cli({ operation: 'query', host: service!.url, ...invitation, name: 'summary', params: {} });
        assert.deepEqual(query.result.value, example.summary);
        const lean = await api.call('describe', invitation);
        assert.equal(lean.definition.version, 1);
        assert.equal(Object.hasOwn(lean.definition, 'source'), false);
        const complete = await cli({ operation: 'describe', host: service!.url, ...invitation, includeSource: true });
        const restored = await sourceDocumentToBundle(complete.definition.source);
        assert.equal(restored.root, complete.definition.cid);
        for (const cid of bundle.identities()) assert.deepEqual(await restored.get(cid), await bundle.get(cid));
        assert.equal(
          Object.hasOwn((await api.call('describe', { ...invitation, includeSource: false })).definition, 'source'),
          false,
        );
        assert.equal(
          (
            await fetch(
              `${service!.url}/xrpc/ai.generalbusiness.atseq.describe?${new URLSearchParams({ ...invitation, includeSource: 'perhaps' })}`,
            )
          ).status,
          400,
        );
        assert.equal(bytes(await restored.write()).$bytes, bytes(await bundle.write()).$bytes);
      });
    }
    await check('viewless taskboard offers generic forms, signed actions and query inspection', async () => {
      browser = await chromium.launch();
      const page = await browser.newPage();
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(service!.url + '/#' + new URLSearchParams(taskboard).toString());
      await expect(page.getByRole('heading', { name: 'Participate', exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'complete', exact: true }).click();
      await page.getByRole('textbox', { name: 'Display name' }).fill('Fresh reader');
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await page.getByRole('textbox', { name: 'id', exact: true }).fill('one');
      await page.getByRole('button', { name: 'Save action', exact: true }).click();
      await expect(page.getByText('Applied', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Run query', exact: true }).click();
      await expect(page.locator('pre').filter({ hasText: '"completed": 1' })).toBeVisible();
      const query = await api.call('query', { ...taskboard, name: 'summary', params: '{}' });
      assert.deepEqual(query.result.value, { count: 1, completed: 1 });
      assert.deepEqual(errors, []);
    });
    await recordFlowEvidence('source-document', results, {
      expectedCases: 4,
      browserVersion: browser?.version(),
      sourceDocumentVersion: 1,
      sourceLimitBytes: 512 * 1024,
      documentLimitBytes: 1024 * 1024,
    });
  } finally {
    await browser?.close();
    await service?.close();
    await host.close();
    await environment.close();
    await resetDisposable(environment.dir);
  }
});
