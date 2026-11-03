const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {runPreflight,assessSystem}=require('../electron/update-preflight.cjs');
(async()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'fta-preflight-test-'));
  try{
    fs.mkdirSync(path.join(root,'resources'));fs.writeFileSync(path.join(root,'resources','app.asar'),'fixture');
    const installer=path.join(root,'setup.exe'),uninstaller=path.join(root,'Uninstall.exe');fs.writeFileSync(installer,'installer fixture');fs.writeFileSync(uninstaller,'fixture');
    const metadata={size:17,digest:'sha256:'+crypto.createHash('sha256').update('installer fixture').digest('hex')};
    const options={installer,metadata,installDirectory:root,dataDirectory:root,currentVersion:'0.11.26',pid:123,platform:'win32'};
    const snapshot={registrations:[{DisplayVersion:'0.11.26',UninstallString:'"'+uninstaller+'"'}],processes:[{ProcessId:123,ThreadCount:10,ExecutablePath:path.join(root,'外贸助手.exe')},{ProcessId:124,ParentProcessId:123,ThreadCount:4,ExecutablePath:path.join(root,'外贸助手.exe')},{ProcessId:9,ThreadCount:0,ExecutablePath:null}]};
    const dependencies={inspect:async()=>snapshot,statfs:()=>({bavail:10*1024**3,bsize:1})};
    assert.equal((await runPreflight(options,dependencies)).ok,true);
    assert.deepEqual(assessSystem(snapshot,options),[]);
    assert.match(assessSystem({...snapshot,registrations:[]},options).join(),/登记缺失/);
    assert.match(assessSystem({...snapshot,registrations:[{...snapshot.registrations[0],DisplayVersion:'0.11.3'}]},options).join(),/版本不一致/);
    assert.match(assessSystem({...snapshot,processes:[...snapshot.processes,{ProcessId:100,ThreadCount:3,ExecutablePath:path.join(root,'外贸助手.exe')}]},options).join(),/其他活跃进程/);
    await assert.rejects(runPreflight({...options,metadata:{...metadata,digest:'sha256:'+'0'.repeat(64)}},dependencies),/校验不通过/);
    await assert.rejects(runPreflight({...options,metadata:{size:17}},dependencies),/缺少可信校验/);
    await assert.rejects(runPreflight({...options,installer:path.join(root,'missing.exe')},dependencies),/自检未通过/);
    await assert.rejects(runPreflight(options,{...dependencies,statfs:()=>({bavail:1,bsize:1})}),/空间不足/);
    await assert.rejects(runPreflight(options,{...dependencies,inspect:async()=>{throw Error('模拟检查超时');}}),/检查超时/);
    assert.equal(fs.readFileSync(path.join(root,'resources','app.asar'),'utf8'),'fixture');
    assert.equal(fs.readdirSync(root).some(name=>name.startsWith('.fta-preflight-')),false);
    console.log('PASS: preflight success, checksum/missing metadata/file/disk/registration/process/inspection failure, no application mutation');
  }finally{fs.rmSync(root,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
