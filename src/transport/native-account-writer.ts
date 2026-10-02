import { AtUri, isValidAtUri, isValidNsid, isValidRecordKey } from '@atproto/syntax';
import { fromString, toString, CODEC_RAW } from '@atcute/cid';
import { AtseqError } from '../core/errors.ts';
import { validateNativeAccountDid } from '../protocol/native-schema.ts';
import { link } from '../protocol/wire.ts';
import { ownedOAuthSession, type OAuthSessionHandle, type OwnedOAuthSession } from '../protocol/oauth.ts';
import { PdsError, PdsOperations } from './pds-operations.ts';

interface CallOptions {
  readonly signal?: AbortSignal;
}
export interface NativeAccountRecord {
  readonly uri: string;
  readonly cid: string;
  readonly value: unknown;
}
const mint = Object.freeze({});
const utf8 = new TextEncoder();
const byteLength = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Uint8Array.prototype), 'byteLength')!.get!;
const byteKind = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Uint8Array.prototype), Symbol.toStringTag)!.get!;
function ownUpload(content: Uint8Array): Uint8Array {
  if (!(content instanceof Uint8Array) || byteKind.call(content) !== 'Uint8Array') input('Invalid account blob input');
  let size: number;
  try {
    size = byteLength.call(content);
  } catch {
    input('Invalid account blob input');
  }
  if (size > 1024 * 1024) input('Account blob exceeds byte limit');
  // A base typed-array constructor copies intrinsic storage without consulting
  // caller length/byteLength, methods, iterator, constructor or species.
  try {
    return new Uint8Array(content);
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    input('Invalid account blob input');
  }
}
function input(message: string): never {
  throw new AtseqError('input', message);
}
function mime(value: unknown): value is string {
  return (
    typeof value === 'string' && value.length <= 256 && /^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/.test(value)
  );
}
function collection(value: string): void {
  if (typeof value !== 'string' || !isValidNsid(value)) input('Invalid account collection');
}
function key(value: string): void {
  if (typeof value !== 'string' || !isValidRecordKey(value)) input('Invalid account record key');
}
function cursor(value: unknown, remote = false): void {
  if (value !== undefined && (typeof value !== 'string' || !value || utf8.encode(value).length > 8192)) {
    if (remote) throw new PdsError(502, 'InvalidPage');
    input('Invalid account page cursor');
  }
}
function cid(value: unknown): void {
  if (typeof value !== 'string' || !value || value.length > 128) throw new PdsError(502, 'InvalidResponse');
  try {
    link(value);
  } catch {
    throw new PdsError(502, 'InvalidResponse');
  }
}
function commit(value: any): void {
  cid(value?.cid);
  if (typeof value?.rev !== 'string' || !value.rev || utf8.encode(value.rev).length > 8192)
    throw new PdsError(502, 'InvalidCommit');
}
function blobCid(value: unknown): void {
  try {
    if (typeof value !== 'string' || value.length > 128) throw new Error();
    const parsed = fromString(value);
    if (parsed.codec !== CODEC_RAW || toString(parsed) !== value) throw new Error();
  } catch {
    throw new PdsError(502, 'InvalidResponse');
  }
}

/** Internal standard account access only. Replies provide neither app permission nor proof. */
export class NativeAccountWriter {
  readonly #did: string;
  readonly #owned: OwnedOAuthSession;
  private constructor(token: object, did: string, owned: OwnedOAuthSession) {
    if (token !== mint) input('Native account writer requires an owned OAuth session');
    this.#did = did;
    this.#owned = owned;
    Object.freeze(this);
  }
  static async open(handle: OAuthSessionHandle, expectedDid: string): Promise<NativeAccountWriter> {
    try {
      validateNativeAccountDid(expectedDid);
    } catch {
      input('Invalid native account DID');
    }
    const owned = ownedOAuthSession(handle);
    if (owned.did !== expectedDid) input('OAuth account differs from expected native account');
    if ((await owned.info()).did !== expectedDid) input('OAuth account differs from expected native account');
    return new NativeAccountWriter(mint, expectedDid, owned);
  }
  get did(): string {
    return this.#did;
  }
  #operations(signal?: AbortSignal): PdsOperations {
    return new PdsOperations(
      (method, init, params) => {
        if (method === 'com.atproto.repo.applyWrites') {
          if (typeof init.body !== 'string') input('Invalid conditional account body');
          return this.#owned.apply(utf8.encode(init.body), signal);
        }
        if (method === 'com.atproto.repo.uploadBlob') {
          if (!(init.body instanceof Uint8Array)) input('Invalid account blob body');
          return this.#owned.upload(init.body, new Headers(init.headers).get('content-type')!, signal);
        }
        const url = new URL(`/xrpc/${method}`, 'https://xrpc.invalid');
        for (const [name, value] of Object.entries(params ?? {}))
          if (value !== undefined) url.searchParams.set(name, String(value));
        return this.#owned.request(url.pathname + url.search, { ...init, signal });
      },
      { native: true },
    );
  }
  async #reply<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error) {
      if (error instanceof AtseqError || error instanceof PdsError) throw error;
      throw new PdsError(502, 'InvalidResponse');
    }
  }
  #record(value: any, expectedCollection: string, expectedKey?: string): NativeAccountRecord {
    if (
      !value ||
      typeof value !== 'object' ||
      typeof value.uri !== 'string' ||
      utf8.encode(value.uri).length > 8192 ||
      !isValidAtUri(value.uri) ||
      !Object.hasOwn(value, 'value')
    )
      throw new PdsError(502, 'InvalidResponse');
    const uri = new AtUri(value.uri);
    if (
      uri.hostname !== this.#did ||
      uri.collection !== expectedCollection ||
      !isValidRecordKey(uri.rkey) ||
      (expectedKey !== undefined && uri.rkey !== expectedKey) ||
      value.uri !== `at://${this.#did}/${expectedCollection}/${uri.rkey}`
    )
      throw new PdsError(502, 'InvalidResponse');
    cid(value.cid);
    return { uri: value.uri, cid: value.cid, value: value.value };
  }
  get(collectionName: string, rkey: string, options: CallOptions = {}): Promise<NativeAccountRecord> {
    return this.#reply(async () => {
      collection(collectionName);
      key(rkey);
      return this.#record(
        await this.#operations(options.signal).get(this.#did, collectionName, rkey),
        collectionName,
        rkey,
      );
    });
  }
  list(
    collectionName: string,
    options: CallOptions & { readonly cursor?: string; readonly limit?: number } = {},
  ): Promise<{ readonly records: readonly NativeAccountRecord[]; readonly cursor?: string }> {
    return this.#reply(async () => {
      collection(collectionName);
      const limit = options.limit ?? 100;
      if (!Number.isInteger(limit) || limit < 1 || limit > 100) input('Invalid account page limit');
      cursor(options.cursor);
      const page = await this.#operations(options.signal).listPage(this.#did, collectionName, options.cursor, limit);
      cursor(page.cursor, true);
      return {
        records: page.records.map((record) => this.#record(record, collectionName)),
        ...(page.cursor === undefined ? {} : { cursor: page.cursor }),
      };
    });
  }
  latestCommit(options: CallOptions = {}): Promise<{ readonly cid: string; readonly rev: string }> {
    return this.#reply(async () => {
      const value = await this.#operations(options.signal).latestCommit(this.#did);
      commit(value);
      return value;
    });
  }
  applyConditional(writes: unknown[], swapCommit: string, options: CallOptions = {}): Promise<any> {
    return this.#reply(async () => {
      if (!Array.isArray(writes)) input('Invalid conditional account writes');
      // Shared conditional validation and JSON capture happen before its first await.
      const pending = this.#operations(options.signal).applyConditional(this.#did, writes, swapCommit);
      const count = writes.length;
      const value = await pending;
      commit(value?.commit);
      if (!Array.isArray(value?.results) || value.results.length !== count) throw new PdsError(502, 'InvalidResponse');
      return value;
    });
  }
  upload(content: Uint8Array, mimeType = 'application/octet-stream', options: CallOptions = {}): Promise<any> {
    return this.#reply(async () => {
      if (!mime(mimeType)) input('Invalid account blob input');
      const owned = ownUpload(content);
      const size = owned.byteLength;
      const blob = await this.#operations(options.signal).upload(owned, mimeType);
      blobCid(blob?.ref?.$link);
      // Standard PDS upload can select a sniffed type instead of the fallback.
      if (blob?.$type !== 'blob' || blob.size !== size || !mime(blob.mimeType))
        throw new PdsError(502, 'InvalidResponse');
      return blob;
    });
  }
}
