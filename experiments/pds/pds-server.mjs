// Runs the unmodified official PDS in a separate process for crash/restart tests.
import { readFile } from 'node:fs/promises';
import { PDS } from '@atproto/pds';
const config = JSON.parse(await readFile(process.argv[2], 'utf8'));
const pds = await PDS.fromEnv(config);
const listen = pds.app.listen.bind(pds.app);
pds.app.listen = port => listen(port, '127.0.0.1');
await pds.start();
process.send?.({ ready: true });
async function close() { await pds.destroy(); process.exit(0); }
process.on('SIGTERM', close);
process.on('SIGINT', close);
