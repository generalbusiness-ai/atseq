import { P256PrivateKeyExportable } from '@atcute/crypto';
import { Anchor, headAt, sequence, type SignedIntent } from '../src/protocol/log.ts';
import { exportArchive, encodeArchive } from '../src/archive/archive.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readdir, readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { build } from 'vite';
import { chromium, expect } from '@playwright/test';
import { startEnvironment, resetDisposable } from '../experiments/pds/environment.mjs';
import { ApplicationHost } from '../src/host/application.ts';
import { LocalAccounts } from '../src/host/accounts.ts';
import { startApplicationService } from '../src/host/http.ts';
import { buildShell } from '../src/host/build.ts';
import { readHostToken } from '../src/host/token.ts';
import { AtseqClient } from '../src/client/api.ts';
import { bytes, decodeBlock, contentCid } from '../src/protocol/wire.ts';
import { createIdentity, prepareIntent } from '../src/client/identity.ts';
import { guitarFixture } from '../testdata/apps/fixtures.ts';
import type { RetainedInput } from '../src/archive/archive.ts';
import type { AppSession } from '../src/browser/session.ts';
import type { WorkerReply } from '../src/browser/protocol.ts';

test('browser sessions retain trust and device work across switches and restarts', async (t) => {
  const env = await startEnvironment(),
    root = await mkdtemp(join(tmpdir(), 'atseq-browser-session-'));
  const directory = join(env.dir, 'apps');
  await build({
    root: resolve('src/browser'),
    logLevel: 'silent',
    build: {
      outDir: root,
      emptyOutDir: true,
      rollupOptions: {
        input: { shell: resolve('src/browser/index.html'), probe: resolve('tests/support/browser-device-probe.ts') },
        preserveEntrySignatures: 'exports-only',
      },
    },
  });
  const assets = await readdir(join(root, 'assets'));
  const probe = '/assets/' + assets.find((name) => /^probe-.*\.js$/.test(name));
  const worker = '/assets/' + assets.find((name) => /^worker-.*\.js$/.test(name));
  assert.ok(!probe.endsWith('undefined') && !worker.endsWith('undefined'));
  const host = new ApplicationHost(directory, new LocalAccounts(env.url, directory)),
    service = await startApplicationService(host, { staticRoot: root });
  const browser = await chromium.launch(),
    context = await browser.newContext();
  await context.addInitScript(
    (token) => sessionStorage.setItem('atseq.host-token', token),
    await readHostToken(service.tokenFile),
  );
  await context.addInitScript({ content: 'globalThis.__name = (fn) => fn;' });
  const page = await context.newPage(),
    api = new AtseqClient(service.url, await readHostToken(service.tokenFile));
  const fixture = await guitarFixture(),
    identity = await createIdentity('session test');
  const create = async () => {
    const created = await api.call(
      'create',
      { source: bytes(await fixture.bundle.write()), activationKeys: [identity.publicKey] },
      randomUUID(),
    );
    return { app: created.genesis.app as string, genesis: created.genesisCid.$link as string };
  };
  const a = await create(),
    b = await create();
  const initialA: RetainedInput = await api.call('sync', a);
  const prepared = await prepareIntent(identity, a, fixture.bundle.root, fixture.action, {
    id: 'a-only',
    title: 'Only in app A',
    pricePence: 100,
  });
  await api.call('submit', { block: bytes(new Uint8Array(prepared.block)) });
  const latestA: RetainedInput = await api.call('sync', a),
    binding: AppSession = { ...a, definition: fixture.bundle.root };
  const open = async (invitation: typeof a) => {
    await page.evaluate((target) => {
      location.hash = new URLSearchParams(target).toString();
    }, invitation);
    await expect(page.getByRole('heading', { name: 'Participate', exact: true })).toBeVisible();
  };
  try {
    await page.goto(service.url);
    await t.test('CryptoKeys survive IndexedDB reload and private export is refused', async () => {
      const result = await page.evaluate(async (probe) => {
        const { DeviceStore, createDeviceIdentity, deviceIdentity } = (await import(
          probe
        )) as typeof import('./support/browser-device-probe.ts');
        const store = await DeviceStore.open('atseq-key-probe'),
          identity = await createDeviceIdentity('Retained key');
        await store.set('identity', identity);
        store.close();
        const reopened = await DeviceStore.open('atseq-key-probe'),
          checked = (await deviceIdentity(reopened))!;
        let exportRefused = false;
        try {
          await crypto.subtle.exportKey('jwk', checked.keys.privateKey);
        } catch {
          exportRefused = true;
        }
        const keys = Object.keys(checked);
        reopened.close();
        return {
          exportRefused,
          extractable: checked.keys.privateKey.extractable,
          type: checked.keys.privateKey.type,
          same: checked.publicKey === identity.publicKey,
          keys,
        };
      }, probe);
      assert.deepEqual(result, {
        exportRefused: true,
        extractable: false,
        type: 'private',
        same: true,
        keys: ['name', 'publicKey', 'keys'],
      });
      await page.getByRole('button', { name: 'Create identity', exact: true }).click();
      await expect(
        page.getByText('Clearing site data loses this device’s signing key', { exact: false }),
      ).toBeVisible();
      await page.getByRole('textbox', { name: 'Display name' }).fill('Browser session');
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
    });
    await t.test('every app operation rejects mismatched app, genesis and definition', async () => {
      const results = await page.evaluate(
        async ({ worker, inputText, binding }) => {
          const latestA = JSON.parse(inputText) as RetainedInput;
          const evaluator = new Worker(worker, { type: 'module' });
          let id = 0;
          const call = (args: Record<string, unknown>) =>
            new Promise<WorkerReply>((resolve) => {
              evaluator.onmessage = ({ data }) => resolve(data);
              evaluator.postMessage({ ...args, id: ++id });
            });
          try {
            const first = await call({ kind: 'sync', input: latestA, session: binding });
            if (first.error) throw new Error(first.error.message);
            const results: string[] = [];
            for (const field of ['app', 'genesis', 'definition'])
              for (const args of [
                { kind: 'query', name: 'summary', params: {} },
                { kind: 'view', name: 'main' },
                { kind: 'validateAction', action: 'fake', payload: {} },
                { kind: 'previewPending', intents: [] },
                { kind: 'exportArchive' },
                { kind: 'compareDefinition', source: [], expected: binding.definition },
              ]) {
                const reply = await call({ ...args, session: { ...binding, [field]: 'wrong' } });
                results.push(reply.error?.message ?? 'ACCEPTED');
              }
            return results;
          } finally {
            evaluator.terminate();
          }
        },
        { worker, inputText: JSON.stringify(latestA), binding },
      );
      assert.equal(results.length, 18);
      assert.ok(results.every((message) => message.includes('App session changed')));
    });
    await t.test('a restarted worker replays saved history before a rollback from the host', async () => {
      const refused = await page.evaluate(
        async ({ probe, latestText, initialText, binding }) => {
          const latestA = JSON.parse(latestText) as RetainedInput,
            initialA = JSON.parse(initialText) as RetainedInput;
          const { Evaluator } = (await import(probe)) as typeof import('./support/browser-device-probe.ts');
          const evaluator = new Evaluator();
          try {
            await evaluator.call('sync', { input: latestA, session: binding }, 120000);
            evaluator.cancel();
            try {
              await evaluator.call('sync', { input: initialA, session: binding }, 120000);
              return false;
            } catch (error) {
              return (error as Error).message.includes('behind interpretation');
            }
          } finally {
            evaluator.select();
          }
        },
        { probe, latestText: JSON.stringify(latestA), initialText: JSON.stringify(initialA), binding },
      );
      assert.equal(refused, true);
    });
    await t.test(
      'a failed or cancelled first worker load preserves the saved prefix against host rollback',
      async () => {
        for (const mode of ['failed', 'cancelled']) {
          const isolated = await browser.newContext({ serviceWorkers: 'block' });
          await isolated.addInitScript({ content: 'globalThis.__name = (fn) => fn;' });
          const tab = await isolated.newPage();
          try {
            await tab.goto(service.url);
            await tab.evaluate(
              async ({ probe, latestText }) => {
                const { DeviceStore } = await import(probe);
                const store = await DeviceStore.open(),
                  input = JSON.parse(latestText);
                await store.set(`verified:${input.genesis.app}:${input.genesisCid}`, input);
                store.close();
              },
              { probe, latestText: JSON.stringify(latestA) },
            );
            await tab.route('**/xrpc/ai.generalbusiness.atseq.sync?**', (route) => route.fulfill({ json: initialA }));
            let release!: () => void, arrived!: () => void;
            const held = new Promise<void>((resolve) => (release = resolve)),
              requested = new Promise<void>((resolve) => (arrived = resolve));
            let first = true;
            await tab.route('**' + worker, async (route) => {
              if (!first) {
                await route.continue();
                return;
              }
              first = false;
              arrived();
              if (mode === 'failed') await route.fulfill({ status: 404, body: 'Missing worker' });
              else {
                await held;
                await route.continue();
              }
            });
            await tab.evaluate((target) => {
              location.hash = new URLSearchParams(target).toString();
            }, a);
            await requested;
            if (mode === 'cancelled') {
              await tab.getByRole('button', { name: 'Cancel local work', exact: true }).click();
              release();
            }
            await expect(tab.getByRole('status')).toContainText(mode === 'failed' ? 'Worker failed' : 'cancelled');
            const retry = tab.getByRole('button', { name: 'Retry', exact: true });
            await expect(retry).toBeVisible();
            await retry.click();
            await expect(tab.getByRole('status')).toContainText('behind interpretation');
            const count = await tab.evaluate(
              async ({ probe, a }) => {
                const { DeviceStore } = await import(probe),
                  store = await DeviceStore.open();
                const saved = await store.get(`verified:${a.app}:${a.genesis}`);
                store.close();
                return saved.entries.length;
              },
              { probe, a },
            );
            assert.equal(count, 1);
          } finally {
            await isolated.close();
          }
        }
      },
    );
    await t.test('an older archive cannot replace saved history for the same genesis', async () => {
      await open(a);
      const archived = encodeArchive(await exportArchive(initialA, a));
      await page
        .getByLabel('Import app archive', { exact: true })
        .setInputFiles({ name: 'older.atseq.json', mimeType: 'application/json', buffer: Buffer.from(archived) });
      await expect(page.getByRole('status')).toContainText('behind interpretation');
      const count = await page.evaluate(
        async ({ probe, a }) => {
          const { DeviceStore } = await import(probe),
            store = await DeviceStore.open();
          const saved = await store.get(`verified:${a.app}:${a.genesis}`);
          store.close();
          return saved.entries.length;
        },
        { probe, a },
      );
      assert.equal(count, 1);
      await expect(page.getByRole('heading', { name: 'Participate', exact: true })).toBeVisible();
    });
    await t.test('corrupt saved history has explicit recovery without losing its pin, key or signed work', async () => {
      const isolated = await browser.newContext({ serviceWorkers: 'block' });
      await isolated.addInitScript({ content: 'globalThis.__name = (fn) => fn;' });
      const tab = await isolated.newPage();
      try {
        await tab.goto(service.url);
        const corrupted = structuredClone(latestA),
          signature = corrupted.entries[0]!.sig.$bytes;
        corrupted.entries[0]!.sig.$bytes = (signature.startsWith('A') ? 'B' : 'A') + signature.slice(1);
        const key = await tab.evaluate(
          async ({ probe, inputText, a }) => {
            const { DeviceStore, createDeviceIdentity } = await import(probe),
              store = await DeviceStore.open();
            const identity = await createDeviceIdentity('Recovery key');
            await store.set('identity', identity);
            await store.set(`pin:${a.app}`, a);
            await store.set(`verified:${a.app}:${a.genesis}`, JSON.parse(inputText));
            await store.set(`outbox:${a.app}:retained`, { status: 'refused', block: [1, 2, 3] });
            store.close();
            return identity.publicKey;
          },
          { probe, inputText: JSON.stringify(corrupted), a },
        );
        await tab.evaluate((a) => {
          location.hash = new URLSearchParams(a).toString();
        }, a);
        await expect(
          tab.getByRole('heading', { name: 'Saved history on this device failed verification', exact: true }),
        ).toBeVisible();
        await expect(tab.getByRole('button', { name: 'Forget this invitation', exact: true })).toBeVisible();
        await expect(
          tab.getByText('Discarding saved history removes this device’s rollback protection.', { exact: false }),
        ).toBeVisible();
        await tab.getByRole('button', { name: 'Retry', exact: true }).click();
        await expect(
          tab.getByRole('heading', { name: 'Saved history on this device failed verification', exact: true }),
        ).toBeVisible();
        await tab.getByRole('button', { name: 'Discard saved history', exact: true }).click();
        await expect(tab.getByRole('status')).toContainText('Verified through entry 1');
        const retained = await tab.evaluate(
          async ({ probe, a }) => {
            const { DeviceStore } = await import(probe),
              store = await DeviceStore.open();
            const result = {
              pin: await store.get(`pin:${a.app}`),
              key: (await store.get('identity')).publicKey,
              work: await store.get(`outbox:${a.app}:retained`),
              count: (await store.get(`verified:${a.app}:${a.genesis}`)).entries.length,
            };
            store.close();
            return result;
          },
          { probe, a },
        );
        assert.deepEqual(retained, { pin: a, key, work: { status: 'refused', block: [1, 2, 3] }, count: 1 });
      } finally {
        await isolated.close();
      }
    });
    await t.test(
      'an online event during the saved-prefix decision cannot load a fork before fresh restore',
      async () => {
        let writer: P256PrivateKeyExportable | undefined;
        for (const id of await readdir(directory)) {
          if (!/^[a-f0-9-]{36}$/.test(id)) continue;
          const record = JSON.parse(await readFile(join(directory, id, 'creation-secret.json'), 'utf8'));
          if (record.genesis?.app === a.app)
            writer = await P256PrivateKeyExportable.importRaw(new Uint8Array(record.writer));
        }
        assert.ok(writer);
        const anchor = await Anchor.from(latestA.genesis, a),
          alternative = await prepareIntent(identity, a, fixture.bundle.root, fixture.action, {
            id: 'forked',
            title: 'Forked host',
            pricePence: 100,
          });
        const entry = await sequence(
          decodeBlock(new Uint8Array(alternative.block)) as unknown as SignedIntent,
          anchor,
          headAt(anchor),
          writer,
        );
        const forked = { ...latestA, head: headAt(anchor, 1, await contentCid(entry)), entries: [entry] };
        const isolated = await browser.newContext({ serviceWorkers: 'block' });
        await isolated.addInitScript({ content: 'globalThis.__name = (fn) => fn;' });
        const tab = await isolated.newPage();
        let syncs = 0;
        try {
          await tab.goto(service.url);
          await tab.evaluate(
            async ({ probe, latestText, a }) => {
              const { DeviceStore, Outbox } = await import(probe),
                store = await DeviceStore.open();
              await store.set(`verified:${a.app}:${a.genesis}`, JSON.parse(latestText));
              store.close();
              const flush = Outbox.prototype.flush;
              Outbox.prototype.flush = function () {
                return flush.call(this).then(() => {
                  setTimeout(() => {
                    (window as any).onlineEventProcessed = true;
                  }, 0);
                });
              };
              const original = DeviceStore.prototype.get;
              let release!: () => void;
              const held = new Promise<void>((resolve) => (release = resolve));
              (window as any).releaseSaved = release;
              DeviceStore.prototype.get = async function (key: string) {
                if (key.startsWith('verified:')) {
                  (window as any).savedReadHeld = true;
                  await held;
                }
                return original.call(this, key);
              };
            },
            { probe, latestText: JSON.stringify(latestA), a },
          );
          await tab.route('**/xrpc/ai.generalbusiness.atseq.sync?**', (route) => {
            syncs++;
            return route.fulfill({ json: forked });
          });
          await tab.evaluate((a) => {
            location.hash = new URLSearchParams(a).toString();
          }, a);
          await tab.waitForFunction(() => (window as any).savedReadHeld);
          await tab.evaluate(() => window.dispatchEvent(new Event('online')));
          await tab.waitForFunction(() => (window as any).onlineEventProcessed);
          assert.equal(syncs, 0);
          await tab.evaluate(() => (window as any).releaseSaved());
          await expect(tab.getByRole('status')).toContainText('differs from interpreted history');
          await expect(tab.getByRole('heading', { name: 'Participate', exact: true })).toBeVisible();
          const saved = await tab.evaluate(
            async ({ probe, a }) => {
              const { DeviceStore } = await import(probe),
                store = await DeviceStore.open();
              const saved = await store.get(`verified:${a.app}:${a.genesis}`);
              store.close();
              return saved;
            },
            { probe, a },
          );
          assert.deepEqual(saved, latestA);
          assert.equal(syncs, 1);
        } finally {
          await isolated.close();
        }
      },
    );
    await t.test('a slow A refresh cannot replace offline B or label its query and archive as A', async () => {
      await open(b);
      await open(a);
      let release!: () => void, captured!: () => void;
      const held = new Promise<void>((resolve) => {
          release = resolve;
        }),
        arrived = new Promise<void>((resolve) => {
          captured = resolve;
        });
      await page.route('**/xrpc/ai.generalbusiness.atseq.sync?**', async (route) => {
        const app = new URL(route.request().url()).searchParams.get('app');
        if (app === a.app) {
          const response = await route.fetch();
          captured();
          await held;
          await route.fulfill({ response });
        } else await route.abort();
      });
      await page.getByRole('button', { name: 'Refresh', exact: true }).click();
      await arrived;
      await page.evaluate((target) => {
        location.hash = new URLSearchParams(target).toString();
      }, b);
      await expect(page.getByRole('heading', { name: 'Participate', exact: true })).toBeVisible();
      release();
      await expect(page.getByRole('status')).toContainText('Showing saved state');
      await page.getByRole('button', { name: 'Run query', exact: true }).click();
      await expect(
        page.getByRole('heading', { name: 'Queries', exact: true }).locator('..').locator('pre'),
      ).toContainText('"count": 0');
      const download = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Download app and verified history', exact: true }).click();
      const archive = JSON.parse(await readFile((await (await download).path())!, 'utf8'));
      assert.equal(archive.input.genesis.app, b.app);
      assert.equal(archive.input.genesisCid, b.genesis);
      assert.equal(archive.input.entries.length, 0);
      await page.unroute('**/xrpc/ai.generalbusiness.atseq.sync?**');
    });
    await t.test('a new save during a flush is sent, and only definite refusals require explicit resend', async () => {
      const second = await prepareIntent(identity, a, fixture.bundle.root, fixture.action, {
        id: 'probe-two',
        title: 'Second',
        pricePence: 100,
      });
      const results = await page.evaluate(
        async ({ probe, pendingText }) => {
          const { DeviceStore, Outbox, ApiError } = (await import(
            probe
          )) as typeof import('./support/browser-device-probe.ts');
          const [first, second] = JSON.parse(pendingText) as import('../src/browser/outbox.ts').Pending[];
          const store = await DeviceStore.open('atseq-outbox-probe'),
            sent: string[] = [];
          let release!: () => void, arrived!: () => void;
          const held = new Promise<void>((resolve) => {
              release = resolve;
            }),
            started = new Promise<void>((resolve) => {
              arrived = resolve;
            });
          let mode = 'success';
          const api = {
            call: async (_name: string, input: Record<string, unknown>) => {
              sent.push(JSON.stringify(input.block));
              if (sent.length === 1) {
                arrived();
                await held;
              }
              if (mode === 'auth') throw new ApiError(401, 'host_authentication', 'unavailable', true);
              if (mode === 'uncertain') throw new ApiError(400, 'signature', 'unproven', false);
              if (mode === 'refusal') throw new ApiError(400, 'signature', 'invalid signature', true);
              return { receipt: null };
            },
          };
          const outbox = new Outbox(store, api);
          try {
            await store.enqueue(first!.app, first!.cid, first!);
            const running = outbox.flush();
            await started;
            await store.enqueue(second!.app, second!.cid, second!);
            const again = outbox.flush();
            release();
            await Promise.all([running, again]);
            const count = sent.length;
            const key = `outbox:${first!.app}:${first!.cid}`;
            await store.update<import('../src/browser/outbox.ts').Pending>(key, (previous) => ({
              ...previous!,
              status: 'queued',
            }));
            mode = 'auth';
            await outbox.flush();
            const auth = (await store.get<import('../src/browser/outbox.ts').Pending>(key))!.status;
            mode = 'uncertain';
            await outbox.flush();
            const uncertain = (await store.get<import('../src/browser/outbox.ts').Pending>(key))!.status;
            mode = 'refusal';
            await outbox.flush();
            const refused = (await store.get<import('../src/browser/outbox.ts').Pending>(key))!;
            mode = 'success';
            await outbox.resend(refused);
            const resent = (await store.get<import('../src/browser/outbox.ts').Pending>(key))!.status;
            return {
              count,
              auth,
              uncertain,
              refused: refused.status,
              resent,
              exact: sent.slice(2).every((block) => block === sent[0]),
            };
          } finally {
            store.close();
          }
        },
        {
          probe,
          pendingText: JSON.stringify([
            { ...prepared, ...a, status: 'queued' },
            { ...second, ...a, status: 'queued' },
          ]),
        },
      );
      assert.deepEqual(results, {
        count: 2,
        auth: 'queued',
        uncertain: 'queued',
        refused: 'refused',
        resent: 'recorded',
        exact: true,
      });
    });
    await t.test('an invalid invitation cannot poison the pin and verified pins can be forgotten', async () => {
      await open(a);
      await page.evaluate(async (probe) => {
        const { DeviceStore } = await import(probe),
          original = DeviceStore.prototype.list;
        let release!: () => void;
        const held = new Promise<void>((resolve) => (release = resolve));
        (window as any).releasePin = release;
        let once = true;
        DeviceStore.prototype.list = async function (prefix: string) {
          const result = await original.call(this, prefix);
          if (prefix === 'pin:' && once) {
            once = false;
            (window as any).pinReadHeld = true;
            await held;
            setTimeout(() => {
              (window as any).oldPinFinished = true;
            }, 0);
          }
          return result;
        };
      }, probe);
      await page.evaluate(() => window.dispatchEvent(new Event('online')));
      await page.waitForFunction(() => (window as any).pinReadHeld);
      await page.getByRole('button', { name: 'Forget this invitation', exact: true }).click();
      await expect(
        page.getByText('Invitation forgotten. Signed work remains on this device.', { exact: true }),
      ).toBeVisible();
      await page.evaluate(() => (window as any).releasePin());
      await page.waitForFunction(() => (window as any).oldPinFinished);
      await page.evaluate(
        (target) => {
          location.hash = new URLSearchParams(target).toString();
        },
        { app: a.app, genesis: b.genesis },
      );
      await expect(page.getByRole('heading', { name: 'App unavailable', exact: true })).toBeVisible();
      const pin = await page.evaluate(
        async ({ probe, app }) => {
          const { DeviceStore } = (await import(probe)) as typeof import('./support/browser-device-probe.ts');
          const store = await DeviceStore.open();
          try {
            return await store.get(`pin:${app}`);
          } finally {
            store.close();
          }
        },
        { probe, app: a.app },
      );
      assert.equal(pin, undefined);
      await open(a);
      await expect(page.getByRole('status')).toContainText('Verified through entry 1');
    });
    await t.test('startup submits retained signed work without a Retry click', async () => {
      const pending = await prepareIntent(identity, a, fixture.bundle.root, fixture.action, {
        id: 'startup',
        title: 'Saved before reload',
        pricePence: 100,
      });
      await page.evaluate(
        async ({ probe, pendingText }) => {
          const { DeviceStore } = (await import(probe)) as typeof import('./support/browser-device-probe.ts');
          const pending = JSON.parse(pendingText) as import('../src/browser/outbox.ts').Pending,
            store = await DeviceStore.open();
          try {
            await store.enqueue(pending.app, pending.cid, pending);
          } finally {
            store.close();
          }
        },
        { probe, pendingText: JSON.stringify({ ...pending, ...a, status: 'queued' }) },
      );
      const submitted = page.waitForResponse(
        (response) => new URL(response.url()).pathname === '/xrpc/ai.generalbusiness.atseq.submit',
      );
      await page.reload();
      assert.equal((await submitted).status(), 200);
      await expect.poll(async () => (await api.call('sync', a)).entries.length).toBe(2);
    });
    await t.test('a shell update waits and keeps an open tab’s worker assets available offline', async () => {
      const shellRoot = await mkdtemp(join(tmpdir(), 'atseq-shell-update-'));
      const built = await buildShell(shellRoot),
        service2 = await startApplicationService(host, { staticRoot: shellRoot });
      const tabContext = await browser.newContext();
      await tabContext.addInitScript({ content: 'globalThis.__name = (fn) => fn;' });
      const tab = await tabContext.newPage();
      try {
        await tab.goto(service2.url);
        await expect(tab.locator('#offline-ready')).toHaveText('Shell saved for offline use');
        await tab.reload();
        await expect.poll(() => tab.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
        const script = await readFile(join(shellRoot, 'sw.js'), 'utf8');
        await writeFile(join(shellRoot, 'sw.js'), script.replace(built.cache, built.cache + '-next'));
        await tab.evaluate(async () => {
          const registration = (await navigator.serviceWorker.getRegistration())!;
          await registration.update();
        });
        await expect
          .poll(() => tab.evaluate(async () => Boolean((await navigator.serviceWorker.getRegistration())!.waiting)))
          .toBe(true);
        assert.equal(await tab.evaluate((cache) => caches.has(cache), built.cache), true);
        await tabContext.setOffline(true);
        const workerPath = built.files.find((path) => /\/worker-.*\.js$/.test(path))!;
        const replayed = await tab.evaluate(
          async ({ workerPath, source }) => {
            const worker = new Worker(workerPath, { type: 'module' });
            try {
              const result = await new Promise<WorkerReply>((resolve) => {
                worker.onmessage = ({ data }) => resolve(data);
                worker.onerror = () => resolve({ id: 1, error: { code: 'worker', message: 'Worker load failed' } });
                worker.postMessage({ id: 1, kind: 'preview', source });
              });
              return result.error
                ? result.error.message
                : (result.result as { definition: { cid: string } }).definition.cid;
            } finally {
              worker.terminate();
            }
          },
          { workerPath, source: [...(await fixture.bundle.write())] },
        );
        assert.equal(replayed, fixture.bundle.root);
      } finally {
        await tabContext.close();
        await service2.close();
        await rm(shellRoot, { recursive: true, force: true });
      }
    });
  } finally {
    await browser.close();
    await service.close();
    await host.close();
    await env.close();
    await resetDisposable(env.dir);
    await rm(root, { recursive: true, force: true });
  }
});
