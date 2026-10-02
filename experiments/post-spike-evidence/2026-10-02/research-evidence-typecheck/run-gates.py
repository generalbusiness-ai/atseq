from pathlib import Path
import json,os,subprocess,sys,time
w=Path('/private/tmp/atseq-research-evidence-typecheck-20261002');e=w/'experiments/post-spike-evidence/2026-10-02/research-evidence-typecheck';key=sys.argv[1]
nodes={'node22':'/Users/hughpyle/.npm/_npx/992a19d7d9bf36d4/node_modules/node/bin/node','node24':'/Users/hughpyle/.npm/_npx/387698761821791d/node_modules/node/bin/node','node26':'/opt/homebrew/bin/node'}
node=nodes[key];env=os.environ.copy();env['PATH']=str(Path(node).parent)+':'+env['PATH'];d=e/key;d.mkdir(exist_ok=True);rows=[]
for name,cmd in [('check',['npm','run','check']),('compiler-inputs',[node,'node_modules/typescript/bin/tsc','--noEmit','--listFiles'])]:
 start=time.time()
 with (d/(name+'.log')).open('wb') as log:r=subprocess.run(cmd,cwd=w,env=env,stdout=log,stderr=subprocess.STDOUT)
 rows.append({'name':name,'command':cmd,'exitCode':r.returncode,'elapsedSeconds':time.time()-start});print(key,name,r.returncode,flush=True)
(d/'gates.json').write_text(json.dumps({'node':subprocess.check_output([node,'--version'],text=True).strip(),'nodeExecutable':node,'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=w,text=True).strip(),'results':rows},indent=2)+'\n')
sys.exit(0 if all(x['exitCode']==0 for x in rows) else 1)
