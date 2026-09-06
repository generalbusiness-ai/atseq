import { spawn } from 'node:child_process';
const args = process.argv.slice(2), group = args[0] === '--group' ? args[1] : 'participation';
if (group !== 'participation') { console.error(`S5 flow group ${group} is not implemented`); process.exitCode = 1; }
else {
  const child = spawn(process.execPath, ['--import', 'tsx', '--test', 'tests/flows.test.ts', 'tests/participation.test.ts'], { stdio: 'inherit' });
  process.exitCode = await new Promise<number>(resolve => child.once('exit', code => resolve(code ?? 1)));
}
