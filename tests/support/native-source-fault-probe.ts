/** Test-bundle-only probe. The transform records the exact foreign exception it throws. */
import vector from '../../testdata/native-source/source-identity-vectors.json' with { type: 'json' };
import { assessNativeSource } from '../../src/definition/native-source.ts';
import { NATIVE_SOURCE_CONTRACT } from '../../src/definition/native-source-contract.ts';
import { encodeBlock } from '../../src/protocol/wire.ts';

export async function foreignSourceFaultProbe(): Promise<boolean> {
  const source = vector[0]!;
  const blocks = new Map([[source.definitionCid, encodeBlock(source.manifest)]]);
  for (const file of source.files)
    blocks.set(
      file.rawCid,
      Uint8Array.from(atob(file.base64), (char) => char.charCodeAt(0)),
    );
  const state = globalThis as unknown as { __nativeSourceTestFault?: unknown };
  delete state.__nativeSourceTestFault;
  let caught: unknown;
  try {
    await assessNativeSource(
      {
        root: source.definitionCid,
        expectedSemantics: NATIVE_SOURCE_CONTRACT.application,
        closure: [...blocks.keys()],
      },
      {
        async get(cid) {
          return new Uint8Array(blocks.get(cid)!);
        },
      },
    );
  } catch (error) {
    caught = error;
  }
  if (!state.__nativeSourceTestFault || caught !== state.__nativeSourceTestFault)
    throw new Error('Foreign pure-call exception was swallowed or became source facts');
  delete state.__nativeSourceTestFault;
  return true;
}
