(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.UpdatePolicy=factory();})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const parts=value=>String(value||'0').replace(/^v/,'').split('-')[0].split('.').map(n=>Number(n)||0);
  function compare(a,b){const x=parts(a),y=parts(b);for(let i=0;i<Math.max(x.length,y.length);i++){if((x[i]||0)!==(y[i]||0))return (x[i]||0)>(y[i]||0)?1:-1;}return 0;}
  function isPrerelease(version){return String(version||'').includes('-');}
  function eligible(current,release,{platform='win32',arch='x64',allowPrerelease=false}={}){if(!release||compare(release.version,current)<=0)return false;if(!allowPrerelease&&isPrerelease(release.version))return false;if(release.platforms&&!release.platforms.includes(platform))return false;if(release.architectures&&!release.architectures.includes(arch))return false;return true;}
  return {compare,isPrerelease,eligible};
});
