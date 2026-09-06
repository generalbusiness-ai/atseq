import { Applications } from '../../src/runtime/apps.ts';
import { SourceBundle } from '../../src/definition/source.ts';

// Generic host runtime starts before any domain definition arrives.
const apps = new Applications();
process.on('message', async (message: any) => {
  try {
    let result: unknown;
    if (message.operation === 'open') {
      const source = await SourceBundle.read(new Uint8Array(message.car));
      result = (await apps.open(message.genesis, message.anchor, source)).snapshot();
    } else if (message.operation === 'catchUp') {
      result = await apps.get(message.app, message.anchor).catchUp(message.head, message.entries);
    } else if (message.operation === 'query') {
      result = await apps.get(message.app, message.anchor).query(message.name, message.params);
    } else throw new Error('Unknown runtime method');
    process.send?.({ id: message.id, result });
  } catch (error) { process.send?.({ id: message.id, error: String(error) }); }
});
process.once('disconnect', () => process.exit(0));
process.send?.({ ready: true, pid: process.pid });
