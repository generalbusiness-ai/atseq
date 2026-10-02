import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join,resolve,dirname,relative} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(process.argv[2]);
const {ts}=await import(pathToFileURL(join(root,'node_modules/ts-morph/dist/ts-morph.js')));
const out=join(root,'.atseq-local/a2f1-compiled');
const hashes={},emitted=new Set();
async function compile(file){
 const target=join(out,relative(root,file).replace(/\.ts$/,'.js'));
 if(emitted.has(file))return target; emitted.add(file);
 let source=await readFile(file,'utf8');hashes[relative(root,file)]=createHash('sha256').update(source).digest('hex');
 if(relative(root,file)==='tests/helpers/writer-process.ts'){
  const child=await compile(join(root,'tests/helpers/writer-child.ts'));
  source=source.replace("new URL('./writer-child.ts', import.meta.url)", 'new URL('+JSON.stringify(pathToFileURL(child).href)+')').replace("execArgv: ['--import', 'tsx']", 'execArgv: []');
 }
 const tree=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true),edits=[];
 for(const item of tree.statements){
  if(!ts.isImportDeclaration(item)||!ts.isStringLiteral(item.moduleSpecifier))continue;
  const name=item.moduleSpecifier.text;if(!name.startsWith('.'))continue;
  const original=resolve(dirname(file),name); if(!original.startsWith(root+'/'))throw Error('Input escaped root');
  const actual=original.startsWith(join(root,'src')+'/')?join(root,'dist',relative(root,original).replace(/\.ts$/,'.js')):original.endsWith('.ts')?await compile(original):original;
  if(!original.endsWith('.ts')&&!original.startsWith(join(root,'src')+'/'))hashes[relative(root,original)]=createHash('sha256').update(await readFile(original)).digest('hex');
  edits.push({start:item.moduleSpecifier.getStart(tree),end:item.moduleSpecifier.end,value:JSON.stringify(pathToFileURL(actual).href)});
 }
 for(const edit of edits.reverse())source=source.slice(0,edit.start)+edit.value+source.slice(edit.end);
 const code=ts.transpileModule(source,{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 await mkdir(dirname(target),{recursive:true});await writeFile(target,code);return target;
}
const tests=await Promise.all(['tests/host-availability.test.ts','tests/pds.test.ts'].map(x=>compile(join(root,x))));
await writeFile(join(out,'input-pins.json'),JSON.stringify({format:'existing-test-transpile-with-actual-dist-src-imports',runtimeClaim:'production src imports use actual dist; test-only helpers and writer child transpiled; writer subprocess uses actual dist without tsx; official PDS environment JS unchanged',tests,sourceHashes:hashes},null,2)+'\n');
console.log(JSON.stringify({tests,testInputPins:Object.keys(hashes).length}));
