import { readFile } from 'node:fs/promises';
import { P256PrivateKeyExportable } from '@atcute/crypto';
import { Anchor } from "../../../packed-writer-final-16f-node22-published-inputs/node_modules/atseq/dist/src/protocol/log.js";
import { PdsClient } from "../../../packed-writer-final-16f-node22-published-inputs/node_modules/atseq/dist/src/host/pds.js";
import { Sequencer } from "../../../packed-writer-final-16f-node22-published-inputs/node_modules/atseq/dist/src/host/sequencer.js";
import { startSequencerService } from "../support/sequencer-service.js";
try {
    const config = JSON.parse(await readFile(process.argv[2], 'utf8'));
    const anchor = await Anchor.from(config.genesis, { app: config.genesis.app, genesis: config.genesisCid });
    const writer = await P256PrivateKeyExportable.importRaw(Buffer.from(config.writerHex, 'hex'));
    const sequencer = new Sequencer(new PdsClient(config.pds, anchor.genesis.app, config.token), anchor, writer, config.leases);
    const service = await startSequencerService(sequencer, anchor);
    process.send?.({ ready: true, url: service.url });
    process.on('SIGTERM', () => {
        void service.close().then(() => process.exit(0));
    });
}
catch (error) {
    process.send?.({ ready: false, error: error.message });
    process.exitCode = 1;
}
