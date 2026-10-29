const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'publish-release.cjs'),'utf8');
const version='0.11.5',installer=`Foreign-Trade-Assistant-Setup-${version}-x64.exe`,names=[installer,installer+'.blockmap','latest.yml'];
const exe=Buffer.from('test installer'),hash=crypto.createHash('sha512').update(exe).digest('base64');
const files={[installer]:exe,[installer+'.blockmap']:Buffer.from('map'),'latest.yml':Buffer.from(`version: ${version}\npath: ${installer}\nsha512: ${hash}`)};
function probe(initial){
  const calls=[];let release=initial[0]||{id:77,tag_name:'v'+version,draft:true};
  release={...release,assets:names.map(name=>({name,state:'uploaded',size:files[name].length}))};
  const execFileSync=(command,args)=>{
    calls.push(args);
    if(args[0]==='release'&&args[1]==='upload')return '';
    if(args[1].includes('?per_page'))return JSON.stringify(initial);
    if(args.includes('POST')||/\/releases\/77$/.test(args[1]))return JSON.stringify(release);
    throw Error('Unexpected command '+args.join(' '));
  };
  const mocks={'node:fs':{statSync:p=>({size:files[path.basename(p)].length}),readFileSync:(p,enc)=>enc?files[path.basename(p)].toString():files[path.basename(p)]},'node:path':path,'node:crypto':crypto,'node:child_process':{execFileSync},'node:assert/strict':assert,'../package.json':{version}};
  vm.runInNewContext(source,{require:n=>mocks[n],__dirname,process:{env:{GH_REPO:'test/repo'}},console:{log(){}}});
  assert(calls.some(a=>a.includes('PATCH')&&a.includes('draft=false')),'Must publish after verifying assets');
  assert(!calls.some(a=>a[1]?.includes('/tags/')),'Draft must be read by ID, not public tag endpoint');
  return calls;
}
probe([]);probe([{id:77,tag_name:'v'+version,draft:true}]);
assert.throws(()=>probe([{id:77,tag_name:'v'+version,draft:false}]),/already public/);
assert.throws(()=>probe([{id:77,tag_name:'v'+version,draft:true},{id:78,tag_name:'v'+version,draft:true}]),/Duplicate releases/);
console.log('Release publication tests passed: draft ID, complete assets, duplicate rejection and immutable public releases.');
