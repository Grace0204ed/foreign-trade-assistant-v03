const fs=require('node:fs'),path=require('node:path');
const quote=value=>"'"+String(value).replace(/'/g,"''")+"'";
function prepareInstall({dataDirectory,installer,version,installDirectory,pid,sourceVersion,metadata}){
  if(!/^\d+\.\d+\.\d+$/.test(version||''))throw Error('安装目标版本无效，请重新检查更新');
  const receipt=path.join(dataDirectory,'update-install-result.json');
  fs.writeFileSync(receipt,JSON.stringify({status:'pending',version,sourceVersion,installer,installDirectory,startedAt:new Date().toISOString()}));
  return `$ErrorActionPreference='Stop'
$receipt=${quote(receipt)}
$log=${quote(path.join(dataDirectory,'update-install.log'))}
function Record($status,$message) {
  $result=@{status=$status;version=${quote(version)};message=$message;updatedAt=[DateTime]::UtcNow.ToString('o')}
  $json=$result|ConvertTo-Json -Compress
  [IO.File]::WriteAllText($receipt,$json,(New-Object Text.UTF8Encoding($false)))
  Add-Content -LiteralPath $log -Value $json
}
try {
  Record 'waiting' 'Waiting for application exit'
  $deadline=(Get-Date).AddSeconds(60)
  while ((Get-Process -Id ${Number(pid)} -ErrorAction SilentlyContinue) -and (Get-Date) -lt $deadline) { Start-Sleep -Milliseconds 250 }
  if(Get-Process -Id ${Number(pid)} -ErrorAction SilentlyContinue){throw 'Application did not exit within 60 seconds; no installation performed'}
  ${metadata?`$hash=Get-FileHash -LiteralPath ${quote(installer)} -Algorithm ${metadata.digest?.startsWith('sha256:')?'SHA256':'SHA512'}
  $expected=${quote(metadata.digest?.startsWith('sha256:')?metadata.digest.slice(7):Buffer.from(metadata.sha512,'base64').toString('hex'))}
  if($hash.Hash -ne $expected){throw 'Installer changed after preflight; installation blocked'}`:''}
  Record 'installing' '安装窗口已打开，请查看安装进度并完成安装向导'
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
module.exports={prepareInstall,readInstallResult};
