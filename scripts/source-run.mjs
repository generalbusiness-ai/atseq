import { spawn } from 'node:child_process';
const child = spawn(process.execPath, ['--import', 'tsx', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: [process.env.NODE_OPTIONS, '--conditions=atseq-source'].filter(Boolean).join(' '),
  },
});
child.once('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.once('exit', (code, signal) => {
  process.exitCode = code ?? 1;
  if (signal) process.kill(process.pid, signal);
});
