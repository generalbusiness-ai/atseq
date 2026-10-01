import test from 'node:test';
import { runEvolutionCorpus } from './support/evolution-corpus.ts';
import { recordFlowEvidence, type MeasuredCase } from './helpers/evidence.ts';

test('compatible activation preserves its exact interpretation boundary', async (t) => {
  const results: MeasuredCase[] = [];
  const check = async (name: string, run: () => Promise<void>) => {
    let fault: unknown;
    await t.test(name, async () => {
      const started = performance.now();
      let passed = false;
      try {
        await run();
        passed = true;
      } catch (error) {
        fault = error;
        throw error;
      } finally {
        results.push({ name, passed, elapsedMs: Math.round(performance.now() - started) });
      }
    });
    if (fault) throw fault;
  };
  try {
    await runEvolutionCorpus(check);
  } finally {
    await recordFlowEvidence('evolution-runtime', results, { expectedCases: 12 });
  }
});
