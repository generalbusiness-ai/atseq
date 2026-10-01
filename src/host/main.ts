#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve, join } from 'node:path';
import { ApplicationHost } from './application.ts';
import { LocalAccounts } from './accounts.ts';
import { buildShell } from './build.ts';
import { startApplicationService } from './http.ts';
const { values } = parseArgs({
  options: {
    pds: { type: 'string' },
    directory: { type: 'string' },
    port: { type: 'string' },
    'handle-suffix': { type: 'string' },
    help: { type: 'boolean' },
  },
});
if (values.help) {
  console.log(
    'atseq-host --pds PDS_ORIGIN --directory PRIVATE_DIRECTORY [--port PORT] [--handle-suffix .test]\nStarts the loopback host with retained app accounts. The PDS must permit local account provisioning. The directory contains private credentials and writer keys.',
  );
  process.exit(0);
}
if (!values.pds || !values.directory) throw new Error('Specify --pds and --directory; use --help for usage.');
const port = Number(values.port ?? 0);
if (!Number.isSafeInteger(port) || port < 0 || port > 65535)
  throw new Error('Expected an integer port from 0 through 65535');
const directory = resolve(values.directory),
  built = await buildShell(join(directory, 'shell'));
const host = new ApplicationHost(
  directory,
  new LocalAccounts(values.pds, directory, values['handle-suffix'] ?? '.test'),
);
await host.restore();
const service = await startApplicationService(host, { staticRoot: built.root, port });
console.log(`Atseq host: ${service.url}\nHost token file: ${service.tokenFile}`);
let closing = false;
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.once(signal, () => {
    if (closing) return;
    closing = true;
    void service
      .close()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error.message);
        process.exit(1);
      });
  });
