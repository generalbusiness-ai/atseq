import { P256PrivateKeyExportable } from '@atcute/crypto';
import vectors from '../vectors/native-foundation.json' with { type: 'json' };
import { signNativeIntent, readNativeValue } from '../../src/protocol/native-wire.ts';
import { NATIVE_NSID } from '../../src/protocol/native-schema.ts';
import { contentCid, encodeBlock, link } from '../../src/protocol/wire.ts';

/** Genuine signature and accepted native framing; placeholder roots are not authority proofs. */
export async function nearCapNativeBatch() {
  const signer = await P256PrivateKeyExportable.createKeypair();
  const intent: any = structuredClone(vectors.blocks.signed.value.intent);
  intent.actorKey = await signer.exportPublicKey('did');
  intent.operation.payload.note = 'x'.repeat(64200);
  const request = await signNativeIntent(intent, signer);
  const entry = await readNativeValue(NATIVE_NSID.entry, { ...structuredClone(vectors.blocks.entry.value), request });
  const raw = encodeBlock(entry);
  if (raw.length < 64000 || raw.length > 65536) throw new Error('Near-cap entry framing boundary changed');
  const head = await readNativeValue(NATIVE_NSID.head, { ...structuredClone(vectors.blocks.head.value), entry: link(await contentCid(entry)) });
  return {
    entryBytes: raw.length,
    writes: [
      { $type: 'com.atproto.repo.applyWrites#create', collection: NATIVE_NSID.entry, rkey: 'near-cap', value: entry },
      { $type: 'com.atproto.repo.applyWrites#update', collection: NATIVE_NSID.head, rkey: 'near-cap', value: head },
    ],
  };
}
