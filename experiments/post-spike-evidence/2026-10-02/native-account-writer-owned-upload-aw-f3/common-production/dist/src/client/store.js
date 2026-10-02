/** Device data only. Application views never receive this capability. */
export class DeviceStore {
    db;
    constructor(db) {
        this.db = db;
    }
    static async open(name = 'atseq-device-v0') {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(name, 1);
            request.onupgradeneeded = () => request.result.createObjectStore('values');
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(new DeviceStore(request.result));
        });
    }
    async get(key) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction('values').objectStore('values').get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    update(key, change) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('values', 'readwrite', { durability: 'strict' }), store = tx.objectStore('values'), request = store.get(key);
            let next;
            request.onsuccess = () => {
                try {
                    next = change(request.result);
                    store.put(next, key);
                }
                catch (error) {
                    tx.abort();
                    reject(error);
                }
            };
            tx.oncomplete = () => resolve(next);
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error ?? new Error('Device update aborted'));
        });
    }
    set(key, value) {
        return this.update(key, () => value);
    }
    enqueue(app, cid, value) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('values', 'readwrite', { durability: 'strict' }), store = tx.objectStore('values');
            const prefix = `outbox:${app}:`, orderKey = `outbox-order:${app}`, counter = store.get(orderKey);
            let next, count = 0;
            const fail = (error) => {
                tx.abort();
                reject(error);
            };
            counter.onsuccess = () => {
                const order = (counter.result ?? 0) + 1;
                if (!Number.isSafeInteger(order) || value.status !== 'queued') {
                    fail(new Error('Invalid local outbox order or state'));
                    return;
                }
                const scan = store.openCursor(IDBKeyRange.bound(prefix, prefix + '\uffff'));
                scan.onsuccess = () => {
                    const cursor = scan.result;
                    if (cursor) {
                        if (['queued', 'recorded'].includes(cursor.value.status))
                            count++;
                        cursor.continue();
                        return;
                    }
                    if (count >= 100) {
                        fail(new Error('This device already has 100 waiting actions for this app'));
                        return;
                    }
                    next = { ...value, order };
                    store.add(next, prefix + cid);
                    store.put(order, orderKey);
                };
            };
            tx.oncomplete = () => resolve(next);
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error ?? new Error('Outbox admission aborted'));
        });
    }
    async list(prefix) {
        return new Promise((resolve, reject) => {
            const request = this.db
                .transaction('values')
                .objectStore('values')
                .openCursor(IDBKeyRange.bound(prefix, prefix + '\uffff', false, false)), result = [];
            request.onsuccess = () => {
                const cursor = request.result;
                if (!cursor) {
                    if (prefix.startsWith('outbox:'))
                        result.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                    resolve(result);
                    return;
                }
                if (String(cursor.key).startsWith(prefix))
                    result.push(cursor.value);
                cursor.continue();
            };
            request.onerror = () => reject(request.error);
        });
    }
    delete(key) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('values', 'readwrite', { durability: 'strict' });
            tx.objectStore('values').delete(key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error ?? new Error('Device deletion aborted'));
        });
    }
    close() {
        this.db.close();
    }
}
export async function saveDraft(store, draft, expectedRevision) {
    return store.update(`draft:${draft.id}`, (previous) => {
        if (previous?.revision !== expectedRevision)
            throw new Error('This draft changed in another tab. Reload it before editing.');
        if (previous?.activationKeys)
            throw new Error('This draft has begun publication. Keep its source unchanged and retry, or import a new draft.');
        return { ...draft, revision: (expectedRevision ?? 0) + 1 };
    });
}
//# sourceMappingURL=store.js.map