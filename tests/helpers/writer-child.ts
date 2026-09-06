import { readFile } from 'node:fs/promises';
import { P256PrivateKeyExportable } from '@atcute/crypto';
import { Anchor } from '../../src/protocol/log.ts';
import { PdsClient } from '../../src/host/pds.ts';
import { Sequencer } from '../../src/host/sequencer.ts';
import { startSequencerService } from '../../src/host/service.ts';

try {
  const config = JSON.parse(await readFile(process.argv[2]!, 'utf8'));
  const anchor = await Anchor.from(config.genesis, config.genesisCid);
  const writer = await P256PrivateKeyExportable.importRaw(Buffer.from(config.writerHex, 'hex'));
  const sequencer = new Sequencer(new PdsClient(config.pds, anchor.genesis.app, config.token), anchor, writer, config.leases);
  const service = await startSequencerService(sequencer, anchor);
  process.send?.({ ready: true, url: service.url });
  process.on('SIGTERM', () => { void service.close().then(() => process.exit(0)); });
} catch (error) { process.send?.({ ready: false, error: (error as Error).message }); process.exitCode = 1; }
