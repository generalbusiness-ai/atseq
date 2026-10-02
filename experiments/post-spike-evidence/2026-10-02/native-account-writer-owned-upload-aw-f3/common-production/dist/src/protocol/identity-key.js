import { getPublicKeyFromDidController, parseDidKey } from '@atcute/crypto';
import { fromBase58Btc, toBase58Btc } from '@atcute/multibase';
import { AtseqError } from '../core/errors.js';
import { normalizeRepoSigningKey } from './native-proof.js';
import { identityInput, identityObject } from './identity-json.js';
/** Known key-input failures only; genuine runtime/integrity faults retain identity. */
function keyFailure(error) {
    if (error instanceof AtseqError)
        throw error;
    if (error instanceof DOMException && error.name === 'DataError')
        identityInput('Invalid identity curve point');
    if (error instanceof Error &&
        ((error.constructor === Error && /^(bad point: not on curve|sqrt invalid)$/.test(error.message)) ||
            (error.constructor === TypeError &&
                /^(invalid curve point|unsupported key type \(0x[0-9a-f]+\)|unsupported controller type \(.+\))$/.test(error.message)) ||
            (error.constructor === SyntaxError &&
                /^(not a did:key|not a multibase base58btc string|multikey too short)$/.test(error.message))))
        identityInput('Invalid identity signing key');
    throw error;
}
function multibase(value) {
    if (typeof value !== 'string' || value.length > 128 || !/^z[1-9A-HJ-NP-Za-km-z]+$/.test(value))
        identityInput('Expected bounded base58btc identity key');
    const bytes = fromBase58Btc(value.slice(1));
    if (`z${toBase58Btc(bytes)}` !== value)
        identityInput('Noncanonical identity multibase');
    return value;
}
export async function normalizeIdentityDidKey(value) {
    if (typeof value !== 'string' || !value.startsWith('did:key:'))
        identityInput('Expected identity did:key');
    multibase(value.slice(8));
    try {
        return await normalizeRepoSigningKey(parseDidKey(value));
    }
    catch (error) {
        keyFailure(error);
    }
}
export async function normalizeIdentityController(value) {
    if (!identityObject(value) ||
        typeof value.type !== 'string' ||
        !['Multikey', 'EcdsaSecp256r1VerificationKey2019', 'EcdsaSecp256k1VerificationKey2019'].includes(value.type))
        identityInput('Unsupported identity key controller');
    const publicKeyMultibase = multibase(value.publicKeyMultibase);
    try {
        return await normalizeRepoSigningKey(getPublicKeyFromDidController({
            type: value.type,
            publicKeyMultibase,
        }));
    }
    catch (error) {
        keyFailure(error);
    }
}
export function identityPdsOrigin(value) {
    if (typeof value !== 'string' || value.length > 2048)
        identityInput('Expected bounded identity PDS endpoint');
    let url;
    try {
        url = new URL(value);
    }
    catch (error) {
        if (error instanceof TypeError)
            identityInput('Invalid identity PDS endpoint');
        throw error;
    }
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash)
        identityInput('Identity PDS endpoint must be an HTTPS origin');
    return url.origin;
}
//# sourceMappingURL=identity-key.js.map