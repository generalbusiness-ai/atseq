import test from 'node:test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { nativeCheckpointProducerOwnedInputCorpus } from './support/native-checkpoint-producer-owned-input-corpus.ts';
test('checkpoint producer captures intrinsic owned bytes and safe row counts', async () => {
  const fixture = JSON.parse(
    gunzipSync(await readFile(new URL('./vectors/checkpoint-data.json.gz', import.meta.url))).toString(),
  );
  const literal = JSON.parse(
    await readFile(new URL('./vectors/native-checkpoint-producer.json', import.meta.url), 'utf8'),
  );
  const capture = await nativeCheckpointProducerOwnedInputCorpus(fixture, literal);
  await mkdir('.atseq-local/native-checkpoint-producer-owned-input', { recursive: true });
  await writeFile(
    process.env.ATSEQ_P4F1_OWNED_CAPTURE_PATH ?? '.atseq-local/native-checkpoint-producer-owned-input/node.json',
    JSON.stringify({ node: process.version, ...capture }, null, 2) + '\n',
  );
  console.log(JSON.stringify({ node: process.version, ...capture }));
});
