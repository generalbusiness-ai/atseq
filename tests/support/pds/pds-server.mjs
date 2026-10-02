// Runs the unmodified official PDS in a separate process for crash/restart tests.
import { readFile } from 'node:fs/promises';
import { PDS } from '@atproto/pds';
import { once } from 'node:events';
// The parent holds the listening socket throughout startup. Node's public IPC
// server-handle API lets the real HTTP listener adopt it without a rebind gap.
const [message, socket] = await once(process, 'message');
if (!message.start || !socket) throw Error('Missing reserved PDS listener');
const config = JSON.parse(await readFile(process.argv[2], 'utf8'));
const pds = await PDS.fromEnv(config);
const listen = pds.app.listen.bind(pds.app);
pds.app.listen = () => listen(socket);
await pds.start();
process.send?.({ ready: true });
async function close() {
  await pds.destroy();
  process.exit(0);
}
process.on('SIGTERM', close);
process.on('SIGINT', close);
