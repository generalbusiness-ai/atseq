import{readFileSync}from'node:fs';
const root='experiments/post-spike-evidence/r0-native-f1/gates/';
const records=['node22','node24','node26'].map(n=>JSON.parse(readFileSync(root+n+'-build-provenance.json')));
for(const key of ['sourceHashes','outputHashes','semanticContracts'])
  if(records.some(r=>JSON.stringify(r[key])!==JSON.stringify(records[0][key])))throw Error('Builds differ: '+key);
