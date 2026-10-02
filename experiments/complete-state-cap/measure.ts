import { admitFixture, characterize } from './kernels.ts';
import type { CapFixture } from './fixtures.ts';

/** Called only by the explicit --measure runner in a coordinated quiet window. */
export async function measureFixtures(fixtures: CapFixture[], samples = 7, warmups = 2) {
  const captures = [];
  for (const fixture of fixtures) {
    // Admission, references, source reconstruction and instrumented correctness
    // are preparation. No hooks or output validation run inside a timed span.
    const reference = await characterize(fixture);
    const { operations } = await admitFixture(fixture);
    for (let warmup = 0; warmup < warmups; warmup++) for (const operation of operations) await operation.run();
    const rows = [];
    for (let sample = 0; sample < samples; sample++) {
      // Rotate method order to avoid always measuring one operation first.
      for (let step = 0; step < operations.length; step++) {
        const operation = operations[(step + sample) % operations.length]!;
        const before = performance.now();
        await operation.run();
        rows.push({ operation: operation.name, sample, repetitions: 1, elapsedMs: performance.now() - before });
      }
    }
    // Fail the capture if source/state/output equivalence changes afterward.
    const after = await characterize(fixture);
    if (JSON.stringify(reference) !== JSON.stringify(after)) throw new Error('Unstable fixture result');
    captures.push({ name: fixture.name, reference, rows });
  }
  return { samples, warmups, repetitions: 1, captures };
}
