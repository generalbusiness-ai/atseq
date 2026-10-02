import { fork } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { once } from 'node:events';
import { mkdir, mkdtemp, readFile, writeFile, rm, realpath } from 'node:fs/promises';
import { createServer } from 'node:net';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Secp256k1Keypair } from '@atproto/crypto';
import plc from '@did-plc/server';
import { fixtureChildEnvironment } from './child-environment.mjs';

const packageDir = dirname(fileURLToPath(import.meta.url));
const repo = resolve(packageDir, '../../..');
const parent = join(repo, '.atseq-local');
const markerName = 'ATSEQ_DISPOSABLE_PDS.json';
async function reservePort(port = 0) {
  const server = createServer();
  server.listen(port, '127.0.0.1');
  await once(server, 'listening');
  return server;
}
export async function assertDisposable(dir) {
  const actual = await realpath(dir),
    expectedParent = await realpath(parent);
  if (dirname(actual) !== expectedParent || !actual.startsWith(join(expectedParent, 'pds-')))
    throw Error('Not an Atseq disposable PDS directory');
  const marker = JSON.parse(await readFile(join(actual, markerName), 'utf8'));
  if (
    marker.kind !== 'atseq-disposable-pds' ||
    marker.version !== 0 ||
    marker.directory !== actual ||
    marker.publicNetwork !== false
  )
    throw Error('Invalid disposable PDS marker');
  return actual;
}
export async function resetDisposable(dir) {
  const actual = await assertDisposable(dir);
  try {
    const pid = Number(await readFile(join(actual, 'pds.pid'), 'utf8'));
    try {
      process.kill(pid, 0);
      throw Error('Refusing to reset a running test PDS');
    } catch (error) {
      if (error.code !== 'ESRCH') throw error;
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await rm(actual, { recursive: true });
}
export async function startEnvironment() {
  await mkdir(parent, { recursive: true });
  const dir = await realpath(await mkdtemp(join(parent, 'pds-')));
  await writeFile(
    join(dir, markerName),
    JSON.stringify({ kind: 'atseq-disposable-pds', version: 0, directory: dir, publicNetwork: false }) + '\n',
  );
  await assertDisposable(dir);
  // Pinned PLC's library entry has no telemetry SDK startup. It shares the runner;
  // externally preloaded runner instrumentation is outside this helper's boundary.
  const plcServer = plc.PlcServer.create({ db: plc.Database.mock(), port: 0 });
  const listen = plcServer.app.listen.bind(plcServer.app);
  plcServer.app.listen = (port) => listen(port, '127.0.0.1');
  await plcServer.start();
  const plcPort = plcServer.server.address().port;
  const rotation = await Secp256k1Keypair.create({ exportable: true });
  const credentials = { adminPassword: randomBytes(32).toString('hex'), jwtSecret: randomBytes(32).toString('hex') };
  const config = {
    ...credentials,
    devMode: true,
    hostname: 'localhost',
    port: 0,
    dataDirectory: join(dir, 'data'),
    blobstoreDiskLocation: join(dir, 'blobs'),
    didPlcUrl: `http://127.0.0.1:${plcPort}`,
    serviceHandleDomains: ['.test'],
    plcRotationKeyK256PrivateKeyHex: Buffer.from(await rotation.export()).toString('hex'),
    inviteRequired: false,
    rateLimitsEnabled: false,
    disableSsrfProtection: true,
    crawlers: [],
    bskyAppViewUrl: 'http://127.0.0.1:1',
    bskyAppViewDid: 'did:web:localhost',
    modServiceUrl: 'http://127.0.0.1:1',
    modServiceDid: 'did:web:localhost',
    serviceName: 'Atseq disposable test PDS',
  };
  await mkdir(config.dataDirectory, { recursive: true });
  await mkdir(config.blobstoreDiskLocation, { recursive: true });
  const configPath = join(dir, 'pds-secrets.json');
  let child, pdsPort;
  const start = async () => {
    if (child && child.exitCode === null && child.signalCode === null) throw Error('PDS is already running');
    // Keep the actual listener open until the child has adopted it. Choosing a
    // free port and closing it first races every other concurrently started PDS.
    const reservation = await reservePort(pdsPort);
    pdsPort = reservation.address().port;
    config.port = pdsPort;
    try {
      await writeFile(configPath, JSON.stringify(config), { mode: 0o600 });
      child = fork(join(packageDir, 'pds-server.mjs'), [configPath], {
        execArgv: [],
        env: fixtureChildEnvironment(),
        stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
      });
      await writeFile(join(dir, 'pds.pid'), String(child.pid), { mode: 0o600 });
      let stderr = '';
      child.stderr.on('data', (data) => {
        stderr = (stderr + data).slice(-4000);
      });
      await new Promise((done, reject) => {
        const timer = setTimeout(() => {
          child.kill('SIGKILL');
          reject(Error('Official PDS startup timed out'));
        }, 30_000);
        child.once('message', (message) => {
          if (message.ready) {
            clearTimeout(timer);
            done();
          }
        });
        child.once('exit', (code) => {
          clearTimeout(timer);
          reject(Error(`Official PDS exited during startup (${code}): ${stderr}`));
        });
        child.once('error', (error) => {
          clearTimeout(timer);
          reject(error);
        });
        child.send({ start: true }, reservation, (error) => {
          if (error) {
            clearTimeout(timer);
            reject(error);
          }
        });
      });
    } catch (error) {
      if (child?.pid && child.exitCode === null && child.signalCode === null) {
        const exited = once(child, 'exit');
        child.kill('SIGKILL');
        await exited;
      }
      throw error;
    } finally {
      await new Promise((done) => reservation.close(done));
    }
  };
  const stop = async (signal = 'SIGTERM') => {
    if (child && child.exitCode === null && child.signalCode === null) {
      const exited = once(child, 'exit');
      child.kill(signal);
      await exited;
      await rm(join(dir, 'pds.pid'), { force: true });
    }
  };
  try {
    await start();
  } catch (error) {
    await plcServer.destroy();
    throw error;
  }
  return {
    dir,
    url: `http://127.0.0.1:${pdsPort}`,
    credentials,
    start,
    stop,
    async close() {
      await stop();
      await plcServer.destroy();
    },
  };
}
