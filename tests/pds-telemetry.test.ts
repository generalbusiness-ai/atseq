import test from 'node:test';
import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { createServer } from 'node:http';
import { createSocket } from 'node:dgram';
import { once } from 'node:events';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { fixtureChildEnvironment } from './support/pds/child-environment.mjs';

test('PDS child keeps only OS paths and forced telemetry disable without mutating input', () => {
  const inherited = {
    PATH: '/synthetic/bin',
    TMPDIR: '/synthetic/tmp',
    OTEL_SDK_DISABLED: 'false',
    OTEL_EXPORTER_OTLP_ENDPOINT: 'http://127.0.0.1:1',
    JAEGER_ENDPOINT: 'http://127.0.0.1:2',
    NODE_OPTIONS: '--no-warnings',
    PDS_PORT: '9999',
    AWS_SECRET_ACCESS_KEY: 'synthetic',
  };
  const before = { ...inherited };
  assert.deepEqual(fixtureChildEnvironment(inherited), {
    PATH: inherited.PATH,
    TMPDIR: inherited.TMPDIR,
    TZ: 'UTC',
    LOG_ENABLED: 'false',
    OTEL_SDK_DISABLED: 'true',
  });
  assert.deepEqual(inherited, before);
});

test(
  'inherited telemetry preload exports with legacy spread and is blocked by the fixture allowlist',
  { timeout: 90_000 },
  async () => {
    let httpTelemetry = 0,
      udpTelemetry = 0;
    const collector = createServer((request, response) => {
      httpTelemetry++;
      request.resume();
      response.writeHead(200, { 'content-type': 'application/json' }).end('{}');
    });
    const udp = createSocket('udp4');
    udp.on('message', () => udpTelemetry++);
    collector.listen(0, '127.0.0.1');
    udp.bind(0, '127.0.0.1');
    await Promise.all([once(collector, 'listening'), once(udp, 'listening')]);
    const address = collector.address();
    assert.ok(address && typeof address === 'object');
    const endpoint = `http://127.0.0.1:${address.port}`;
    let child: ReturnType<typeof fork> | undefined;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    try {
      assert.equal((await fetch(`${endpoint}/collector-control`, { method: 'POST', body: '{}' })).status, 200);
      const delivered = once(udp, 'message');
      udp.send(Buffer.from('collector-control'), udp.address().port, '127.0.0.1');
      await delivered;
      assert.equal(httpTelemetry, 1);
      assert.equal(udpTelemetry, 1);
      httpTelemetry = udpTelemetry = 0;
      const paths: unknown[] = [];
      for (const mode of ['allowlist', 'legacy']) {
        httpTelemetry = udpTelemetry = 0;
        child = fork(fileURLToPath(new URL('./support/pds/telemetry-probe.mjs', import.meta.url)), [mode], {
          execArgv: [],
          env: {
            ...fixtureChildEnvironment(),
            OTEL_SDK_DISABLED: 'false',
            OTEL_PROPAGATORS: 'jaeger',
            OTEL_EXPORTER_OTLP_ENDPOINT: endpoint,
            OTEL_EXPORTER_OTLP_PROTOCOL: 'http/json',
            OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: `${endpoint}/v1/traces`,
            OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: `${endpoint}/v1/metrics`,
            OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: `${endpoint}/v1/logs`,
            OTEL_TRACES_EXPORTER: 'otlp',
            OTEL_METRICS_EXPORTER: 'otlp',
            OTEL_LOGS_EXPORTER: 'otlp',
            OTEL_BSP_SCHEDULE_DELAY: '1',
            OTEL_BLRP_SCHEDULE_DELAY: '1',
            OTEL_METRIC_EXPORT_INTERVAL: '10',
            OTEL_SERVICE_NAME: 'atseq-synthetic-telemetry-test',
            OTEL_NODE_RESOURCE_DETECTORS: 'env',
            JAEGER_ENDPOINT: `${endpoint}/api/traces`,
            JAEGER_AGENT_HOST: '127.0.0.1',
            JAEGER_AGENT_PORT: String(udp.address().port),
            NODE_OPTIONS: '--no-warnings',
          },
          stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
        });
        let stderr = '',
          result: any;
        deadline = setTimeout(() => child?.kill('SIGKILL'), 45_000);
        child.stderr!.on('data', (data: Buffer) => (stderr = (stderr + data).slice(-4000)));
        child.on('message', (message) => (result = message));
        const [code] = await once(child, 'exit');
        assert.equal(code, 0, stderr);
        if (mode === 'legacy')
          assert.ok(httpTelemetry > 0, 'Legacy inherited preload must actually export HTTP telemetry');
        else {
          assert.equal(httpTelemetry, 0, 'Allowlist must block HTTP exports');
          assert.equal(udpTelemetry, 0, 'Allowlist must block UDP exports');
        }
        assert.deepEqual(result, {
          mode,
          passed: true,
          operations: 29,
          records: 12,
          restartVerified: true,
          runnerEnvironmentUnchanged: true,
          preloadedPdsChildren: mode === 'legacy' ? 2 : 0,
        });
        paths.push({ ...result, httpTelemetry, udpTelemetry });
        clearTimeout(deadline);
      }
      const sourcePaths = [
        'tests/support/pds/package-lock.json',
        'tests/support/pds/environment.mjs',
        'tests/support/pds/child-environment.mjs',
        'tests/support/pds/telemetry-probe.mjs',
        'tests/pds-telemetry.test.ts',
      ];
      const sourceHashes = Object.fromEntries(
        await Promise.all(
          sourcePaths.map(async (path) => [
            path,
            createHash('sha256')
              .update(await readFile(new URL(`../${path}`, import.meta.url)))
              .digest('hex'),
          ]),
        ),
      );
      await mkdir(new URL('../experiments/generated/', import.meta.url), { recursive: true });
      await writeFile(
        new URL('../experiments/generated/pds-telemetry-results.json', import.meta.url),
        JSON.stringify(
          {
            measuredAt: new Date().toISOString(),
            nodeVersion: process.version,
            paths,
            vector: 'Inherited NODE_OPTIONS telemetry preload in PDS child only; runner receives harmless sentinel',
            collectorPositiveControls: { http: 1, udp: 1 },
            sourceHashes,
          },
          null,
          2,
        ) + '\n',
      );
    } finally {
      clearTimeout(deadline);
      if (child && child.exitCode === null && child.signalCode === null) {
        child.kill('SIGKILL');
        await once(child, 'exit');
      }
      await Promise.all([
        new Promise<void>((done) => collector.close(() => done())),
        new Promise<void>((done) => udp.close(() => done())),
      ]);
    }
  },
);
