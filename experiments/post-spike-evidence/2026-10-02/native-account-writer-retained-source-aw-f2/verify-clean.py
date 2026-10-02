#!/usr/bin/env python3
"""Run both read-only verifiers in an exact clean clone, without installs."""
import hashlib,json,shutil,subprocess,sys,time
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4]
PACKET=Path(__file__).resolve().parent
sha=lambda raw:hashlib.sha256(raw).hexdigest()
def main():
 clone=Path(sys.argv[1]);ref=sys.argv[2] if len(sys.argv)>2 else 'HEAD';destination=Path(sys.argv[3])
 destination.mkdir(parents=True,exist_ok=True)
 head=subprocess.check_output(['git','rev-parse',ref],cwd=ROOT,text=True).strip()
 subprocess.run(['git','clone','--shared','--no-checkout',str(ROOT),str(clone)],check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 subprocess.run(['git','checkout','--detach',head],cwd=clone,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 assert subprocess.check_output(['git','status','--porcelain'],cwd=clone,text=True)==''
 assert not (clone/'node_modules').exists() and not (clone/'tests/support/pds/node_modules').exists()
 rows=[]
 for label,script in [('old','experiments/post-spike-evidence/2026-10-02/native-account-writer-aw-f2/verify-results.py'),('new',str(PACKET.relative_to(ROOT)/'check.py'))]:
  command=[sys.executable,script];at=datetime.now(timezone.utc).isoformat();start=time.perf_counter()
  with (destination/(label+'-verifier.log')).open('wb') as log:r=subprocess.run(command,cwd=clone,stdout=log,stderr=subprocess.STDOUT)
  rows.append({'label':label,'command':command,'startedUTC':at,'seconds':time.perf_counter()-start,'exit':r.returncode,'scriptSha256':sha((clone/script).read_bytes())})
  assert r.returncode==0,label
 meta={'head':head,'checkout':str(clone),'initialClean':True,'finalClean':subprocess.check_output(['git','status','--porcelain'],cwd=clone,text=True)=='','installedDependenciesPresent':False,'originalIgnoredFilesCopied':False,'python':sys.version,'pythonBinary':str(Path(sys.executable).resolve()),'pythonBinarySha256':sha(Path(sys.executable).resolve().read_bytes()),'gitVersion':subprocess.check_output(['git','--version'],text=True).strip(),'gitBinary':str(Path(shutil.which('git')).resolve()),'gitBinarySha256':sha(Path(shutil.which('git')).resolve().read_bytes()),'runs':rows,'newProductionRuntimeExecuted':False}
 (destination/'clean-checkout-results.json').write_text(json.dumps(meta,indent=2)+'\n');assert meta['finalClean'];print(json.dumps(meta))
if __name__=='__main__':main()
