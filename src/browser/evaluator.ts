import type { Operations, WorkerReply } from './protocol.ts';
import type { RetainedInput } from '../archive/archive.ts';
import { sameSession, type AppSession } from './session.ts';

/** One worker per page. Failed workers rebuild from saved verified inputs. */
export class Evaluator {
  private worker!: Worker;
  private id = 0;
  private failures = 0;
  private loaded = false;
  private rebuilding?: Promise<void>;
  private retained?: { session: AppSession; input: RetainedInput };
  private pending = new Map<
    number,
    { resolve: (value: unknown) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> }
  >();
  constructor(private readonly onFailure: (message: string) => void = () => {}) {
    this.start();
  }
  private start() {
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    const active = this.worker;
    active.onmessage = ({ data }: MessageEvent<WorkerReply>) => {
      if (active !== this.worker) return;
      const request = this.pending.get(data.id);
      if (!request) return;
      clearTimeout(request.timer);
      this.pending.delete(data.id);
      if (data.error) request.reject(Object.assign(new Error(data.error.message), { code: data.error.code }));
      else request.resolve(data.result);
    };
    active.onerror = () => {
      if (active === this.worker) this.failed('Worker failed');
    };
  }
  private failed(message: string) {
    this.failures++;
    const detail =
      this.failures >= 3
        ? 'Evaluation failed repeatedly. Reload this page to continue; saved work is unchanged.'
        : `${message}; saved work is unchanged. Retry to rebuild.`;
    this.restart(detail);
    this.onFailure(detail);
  }
  private restart(message: string) {
    this.worker.terminate();
    this.loaded = false;
    this.rebuilding = undefined;
    for (const item of this.pending.values()) {
      clearTimeout(item.timer);
      item.reject(new Error(message));
    }
    this.pending.clear();
    if (this.failures < 3) this.start();
  }
  private send<K extends keyof Operations>(
    kind: K,
    args: Operations[K]['args'],
    timeoutMs: number,
  ): Promise<Operations[K]['result']> {
    if (this.failures >= 3) return Promise.reject(new Error('Reload this page to continue; saved work is unchanged.'));
    return new Promise((resolve, reject) => {
      const id = ++this.id,
        timer = setTimeout(() => this.failed('Evaluation timed out'), timeoutMs);
      this.pending.set(id, { resolve: (value) => resolve(value as Operations[K]['result']), reject, timer });
      try {
        this.worker.postMessage({ id, kind, ...args });
      } catch (error) {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(error);
      }
    });
  }
  async call<K extends keyof Operations>(
    kind: K,
    args: Operations[K]['args'],
    timeoutMs = 15_000,
  ): Promise<Operations[K]['result']> {
    const worker = this.worker;
    if ('session' in args && !this.loaded && this.retained) {
      const retained = this.retained;
      if (!sameSession(args.session, retained.session)) throw new Error('Open saved verified history first');
      this.rebuilding ??= this.send(
        'sync',
        {
          input: retained.input,
          session: { ...retained.session, definition: retained.input.genesis.definition.$link },
        },
        120_000,
      )
        .then((rebuilt) => {
          if (this.retained !== retained || !sameSession(rebuilt.session, retained.session))
            throw new Error('App changed while rebuilding');
          this.loaded = true;
        })
        .finally(() => {
          this.rebuilding = undefined;
        });
      await this.rebuilding;
    } else if ('session' in args && kind !== 'sync' && !this.loaded)
      throw new Error('Open saved verified history first');
    const result = await this.send(kind, args, timeoutMs);
    if (worker !== this.worker) throw new Error('App changed while evaluating');
    if (kind === 'sync') {
      const syncArgs = args as Operations['sync']['args'],
        checked = result as Operations['sync']['result'];
      this.retained = { session: checked.session, input: structuredClone(syncArgs.input) };
      this.loaded = true;
    }
    return result;
  }
  /** App switches invalidate queued replies and drop the previous app cache. */
  select() {
    this.retained = undefined;
    this.restart('App changed. Saved work is unchanged.');
  }
  cancel(message = 'Preview cancelled. Saved work is unchanged.') {
    this.restart(message);
  }
}
