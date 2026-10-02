import { isAtprotoDid } from '@atproto/did';
import { AtseqError } from '../core/errors.js';
import { OAUTH_LIMITS } from '../protocol/oauth.js';
/** Fixed local custody policy, not a native identity or permission rule. */
const ACCOUNTS = 10;
const CONSENT_MS = 30 * 24 * 60 * 60 * 1000;
const METADATA_BYTES = 64 * 1024;
export const OAUTH_CUSTODY_DATABASE = 'atseq.oauth.custody.v1';
function refuse() {
    throw new AtseqError('input', 'OAuth credential custody is unavailable');
}
function request(value) {
    return new Promise((resolve, reject) => {
        value.onsuccess = () => resolve(value.result);
        value.onerror = () => reject(value.error);
    });
}
function metadata(value) {
    const bytes = new TextEncoder().encode(JSON.stringify(value, (name, entry) => name === 'keyPair' && entry?.privateKey instanceof CryptoKey && entry?.publicKey instanceof CryptoKey
        ? undefined
        : entry));
    if (bytes.length > METADATA_BYTES)
        refuse();
}
function pair(keyPair) {
    if (!(keyPair?.privateKey instanceof CryptoKey) ||
        !(keyPair.publicKey instanceof CryptoKey) ||
        keyPair.privateKey.type !== 'private' ||
        keyPair.privateKey.extractable ||
        keyPair.publicKey.type !== 'public')
        refuse();
}
function pendingRow(row) {
    metadata(row);
    if (!row ||
        !isAtprotoDid(row.did) ||
        typeof row.id !== 'string' ||
        row.id.length !== 36 ||
        !Number.isSafeInteger(row.expiresAt) ||
        row.expiresAt <= 0 ||
        row.expiresAt > Date.now() + OAUTH_LIMITS.transactionMs ||
        typeof row.consumed !== 'boolean' ||
        !Array.isArray(row.scopes) ||
        row.scopes.length > OAUTH_LIMITS.scopes ||
        row.scopes.some((scope) => typeof scope !== 'string') ||
        row.scopes.join(' ').length > OAUTH_LIMITS.scopeBytes ||
        (row.sdkState !== undefined && (typeof row.sdkState !== 'string' || !row.sdkState || row.sdkState.length > 2048)) ||
        (row.value !== undefined && (!row.sdkState || row.value.appState !== row.id)) ||
        Object.keys(row).some((key) => !['id', 'did', 'scopes', 'expiresAt', 'consumed', 'sdkState', 'value'].includes(key)))
        refuse();
}
function accountRow(row) {
    metadata(row);
    if (!row ||
        !isAtprotoDid(row.did) ||
        !['reserved', 'live', 'uncertain', 'retiring'].includes(row.phase) ||
        !Number.isSafeInteger(row.expiresAt) ||
        row.expiresAt <= 0 ||
        row.expiresAt > Date.now() + CONSENT_MS ||
        (row.phase === 'uncertain'
            ? typeof row.operation !== 'string' || row.operation.length !== 36
            : row.operation !== undefined) ||
        (row.phase === 'live' && !row.value) ||
        (row.phase === 'reserved' && row.value !== undefined) ||
        (row.value !== undefined && row.value.tokenSet.sub !== row.did) ||
        Object.keys(row).some((key) => !['did', 'phase', 'expiresAt', 'operation', 'value'].includes(key)))
        refuse();
}
/** One database and one physical slot per account, including reservations and failures. */
export class BrowserOAuthCustody {
    #db;
    #keys;
    #context;
    constructor(keys) {
        this.#keys = keys;
        this.#db = new Promise((resolve, reject) => {
            const opening = indexedDB.open(OAUTH_CUSTODY_DATABASE, 1);
            opening.onupgradeneeded = () => {
                const db = opening.result;
                const pending = db.createObjectStore('pending', { keyPath: 'id' });
                pending.createIndex('sdkState', 'sdkState', { unique: true });
                pending.createIndex('did', 'did', { unique: true });
                pending.createIndex('expiresAt', 'expiresAt');
                db.createObjectStore('accounts', { keyPath: 'did' }).createIndex('expiresAt', 'expiresAt');
            };
            opening.onsuccess = () => {
                const db = opening.result;
                db.onversionchange = () => db.close();
                resolve(db);
            };
            opening.onerror = () => reject(opening.error);
            opening.onblocked = () => reject(new AtseqError('input', 'OAuth custody database is blocked'));
        });
    }
    async #transaction(mode, work) {
        const db = await this.#db;
        const tx = db.transaction(['pending', 'accounts'], mode, { durability: 'strict' });
        const completed = new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onabort = () => reject(tx.error ?? new AtseqError('input', 'OAuth custody transaction aborted'));
            tx.onerror = () => { }; // onabort is the terminal failure boundary.
        });
        try {
            const result = await work(tx.objectStore('pending'), tx.objectStore('accounts'));
            await completed;
            return result;
        }
        catch (error) {
            try {
                tx.abort();
            }
            catch {
                /* Already terminal. */
            }
            await completed.catch(() => { });
            throw error;
        }
    }
    async #encode(value) {
        const key = value.dpopKey;
        if (!(key instanceof this.#keys) || !key.kid)
            refuse();
        pair(key.cryptoKeyPair);
        const encoded = { ...value, dpopKey: { keyId: key.kid, keyPair: key.cryptoKeyPair } };
        metadata(encoded);
        return encoded;
    }
    async #decode(value) {
        metadata(value);
        pair(value.dpopKey.keyPair);
        return {
            ...value,
            dpopKey: await this.#keys.fromKeypair(value.dpopKey.keyPair, value.dpopKey.keyId),
        };
    }
    transactions = {
        list: async () => this.#transaction('readonly', async (pending) => (await request(pending.getAll())).filter((row) => !row.consumed)),
        set: async (transaction) => {
            if (this.#context)
                refuse();
            const context = {
                id: crypto.randomUUID(),
                did: transaction.did,
                pending: transaction.id,
                explicit: true,
                authorization: true,
                conservative: true,
                mayHaveChanged: false,
                pendingTokenRequest: false,
            };
            await this.#transaction('readwrite', async (pending, accounts) => {
                if (await request(pending.index('did').get(transaction.did)))
                    refuse();
                if ((await request(pending.count())) >= OAUTH_LIMITS.pending)
                    refuse();
                let account = await request(accounts.get(transaction.did));
                if (!account) {
                    if ((await request(accounts.count())) >= ACCOUNTS)
                        refuse();
                    account = { did: transaction.did, phase: 'reserved', expiresAt: transaction.expiresAt };
                    metadata(account);
                    await request(accounts.put(account));
                }
                const row = { ...transaction, consumed: false };
                metadata(row);
                await request(pending.add(row));
            });
            this.#context = context;
        },
        take: async (id) => {
            if (this.#context)
                refuse();
            let context;
            const result = await this.#transaction('readwrite', async (pending, accounts) => {
                const row = await request(pending.get(id));
                if (!row || row.consumed || row.expiresAt <= Date.now())
                    return undefined;
                const account = await request(accounts.get(row.did));
                if (!account)
                    refuse();
                context = {
                    id: crypto.randomUUID(),
                    did: row.did,
                    pending: row.id,
                    explicit: true,
                    authorization: false,
                    conservative: true,
                    mayHaveChanged: false,
                    pendingTokenRequest: false,
                };
                row.consumed = true;
                account.phase = 'uncertain';
                account.operation = context.id;
                metadata(row);
                metadata(account);
                await request(pending.put(row));
                await request(accounts.put(account));
                return { id: row.id, did: row.did, scopes: row.scopes, expiresAt: row.expiresAt };
            });
            this.#context = context;
            return result;
        },
    };
    stateStore = {
        set: async (nonce, value) => {
            const context = this.#context;
            if (!context?.authorization || value.appState !== context.pending)
                refuse();
            const encoded = await this.#encode(value);
            await this.#transaction('readwrite', async (pending) => {
                const row = await request(pending.get(context.pending));
                if (!row || row.consumed || row.expiresAt <= Date.now() || row.sdkState)
                    refuse();
                row.sdkState = nonce;
                row.value = encoded;
                metadata(row);
                await request(pending.put(row));
            });
        },
        get: async (nonce) => {
            const row = await this.#transaction('readonly', async (pending) => request(pending.index('sdkState').get(nonce)));
            if (row)
                pendingRow(row);
            if (!row || row.expiresAt <= Date.now() || (row.consumed && this.#context?.pending !== row.id))
                return undefined;
            return row.value ? this.#decode(row.value) : undefined;
        },
        del: async (nonce) => {
            await this.#transaction('readwrite', async (pending) => {
                const row = await request(pending.index('sdkState').get(nonce));
                if (!row)
                    return;
                if (!row.consumed || this.#context?.pending !== row.id)
                    refuse();
                delete row.sdkState;
                delete row.value;
                await request(pending.put(row));
            });
        },
    };
    sessionStore = {
        get: async (did) => {
            const row = await this.#transaction('readonly', async (_pending, accounts) => request(accounts.get(did)));
            if (!row)
                return undefined;
            accountRow(row);
            if (!row.value)
                return undefined;
            const context = this.#context;
            if (!context || row.phase !== 'uncertain' || row.operation !== context.id || did !== context.did)
                refuse();
            if (!context.explicit && row.expiresAt <= Date.now())
                refuse();
            return this.#decode(row.value);
        },
        set: async (did, value) => {
            const context = this.#context;
            if (!context || context.authorization || context.did !== did || value.tokenSet.sub !== did)
                refuse();
            context.mayHaveChanged = true;
            const encoded = await this.#encode(value);
            await this.#transaction('readwrite', async (_pending, accounts) => {
                const row = await request(accounts.get(did));
                if (!row || row.phase !== 'uncertain' || row.operation !== context.id)
                    refuse();
                row.value = encoded;
                metadata(row);
                await request(accounts.put(row));
            });
            context.pendingTokenRequest = false;
        },
        del: async (did) => {
            const context = this.#context;
            if (!context || context.did !== did)
                refuse();
            context.mayHaveChanged = true;
            await this.#transaction('readwrite', async (_pending, accounts) => {
                const row = await request(accounts.get(did));
                if (!row || row.operation !== context.id)
                    return;
                delete row.value;
                await request(accounts.put(row));
            });
        },
    };
    tokenRequestDispatched() {
        const context = this.#context;
        if (!context)
            refuse();
        context.mayHaveChanged = true;
        context.pendingTokenRequest = true;
    }
    async touch(did, conservative = false) {
        if (this.#context)
            refuse();
        const context = {
            id: crypto.randomUUID(),
            did,
            explicit: false,
            authorization: false,
            conservative,
            mayHaveChanged: false,
            pendingTokenRequest: false,
        };
        await this.#transaction('readwrite', async (_pending, accounts) => {
            const row = await request(accounts.get(did));
            if (!row?.value || row.phase !== 'live' || row.expiresAt <= Date.now())
                refuse();
            row.phase = 'uncertain';
            row.operation = context.id;
            metadata(row);
            await request(accounts.put(row));
        });
        this.#context = context;
    }
    async #retire(client, did) {
        const row = await this.#transaction('readwrite', async (_pending, accounts) => {
            const row = await request(accounts.get(did));
            if (!row)
                return undefined;
            row.phase = 'retiring';
            delete row.operation;
            await request(accounts.put(row));
            return row;
        });
        try {
            if (row?.value) {
                const session = await this.#decode(row.value);
                const server = await client.serverFactory.fromIssuer(session.tokenSet.iss, session.authMethod, session.dpopKey);
                await server.revoke(session.tokenSet.refresh_token || session.tokenSet.access_token);
            }
        }
        catch {
            /* Local deletion never depends on remote success. */
        }
        await this.#transaction('readwrite', async (pending, accounts) => {
            const rows = await request(pending.index('did').getAll(did));
            for (const item of rows)
                await request(pending.delete(item.id));
            await request(accounts.delete(did));
        });
    }
    async prepare(client) {
        if (this.#context)
            refuse();
        const retire = await this.#transaction('readwrite', async (pending, accounts) => {
            const rows = await request(pending.getAll());
            const active = new Set();
            for (const row of rows) {
                pendingRow(row);
                if (!Number.isSafeInteger(row.expiresAt) || row.expiresAt <= Date.now() || row.consumed)
                    await request(pending.delete(row.id));
                else
                    active.add(row.did);
            }
            const sessions = await request(accounts.getAll());
            if (sessions.length > ACCOUNTS || rows.length > OAUTH_LIMITS.pending)
                refuse();
            const retiring = [];
            for (const row of sessions) {
                accountRow(row);
                if (row.phase === 'uncertain' ||
                    row.phase === 'retiring' ||
                    row.expiresAt <= Date.now() ||
                    (row.phase === 'reserved' && !active.has(row.did))) {
                    row.phase = 'retiring';
                    delete row.operation;
                    await request(accounts.put(row));
                    retiring.push(row.did);
                }
            }
            return retiring;
        });
        for (const did of retire)
            await this.#retire(client, did);
    }
    async finish(client, successful) {
        const context = this.#context;
        if (!context)
            return;
        try {
            if (context.authorization && successful)
                return;
            if (!successful) {
                if (context.authorization) {
                    await this.#transaction('readwrite', async (pending, accounts) => {
                        if (context.pending)
                            await request(pending.delete(context.pending));
                        const account = await request(accounts.get(context.did));
                        if (account?.phase === 'reserved')
                            await request(accounts.delete(context.did));
                    });
                    return;
                }
                if (context.conservative || context.mayHaveChanged) {
                    await this.#retire(client, context.did);
                    return;
                }
                // The current live operation knows no credential mutation was attempted.
                // A reopened document has no such context and still retires uncertainty.
            }
            if (successful && context.pendingTokenRequest) {
                // Maintained resource fetch can swallow a failed 401 refresh and return
                // its initial response. That cannot make an unsettled one-use token live.
                await this.#retire(client, context.did);
                return;
            }
            await this.#transaction('readwrite', async (pending, accounts) => {
                const row = await request(accounts.get(context.did));
                if (!row || row.operation !== context.id || row.phase !== 'uncertain')
                    refuse();
                if (context.pending)
                    await request(pending.delete(context.pending));
                if (!row.value)
                    await request(accounts.delete(context.did));
                else {
                    row.phase = 'live';
                    delete row.operation;
                    if (context.explicit)
                        row.expiresAt = Date.now() + CONSENT_MS;
                    metadata(row);
                    await request(accounts.put(row));
                }
            });
        }
        finally {
            this.#context = undefined;
        }
    }
    runtime() {
        return {
            createKey: (algs) => this.#keys.generate(algs, undefined, { extractable: false }),
            getRandomValues: (length) => crypto.getRandomValues(new Uint8Array(length)),
            digest: async (data, { name }) => new Uint8Array(await crypto.subtle.digest(`SHA-${name.slice(3)}`, data)),
            requestLock: (name, work) => navigator.locks.request(`atseq.oauth.sdk:${name}`, async () => work()),
        };
    }
}
//# sourceMappingURL=oauth-custody.js.map