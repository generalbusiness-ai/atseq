import { deepFreeze } from '../core/freeze.js';
import { assertDependencies } from '../core/dependencies.js';
import { safeFetchWrap } from '@atproto-labs/fetch-node';
import { OAuthAdapter, oauthTransport, OAUTH_LIMITS, } from '../protocol/oauth.js';
/** Private, in-memory Node custody only. This foundation does not persist credentials. */
export function nodeOAuthAdapter(input) {
    assertDependencies();
    const options = { ...input, metadata: deepFreeze(input.metadata) };
    const transactions = new Map();
    const states = new Map();
    const sessions = new Map();
    let tail = Promise.resolve();
    const lock = async (work) => {
        const before = tail;
        let release;
        tail = new Promise((resolve) => {
            release = resolve;
        });
        await before;
        try {
            return await work();
        }
        finally {
            release();
        }
    };
    const transport = safeFetchWrap({
        fetch: oauthTransport(globalThis.fetch),
        ssrfProtection: true,
        allowHttp: false,
        allowPrivateIps: false,
        allowData: false,
        allowCustomPort: true,
        allowIpHost: false,
        allowImplicitRedirect: false,
        timeout: 30_000,
        // OAuth's bounded reader enforces the same 1MiB limit and total budget.
        // The wrapper's size stream emits an untyped error indistinguishable from
        // a dropped body, so let the owned guard retain its deterministic class.
        responseMaxSize: Infinity,
    });
    return new OAuthAdapter(options, {
        list: () => [...transactions.values()],
        set: (transaction) => {
            transactions.set(transaction.id, transaction);
        },
        take: (id) => {
            const transaction = transactions.get(id);
            transactions.delete(id);
            return transaction;
        },
    }, lock, transport, async (fetch, identityResolver) => {
        const { NodeOAuthClient, requestLocalLock } = await import('@atproto/oauth-client-node');
        class CustodyClient extends NodeOAuthClient {
            async readApplicationState(callbackState) {
                return (await this.stateStore.get(callbackState))?.appState;
            }
        }
        return new CustodyClient({
            clientMetadata: options.metadata,
            fetch,
            identityResolver,
            // Explicit hook avoids constructing/using the default Node DNS handle resolver.
            handleResolver: {
                resolve: async () => {
                    throw new Error('Handle resolution must use the supplied identity resolver');
                },
            },
            requestLock: requestLocalLock,
            stateStore: {
                get: (key) => {
                    const state = states.get(key);
                    return state && Date.now() < state.expiresAt ? state.value : undefined;
                },
                set: (key, value) => {
                    for (const [id, state] of states)
                        if (Date.now() >= state.expiresAt)
                            states.delete(id);
                    if (!states.has(key) && states.size >= OAUTH_LIMITS.pending)
                        throw new Error('OAuth state custody is full');
                    states.set(key, { value, expiresAt: Date.now() + OAUTH_LIMITS.transactionMs });
                },
                del: (key) => {
                    states.delete(key);
                },
            },
            sessionStore: {
                get: (key) => sessions.get(key),
                set: (key, value) => {
                    if (!sessions.has(key) && sessions.size >= OAUTH_LIMITS.pending)
                        throw new Error('OAuth session custody is full');
                    sessions.set(key, value);
                },
                del: (key) => {
                    sessions.delete(key);
                },
            },
        });
    });
}
//# sourceMappingURL=oauth-adapter.js.map