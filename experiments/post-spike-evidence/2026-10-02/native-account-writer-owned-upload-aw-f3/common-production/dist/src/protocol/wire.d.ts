import { type Bytes, type CidLink } from '@atcute/cbor';
import { type Json } from '../core/values.ts';
export declare const WIRE: Readonly<{
    version: 1;
    blockBytes: number;
    jsonBytes: number;
    depth: 32;
}>;
export { ProtocolError } from '../core/errors.ts';
export declare function sameBytes(a: Uint8Array, b: Uint8Array): boolean;
export declare function isCidInputError(error: unknown): error is Error;
export declare function link(cid: string): CidLink;
export declare function bytes(raw: Uint8Array): Bytes;
export declare function encodeBlock(value: unknown): Uint8Array<ArrayBuffer>;
/** Inspect only CBOR framing and text bytes; the decoder still checks canonicality. */
export declare function validateCborFraming(raw: Uint8Array, maxDepth?: number): void;
/** These messages come from the pinned @atcute/cbor decoder and its CID reader. */
export declare function isCborInputError(error: unknown): error is Error;
/** Preserve the exact canonical block; a decode/re-encode equality check is mandatory. */
export declare function decodeBlock(raw: Uint8Array): Json;
export declare function blockCid(raw: Uint8Array): Promise<string>;
export declare function contentCid(value: unknown): Promise<string>;
//# sourceMappingURL=wire.d.ts.map