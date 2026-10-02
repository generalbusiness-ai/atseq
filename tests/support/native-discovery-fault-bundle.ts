import assert from 'node:assert/strict';
import { build } from 'vite';
/** Test-only barriers/faults at real calls. Never emitted production evidence. */
export async function nativeDiscoveryFaultBundle(): Promise<string> {
  let matches = 0;
  const result = await build({
    configFile: false,
    logLevel: 'error',
    plugins: [
      {
        name: 'native-discovery-test-only-barriers',
        enforce: 'pre',
        transform(code, id) {
          if (!id.endsWith('/src/application/native-authority.ts')) return;
          matches++;
          const replacements = [
            [
              '    const program = nativeSourceActionFold(gate.selected);',
              '    (globalThis as any).__nativeDiscoveryMetadata?.(metadata);\n    const held = (globalThis as any).__nativeDiscoveryFoldBarrier; if (held) { delete (globalThis as any).__nativeDiscoveryFoldBarrier; await held(); }\n    if ((globalThis as any).__nativeDiscoveryFoldFault) throw (globalThis as any).__nativeDiscoveryFoldFault;\n    const program = nativeSourceActionFold(gate.selected);',
            ],
            [
              '      const stateCid = await checkpointPayloadIdentity(state);',
              '      (globalThis as any).__nativeDiscoveryCommitmentCalls?.();\n      const stateCid = await checkpointPayloadIdentity(state);',
            ],
            [
              '      ledger.checkpoint(compact.length);',
              '      (globalThis as any).__nativeDiscoveryBeforeAuthority?.(ledger.ownerChargedBytes);\n      const held = (globalThis as any).__nativeDiscoveryCommitmentBarrier; if (held) { delete (globalThis as any).__nativeDiscoveryCommitmentBarrier; await held(); }\n      ledger.checkpoint(compact.length);',
            ],
            [
              "      ledger.memo = existing.complete ? 'reused' : 'awaited';",
              "      ledger.memo = existing.complete ? 'reused' : 'awaited';\n      (globalThis as any).__nativeDiscoveryMemoWaiter?.(ledger.memo);",
            ],
            [
              '    if (!Number.isSafeInteger(authority.frontier.position + 1))',
              '    if (!Number.isSafeInteger(authority.frontier.position + 1) || (globalThis as any).__nativeDiscoveryOverflowBoundary)',
            ],
          ];
          for (const [marker, replacement] of replacements) {
            assert.ok(code.includes(marker!));
            code = code.replace(marker!, replacement!);
          }
          return code;
        },
      },
    ],
    build: {
      write: false,
      minify: true,
      lib: { entry: new URL('./native-discovery-fault-probe.ts', import.meta.url).pathname, formats: ['es'] },
    },
  });
  assert.equal(matches, 1);
  const chunks = (Array.isArray(result) ? result : [result])
    .flatMap((r) => ('output' in r ? r.output : []))
    .filter((r) => r.type === 'chunk');
  assert.equal(chunks.length, 1);
  assert.ok(!/from\s*['"]node:/.test(chunks[0]!.code));
  return chunks[0]!.code;
}
