import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chartFixture } from '../testdata/apps/fixtures.ts';
import { supportedProfiles } from '../src/protocol/identity.ts';
import { startEnvironment, resetDisposable } from './support/pds/environment.mjs';

const run = promisify(execFile);
// A consumer must use plain Node, without the source-checkout resolution condition.
const nativeEnv = { ...process.env };
delete nativeEnv.NODE_OPTIONS;

test(
  'packed APIs, declarations, JSON CLI and host work in a fresh native Node consumer',
  { timeout: 180000 },
  async () => {
    const directory = await mkdtemp(join(tmpdir(), 'atseq-package-test-'));
    const root = resolve('.');
    let host: ReturnType<typeof spawn> | undefined;
    let environment: Awaited<ReturnType<typeof startEnvironment>> | undefined;
    try {
      await run('npm', ['run', 'build'], { cwd: root, env: nativeEnv });
      const packed = await run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', directory], {
        cwd: root,
        env: nativeEnv,
        maxBuffer: 8 * 1024 * 1024,
      });
      const [metadata] = JSON.parse(packed.stdout);
      await writeFile(join(directory, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
      await run(
        'npm',
        ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', join(directory, metadata.filename)],
        { cwd: directory, env: nativeEnv },
      );
      const fixture = await chartFixture();
      await writeFile(join(directory, 'fixture.car'), await fixture.bundle.write());
      await writeFile(
        join(directory, 'expected.json'),
        JSON.stringify({
          profiles: await supportedProfiles(),
          definition: fixture.bundle.root,
          action: fixture.action,
        }),
      );
      await writeFile(
        join(directory, 'consumer.mjs'),
        `
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { protocol, runtime, application, client, archive } from 'atseq';
import { evaluate } from 'atseq/runtime';
import { Folder } from 'atseq/application';
import { exportArchive } from 'atseq/archive';
import { SnapshotReader } from 'atseq/host';
const expected = JSON.parse(await readFile('expected.json', 'utf8'));
assert.deepEqual(await protocol.supportedProfiles(), expected.profiles);
assert.equal((await evaluate('state.count + 1', { state: { count: 1 } })).value, 2);
assert.equal(evaluate, runtime.evaluate);
assert.equal(Folder, application.Folder);
assert.equal(exportArchive, archive.exportArchive);
assert.equal(typeof SnapshotReader, 'function');
const source = await application.SourceBundle.read(new Uint8Array(await readFile('fixture.car')));
assert.equal(source.root, expected.definition);
const definition = await application.LoadedDefinition.load(source.root, source);
assert.ok(await definition.view('main', { count: 0, total: 0 }));
const api = new client.AtseqClient(process.argv[2], await readFile(process.argv[3], 'utf8').then(x => x.trim()));
assert.deepEqual((await api.call('list')).apps, []);
const identity = await client.createIdentity('Packed consumer');
const created = await api.call('create', { source: protocol.bytes(await source.write()), activationKeys: [identity.publicKey] }, '5c056d95-f0bc-4d77-b323-8c7b634f7288');
const invitation = { app: created.genesis.app, genesis: created.genesisCid.$link };
const intent = await client.prepareIntent(identity, invitation, source.root, expected.action, { day: 'today', millimetres: 1 });
assert.equal((await api.call('submit', { block: protocol.bytes(new Uint8Array(intent.block)) })).receipt.position, 1);
assert.equal((await api.call('receipt', { ...invitation, intent: intent.cid })).receipt.position, 1);
assert.equal((await api.call('query', { ...invitation, name: 'summary', params: '{}' })).result.value.count, 1);
console.log('native consumer passed');
`,
      );
      await writeFile(
        join(directory, 'consumer.ts'),
        `
import { protocol, runtime, application, client, archive } from 'atseq';
import { evaluate, type Evaluation } from 'atseq/runtime';
import { type Head } from 'atseq/protocol';
import { type Projection } from 'atseq/application';
import { type Identity } from 'atseq/client';
import { type RetainedInput } from 'atseq/archive';
import { SnapshotReader } from 'atseq/host';
const result: Promise<Evaluation> = evaluate('1', {});
const apis = [protocol, runtime, application, client, archive, SnapshotReader];
export type ConsumerTypes = [Head, Projection, Identity, RetainedInput];
void result; void apis;
`,
      );
      await run(
        process.execPath,
        [
          join(root, 'node_modules/typescript/bin/tsc'),
          '--noEmit',
          '--module',
          'NodeNext',
          '--moduleResolution',
          'NodeNext',
          '--target',
          'ES2022',
          '--skipLibCheck',
          '--strict',
          'consumer.ts',
        ],
        { cwd: directory, env: nativeEnv },
      );
      const cli = join(directory, 'node_modules/.bin/atseq');
      assert.match((await run(cli, ['--help'], { cwd: directory, env: nativeEnv })).stdout, /identity/);
      const cliChild = spawn(cli, [], { cwd: directory, env: nativeEnv, stdio: ['pipe', 'pipe', 'pipe'] });
      let cliOutput = '';
      cliChild.stdout.on('data', (chunk) => (cliOutput += chunk));
      cliChild.stdin.end(
        JSON.stringify({ operation: 'identity', keyFile: join(directory, 'identity.json'), name: 'Native CLI' }),
      );
      assert.equal(
        await new Promise((resolve, reject) => {
          cliChild.once('error', reject);
          cliChild.once('close', resolve);
        }),
        0,
      );
      assert.equal(JSON.parse(cliOutput).result.name, 'Native CLI');
      environment = await startEnvironment();
      host = spawn(
        join(directory, 'node_modules/.bin/atseq-host'),
        ['--pds', environment.url, '--directory', join(directory, 'private')],
        { cwd: directory, env: nativeEnv, stdio: ['ignore', 'pipe', 'pipe'] },
      );
      let output = '',
        errors = '';
      host.stderr!.on('data', (chunk) => (errors += chunk));
      const ready = new Promise<{ url: string; token: string }>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Packed host did not start: ' + errors)), 30000);
        host!.stdout!.on('data', (chunk) => {
          output += chunk;
          const match = /Atseq host: (\S+)\nHost token file: ([^\n]+)/.exec(output);
          if (match) {
            clearTimeout(timer);
            resolve({ url: match[1]!, token: match[2]! });
          }
        });
        host!.once('error', (error) => {
          clearTimeout(timer);
          reject(error);
        });
        host!.once('exit', (code) => {
          clearTimeout(timer);
          reject(new Error('Packed host exited ' + code + ': ' + errors));
        });
      });
      const { url, token } = await ready;
      assert.equal((await fetch(url)).status, 200);
      assert.match(
        (await run(process.execPath, ['consumer.mjs', url, token], { cwd: directory, env: nativeEnv })).stdout,
        /native consumer passed/,
      );
      const provenance = JSON.parse(
        await readFile(join(directory, 'node_modules/atseq/dist/build-provenance.json'), 'utf8'),
      );
      assert.ok(provenance.outputHashes['dist/vendor/inlay.js']);
    } finally {
      if (host && host.exitCode === null) {
        const stopped = new Promise((resolve) => host!.once('close', resolve));
        host.kill('SIGTERM');
        await stopped;
      }
      await environment?.close();
      if (environment) await resetDisposable(environment.dir);
      await rm(directory, { recursive: true, force: true });
    }
  },
);
