/** Build test-only foreign-fault substitutions; production modules expose no injection callback. */
import assert from 'node:assert/strict';
import { build } from 'vite';
export async function nativeSourceFaultBundles(): Promise<{ name: string; code: string }[]> {
  const cases = [
    {
      name: 'foreign interpreter error with static-looking code',
      path: '/src/runtime/evaluator.ts',
      marker: 'export async function evaluate(source: string, input: unknown): Promise<Evaluation> {',
      expression: `Object.assign(new Error('foreign interpreter'), { code: 'unsupported_function', kind: 'invalid_input' })`,
    },
    {
      name: 'foreign interpreter subclass with static-looking code',
      path: '/src/runtime/evaluator.ts',
      marker: 'export async function evaluate(source: string, input: unknown): Promise<Evaluation> {',
      expression: `new (class ForeignInterpreterError extends InterpretationError {})('unsupported_function', 'foreign interpreter')`,
    },
    {
      name: 'strict parser owner-input fault',
      path: '/src/protocol/strict-json.ts',
      marker: 'export function parseStrictJson(raw: Uint8Array, maximumBytes: number, maximumDepth = 32): unknown {',
      expression: `new StrictJsonError('input', 'owner input fault')`,
    },
  ];
  const results: { name: string; code: string }[] = [];
  for (const fault of cases) {
    let substituted = 0;
    const built = await build({
      configFile: false,
      logLevel: 'error',
      plugins: [
        {
          name: 'native-source-test-only-foreign-fault',
          enforce: 'pre',
          transform(code, id) {
            if (!id.endsWith(fault.path)) return;
            assert.ok(code.includes(fault.marker));
            substituted++;
            return code.replace(
              fault.marker,
              fault.marker +
                `\nconst fault = ${fault.expression};
          (globalThis as any).__nativeSourceTestFault = fault; throw fault;`,
            );
          },
        },
      ],
      build: {
        write: false,
        minify: true,
        lib: { entry: new URL('./native-source-fault-probe.ts', import.meta.url).pathname, formats: ['es'] },
      },
    });
    assert.equal(substituted, 1);
    const chunks = (Array.isArray(built) ? built : [built])
      .flatMap((result) => ('output' in result ? result.output : []))
      .filter((file) => file.type === 'chunk');
    assert.equal(chunks.length, 1);
    assert.ok(!/from\s*['"]node:/.test(chunks[0]!.code));
    results.push({ name: fault.name, code: chunks[0]!.code });
  }
  return results;
}
