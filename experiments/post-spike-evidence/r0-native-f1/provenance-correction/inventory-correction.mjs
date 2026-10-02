import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const directory = 'experiments/post-spike-evidence/r0-native-f1/provenance-correction';
const path = 'testdata/native-source/source-identity-vectors.json';
const producerHeads = ['e4f00b351651ef40b0da2937c545a16348e328e1', '812f6e3453e872be22759890c78928d7e7f185d2'];
const copied = await readFile(directory + '/source-identity-vectors.producer.json');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const snapshots = producerHeads.map((head) => {
  const bytes = execFileSync('git', ['show', head + ':' + path]);
  if (!bytes.equals(copied)) throw Error('Producer input differs');
  return {
    head,
    path,
    gitBlob: execFileSync('git', ['rev-parse', head + ':' + path], { encoding: 'utf8' }).trim(),
    bytes: bytes.length,
    sha256: sha256(bytes),
  };
});
const current = await readFile(path);
if (!current.equals(copied)) throw Error('Current source differs from producer bytes');
const manifest = JSON.parse(await readFile('experiments/post-spike-evidence/r0-native-f1/manifest.json'));
const json = snapshots[0];
if (json.bytes !== 38747 || json.sha256 !== '1dc718d65cf44e80bb6df32ec8b2fc0c79adf0f105638ec59adfbd3fa67f5135')
  throw Error('Unexpected immutable vector bytes');
const buildDirectory = 'experiments/post-spike-evidence/r0-native-f1/gates/';
const builds = await Promise.all(
  ['node22', 'node24', 'node26'].map(async (name) => ({
    name,
    record: JSON.parse(await readFile(buildDirectory + name + '-build-provenance.json')),
  })),
);
const node26 = builds[2].record;
const metadata = ['dist/shell/build-provenance.json', 'dist/shell/shell-manifest.json'];
for (const { record } of builds) {
  if (
    JSON.stringify(record.sourceHashes) !== JSON.stringify(node26.sourceHashes) ||
    JSON.stringify(record.semanticContracts) !== JSON.stringify(node26.semanticContracts)
  )
    throw Error('Source/contracts drift');
  for (const [key, hash] of Object.entries(record.outputHashes))
    if (!metadata.includes(key) && node26.outputHashes[key] !== hash) throw Error('Executable outputs drift');
}
const r1 = JSON.parse(await readFile(buildDirectory + 'r1-build-provenance.json'));
const inputRecord = {
  scope:
    'Additive correction to the original generator inventory; all original fixture/capture/producer files remain unchanged.',
  activelyUsedInput: {
    path,
    consumer: 'tests/support/native-application-fixture.ts:2 and applicationSource():51',
    r0Entry: 'experiments/r0-native/fixture.ts imports/calls applicationSource',
    snapshots,
    retainedExactProducerBytes: directory + '/source-identity-vectors.producer.json',
    currentBytesEqualProducer: true,
  },
  originalInventoryOmission:
    'prepare.mjs captured generator/helper/package hashes but omitted this actively imported JSON input. Immutable producer Git bytes are now inventoried; no contemporaneous inventory entry is fabricated.',
  compiledProbeBuildUse: {
    nodeCompiledProbeCount: 36,
    runtimeVersions: ['v22.19.0', 'v24.21.0', 'v26.10.0'],
    actualCommonProductionBuild:
      'Final Node26-built dist outputs used by all36Node compiled probes; builds22/24/26 were completed before probing, in that order. They are build-conformance checks, not per-runtime executable selection.',
    buildDriverSource: 'experiments/r0-native/matrix.mjs:70-91',
    compiledLoaderSource: 'experiments/r0-native/node-run.mjs:19-39',
    commonMainBuild: {
      record: buildDirectory + 'node26-build-provenance.json',
      node: node26.node,
      compiler: node26.compiler,
      outputHashes: node26.outputHashes,
    },
    commonR1Build: {
      record: buildDirectory + 'r1-build-provenance.json',
      node: r1.node,
      compiler: r1.compiler,
      outputHashes: r1.outputHashes,
    },
    allThreeMainBuildExecutableHashesEqual: true,
    metadataExceptions: metadata,
    metadataExceptionReason:
      'Shell provenance records each builder Node version; shell manifest includes that provenance.',
    sourceProbes:
      'The36Node source probes used their selected runtime with maintained source imports, not the compiled artifact.',
    browserProbes:
      'The12Chromium probes used separately retained Vite-compiled browser bundles, not the common Node executable tree.',
  },
  originalManifest: {
    path: 'experiments/post-spike-evidence/r0-native-f1/manifest.json',
    sha256: sha256(await readFile('experiments/post-spike-evidence/r0-native-f1/manifest.json')),
    deliveryHashes: manifest.files.length,
    sourceHashes: Object.keys(manifest.sourceHashes).length,
  },
  matrixRerun: false,
  wrapperHistoricalExecutionHashCapture:
    'UNRECORDED; separate post-freeze deterministic recompilation must not be treated as an execution-time hash.',
};
await writeFile(directory + '/inventory-correction.json', JSON.stringify(inputRecord, null, 2) + '\n');
console.log(
  JSON.stringify({
    input: path,
    bytes: json.bytes,
    sha256: json.sha256,
    gitBlob: json.gitBlob,
    nodeCompiledProbes: 36,
    commonBuild: node26.node,
    matrixRerun: false,
  }),
);
