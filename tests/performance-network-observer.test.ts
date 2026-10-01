import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { observeHttp } from '../scripts/performance-network-observer.ts';

test('HTTP observer counts actual UTF-8 bodies, omits sensitive URL fields and restores after failure', async () => {
  const server = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    response.end(Buffer.concat(chunks));
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const original = fetch;
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  try {
    const observed = await observeHttp(async () => {
      await assert.rejects(
        observeHttp(async () => 1),
        /isolation/,
      );
      return (
        await fetch(`http://127.0.0.1:${address.port}/echo?secret=not-recorded`, {
          method: 'POST',
          body: 'é',
          headers: { authorization: 'synthetic' },
        })
      ).text();
    });
    assert.equal(observed.result, 'é');
    assert.equal(observed.http.length, 1);
    assert.equal(observed.http[0]!.path, '/echo');
    assert.equal(observed.http[0]!.requestBodyBytes, 2);
    assert.equal(observed.http[0]!.responseBodyBytes, 2);
    assert.equal(observed.http[0]!.status, 200);
    assert.equal(fetch, original);
    await assert.rejects(
      observeHttp(async () => {
        throw new Error('Injected callback failure');
      }),
    );
    assert.equal(fetch, original);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
