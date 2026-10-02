/** Generate and verify public fixtures. No reader performance measurements. */
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { platform, arch, cpus, totalmem } from 'node:os';
import { prepareFixture } from './fixtures.ts';
import { verifyFixture } from './validate.ts';
import { matrix, sizes } from './workload.ts';
const directory = process.argv[2] ?? '.atseq-local/e1-preparation/current';
await mkdir(directory, { recursive: true });
const producerHead = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const started = new Date().toISOString();
const captures = [],
  failures = [];
for (const n of sizes)
  for (const scenario of [
    { name: 'bounded-one-actor', actors: 1 as const, growing: false, activation: false, invalidAction: false },
    {
      name: 'growing-many-actors-activation-invalid-action',
      actors: 16 as const,
      growing: true,
      activation: true,
      invalidAction: true,
    },
  ]) {
    const name = `${scenario.name}-${n}`;
    try {
      const fixture = await prepareFixture({
        n,
        actors: scenario.actors,
        growing: scenario.growing,
        activation: scenario.activation,
        invalidAction: scenario.invalidAction,
      });
      // Freeze the generated evidence before validation, including a refusal or failed check.
      const raw = Buffer.from(JSON.stringify(fixture) + '\n'),
        compressed = gzipSync(raw);
      await writeFile(`${directory}/${name}.json.gz`, compressed);
      const validationStarted = performance.now();
      const validation = await verifyFixture(fixture);
      captures.push({
        name,
        workload: fixture.workload,
        preparation: fixture.preparation,
        validation,
        validationElapsedMs: performance.now() - validationStarted,
        fixtureBytes: raw.length,
        gzipBytes: compressed.length,
        fixtureSha256: createHash('sha256').update(raw).digest('hex'),
        gzipSha256: createHash('sha256').update(compressed).digest('hex'),
      });
    } catch (error) {
      failures.push({
        name,
        code: (error as { code?: string }).code ?? null,
        message: String(error),
        stack: error instanceof Error ? error.stack : null,
      });
    }
  }
const result = {
  format: 'atseq-e1-fixture-preparation',
  version: 1,
  request: '443018dc14130da954873a507b7a0ba503706379',
  promise: 'a5380c898ad8a6e425e74c27a3aafdf1baadaee3',
  parentRequest: '8eec1d657cdffa2edaeafb28294797c56e605dfc',
  parentPromise: '621d4cea355cd3249d39b9184b981af61ae70f83',
  producerHead,
  workingTreeDirty:
    execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], { encoding: 'utf8' }).trim().length > 0,
  preparationClock:
    'Includes key/signature/source/oracle preparation and public fixture array construction; excludes outer JSON/gzip serialization and independent validation; not controlled reader timing',
  started,
  finished: new Date().toISOString(),
  runtime: process.version,
  host: { platform: platform(), arch: arch(), cpus: cpus().length, model: cpus()[0]?.model, memoryBytes: totalmem() },
  convention:
    'N=final ordered entries; base=N-delta; valid delta<=N; admissions/activation included; actions separately reported',
  scope:
    'generation and correctness only; all preparation/validation outside reader timing; joined E1 measurements unrun',
  matrix: matrix(),
  captures,
  failures,
};
await writeFile(`${directory}/results.json`, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result));
if (failures.length) process.exitCode = 1;
