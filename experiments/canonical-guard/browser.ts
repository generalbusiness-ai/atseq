import { differential } from './probe.ts';
import { runCorpus } from '../../tests/support/corpus.ts';
import { runRuntimeCorpus } from '../../tests/support/runtime-corpus.ts';
import { supportedProfiles } from '../../src/protocol/identity.ts';
import { wrapperCases } from './schema-probe.ts';

export { differential };
export async function shared() {
  const cases = [...(await runCorpus()), ...(await runRuntimeCorpus())];
  return { profiles: await supportedProfiles(), cases, wrapperOutcomes: wrapperCases() };
}
