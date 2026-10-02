export { runPublicHookCases, persistentSession } from './public-hooks.mjs';
export async function expiryIndexPremise() {
  const db = await new Promise((resolve, reject) => {
    const open = indexedDB.open('atseq-expiry-index-premise', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('rows').createIndex('expiresAt', 'expiresAt');
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(new Error('expiry-premise-open-failed'));
  });
  const tx = db.transaction('rows', 'readwrite');
  tx.objectStore('rows').put({ expiresAt: new Date(Date.now() - 60_000).toISOString() }, 'expired-iso');
  await new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onabort = () => reject(new Error('expiry-premise-write-failed'));
  });
  const count = (bound) =>
    new Promise((resolve, reject) => {
      const request = db
        .transaction('rows')
        .objectStore('rows')
        .index('expiresAt')
        .count(IDBKeyRange.upperBound(bound));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('expiry-premise-read-failed'));
    });
  const numericMatches = await count(Date.now());
  const isoMatches = await count(new Date().toISOString());
  db.close();
  if (numericMatches !== 0 || isoMatches !== 1) throw new Error('expiry-index-premise-differs');
  return {
    expiredIsoRows: 1,
    numericUpperBoundMatches: numericMatches,
    isoUpperBoundMatches: isoMatches,
    SDKPrivateDatabaseAccess: false,
  };
}
