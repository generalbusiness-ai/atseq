import assert from 'node:assert/strict';
import { build } from 'vite';
/** Transforms exist only in this test bundle; never in production modules or compiled output. */
export async function nativeApplicationFaultBundle(): Promise<string> {
  let folded = 0,
    owned = 0;
  const result = await build({
    configFile: false,
    logLevel: 'error',
    plugins: [
      {
        name: 'native-application-test-only-fault',
        enforce: 'pre',
        transform(code, id) {
          if (id.endsWith('/src/runtime/evaluator.ts')) {
            const marker = '  canonicalJson(input.act, PROFILE.actionBytes);';
            assert.ok(code.includes(marker));
            folded++;
            return code.replace(
              marker,
              '  if ((globalThis as any).__nativeApplicationFoldFault) throw (globalThis as any).__nativeApplicationFoldFault;\n' +
                marker,
            );
          }
          if (id.endsWith('/src/application/native-authority.ts')) {
            const marker = '      const domain = jsonCopy(base.domain, PROFILE.stateBytes);';
            assert.ok(code.includes(marker));
            owned++;
            code = code.replace(
              marker,
              '      if ((globalThis as any).__nativeApplicationStoredFault) throw (globalThis as any).__nativeApplicationStoredFault;\n' +
                marker,
            );
            const first = '      const data = authenticatedAuthorityEntry(authenticated, base.authority);';
            assert.ok(code.includes(first));
            code = code.replace(
              first,
              '      if ((globalThis as any).__nativeApplicationStaleBeforeCommit) { this.#current = Object.freeze({ ...base }); this.#same(base); }\n' +
                first,
            );
            const persisted = '        await this.#persist(this.#projection(next, row));';
            assert.ok(code.includes(persisted));
            return code.replace(
              persisted,
              persisted +
                '\n        if ((globalThis as any).__nativeApplicationPostPersistStale) this.#current = Object.freeze({ ...base });',
            );
          }
        },
      },
    ],
    build: {
      write: false,
      minify: true,
      lib: { entry: new URL('./native-application-fault-probe.ts', import.meta.url).pathname, formats: ['es'] },
    },
  });
  assert.equal(folded, 1);
  assert.equal(owned, 1);
  const chunks = (Array.isArray(result) ? result : [result])
    .flatMap((item) => ('output' in item ? item.output : []))
    .filter((item) => item.type === 'chunk');
  assert.equal(chunks.length, 1);
  assert.ok(!/from\s*['"]node:/.test(chunks[0]!.code));
  return chunks[0]!.code;
}
