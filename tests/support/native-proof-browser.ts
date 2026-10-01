export { nativeProofCorpus } from './native-proof-corpus.ts';
import { authenticateRepo, normalizeRepoSigningKey } from '../../src/protocol/native-proof.ts';
export async function sharedNativeFixtures(
  fixtures: {
    type: 'p256' | 'secp256k1';
    legacy: number[];
    options: { carBytes: number[]; expectedDid: string; trustedSigningKeyDid: string; expectedRoot?: string };
  }[],
) {
  const passed: string[] = [];
  for (const fixture of fixtures) {
    const normalized = await normalizeRepoSigningKey({
      type: fixture.type,
      publicKeyBytes: new Uint8Array(fixture.legacy),
    });
    if (normalized !== fixture.options.trustedSigningKeyDid)
      throw Error('Node/browser legacy key normalization differs');
    const verified = await authenticateRepo({ ...fixture.options, carBytes: new Uint8Array(fixture.options.carBytes) });
    if ((await verified.lookup('ai.generalbusiness.atseq.probe/00000001')).kind !== 'found')
      throw Error('Shared Node commit rejected');
    passed.push(fixture.type);
  }
  return passed;
}
