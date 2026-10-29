const semver=require('semver');
function compatibleRelease(release,currentVersion,platform,arch){
  const version=String(release?.tag_name||'').replace(/^v/,'');
  if(platform!=='win32'||release?.draft||release?.prerelease||!semver.valid(version)||semver.prerelease(version)||!semver.gt(version,currentVersion))return null;
  const asset=release.assets?.find(a=>a.name===`Foreign-Trade-Assistant-Setup-${version}-${arch}.exe`&&a.state==='uploaded'&&a.size>0&&/^sha256:[a-f0-9]{64}$/.test(a.digest||''));
  const metadata=release.assets?.find(a=>a.name==='latest.yml'&&a.state==='uploaded'&&a.size>0);
  return asset&&metadata?{version,asset}:null;
}
async function discoverRelease(fetchJson,base,currentVersion,platform,arch){
  const latest=await fetchJson(`${base}/releases/latest`);
  const direct=compatibleRelease(latest,currentVersion,platform,arch);
  if(direct)return direct;
  // Re-query the tag when /latest points to an incomplete duplicate record.
  if(/^v?\d+\.\d+\.\d+$/.test(latest?.tag_name||'')){
    try{const exact=await fetchJson(`${base}/releases/tags/${encodeURIComponent(latest.tag_name)}`);const found=compatibleRelease(exact,currentVersion,platform,arch);if(found)return found;}catch(error){if(!/404/.test(error.message))throw error;}
  }
  const releases=await fetchJson(`${base}/releases?per_page=30`);
  const found=(Array.isArray(releases)?releases:[]).map(r=>compatibleRelease(r,currentVersion,platform,arch)).filter(Boolean).sort((a,b)=>semver.rcompare(a.version,b.version))[0];
  if(found)return found;
  const newer=semver.valid(String(latest?.tag_name||'').replace(/^v/,''));
  if(newer&&semver.gt(newer,currentVersion)&&!latest.draft&&!latest.prerelease)throw Error('新版本的安装包尚未完整发布，请稍后重试');
  return null;
}
module.exports={compatibleRelease,discoverRelease};
