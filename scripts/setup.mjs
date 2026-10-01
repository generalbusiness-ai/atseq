import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url)),
  npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
for (const args of [
  ['ci'],
  ['ci', '--prefix', 'tests/support/pds'],
  ['exec', '--', 'playwright', 'install', ...(process.platform === 'linux' ? ['--with-deps'] : []), 'chromium'],
  ['run', 'build'],
]) {
  const result = spawnSync(npm, args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log('Atseq development and test setup complete. Run npm run check and npm test.');
