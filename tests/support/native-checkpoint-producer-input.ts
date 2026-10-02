import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { nativeCheckpointProducerFixture } from './native-checkpoint-producer-corpus.ts';
const fixture = JSON.parse(
  gunzipSync(await readFile(new URL('../vectors/checkpoint-data.json.gz', import.meta.url))).toString(),
);
const input = await nativeCheckpointProducerFixture(fixture);
const serialized = {
  ...input,
  state: Buffer.from(input.state).toString('base64'),
  authority: Buffer.from(input.authority).toString('base64'),
  producer: Buffer.from(input.producer).toString('base64'),
  ...Object.fromEntries(
    ['history', 'sources', 'evidence', 'outcomes', 'payloads'].map((key) => [
      key,
      (input as any)[key].map((raw: Uint8Array) => Buffer.from(raw).toString('base64')),
    ]),
  ),
};
await mkdir('.atseq-local/native-checkpoint-producer', { recursive: true });
await writeFile('.atseq-local/native-checkpoint-producer/independent-input.json', JSON.stringify(serialized) + '\n');
