import { P256PrivateKeyExportable } from '@atcute/crypto';
import vectors from '../vectors/native-foundation.json' with { type: 'json' };
import { signNativeIntent, readNativeValue } from '../../src/protocol/native-wire.ts';
import { NATIVE_NSID, nativeRef } from '../../src/protocol/native-schema.ts';
import { contentCid, encodeBlock, link, bytes } from '../../src/protocol/wire.ts';

/** Genuine signature and accepted native framing; placeholder roots are not authority proofs. */
export async function largeNativeBatch() {
  const signer = await P256PrivateKeyExportable.createKeypair();
  const intent: any = structuredClone(vectors.blocks.signed.value.intent);
  intent.actorKey = await signer.exportPublicKey('did');
  // Replace null with an empty JSON string, then fill the exact adopted action cap.
  intent.operation.payload.note = '';
  const empty = new TextEncoder().encode(JSON.stringify(intent.operation.payload)).length;
  intent.operation.payload.note = 'x'.repeat(32768 - empty);
  const request = await signNativeIntent(intent, signer);
  const entry = await readNativeValue(NATIVE_NSID.entry, { ...structuredClone(vectors.blocks.entry.value), request });
  const raw = encodeBlock(entry);
  if (raw.length < 32000 || raw.length > 65536) throw new Error('Large entry framing boundary changed');
  const head = await readNativeValue(NATIVE_NSID.head, {
    ...structuredClone(vectors.blocks.head.value),
    entry: link(await contentCid(entry)),
  });
  const chunk = await readNativeValue(NATIVE_NSID.content, {
    $type: NATIVE_NSID.content,
    version: 1,
    body: { $type: nativeRef('byteChunk'), bytes: bytes(new Uint8Array(32768).fill(17)) },
  });
  return {
    payloadBytes: new TextEncoder().encode(JSON.stringify(intent.operation.payload)).length,
    entryBytes: raw.length,
    entryHeadWrites: [
      { $type: 'com.atproto.repo.applyWrites#create', collection: NATIVE_NSID.entry, rkey: 'near-cap', value: entry },
      { $type: 'com.atproto.repo.applyWrites#update', collection: NATIVE_NSID.head, rkey: 'near-cap', value: head },
    ],
    chunkWrite: {
      $type: 'com.atproto.repo.applyWrites#create',
      collection: NATIVE_NSID.content,
      rkey: 'transport-chunk',
      value: chunk,
    },
  };
}
