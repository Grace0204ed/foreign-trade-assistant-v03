const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {execFile}=require('node:child_process');
const same=(a,b)=>path.resolve(a||'.').toLowerCase()===path.resolve(b||'.').toLowerCase();
function inspectWindows(){
  const script=`$ErrorActionPreference='Stop'
[Console]::OutputEncoding=New-Object Text.UTF8Encoding($false)
$keys=@('HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\b2b6bf7d-88ae-5db8-aac7-457bd2786b1f','HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\b2b6bf7d-88ae-5db8-aac7-457bd2786b1f','HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\b2b6bf7d-88ae-5db8-aac7-457bd2786b1f')
$registrations=@(foreach($key in $keys){if(Test-Path -LiteralPath $key){Get-ItemProperty -LiteralPath $key|Select-Object PSPath,DisplayVersion,InstallLocation,UninstallString}})
$processes=@(Get-CimInstance Win32_Process|Select-Object ProcessId,ParentProcessId,ExecutablePath,ThreadCount)
@{registrations=$registrations;processes=$processes}|ConvertTo-Json -Depth 4 -Compress`;
  return new Promise((resolve,reject)=>execFile(path.join(process.env.SystemRoot||'C:\\Windows','System32','WindowsPowerShell','v1.0','powershell.exe'),['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true,timeout:20000,maxBuffer:4*1024*1024,encoding:'utf8'},(error,stdout)=>{if(error)return reject(Error('无法检查安装登记或程序占用，请稍后重试：'+error.message));try{resolve(JSON.parse(stdout.replace(/^\uFEFF/,'')));}catch(e){reject(Error('安装环境检查返回无效数据'));}}));
}
const normalizeVersion=value=>String(value??'').trim().replace(/^v/i,'').replace(/^(\d+\.\d+\.\d+)\.0$/,'$1');
function installationState(snapshot,{installDirectory,currentVersion}){
  const registrations=snapshot.registrations||[];
  const uninstallPath=r=>{const match=String(r.UninstallString||'').match(/^"([^"]+)"|^(.*?\.exe)(?:\s|$)/i);return match?(match[1]||match[2]):'';};
  const own=registrations.filter(r=>{const file=uninstallPath(r);return file&&same(path.dirname(file),installDirectory);});
  const registration=own.find(r=>normalizeVersion(r.DisplayVersion)===normalizeVersion(currentVersion))||own[0]||registrations.find(r=>r.InstallLocation&&same(r.InstallLocation,installDirectory));
  let installedVersion='',markerError='';
  try{
    installedVersion=JSON.parse(fs.readFileSync(path.join(installDirectory,'resources','release-version.json'),'utf8').replace(/^\uFEFF/,'')).version||'';
    if(!/^\d+\.\d+\.\d+(?:\.0)?$/.test(normalizeVersion(installedVersion)))markerError='实际安装版本文件无法读取';
  }
  catch(error){if(error.code!=='ENOENT')markerError='实际安装版本文件无法读取';}
  return {registration,uninstaller:registration?uninstallPath(registration):'',installedVersion,markerError,registrations};
}
function assessSystem(snapshot,{installDirectory,currentVersion,pid},diagnostics={}){
  const errors=[],registrations=snapshot.registrations||[];
  const state=installationState(snapshot,{installDirectory,currentVersion});
  const {registration,uninstaller,installedVersion,markerError}=state;
  Object.assign(diagnostics,{installDirectory,currentVersion,installedVersion,registrations,selectedRegistration:registration||null,warnings:[]});
  if(markerError)errors.push(markerError);
  if(installedVersion&&normalizeVersion(installedVersion)!==normalizeVersion(currentVersion))errors.push('实际安装文件版本 '+installedVersion+' 与运行版本 '+currentVersion+' 不一致，请关闭软件后使用官方完整安装包修复');
  if(!registration)errors.push('当前安装登记缺失或卸载路径异常，请联系支持修复安装登记；不要删除业务数据');
  else{
    if(normalizeVersion(registration.DisplayVersion)!==normalizeVersion(currentVersion)){
      // DisplayVersion is installer bookkeeping, not the running payload. Setup
      // rewrites it; a verified release marker allows that bookkeeping to recover.
      const detail='安装登记版本 '+String(registration.DisplayVersion||'未登记')+'，运行版本 '+currentVersion+'，实际安装版本 '+String(installedVersion||'未知');
      if(installedVersion&&normalizeVersion(installedVersion)===normalizeVersion(currentVersion))diagnostics.warnings.push(detail+'；安装完成后将由安装程序更新登记');
      else errors.push(detail+'；无法确认实际安装文件，请关闭软件后使用官方完整安装包修复');
    }
    if(!uninstaller||!same(path.dirname(uninstaller),installDirectory)||!fs.existsSync(uninstaller))errors.push('旧版卸载程序不存在或不属于当前安装目录');
  }
  const family=new Set([Number(pid)]);let changed=true;
  while(changed){changed=false;for(const p of snapshot.processes||[])if(family.has(Number(p.ParentProcessId))&&!family.has(Number(p.ProcessId))){family.add(Number(p.ProcessId));changed=true;}}
  if((snapshot.processes||[]).some(p=>!family.has(Number(p.ProcessId))&&Number(p.ThreadCount)>0&&p.ExecutablePath&&same(path.dirname(p.ExecutablePath),installDirectory)))errors.push('当前安装目录还有其他活跃进程，请关闭另一份外贸助手后重试');
  return errors;
}
async function runPreflight(options,dependencies={}){
  const {installer,metadata,installDirectory,dataDirectory,currentVersion,pid}=options;
  const checks=[];
  const check=async(label,fn)=>{try{await fn();checks.push({label,ok:true});}catch(e){checks.push({label,ok:false,detail:e.message});}};
  await check('安装包完整性',async()=>{
    if(!installer||!metadata)throw Error('安装包或校验信息缺失，请重新检查并下载更新');
    const stat=fs.statSync(installer);
    if(!stat.isFile()||!stat.size||(metadata.size&&stat.size!==Number(metadata.size)))throw Error('安装包大小不符，请重新下载');
    const algorithm=metadata.digest?.startsWith('sha256:')?'sha256':metadata.sha512?'sha512':null;
    if(!algorithm)throw Error('缺少可信校验值，已阻止安装');
    const hash=crypto.createHash(algorithm);for await(const chunk of fs.createReadStream(installer))hash.update(chunk);
    const actual=hash.digest(algorithm==='sha512'?'base64':'hex'),expected=algorithm==='sha512'?metadata.sha512:metadata.digest.slice(7);
    if(actual!==expected)throw Error('安装包校验不通过，请重新下载');
  });
  await check('安装目录与写入权限',()=>{
    if(!installDirectory||same(installDirectory,path.parse(installDirectory).root)||!fs.existsSync(path.join(installDirectory,'resources','app.asar')))throw Error('当前安装目录不完整，请使用官方安装包修复');
    for(const directory of new Set([installDirectory,dataDirectory,path.dirname(installer||dataDirectory)])){
      const probe=path.join(directory,'.fta-preflight-'+crypto.randomUUID());let fd;
      try{fd=fs.openSync(probe,'wx');fs.writeSync(fd,'ok');fs.fsyncSync(fd);}finally{if(fd!==undefined){fs.closeSync(fd);fs.unlinkSync(probe);}}
    }
  });
  await check('磁盘可用空间',()=>{
    const required=Math.max(1024**3,(metadata?.size||0)*4);
    for(const directory of new Set([installDirectory,os.tmpdir(),dataDirectory])){
      const stat=(dependencies.statfs||fs.statfsSync)(directory);if(Number(stat.bavail)*Number(stat.bsize)<required)throw Error('安装目录、临时目录或数据目录所在磁盘可用空间不足，至少需要 '+Math.ceil(required/1024**2)+' MB');
    }
  });
  const diagnostics={};
  await check('旧版安装登记及程序占用',async()=>{
    if((options.platform||process.platform)!=='win32')throw Error('当前安装流程仅支持 Windows');
    const errors=assessSystem(await(dependencies.inspect||inspectWindows)(),{installDirectory,currentVersion,pid},diagnostics);if(errors.length)throw Error(errors.join('；'));
  });
  const result={checkedAt:new Date().toISOString(),currentVersion,checks,diagnostics,ok:checks.every(c=>c.ok)};
  fs.writeFileSync(path.join(dataDirectory,'update-preflight.json'),JSON.stringify(result,null,2));
  if(!result.ok)throw Error('安装前自检未通过，软件未关闭：'+checks.filter(c=>!c.ok).map(c=>c.label+'：'+c.detail).join('；'));
  return result;
}
module.exports={runPreflight,assessSystem,inspectWindows};
