import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

/** Replay a signed spike capture with its hash-checked original browser binary. */
export async function historicalReplay(raw: Uint8Array, invitation: { app: string; genesis: string }, root: string) {
  const names = await readdir(`${root}/host-build/assets`),
    worker = names.find((name) => /^worker-[\w-]+\.js$/.test(name));
  if (!worker) throw new Error('Historical worker binary is missing');
  const binary = await readFile(`${root}/host-build/assets/${worker}`);
  const server = createServer((req, res) => {
    if (req.url === '/') {
      res.writeHead(200, { 'content-type': 'text/html' });
      res.end('<!doctype html><title>Historical replay</title>');
    } else if (req.url === `/${worker}`) {
      res.writeHead(200, { 'content-type': 'text/javascript' });
      res.end(binary);
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Historical replay server unavailable');
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${address.port}`);
    await page.evaluate((name) => {
      const worker = new Worker(`/${name}`, { type: 'module' });
      let id = 0;
      const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
      worker.onmessage = ({ data }) => {
        const task = pending.get(data.id);
        if (!task) return;
        pending.delete(data.id);
        data.error ? task.reject(new Error(data.error.message)) : task.resolve(data.result);
      };
      worker.onerror = () => {
        for (const task of pending.values()) task.reject(new Error('Historical interpreter failed'));
        pending.clear();
      };
      (window as any).historicalCall = (data: any) =>
        new Promise((resolve, reject) => {
          const next = ++id;
          pending.set(next, { resolve, reject });
          worker.postMessage({ ...data, id: next });
        });
    }, worker);
    const call = (data: unknown) => page.evaluate((data) => (window as any).historicalCall(data), data);
    const checked: any = await call({ kind: 'importArchive', source: Array.from(raw), expected: invitation });
    const snapshot: any = await call({ kind: 'sync', input: checked.input, invitation });
    const summary: any = await call({ kind: 'query', name: 'summary', params: {} });
    return { checked, snapshot, summary, browserVersion: browser.version() };
  } finally {
    await browser?.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
