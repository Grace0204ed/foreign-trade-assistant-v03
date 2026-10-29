// Exercise the EXACT installed fallback function with Electron networking, without UI or installation.
const {app,net}=require('electron'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),os=require('node:os');
app.commandLine.appendSwitch('disable-http2');
app.whenReady().then(async()=>{
  const archive=path.join(process.env.LOCALAPPDATA,'Programs/foreign-trade-assistant/resources/app.asar');
  const asar=require('@electron/asar'),source=asar.extractFile(archive,'electron/main.js').toString();
  const installed=JSON.parse(asar.extractFile(archive,'package.json')).version;
  const start=source.indexOf('let fallbackRelease = null;'),end=source.indexOf('let latestUpdateState',start);
  if(start<0||end<0)throw Error('Installed update function not found');
  const folder=fs.mkdtempSync(path.join(os.tmpdir(),'fta-update-probe-'));
  const context=vm.createContext({require,process,net,fs,path,AbortSignal,app:{getVersion:()=>installed},dataDir:()=>folder,
    publishUpdateState:s=>{if(s.status!=='downloading'||s.percent%20===0)console.log(JSON.stringify(s));}});
  vm.runInContext('let downloadedUpdateFile="";'+source.slice(start,end),context);
  await vm.runInContext('githubUpdateFallback(false)',context);
  if(process.argv.includes('--download'))await vm.runInContext('githubUpdateFallback(true)',context);
  console.log('INSTALLED_UPDATER_PROBE_OK version='+installed);
  app.quit();
}).catch(e=>{console.error(e);app.exit(1);});
