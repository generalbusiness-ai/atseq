import { createServer } from 'node:http';

/** Faults affect HTTP delivery only; every write still goes to the real PDS. */
export async function startFaultProxy(upstream: string) {
  let next: { before?: () => Promise<void>; after?: () => Promise<void>; drop?: boolean } | undefined;
  const observations: number[] = [];
  const server = createServer(async (req, res) => {
    try {
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      const body = Buffer.concat(chunks);
      const isEntryWrite = req.url?.endsWith('/com.atproto.repo.applyWrites') && JSON.parse(body.toString()).writes.some((w: any) => w.collection === 'test.atseq.entry');
      const fault = isEntryWrite ? next : undefined;
      if (isEntryWrite) next = undefined;
      await fault?.before?.();
      const result = await fetch(new URL(req.url!, upstream), {
        method: req.method, headers: { authorization: req.headers.authorization ?? '', 'content-type': req.headers['content-type'] ?? 'application/json' },
        ...(req.method === 'POST' ? { body } : {}), signal: AbortSignal.timeout(15_000),
      });
      const response = Buffer.from(await result.arrayBuffer());
      if (isEntryWrite) observations.push(result.status);
      await fault?.after?.();
      if (fault?.drop) { res.destroy(); return; }
      res.writeHead(result.status, { 'content-type': result.headers.get('content-type') ?? 'application/octet-stream' }); res.end(response);
    } catch { if (!res.destroyed) { res.writeHead(502); res.end(); } }
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address(); if (!address || typeof address === 'string') throw new Error('TCP required');
  return {
    url: `http://127.0.0.1:${address.port}`, observations,
    fault(value: NonNullable<typeof next>) { next = value; },
    async close() { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); },
  };
}
