const {app}=require('electron');
const fs=require('fs'),os=require('os'),path=require('path'),assert=require('assert/strict');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fta-large-backup-'));
process.env.QUOTE_DATA_DIR=dir;
app.whenReady().then(async()=>{
 let server;
 try{
  server=await require('../server').startServer(0);
  const url=`http://127.0.0.1:${server.address().port}/api/system/browser-state`;
  const text='x'.repeat(54*1024*1024);
  let response=await fetch(url,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({settings:{backupProbe:text},products:[],quotes:[],invitations:[]})});
  assert.equal(response.status,200);assert.equal((await response.json()).ok,true);
  response=await fetch(url);const saved=await response.json();assert.equal(saved.state.settings.backupProbe.length,text.length);
  assert(!fs.existsSync(path.join(dir,'browser-state.json.pending')));
  console.log('PASS: 54 MiB local state saved atomically and read back; no 413.');
 }catch(e){console.error(e);process.exitCode=1;}finally{server?.close();app.exit(process.exitCode||0);}
});
