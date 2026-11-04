const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const quote=value=>"'"+String(value).replace(/'/g,"''")+"'";
// Use Windows' own modules rather than inherited PSModulePath/autoload settings.
const systemModules="Import-Module ([IO.Path]::Combine($PSHOME,'Modules\\Microsoft.PowerShell.Utility\\Microsoft.PowerShell.Utility.psd1')) -ErrorAction Stop; Import-Module ([IO.Path]::Combine($PSHOME,'Modules\\Microsoft.PowerShell.Management\\Microsoft.PowerShell.Management.psd1')) -ErrorAction Stop";
function prepareInstall({dataDirectory,installer,version,installDirectory,pid,sourceVersion,metadata,attemptId=''}){
  if(!/^\d+\.\d+\.\d+$/.test(version||''))throw Error('安装目标版本无效，请重新检查更新');
  const receipt=path.join(dataDirectory,'update-install-result.json');
  fs.writeFileSync(receipt,JSON.stringify({status:'pending',version,sourceVersion,installer,installDirectory,startedAt:new Date().toISOString()}));
  return `$ErrorActionPreference='Stop'
${systemModules}
$receipt=${quote(receipt)}
$ProgressPreference='SilentlyContinue'
$log=${quote(path.join(dataDirectory,'update-install.log'))}
function Record($status,$message) {
  $result=@{status=$status;version=${quote(version)};attemptId=${quote(attemptId)};message=$message;updatedAt=[DateTime]::UtcNow.ToString('o')}
  $json=$result|ConvertTo-Json -Compress
  [IO.File]::WriteAllText($receipt,$json,(New-Object Text.UTF8Encoding($false)))
  Add-Content -LiteralPath $log -Value $json
}
try {
  Record 'waiting' 'Waiting for application exit'
  $deadline=(Get-Date).AddSeconds(60)
  function AppRunning { @(Get-Process -Id ${Number(pid)} -ErrorAction SilentlyContinue | Where-Object { $_.Threads.Count -gt 0 }).Count -gt 0 }
  while ((AppRunning) -and (Get-Date) -lt $deadline) { Start-Sleep -Milliseconds 250 }
  if(AppRunning){throw 'Application did not exit within 60 seconds; no installation performed'}
  ${metadata?`$algorithm=[System.Security.Cryptography.HashAlgorithm]::Create('${metadata.digest?.startsWith('sha256:')?'SHA256':'SHA512'}')
  $stream=$null
  try {
    $stream=[System.IO.File]::OpenRead(${quote(installer)})
    $hash=[System.BitConverter]::ToString($algorithm.ComputeHash($stream)).Replace('-','')
  } finally {
    if($null -ne $stream){$stream.Dispose()}
    if($null -ne $algorithm){$algorithm.Dispose()}
  }
  $expected=${quote(metadata.digest?.startsWith('sha256:')?metadata.digest.slice(7):Buffer.from(metadata.sha512,'base64').toString('hex'))}
  if($hash -ne $expected){throw 'Installer changed after preflight; installation blocked'}`:''}
  Record 'installing' '正在启动可见安装向导，请在安装窗口中完成安装'
  $setup=Start-Process -FilePath ${quote(installer)} -ArgumentList @('--updated',${quote('/D='+installDirectory)}) -WindowStyle Normal -Wait -PassThru
  if($setup.ExitCode -eq 1 -or $setup.ExitCode -eq 1602){
    Record 'cancelled' '已取消安装，当前版本和业务数据保持不变，可重新检查更新后安装'
    Start-Process -FilePath ${quote(path.join(installDirectory,'外贸助手.exe'))}
    exit 0
  }
  if($setup.ExitCode -ne 0){throw ('Installer exit code '+$setup.ExitCode)}
  $marker=Get-Content -LiteralPath ${quote(path.join(installDirectory,'resources','release-version.json'))} -Raw|ConvertFrom-Json
  if($marker.version -ne ${quote(version)}){throw 'Installer finished but installed version did not change'}
  Record 'installed' 'Installed version verified'
  Start-Process -FilePath ${quote(path.join(installDirectory,'外贸助手.exe'))}
} catch {
  Record 'error' $_.Exception.Message
  Add-Type -AssemblyName PresentationFramework
  [System.Windows.MessageBox]::Show(('更新安装未完成：'+$_.Exception.Message+[Environment]::NewLine+'业务数据未删除。安装日志：'+$log),'外贸助手更新')|Out-Null
  exit 1
}`;
}
function readInstallResult(directory,currentVersion){
  try{
    const result=JSON.parse(fs.readFileSync(path.join(directory,'update-install-result.json'),'utf8').replace(/^\uFEFF/,''));
    if(result.status==='installed'&&result.version===currentVersion)return {status:'current',version:currentVersion,percent:100,message:`已成功更新到 ${currentVersion}，安装与版本核对已完成`};
    if(result.status==='cancelled')return {status:'error',percent:0,message:`已取消更新安装，当前版本 ${currentVersion}。可重新检查更新后安装。`};
    if(['pending','waiting','installing','installed','error'].includes(result.status))return {status:'error',percent:0,message:`上次更新未完成，当前仍是 ${currentVersion}。${result.message||'安装未结束'}；安装日志：${path.join(directory,'update-install.log')}`};
  }catch(error){if(error.code!=='ENOENT')return {status:'error',message:'无法读取上次安装结果：'+error.message};}
  return null;
}
async function launchInstall(options,{timeoutMs=15000,spawnProcess=spawn}={}){
  const attemptId=crypto.randomUUID();
  const command=prepareInstall({...options,attemptId});
  const powershell=path.join(process.env.SystemRoot||'C:\\Windows','System32','WindowsPowerShell','v1.0','powershell.exe');
  const encoded=Buffer.from(command,'utf16le').toString('base64');
  const bootstrap=`$ErrorActionPreference='Stop'; ${systemModules}; Start-Process -FilePath ${quote(powershell)} -ArgumentList @('-NoProfile','-NonInteractive','-EncodedCommand',${quote(encoded)}) -WindowStyle Hidden -ErrorAction Stop | Out-Null`;
  const log=path.join(options.dataDirectory,'update-helper.log');
  const fd=fs.openSync(log,'a');
  let child;
  try{
    // PowerShell's Start-Process creates an independent Windows process/console.
    // Node DETACHED_PROCESS may exit without executing PowerShell; a directly
    // attached helper can instead receive console termination when the app exits.
    child=spawnProcess(powershell,
      ['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(bootstrap,'utf16le').toString('base64')],
      {detached:false,stdio:['ignore',fd,fd],windowsHide:true});
  }finally{fs.closeSync(fd);}
  let failure=null;
  child.once('error',error=>{failure=error;});
  const deadline=Date.now()+timeoutMs;
  while(Date.now()<deadline){
    if(failure)break;
    try{
      const result=JSON.parse(fs.readFileSync(path.join(options.dataDirectory,'update-install-result.json'),'utf8').replace(/^\uFEFF/,''));
      if(result.attemptId===attemptId&&result.status==='waiting'){child.unref();return {child,attemptId};}
      if(result.attemptId===attemptId&&result.status==='error'){failure=Error(result.message);break;}
    }catch(error){if(error.code!=='ENOENT'&&!(error instanceof SyntaxError)){failure=error;break;}}
    if(child.exitCode!==null&&child.exitCode!==undefined&&child.exitCode!==0){failure=Error('安装辅助程序提前退出，退出码 '+child.exitCode);break;}
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  try{child.kill();}catch(_){}
  const message=(failure?.message||'安装辅助程序启动超时')+'；软件未关闭，请重试。诊断日志：'+log;
  fs.writeFileSync(path.join(options.dataDirectory,'update-install-result.json'),JSON.stringify({status:'error',version:options.version,message}));
  throw Error(message);
}
module.exports={prepareInstall,readInstallResult,launchInstall};
