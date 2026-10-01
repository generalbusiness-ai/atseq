import { InterpretationError } from '../core/errors.ts';
import { SourceSizeError } from '../definition/source.ts';
import { NSID } from '../core/nsids.ts';
import { create, fromString, toString, CODEC_DCBOR, CODEC_RAW } from '@atcute/cid';
import { encode } from '@atcute/cbor';
import { Lexicons, jsonToLex, type LexiconDoc } from '@atproto/lexicon';
import { decodeBlock, ProtocolError } from '../protocol/wire.ts';
import { PdsClient, PdsError } from './pds.ts';
import sourceLexicon from '../../lexicons/ai/generalbusiness/atseq/source.json';

const schema = new Lexicons([sourceLexicon as LexiconDoc]);

/** Retain exact source bytes through ordinary PDS blob references. */
export class SourceStore {
  constructor(private readonly pds: PdsClient) {}
  private async verify(cid: string, content: Uint8Array): Promise<void> {
    const expected = fromString(cid);
    if (expected.codec !== CODEC_RAW && expected.codec !== CODEC_DCBOR)
      throw new ProtocolError('content', 'Unsupported source CID codec');
    if (toString(await create(expected.codec, content)) !== cid)
      throw new ProtocolError('content', 'Source bytes differ from the requested CID');
    if (content.length > 512 * 1024) throw new SourceSizeError(content);
    if (expected.codec === CODEC_DCBOR) decodeBlock(content);
  }
  async put(cid: string, value: Uint8Array): Promise<void> {
    const content = new Uint8Array(value);
    await this.verify(cid, content);
    try {
      await this.get(cid);
      return;
    } catch (error) {
      if (!(error instanceof InterpretationError) || error.code !== 'content_missing') throw error;
    }
    const blob = await this.pds.upload(content);
    const rawCid = toString(await create(CODEC_RAW, content));
    if (blob.ref?.$link !== rawCid || blob.size !== content.length)
      throw new ProtocolError('content', 'PDS returned a different uploaded blob');
    await this.pds.apply([
      {
        $type: 'com.atproto.repo.applyWrites#create',
        collection: NSID.source,
        rkey: cid,
        value: { $type: NSID.source, content: { $link: cid }, blob },
      },
    ]);
  }
  async get(cid: string): Promise<Uint8Array> {
    try {
      return await this.read(cid);
    } catch (error) {
      if (!(error instanceof PdsError)) throw error;
      if (error.code === 'RecordNotFound')
        throw new InterpretationError('content_missing', 'PDS source record is absent');
      throw new InterpretationError('content_unavailable', `PDS could not supply verified source: ${error.code}`);
    }
  }
  private async read(cid: string): Promise<Uint8Array> {
    const record = await this.pds.get(NSID.source, cid);
    const value = record.value as any;
    const valid = schema.validate(NSID.source, jsonToLex(value));
    if (!valid.success || toString(await create(CODEC_DCBOR, encode(value))) !== record.cid)
      throw new ProtocolError('content', 'Invalid source retention record');
    if (value?.$type !== NSID.source || value.content?.$link !== cid || value.blob?.$type !== 'blob')
      throw new ProtocolError('content', 'Source retention record differs from the requested content');
    const rawCid = value.blob.ref?.$link;
    if (typeof rawCid !== 'string' || fromString(rawCid).codec !== CODEC_RAW)
      throw new ProtocolError('content', 'Source blob must use a raw CID');
    const content = await this.pds.binary('com.atproto.sync.getBlob', { cid: rawCid });
    if (toString(await create(CODEC_RAW, content)) !== rawCid || content.length !== value.blob.size)
      throw new ProtocolError('content', 'PDS blob is missing or corrupted');
    await this.verify(cid, content);
    return content;
  }
}
