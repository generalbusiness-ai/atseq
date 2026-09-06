import { join, resolve } from 'node:path';
import { build } from 'vite';
import { startEnvironment } from '../experiments/pds/environment.mjs';
import { ApplicationHost } from '../src/host/application.ts';
import { LocalAccounts } from '../src/host/accounts.ts';
import { startApplicationService } from '../src/host/http.ts';
import { AtseqClient } from '../src/client/api.ts';
import { bytes } from '../src/protocol/wire.ts';
import { chartFixture, guitarFixture } from '../testdata/apps/fixtures.ts';

const root = resolve('experiments/generated/app');
await build({ root: resolve('src/browser'), logLevel: 'warn', build: { outDir: root, emptyOutDir: true } });
const env = await startEnvironment(), directory = join(env.dir, 'apps');
const host = new ApplicationHost(directory, new LocalAccounts(env.url, directory));
const service = await startApplicationService(host, { staticRoot: root, port: Number(process.env.ATSEQ_PORT ?? 0) });
console.log(`Atseq test host: ${service.url}`);
console.log('Disposable test PDS; synthetic demo data only. No app is published until Start.');
const api = new AtseqClient(service.url);
for (const fixture of [await chartFixture(), await guitarFixture()]) {
  const preview = await api.call('preview', { source: bytes(await fixture.bundle.write()) }); console.log(`${fixture.manifest.title}: ${preview.previewUrl}`);
}
let closing = false;
async function close() { if (closing) return; closing = true; await service.close(); await env.close(); console.log('Test services stopped. Marked test data remains in .atseq-local for inspection.'); }
process.once('SIGINT', () => { void close(); }); process.once('SIGTERM', () => { void close(); });
