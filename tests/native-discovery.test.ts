import test from 'node:test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { nativeDiscoveryCorpus } from './support/native-discovery-corpus.ts';
import { nativeDiscoveryFaultBundle } from './support/native-discovery-fault-bundle.ts';
test('private native discovery uses genuine subjects and retained generations', async () => {
  const directory = process.env.ATSEQ_NATIVE_DISCOVERY_CAPTURE_DIR ?? '.atseq-local/c1-kernel/discovery';
  const fixturePath =
    process.env.ATSEQ_NATIVE_DISCOVERY_FIXTURE_PATH ?? '.atseq-local/c1-kernel/native-discovery-fixture-final2.json';
  const raw = await readFile(fixturePath);
  const originalPath =
    process.env.ATSEQ_NATIVE_APPLICATION_FIXTURE_PATH ?? '/private/tmp/atseq-c1-f1-oracle-20261002.json';
  const originalRaw = await readFile(originalPath);
  const cases = await nativeDiscoveryCorpus(JSON.parse(raw.toString()), JSON.parse(originalRaw.toString()));
  const code = await nativeDiscoveryFaultBundle();
  const probe = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
  const faults = await probe.nativeDiscoveryFaultProbe(JSON.parse(originalRaw.toString()));
  await mkdir(directory, { recursive: true });
  await writeFile(directory + '/fault-bundle.mjs', code);
  const evidence = {
    node: process.version,
    fixturePath,
    fixtureBytes: raw.length,
    fixtureSha256: createHash('sha256').update(raw).digest('hex'),
    originalFixtureSha256: createHash('sha256').update(originalRaw).digest('hex'),
    cases,
    faults,
    faultBundleSha256: createHash('sha256').update(code).digest('hex'),
  };
  await writeFile(directory + '/result.json', JSON.stringify(evidence, null, 2) + '\n');
  console.log(
    JSON.stringify({ node: process.version, cases: cases.map((c) => c.id), fixtureSha256: evidence.fixtureSha256 }),
  );
});
