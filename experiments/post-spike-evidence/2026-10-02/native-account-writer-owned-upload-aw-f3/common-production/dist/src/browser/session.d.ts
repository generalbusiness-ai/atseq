import type { Invitation } from '../protocol/log.ts';
export interface AppSession extends Invitation {
    definition: string;
}
export declare function sameSession(a: AppSession | undefined, b: AppSession | undefined): boolean;
/** A page generation also distinguishes leaving and returning to the same app. */
export declare class SessionGeneration {
    private generation;
    begin(): number;
    capture(): number;
    current(generation: number): boolean;
}
//# sourceMappingURL=session.d.ts.map