import { OAuthAdapter, type OAuthAdapterOptions } from '../protocol/oauth.ts';
export interface BrowserOAuthOptions extends OAuthAdapterOptions {
    readonly custodyOrigin: string;
    readonly publisherOrigin: string;
    readonly applicationOrigin: string;
}
/** Credential origin only. App display and publisher contexts must be separate. */
export declare function browserOAuthAdapter(input: BrowserOAuthOptions): Promise<OAuthAdapter>;
/** Trusted credential-shell management only; never invoked by app records or archives. */
export declare function resetBrowserOAuthCustody(input: BrowserOAuthOptions): Promise<void>;
//# sourceMappingURL=oauth-adapter.d.ts.map