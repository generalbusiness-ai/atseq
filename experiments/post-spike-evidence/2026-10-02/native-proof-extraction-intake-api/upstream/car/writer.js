import * as CBOR from '@atcute/cbor';
import { allocUnsafe } from '@atcute/uint8array';
import * as varint from '@atcute/varint';
/**
 * serializes a CAR v1 header
 *
 * @param roots array of root CIDs (typically just one)
 * @returns the serialized header bytes
 * @internal
 */
export const serializeCarHeader = (roots) => {
    const headerData = CBOR.encode({
        version: 1,
        roots: roots,
    });
    const prefixSize = varint.encodingLength(headerData.length);
    const result = allocUnsafe(prefixSize + headerData.length);
    varint.encode(headerData.length, result, 0);
    result.set(headerData, prefixSize);
    return result;
};
/**
 * serializes a single CAR entry (block)
 *
 * @param cid the CID of the block (as bytes)
 * @param data the block data
 * @returns the serialized entry bytes
 * @internal
 */
export const serializeCarEntry = (cid, data) => {
    const entrySize = cid.length + data.length;
    const prefixSize = varint.encodingLength(entrySize);
    const result = allocUnsafe(prefixSize + entrySize);
    varint.encode(entrySize, result, 0);
    result.set(cid, prefixSize);
    result.set(data, prefixSize + cid.length);
    return result;
};
/**
 * creates an async generator that yields CAR file chunks
 *
 * @example
 * 	const blocks = async function* () {
 * 		yield { cid: commitCid.bytes, data: commitBytes };
 * 		yield { cid: nodeCid.bytes, data: nodeBytes };
 * 	};
 *
 * 	// Stream chunks
 * 	for await (const chunk of writeCarStream([rootCid], blocks())) {
 * 		stream.write(chunk);
 * 	}
 *
 * 	// Or collect into array (requires Array.fromAsync or polyfill)
 * 	const chunks = await Array.fromAsync(writeCarStream([rootCid], blocks()));
 *
 * @param root root CIDs for the CAR file
 * @param blocks async iterable of blocks to write
 * @yields Uint8Array chunks of the CAR file (header, then entries)
 */
export async function* writeCarStream(roots, blocks) {
    // Emit header first
    yield serializeCarHeader(roots);
    // Then emit each block entry
    for await (const block of blocks) {
        yield serializeCarEntry(block.cid, block.data);
    }
}
