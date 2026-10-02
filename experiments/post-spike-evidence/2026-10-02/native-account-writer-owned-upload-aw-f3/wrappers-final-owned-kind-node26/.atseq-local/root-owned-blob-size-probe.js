import assert from 'node:assert/strict';
import { create, toString, CODEC_RAW } from '@atcute/cid';
import { loadNodeOAuthAdapter } from "../../../dist/src/host/oauth-loader.js";
import { NativeAccountWriter } from "../../../dist/src/transport/native-account-writer.js";
import { NativeWriterFixture } from "../tests/support/native-account-writer-fixture.js";
import { OAUTH_DID, OAUTH_SCOPE } from "../tests/support/oauth-fixture.js";
const fixture = await new NativeWriterFixture().initialize();
const originalFetch = globalThis.fetch;
globalThis.fetch = fixture.fetch;
try {
    const flow = await loadNodeOAuthAdapter(fixture.options());
    await flow.begin(OAUTH_DID, OAUTH_SCOPE);
    const writer = await NativeAccountWriter.open(await flow.complete(fixture.callback()), OAUTH_DID);
    const content = new Uint8Array(17).fill(42);
    Object.defineProperty(content, 'length', { value: 0 });
    const intrinsicLength = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Uint8Array.prototype), 'length').get.call(content);
    let sentBytes = null;
    fixture.overrideResponse = async (_request, body) => {
        sentBytes = body.byteLength;
        return new Response(JSON.stringify({ blob: { $type: 'blob', ref: { $link: toString(await create(CODEC_RAW, body)) }, mimeType: 'application/octet-stream', size: 0 } }));
    };
    let result;
    try {
        const blob = await writer.upload(content);
        result = { status: 'INCORRECT_UPLOAD_SIZE_ACCEPTED', intrinsicLength, callerLength: content.length, sentBytes, acceptedReplySize: blob.size };
    }
    catch (error) {
        result = { status: 'refused', intrinsicLength, callerLength: content.length, sentBytes, code: error.code };
    }
    assert.equal(intrinsicLength, 17);
    console.log(JSON.stringify(result));
}
finally {
    globalThis.fetch = originalFetch;
}
