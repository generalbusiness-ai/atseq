import { PdsClient } from './pds.ts';
export interface AccountProvider {
    open(creationId: string): Promise<PdsClient>;
}
/** Local provisioning helper. Passwords stay in owner-readable files, never in app source. */
export declare class LocalAccounts implements AccountProvider {
    private readonly url;
    private readonly directory;
    private readonly handleSuffix;
    constructor(url: string, directory: string, handleSuffix?: string);
    open(id: string): Promise<PdsClient>;
}
//# sourceMappingURL=accounts.d.ts.map