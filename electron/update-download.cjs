const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

function singleFlight(work){
  let pending;
  return (...args)=>{
    if(pending)return pending;
    pending=Promise.resolve().then(()=>work(...args)).finally(()=>{pending=null;});
    return pending;
  };
}
async function validFile(file,asset){
  try{
    if(fs.statSync(file).size!==asset.size)return false;
    const hash=crypto.createHash('sha256');
    for await(const chunk of fs.createReadStream(file))hash.update(chunk);
    return 'sha256:'+hash.digest('hex')===asset.digest;
  }catch(error){if(error.code==='ENOENT')return false;throw error;}
}
function createDownloader({folder,fetchAsset,progress=()=>{}}){
  return singleFlight(async asset=>{
    if(path.basename(asset.name)!==asset.name||!/^sha256:[a-f0-9]{64}$/.test(asset.digest||'')||!(asset.size>0))throw Error('更新安装包信息无效');
    fs.mkdirSync(folder,{recursive:true});
    const target=path.join(folder,asset.name);
    if(await validFile(target,asset))return target;
    // Each transaction owns its temporary file; never truncate another download.
    const partial=target+'.'+crypto.randomUUID()+'.partial';
    let handle;
    try{
      const response=await fetchAsset(asset);
      if(!response.ok||!response.body)throw Error(`更新下载返回 ${response.status}`);
      handle=fs.openSync(partial,'wx');
      const hash=crypto.createHash('sha256');let bytes=0,last=-1;
      for await(const chunk of response.body){
        let offset=0;while(offset<chunk.length)offset+=fs.writeSync(handle,chunk,offset,chunk.length-offset);
        hash.update(chunk);bytes+=chunk.length;
        if(bytes>asset.size)throw Error('更新文件大小超过发布信息');
        const percent=Math.min(99,Math.round(bytes/asset.size*100));
        if(percent!==last){last=percent;progress(percent);}
      }
      fs.fsyncSync(handle);fs.closeSync(handle);handle=undefined;
      if(bytes!==asset.size||'sha256:'+hash.digest('hex')!==asset.digest)throw Error('更新文件校验失败，请重新下载');
      fs.renameSync(partial,target);
      return target;
    }finally{
      if(handle!==undefined)fs.closeSync(handle);
      fs.rmSync(partial,{force:true});
    }
  });
}
module.exports={singleFlight,validFile,createDownloader};
