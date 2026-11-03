const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {_electron:electron}=require('playwright');
(async()=>{
 const executablePath=process.env.TEST_APP_EXE||path.resolve('dist/win-unpacked/外贸助手.exe');
 const expected=require('../package.json').version,dir=fs.mkdtempSync(path.join(os.tmpdir(),'fta-online-update-'));
 const license=path.join(process.env.APPDATA,'foreign-trade-assistant/offline-license.json');
 assert(fs.existsSync(license),'An existing valid local activation is required');
 fs.copyFileSync(license,path.join(dir,'offline-license.json'));
 const env={...process.env,QUOTE_DATA_DIR:dir};delete env.ELECTRON_RUN_AS_NODE;
 const app=await electron.launch({executablePath,env,timeout:60000});
 try{
  const page=await app.firstWindow();await page.waitForSelector('#view-home',{state:'attached',timeout:60000});
  const current=await page.evaluate(()=>quotationDesktop.getAppVersion());assert(current.packaged);
  await page.evaluate(()=>quotationDesktop.checkForUpdates());
  const checked=await page.evaluate(()=>quotationDesktop.getUpdateState());
  if(current.version===expected)assert.equal(checked.status,'current');
  else{assert.equal(checked.status,'available');assert.equal(checked.version,expected);}
  let downloaded=null;
  if(current.version!==expected&&process.env.FTA_TEST_DOWNLOAD_UPDATE==='1'){
   await page.evaluate(()=>quotationDesktop.downloadUpdate());
   downloaded=await page.evaluate(()=>quotationDesktop.getUpdateState());
   assert.equal(downloaded.status,'downloaded');assert.equal(downloaded.version,expected);
  }
  const result={runtime:current,checked,downloaded,installationAttempted:false,dataDirectory:dir};
  fs.mkdirSync('output/release-'+expected,{recursive:true});
  fs.writeFileSync('output/release-'+expected+'/online-'+current.version+'.json',JSON.stringify(result,null,2));
  console.log('PASS real packaged update check'+(downloaded?' and checksum-verified download':'')+'; installer not executed',JSON.stringify(result));
 }finally{const proc=app.process();await Promise.race([app.close(),new Promise(r=>setTimeout(r,10000))]);if(proc.exitCode===null)proc.kill();}
})().catch(error=>{console.error(error);process.exitCode=1;});
