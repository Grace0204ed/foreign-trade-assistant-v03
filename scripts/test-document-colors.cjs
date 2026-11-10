const {app,BrowserWindow}=require('electron'),assert=require('assert/strict'),fs=require('fs'),os=require('os'),path=require('path');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fta-drafts-v4-'));process.env.QUOTE_DATA_DIR=path.join(dir,'data');app.setPath('userData',path.join(dir,'profile'));app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{const server=await require('../server').startServer(0),base='http://127.0.0.1:'+server.address().port,win=new BrowserWindow({show:false,width:1500,height:1000}),run=async s=>{try{return await win.webContents.executeJavaScript(s);}catch(error){throw Error(error.message+"\n"+s);}};
const wait=async s=>{for(let i=0;i<240;i++){if(await run(s))return;await new Promise(r=>setTimeout(r,40));}throw Error('Timeout '+s);};
 const drafts=async()=>{const r=await fetch(base+'/api/work-drafts');return (await r.json()).drafts.filter(r=>!r.completedAt);};
 const set=async(id,value)=>run(`(()=>{const e=document.getElementById('${id}');e.value=${JSON.stringify(value)};e.dispatchEvent(new Event('input',{bubbles:true}));})()`);
 try{

  await win.loadURL(base);await wait('!!window.flushPendingWork');
  for(const type of ['quotation','invoice','contract','commercial','packing','authorization','statement','invitation']){await run(`window.decideCloseWork('discard')`);await run(`document.querySelector('[data-create-document=${type}]').click()`);const input=type==='invitation'?'invitation-color':['authorization','statement','procurement'].includes(type)?'agency-color':'document-table-color';await set(input,'#1f7047');}
  await run('window.flushPendingWork()');assert.equal(Object.keys((await(await fetch(base+'/api/settings')).json()).settings.documentColorPreferences).length,8);
  await win.loadURL(base.replace('127.0.0.1','localhost'));await wait('!!window.flushPendingWork');
  assert.equal(await run(`Object.keys(quoteSettingsContext.settings.documentColorPreferences).length`),8);console.log('PASS independent document colors survive fresh origin');

 }finally{win.destroy();server.closeAllConnections?.();await new Promise(r=>server.close(r));app.quit();}
}).catch(error=>{console.error(error);app.exit(1);});
