/** Device data only. Application views never receive this capability. */
export class DeviceStore {
  private constructor(private readonly db: IDBDatabase) {}
  static async open(name = 'atseq-device-v0'): Promise<DeviceStore> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name, 1);
      request.onupgradeneeded = () => request.result.createObjectStore('values');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(new DeviceStore(request.result));
    });
  }
  async get<T>(key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => { const request = this.db.transaction('values').objectStore('values').get(key); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
  }
  update<T>(key: string, change: (previous: T | undefined) => T): Promise<T> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('values', 'readwrite', { durability: 'strict' }), store = tx.objectStore('values'), request = store.get(key); let next: T;
      request.onsuccess = () => { try { next = change(request.result); store.put(next, key); } catch (error) { tx.abort(); reject(error); } };
      tx.oncomplete = () => resolve(next); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error ?? new Error('Device update aborted'));
    });
  }
  set<T>(key: string, value: T) { return this.update<T>(key, () => value); }
  async list<T>(prefix: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const request = this.db.transaction('values').objectStore('values').openCursor(), result: T[] = [];
      request.onsuccess = () => { const cursor = request.result; if (!cursor) { resolve(result); return; } if (String(cursor.key).startsWith(prefix)) result.push(cursor.value); cursor.continue(); };
      request.onerror = () => reject(request.error);
    });
  }
  close() { this.db.close(); }
}
export interface Draft { id: string; revision: number; source: number[]; creationId: string; activationKeys?: string[]; published?: { app: string; genesis: string } }
export async function saveDraft(store: DeviceStore, draft: Draft, expectedRevision: number | undefined) {
  return store.update<Draft>(`draft:${draft.id}`, previous => {
    if (previous?.revision !== expectedRevision) throw new Error('This draft changed in another tab. Reload it before editing.');
    if (previous?.activationKeys) throw new Error('This draft has begun publication. Keep its source unchanged and retry, or import a new draft.');
    return { ...draft, revision: (expectedRevision ?? 0) + 1 };
  });
}
