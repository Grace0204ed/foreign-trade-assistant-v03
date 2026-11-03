'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const crypto=require('node:crypto'),zlib=require('node:zlib'),asar=require('@electron/asar');
const root=path.resolve(__dirname,'..'),version=require('../package.json').version;
const archive=path.join(root,'dist/win-unpacked/resources/app.asar');
const entries=asar.listPackage(archive).map(p=>p.replace(/^[\\/]/,'').replace(/\\/g,'/'));
const privatePaths=entries.filter(p=>/(^|\/)(?:data|uploads|backups|output|\.git)(?:\/|$)|\.(?:sqlite(?:-wal|-shm)?|db|pfx|p12)$|(^|\/)(?:browser-state|offline-license)\.json$|(^|\/)\.env(?:\.|$)/i.test(p));
assert.deepEqual(privatePaths,[],'Private or local data paths in package');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const files=[];
for(const folder of ['assets','server','electron','crm']){
  const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else files.push(path.relative(root,file).replace(/\\/g,'/'));
  }};walk(path.join(root,folder));
}
files.push('app.js','index.html','styles.css','manifest.webmanifest');
for(const file of files){assert(entries.includes(file),'Missing '+file);assert.equal(hash(asar.extractFile(archive,path.normalize(file))),hash(fs.readFileSync(path.join(root,file))),'Packaged source mismatch '+file);}
assert.equal(JSON.parse(asar.extractFile(archive,'package.json')).version,version);
const privateKey=/-----BEGIN (?:RSA |EC |OPENSSH |ED25519 )?PRIVATE KEY-----/;
for(const file of entries){
  if(!/\.(?:js|cjs|json|pem|txt|html|css)$/i.test(file))continue;
  const metadata=asar.statFile(archive,path.normalize(file));
  if(metadata.files||metadata.size>2*1024*1024)continue;
  assert(!privateKey.test(asar.extractFile(archive,path.normalize(file)).toString('utf8')),'Private key in '+file);
}
const installer=`Foreign-Trade-Assistant-Setup-${version}-x64.exe`,bytes=fs.readFileSync(path.join(root,'dist',installer));
const yaml=fs.readFileSync(path.join(root,'dist/latest.yml'),'utf8');
assert(yaml.includes(`version: ${version}`)&&yaml.includes(installer));
assert(yaml.includes(crypto.createHash('sha512').update(bytes).digest('base64')),'SHA512 mismatch');
assert(yaml.includes(`size: ${bytes.length}`),'Installer size mismatch');
const map=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,'dist',installer+'.blockmap'))));
assert(map.files.length>0);
for(const file of map.files){assert.equal(file.sizes.length,file.checksums.length);assert.equal(file.offset+file.sizes.reduce((a,b)=>a+b,0),bytes.length);}
const update=fs.readFileSync(path.join(root,'dist/win-unpacked/resources/app-update.yml'),'utf8');
assert(update.includes('Grace0204ed')&&update.includes('foreign-trade-assistant-v03'));
fs.mkdirSync(path.join(root,'output/release-'+version),{recursive:true});
const result={version,sourceFilesCompared:files.length,archiveEntries:entries.length,privatePaths:0,installer,bytes:bytes.length,sha256:hash(bytes),blockmap:true,latestSha512:true};
fs.writeFileSync(path.join(root,'output/release-'+version+'/package-audit.json'),JSON.stringify(result,null,2));
console.log('PASS package source/resources, no local data/private keys, installer/blockmap/latest.yml/update target',JSON.stringify(result));
