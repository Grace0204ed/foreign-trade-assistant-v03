const {app,BrowserWindow,ipcMain,dialog}=require('electron'),assert=require('assert/strict'),fs=require('fs'),os=require('os'),path=require('path');
const out=path.resolve('output/document-batch-qa');fs.mkdirSync(out,{recursive:true});const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fta-document-output-'));process.env.QUOTE_DATA_DIR=path.join(dir,'data');app.setPath('userData',path.join(dir,'profile'));app.on('window-all-closed',()=>{});
let failBatch=false;const grants=new Map();const output=require('../electron/document-output.cjs')({ipcMain,BrowserWindow,dialog,app,getBatchDirectory:(event,token)=>{const g=grants.get(token);assert.equal(g.owner,event.sender.id);if(failBatch)throw Error("QA batch directory unavailable");return out;}});
ipcMain.handle('get-app-version',()=>({version:require('../package.json').version,packaged:false}));ipcMain.handle('get-license-status',()=>({licensed:true}));ipcMain.handle('get-update-state',()=>({status:'current'}));ipcMain.handle('get-publisher-contact',()=>({}));
ipcMain.handle('select-pdf-directory',event=>{const token='qa-folder';grants.set(token,{owner:event.sender.id});return token;});ipcMain.handle('finish-pdf-batch',(_event,token)=>grants.delete(token));
app.whenReady().then(async()=>{
 const server=await require('../server').startServer(0),win=new BrowserWindow({show:false,width:1550,height:1100,webPreferences:{preload:path.resolve('electron/preload.js'),backgroundThrottling:false}}),run=s=>win.webContents.executeJavaScript(s);
 const errors=[];win.webContents.on('console-message',(_e,level,message)=>{if(level===3){errors.push(message);console.error('RENDERER',message);}});
 const wait=async(s,limit=300)=>{for(let i=0;i<limit;i++){if(await run(s))return;await new Promise(r=>setTimeout(r,50));}throw Error('Timeout '+s+' '+errors.join(';'));};
 try{
  await win.loadURL('http://127.0.0.1:'+server.address().port);await wait('!!document.querySelector("#signing-controls-invitation")');

  for(const [name,lang]of [['BATCH UNIQUE FIRST','zh'],['BATCH UNIQUE SECOND','fr']]){
   await run(`document.querySelector('[data-create-document=invitation]').click();document.querySelector('#new-invitation-btn').click();for(const [id,value]of Object.entries({'invitation-name':${JSON.stringify(name)},'invitation-language':${JSON.stringify(lang)}})){const e=document.getElementById(id);e.value=value;e.dispatchEvent(new Event('change',{bubbles:true}));}document.querySelector('#save-invitation-btn').click()`);await wait(`JSON.parse(window.BusinessDataStore.get('quote_assistant_v01_invitations')||'[]').some(d=>d.visitorName===${JSON.stringify(name)})`);await new Promise(r=>setTimeout(r,200));
  }
  for(const status of ['Draft','Void','Deleted']){const response=await fetch('http://127.0.0.1:'+server.address().port+'/api/quotations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:'exclude-'+status,quoteNumber:'EXCLUDE-'+status,status,buyer:{company:'EXCLUDED'},items:[]})});assert(response.ok);}
  await run(`const n=document.querySelector('#invitation-name');n.value='CURRENT UNSAVED THIRD';n.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('#export-invitation-pdf-btn').click()`);await wait('!!document.querySelector("[data-export-preview]:not(:disabled)")',600);
  assert.equal(output.previews.size,1,'current export produces only current PDF');
  const textOf=async p=>{const {PDFParse}=require('pdf-parse'),parser=new PDFParse({data:p.pdf});try{return (await parser.getText()).text;}finally{await parser.destroy();}};
  assert((await textOf([...output.previews.values()][0])).includes('CURRENT UNSAVED THIRD'));
  await run(`document.querySelector('[data-batch-preview]').click()`);await wait('!!document.querySelector("#pdf-selection-modal [data-all]")');assert.equal(await run(`document.querySelectorAll('[data-pdf-row]').length`),2);assert.equal(await run(`document.querySelectorAll('[data-pdf-row]:checked').length`),0);
  await run(`document.querySelector('[data-all]').click()`);assert.equal(await run(`document.querySelectorAll('[data-pdf-row]:checked').length`),2);await run(`document.querySelector('[data-none]').click()`);assert(await run(`document.querySelector('[data-export]').disabled`));
  await run(`document.querySelector('[data-all]').click();document.querySelector('[data-export]').click()`);await wait('!!document.querySelector("[data-batch-export]")',900);assert.equal(output.previews.size,2);
  const texts=await Promise.all([...output.previews.values()].map(textOf));assert(texts.some(t=>t.includes('BATCH UNIQUE FIRST')&&!t.includes('BATCH UNIQUE SECOND')));assert(texts.some(t=>t.includes('BATCH UNIQUE SECOND')&&!t.includes('BATCH UNIQUE FIRST')));assert(texts.every(t=>!t.includes('CURRENT UNSAVED THIRD')));assert.equal(await run(`document.querySelector('#invitation-name').value`),'CURRENT UNSAVED THIRD');
  await run(`document.querySelectorAll('[data-batch-document]')[1].checked=false`);dialog.showSaveDialog=async()=>({canceled:true});await run(`document.querySelector('[data-batch-export]').click()`);await wait(`document.querySelector('[data-output-status]').textContent.includes('已取消')`);
  await run(`document.querySelectorAll('[data-batch-document]')[1].checked=true;document.querySelector('[data-batch-export]').click()`);await wait(`document.querySelector('[data-output-status]').textContent.split('已导出').length===3`);assert.equal(await run(`JSON.parse(window.BusinessDataStore.get('quote_assistant_v01_invitations')||'[]').length`),2);
  failBatch=true;await run(`document.querySelector('[data-batch-export]').click()`);await wait(`document.querySelector('[data-output-status]').textContent.split('失败').length===3`);assert(await run(`document.querySelector('[data-output-status]').textContent.includes('QA batch directory unavailable')`));assert.equal(await run(`document.querySelector('#invitation-name').value`),'CURRENT UNSAVED THIRD');failBatch=false;
  for(const [i,p]of [...output.previews.values()].entries()){
   fs.writeFileSync(path.join(out,'batch-'+i+'.pdf'),p.pdf);
   for(const page of p.pages)fs.writeFileSync(path.join(out,`batch-${i}-page-${page.number}.png`),Buffer.from(page.image.split(',')[1],'base64'));
  }
  await run(`document.querySelector('[data-batch-back]').click();document.querySelector('#pdf-selection-modal [data-close]').click()`);assert.equal(await run(`document.querySelector('#invitation-name').value`),'CURRENT UNSAVED THIRD');
  assert.equal(errors.length,0,errors.join('\n'));console.log('PASS actual current-only PDF, selected/all/none, cancellation, two independent language PDFs, unsaved editor retained, no duplicate history');
 }finally{for(const p of output.previews.values())p.win.destroy();win.destroy();await new Promise(r=>server.close(r));app.quit();}
}).catch(error=>{console.error(error);app.exit(1);});
