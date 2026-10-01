import type { NodeSavedState, NodeSavedSession } from '@atproto/oauth-client-node';
import { deepFreeze } from '../core/freeze.ts';
import { assertDependencies } from '../core/dependencies.ts';
import { safeFetchWrap } from '@atproto-labs/fetch-node';
import { OAuthAdapter, OAUTH_LIMITS, type OAuthAdapterOptions, type OAuthTransaction } from '../protocol/oauth.ts';

/** Private, in-memory Node custody only. This foundation does not persist credentials. */
export function nodeOAuthAdapter(input: OAuthAdapterOptions): OAuthAdapter {
  assertDependencies();
  const options = { ...input, metadata: deepFreeze(input.metadata) };
  const transactions = new Map<string, OAuthTransaction>();
  const states = new Map<string, { value: NodeSavedState; expiresAt: number }>();
  const sessions = new Map<string, NodeSavedSession>();
  let tail = Promise.resolve();
  const lock = async <T>(work: () => Promise<T>): Promise<T> => {
    const before = tail;
    let release!: () => void;
    tail = new Promise<void>((resolve) => {
      release = resolve;
    });
    await before;
    try {
      return await work();
    } finally {
      release();
    }
  };
  const transport = safeFetchWrap({
    ssrfProtection: true,
    allowHttp: false,
    allowPrivateIps: false,
    allowData: false,
    allowCustomPort: true,
    allowIpHost: false,
    allowImplicitRedirect: false,
    timeout: 30_000,
    responseMaxSize: 1024 * 1024,
  });
  return new OAuthAdapter(
    options,
    {
      list: () => [...transactions.values()],
      set: (transaction) => {
        transactions.set(transaction.id, transaction);
      },
      take: (id) => {
        const transaction = transactions.get(id);
        transactions.delete(id);
        return transaction;
      },
    },
    lock,
    transport,
    async (fetch, identityResolver) => {
      const { NodeOAuthClient, requestLocalLock } = await import('@atproto/oauth-client-node');
      return new NodeOAuthClient({
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
            for (const [id, state] of states) if (Date.now() >= state.expiresAt) states.delete(id);
            if (!states.has(key) && states.size >= OAUTH_LIMITS.pending) throw new Error('OAuth state custody is full');
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
    },
  );
}
