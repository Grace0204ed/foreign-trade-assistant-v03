const fs=require("fs");
const path=require("path");
const root=path.resolve(__dirname,"..");
const ignored=new Set([".git","node_modules","dist","output","tmp"]);
const hits=[];
const privateMarkers=["BEGIN "+"PRIVATE KEY","BEGIN ED25519 "+"PRIVATE KEY"];
function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(ignored.has(entry.name))continue;
    const file=path.join(dir,entry.name);
    if(entry.isDirectory())walk(file);
    else if(entry.isFile()&&fs.statSync(file).size<1024*1024){
      const content=fs.readFileSync(file,"utf8");
      if(privateMarkers.some(marker=>content.includes(marker)))hits.push(path.relative(root,file));
    }
  }
}
walk(root);
if(hits.length){console.error("发现禁止进入仓库的私钥文件：\n"+hits.join("\n"));process.exit(1);}
console.log("No private signing key found in publishable source.");
