'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
module.exports=function installDocumentOutput({ipcMain,BrowserWindow,dialog,app,getBatchDirectory}){
 const previews=new Map();
 const get=(event,token)=>{const p=previews.get(token);if(!p||p.owner!==event.sender.id)throw Error('预览已失效，请重新预览');return p;};
 const remove=token=>{const p=previews.get(token);if(p&&!p.win.isDestroyed())p.win.destroy();previews.delete(token);};
 ipcMain.handle('document-preview-create',async(event,payload)=>{
  if(typeof payload?.html!=='string'||Buffer.byteLength(payload.html)>40*1024*1024)throw Error('预览内容过大或无效');
  const parent=BrowserWindow.fromWebContents(event.sender),origin=new URL(event.sender.getURL()).origin;
  if(!/^http:\/\/127\.0\.0\.1:\d+$/.test(origin))throw Error('请从本机单证页面打开预览');
  if(!payload.batch)for(const [token,p]of previews)if(p.owner===event.sender.id)remove(token);
  const win=new BrowserWindow({show:false,parent,webPreferences:{sandbox:true,nodeIntegration:false,contextIsolation:true,backgroundThrottling:false}});
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  const policy=`default-src 'none'; style-src 'unsafe-inline' ${origin}; img-src data: ${origin}; font-src data: ${origin}; base-uri ${origin}; form-action 'none'`;
  const html='<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="'+policy+'">'+payload.html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,'');
  try{
   await win.loadURL('data:text/html;charset=utf-8,'+encodeURIComponent(html));
   // CSP blocks document scripts; this trusted main-process call only waits for
   // fonts and local/data images to finish loading.
   await win.webContents.executeJavaScript(`(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));})()`);
   const pdf=await win.webContents.printToPDF({printBackground:true,pageSize:'A4',preferCSSPageSize:true});
   const {PDFParse}=require('pdf-parse'),parser=new PDFParse({data:pdf});
   let pages;
   try{const result=await parser.getScreenshot({desiredWidth:1050,imageBuffer:false,imageDataUrl:true});pages=result.pages.map(p=>({number:p.pageNumber,width:p.width,height:p.height,image:p.dataUrl}));}finally{await parser.destroy();}
   if(!pages.length||pages.length>200)throw Error('页数无效或超过200页，请分批预览');
   const token=crypto.randomUUID();previews.set(token,{owner:event.sender.id,win,pdf,pages,name:path.basename(payload.fileName||'document.pdf')});
   event.sender.once('destroyed',()=>remove(token));
   return {token,pages,printers:await event.sender.getPrintersAsync()};
  }catch(error){win.destroy();throw error;}
 });
 ipcMain.handle('document-preview-export',async(event,token,batchToken)=>{
  const p=get(event,token);
  if(batchToken){const folder=getBatchDirectory(event,batchToken);for(let i=0;i<10000;i++){const name=i?p.name.replace(/\.pdf$/i,` (${i}).pdf`):p.name,target=path.join(folder,name);try{fs.writeFileSync(target,p.pdf,{flag:'wx'});return {status:'exported',filePath:target};}catch(error){if(error.code!=='EEXIST')throw error;}}throw Error('同名文件过多');}
  const result=await dialog.showSaveDialog(BrowserWindow.fromWebContents(event.sender),{title:'导出当前预览 PDF',defaultPath:path.join(app.getPath('desktop'),p.name),filters:[{name:'PDF',extensions:['pdf']}]});
  if(result.canceled||!result.filePath)return {status:'cancelled'};fs.writeFileSync(result.filePath,p.pdf);return {status:'exported',filePath:result.filePath};
 });
 ipcMain.handle('document-preview-print',async(event,token,options={})=>{
  const p=get(event,token);const ranges=[];
  if(String(options.pages||'').trim())for(const part of options.pages.split(',')){const match=part.trim().match(/^(\d+)(?:-(\d+))?$/);if(!match)throw Error('页码格式应为 1-3,5');const from=Number(match[1]),to=Number(match[2]||from);if(from<1||to<from||to>p.pages.length)throw Error('打印页码超出预览范围');ranges.push({from:from-1,to:to-1});}
  const printers=await p.win.webContents.getPrintersAsync();if(options.deviceName&&!printers.some(item=>item.name===options.deviceName))throw Error('所选打印机不可用');
  return new Promise((resolve,reject)=>p.win.webContents.print({silent:false,printBackground:true,pageSize:'A4',margins:{marginType:'none'},deviceName:options.deviceName||'',landscape:p.pages[0].width>p.pages[0].height,...(ranges.length?{pageRanges:ranges}:{})},(success,reason)=>success?resolve({status:'submitted'}):/cancel/i.test(reason||'')?resolve({status:'cancelled'}):reject(Error(reason||'打印任务未提交'))));
 });
 ipcMain.handle('document-preview-close',(event,token)=>{get(event,token);remove(token);return true;});
 return {previews};
};
