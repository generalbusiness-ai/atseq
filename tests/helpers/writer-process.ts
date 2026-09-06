import { fork } from 'node:child_process';

export async function startWriter(configPath: string) {
  const child = fork(new URL('./writer-child.ts', import.meta.url), [configPath], { execArgv: ['--import', 'tsx'], stdio: ['ignore', 'ignore', 'ignore', 'ipc'] });
  const exited = new Promise<void>(resolve => child.once('exit', () => resolve()));
  try {
    const url = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Writer startup timed out')), 10_000);
      child.once('message', (message: any) => { clearTimeout(timer); if (message.ready) resolve(message.url); else reject(new Error(message.error)); });
      child.once('exit', () => { clearTimeout(timer); reject(new Error('Writer exited before ready')); });
      child.once('error', error => { clearTimeout(timer); reject(error); });
    });
    return { url, async stop(signal: NodeJS.Signals = 'SIGTERM') { child.kill(signal); await exited; } };
  } catch (error) { child.kill('SIGKILL'); await exited; throw error; }
}
