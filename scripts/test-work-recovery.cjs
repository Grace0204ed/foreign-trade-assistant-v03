const {app,BrowserWindow,ipcMain}=require('electron'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const folder=process.env.QUOTE_DATA_DIR,phase=process.env.FTA_RECOVERY_PHASE;
if(!folder||!phase)throw Error('Use node scripts/run-work-recovery.cjs');
app.setPath('userData',path.join(folder,'profile'));app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 let server=await require('../server').startServer(0),base='http://127.0.0.1:'+server.address().port;
 const win=new BrowserWindow({show:false,width:1440,height:1040,webPreferences:{contextIsolation:true,preload:path.join(__dirname,'work-recovery-preload.cjs')}}),run=async s=>{try{return await win.webContents.executeJavaScript(s)}catch(error){throw Error(s+"\n"+error.message)}};
 const wait=async expression=>{for(let i=0;i<500;i++){if(await run(expression))return;await new Promise(r=>setTimeout(r,40));}throw Error('Timeout: '+expression+'; results='+await run("document.querySelector('[data-results]')?.textContent+' TOAST '+document.querySelector('#toast')?.textContent"))};
 const request=async(url,options)=>{const r=await fetch(base+url,{...options,headers:{'Content-Type':'application/json'}});const j=await r.json();assert(r.ok,j.message);return j;};
 const drafts=async()=> (await request('/api/work-drafts')).drafts.filter(r=>!r.completedAt);
 const input=async(selector,value)=>run('(()=>{const el=document.querySelector('+JSON.stringify(selector)+');if(!el)throw Error("Missing "+'+JSON.stringify(selector)+');el.value='+JSON.stringify(value)+';el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}));})()');
 const closeRecovery=()=>run("document.querySelector('#work-recovery-modal [data-close]')?.click()");
 let pdfs=[],pdfMode='ok',directoryCancel=false;
 ipcMain.handle('qa-directory',()=>directoryCancel?null:'test-grant');
 ipcMain.handle('qa-pdf',async(_event,name)=>{
  if(pdfMode==='cancel')return null;if(pdfMode==='fail')throw Error('QA simulated disk failure');
  await run('(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));})()');
  const file=path.join(folder,pdfs.length+'-'+name.replace(/[\\/:*?"<>|]/g,'_'));
  fs.writeFileSync(file,await win.webContents.printToPDF({printBackground:true,pageSize:'A4',marginsType:0}));pdfs.push(file);return file;
 });
 try{
  await win.loadURL(base);await wait("!!document.querySelector('#overview-metrics article')&&!!window.flushPendingWork");
  await run('window.confirm=()=>true;void 0');await closeRecovery();
  assert(!await run("!!document.querySelector('#preview-quote-btn,#formalize-standard-quote-btn,#preview-invitation-btn,#agency-preview-btn')"));
  if(phase==='write'){
   const originalProducts=(await request('/api/products')).products.length;
   await run("document.querySelector('[data-create-document=invoice]').click()");await input('#buyer-company','RECOVERY ONE');await input('[data-qfield=description]','ISOLATED MACHINE ONE');await input('[data-qfield=qty]','3');await input('[data-qfield=unitPrice]','215');await input('#document-table-color','#174d8a');
   await run("document.querySelector('[data-create-document=packing]').click()");await input('#buyer-company','RECOVERY TWO');
   await run("document.querySelector('[data-view=products]').click();document.querySelector('#library-new-product').click()");
   await input('[data-product-field=model]','UNSAVED MODEL ALPHA');await input('#product-smart-paste','unfinished import source');
   await run("document.querySelector('#library-new-product').click()");await input('[data-product-field=model]','UNSAVED MODEL BETA');
   await run('window.flushPendingWork()');const records=await drafts();assert.equal(records.length,4);assert.equal(records.filter(r=>r.kind==='products').length,2);
   const latest=records[0];const stale={...latest,revision:0,label:'STALE'};assert((await request('/api/work-drafts/'+encodeURIComponent(latest.key),{method:'PUT',body:JSON.stringify(stale)})).stale);assert.notEqual((await drafts()).find(r=>r.key===latest.key).label,'STALE');
   const large={key:'products:large-fixture',kind:'products',data:{product:{model:'large isolated test',imageDataUrl:'data:image/png;base64,'+'A'.repeat(6*1024*1024)}},revision:1,savedAt:new Date().toISOString()};
   await request('/api/work-drafts/'+encodeURIComponent(large.key),{method:'PUT',body:JSON.stringify(large)});assert((await drafts()).find(r=>r.key===large.key).data.product.imageDataUrl.length>6*1024*1024);await request('/api/work-drafts/'+encodeURIComponent(large.key),{method:'DELETE'});
   fs.writeFileSync(path.join(folder,'before.json'),JSON.stringify({port:server.address().port,records,originalProducts}));
   assert.equal((await request('/api/quotations')).quotations.length,0);assert.equal((await request('/api/products')).products.length,originalProducts);
   console.log('PASS write: 2 documents + 2 product tasks durably stored; no business records created');
  }else if(phase==='restore'){
   const before=JSON.parse(fs.readFileSync(path.join(folder,'before.json'),'utf8'));assert.notEqual(server.address().port,before.port,'restart uses another server origin');assert.equal((await drafts()).length,4);
   await run("document.querySelector('#restore-quote-draft').click()");

   // Select by document number/type from the durable key to avoid relying on row ordering.
   await closeRecovery();await run("document.querySelector('#restore-quote-draft').click()");
   const invoiceKey=before.records.find(r=>r.kind==='quote'&&r.data.buyer.company==='RECOVERY ONE').key;
   const ordered=(await drafts()).sort((a,b)=>b.savedAt.localeCompare(a.savedAt));
   await run('document.querySelector("[data-resume=\\"'+ordered.findIndex(r=>r.key===invoiceKey)+'\\"]").click()');
   await wait("document.querySelector('#buyer-company').value==='RECOVERY ONE'");
   assert.equal(await run("document.querySelector('[data-qfield=qty]').value"),'3');assert.equal(await run("document.querySelector('#document-table-color').value"),'#174d8a');
   assert.match(await run("document.querySelector('#quote-preview').textContent"),/ISOLATED MACHINE ONE/);
   await input('[data-qfield=description]','MACHINE ONE CHANGED');await run('window.flushPendingWork()');assert.equal((await drafts()).length,4,'resuming updates same task');
   await run("document.querySelector('#save-quote-btn').click()");await wait("document.querySelector('#toast').textContent.includes('单证已保存')");
   assert.equal((await request('/api/quotations')).quotations.length,1);assert((await request('/api/work-drafts')).drafts.find(r=>r.key===invoiceKey).completedAt);
   await run("document.querySelector('#restore-quote-draft').click()");
   const productRows=(await drafts()).sort((a,b)=>b.savedAt.localeCompare(a.savedAt));const productIndex=productRows.findIndex(r=>r.kind==='products'&&r.data.product.model==='UNSAVED MODEL ALPHA');assert(productIndex>=0);
   await run('document.querySelector("[data-resume=\\"'+productIndex+'\\"]").click()');await wait("document.querySelector('[data-product-field=model]').value==='UNSAVED MODEL ALPHA'");
   assert.equal(await run("document.querySelector('#product-smart-paste').value"),'unfinished import source');
   await run("document.querySelector('#save-product-btn').click()");await wait("document.querySelector('#toast').textContent.includes('产品已保存')");
   assert.equal((await request('/api/products')).products.filter(p=>p.model==='UNSAVED MODEL ALPHA').length,1);
   assert.equal((await drafts()).length,2);
   // Explicit discard cancellation does not remove data; accepted discard removes only its task.
   await run("document.querySelector('#restore-quote-draft').click();window.confirm=()=>false;document.querySelector('[data-discard]').click()");assert.equal((await drafts()).length,2);
   await run("window.confirm=()=>true;document.querySelector('[data-discard]').click()");await wait("document.querySelectorAll('[data-discard]').length===1");assert.equal((await drafts()).length,1);await closeRecovery();
   // Different saved types are all available and each owns its own contents/settings.
   await run("document.querySelector('[data-create-document=commercial]').click()");await input('#buyer-company','BATCH SAVED TWO');await input('[data-qfield=description]','MACHINE TWO DIFFERENT');await input('[data-qfield=unitPrice]','999');await input('#document-table-color','#9c3348');
   await run("document.querySelector('#save-quote-btn').click()");await wait("document.querySelector('#toast').textContent.includes('单证已保存')");
   await run("document.querySelector('[data-create-document=invitation]').click()");await input('#invitation-name','BATCH INVITATION THREE');await run("document.querySelector('#save-invitation-btn').click()");await wait("document.querySelector('#toast').textContent.includes('邀请函已保存')");
   await request('/api/agent-authorizations',{method:'POST',body:JSON.stringify({id:'batch-agency',documentType:'authorization',authorizationNumber:'BATCH-FOUR',agentName:'UNIQUE AGENT FOUR',country:'QA Country',language:'en',selectedProducts:[],showCommission:false,company:'QA Agency Company',companySnapshot:{companyNameEn:'QA Agency Company',stampDataUrl:''}})});
   await input('#invitation-name','CURRENT UNSAVED INVITATION');
   await run("document.querySelector('#export-invitation-pdf-btn').click()");await wait("!!document.querySelector('#pdf-selection-modal')");
   assert.equal(await run("document.querySelectorAll('[data-pdf-row]:checked').length"),1);assert(!await run("document.querySelector('.pdf-selection-list').textContent.includes('undefined')"));
   await run("document.querySelector('[data-none]').click()");assert.equal(await run("document.querySelectorAll('[data-pdf-row]:checked').length"),0);assert(await run("document.querySelector('[data-export]').disabled"));
   await run("document.querySelector('[data-all]').click()");assert.equal(await run("document.querySelectorAll('[data-pdf-row]:checked').length"),await run("document.querySelectorAll('[data-pdf-row]').length"));
   await run("document.querySelector('[data-export]').click()");await wait("document.querySelector('[data-results]').textContent.includes('已导出')&&!document.querySelector('#pdf-selection-modal [data-close]').disabled");
   assert.equal(pdfs.length,4);assert.equal(await run("document.querySelector('#invitation-name').value"),'CURRENT UNSAVED INVITATION');
   fs.writeFileSync(path.join(folder,'pdfs.json'),JSON.stringify(pdfs));
   await run("document.querySelector('#pdf-selection-modal [data-close]').click();document.querySelector('#export-invitation-pdf-btn').click()");await wait("!!document.querySelector('#pdf-selection-modal')");
   pdfMode='cancel';await run("document.querySelector('[data-export]').click()");await wait("document.querySelector('[data-results]').textContent.includes('已取消')");assert.equal(pdfs.length,4);
   pdfMode='fail';await run("document.querySelector('[data-export]').click()");await wait("document.querySelector('[data-results]').textContent.includes('QA simulated disk failure')");assert.equal(await run("document.querySelector('#invitation-name').value"),'CURRENT UNSAVED INVITATION');
   pdfMode='ok';directoryCancel=true;await run("document.querySelector('[data-all]').click();document.querySelector('[data-export]').click()");await wait("document.querySelector('[data-results]').textContent.includes('已取消选择导出文件夹')");assert.equal(pdfs.length,4);
   await run('window.flushPendingWork()');console.log('PASS restore/save/discard + batch/default/all/none/cancel/error + edits preserved');
  }else{
   assert.equal((await request('/api/quotations')).quotations.length,2);assert.equal((await request('/api/products')).products.filter(p=>p.model==='UNSAVED MODEL ALPHA').length,1);
   const files=JSON.parse(fs.readFileSync(path.join(folder,'pdfs.json'),'utf8'));const {PDFParse}=require('pdf-parse');const texts=[];
   for(const file of files){const parser=new PDFParse({data:fs.readFileSync(file)});const text=(await parser.getText()).text;texts.push(text);assert(!text.includes('继续上次未完成'));assert(!text.includes('选择导出的单证'));await parser.destroy();}
   assert(texts[0].includes('CURRENT UNSAVED INVITATION'));assert(texts.some(t=>t.includes('UNIQUE AGENT FOUR')&&!t.includes('MACHINE ONE CHANGED')));assert(!texts[0].includes('MACHINE ONE CHANGED'));
   assert(texts.some(t=>t.includes('MACHINE ONE CHANGED')&&!t.includes('MACHINE TWO DIFFERENT')));assert(texts.some(t=>t.includes('MACHINE TWO DIFFERENT')&&!t.includes('MACHINE ONE CHANGED')));
   const output=path.resolve('output/iteration-qa/recovery');fs.mkdirSync(output,{recursive:true});
   for(let i=0;i<files.length;i++)fs.copyFileSync(files[i],path.join(output,'batch-'+i+'.pdf'));
   const parser=new PDFParse({data:fs.readFileSync(files[1])});const shots=await parser.getScreenshot({scale:1,first:1});fs.writeFileSync(path.join(output,'batch-first-page.png'),shots.pages[0].data);await parser.destroy();
   const formal=await request('/api/quotations',{method:'POST',body:JSON.stringify({id:'immutable-formal',quoteNumber:'FORMAL-PRESERVED',formal:true,buyer:{company:'ORIGINAL FORMAL CUSTOMER'},documentType:'quotation',items:[]})});
   const formalBefore=await request('/api/quotations/'+formal.id);await run('window.quoteApp.editQuote('+JSON.stringify(formal.id)+')');await input('#buyer-company','EDITED AS NEW DRAFT');await run("document.querySelector('#save-quote-btn').click()");await wait("document.querySelector('#toast').textContent.includes('单证已保存')");
   assert.deepEqual(await request('/api/quotations/'+formal.id),formalBefore,'saving formal history creates a new draft and preserves the original');
   const legacy={key:'quote:legacy-fixture',kind:'quote',label:'LEGACY MIGRATION',savedAt:new Date().toISOString(),data:{id:'legacy-fixture',quoteNumber:'LEGACY-MIGRATE',documentType:'quotation',buyer:{company:'LEGACY OWNER'},terms:{},items:[]}};
   await run('localStorage.removeItem("fta-recovery-migrated-v3");localStorage.setItem("fta-work-v2",JSON.stringify({legacy:'+JSON.stringify(legacy)+'}));');
   await win.reload();await wait("!!window.flushPendingWork&&!!document.querySelector('#work-recovery-modal')");assert((await drafts()).some(r=>r.key===legacy.key));
   const ordered=(await drafts()).sort((a,b)=>b.savedAt.localeCompare(a.savedAt)),legacyIndex=ordered.findIndex(r=>r.key===legacy.key);
   await run('window.confirm=()=>true;document.querySelector("[data-discard=\\"'+legacyIndex+'\\"]").click()');
   for(let i=0;i<100&&(await drafts()).some(r=>r.key===legacy.key);i++)await new Promise(r=>setTimeout(r,30));assert(!(await drafts()).some(r=>r.key===legacy.key));
   await win.reload();await wait('!!window.flushPendingWork');assert(!(await drafts()).some(r=>r.key===legacy.key),'explicitly discarded migrated draft is not imported again');
   console.log('PASS second restart: durable saved data, independent PDF contents, immutable formal history and one-time legacy migration');
  }
 }finally{win.destroy();await new Promise(resolve=>server.close(resolve));app.quit();}
}).catch(error=>{console.error(error);app.exit(1)});
