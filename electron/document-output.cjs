'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
module.exports=function installDocumentOutput({ipcMain,BrowserWindow,dialog,app,getBatchDirectory}){
 const previews=new Map(),owners=new Map(),temporaryDirectories=new Set();
 const expired=()=>Error('预览已失效，请重新预览');
 const clearDirectory=directory=>{try{fs.rmSync(directory,{recursive:true,force:true,maxRetries:3,retryDelay:20});temporaryDirectories.delete(directory);}catch(_){/* Retry a locked temporary file when the application exits. */}};
 const dispose=p=>{
  if(!p||p.closed)return;p.closed=true;previews.delete(p.token);
  const owner=owners.get(p.owner);owner?.records.delete(p);
  if(owner&&!owner.records.size){owner.sender.removeListener('destroyed',owner.close);owner.sender.removeListener('render-process-gone',owner.close);owners.delete(p.owner);}
  try{if(!p.win.isDestroyed())p.win.destroy();}finally{clearDirectory(p.directory);}
 };
 const ownerFor=sender=>{
  let owner=owners.get(sender.id);if(owner)return owner;
  owner={sender,records:new Set(),close:()=>{for(const p of [...owner.records])dispose(p);}};
  owners.set(sender.id,owner);sender.once('destroyed',owner.close);sender.once('render-process-gone',owner.close);return owner;
 };
 const active=p=>{if(p.closed||p.win.isDestroyed())throw expired();};
 const get=(event,token)=>{const p=previews.get(token);if(!p||p.owner!==event.sender.id)throw expired();active(p);return p;};
 app.on('before-quit',()=>{for(const owner of [...owners.values()])owner.close();for(const directory of [...temporaryDirectories])clearDirectory(directory);});
 ipcMain.handle('document-preview-create',async(event,payload)=>{
  if(typeof payload?.html!=='string'||Buffer.byteLength(payload.html)>40*1024*1024)throw Error('预览内容过大或无效');
  const parent=BrowserWindow.fromWebContents(event.sender);let origin;
  try{origin=new URL(event.sender.getURL()).origin;}catch(_){throw Error('请从本机单证页面打开预览');}
  if(!/^http:\/\/127\.0\.0\.1:\d+$/.test(origin))throw Error('请从本机单证页面打开预览');
  if(event.sender.isDestroyed())throw expired();
  // Replacing an ordinary preview must not invalidate an open multi-document session.
  if(!payload.batch)for(const p of [...(owners.get(event.sender.id)?.records||[])])if(!p.batch)dispose(p);
  const policy=`default-src 'none'; style-src 'unsafe-inline' ${origin}; img-src data: ${origin}; font-src data: ${origin}; base-uri ${origin}; form-action 'none'`;
  const head='<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="'+policy+'"><base href="'+origin+'/">';
  let html=payload.html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,'').replace(/<base\b[^>]*>/gi,'');
  if(/<head\b[^>]*>/i.test(html))html=html.replace(/<head\b[^>]*>/i,tag=>tag+head);
  else if(/<html\b[^>]*>/i.test(html))html=html.replace(/<html\b[^>]*>/i,tag=>tag+'<head>'+head+'</head>');
  else html='<!doctype html><html><head>'+head+'</head><body>'+html+'</body></html>';
  let p;
  try{
   // Chromium limits data: navigation URLs. A private file preserves large edited
   // documents without URL encoding or exposing their HTML through a local route.
   const directory=fs.mkdtempSync(path.join(app.getPath('temp'),'fta-document-preview-'));temporaryDirectories.add(directory);
   const filePath=path.join(directory,'preview.html');
   try{fs.writeFileSync(filePath,html,{encoding:'utf8',flag:'wx',mode:0o600});}catch(error){clearDirectory(directory);throw error;}
   let win;
   try{win=new BrowserWindow({show:false,parent,webPreferences:{sandbox:true,nodeIntegration:false,contextIsolation:true,backgroundThrottling:false}});}catch(error){clearDirectory(directory);throw error;}
   const rawName=path.basename(String(payload.fileName||'document.pdf')),name=/\.pdf$/i.test(rawName)?rawName:rawName+'.pdf';
   p={token:crypto.randomUUID(),owner:event.sender.id,win,directory,filePath,batch:!!payload.batch,name,closed:false};
   ownerFor(event.sender).records.add(p);win.once('closed',()=>dispose(p));
   win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
   win.webContents.on('will-navigate',event=>event.preventDefault());
   await win.loadFile(filePath);active(p);
   // CSP blocks document scripts; this trusted main-process call only waits for
   // fonts and local/data images to finish loading.
   await win.webContents.executeJavaScript(`(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));})()`);active(p);
   const electronic=await require('./electronic-pdf.cjs').renderElectronic(win);active(p);
   Object.assign(p,{pdf:electronic.pdf,electronicPreviewPdf:electronic.previewPdf,views:{}});previews.set(p.token,p);
   return await view(p,'electronic',event.sender);
  }catch(error){dispose(p);throw error;}
 });
 async function view(p,mode,sender){
  active(p);if(!['electronic','print'].includes(mode))throw Error('预览模式无效');
  if(!p.views[mode]){if(mode==='print'&&!p.printPdf)p.printPdf=await p.win.webContents.printToPDF({printBackground:true,pageSize:'A4',preferCSSPageSize:true});
   const {PDFParse}=require('pdf-parse'),parser=new PDFParse({data:mode==='print'?p.printPdf:p.electronicPreviewPdf});try{const result=await parser.getScreenshot({desiredWidth:1050,imageBuffer:false,imageDataUrl:true});const pages=result.pages.map(page=>({number:page.pageNumber,width:page.width,height:page.height,image:page.dataUrl}));if(!pages.length||pages.length>200)throw Error('预览内容过大，请分批处理');p.views[mode]=pages;}finally{await parser.destroy();}}
  active(p);p.pages=p.views[mode];return {token:p.token,mode,pages:p.pages,printers:await sender.getPrintersAsync()};
 }
 ipcMain.handle('document-preview-mode',async(event,token,mode)=>view(get(event,token),mode,event.sender));
 ipcMain.handle('document-preview-export',async(event,token,batchToken)=>{
  const p=get(event,token);
  if(batchToken){const folder=getBatchDirectory(event,batchToken);for(let i=0;i<10000;i++){const name=i?p.name.replace(/\.pdf$/i,` (${i}).pdf`):p.name,target=path.join(folder,name);try{fs.writeFileSync(target,p.pdf,{flag:'wx'});return {status:'exported',filePath:target};}catch(error){if(error.code!=='EEXIST')throw error;}}throw Error('同名文件过多');}
  const result=await dialog.showSaveDialog(BrowserWindow.fromWebContents(event.sender),{title:'导出当前预览 PDF',defaultPath:path.join(app.getPath('desktop'),p.name),filters:[{name:'PDF',extensions:['pdf']}]});
  if(result.canceled||!result.filePath)return {status:'cancelled'};fs.writeFileSync(result.filePath,p.pdf);return {status:'exported',filePath:result.filePath};
 });
 ipcMain.handle('document-preview-print',async(event,token,options={})=>{
  const p=get(event,token);await view(p,'print',event.sender);const ranges=[];
  const pageText=String(options.pages??'').trim();
  if(pageText)for(const part of pageText.split(',')){const match=part.trim().match(/^(\d+)(?:-(\d+))?$/);if(!match)throw Error('页码格式应为 1-3,5');const from=Number(match[1]),to=Number(match[2]||from);if(!Number.isSafeInteger(from)||!Number.isSafeInteger(to)||from<1||to<from||to>p.pages.length)throw Error('打印页码超出预览范围');ranges.push({from:from-1,to:to-1});}
  const printers=await p.win.webContents.getPrintersAsync();if(options.deviceName&&!printers.some(item=>item.name===options.deviceName))throw Error('所选打印机不可用');
  return new Promise((resolve,reject)=>p.win.webContents.print({silent:false,printBackground:true,pageSize:'A4',margins:{marginType:'none'},deviceName:options.deviceName||'',landscape:p.pages[0].width>p.pages[0].height,...(ranges.length?{pageRanges:ranges}:{})},(success,reason)=>success?resolve({status:'submitted'}):/cancel/i.test(reason||'')?resolve({status:'cancelled'}):reject(Error(reason||'打印任务未提交'))));
 });
 ipcMain.handle('document-preview-close',(event,token)=>{dispose(get(event,token));return true;});
 return {previews};
};
