import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

test('production identity transport rejects literal/private addresses and connect-time DNS rebinding', () => {
  const probe = `import assert from 'node:assert/strict';
    import {createRequire,syncBuiltinESMExports} from 'node:module';
    import {createServer} from 'node:net';import {once} from 'node:events';
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
      process.stdout.write(JSON.stringify({node:process.version,undici:process.versions.undici,connectTimeDnsCalls:calls,privateConnections:connections,literalCases:6}));
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
