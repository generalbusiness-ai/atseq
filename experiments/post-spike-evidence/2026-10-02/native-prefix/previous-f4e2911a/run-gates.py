from pathlib import Path
import json,os,subprocess,sys,time
w=Path('/private/tmp/atseq-native-prefix-f1-20261002'); e=w/'experiments/post-spike-evidence/2026-10-02/native-prefix'; key=sys.argv[1]
nodes={'node22':'/Users/hughpyle/.npm/_npx/992a19d7d9bf36d4/node_modules/node/bin/node','node24':'/Users/hughpyle/.npm/_npx/387698761821791d/node_modules/node/bin/node','node26':'/opt/homebrew/bin/node'}
node=nodes[key]; d=e/key; d.mkdir(exist_ok=True); env=os.environ.copy();env['PATH']=str(Path(node).parent)+':'+env['PATH']; env.update(ATSEQ_NATIVE_PREFIX_FIXTURE_PATH=str(e/'fixtures/prefix.json'), ATSEQ_NATIVE_PREFIX_CAPTURE_DIR=str(d/'prefix-source'), ATSEQ_NATIVE_APPLICATION_FIXTURE_PATH=str(e/'fixtures/application.json'), ATSEQ_NATIVE_APPLICATION_CAPTURE_DIR=str(d/'application-source'),ATSEQ_I2_CAPTURE_PATH=str(d/'authority-produced.json'),ATSEQ_OBSERVER_TEST_OUTPUT=str(d/'observer'),ATSEQ_NATIVE_PREFIX_COMPILED_CAPTURE=str(d/'prefix-compiled.json'),ATSEQ_NATIVE_APPLICATION_COMPILED_CAPTURE=str(d/'application-compiled.json'),ATSEQ_NATIVE_PREFIX_PRIOR_CAPTURE=str(d/'prior-comparison.json'))
commands=[('source-focused',[node,'scripts/source-run.mjs','--test','tests/native-prefix.test.ts','tests/native-authority.test.ts','tests/native-application.test.ts','tests/native-observer.test.ts','tests/native-observer-limits.test.ts']),('source-fixed-authority',[node,'scripts/source-run.mjs','experiments/native-prefix/replay-authority.ts',str(e/'fixtures/authority.json'),str(d/'authority-fixed.json')]),('prior-comparison',[node,'scripts/source-run.mjs','experiments/native-prefix/compare-prior-authority.ts','/private/tmp/atseq-native-prefix-prior-i2-20261002',str(e/'fixtures/authority.json')]),('compiled-prefix',[node,'experiments/native-prefix/compiled-conformance.mjs']),('compiled-application',[node,'experiments/native-application/compiled-conformance.mjs']),('compiled-observer',[node,'scripts/source-run.mjs','experiments/native-observer/compiled-conformance.mjs']),('compiled-authority',[node,'experiments/native-prefix/compiled-conformance.mjs'])]
results=[]
for name,cmd in commands:
    current=env.copy()
    if name=='compiled-authority':current.update(ATSEQ_NATIVE_AUTHORITY_FIXTURE_PATH=str(e/'fixtures/authority.json'),ATSEQ_NATIVE_PREFIX_COMPILED_CAPTURE=str(d/'authority-compiled.json'))
    start=time.time()
    with (d/(name+'.log')).open('wb') as log: result=subprocess.run(cmd,cwd=w,env=current,stdout=log,stderr=subprocess.STDOUT)
    results.append(dict(name=name,command=cmd,exitCode=result.returncode,elapsedSeconds=time.time()-start))
    print(key,name,result.returncode,flush=True)
(d/'gates.json').write_text(json.dumps(dict(node=node,sourceCommit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=w,text=True).strip(),results=results),indent=2)+'\n')
sys.exit(0 if all(r['exitCode']==0 for r in results) else 1)
