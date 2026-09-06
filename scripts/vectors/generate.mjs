// Independent fixture writer. No src/ imports and no @atcute implementation.
// Explicit public TEST secrets 1 and 2. Never use these for a real identity.
import { createECDH, createPrivateKey, createHash, sign, verify } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { encode } from '@ipld/dag-cbor';
import { CID } from 'multiformats/cid';
import { sha256 } from 'multiformats/hashes/sha2';
import { base58btc } from 'multiformats/bases/base58';
const n = BigInt('0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551');
const base64 = b => Buffer.from(b).toString('base64').replace(/=+$/, '');
const lex = v => {
  if (v && typeof v === 'object') {
    if ('$bytes' in v) return new Uint8Array(Buffer.from(v.$bytes,'base64'));
    if ('$link' in v) return CID.parse(v.$link);
    if (Array.isArray(v)) return v.map(lex);
    return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,lex(x)]));
  }
  return v;
};
const block = v => Buffer.from(encode(lex(v)));
const cid = async v => CID.createV1(0x71, await sha256.digest(block(v))).toString();
const key = (scalar) => {
  const privateBytes=Buffer.alloc(32);privateBytes[31]=scalar;
  const ecdh=createECDH('prime256v1');ecdh.setPrivateKey(privateBytes);
  const compressed=ecdh.getPublicKey(undefined,'compressed'), full=ecdh.getPublicKey();
  const jwk={kty:'EC',crv:'P-256',d:privateBytes.toString('base64url'),x:full.subarray(1,33).toString('base64url'),y:full.subarray(33).toString('base64url')};
  return {did:'did:key:'+base58btc.encode(Buffer.concat([Buffer.from([0x80,0x24]),compressed])),private:createPrivateKey({key:jwk,format:'jwk'})};
};
const actor=key(1), sequencer=key(2);
function proof(k,v) {
  const data=block(v), sig=sign('sha256',data,{key:k.private,dsaEncoding:'ieee-p1363'});
  const s=BigInt('0x'+sig.subarray(32).toString('hex'));
  if(s>n/2n) Buffer.from((n-s).toString(16).padStart(64,'0'),'hex').copy(sig,32);
  if(!verify('sha256',data,{key:k.private,dsaEncoding:'ieee-p1363'},sig)) throw Error('Independent proof failed');
  return {$bytes:base64(sig)};
}
const profile=JSON.parse(await readFile('src/protocol/runtime-descriptor.json','utf8'));
const definition={fixture:'source identity only; not an executable S3 definition'};
const genesis={$type:'test.atseq.genesis',version:0,app:'did:plc:aaaaaaaaaaaaaaaaaaaaaaaa',profile:{$link:await cid(profile)},definition:{$link:await cid(definition)},sequencerKey:sequencer.did,activationKeys:[actor.did]};
const genesisCid=await cid(genesis);
const intent={$type:'test.atseq.defs#intent',version:0,app:genesis.app,genesis:{$link:genesisCid},definition:genesis.definition,actorKey:actor.did,nonce:{$bytes:base64(Buffer.from('000102030405060708090a0b0c0d0e0f','hex'))},action:'test.atseq.totals#add',payload:{delta:3,note:null,extra:'retained'}};
const signed={$type:'test.atseq.defs#signedIntent',intent,sig:proof(actor,intent)};
let alternate=proof(actor,intent);while(alternate.$bytes===signed.sig.$bytes) alternate=proof(actor,intent);
const unsigned={$type:'test.atseq.entry',version:0,app:genesis.app,genesis:{$link:genesisCid},position:1,prev:{$link:genesisCid},signedIntent:signed,sequencerKey:sequencer.did};
const entry={...unsigned,sig:proof(sequencer,unsigned)};
const entryCid=await cid(entry);
const head={$type:'test.atseq.head',version:0,app:genesis.app,genesis:{$link:genesisCid},position:1,entry:{$link:entryCid}};
const encoded=Object.fromEntries(await Promise.all(Object.entries({profile,definition,genesis,intent,signed,entry,head}).map(async([name,value])=>[name,{value,cborHex:block(value).toString('hex'),cid:await cid(value),sha256:createHash('sha256').update(block(value)).digest('hex')}])));
await writeFile('tests/vectors/protocol-v0.json',JSON.stringify({provenance:{encoder:'@ipld/dag-cbor 7.0.3',cid:'multiformats 9.9.0',signer:'Node OpenSSL ECDSA-SHA256, IEEE P1363, normalized low-S',node:process.version,publicTestScalars:[1,2],generatedAt:new Date().toISOString()},...encoded,alternateActorSignature:alternate},null,2)+'\n');
console.log('Wrote independent public test vectors; signature bytes vary when explicitly regenerated.');
