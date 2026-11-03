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
  Record 'installing' 'Starting verified installer'
  $setup=Start-Process -FilePath ${quote(installer)} -ArgumentList @('/S','--updated',${quote('/D='+installDirectory)}) -Wait -PassThru
  if($setup.ExitCode -ne 0){throw ('Installer exit code '+$setup.ExitCode)}
  $marker=Get-Content -LiteralPath ${quote(path.join(installDirectory,'resources','release-version.json'))} -Raw|ConvertFrom-Json
  if($marker.version -ne ${quote(version)}){throw 'Installer finished but installed version did not change'}
  Record 'installed' 'Installed version verified'
  Start-Process -FilePath ${quote(path.join(installDirectory,'外贸助手.exe'))}
} catch {
  Record 'error' $_.Exception.Message
  Add-Type -AssemblyName PresentationFramework
  [System.Windows.MessageBox]::Show(('Update installation failed. Your business data is unchanged. See: '+$log),'Foreign Trade Assistant update')|Out-Null
  exit 1
}`;
}
function readInstallResult(directory,currentVersion){
  try{
    const result=JSON.parse(fs.readFileSync(path.join(directory,'update-install-result.json'),'utf8').replace(/^\uFEFF/,''));
    if(result.version===currentVersion)return {status:'current',version:currentVersion,percent:100,message:`已成功更新到 ${currentVersion}`};
    if(['pending','waiting','installing','installed','error'].includes(result.status))return {status:'error',percent:0,message:`上次更新未完成，当前仍是 ${currentVersion}。${result.message||'安装未结束'}；安装日志：${path.join(directory,'update-install.log')}`};
  }catch(error){if(error.code!=='ENOENT')return {status:'error',message:'无法读取上次安装结果：'+error.message};}
  return null;
}
module.exports={prepareInstall,readInstallResult};
