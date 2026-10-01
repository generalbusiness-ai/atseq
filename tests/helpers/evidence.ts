import { createHash } from 'node:crypto';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
export interface MeasuredCase {
  name: string;
  passed: boolean;
  elapsedMs: number;
}
export async function recordFlowEvidence(name: string, results: MeasuredCase[], extra: Record<string, unknown> = {}) {
  const paths = [
    'package.json',
    'npm-shrinkwrap.json',
    'tests/support/pds/environment.mjs',
    'tests/support/pds/pds-server.mjs',
    'tests/support/pds/package.json',
    'tests/support/pds/package-lock.json',
  ];
  async function walk(root: string) {
    for (const entry of await readdir(root, { withFileTypes: true })) {
      const path = join(root, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.isFile() && /\.(ts|json|html|css|mjs)$/.test(path)) paths.push(path);
    }
  }
  for (const root of ['src', 'lexicons', 'testdata', 'tests', 'scripts']) await walk(root);
  const sourceHashes = Object.fromEntries(
    await Promise.all(
      paths.sort().map(async (path) => [
        path,
        createHash('sha256')
          .update(await readFile(path))
          .digest('hex'),
      ]),
    ),
  );
  await mkdir('experiments/generated', { recursive: true });
  await writeFile(
    `experiments/generated/${name}-results.json`,
    JSON.stringify(
      {
        passed: results.length === extra.expectedCases && results.every((r) => r.passed),
        measuredAt: new Date().toISOString(),
        nodeVersion: process.version,
        ...extra,
        cases: results,
        sourceHashes,
      },
      null,
      2,
    ) + '\n',
  );
}
