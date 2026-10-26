const crypto=require("crypto");
const fs=require("fs");
const path=require("path");
const {app,BrowserWindow,clipboard,dialog,ipcMain,shell}=require("electron");

app.setPath("userData",path.join(app.getPath("appData"),"foreign-trade-license-generator"));
const dataDir=()=>app.getPath("userData");
const keyPath=()=>path.join(dataDir(),"keys","private-key.pem");
const recordsPath=()=>path.join(dataDir(),"license-records.json");

function privateKeyCandidates(){
  const candidates=[keyPath()];
  const portableDir=process.env.PORTABLE_EXECUTABLE_DIR;
  if(portableDir)candidates.push(path.join(portableDir,"keys","private-key.pem"));
  candidates.push(path.join(app.getPath("documents"),"外贸助手授权工具","私钥备份-请勿上传","private-key.pem"));
  return [...new Set(candidates)];
}

function resolvePrivateKey(){
  const checked=[];
  for(const candidate of privateKeyCandidates()){
    checked.push(candidate);
    try{
      const pem=fs.readFileSync(candidate,"utf8");
      const key=crypto.createPrivateKey(pem);
      if(key.asymmetricKeyType!=="ed25519")throw new Error("私钥类型不是 Ed25519");
      return {pem,path:candidate,checked};
    }catch(error){
      if(error.code!=="ENOENT")return {error:error.message,path:candidate,checked};
    }
  }
  return {error:"私钥文件不存在",path:keyPath(),checked};
}

function privateKeyStatus(){
  const resolved=resolvePrivateKey();
  return resolved.pem
    ? {keyReady:true,keyError:"",activeKeyPath:resolved.path,checkedPaths:resolved.checked}
    : {keyReady:false,keyError:resolved.error,activeKeyPath:"",checkedPaths:resolved.checked};
}

function loadRecords(){try{return JSON.parse(fs.readFileSync(recordsPath(),"utf8"));}catch(_){return [];}}
function saveRecords(records){fs.mkdirSync(dataDir(),{recursive:true});const target=recordsPath(),temp=`${target}.tmp`;fs.writeFileSync(temp,JSON.stringify(records,null,2),"utf8");fs.renameSync(temp,target);}
function normalizeMachineId(value){return String(value||"").trim().toUpperCase();}
function generateLicense(input){
  const resolvedKey=resolvePrivateKey();
  if(!resolvedKey.pem)throw new Error(`私钥不可用：${resolvedKey.error}\n已检查：${resolvedKey.checked.join("\n")}`);
  const machineId=normalizeMachineId(input.machineId);
  if(!/^FTA-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/.test(machineId))throw new Error("机器码格式不正确");
  const issuedAt=new Date().toISOString();
  const payload={
    v:1,product:"foreign-trade-assistant",licenseId:`LIC-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
    customer:String(input.customer||"").trim(),machineId,type:input.type==="term"?"term":"permanent",issuedAt,
    expiresAt:input.type==="term"?String(input.expiresAt||"").trim():"",maxVersion:String(input.maxVersion||"").trim(),notes:String(input.notes||"").trim()
  };
  if(!payload.customer)throw new Error("请填写客户姓名或订单编号");
  if(payload.type==="term"&&!/^\d{4}-\d{2}-\d{2}$/.test(payload.expiresAt))throw new Error("限时授权必须填写有效到期日期");
  const payloadText=Buffer.from(JSON.stringify(payload),"utf8").toString("base64url");
  const signature=crypto.sign(null,Buffer.from(payloadText,"utf8"),resolvedKey.pem).toString("base64url");
  const activationCode=`${payloadText}.${signature}`;
  const records=loadRecords();records.unshift({...payload,activationCode});saveRecords(records);
  return {payload,activationCode};
}

function createWindow(){const win=new BrowserWindow({width:1000,height:760,minWidth:880,minHeight:650,title:"外贸助手授权码生成器",webPreferences:{preload:path.join(__dirname,"preload.js"),contextIsolation:true,nodeIntegration:false}});win.loadFile(path.join(__dirname,"index.html"));}
app.whenReady().then(createWindow);
app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit();});
app.on("activate",()=>{if(!BrowserWindow.getAllWindows().length)createWindow();});

ipcMain.handle("license:status",()=>({...privateKeyStatus(),keyPath:keyPath(),dataDir:dataDir(),records:loadRecords()}));
ipcMain.handle("license:generate",(_event,input)=>generateLicense(input||{}));
ipcMain.handle("license:copy",(_event,text)=>{clipboard.writeText(String(text||""));return true;});
ipcMain.handle("license:open-data",async()=>{fs.mkdirSync(dataDir(),{recursive:true});await shell.openPath(dataDir());return dataDir();});
ipcMain.handle("license:backup",async(event)=>{const result=await dialog.showSaveDialog(BrowserWindow.fromWebContents(event.sender),{title:"备份授权记录",defaultPath:path.join(app.getPath("desktop"),`外贸助手授权记录-${new Date().toISOString().slice(0,10)}.json`),filters:[{name:"JSON",extensions:["json"]}]});if(result.canceled)return null;fs.writeFileSync(result.filePath,JSON.stringify(loadRecords(),null,2),"utf8");return result.filePath;});

