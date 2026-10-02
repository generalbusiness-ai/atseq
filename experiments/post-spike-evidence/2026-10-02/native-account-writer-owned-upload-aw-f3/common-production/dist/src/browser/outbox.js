import { ApiError } from '../client/api.js';
import { bytes } from '../protocol/wire.js';
import { hostMessage } from './host-access.js';
import { NSID } from '../core/nsids.js';
const key = (pending) => `outbox:${pending.app}:${pending.cid}`;
const terminal = (pending) => ['applied', 'not-applied'].includes(pending.status);
/** A new save during a flush schedules another scan, retaining exact signed bytes. */
export class Outbox {
    store;
    api;
    running;
    again = false;
    constructor(store, api) {
        this.store = store;
        this.api = api;
    }
    flush() {
        if (this.running) {
            this.again = true;
            return this.running;
        }
        this.running = this.drain().finally(() => {
            this.running = undefined;
        });
        return this.running;
    }
    async drain() {
        do {
            this.again = false;
            for (const pending of await this.store.list('outbox:')) {
                if (pending.status !== 'queued')
                    continue;
                try {
                    const recorded = await this.api.call('submit', { block: bytes(new Uint8Array(pending.block)) });
                    await this.store.update(key(pending), (previous) => previous && terminal(previous)
                        ? previous
                        : { ...(previous ?? pending), status: 'recorded', receipt: recorded.receipt, error: undefined });
                }
                catch (error) {
                    // A host cannot retire queued work merely by choosing a 4xx status.
                    const refused = error instanceof ApiError &&
                        error.permanent &&
                        [
                            'signature',
                            'key',
                            'input',
                            'envelope',
                            'payload',
                            'noncanonical',
                            'retry_conflict',
                            'snapshot_limit',
                            'definition_history_limit',
                            'append_limit',
                            'wire_bytes',
                            'wire_cid',
                            'wire_depth',
                            'wire_key',
                            'wire_number',
                            'wire_size',
                            'wire_value',
                        ].includes(error.code);
                    await this.store.update(key(pending), (previous) => previous && ['recorded', 'applied', 'not-applied'].includes(previous.status)
                        ? previous
                        : {
                            ...(previous ?? pending),
                            status: refused ? 'refused' : 'queued',
                            error: refused
                                ? hostMessage(error)
                                : 'Reply uncertain. The original signed action is retained for retry.',
                        });
                }
            }
        } while (this.again);
    }
    async resend(pending) {
        await this.store.update(key(pending), (previous) => {
            if (!previous || previous.status !== 'refused')
                throw new Error('Only a retained refused action can be resent');
            return { ...previous, status: 'queued', error: undefined };
        });
        await this.flush();
    }
    async reconcile(snapshot) {
        for (const pending of await this.store.list(`outbox:${snapshot.projection.app}:`)) {
            if (pending.genesis !== snapshot.projection.genesis)
                continue;
            const observed = snapshot.projection.outcomes.find((o) => o.intent === pending.cid);
            if (!observed)
                continue;
            await this.store.update(key(pending), (previous) => ({
                ...(previous ?? pending),
                status: observed.outcome.$type === NSID.defsEffective ? 'applied' : 'not-applied',
                outcome: observed.outcome,
                receipt: {
                    $type: NSID.defsReceipt,
                    app: pending.app,
                    genesis: { $link: pending.genesis },
                    position: observed.position,
                    entry: { $link: observed.entry },
                    intent: { $link: observed.intent },
                },
                error: undefined,
            }));
        }
    }
}
//# sourceMappingURL=outbox.js.map