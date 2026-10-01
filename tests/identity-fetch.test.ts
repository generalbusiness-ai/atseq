import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

test('production identity transport rejects literal/private addresses and connect-time DNS rebinding', () => {
  const probe = `import assert from 'node:assert/strict';
    import {createRequire,syncBuiltinESMExports} from 'node:module';
    import {readFileSync} from 'node:fs';
    import {createServer} from 'node:net';import {once} from 'node:events';
    const require=createRequire(import.meta.url),builtinUndici=process.versions.undici;
    const alias='undici_v'+builtinUndici.split('.')[0],selectedEntry=require.resolve(alias);
    const selectedPackage=JSON.parse(readFileSync('node_modules/'+alias+'/package.json','utf8'));
    const originalFetch=globalThis.fetch;let dispatchedCalls=0;
    globalThis.fetch=(input,init)=>{assert.equal(typeof init.dispatcher.dispatch,'function');dispatchedCalls++;return originalFetch(input,init);};
    const dns=createRequire(import.meta.url)('node:dns');let calls=0;const original=dns.lookup;
    dns.lookup=(host,options,callback)=>{if(host!=='rebind.atseq-probe.net')return original(host,options,callback);calls++;const answer=calls===1?'93.184.216.34':'127.0.0.1';
      if(options.all)callback(null,[{address:answer,family:4}]);else callback(null,answer,4);};
    syncBuiltinESMExports();
    const {IdentityFetch}=await import(${JSON.stringify(resolve('src/host/identity-fetch.ts'))});
    let connections=0;const server=createServer(socket=>{connections++;socket.destroy();});
    server.listen(0,'127.0.0.1');await once(server,'listening');const port=server.address().port;
    try{
      // An earlier public answer is irrelevant; the maintained guard checks the
      // answer returned at the actual connection, which now points at loopback.
      const initial=await new Promise((ok,bad)=>dns.lookup('rebind.atseq-probe.net',{all:true},(e,a)=>e?bad(e):ok(a)));
      assert.equal(initial[0].address,'93.184.216.34');
      await assert.rejects(()=>new IdentityFetch().bytesFrom('https://rebind.atseq-probe.net:'+port+'/audit',100),{code:'content_unavailable'});
      assert.ok(calls>=2);assert.equal(connections,0);
      for(const host of ['127.0.0.1','10.0.0.1','192.168.1.1','169.254.169.254','[::1]','[::ffff:127.0.0.1]'])
        await assert.rejects(()=>new IdentityFetch().bytesFrom('https://'+host+':'+port+'/audit',100),{code:'content_unavailable'});
      assert.equal(connections,0);
      process.stdout.write(JSON.stringify({node:process.version,builtinUndici,selectedAgentAlias:alias,selectedInstalledVersion:selectedPackage.version,selectedEntry,dispatchedCalls,connectTimeDnsCalls:calls,privateConnections:connections,literalCases:6}));
    }finally{await new Promise(ok=>server.close(ok));}`;
  const output = execFileSync(
    process.execPath,
    [
      '--conditions=atseq-source',
      '--import',
      resolve('node_modules/tsx/dist/loader.mjs'),
      '--input-type=module',
      '-e',
      probe,
    ],
    { encoding: 'utf8', timeout: 20_000 },
  );
  const evidence = JSON.parse(output);
  assert.equal(evidence.privateConnections, 0);
  assert.equal(evidence.literalCases, 6);
  console.log(JSON.stringify(evidence));
});

test('identity transport applies credential/cache/redirect and failed-body total budgets (mock HTTP responses)', () => {
  const probe = `import assert from 'node:assert/strict';let calls=0;let bodyBytes=1;
    globalThis.fetch=async(input,init)=>{calls++;const request=new Request(input,init);
      assert.equal(request.redirect,'error');assert.equal(request.cache,'no-store');assert.equal(request.credentials,'omit');
      assert.equal(request.headers.get('authorization'),null);assert.equal(request.headers.get('cookie'),null);
      return new Response(new Uint8Array(bodyBytes));};
    const {IdentityFetch}=await import(${JSON.stringify(resolve('src/host/identity-fetch.ts'))});
    const limit=new IdentityFetch();for(let n=0;n<64;n++)assert.equal((await limit.bytesFrom('https://pds.atseq-probe.net/a',10)).length,1);
    await assert.rejects(()=>limit.bytesFrom('https://pds.atseq-probe.net/a',10),{code:'content_unavailable'});assert.equal(calls,64);
    bodyBytes=17*1024*1024;calls=0;const total=new IdentityFetch();
    for(let n=0;n<2;n++)await assert.rejects(()=>total.bytesFrom('https://pds.atseq-probe.net/a',16*1024*1024),{code:'content_unavailable'});
    await assert.rejects(()=>total.bytesFrom('https://pds.atseq-probe.net/a',16*1024*1024),{code:'content_unavailable'});assert.equal(calls,2);
    process.stdout.write('mock request/body policy passed');`;
  assert.equal(
    execFileSync(
      process.execPath,
      [
        '--conditions=atseq-source',
        '--import',
        resolve('node_modules/tsx/dist/loader.mjs'),
        '--input-type=module',
        '-e',
        probe,
      ],
      { encoding: 'utf8', timeout: 20_000 },
    ),
    'mock request/body policy passed',
  );
});

test('identity transport classifies body-read failures and preserves request and Atseq faults (mock phases)', () => {
  const probe = `import assert from 'node:assert/strict';
    import {IdentityFetch} from ${JSON.stringify(resolve('src/host/identity-fetch.ts'))};
    import {AtseqError} from ${JSON.stringify(resolve('src/core/errors.ts'))};
    const transport=new IdentityFetch();let seen=0;
    async function attempt(error) {
      let pulls=0;
      transport.fetch=async()=>new Response(new ReadableStream({pull(controller){
        if(pulls++===0){controller.enqueue(new Uint8Array([1,2,3]));seen+=3;}else controller.error(error);
      }}));
      let caught;try{await transport.bytesFrom('https://pds.atseq-probe.net/a',100);}catch(fault){caught=fault;}
      return caught;
    }
    const bodyFaults=['UND_ERR_SOCKET','UND_ERR_BODY_TIMEOUT','UND_ERR_RES_CONTENT_LENGTH_MISMATCH',
      'UND_ERR_RES_EXCEEDED_MAX_SIZE','ECONNRESET','EPIPE','ETIMEDOUT','ERR_SSL_SSLV3_ALERT_BAD_RECORD_MAC']
      .map(code=>new TypeError('terminated',{cause:Object.assign(new Error('Body transport failed'),{code})}));
    bodyFaults.push(new TypeError('Stream implementation failed'),new TypeError('terminated'),'Remote stream failed');
    for(const fault of bodyFaults)assert.equal((await attempt(fault))?.code,'content_unavailable');
    const integrity=new AtseqError('dependency_mismatch','Integrity failure');
    assert.equal(await attempt(integrity),integrity);
    const requestFaults=[new TypeError('Application programming error'),new TypeError('terminated'),
      new TypeError('terminated',{cause:Object.assign(new Error('Invalid dispatcher use'),{code:'UND_ERR_INVALID_ARG'})}),
      new TypeError('terminated',{cause:Object.assign(new Error('Invalid request size'),{code:'UND_ERR_REQ_CONTENT_LENGTH_MISMATCH'})}),
      integrity];
    for(const fault of requestFaults){
      transport.fetch=async()=>{throw fault;};
      await assert.rejects(()=>transport.bytesFrom('https://pds.atseq-probe.net/a',100),error=>error===fault);
    }
    await assert.rejects(()=>transport.bytesFrom('https://pds.atseq-probe.net/a',0),{code:'input'});
    assert.equal(seen,36);assert.equal(transport.bytes,36);
    transport.fetch=async()=>new Response(new Uint8Array([4]));
    assert.deepEqual([...await transport.bytesFrom('https://pds.atseq-probe.net/a',100)],[4]);
    process.stdout.write(JSON.stringify({mockBodyPhases:true,bodyReadFaultCases:bodyFaults.length,preservedBodyAtseqCases:1,preservedRequestFaultCases:requestFaults.length,consumedBeforeFailure:seen,resumed:true}));`;
  const evidence = JSON.parse(
    execFileSync(
      process.execPath,
      [
        '--conditions=atseq-source',
        '--import',
        resolve('node_modules/tsx/dist/loader.mjs'),
        '--input-type=module',
        '-e',
        probe,
      ],
      { encoding: 'utf8', timeout: 20_000 },
    ),
  );
  assert.equal(evidence.bodyReadFaultCases, 11);
  assert.equal(evidence.preservedBodyAtseqCases, 1);
  assert.equal(evidence.preservedRequestFaultCases, 5);
  console.log(JSON.stringify(evidence));
});

for (const termination of ['destroy', 'end', 'resetAndDestroy'] as const)
  test(`identity body reader classifies a real ${termination} HTTP socket (injected loopback transport)`, () => {
    const probe = `import assert from 'node:assert/strict';import {createServer} from 'node:http';import {once} from 'node:events';
    import {IdentityFetch} from ${JSON.stringify(resolve('src/host/identity-fetch.ts'))};
    const server=createServer((request,response)=>{
      response.writeHead(200,{'content-length':100000});response.flushHeaders();response.write(new Uint8Array(1000));
      setTimeout(()=>response.socket.${termination}(),20);
    });server.listen(0,'127.0.0.1');await once(server,'listening');
    const transport=new IdentityFetch();
    // Only the body-read boundary is under test. Production SSRF policy is not bypassed in source.
    transport.fetch=globalThis.fetch;
    try{let caught;try{await transport.bytesFrom('http://127.0.0.1:'+server.address().port+'/body',100000);}catch(error){caught=error;}
      process.stdout.write(JSON.stringify({actualHttpTruncation:true,termination:${JSON.stringify(termination)},code:caught?.code,name:caught?.name,message:caught?.message,causeCode:caught?.cause?.code,receivedBytes:transport.bytes}));
      assert.equal(caught?.code,'content_unavailable');assert.equal(transport.bytes,1000);
    }finally{server.closeAllConnections();await new Promise(ok=>server.close(ok));}`;
    const evidence = JSON.parse(
      execFileSync(
        process.execPath,
        [
          '--conditions=atseq-source',
          '--import',
          resolve('node_modules/tsx/dist/loader.mjs'),
          '--input-type=module',
          '-e',
          probe,
        ],
        { encoding: 'utf8', timeout: 20_000 },
      ),
    );
    assert.equal(evidence.receivedBytes, 1000);
    console.log(JSON.stringify(evidence));
  });
