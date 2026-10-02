import { fork } from 'node:child_process';
export async function startWriter(configPath) {
    const child = fork(new URL("file:///private/tmp/atseq-native-account-writer-aw-f2-20261002/.atseq-local/writer-compiled-final-16f-node22/tests/helpers/writer-child.js"), [configPath], {
        execArgv: [],
        stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
    });
    const exited = new Promise((resolve) => child.once('exit', () => resolve()));
    try {
        const url = await new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('Writer startup timed out')), 10_000);
            child.once('message', (message) => {
                clearTimeout(timer);
                if (message.ready)
                    resolve(message.url);
                else
                    reject(new Error(message.error));
            });
            child.once('exit', () => {
                clearTimeout(timer);
                reject(new Error('Writer exited before ready'));
            });
            child.once('error', (error) => {
                clearTimeout(timer);
                reject(error);
            });
        });
        return {
            url,
            async stop(signal = 'SIGTERM') {
                child.kill(signal);
                await exited;
            },
        };
    }
    catch (error) {
        child.kill('SIGKILL');
        await exited;
        throw error;
    }
}
