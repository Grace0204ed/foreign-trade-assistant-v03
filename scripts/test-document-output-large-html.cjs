'use strict';
// Run with Electron. This harness uses only disposable HTTP fixtures/profile data;
// printing is always replaced by a controlled callback, never a physical printer.
const {app,BrowserWindow,nativeImage}=require('electron');
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),os=require('os'),http=require('http'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output','document-output-large-html-qa');
const temporaryRoot=fs.mkdtempSync(path.join(os.tmpdir(),'fta-large-output-qa-'));
const temporaryHtmlRoot=path.join(temporaryRoot,'预览 临时 # % & +');
fs.mkdirSync(temporaryHtmlRoot);fs.mkdirSync(out,{recursive:true});
app.setPath('userData',path.join(temporaryRoot,'profile'));app.setPath('temp',temporaryHtmlRoot);
app.on('window-all-closed',()=>{});
const handlers=new Map(),grants=new Map(),checks=[],created=[];
let nextFailure='',holdLoad=null;
class PreviewWindow {
 constructor(options){
  const win=new BrowserWindow(options),load=win.loadFile.bind(win),failure=nextFailure;nextFailure='';created.push(win);
  win.loadFile=async file=>{
   win.qaFile=file;
   assert.equal(path.extname(file),'.html');assert(fs.existsSync(file),'HTML exists before loading');
   if(failure==='load')throw Error('QA controlled load failure');
   if(failure==='hold')await new Promise(resolve=>{holdLoad=resolve;});
   if(failure==='hold')return;
   return load(file);
  };
  if(failure==='pdf')win.webContents.printToPDF=async()=>{throw Error('QA controlled PDF failure');};
  return win;
 }
 static fromWebContents(contents){return BrowserWindow.fromWebContents(contents);}
}
const output=require('../electron/document-output.cjs')({
 ipcMain:{handle:(name,handler)=>handlers.set(name,handler)},BrowserWindow:PreviewWindow,app,
 dialog:{showSaveDialog:async()=>saveResult},
 getBatchDirectory:(event,token)=>{const grant=grants.get(token);if(!grant||grant.owner!==event.sender.id)throw Error('QA invalid directory grant');return grant.directory;}
});
let saveResult={canceled:true};
const invoke=(event,name,...args)=>Promise.resolve().then(()=>handlers.get('document-preview-'+name)(event,...args));
const check=(name,condition=true)=>{assert(condition,name);checks.push(name);};
const textOf=async pdf=>{const {PDFParse}=require('pdf-parse'),parser=new PDFParse({data:pdf});try{return (await parser.getText()).text;}finally{await parser.destroy();}};
const closeServer=server=>new Promise(resolve=>server.close(resolve));
let owner,other,server,blockedServer;
app.whenReady().then(async()=>{
 let blockedRequests=0;const resources=new Map();
 try{
  const pixels=crypto.randomBytes(1024*768*4);for(let i=3;i<pixels.length;i+=4)pixels[i]=255;
  const photograph=nativeImage.createFromBitmap(pixels,{width:1024,height:768}).toPNG();
  assert(photograph.length>2*1024*1024,'fixture is a real PNG exceeding 2 MiB');
  const logo=nativeImage.createFromBitmap(Buffer.from([180,80,20,255,180,80,20,255,180,80,20,255,180,80,20,255]),{width:2,height:2}).toPNG();
  const requestPaths=[];
  server=http.createServer((request,response)=>{
   const url=new URL(request.url,'http://127.0.0.1');requestPaths.push(url.pathname);
   if(url.pathname==='/assets/preview.css'){response.setHeader('Content-Type','text/css');return response.end("@font-face{font-family:TradeTest;src:url('./fonts/NotoSansSC.ttf')}body{font-family:TradeTest,sans-serif;color:#173b62}h1{font-size:24px}.logo{width:45px;height:30px}");}
   if(url.pathname==='/assets/fonts/NotoSansSC.ttf'){response.setHeader('Content-Type','font/ttf');return fs.createReadStream(path.join(root,'assets','fonts','NotoSansSC.ttf')).pipe(response);}
   if(url.pathname==='/assets/logo.png'){response.setHeader('Content-Type','image/png');return response.end(logo);}
   response.setHeader('Content-Type','text/html;charset=utf-8');response.end('<!doctype html><title>Isolated document output QA</title>');
  });
  blockedServer=http.createServer((_request,response)=>{blockedRequests++;response.end(logo);});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));await new Promise(resolve=>blockedServer.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port;
  owner=new BrowserWindow({show:false,webPreferences:{sandbox:true,nodeIntegration:false,contextIsolation:true}});await owner.loadURL(origin);
  const event={sender:owner.webContents};
  const html=`<!doctype html><html lang="zh"><head><base href="http://not-the-document.invalid/"><link rel="stylesheet" href="assets/preview.css"><style>@page{size:A4;margin:18mm}body{margin:0}.page{break-after:page}.photo{width:165mm;height:100mm;object-fit:contain}.page:last-child{break-after:auto}</style></head><body><section class="page"><h1>已编辑报价 CURRENT EDITED QUOTATION</h1><p>客户：中文路径测试公司 / Français déjà modifié</p><p id="amount">已编辑金额 USD 12,345.67</p><img class="logo" src="/assets/logo.png"><img class="photo" src="data:image/png;base64,${photograph.toString('base64')}"><img style="display:none" src="http://127.0.0.1:${blockedServer.address().port}/forbidden.png"><img style="display:none" src="file:///C:/Windows/Web/Wallpaper/Windows/img0.jpg" onerror="globalThis.outputHandlerExecuted=true"><script>globalThis.outputScriptExecuted=true</script></section><section class="page"><h1>第二页 EDITED PAGE TWO</h1><p>装船前付清余额；保留本次自由备注。</p></section></body></html>`;
  check('HTML with a real embedded image exceeds the previous data URL limit',Buffer.byteLength(html)>2*1024*1024);
  const first=await invoke(event,'create',{html,fileName:'同名 报价 # % & +.pdf',batch:true}),p=output.previews.get(first.token);resources.set('first',p);
  check('Actual PDF pagination returns two pages',first.pages.length===2);
  check('Large content loads from a local file, including special Windows path characters',p.win.webContents.getURL().startsWith('file:')&&p.filePath.includes('预览 临时 # % & +'));
  const state=await p.win.webContents.executeJavaScript(`({base:document.baseURI,font:document.fonts.check('16px TradeTest','中文'),images:[...document.images].map(i=>i.naturalWidth),script:!!globalThis.outputScriptExecuted,handler:!!globalThis.outputHandlerExecuted})`);
  check('Stylesheets/fonts/root and relative images resolve against the trusted local origin',state.base===origin+'/'&&state.font&&state.images[0]===2&&state.images[1]===1024&&requestPaths.includes('/assets/preview.css')&&requestPaths.includes('/assets/fonts/NotoSansSC.ttf'));
  check('CSP blocks scripts, event handlers, file images and another localhost origin',!state.script&&!state.handler&&state.images[2]===0&&state.images[3]===0&&blockedRequests===0);
  const text=await textOf(p.pdf);
  check('Exported PDF contains the current edited text, values and second page',text.includes('CURRENT EDITED QUOTATION')&&text.includes('12,345.67')&&text.includes('EDITED PAGE TWO')&&text.includes('已编辑报价'));
  fs.writeFileSync(path.join(out,'large-edited-preview.pdf'),p.pdf);
  for(const page of p.pages)fs.writeFileSync(path.join(out,`large-edited-page-${page.number}.png`),Buffer.from(page.image.split(',')[1],'base64'));
  const second=await invoke(event,'create',{html:'<h1>INDEPENDENT SECOND DOCUMENT</h1><p>Second document edited separately.</p>',fileName:p.name,batch:true}),secondRecord=output.previews.get(second.token);resources.set('second',secondRecord);
  const third=await invoke(event,'create',{html:'<h1>ORDINARY BEFORE REPLACEMENT</h1>',fileName:'未加扩展名'}),thirdRecord=output.previews.get(third.token);
  const fourth=await invoke(event,'create',{html:'<h1>ORDINARY REPLACEMENT</h1>',fileName:'replacement.pdf'}),fourthRecord=output.previews.get(fourth.token);
  check('Creating an ordinary preview retains every independent batch token',output.previews.has(first.token)&&output.previews.has(second.token)&&!output.previews.has(third.token)&&output.previews.has(fourth.token));
  check('Replaced ordinary preview window and temporary HTML are removed',thirdRecord.win.isDestroyed()&&!fs.existsSync(thirdRecord.directory)&&thirdRecord.name.endsWith('.pdf'));
  await invoke(event,'close',fourth.token);
  check('Closing one preview does not close another session',!fs.existsSync(fourthRecord.directory)&&output.previews.has(second.token));
  await assert.rejects(invoke(event,'print',third.token,{}),/预览已失效/);checks.push('Replaced tokens cannot print or export stale content');
  const batchDirectory=path.join(out,'中文 空格 # % & +');fs.mkdirSync(batchDirectory,{recursive:true});
  // A fresh test subdirectory keeps repeat runs deterministic and preserves older artifacts.
  const batchRun=fs.mkdtempSync(path.join(batchDirectory,'run-'));grants.set('qa-batch',{owner:event.sender.id,directory:batchRun});
  const existing=path.join(batchRun,p.name);fs.writeFileSync(existing,'EXISTING FILE MUST REMAIN');
  const a=await invoke(event,'export',first.token,'qa-batch'),b=await invoke(event,'export',second.token,'qa-batch'),again=await invoke(event,'export',first.token,'qa-batch');
  check('Batch export never overwrites an existing or same-name document',fs.readFileSync(existing,'utf8')==='EXISTING FILE MUST REMAIN'&&new Set([a.filePath,b.filePath,again.filePath]).size===3);
  check('Batch files contain independent exact preview bytes',fs.readFileSync(a.filePath).equals(p.pdf)&&fs.readFileSync(b.filePath).equals(secondRecord.pdf)&&(await textOf(fs.readFileSync(b.filePath))).includes('INDEPENDENT SECOND DOCUMENT'));
  saveResult={canceled:true};check('Save dialog cancellation preserves the preview',(await invoke(event,'export',first.token)).status==='cancelled'&&output.previews.has(first.token));
  const savePath=path.join(batchRun,'当前编辑 导出 # % & +.pdf');saveResult={canceled:false,filePath:savePath};await invoke(event,'export',first.token);
  check('Windows Unicode, spaces and special characters export unchanged PDF bytes',fs.readFileSync(savePath).equals(p.pdf));
  const printCalls=[];p.win.webContents.getPrintersAsync=async()=>[{name:'qa-printer'}];
  p.win.webContents.print=(options,callback)=>{printCalls.push(options);callback(true);};
  for(const pages of ['0','3','2-1','1,','abc','1.2','1-999','9007199254740992'])await assert.rejects(invoke(event,'print',first.token,{pages}),/页码/);
  await assert.rejects(invoke(event,'print',first.token,{deviceName:'missing'}),/打印机不可用/);
  check('Invalid page ranges and unavailable printers are rejected before printing',printCalls.length===0);
  const printed=await invoke(event,'print',first.token,{pages:'1-2,2',deviceName:'qa-printer'});
  check('Print mock receives exact zero-based page ranges and non-silent A4 settings',printed.status==='submitted'&&printCalls[0].silent===false&&printCalls[0].pageSize==='A4'&&JSON.stringify(printCalls[0].pageRanges)===JSON.stringify([{from:0,to:1},{from:1,to:1}]));
  await invoke(event,'print',first.token,{pages:2});check('Numeric page input is validated consistently',printCalls[1].pageRanges[0].from===1);
  p.win.webContents.print=(_options,callback)=>callback(false,'cancelled');check('Printer cancellation remains a cancellation',(await invoke(event,'print',first.token,{})).status==='cancelled');
  p.win.webContents.print=(_options,callback)=>callback(false,'QA printer failure');await assert.rejects(invoke(event,'print',first.token,{}),/QA printer failure/);checks.push('Printer failure is reported without modifying the preview');
  other=new BrowserWindow({show:false,webPreferences:{sandbox:true,nodeIntegration:false}});await other.loadURL(origin);
  await assert.rejects(invoke({sender:other.webContents},'export',first.token,'qa-batch'),/预览已失效/);checks.push('Preview tokens remain bound to their original owner');
  const dirsBefore=new Set(fs.readdirSync(temporaryHtmlRoot));
  for(const failure of ['load','pdf']){nextFailure=failure;await assert.rejects(invoke(event,'create',{html:'<p>FAILURE CLEANUP</p>',batch:true}),/QA controlled/);}
  check('Failed HTML load and PDF creation leave no temporary files or windows',JSON.stringify(fs.readdirSync(temporaryHtmlRoot))===JSON.stringify([...dirsBefore])&&created.slice(-2).every(w=>w.isDestroyed()));
  nextFailure='hold';const pending=invoke({sender:other.webContents},'create',{html:'<p>PENDING OWNER CLEANUP</p>',batch:true});
  for(let i=0;i<100&&!holdLoad;i++)await new Promise(resolve=>setTimeout(resolve,10));assert(holdLoad);
  const pendingWindow=created.at(-1),pendingDirectory=path.dirname(pendingWindow.qaFile);other.destroy();other=null;holdLoad();holdLoad=null;
  await assert.rejects(pending,/预览已失效/);
  check('Owner destruction also cleans previews still loading',pendingWindow.isDestroyed()&&!fs.existsSync(pendingDirectory));
  await invoke(event,'close',first.token);
  check('Explicit close removes only its PDF window/file token',p.win.isDestroyed()&&!fs.existsSync(p.directory)&&output.previews.has(second.token));
  owner.destroy();owner=null;
  check('Owner destruction cleans all remaining batch previews',output.previews.size===0&&secondRecord.win.isDestroyed()&&!fs.existsSync(secondRecord.directory));
  owner=new BrowserWindow({show:false,webPreferences:{sandbox:true,nodeIntegration:false}});await owner.loadURL(origin);
  const finalPreview=await invoke({sender:owner.webContents},'create',{html:'<p>APPLICATION EXIT CLEANUP</p>',batch:true}),finalRecord=output.previews.get(finalPreview.token);
  app.emit('before-quit');check('Application exit removes every retained preview',output.previews.size===0&&!fs.existsSync(finalRecord.directory)&&finalRecord.win.isDestroyed());
  check('All preview temporary directories have been removed',fs.readdirSync(temporaryHtmlRoot).length===0);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({passed:checks.length,checks,htmlBytes:Buffer.byteLength(html),imageBytes:photograph.length,pages:first.pages.length,batchDirectory:batchRun,physicalPrinting:false},null,2));
  console.log('PASS '+checks.length+' document-output checks; real large-image PDF/text/screenshots, special Windows paths, independent batch sessions, lifecycle cleanup; printing mocked only.');
  console.log('ARTIFACTS '+out);
 }finally{
  for(const p of [...output.previews.values()])await invoke({sender:{id:p.owner}},'close',p.token).catch(()=>{});
  if(owner&&!owner.isDestroyed())owner.destroy();if(other&&!other.isDestroyed())other.destroy();
  if(server?.listening)await closeServer(server);if(blockedServer?.listening)await closeServer(blockedServer);
 }
 app.quit();
}).catch(error=>{console.error(error);app.exit(1);});
