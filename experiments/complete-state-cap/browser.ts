import { characterize } from './kernels.ts';
import { measureFixtures } from './measure.ts';
import type { CapFixture } from './fixtures.ts';

export async function run(fixtures: CapFixture[], measured: boolean) {
  if (measured) return measureFixtures(fixtures);
  const results = [];
  for (const fixture of fixtures) results.push(await characterize(fixture));
  return { results };
}
