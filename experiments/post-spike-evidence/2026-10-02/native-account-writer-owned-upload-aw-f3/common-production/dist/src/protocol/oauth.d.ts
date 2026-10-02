import type { OAuthClient, OAuthSession, OAuthClientMetadataInput, CreateIdentityResolverOptions } from '@atproto/oauth-client-browser';
/** Internal enrolment boundary. No OAuth secret is part of its returned values. */
export declare const OAUTH_LIMITS: Readonly<{
    pending: 10;
    transactionMs: number;
    operationMs: 30000;
    requests: 64;
    requestBytes: number;
    responseBytes: number;
    totalBytes: number;
    scopes: 64;
    scopeBytes: 8192;
}>;
export type OAuthIdentityResolver = NonNullable<CreateIdentityResolverOptions['identityResolver']>;
/** Local subclass bridge to the SDK's published protected state-store hook. */
export interface OAuthCustodyClient extends OAuthClient {
    readApplicationState(callbackState: string): Promise<string | undefined>;
}
export interface OAuthAdapterOptions {
    readonly metadata: OAuthClientMetadataInput;
    /** Trusted caller's maintained identity path. Every HTTP lookup must use this fetch. */
    readonly resolveIdentity: (identifier: string, options: {
        readonly fetch: typeof globalThis.fetch;
        readonly signal: AbortSignal;
    }) => ReturnType<OAuthIdentityResolver['resolve']>;
}
export interface OAuthTransaction {
    readonly id: string;
    readonly did: string;
    readonly scopes: readonly string[];
    readonly expiresAt: number;
}
/** Non-secret transaction custody; the platform adapter serializes all access. */
export interface OAuthTransactionStore {
    list(): readonly OAuthTransaction[] | Promise<readonly OAuthTransaction[]>;
    set(transaction: OAuthTransaction): void | Promise<void>;
    take(id: string): OAuthTransaction | undefined | Promise<OAuthTransaction | undefined>;
}
/** Private platform custody lifecycle; absent on the existing Node adapter. */
export interface OAuthCustodyLifecycle {
    prepare(client: OAuthCustodyClient): Promise<void>;
    touch(did: string, conservative?: boolean): Promise<void>;
    tokenRequestDispatched(): void;
    finish(client: OAuthCustodyClient, successful: boolean): Promise<void>;
}
export type OAuthLock = <T>(work: () => Promise<T>) => Promise<T>;
/** Wrap the native fetch edge, outside host policy checks and SDK parsing. */
export declare function oauthTransport(fetch: typeof globalThis.fetch): typeof globalThis.fetch;
/** Browser-visible URL policy only. Host transport must additionally guard actual DNS/connect. */
export declare function oauthUrl(value: string | URL): URL;
export interface OAuthSessionInfo {
    readonly did: string;
    readonly issuer: string;
    readonly pds: string;
    readonly scopes: readonly string[];
}
/** Internal lookup only: there is no caller registration or positive trust flag. */
export interface OwnedOAuthSession {
    readonly did: string;
    readonly info: () => Promise<OAuthSessionInfo>;
    readonly request: (path: string, init?: RequestInit) => Promise<Response>;
    readonly apply: (body: Uint8Array, signal?: AbortSignal) => Promise<Response>;
    readonly upload: (body: Uint8Array, mimeType: string, signal?: AbortSignal) => Promise<Response>;
}
export declare function ownedOAuthSession(handle: OAuthSessionHandle): OwnedOAuthSession;
/** Credentials stay in maintained-client stores and JS private fields, never JSON output. */
export declare class OAuthSessionHandle {
    #private;
    constructor(flow: OAuthAdapter, session: OAuthSession, expected: OAuthTransaction);
    info(refresh?: boolean): Promise<OAuthSessionInfo>;
    /** Account responses are ephemeral transport data, not an Atseq archive/result. */
    request(path: string, init?: RequestInit): Promise<Response>;
    revoke(): Promise<void>;
}
/** Maintained OAuth performs PKCE/PAR/DPoP. This adapter adds custody and operation policy. */
export declare class OAuthAdapter {
    #private;
    constructor(options: OAuthAdapterOptions, transactions: OAuthTransactionStore, lock: OAuthLock, transport: typeof globalThis.fetch, factory: (fetch: typeof globalThis.fetch, identity: OAuthIdentityResolver) => Promise<OAuthCustodyClient>, custody?: OAuthCustodyLifecycle);
    /** Internal credential-shell housekeeping, under the same guarded operation. */
    cleanupCustody(): Promise<void>;
    begin(did: string, requestedScope: string): Promise<{
        readonly transactionId: string;
        readonly authorizationUrl: string;
    }>;
    complete(params: URLSearchParams): Promise<OAuthSessionHandle>;
    restore(did: string, requestedScope: string): Promise<OAuthSessionHandle>;
    sessionInfo(session: OAuthSession, expected: OAuthTransaction, refresh: boolean): Promise<OAuthSessionInfo>;
    sessionRequest(session: OAuthSession, expected: OAuthTransaction, path: string, init?: RequestInit): Promise<Response>;
    sessionRevoke(session: OAuthSession): Promise<void>;
}
//# sourceMappingURL=oauth.d.ts.map