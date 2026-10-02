import { nativeApplicationFixture } from "./native-application-fixture.js";
import { NativeAnchor, nativeHeadAt, readNativeValue, nativeEntryPath, nativeHeadPath, } from "../../../aw-f3/installed-consumer-final/node_modules/atseq/dist/src/protocol/native-wire.js";
import { NATIVE_NSID, nativeRef } from "../../../aw-f3/installed-consumer-final/node_modules/atseq/dist/src/protocol/native-schema.js";
import { contentCid, encodeBlock, bytes } from "../../../aw-f3/installed-consumer-final/node_modules/atseq/dist/src/protocol/wire.js";
/** Actual fixture entries have passed source admission, identity/repository proofs, authority and evaluator oracles. */
export async function largeNativeBatch() {
    const fixture = await nativeApplicationFixture();
    const effective = fixture.vectors.filter((vector) => vector.expected.outcomes.at(-1)?.outcome.decision === 'effective');
    if (!effective.length)
        throw new Error('No genuine effective native fixture entries');
    const selected = effective.reduce((largest, vector) => encodeBlock(vector.entry).length > encodeBlock(largest.entry).length ? vector : largest);
    const entry = (await readNativeValue(NATIVE_NSID.entry, selected.entry));
    const anchor = await NativeAnchor.from(fixture.genesis, { app: fixture.genesis.app, genesis: fixture.genesisCid });
    const head = await nativeHeadAt(anchor, entry.position, await contentCid(entry));
    const chunks = await Promise.all([17, 18].map((value) => readNativeValue(NATIVE_NSID.content, {
        $type: NATIVE_NSID.content,
        version: 1,
        body: { $type: nativeRef('byteChunk'), bytes: bytes(new Uint8Array(32768).fill(value)) },
    })));
    const operation = entry.request.intent?.operation;
    return {
        app: fixture.genesis.app,
        vector: selected.name,
        payloadBytes: operation?.payload === undefined ? 0 : new TextEncoder().encode(JSON.stringify(operation.payload)).length,
        entryBytes: encodeBlock(entry).length,
        entryHeadWrites: [
            {
                $type: 'com.atproto.repo.applyWrites#create',
                collection: NATIVE_NSID.entry,
                rkey: nativeEntryPath(fixture.genesisCid, entry.position).split('/')[1],
                value: entry,
            },
            {
                $type: 'com.atproto.repo.applyWrites#update',
                collection: NATIVE_NSID.head,
                rkey: nativeHeadPath(fixture.genesisCid).split('/')[1],
                value: head,
            },
        ],
        // Separate valid native content primitives for transport batching. These
        // chunks do not claim to be the selected application's source closure.
        chunkWrites: await Promise.all(chunks.map(async (chunk) => ({
            $type: 'com.atproto.repo.applyWrites#create',
            collection: NATIVE_NSID.content,
            rkey: await contentCid(chunk),
            value: chunk,
        }))),
    };
}
