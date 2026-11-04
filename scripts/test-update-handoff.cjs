const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {EventEmitter}=require('node:events');
const {spawn}=require('node:child_process');
const {launchInstall}=require('../electron/update-install.cjs');
(async()=>{
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'fta-handoff-test-'));
 const options={dataDirectory:folder,installer:'C:/not-executed.exe',installDirectory:folder,pid:process.pid,version:'0.11.31',sourceVersion:'0.11.30'};
 const fixture=Buffer.from('handoff checksum fixture');
 options.installer=path.join(folder,'fixture.exe');fs.writeFileSync(options.installer,fixture);
 options.metadata={sha512:crypto.createHash('sha512').update(fixture).digest('base64')};
 try{
  const child=()=>Object.assign(new EventEmitter(),{exitCode:null,kill(){this.killed=true;},unref(){}});
  await assert.rejects(launchInstall(options,{spawnProcess:()=>{const c=child();queueMicrotask(()=>c.emit('error',Error('launch denied')));return c;}}),/launch denied.*软件未关闭/);
  await assert.rejects(launchInstall(options,{spawnProcess:()=>Object.assign(child(),{exitCode:1})}),/提前退出/);
  let silent;await assert.rejects(launchInstall(options,{timeoutMs:150,spawnProcess:()=>silent=child()}),/启动超时/);assert(silent.killed);
  if(process.platform==='win32'){
   // Run the real handoff in an independent Node parent. Replace only the
   // installer invocation with a marker, so this test cannot install anything.
   const marker=path.join(folder,'after-parent-exit.txt');
   const harness=`
const {spawn}=require('node:child_process');
const {launchInstall}=require(${JSON.stringify(require.resolve('../electron/update-install.cjs'))});
(async()=>{
 await launchInstall({...${JSON.stringify(options)},pid:process.pid}, {spawnProcess:(exe,args,opts)=>{
  let bootstrap=Buffer.from(args[args.length-1],'base64').toString('utf16le');
  const encoded=bootstrap.match(/'([A-Za-z0-9+/=]{100,})'/)[1];
  let script=Buffer.from(encoded,'base64').toString('utf16le');
  script=script.slice(0,script.indexOf('  $setup=Start-Process'))+${JSON.stringify("  [IO.File]::WriteAllText('"+marker.replace(/'/g,"''")+"','survived')\n} catch { exit 1 }")};
  bootstrap=bootstrap.replace(encoded,Buffer.from(script,'utf16le').toString('base64'));
  args[args.length-1]=Buffer.from(bootstrap,'utf16le').toString('base64');
  return spawn(exe,args,{...opts,env:{...process.env,PSModulePath:'C:/missing-module-directory'}});
 }});
 process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});`;
   const parent=spawn(process.execPath,['-e',harness],{stdio:['ignore','pipe','pipe'],windowsHide:true});let err='';parent.stderr.on('data',b=>err+=b);assert.equal(await new Promise(r=>parent.once('exit',r)),0,err);
   for(let i=0;i<100&&!fs.existsSync(marker);i++)await new Promise(r=>setTimeout(r,100));
   assert(fs.existsSync(marker),'helper must survive parent exit; '+fs.readFileSync(path.join(folder,'update-helper.log'),'utf8')+'; receipt='+fs.readFileSync(path.join(folder,'update-install-result.json'),'utf8'));
   assert.equal(fs.readFileSync(marker,'utf8'),'survived','helper must survive parent exit');
  }
  console.log('PASS: startup error, early exit, timeout, actual PowerShell readiness and helper survives parent exit');
 }finally{fs.rmSync(folder,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
