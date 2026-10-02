import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { spawn, execFileSync } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { join, dirname } from 'node:path';
const [stage, directory, r1] = process.argv.slice(2);
if (!['prepare', 'build', 'probe', 'compare'].includes(stage) || !r1)
  throw Error('Usage: matrix.mjs prepare|build|probe|compare EVIDENCE_DIRECTORY EXACT_R1_ROOT');
const nodes = {
  node22: '/Users/hughpyle/.npm/_npx/992a19d7d9bf36d4/node_modules/node/bin/node',
  node24: '/Users/hughpyle/.npm/_npx/387698761821791d/node_modules/node/bin/node',
  node26: '/opt/homebrew/bin/node',
};
const cells = [100, 1000, 10000].flatMap((n) =>
  ['one', 'sixteen', 'retired', 'one-use'].map((pattern) => ({ n, pattern, name: pattern + '-' + n })),
);
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
await mkdir(join(directory, 'fixtures'), { recursive: true });
await mkdir(join(directory, 'runs'), { recursive: true });
await mkdir(join(directory, 'gates'), { recursive: true });
const records = [];
async function run(name, node, args, output) {
  const began = new Date().toISOString();
  console.log(JSON.stringify({ event: 'begin', name, began }));
  const logfile = join(directory, 'gates', name + '.log');
  const log = createWriteStream(logfile);
  const child = spawn(node, args, {
    env: { ...process.env, PATH: dirname(node) + ':' + process.env.PATH },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.pipe(log, { end: false });
  child.stderr.pipe(log, { end: false });
  const result = await new Promise((resolve) => {
    child.on('error', (error) => resolve({ exit: null, error: String(error) }));
    child.on('close', (exit, signal) => resolve({ exit, signal }));
  });
  await new Promise((resolve) => log.end(resolve));
  const record = {
    name,
    node,
    args,
    head,
    began,
    finished: new Date().toISOString(),
    ...result,
    logfile,
    sha256: createHash('sha256')
      .update(await readFile(logfile))
      .digest('hex'),
    output,
  };
  records.push(record);
  await writeFile(join(directory, stage + '-runs.json'), JSON.stringify(records, null, 2) + '\n');
  console.log(JSON.stringify({ event: 'end', name, ...result }));
  return result.exit === 0;
}
if (stage === 'prepare') {
  for (const cell of cells)
    await run('prepare-' + cell.name, nodes.node26, [
      '--import',
      'tsx',
      '--conditions=atseq-source',
      'experiments/r0-native/prepare.mjs',
      String(cell.n),
      cell.pattern,
      join(directory, 'fixtures'),
    ]);
}
if (stage === 'build') {
  for (const [name, node] of Object.entries(nodes)) {
    await run(name + '-normal-check', node, ['/opt/homebrew/lib/node_modules/npm/bin/npm-cli.js', 'run', 'check']);
    const build = await run(name + '-build', node, ['scripts/build.mjs']);
    if (build) await copyFile('dist/build-provenance.json', join(directory, 'gates', name + '-build-provenance.json'));
  }
  await run('compile-experiment', nodes.node26, ['experiments/r0-native/compile.mjs']);
  await copyFile(
    '.atseq-local/r0-native/compiled/pins.json',
    join(directory, 'gates', 'experiment-compiled-pins.json'),
  );
  await copyFile(join(r1, 'dist/build-provenance.json'), join(directory, 'gates', 'r1-build-provenance.json'));
}
if (stage === 'probe') {
  for (const cell of cells) {
    const fixture = join(directory, 'fixtures', cell.name + '.json.gz');
    for (const [runtime, node] of Object.entries(nodes))
      for (const mode of ['source', 'compiled']) {
        const output = join(directory, 'runs', cell.name + '-' + runtime + '-' + mode);
        const args = [
          ...(mode === 'source' ? ['--import', 'tsx', '--conditions=atseq-source'] : []),
          'experiments/r0-native/node-run.mjs',
          mode,
          fixture,
          output,
          r1,
        ];
        await run(cell.name + '-' + runtime + '-' + mode, node, args, output);
      }
    const output = join(directory, 'runs', cell.name + '-chromium');
    await run(
      cell.name + '-chromium',
      nodes.node26,
      ['experiments/r0-native/browser-run.mjs', fixture, output, r1],
      output,
    );
  }
}
if (stage === 'compare') {
  const comparisons = [];
  for (const cell of cells) {
    let expected = null;
    const captures = [];
    for (const runtime of [
      ...Object.keys(nodes).flatMap((name) => ['source', 'compiled'].map((mode) => name + '-' + mode)),
      'chromium',
    ]) {
      const path = join(directory, 'runs', cell.name + '-' + runtime, 'result.json.gz');
      const bytes = await readFile(path);
      const result = JSON.parse(gunzipSync(bytes));
      const actual = JSON.stringify(result.equality);
      if (expected !== null && expected !== actual)
        throw Error('Cross-runtime equality mismatch: ' + cell.name + ' ' + runtime);
      expected = actual;
      captures.push({
        runtime,
        path,
        sha256: createHash('sha256').update(bytes).digest('hex'),
        fixtureSha256: result.runtime.fixtureSha256,
        sourceHead: result.runtime.sourceHead,
        failures: result.failures,
        storage: result.storage,
      });
    }
    comparisons.push({
      cell: cell.name,
      identicalCanonicalProjections: true,
      equalitySha256: createHash('sha256').update(expected).digest('hex'),
      captures,
    });
  }
  await writeFile(
    join(directory, 'cross-runtime-comparison.json'),
    JSON.stringify(
      {
        head,
        comparisons,
        scope:
          'actual canonical component hashes/counts, proof and receipt statuses, unsupported allocator outcomes; time/heap/backend storage overhead are not required to agree',
      },
      null,
      2,
    ) + '\n',
  );
  console.log(JSON.stringify({ cells: comparisons.length, captures: comparisons.length * 7, equal: true }));
}
