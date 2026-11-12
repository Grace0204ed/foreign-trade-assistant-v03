const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {runPreflight,assessSystem,inspectWindows}=require('../electron/update-preflight.cjs');
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
    const stale={...snapshot,registrations:[{...snapshot.registrations[0],DisplayVersion:'0.11.3'}]};
    assert.match(assessSystem(stale,options).join(),/无法确认实际安装文件/,'Unverifiable mismatched payload must remain blocked');
    const marker=path.join(root,'resources','release-version.json');
    fs.writeFileSync(marker,JSON.stringify({version:options.currentVersion}));
    const recovered=await runPreflight(options,{...dependencies,inspect:async()=>stale});
    assert.equal(recovered.ok,true,'Verified installed payload can recover stale installer bookkeeping');
    assert.match(recovered.diagnostics.warnings.join(),/0.11.3.*0.11.26/);
    assert.equal(recovered.diagnostics.selectedRegistration.DisplayVersion,'0.11.3');
    assert.equal(JSON.parse(fs.readFileSync(path.join(root,'update-preflight.json'))).diagnostics.installedVersion,options.currentVersion);
    assert.equal(fs.readFileSync(marker,'utf8'),JSON.stringify({version:options.currentVersion}),'Preflight must not rewrite installation files or registry');
    assert.deepEqual(assessSystem({...snapshot,registrations:[{...snapshot.registrations[0],DisplayVersion:' 0.11.26.0 '}]},options),[],'Windows four-part display versions are equivalent');
    const duplicate={...snapshot,registrations:[stale.registrations[0],snapshot.registrations[0]]};
    const diagnostic={};assert.deepEqual(assessSystem(duplicate,options,diagnostic),[]);assert.equal(diagnostic.selectedRegistration.DisplayVersion,options.currentVersion);
    fs.writeFileSync(marker,JSON.stringify({version:'0.11.25'}));
    assert.match(assessSystem(snapshot,options).join(),/实际安装文件版本.*0.11.25.*0.11.26/,'Mixed installed files must remain blocked even with matching registry');
    fs.writeFileSync(marker,'invalid');assert.match(assessSystem(snapshot,options).join(),/版本文件无法读取/);
    fs.writeFileSync(marker,JSON.stringify({version:options.currentVersion}));
    assert.match(assessSystem({...stale,registrations:[{...stale.registrations[0],UninstallString:'"'+path.join(root,'missing.exe')+'"'}]},options).join(),/卸载程序不存在/,'Stale-version recovery must not bypass uninstaller validation');
    assert.match(assessSystem({...stale,registrations:[{...stale.registrations[0],InstallLocation:root,UninstallString:'"'+path.join(os.tmpdir(),'other-install','Uninstall.exe')+'"'}]},options).join(),/不属于当前安装目录/);
    assert.match(assessSystem({...snapshot,processes:[...snapshot.processes,{ProcessId:100,ThreadCount:3,ExecutablePath:path.join(root,'外贸助手.exe')}]},options).join(),/其他活跃进程/);
    await assert.rejects(runPreflight({...options,metadata:{...metadata,digest:'sha256:'+'0'.repeat(64)}},dependencies),/校验不通过/);
    await assert.rejects(runPreflight({...options,metadata:{size:17}},dependencies),/缺少可信校验/);
    await assert.rejects(runPreflight({...options,installer:path.join(root,'missing.exe')},dependencies),/自检未通过/);
    await assert.rejects(runPreflight(options,{...dependencies,statfs:()=>({bavail:1,bsize:1})}),/空间不足/);
    await assert.rejects(runPreflight(options,{...dependencies,inspect:async()=>{throw Error('模拟检查超时');}}),/检查超时/);
    assert.equal(fs.readFileSync(path.join(root,'resources','app.asar'),'utf8'),'fixture');
    assert.equal(fs.readdirSync(root).some(name=>name.startsWith('.fta-preflight-')),false);
    if(process.platform==='win32'){
      const live=await inspectWindows();
      assert(Array.isArray(live.registrations)&&Array.isArray(live.processes),'Real PowerShell result must preserve array shape');
      assert(live.processes.some(p=>Number(p.ProcessId)===process.pid),'Real inspection must see the current Windows process');
      for(const entry of live.registrations)assert.equal(typeof entry.PSPath,'string','Registry diagnostics must include the registry source');
    }
    console.log('PASS: preflight, stale registry recovery with verified payload, version normalization, duplicate registrations, mixed/corrupt payload rejection, diagnostics, checksum/file/disk/uninstaller/process failure and no application mutation');
  }finally{fs.rmSync(root,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
