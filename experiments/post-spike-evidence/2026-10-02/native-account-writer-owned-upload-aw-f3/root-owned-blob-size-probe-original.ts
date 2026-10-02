import assert from 'node:assert/strict';
import { create, toString, CODEC_RAW } from '@atcute/cid';
import { loadNodeOAuthAdapter } from '../src/host/oauth-loader.ts';
import { NativeAccountWriter } from '../src/transport/native-account-writer.ts';
import { NativeWriterFixture } from '../tests/support/native-account-writer-fixture.ts';
import { OAUTH_DID, OAUTH_SCOPE } from '../tests/support/oauth-fixture.ts';

const fixture=await new NativeWriterFixture().initialize();
const originalFetch=globalThis.fetch;
globalThis.fetch=fixture.fetch;
try {
  const flow=await loadNodeOAuthAdapter(fixture.options());
  await flow.begin(OAUTH_DID,OAUTH_SCOPE);
  const writer=await NativeAccountWriter.open(await flow.complete(fixture.callback()),OAUTH_DID);
  const content=new Uint8Array(17).fill(42);
  Object.defineProperty(content,'length',{value:0});
  const intrinsicLength=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Uint8Array.prototype),'length')!.get!.call(content);
  let sentBytes:number|null=null;
  fixture.overrideResponse=async (_request,body)=>{
    sentBytes=body.byteLength;
    return new Response(JSON.stringify({blob:{$type:'blob',ref:{$link:toString(await create(CODEC_RAW,body))},mimeType:'application/octet-stream',size:0}}));
  };
  let result;
  try {
    const blob=await writer.upload(content);
    result={status:'INCORRECT_UPLOAD_SIZE_ACCEPTED',intrinsicLength,callerLength:content.length,sentBytes,acceptedReplySize:blob.size};
  } catch (error) {
    result={status:'refused',intrinsicLength,callerLength:content.length,sentBytes,code:(error as any).code};
  }
  assert.equal(intrinsicLength,17);
  console.log(JSON.stringify(result));
} finally {globalThis.fetch=originalFetch;}
