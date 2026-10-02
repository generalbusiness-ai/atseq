import type { OAuthClient, StateStore, SessionStore, RuntimeImplementation, WebcryptoKey as WebcryptoKeyType } from '@atproto/oauth-client-browser';
import { type OAuthTransaction, type OAuthCustodyLifecycle } from '../protocol/oauth.ts';
export declare const OAUTH_CUSTODY_DATABASE = "atseq.oauth.custody.v1";
/** One database and one physical slot per account, including reservations and failures. */
export declare class BrowserOAuthCustody implements OAuthCustodyLifecycle {
    #private;
    constructor(keys: typeof WebcryptoKeyType);
    readonly transactions: {
        list: () => Promise<readonly OAuthTransaction[]>;
        set: (transaction: OAuthTransaction) => Promise<void>;
        take: (id: string) => Promise<OAuthTransaction | undefined>;
    };
    readonly stateStore: StateStore;
    readonly sessionStore: SessionStore;
    tokenRequestDispatched(): void;
    touch(did: string, conservative?: boolean): Promise<void>;
    prepare(client: OAuthClient): Promise<void>;
    finish(client: OAuthClient, successful: boolean): Promise<void>;
    runtime(): RuntimeImplementation;
}
//# sourceMappingURL=oauth-custody.d.ts.map