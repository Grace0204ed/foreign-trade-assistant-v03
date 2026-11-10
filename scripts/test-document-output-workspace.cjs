'use strict';
const {app,BrowserWindow,ipcMain,dialog}=require('electron');
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fta-output-workspace-')),out=path.join(dir,'exports');fs.mkdirSync(out);
process.env.QUOTE_DATA_DIR=path.join(dir,'data');app.setPath('userData',path.join(dir,'profile'));app.on('window-all-closed',()=>{});
const checks=[],errors=[],events={create:[],export:[],print:[],directories:[]},grants=new Map();
let printMode='submitted',saveMode='cancelled',exportSequence=0,allowDirectory=true;
const nativeHandle=ipcMain.handle.bind(ipcMain);
// Keep the actual PDF renderer and file export. Only the operating-system print
// submission is replaced, so this test can never send paper to a real printer.
const output=require('../electron/document-output.cjs')({
 ipcMain:{handle(channel,handler){nativeHandle(channel,async(event,...args)=>{
  if(channel==='document-preview-print'){
   events.print.push({token:args[0],options:args[1],mode:printMode});
   if(printMode==='failed')throw Error('QA printer failure');
   return {status:printMode};
  }
  const result=await handler(event,...args);
  if(channel==='document-preview-create')events.create.push({payload:args[0],token:result.token,pages:result.pages.length});
  if(channel==='document-preview-export')events.export.push({token:args[0],batch:args[1],result});
  return result;
 });}},BrowserWindow,dialog,app,
 getBatchDirectory(event,token){assert.equal(grants.get(token)?.owner,event.sender.id);return out;}
});
for(const [channel,value]of Object.entries({'get-app-version':{version:require('../package.json').version,packaged:false},'get-license-status':{licensed:true},'get-update-state':{status:'current'},'get-publisher-contact':{}}))nativeHandle(channel,()=>value);
nativeHandle('select-pdf-directory',event=>{events.directories.push({allowed:allowDirectory});if(!allowDirectory)return null;const token='qa-batch-'+events.directories.length;grants.set(token,{owner:event.sender.id});return token;});
nativeHandle('finish-pdf-batch',(_event,token)=>grants.delete(token));
dialog.showSaveDialog=async()=>saveMode==='cancelled'?{canceled:true}:saveMode==='failed'?{canceled:false,filePath:path.join(out,'missing-directory','failed.pdf')}:{canceled:false,filePath:path.join(out,'current-'+(++exportSequence)+'.pdf')};
let win,server,base,failed=false;
const run=source=>win.webContents.executeJavaScript(source,true);
const wait=async(predicate,label,timeout=60000)=>{const start=Date.now();for(;;){if(await predicate())return;if(Date.now()-start>timeout)throw Error('Timeout '+label+'\n'+errors.join('\n'));await new Promise(r=>setTimeout(r,75));}};
const uiWait=(source,label,timeout)=>wait(()=>run(source),label||source,timeout);
const click=selector=>run(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw Error('Missing '+${JSON.stringify(selector)});el.click();})()`);
const set=(selector,value,event='input')=>run(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)throw Error('Missing '+${JSON.stringify(selector)});if(el.type==='checkbox')el.checked=${JSON.stringify(value)};else el.value=${JSON.stringify(value)};el.dispatchEvent(new Event(${JSON.stringify(event)},{bubbles:true}));})()`);
const pass=name=>{checks.push(name);console.log('PASS',name);};
const get=async url=>{const response=await fetch(base+url);assert(response.ok);return response.json();};
const quotations=async()=>(await get('/api/quotations')).quotations;
const workspace=()=>`(window.DraftWorkspace||window.quoteSettingsContext?.DraftWorkspace)`;
const activate=async type=>{await run(`${workspace()}.activate(${JSON.stringify(type)})`);await uiWait(`document.querySelector('#view-quote.active')&&document.querySelector('#quote-items .quote-line')`);};
const capture=()=>run(`${workspace()}.capture()`);
const selectedType=()=>run(`document.querySelector('#document-output-preview [data-output-document][aria-pressed="true"]')?.dataset.outputDocument||document.querySelector('#document-output-preview [data-output-document].active')?.dataset.outputDocument||document.querySelector('#document-output-preview [data-output-document].is-active')?.dataset.outputDocument||''`);
const ready=()=>uiWait(`!!document.querySelector('#document-output-preview [data-export-preview]:not(:disabled)')&&!!document.querySelector('#document-output-preview .preview-pages img')?.naturalWidth`,'PDF ready');
const choose=async type=>{await click(`[data-output-document="${type}"]`);await ready();};
const status=()=>run(`document.querySelector('#document-output-preview [data-output-status]')?.textContent||''`);
const latestPreview=marker=>[...events.create].reverse().find(e=>e.payload.html.includes(marker));
const pdfText=async token=>{const {PDFParse}=require('pdf-parse'),pdf=output.previews.get(token).pdf,parser=new PDFParse({data:pdf});try{const text=(await parser.getText()).text;fs.writeFileSync(path.join(dir,token+'.pdf'),pdf);fs.writeFileSync(path.join(dir,token+'.txt'),text);return text.replace(/\s/g,'');}finally{await parser.destroy();}};
const assertNoHistory=async()=>assert.equal((await quotations()).length,0,'cancelled/failed output cannot create history');
const waitEvents=async(kind,count)=>wait(()=>events[kind].length>=count,kind+' events '+count);
const idle=()=>uiWait(`!!document.querySelector('#document-output-preview [data-export-preview]:not(:disabled)')`,'workspace idle');
app.whenReady().then(async()=>{
 try{
  server=await require('../server').startServer(0);base='http://127.0.0.1:'+server.address().port;
  win=new BrowserWindow({show:false,width:1500,height:1100,webPreferences:{preload:path.resolve('electron/preload.js'),backgroundThrottling:false}});
  win.webContents.on('console-message',event=>{if(event.level==='error'){errors.push(event.message);console.error('RENDERER',event.message);}});
  await win.loadURL(base);await uiWait(`!!${workspace()}&&document.querySelectorAll('#overview-metrics article').length===4&&!!document.querySelector('#signing-controls-quote')`,'app and draft workspace ready');
  assert(await run(`(()=>{const hosts=[...document.querySelectorAll('[id^="signing-controls-"]')];return hosts.length>=2&&hosts.every(host=>host.querySelectorAll('[data-signature-choice]').length===1&&host.querySelectorAll('[data-signature-visible]').length===1&&host.querySelectorAll('[data-seal-visible]').length===1&&!!host.closest('.document-output-options')&&!host.closest('#document-top-tools'));})()`),'each initialized editor has exactly one signing group inside bottom output controls');pass('signature version and signature/seal switches form one bottom control group per editor');
  for(const [type,number,text]of [['quotation','QA-WORKSPACE-QUOTE','QUOTATION-ONLY-CONTENT'],['invoice','PI-WORKSPACE-QUOTE','PI-ONLY-CONTENT'],['packing','PL-WORKSPACE-QUOTE','PACKING-ONLY-CONTENT']]){
   await activate(type);
   // New related sales documents intentionally copy quotation rows. Make the
   // fixtures independent before asserting snapshot isolation in the workspace.
   if(type!=='quotation')await run(`while(document.querySelectorAll('#quote-items .quote-line').length>1)document.querySelector('#quote-items .quote-line:last-child .remove-quote-item').click();`);
   await set('#quote-number',number);await set('#buyer-company','Workspace Test Buyer '+type);await set('#quote-items [data-qfield="description"]',text);await set('#quote-items [data-qfield="qty"]','1');
   if(type!=='packing')await set('#quote-items [data-qfield="unitPrice"]','1000');
   if(type==='quotation'){
    for(let i=0;i<20;i++)await click('#add-quote-item-btn');
    await run(`document.querySelectorAll('#quote-items .quote-line').forEach((row,i)=>{for(const [key,value]of Object.entries({description:'QUOTATION-ONLY-CONTENT row '+i+' — independent machinery description for the actual multipage PDF pagination check.',qty:'1',unitPrice:'1000'})){const input=row.querySelector('[data-qfield="'+key+'"]');if(input){input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));}}});`);
   }
   await capture();
  }
  await activate('invoice');assert.equal(await run(`document.querySelector('#quote-number').value`),'PI-WORKSPACE-QUOTE');assert.equal(await run(`document.querySelector('#quote-items [data-qfield="description"]').value`),'PI-ONLY-CONTENT');
  await activate('packing');assert.equal(await run(`document.querySelector('#quote-number').value`),'PL-WORKSPACE-QUOTE');pass('independent current drafts retain editor values before preview');
  assert.equal(await run(`!!document.querySelector('#document-output-preview')`),false,'editing does not automatically open preview');
  assert.equal(await run(`getComputedStyle(document.querySelector('.quote-output-pane')).display`),'none','no persistent right preview');
  await click('#view-quote [data-form-preview]');await ready();
  for(const type of ['quotation','invoice','packing'])assert(await run(`!!document.querySelector('[data-output-document="${type}"]')`),'switch exists '+type);
  for(const selector of ['[data-output-select-all]','[data-output-print-all]','[data-output-export-all]','[data-output-print-selected]','[data-output-export-selected]'])assert(await run(`!!document.querySelector(${JSON.stringify(selector)})`),selector);
  await assertNoHistory();pass('unified preview exposes document selection and output actions without saving history');
  await choose('quotation');const qp=latestPreview('QA-WORKSPACE-QUOTE');assert(qp&&qp.pages>1,'quotation fixture must produce more than one real PDF page');assert(!qp.payload.html.includes('PI-ONLY-CONTENT'));assert(!qp.payload.html.includes('PACKING-ONLY-CONTENT'));assert((await pdfText(qp.token)).includes('QUOTATION-ONLY-CONTENT'),'real quotation PDF contains edited snapshot text');
  await set('[data-page-number]','1','change');await click('[data-next]');assert.equal(await run(`document.querySelector('[data-page-number]').value`),'2');assert.equal(await selectedType(),'quotation','next page cannot change selected document');
  await click('[data-prev]');assert.equal(await run(`document.querySelector('[data-page-number]').value`),'1');
  await choose('invoice');assert.equal(await selectedType(),'invoice');assert.equal(await run(`document.querySelector('[data-page-number]').value`),'1');const ip=latestPreview('PI-WORKSPACE-QUOTE');assert(ip&&!ip.payload.html.includes('QUOTATION-ONLY-CONTENT'));assert((await pdfText(ip.token)).includes('PI-ONLY-CONTENT'),'real PI PDF contains its independent text');pass('document switching is independent from actual PDF page switching');
  saveMode='cancelled';let n=events.export.length;await click('[data-export-preview]');await waitEvents('export',n+1);await idle();assert.equal(events.export.at(-1).result.status,'cancelled');await assertNoHistory();
  printMode='cancelled';await set('[data-print-pages]','1');n=events.print.length;await click('[data-print-preview]');await waitEvents('print',n+1);await idle();assert.equal(events.print.at(-1).options.pages,'1','current printing honors its page selection');await assertNoHistory();pass('cancelled current export and cancelled print never archive');
  saveMode='failed';await click('[data-export-preview]');await wait(async()=>/失败/.test(await status()),'failed export status');await idle();await assertNoHistory();
  await click('[data-return-preview]');await uiWait(`!document.querySelector('#document-output-preview')`);assert.equal(await run(`document.querySelector('#quote-number').value`),'PI-WORKSPACE-QUOTE');assert.equal(await run(`document.querySelector('#quote-items [data-qfield="description"]').value`),'PI-ONLY-CONTENT');pass('failed output preserves contents and returning opens the selected document for editing');
  await click('#export-pdf-btn');await ready();await choose('invoice');saveMode='exported';n=events.export.length;await click('[data-export-preview]');await waitEvents('export',n+1);await idle();await wait(async()=>(await quotations()).some(q=>q.quote_number==='PI-WORKSPACE-QUOTE'),'current output archived');
  const exported=events.export.at(-1),pdf=output.previews.get(exported.token)?.pdf;assert(pdf&&fs.readFileSync(exported.result.filePath).equals(pdf),'export bytes equal selected actual preview');assert.equal((await quotations()).length,1);pass('successful current export archives only its own snapshot and preserves preview bytes');
  await set('[data-output-select-all]',false,'change');for(const type of ['quotation','packing'])await set(`[data-output-select="${type}"]`,true,'change');
  allowDirectory=false;const priorDirectories=events.directories.length,priorExports=events.export.length;await click('[data-output-export-selected]');await wait(()=>events.directories.length>priorDirectories,'batch directory cancelled');await idle();assert.equal(events.export.length,priorExports);assert.equal((await quotations()).length,1,'cancelled selected batch cannot archive its unexported drafts');allowDirectory=true;pass('cancelled batch directory selection neither exports nor archives selected drafts');
  printMode='submitted';await set('[data-print-pages]','1');n=events.print.length;await click('[data-output-print-selected]');await waitEvents('print',n+2);await idle();assert.equal(events.print.length,n+2,'selected printing submits exactly two documents');assert(events.print.slice(n).every(e=>e.options.pages===''),'batch printing must print all pages of each independent document');
  const selectedPrints=events.print.slice(n).map(e=>events.create.find(p=>p.token===e.token)?.payload.html||'');assert(selectedPrints.some(s=>s.includes('QA-WORKSPACE-QUOTE'))&&selectedPrints.some(s=>s.includes('PL-WORKSPACE-QUOTE'))&&!selectedPrints.some(s=>s.includes('PI-WORKSPACE-QUOTE')));await wait(async()=>(await quotations()).length===3,'selected print archives two remaining drafts');pass('selected batch print uses independent preview tokens and archives each successful document once');
  n=events.export.length;await click('[data-output-export-selected]');await waitEvents('export',n+2);await idle();assert.equal(events.export.length,n+2);assert(events.export.slice(n).every(e=>e.batch&&fs.existsSync(e.result.filePath)));assert.equal((await quotations()).length,3);pass('selected batch export writes two PDFs and does not duplicate historical records');
  const count=await run(`document.querySelectorAll('#document-output-preview [data-output-document]').length`);
  printMode='submitted';n=events.print.length;await click('[data-output-print-all]');await waitEvents('print',n+count);await idle();assert.equal(events.print.length,n+count,'print all submits every independent document');pass('print-all action covers every document listed in the workspace');
  n=events.export.length;await click('[data-output-export-all]');await waitEvents('export',n+count);await idle();assert.equal(events.export.length,n+count,'export all writes every independent document');pass('export-all action covers every document listed in the workspace');
  assert(events.create.every(e=>e.payload.batch===true),'all workspace previews retain independent native preview tokens');
  await choose('packing');await click('[data-return-preview]');await uiWait(`!document.querySelector('#document-output-preview')`);assert.equal(await run(`document.querySelector('#quote-number').value`),'PL-WORKSPACE-QUOTE');assert.equal(await run(`document.querySelector('#quote-items [data-qfield="description"]').value`),'PACKING-ONLY-CONTENT');await activate('quotation');assert.equal(await run(`document.querySelector('#quote-number').value`),'QA-WORKSPACE-QUOTE');assert.equal(await run(`document.querySelectorAll('#quote-items .quote-line').length`),21);pass('return-to-edit and subsequent document switching preserve every draft');
  // A failure on one selected document must never offer history retry for an
  // unrelated current document that has not itself been exported or printed.
  await run(`(()=>{window.qaRetryFixtures=Object.fromEntries(${workspace()}.entries().map(entry=>{const data=structuredClone(entry.data);data.id='qa-retry-'+entry.type;data.quoteNumber='RETRY-'+entry.type;data.seriesId=data.id;data.version=0;data.isFormal=false;data.sourceQuoteId='';data.recordClass='draft';delete data.savedAt;delete data.formalizedAt;if(data.items)data.items=data.items.slice(0,1).map((item,i)=>({...item,id:data.id+'-item-'+i}));return [entry.type,data];}));})()`);
  for(const type of ['quotation','invoice','packing'])await run(`${workspace()}.activate(${JSON.stringify(type)},window.qaRetryFixtures[${JSON.stringify(type)}])`);
  await activate('invoice');await click('#export-pdf-btn');await ready();assert.equal(await selectedType(),'invoice');
  assert.equal(await run(`document.querySelector('.app-shell').inert`),true,'editor shell is inert while the output workspace is open');
  await run(`(()=>{window.qaHistoryFetch=window.fetch;window.qaFailQuotationHistory=true;window.fetch=(url,options)=>{let body;try{body=JSON.parse(options?.body||'{}');}catch{}if(window.qaFailQuotationHistory&&String(url).split('?')[0]==='/api/quotations'&&options?.method==='POST'&&body?.quoteNumber==='RETRY-quotation')return Promise.reject(Error('QA selected quotation history failure'));return window.qaHistoryFetch(url,options);};})()`);
  await set('[data-output-select-all]',false,'change');for(const type of ['quotation','packing'])await set(`[data-output-select="${type}"]`,true,'change');
  n=events.export.length;await click('[data-output-export-selected]');await waitEvents('export',n+2);await idle();assert.match(await status(),/历史保存失败/);
  let rows=await quotations();assert(!rows.some(q=>q.quote_number==='RETRY-invoice'));assert(!rows.some(q=>q.quote_number==='RETRY-quotation'));assert(rows.some(q=>q.quote_number==='RETRY-packing'));
  assert.equal(await run(`document.querySelector('[data-retry-history]').hidden`),true,'unoutput current PI must not expose history retry for another entry');
  await click('[data-retry-history]');await idle();rows=await quotations();assert(!rows.some(q=>q.quote_number==='RETRY-invoice'),'even programmatic retry cannot archive a document with no successful output');pass('a selected quotation archive failure cannot archive or expose retry on an unoutput current PI');
  await choose('quotation');assert.equal(await run(`document.querySelector('[data-retry-history]').hidden`),false,'failed quotation can retry only after selecting that document');
  const beforeRetryExports=events.export.length,beforeRetryPrints=events.print.length;
  await run(`window.qaFailQuotationHistory=false`);await click('[data-retry-history]');await wait(async()=>(await quotations()).some(q=>q.quote_number==='RETRY-quotation'),'failed document archive retry');await idle();
  assert.equal(events.export.length,beforeRetryExports,'history retry must not export PDF again');assert.equal(events.print.length,beforeRetryPrints,'history retry must not print again');assert.equal(await run(`document.querySelector('[data-retry-history]').hidden`),true);assert(!(await quotations()).some(q=>q.quote_number==='RETRY-invoice'));
  await run(`(()=>{window.fetch=window.qaHistoryFetch;})()`);await click('[data-return-preview]');await uiWait(`!document.querySelector('#document-output-preview')`);assert.equal(await run(`document.querySelector('.app-shell').inert`),false,'editor shell becomes interactive again after closing preview');pass('history retry archives only the successfully output failed entry without repeating output');
  assert.deepEqual(errors,[],'browser errors');fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({checks,errors,creates:events.create.map(e=>({name:e.payload.fileName,batch:e.payload.batch,pages:e.pages})),exports:events.export,prints:events.print},null,2));console.log('PASS actual multi-document output workspace. Evidence: '+dir);
 }catch(error){failed=true;console.error(error);console.error('Evidence:',dir);fs.writeFileSync(path.join(dir,'failure.json'),JSON.stringify({error:String(error),checks,errors,creates:events.create.map(e=>({name:e.payload.fileName,batch:e.payload.batch,pages:e.pages})),exports:events.export,prints:events.print},null,2));if(win&&!win.isDestroyed())fs.writeFileSync(path.join(dir,'failure.png'),(await win.webContents.capturePage()).toPNG());}
 finally{for(const p of output.previews.values())if(!p.win.isDestroyed())p.win.destroy();win?.destroy();if(server)await new Promise(resolve=>server.close(resolve));app.exit(failed?1:0);}
}).catch(error=>{console.error(error);app.exit(1);});
