import { NSID } from '../core/nsids.js';
import { P256PrivateKeyExportable } from '@atcute/crypto';
import { randomNonce, signIntent } from '../protocol/log.js';
import { contentCid, encodeBlock, link } from '../protocol/wire.js';
export async function createIdentity(name) {
    if (!name.trim() || name.length > 80)
        throw new Error('Enter a display name of 1–80 characters');
    const key = await P256PrivateKeyExportable.createKeypair();
    return {
        name: name.trim(),
        publicKey: await key.exportPublicKey('did'),
        privateKey: [...(await key.exportPrivateKey('raw'))],
    };
}
export async function prepareIntent(identity, invitation, definition, action, payload) {
    const key = await P256PrivateKeyExportable.importRaw(new Uint8Array(identity.privateKey));
    const intent = {
        $type: NSID.defsIntent,
        version: 1,
        ...invitation,
        genesis: link(invitation.genesis),
        definition: link(definition),
        actorKey: identity.publicKey,
        nonce: randomNonce(),
        action,
        payload,
    };
    const signed = await signIntent(intent, key);
    return { cid: await contentCid(intent), block: [...encodeBlock(signed)], signed };
}
//# sourceMappingURL=identity.js.map