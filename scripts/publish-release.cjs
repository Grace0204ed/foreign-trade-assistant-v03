const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process'),assert=require('node:assert/strict');
const version=require('../package.json').version,tag=`v${version}`,root=path.resolve(__dirname,'../dist');
const installer=`Foreign-Trade-Assistant-Setup-${version}-x64.exe`,names=[installer,installer+'.blockmap','latest.yml'];
const gh=(...args)=>execFileSync('gh',args,{encoding:'utf8',stdio:['ignore','pipe','pipe']});
for(const name of names)assert(fs.statSync(path.join(root,name)).size>0,`Missing release file ${name}`);
const yaml=fs.readFileSync(path.join(root,'latest.yml'),'utf8');
assert(yaml.includes(`version: ${version}`)&&yaml.includes(installer),'Update metadata version/installer mismatch');
const digest=crypto.createHash('sha512').update(fs.readFileSync(path.join(root,installer))).digest('base64');
assert(yaml.includes(digest),'Update metadata SHA512 mismatch');
let release;
try{release=JSON.parse(gh('api',`repos/${process.env.GH_REPO}/releases/tags/${tag}`));}catch(e){if(!String(e.stderr).includes('404'))throw e;}
if(release&&!release.draft)throw Error(`Release ${tag} is already public; refusing to overwrite immutable update files`);
if(!release){gh('release','create',tag,'--draft','--title',`外贸助手 v${version}`,'--notes',`外贸助手 ${version}：更新修复和稳定性改进。`);}
gh('release','upload',tag,...names.map(n=>path.join(root,n)),'--clobber');
release=JSON.parse(gh('api',`repos/${process.env.GH_REPO}/releases/tags/${tag}`));
for(const name of names){const asset=release.assets.find(a=>a.name===name);assert(asset?.state==='uploaded'&&asset.size===fs.statSync(path.join(root,name)).size,`Upload incomplete: ${name}`);}
gh('release','edit',tag,'--draft=false','--latest');
console.log(`Published complete release ${tag} (${names.length} verified files)`);
