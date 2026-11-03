const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {createDownloader,singleFlight}=require('../electron/update-download.cjs');
const {prepareInstall,readInstallResult}=require('../electron/update-install.cjs');
(async()=>{
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'fta-update-transactions-'));
 try{
  const data=Buffer.from('installer fixture'),asset={name:'setup.exe',size:data.length,digest:'sha256:'+crypto.createHash('sha256').update(data).digest('hex')};
  let requests=0;
  const downloader=createDownloader({folder,fetchAsset:async()=>{requests++;return {ok:true,body:(async function*(){await new Promise(r=>setTimeout(r,15));yield data;})()};}});
  const results=await Promise.all(Array.from({length:25},()=>downloader(asset)));
  assert.equal(new Set(results).size,1);assert.equal(requests,1);
  await downloader(asset);assert.equal(requests,1,'Verified cache is reused');
  fs.writeFileSync(results[0],'invalid');await downloader(asset);assert.equal(requests,2,'Invalid cache redownloaded');
  assert(!fs.readdirSync(folder).some(n=>n.endsWith('.partial')));
  const bad=createDownloader({folder,fetchAsset:async()=>({ok:true,body:(async function*(){yield Buffer.from('truncated');})()})});
  await assert.rejects(()=>bad({...asset,name:'bad.exe'}),/校验失败/);
  assert(!fs.readdirSync(folder).some(n=>n.endsWith('.partial')));
  let attempts=0;const retry=singleFlight(async()=>{if(++attempts===1)throw Error('network');return true;});
  await assert.rejects(retry);assert.equal(await retry(),true);
  const command=prepareInstall({dataDirectory:folder,installer:results[0],version:'0.11.26',installDirectory:folder,pid:123,sourceVersion:'0.11.24'});
  assert(command.includes('-Wait -PassThru'));assert(command.includes('$setup.ExitCode'));assert(command.includes('release-version.json'));
  assert(!command.includes("@('/S'"),'Updates must show the installer, never run silently');
  assert(command.includes('-WindowStyle Normal'),'Installer must be visible');
  const nsis=fs.readFileSync(path.join(__dirname,'../electron/installer.nsh'),'utf8');
  assert.match(nsis,/!macro customInit[\s\S]*\$\{isUpdated\}[\s\S]*SetSilent normal/,'Installer must also override silent mode from legacy updaters');
  assert(command.includes("Record 'cancelled'"),'Cancellation must be recorded');
  assert.equal(readInstallResult(folder,'0.11.24').status,'error');
  assert.equal(readInstallResult(folder,'0.11.26').status,'error','Pending receipt is not installation success');
  const receipt=path.join(folder,'update-install-result.json');
  fs.writeFileSync(receipt,JSON.stringify({status:'cancelled',version:'0.11.26'}));
  assert.match(readInstallResult(folder,'0.11.24').message,/已取消/);
  fs.writeFileSync(receipt,JSON.stringify({status:'installed',version:'0.11.26'}));
  assert.equal(readInstallResult(folder,'0.11.26').status,'current');
  console.log('PASS: 25 concurrent downloads, cache reuse/corruption, interrupted cleanup, retry, install exit/version verification and restart receipt');
 }finally{fs.rmSync(folder,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
