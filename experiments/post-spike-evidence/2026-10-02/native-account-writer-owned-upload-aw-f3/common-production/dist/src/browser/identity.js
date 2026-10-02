import { P256PrivateKey, P256PublicKey } from '@atcute/crypto';
import { NSID } from '../core/nsids.js';
import { randomNonce, signIntent } from '../protocol/log.js';
import { contentCid, encodeBlock, link } from '../protocol/wire.js';
export async function createDeviceIdentity(name) {
    if (!name.trim() || name.length > 80)
        throw new Error('Enter a display name of 1–80 characters');
    const keys = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);
    const signer = await P256PublicKey.importCryptoKey(keys.publicKey);
    return { name: name.trim(), publicKey: await signer.exportPublicKey('did'), keys };
}
export async function deviceIdentity(store) {
    const retained = await store.get('identity');
    if (retained?.keys?.privateKey instanceof CryptoKey && !retained.keys.privateKey.extractable)
        return retained;
    // Preserve a pre-v1 device's signing identity while dropping exportable raw bytes.
    const legacy = retained;
    if (!legacy?.privateKey)
        return undefined;
    const signer = await P256PrivateKey.importRaw(new Uint8Array(legacy.privateKey));
    const publicJwk = await signer.exportPublicKey('jwk');
    // WebCrypto imports scalar and public coordinates together as a non-extractable key.
    const toBase64 = (bytes) => btoa(String.fromCharCode(...bytes))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    const privateKey = await crypto.subtle.importKey('jwk', { ...publicJwk, d: toBase64(legacy.privateKey), key_ops: ['sign'] }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
    const publicKey = await crypto.subtle.importKey('jwk', publicJwk, { name: 'ECDSA', namedCurve: 'P-256' }, true, [
        'verify',
    ]);
    const migrated = { name: legacy.name, publicKey: legacy.publicKey, keys: { privateKey, publicKey } };
    return store.update('identity', (previous) => (previous?.keys ? previous : migrated));
}
export async function prepareDeviceIntent(identity, invitation, definition, action, payload) {
    if (identity.keys.privateKey.extractable)
        throw new Error('Device signing key must be non-extractable');
    const publicPart = await P256PublicKey.importCryptoKey(identity.keys.publicKey);
    if ((await publicPart.exportPublicKey('did')) !== identity.publicKey)
        throw new Error('Device public key differs from its identity');
    const signer = {
        type: publicPart.type,
        jwtAlg: publicPart.jwtAlg,
        exportPublicKey: publicPart.exportPublicKey.bind(publicPart),
        verify: publicPart.verify.bind(publicPart),
        sign: async (data) => {
            const signature = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, identity.keys.privateKey, new Uint8Array(data)));
            // atproto requires a 64-byte, low-S P-256 signature (IEEE P1363).
            if (signature.length !== 64)
                throw new Error('Unexpected device signature encoding');
            const order = 0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n;
            let scalar = 0n;
            for (const byte of signature.subarray(32))
                scalar = scalar * 256n + BigInt(byte);
            if (scalar > order / 2n) {
                scalar = order - scalar;
                for (let index = 63; index >= 32; index--) {
                    signature[index] = Number(scalar & 255n);
                    scalar >>= 8n;
                }
            }
            return signature;
        },
    };
    const intent = {
        $type: NSID.defsIntent,
        version: 1,
        app: invitation.app,
        genesis: link(invitation.genesis),
        definition: link(definition),
        actorKey: identity.publicKey,
        nonce: randomNonce(),
        action,
        payload,
    };
    const signed = await signIntent(intent, signer);
    return { cid: await contentCid(intent), block: [...encodeBlock(signed)], signed };
}
//# sourceMappingURL=identity.js.map