import { sameSession } from './session.js';
export class WorkerReplyError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
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
export function savedHistoryFailed(error) {
    return error instanceof WorkerReplyError && invalidSavedHistory.has(error.code);
}
/** One worker per page. Failed workers rebuild from saved verified inputs. */
export class Evaluator {
    onFailure;
    worker;
    id = 0;
    failures = 0;
    loaded = false;
    dormant = false;
    decidingSaved = false;
    latest;
    rebuilding;
    retained;
    pending = new Map();
    constructor(onFailure = () => { }) {
        this.onFailure = onFailure;
        this.start();
    }
    start() {
        this.dormant = false;
        this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
        const active = this.worker;
        active.onmessage = ({ data }) => {
            if (active !== this.worker)
                return;
            const request = this.pending.get(data.id);
            if (!request)
                return;
            clearTimeout(request.timer);
            this.pending.delete(data.id);
            if (data.error)
                request.reject(new WorkerReplyError(data.error.code, data.error.message));
            else {
                this.failures = 0;
                request.resolve(data.result);
            }
        };
        active.onerror = () => {
            if (active === this.worker)
                this.failed('Worker failed');
        };
    }
    failed(message) {
        this.failures++;
        const detail = this.failures >= 3
            ? 'Evaluation failed repeatedly. Reload this page to continue; saved work is unchanged.'
            : `${message}; saved work is unchanged. Retry to rebuild.`;
        this.restart(detail);
        this.onFailure(detail);
    }
    restart(message, start = true) {
        this.worker.terminate();
        this.dormant = true;
        this.loaded = false;
        this.rebuilding = undefined;
        for (const item of this.pending.values()) {
            clearTimeout(item.timer);
            item.reject(new Error(message));
        }
        this.pending.clear();
        if (start && this.failures < 3)
            this.start();
    }
    send(kind, args, timeoutMs) {
        if (this.failures >= 3)
            return Promise.reject(new Error('Reload this page to continue; saved work is unchanged.'));
        return new Promise((resolve, reject) => {
            const id = ++this.id, timer = setTimeout(() => this.failed('Evaluation timed out'), timeoutMs);
            this.pending.set(id, { resolve: (value) => resolve(value), reject, timer });
            try {
                this.worker.postMessage({ id, kind, ...args });
            }
            catch (error) {
                clearTimeout(timer);
                this.pending.delete(id);
                reject(error);
            }
        });
    }
    /** Install the saved prefix before worker I/O; failure never discards this floor. */
    async restore(session, input) {
        this.restart('Rebuilding saved history; saved work is unchanged.');
        const retained = { session: { ...session }, input: structuredClone(input) };
        this.retained = retained;
        this.latest = undefined;
        this.decidingSaved = false;
        this.loaded = false;
        const worker = this.worker;
        const checked = await this.send('sync', { session, input: retained.input }, 120_000);
        if (worker !== this.worker || this.retained !== retained)
            throw new Error('App changed while restoring');
        this.retained = { session: checked.session, input: retained.input };
        this.loaded = true;
        this.latest = structuredClone(checked);
        return checked;
    }
    async call(kind, args, timeoutMs = 15_000) {
        if ('session' in args && this.decidingSaved)
            throw new Error('Saved history is still loading. Retry when it is ready.');
        if (this.dormant && this.failures < 3)
            this.start();
        const worker = this.worker;
        if ('session' in args && !this.loaded && this.retained) {
            const retained = this.retained;
            if (!sameSession(args.session, retained.session))
                throw new Error('Open saved verified history first');
            this.rebuilding ??= this.send('sync', {
                input: retained.input,
                session: { ...retained.session, definition: retained.input.genesis.definition.$link },
            }, 120_000)
                .then((rebuilt) => {
                if (this.retained !== retained ||
                    rebuilt.session.app !== retained.session.app ||
                    rebuilt.session.genesis !== retained.session.genesis)
                    throw new Error('App changed while rebuilding');
                this.retained = { session: rebuilt.session, input: retained.input };
                this.latest = structuredClone(rebuilt);
                this.loaded = true;
            })
                .finally(() => {
                this.rebuilding = undefined;
            });
            await this.rebuilding;
            if (kind === 'sync')
                args = { ...args, session: this.retained.session };
        }
        else if ('session' in args && kind !== 'sync' && !this.loaded)
            throw new Error('Open saved verified history first');
        const result = await this.send(kind, args, timeoutMs);
        if (worker !== this.worker)
            throw new Error('App changed while evaluating');
        if (kind === 'sync') {
            const syncArgs = args, checked = result;
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
    hasSavedHistory(invitation) {
        return this.retained?.session.app === invitation.app && this.retained.session.genesis === invitation.genesis;
    }
    snapshot(invitation) {
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
//# sourceMappingURL=evaluator.js.map