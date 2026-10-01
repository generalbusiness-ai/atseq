import type { Invitation } from '../protocol/log.ts';
import type { AppSnapshot, Operations, WorkerReply } from './protocol.ts';
import type { RetainedInput } from '../archive/archive.ts';
import { sameSession, type AppSession } from './session.ts';

export class WorkerReplyError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
const invalidSavedHistory = new Set([
  'signature',
  'key',
  'anchor',
  'head',
  'position',
  'predecessor',
  'missing_history',
  'duplicate_retry',
  'retry_conflict',
  'content',
  'envelope',
  'payload',
  'noncanonical',
  'wire_value',
  'wire_bytes',
  'wire_cid',
  'wire_number',
  'wire_key',
  'wire_depth',
  'wire_size',
]);
export function savedHistoryFailed(error: unknown) {
  return error instanceof WorkerReplyError && invalidSavedHistory.has(error.code);
}
/** One worker per page. Failed workers rebuild from saved verified inputs. */
export class Evaluator {
  private worker!: Worker;
  private id = 0;
  private failures = 0;
  private loaded = false;
  private dormant = false;
  private decidingSaved = false;
  private latest?: AppSnapshot;
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
    this.dormant = false;
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    const active = this.worker;
    active.onmessage = ({ data }: MessageEvent<WorkerReply>) => {
      if (active !== this.worker) return;
      const request = this.pending.get(data.id);
      if (!request) return;
      clearTimeout(request.timer);
      this.pending.delete(data.id);
      if (data.error) request.reject(new WorkerReplyError(data.error.code, data.error.message));
      else {
        this.failures = 0;
        request.resolve(data.result);
      }
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
  private restart(message: string, start = true) {
    this.worker.terminate();
    this.dormant = true;
    this.loaded = false;
    this.rebuilding = undefined;
    for (const item of this.pending.values()) {
      clearTimeout(item.timer);
      item.reject(new Error(message));
    }
    this.pending.clear();
    if (start && this.failures < 3) this.start();
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
  /** Install the saved prefix before worker I/O; failure never discards this floor. */
  async restore(session: AppSession, input: RetainedInput): Promise<Operations['sync']['result']> {
    this.restart('Rebuilding saved history; saved work is unchanged.');
    const retained = { session: { ...session }, input: structuredClone(input) };
    this.retained = retained;
    this.latest = undefined;
    this.decidingSaved = false;
    this.loaded = false;
    const worker = this.worker;
    const checked = await this.send('sync', { session, input: retained.input }, 120_000);
    if (worker !== this.worker || this.retained !== retained) throw new Error('App changed while restoring');
    this.retained = { session: checked.session, input: retained.input };
    this.loaded = true;
    this.latest = structuredClone(checked);
    return checked;
  }
  async call<K extends keyof Operations>(
    kind: K,
    args: Operations[K]['args'],
    timeoutMs = 15_000,
  ): Promise<Operations[K]['result']> {
    if ('session' in args && this.decidingSaved)
      throw new Error('Saved history is still loading. Retry when it is ready.');
    if (this.dormant && this.failures < 3) this.start();
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
          if (
            this.retained !== retained ||
            rebuilt.session.app !== retained.session.app ||
            rebuilt.session.genesis !== retained.session.genesis
          )
            throw new Error('App changed while rebuilding');
          this.retained = { session: rebuilt.session, input: retained.input };
          this.latest = structuredClone(rebuilt);
          this.loaded = true;
        })
        .finally(() => {
          this.rebuilding = undefined;
        });
      await this.rebuilding;
      if (kind === 'sync') args = { ...args, session: this.retained!.session };
    } else if ('session' in args && kind !== 'sync' && !this.loaded)
      throw new Error('Open saved verified history first');
    const result = await this.send(kind, args, timeoutMs);
    if (worker !== this.worker) throw new Error('App changed while evaluating');
    if (kind === 'sync') {
      const syncArgs = args as Operations['sync']['args'],
        checked = result as Operations['sync']['result'];
      this.retained = { session: checked.session, input: structuredClone(syncArgs.input) };
      this.latest = structuredClone(checked);
      this.loaded = true;
    }
    return result;
  }
  /** App switches invalidate queued replies and drop the previous app cache. */
  select() {
    this.retained = undefined;
    this.latest = undefined;
    this.decidingSaved = true;
    this.restart('App changed. Saved work is unchanged.', false);
  }
  /** The shell has checked device storage and found no saved prefix for this app. */
  ready() {
    this.decidingSaved = false;
  }
  snapshot(invitation: Invitation): AppSnapshot | undefined {
    return this.latest?.session.app === invitation.app && this.latest.session.genesis === invitation.genesis
      ? structuredClone(this.latest)
      : undefined;
  }
  dispose() {
    this.worker.terminate();
    for (const item of this.pending.values()) {
      clearTimeout(item.timer);
      item.reject(new Error('Evaluator closed'));
    }
    this.pending.clear();
  }
  cancel(message = 'Preview cancelled. Saved work is unchanged.') {
    this.restart(message);
  }
}
