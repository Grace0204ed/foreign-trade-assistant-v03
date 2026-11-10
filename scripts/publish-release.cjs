const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process'),assert=require('node:assert/strict');
const version=require('../package.json').version,tag=`v${version}`,root=process.env.FTA_RELEASE_DIR||path.resolve(__dirname,'../dist');
const installer=`Foreign-Trade-Assistant-Setup-${version}-x64.exe`,names=[installer,installer+'.blockmap','latest.yml'];
const gh=(...args)=>execFileSync('gh',args,{encoding:'utf8',stdio:['ignore','pipe','pipe']});
const changelog=fs.readFileSync(path.resolve(__dirname,'../CHANGELOG.md'),'utf8');
const releaseNotes=changelog.split(/^## /m).find(section=>section.startsWith(version+' '));
assert(releaseNotes,'Missing version-specific changelog; refusing generic release notes');
const body=`外贸助手 v${version}\n\n${releaseNotes.slice(releaseNotes.indexOf('\n')).trim()}\n\n安装更新会保留本机业务数据，更新前请保存单据并备份。`;
for(const name of names)assert(fs.statSync(path.join(root,name)).size>0,`Missing release file ${name}`);
const yaml=fs.readFileSync(path.join(root,'latest.yml'),'utf8');
assert(yaml.includes(`version: ${version}`)&&yaml.includes(installer),'Update metadata version/installer mismatch');
const digest=crypto.createHash('sha512').update(fs.readFileSync(path.join(root,installer))).digest('base64');
assert(yaml.includes(digest),'Update metadata SHA512 mismatch');
// Drafts are not returned by the public tag endpoint. Resolve by ID from the
// authenticated release list and retain that ID through upload and publication.
const matches=JSON.parse(gh('api',`repos/${process.env.GH_REPO}/releases?per_page=100`)).filter(r=>r.tag_name===tag);
assert(matches.length<=1,`Duplicate releases found for ${tag}; repair them before publishing`);
let release=matches[0];
if(release&&!release.draft)throw Error(`Release ${tag} is already public; refusing to overwrite immutable update files`);
if(!release){release=JSON.parse(gh('api',`repos/${process.env.GH_REPO}/releases`,'--method','POST','-f',`tag_name=${tag}`,'-f',`name=外贸助手 v${version}`,...(process.env.GITHUB_SHA?['-f',`target_commitish=${process.env.GITHUB_SHA}`]:[]),'-F','draft=true','-f',`body=${body}`));}
gh('release','upload',tag,...names.map(n=>path.join(root,n)),'--clobber');
release=JSON.parse(gh('api',`repos/${process.env.GH_REPO}/releases/${release.id}`));
for(const name of names){const asset=release.assets.find(a=>a.name===name);assert(asset?.state==='uploaded'&&asset.size===fs.statSync(path.join(root,name)).size,`Upload incomplete: ${name}`);}
gh('api',`repos/${process.env.GH_REPO}/releases/${release.id}`,'--method','PATCH','-f',`body=${body}`,'-F','draft=false','-f','make_latest=true');
console.log(`Published complete release ${tag} (${names.length} verified files)`);
