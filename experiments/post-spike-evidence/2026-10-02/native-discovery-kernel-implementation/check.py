#!/usr/bin/env python3
"""Verify frozen C1 delivery data. Does not execute applications or create authority."""
import copy,gzip,hashlib,json,pathlib,subprocess,sys
P=pathlib.Path(__file__).resolve().parent
W=P.parents[3]
HEAD='7234f492089a993588d78472e3399abcc24bcc15'
ORACLE='f7c6d9c3740208973de828da976107b32a6107ad3c62085412476fdbb2e874e6'
def sha(b):return hashlib.sha256(b).hexdigest()
def canonical(v):return json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def require(ok,message):
 if not ok:raise ValueError(message)
def disk(name):return json.loads((P/name).read_text())
def normwork(d):
 return {'profile':d['profile'],'grantCount':d['grantCount'],'rows':[{k:v for k,v in r.items() if k not in ['bootstrap','repositoryAuthentication','cold','warm','concurrent']}|{k:r[k]['result'] for k in ['cold','warm','concurrent']} for r in d['rows']]}
def semantic(s):
 captures=s['captures']; inv=s['inventory']; pins=s['pins']; agreement=s['agreement']
 require(inv['producer']==HEAD and not inv['fullC1Closed'] and not inv['all40Executed'],'false whole-task closure')
 original=s['original']['vectors'];vectors=inv['vectors']
 require(len(vectors)==40 and [v['id'] for v in vectors]==[v['id'] for v in original],'40 original vector identities')
 for v,o in zip(vectors,original):
  require(all(v[k]==o[k] for k in ['id','group','scenario','expected']),'original scenario/expectation changed')
  require(v['sourceStatus']=='UNEXECUTED','historical source execution fabrication')
 byid={v['id']:v for v in vectors}
 require(byid['FULL-03']['disposition']=='OPEN' and byid['FULL-03']['tracking']['request']=='d2bc70a032ae9f497684a7cfba710fbc9b36868c','FULL03 must remain open and tracked')
 require('test-only' in byid['K3-05']['limitation'] and 'No genuine' in byid['K3-05']['limitation'],'max-safe genuine-history claim')
 require('no separate root-only ingestion' in byid['K1-06']['limitation'],'root-only coordinator fabrication')
 ob=s['obligations'];origob=s['originalObligations']
 require(not ob['fullC1Closed'] and len(ob['obligations'])==12,'12 full obligations remain open')
 for x,o in zip(ob['obligations'],origob['obligations']):require(all(x[k]==o[k] for k in ['id','requirement','disposition']),'original full obligation narrowed')
 require(len(s['failures']['failures'])>=9 and not s['failures']['approvalPrompts'],'failure inventory or approval attribution')
 require(captures['final-after/run.json']['head']==HEAD and captures['matrix/run.json']['head']==HEAD,'final producer pin')
 for phase in ['before','after','final-after']:
  run=captures[phase+'/run.json'];require(len(run['rows'])==8 and all(x['exitCode']==0 for x in run['rows']),'foundation gate failed')
  require(run['fixtureSha256']==ORACLE,'unchanged oracle pin')
  for node in ['node22','node24','node26']:
   require(len(captures[f'{phase}/{node}/source/faults.json'])==24,'actual original fault gate absent')
   emitted=captures[f'{phase}/{node}/compiled/result.json'];require(len(emitted['cases'])==58 and emitted['fixtureSha256']==ORACLE and len(emitted['actualProductionModules'])>0,'actual58 emitted gate')
  chrome=captures[phase+'/chromium/result.json'];require(len(chrome['cases'])==58 and len(chrome['faults'])==24 and chrome['fixtureSha256']==ORACLE,'actual Chrome58/24 gate')
 require(captures['matrix/run.json']['allPassed'] and len(captures['matrix/run.json']['rows'])==10 and all(x['exitCode']==0 for x in captures['matrix/run.json']['rows']),'full matrix failed')
 components=[];faults=[];works={'few':[],'many':[]};emittedPins={}
 for node in ['node22','node24','node26']:
  a=captures[f'matrix/{node}/source/component/result.json'];components.append(a['cases']);faults.append(a['faults']);require(a['originalFixtureSha256']==ORACLE,'new corpus oracle pin')
  b=captures[f'matrix/{node}/compiled/component.json'];components.append(b['cases']);require('faults' not in b and b['actualProductionModules'],'fault transforms mislabelled compiled production')
  for m in b['actualProductionModules']:
   require(m['path'].startswith('dist/src/'),'emitted module path is not actual dist')
   require(m['path'] not in emittedPins or emittedPins[m['path']]==m['sha256'],'emitted runtimes disagree')
   emittedPins[m['path']]=m['sha256']
  for profile in works:works[profile].extend([captures[f'matrix/{node}/source/workload/{profile}.json']['result'],captures[f'matrix/{node}/compiled/{profile}.json']['result']])
 a=captures['matrix/chromium/component.json'];components.append(a['cases']);faults.append(a['faults']);require(a['chromium'].startswith('153.'),'actual browser pin')
 for profile in works:works[profile].append(captures[f'matrix/chromium/{profile}.json']['result'])
 require(len(components[0])==31 and all(canonical(x)==canonical(components[0]) for x in components),'genuine31 byte mismatch')
 require(len(faults[0])==6 and all(canonical(x)==canonical(faults[0]) for x in faults),'test-only6 byte mismatch')
 require(not agreement['compiledFaultsAreProduction'],'fault attribution changed')
 require(sha(canonical(components[0]))==agreement['component'] and sha(canonical(faults[0]))==agreement['fault'],'trace hash mismatch')
 for profile,values in works.items():
  require(all(canonical(normwork(x))==canonical(normwork(values[0])) for x in values),'workload byte mismatch')
  require(sha(canonical(normwork(values[0])))==agreement['workload'][profile],'workload trace hash')
  for x in values:
   require([r['actionCount'] for r in x['rows']]==[100,1000,10000],'full10k workload absent')
   for r in x['rows']:
    require(r['reads']=={'discoveryTransport':0,'selectionHistory':0,'selectionOutcomes':0},'selection history/outcome/transport reads')
    for mode in ['cold','warm']:
     result=r[mode]['result'];work=result['work'];require(result['basis']['frontier']['position']==r['totalEntries'],'genuine processed frontier')
     require(work['byteAccounting']=='conservative-owner-bounds' and work['opaqueAllocations']=='unmeasured','conservative accounting attribution')
     require(work['memo']==('computed' if mode=='cold' else 'reused') and work['ownerChargedBytes']>0,'memo/copy charge missing')
     require(r[mode]['measurement']['peakHeap']=='unmeasured','peak heap fabrication')
   require(x['rows'][-1]['coldDefaultPrefixRefusal'] is not None,'original cold delta refusal missing')
 require(pins['producer']==HEAD and len(pins['productionChanged'])==4,'four-path production boundary')
 require('src/protocol/wire.ts' in pins['protectedUnchanged'] and 'src/protocol/checkpoint-data.ts' in pins['protectedUnchanged'] and 'src/definition/schemas.ts' in pins['protectedUnchanged'],'shared codec/schema protection')
 return {'vectors':40,'openFull03':True,'fullObligations':12,'genuineRecords':31,'testOnlyRecords':6,'foundation':'58/24 before/intermediate/final-after,58 actual emitted','workloads':'6 rows across7 paths; no peak-heap claim','productionPaths':4}
def loadstate():
 caps={}
 for c in disk('capture-index.json')['captures']:
  raw=gzip.decompress((P/c['object']).read_bytes());require(len(raw)==c['bytes'] and sha(raw)==c['sha256'],'capture raw hash')
  if c['path'].endswith('.json'):caps[c['path']]=json.loads(raw)
 return {'captures':caps,'inventory':disk('acceptance-inventory.json'),'pins':disk('source-pins.json'),'agreement':disk('byte-agreement.json'),'original':disk('original-acceptance-vectors.json'),'obligations':disk('full-c1-inventory.json'),'originalObligations':disk('original-full-c1-obligations.json'),'failures':disk('failures.json')}
def main():
 manifest=disk('manifest.json');require(manifest['producer']==HEAD,'manifest producer')
 for row in manifest['files']:
  b=(W/row['path']).read_bytes();require(len(b)==row['bytes'] and sha(b)==row['sha256'],'delivery hash '+row['path'])
 s=loadstate();pins=s['pins']
 for path,h in pins['pins'].items():require(sha((W/path).read_bytes())==h,'source pin '+path)
 for path in pins['protectedUnchanged']:
  b=subprocess.check_output(['git','show',pins['basis']+':'+path],cwd=W);require(sha(b)==pins['pins'][path],'protected baseline changed '+path)
 for row in pins['historicalSourceFiles']:
  b=subprocess.check_output(['git','show',row['head']+':'+row['path']],cwd=W);require(sha(b)==row['sha256'],'historical source changed')
 physical=json.loads(gzip.decompress((P/'physical-build-provenance.json.gz').read_bytes()))
 require(physical['producer']==HEAD and 'After all final' in physical['captureTiming'],'physical inventory attribution')
 physicalPins={r['path']:r['sha256'] for r in physical['files']}
 for node in ['node22','node24','node26']:
  for item in s['captures'][f'matrix/{node}/compiled/component.json']['actualProductionModules']:
   require(physicalPins[item['path']]==item['sha256'],'actual emitted physical output inventory')
 oracle=gzip.decompress((W/'experiments/post-spike-evidence/2026-10-02/native-prefix/fixtures/application.json.gz').read_bytes());require(sha(oracle)==ORACLE and len(oracle)==8371247,'retained original oracle')
 for name,h in [('component','cb9c193fe35088f65356f76389cd98fd357a3524fecd941121ee93743502cdc9'),('few','1f264eae62254d8635f64dba5db39f0c1bea24ca31f500d9a3b24f1eb504bb1c'),('many','c57bac34ec63ee186f0016be32cedd9cb3b3b1b08f227c61fd812abc782c3e14')]:require(sha(gzip.decompress((W/f'testdata/native-discovery/{name}.json.gz').read_bytes()))==h,'final public fixture '+name)
 result=semantic(s)
 controls=[]
 mutations=[('FULL03 closure',lambda q:q['inventory']['vectors'][-2].update(disposition='PASSED')),('max-safe genuine claim',lambda q:next(x for x in q['inventory']['vectors'] if x['id']=='K3-05').update(limitation='genuine full history')),('byte mismatch',lambda q:q['captures']['matrix/node22/source/component/result.json']['cases'][0]['actual'].update(tampered=True)),('missing10k',lambda q:q['captures']['matrix/node22/source/workload/few.json']['result']['rows'].pop()),('oracle replacement',lambda q:q['captures']['final-after/run.json'].update(fixtureSha256='0'*64)),('compiled fault attribution',lambda q:q['agreement'].update(compiledFaultsAreProduction=True)),('unreported failures',lambda q:q['failures'].update(failures=[])),('false exact accounting',lambda q:q['captures']['matrix/node22/source/workload/few.json']['result']['rows'][0]['cold']['result']['work'].update(byteAccounting='exact-peak-heap')),('wrong producer',lambda q:q['pins'].update(producer='0'*40)),('shared codec change',lambda q:q['pins']['protectedUnchanged'].remove('src/protocol/wire.ts'))]
 for name,mutate in mutations:
  q=copy.deepcopy(s);mutate(q)
  try:semantic(q)
  except ValueError as e:controls.append({'name':name,'rejected':str(e)})
  else:raise ValueError('negative control accepted: '+name)
 print(json.dumps({'status':'passed','checks':result,'sourcePins':len(pins['pins']),'deliveryFiles':len(manifest['files']),'negativeControls':controls},indent=2))
if __name__=='__main__':main()
