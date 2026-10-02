// Actual official-PDS control: steal the old selected port at the exact release gap.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, symlink, writeFile } from 'node:fs/promises';
import { Server, createServer } from 'node:net';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const base = '098d3dffb04998d43eb51bb3ab6b9f38cce03b20';
await mkdir('.atseq-local', { recursive: true });
const root = await mkdtemp(resolve('.atseq-local/pds-port-control-'));
const pds = join(root, 'tests/support/pds');
await mkdir(pds, { recursive: true });
await writeFile(join(root, 'package.json'), '{"type":"module"}\n');
for (const file of ['environment.mjs', 'pds-server.mjs', 'child-environment.mjs']) {
  await writeFile(join(pds, file), execFileSync('git', ['show', `${base}:tests/support/pds/${file}`]));
}
await symlink(resolve('tests/support/pds/node_modules'), join(pds, 'node_modules'));

async function probe(path, expectRace) {
  const fixture = await import(pathToFileURL(path).href);
  const original = Server.prototype.listen;
  const contender = createServer();
  let count = 0;
  let observation;
  const observed = new Promise((done) => {
    contender.once('listening', () => {
      observation = 'competitor acquired released port';
      done();
    });
    contender.once('error', (error) => {
      assert.equal(error.code, 'EADDRINUSE');
      observation = 'competitor refused: EADDRINUSE';
      done();
    });
  });
  Server.prototype.listen = function (...args) {
    const result = original.apply(this, args);
    if (++count === 2) {
      this.once('listening', () => {
        const port = this.address().port;
        this.once('close', () => original.call(contender, port, '127.0.0.1'));
      });
    }
    return result;
  };
  let env, failure;
  try {
    try {
      env = await fixture.startEnvironment();
    } catch (error) {
      failure = error;
    }
    await observed;
    if (expectRace) {
      assert.equal(observation, 'competitor acquired released port');
      assert.match(failure?.message ?? '', /Official PDS exited during startup.*EADDRINUSE/s);
      console.log(failure.message);
      console.log('Baseline: actual competitor took the released port; official PDS startup failed with EADDRINUSE.');
    } else {
      assert.equal(failure, undefined);
      assert.equal(observation, 'competitor refused: EADDRINUSE');
      assert.equal((await fetch(`${env.url}/xrpc/com.atproto.server.describeServer`)).status, 200);
      console.log('Fixed source: actual competitor refused after parent release; official PDS served HTTP 200.');
    }
  } finally {
    Server.prototype.listen = original;
    if (contender.listening) await new Promise((done) => contender.close(done));
    if (env) {
      await env.close();
      await fixture.resetDisposable(env.dir);
    }
  }
}
await probe(join(pds, 'environment.mjs'), true);
const failedDirectories = await readdir(join(root, '.atseq-local'));
const oldFixture = await import(pathToFileURL(join(pds, 'environment.mjs')).href);
for (const directory of failedDirectories) {
  if (directory.startsWith('pds-')) await oldFixture.resetDisposable(join(root, '.atseq-local', directory));
}
await probe(resolve('tests/support/pds/environment.mjs'), false);
console.log(`Node ${process.version}; official PDS 0.5.31; PLC 0.0.1; exact baseline ${base}.`);
