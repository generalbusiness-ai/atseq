import { P256PrivateKeyExportable } from '@atcute/crypto';
import { randomNonce, signIntent, type Intent } from '../protocol/log.ts';
import { contentCid, encodeBlock, link } from '../protocol/wire.ts';
import type { Json } from '../runtime/values.ts';

export interface Identity { name: string; publicKey: string; privateKey: number[] }
export async function createIdentity(name: string): Promise<Identity> {
  if (!name.trim() || name.length > 80) throw new Error('Enter a display name of 1–80 characters');
  const key = await P256PrivateKeyExportable.createKeypair();
  return { name: name.trim(), publicKey: await key.exportPublicKey('did'), privateKey: [...await key.exportPrivateKey('raw')] };
}
export interface Invitation { app: string; genesis: string }
export async function prepareIntent(identity: Identity, invitation: Invitation, definition: string, action: string, payload: Record<string, Json>) {
  const key = await P256PrivateKeyExportable.importRaw(new Uint8Array(identity.privateKey));
  const intent: Intent = { $type: 'test.atseq.defs#intent', version: 0, ...invitation, genesis: link(invitation.genesis), definition: link(definition), actorKey: identity.publicKey, nonce: randomNonce(), action, payload };
  const signed = await signIntent(intent, key);
  return { cid: await contentCid(intent), block: [...encodeBlock(signed)], signed };
}
