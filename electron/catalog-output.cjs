'use strict';
const fs=require('fs'),os=require('os'),path=require('path');
// Export only inert catalogue HTML. No Node, JavaScript, navigation or remote resources.
module.exports=async function createCatalogWindow(BrowserWindow,html,parent){
  if(typeof html!=='string'||Buffer.byteLength(html,'utf8')>20*1024*1024)throw Error('产品目录过大，请分批导出。');
  const win=new BrowserWindow({show:false,parent:parent||undefined,webPreferences:{sandbox:true,nodeIntegration:false,contextIsolation:true}});
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'fta-catalog-preview-'));
  win.once('closed',()=>fs.rmSync(directory,{recursive:true,force:true}));
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  win.webContents.on('will-navigate',e=>e.preventDefault());
  const policy="default-src 'none'; style-src 'unsafe-inline'; img-src data: http://127.0.0.1:* http://localhost:*; font-src 'none'; base-uri 'none'; form-action 'none'";
  try{
    const document=`<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy}">`+html.replace(/<!doctype[^>]*>/gi,'').replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,'');
    const file=path.join(directory,'catalog.html');fs.writeFileSync(file,document,{encoding:'utf8',flag:'wx',mode:0o600});
    await win.loadFile(file);
    await win.webContents.executeJavaScript(`(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));})()`);
    return win;
  }catch(error){win.destroy();throw error;}
};
