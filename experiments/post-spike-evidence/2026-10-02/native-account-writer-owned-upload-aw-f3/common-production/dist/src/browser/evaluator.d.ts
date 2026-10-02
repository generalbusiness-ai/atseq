import type { Invitation } from '../protocol/log.ts';
import type { AppSnapshot, Operations } from './protocol.ts';
import type { RetainedInput } from '../archive/archive.ts';
import { type AppSession } from './session.ts';
export declare class WorkerReplyError extends Error {
    readonly code: string;
    constructor(code: string, message: string);
}
export declare function savedHistoryFailed(error: unknown): boolean;
/** One worker per page. Failed workers rebuild from saved verified inputs. */
export declare class Evaluator {
    private readonly onFailure;
    private worker;
    private id;
    private failures;
    private loaded;
    private dormant;
    private decidingSaved;
    private latest?;
    private rebuilding?;
    private retained?;
    private pending;
    constructor(onFailure?: (message: string) => void);
    private start;
    private failed;
    private restart;
    private send;
    /** Install the saved prefix before worker I/O; failure never discards this floor. */
    restore(session: AppSession, input: RetainedInput): Promise<Operations['sync']['result']>;
    call<K extends keyof Operations>(kind: K, args: Operations[K]['args'], timeoutMs?: number): Promise<Operations[K]['result']>;
    /** App switches invalidate queued replies and drop the previous app cache. */
    select(): void;
    /** The shell has checked device storage and found no saved prefix for this app. */
    ready(): void;
    hasSavedHistory(invitation: Invitation): boolean;
    snapshot(invitation: Invitation): AppSnapshot | undefined;
    dispose(): void;
    cancel(message?: string): void;
}
//# sourceMappingURL=evaluator.d.ts.map