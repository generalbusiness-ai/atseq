import * as CID from '@atcute/cid';
import * as CAR from '@atcute/car';
import * as CBOR from '@atcute/cbor';
import { exactAdmissionCar } from '../../src/protocol/native-observer-car.ts';
import { car } from '../../tests/support/native-proof-corpus.ts';
const raw=CBOR.encode({padding:'x'.repeat(1024*1024+1)});
const root=CID.toString(CID.createSync(CID.CODEC_DCBOR,raw));
const tiny=CBOR.encode({n:1}),id=CID.toString(CID.createSync(CID.CODEC_DCBOR,tiny));
const response=await car(root,new Map([[id,tiny]]),[]);
Object.defineProperty(raw,'length',{value:0});
const intrinsicLength=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Uint8Array.prototype),'length')!.get!.call(raw);
let result;
try {const output=await exactAdmissionCar(response,[id],{root,bytes:raw});result={status:'BLOCK_BOUND_BYPASS',reportedLength:raw.length,intrinsicLength,outputBytes:output.length,largestBlock:Math.max(...[...CAR.fromUint8Array(output)].map(b=>b.bytes.length))};}
catch(error){result={status:'refused',reportedLength:raw.length,intrinsicLength,constructor:(error as Error).constructor.name,code:(error as any).code};}
console.log(JSON.stringify(result));
