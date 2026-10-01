import { ApiError, type AtseqClient } from '../client/api.ts';
import type { DeviceStore } from '../client/store.ts';
import type { SignedIntent, Receipt } from '../protocol/log.ts';
import type { Outcome } from '../application/folder.ts';
import type { AppSnapshot } from './protocol.ts';
import { bytes } from '../protocol/wire.ts';
import { NSID } from '../core/nsids.ts';
export interface Pending {
  cid: string;
  block: number[];
  signed: SignedIntent;
  app: string;
  genesis: string;
  status: 'queued' | 'recorded' | 'applied' | 'not-applied' | 'refused';
  receipt?: Receipt;
  outcome?: Outcome;
  error?: string;
  source?: number[];
}
const key = (pending: Pending) => `outbox:${pending.app}:${pending.cid}`;
const terminal = (pending: Pending) => ['applied', 'not-applied'].includes(pending.status);
/** A new save during a flush schedules another scan, retaining exact signed bytes. */
export class Outbox {
  private running?: Promise<void>;
  private again = false;
  constructor(
    private readonly store: Pick<DeviceStore, 'list' | 'update'>,
    private readonly api: Pick<AtseqClient, 'call'>,
  ) {}
  flush(): Promise<void> {
    if (this.running) {
      this.again = true;
      return this.running;
    }
    this.running = this.drain().finally(() => {
      this.running = undefined;
    });
    return this.running;
  }
  private async drain() {
    do {
      this.again = false;
      for (const pending of await this.store.list<Pending>('outbox:')) {
        if (pending.status !== 'queued') continue;
        try {
          const recorded = await this.api.call('submit', { block: bytes(new Uint8Array(pending.block)) });
          await this.store.update<Pending>(key(pending), (previous) =>
            previous && terminal(previous)
              ? previous
              : { ...(previous ?? pending), status: 'recorded', receipt: recorded.receipt, error: undefined },
          );
        } catch (error) {
          // A host cannot retire queued work merely by choosing a 4xx status.
          const refused =
            error instanceof ApiError &&
            error.permanent &&
            [
              'signature',
              'key',
              'input',
              'envelope',
              'payload',
              'noncanonical',
              'retry_conflict',
              'wire_bytes',
              'wire_cid',
              'wire_depth',
              'wire_key',
              'wire_number',
              'wire_size',
              'wire_value',
            ].includes(error.code);
          await this.store.update<Pending>(key(pending), (previous) =>
            previous && ['recorded', 'applied', 'not-applied'].includes(previous.status)
              ? previous
              : {
                  ...(previous ?? pending),
                  status: refused ? 'refused' : 'queued',
                  error: refused ? error.message : 'Reply uncertain. The original signed action is retained for retry.',
                },
          );
        }
      }
    } while (this.again);
  }
  async resend(pending: Pending) {
    await this.store.update<Pending>(key(pending), (previous) => {
      if (!previous || previous.status !== 'refused') throw new Error('Only a retained refused action can be resent');
      return { ...previous, status: 'queued', error: undefined };
    });
    await this.flush();
  }
  async reconcile(snapshot: AppSnapshot) {
    for (const pending of await this.store.list<Pending>(`outbox:${snapshot.projection.app}:`)) {
      if (pending.genesis !== snapshot.projection.genesis) continue;
      const observed = snapshot.projection.outcomes.find((o) => o.intent === pending.cid);
      if (!observed) continue;
      await this.store.update<Pending>(key(pending), (previous) => ({
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
