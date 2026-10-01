/** Benchmark-only observation of consumed, decoded HTTP bodies, not wire framing. */
export interface HttpObservation {
  method: string;
  path: string;
  requestBodyBytes: number;
  responseBodyBytes: number;
  headersMs: number;
  status?: number;
  failed?: boolean;
}
let observing = false;
export async function observeHttp<T>(run: () => Promise<T>): Promise<{ result: T; http: HttpObservation[] }> {
  if (observing) throw new Error('HTTP measurements must run in isolation');
  observing = true;
  const original = globalThis.fetch;
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'fetch');
  const http: HttpObservation[] = [];
  try {
    globalThis.fetch = async (input, init) => {
      // The PDS benchmark passes URL/string inputs and string/byte request bodies.
      // Reject other forms rather than silently undercounting a streamed upload.
      if (input instanceof Request) throw new Error('Request objects are outside this benchmark observer');
      const body = init?.body;
      if (body != null && typeof body !== 'string' && !(body instanceof Uint8Array))
        throw new Error('Unsupported benchmark request body');
      const observation: HttpObservation = {
        method: init?.method ?? 'GET',
        path: new URL(String(input)).pathname,
        requestBodyBytes: typeof body === 'string' ? new TextEncoder().encode(body).length : (body?.byteLength ?? 0),
        responseBodyBytes: 0,
        headersMs: 0,
      };
      http.push(observation);
      const start = performance.now();
      try {
        const response = await original(input, init);
        observation.headersMs = performance.now() - start;
        observation.status = response.status;
        const body = response.body?.pipeThrough(
          new TransformStream<Uint8Array, Uint8Array>({
            transform(chunk, controller) {
              observation.responseBodyBytes += chunk.byteLength;
              controller.enqueue(chunk);
            },
          }),
        );
        return new Response(body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      } catch (error) {
        observation.headersMs = performance.now() - start;
        observation.failed = true;
        throw error;
      }
    };
    return { result: await run(), http };
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'fetch', descriptor);
    else Reflect.deleteProperty(globalThis, 'fetch');
    observing = false;
  }
}
