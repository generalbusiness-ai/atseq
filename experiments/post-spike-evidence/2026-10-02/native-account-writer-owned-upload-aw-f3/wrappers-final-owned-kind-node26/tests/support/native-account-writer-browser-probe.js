import { loadBrowserOAuthAdapter } from "../../../../dist/src/browser/oauth-loader.js";
import { NativeAccountWriter } from "../../../../dist/src/transport/native-account-writer.js";
import { OAuthSessionHandle } from "../../../../dist/src/protocol/oauth.js";
import { OAUTH_DID, OAUTH_SCOPE, OAUTH_CUSTODY, oauthMetadata } from "./oauth-fixture.js";
import { WRITER_COLLECTION } from "./native-account-writer-fixture.js";
import { observeStreamByteCounts } from "./native-account-writer-byte-observation.js";
import { OAUTH_CUSTODY_DATABASE } from "../../../../dist/src/browser/oauth-custody.js";
import { nativeUploadOwnershipInput, UPLOAD_OWNERSHIP_VALID } from "./native-upload-ownership-inputs.js";
let adapter;
let handle;
let writer;
export async function create() {
    adapter = await loadBrowserOAuthAdapter({
        metadata: oauthMetadata,
        resolveIdentity: async (identifier, { fetch, signal }) => {
            const response = await fetch('https://identity.atseq-probe.net/' + encodeURIComponent(identifier), { signal });
            const { did } = await response.json();
            return {
                did,
                handle: 'handle.invalid',
                didDoc: {
                    id: did,
                    service: [
                        { id: '#atproto_pds', type: 'AtprotoPersonalDataServer', serviceEndpoint: 'https://pds.atseq-probe.net' },
                    ],
                },
            };
        },
        custodyOrigin: OAUTH_CUSTODY,
        publisherOrigin: 'https://publisher.atseq-probe.net',
        applicationOrigin: 'https://application.atseq-probe.net',
    });
}
export const begin = () => adapter.begin(OAUTH_DID, OAUTH_SCOPE);
export async function complete(params) {
    handle = await adapter.complete(new URLSearchParams(params));
    writer = await NativeAccountWriter.open(handle, OAUTH_DID);
    return { did: writer.did, frozen: Object.isFrozen(writer), serialized: JSON.stringify(writer) };
}
export async function restore() {
    handle = await adapter.restore(OAUTH_DID, OAUTH_SCOPE);
    writer = await NativeAccountWriter.open(handle, OAUTH_DID);
    return writer.did;
}
export const get = () => writer.get(WRITER_COLLECTION, 'first');
export const list = (cursor) => writer.list(WRITER_COLLECTION, { cursor });
export const latest = () => writer.latestCommit();
export const upload = (size, cancel = false) => {
    const bytes = new Uint8Array(size).fill(17);
    const pending = writer.upload(bytes, 'application/octet-stream', {
        signal: cancel ? AbortSignal.abort() : undefined,
    });
    bytes.fill(23);
    return pending;
};
export function uploadOwnership(name) {
    const { input } = nativeUploadOwnershipInput(name);
    const pending = writer.upload(input);
    if (UPLOAD_OWNERSHIP_VALID.includes(name))
        Uint8Array.prototype.fill.call(input, 23);
    return pending;
}
export async function uploadCrossRealm() {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const foreign = new frame.contentWindow.Uint8Array(17);
    try {
        return await writer.upload(foreign);
    }
    finally {
        frame.remove();
    }
}
export const apply = (swapCommit) => {
    const writes = [
        {
            $type: 'com.atproto.repo.applyWrites#create',
            collection: WRITER_COLLECTION,
            rkey: 'browser',
            value: { text: 'before' },
        },
    ];
    const pending = writer.applyConditional(writes, swapCommit);
    writes[0].value.text = 'after';
    return pending;
};
export const ordinary = (size) => handle
    .request('/xrpc/ai.generalbusiness.atseq.synthetic', { method: 'POST', body: new Uint8Array(size) })
    .then((response) => response.status);
export const mutate = () => {
    handle.info = handle.request = (() => {
        throw new Error('Caller method must not execute');
    });
    return writer.latestCommit();
};
export async function forgeries() {
    let refused = 0;
    for (const fake of [
        {},
        Object.create(OAuthSessionHandle.prototype),
        structuredClone(handle),
        new OAuthSessionHandle({}, {}, {}),
    ]) {
        try {
            await NativeAccountWriter.open(fake, OAUTH_DID);
        }
        catch {
            refused++;
        }
    }
    return refused;
}
export async function failure(method, commit) {
    try {
        if (method === 'upload')
            await writer.upload(new Uint8Array(524288));
        else if (method === 'get')
            await writer.get(WRITER_COLLECTION, 'first');
        else if (method === 'list')
            await writer.list(WRITER_COLLECTION);
        else if (method === 'latest')
            await writer.latestCommit();
        else if (method === 'apply')
            await writer.applyConditional([], commit);
        else
            throw new Error('Unknown test operation');
        throw new Error('Expected bounded test refusal');
    }
    catch (error) {
        return { code: error.code, kind: error.kind ?? null, status: error.status ?? null, message: error.message };
    }
}
/** Inspect only custody metadata/counts; never return a credential or key. */
export async function custodyStatus() {
    const database = await new Promise((resolve, reject) => {
        const opening = indexedDB.open(OAUTH_CUSTODY_DATABASE, 1);
        opening.onsuccess = () => resolve(opening.result);
        opening.onerror = () => reject(opening.error);
    });
    try {
        const row = await new Promise((resolve, reject) => {
            const reading = database.transaction('accounts', 'readonly').objectStore('accounts').get(OAUTH_DID);
            reading.onsuccess = () => resolve(reading.result);
            reading.onerror = () => reject(reading.error);
        });
        const metadata = JSON.stringify(row, (name, value) => name === 'keyPair' && value?.privateKey instanceof CryptoKey && value?.publicKey instanceof CryptoKey
            ? undefined
            : value);
        return { phase: row?.phase ?? null, metadataBytes: metadata ? new TextEncoder().encode(metadata).length : 0 };
    }
    finally {
        database.close();
    }
}
let stopObservation;
export function startByteObservation() {
    stopObservation = observeStreamByteCounts();
}
export function stopByteObservation() {
    if (!stopObservation)
        throw new Error('No active byte observation');
    const stop = stopObservation;
    stopObservation = undefined;
    return stop();
}
