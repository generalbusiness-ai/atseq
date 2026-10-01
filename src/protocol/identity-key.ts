import { getPublicKeyFromDidController, parseDidKey, type DidKeyString } from '@atcute/crypto';
import { fromBase58Btc, toBase58Btc } from '@atcute/multibase';
import { AtseqError } from '../core/errors.ts';
import { normalizeRepoSigningKey } from './native-proof.ts';
import { identityInput, identityObject } from './identity-json.ts';

/** Known key-input failures only; genuine runtime/integrity faults retain identity. */
function keyFailure(error: unknown): never {
  if (error instanceof AtseqError) throw error;
  if (error instanceof DOMException && error.name === 'DataError') identityInput('Invalid identity curve point');
  if (
    error instanceof Error &&
    ((error.constructor === Error && /^(bad point: not on curve|sqrt invalid)$/.test(error.message)) ||
      (error.constructor === TypeError &&
        /^(invalid curve point|unsupported key type \(0x[0-9a-f]+\)|unsupported controller type \(.+\))$/.test(
          error.message,
        )) ||
      (error.constructor === SyntaxError &&
        /^(not a did:key|not a multibase base58btc string|multikey too short)$/.test(error.message)))
  )
    identityInput('Invalid identity signing key');
  throw error;
}
function multibase(value: unknown): string {
  if (typeof value !== 'string' || value.length > 128 || !/^z[1-9A-HJ-NP-Za-km-z]+$/.test(value))
    identityInput('Expected bounded base58btc identity key');
  const bytes = fromBase58Btc(value.slice(1));
  if (`z${toBase58Btc(bytes)}` !== value) identityInput('Noncanonical identity multibase');
  return value;
}
export async function normalizeIdentityDidKey(value: unknown): Promise<DidKeyString> {
  if (typeof value !== 'string' || !value.startsWith('did:key:')) identityInput('Expected identity did:key');
  multibase(value.slice(8));
  try {
    return await normalizeRepoSigningKey(parseDidKey(value as DidKeyString));
  } catch (error) {
    keyFailure(error);
  }
}
export async function normalizeIdentityController(value: unknown): Promise<DidKeyString> {
  if (
    !identityObject(value) ||
    typeof value.type !== 'string' ||
    !['Multikey', 'EcdsaSecp256r1VerificationKey2019', 'EcdsaSecp256k1VerificationKey2019'].includes(value.type)
  )
    identityInput('Unsupported identity key controller');
  const publicKeyMultibase = multibase(value.publicKeyMultibase);
  try {
    return await normalizeRepoSigningKey(
      getPublicKeyFromDidController({
        type: value.type,
        publicKeyMultibase,
      }),
    );
  } catch (error) {
    keyFailure(error);
  }
}
export function identityPdsOrigin(value: unknown): string {
  if (typeof value !== 'string' || value.length > 2048) identityInput('Expected bounded identity PDS endpoint');
  let url: URL;
  try {
    url = new URL(value);
  } catch (error) {
    if (error instanceof TypeError) identityInput('Invalid identity PDS endpoint');
    throw error;
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash)
    identityInput('Identity PDS endpoint must be an HTTPS origin');
  return url.origin;
}
