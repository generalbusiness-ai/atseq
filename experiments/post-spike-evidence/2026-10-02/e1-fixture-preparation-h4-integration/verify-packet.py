"""Verify the E1 successor packet, its original attribution and actual installed build."""
import argparse,gzip,hashlib,json,pathlib,subprocess
parser=argparse.ArgumentParser();parser.add_argument('--repo',default='.');args=parser.parse_args()
root=pathlib.Path(args.repo).resolve();packet=root/'experiments/post-spike-evidence/2026-10-02/e1-fixture-preparation-h4-integration';sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
m=json.load(open(packet/'manifest.json'))
for p,h in m['files'].items():assert sha(packet/p)==h,p
for p,h in m['sourceInputs'].items():assert sha(root/p)==h,p
assert sha(root/m['report']['path'])==m['report']['sha256']
old=root/m['originalPacket'];assert sha(old)==m['originalPacketSha256'];original=json.load(open(old))
for p,h in original['files'].items():assert sha(old.parent/p)==h,p
assert sha(root/original['report']['path'])==original['report']['sha256']
changes=[p for p,h in original['sourceInputs'].items() if sha(root/p)!=h];assert changes==['tsconfig.json']
assert (root/'tsconfig.json').read_bytes()==subprocess.check_output(['git','show',m['reviewedBasis']+':tsconfig.json'],cwd=root)
physical=json.loads(gzip.decompress((old.parent/'physical-runtime.json.gz').read_bytes()));assert not (root/'node_modules').is_symlink()
for p in physical['packages']:
 location=root/p['path'];assert not location.is_symlink();assert sha(location/'package.json')==p['packageJsonSha256']
for p,h in physical['fileHashes'].items():assert sha(root/p)==h,p
build=json.load(open(packet/'build-provenance.json'));assert build['outputHashes']==json.load(open(old.parent/'build-provenance.json'))['outputHashes']
for p,h in build['sourceHashes'].items():assert sha(root/p)==h,p
for p,h in build['outputHashes'].items():assert sha(root/p)==h,p
comparison=json.load(open(packet/'comparison.json'));assert comparison['buildOutputChanges']==[] and comparison['sourcePinChanges']==['tsconfig.json']
assert all(c['normalNpmCheckExit']==0 and c['allSevenExperimentInputsIncluded'] for c in m['normalChecks'])
# Check the delivery path set without relying on a self-referential delivery commit hash.
delivery=json.load(open(packet/'delivery-list.json'));actual=set(subprocess.check_output(['git','diff','--name-only',m['reviewedBasis'],'HEAD'],cwd=root,text=True).splitlines())
actual.update(str(p.relative_to(root)) for p in packet.rglob('*') if p.is_file());actual.add(m['report']['path']);assert actual==set(delivery['paths'])
print(json.dumps({'artifactsVerified':len(m['files']),'sourcePins':len(m['sourceInputs']),'originalCapturesVerified':len(original['files']),'physicalRuntimePackages':physical['count'],'physicalRuntimeFiles':len(physical['fileHashes']),'buildSourcePins':len(build['sourceHashes']),'buildOutputPins':len(build['outputHashes']),'normalChecks':3,'deliveryPaths':len(delivery['paths'])}))
