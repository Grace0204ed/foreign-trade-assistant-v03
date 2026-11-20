'use strict';
const {app,BrowserWindow,ipcMain,dialog}=require('electron'),fs=require('fs'),os=require('os'),path=require('path'),assert=require('node:assert/strict');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fta-company-manual-'));process.env.QUOTE_DATA_DIR=path.join(dir,'data');app.setPath('userData',path.join(dir,'profile'));app.on('window-all-closed',()=>{});
const output=require('../electron/document-output.cjs')({app,BrowserWindow,ipcMain,dialog,getBatchDirectory:()=>dir});
for(const [name,value]of Object.entries({'get-app-version':{version:require('../package.json').version,packaged:false},'get-license-status':{licensed:true},'get-update-state':{status:'current'},'get-publisher-contact':{}}))ipcMain.handle(name,()=>value);
app.whenReady().then(async()=>{
 const server=await require('../server').startServer(0),base='http://127.0.0.1:'+server.address().port,win=new BrowserWindow({show:false,width:1672,height:1040,webPreferences:{offscreen:true,backgroundThrottling:false,preload:path.resolve('electron/preload.js')}});
 const run=async s=>{try{return await win.webContents.executeJavaScript(s,true);}catch(e){throw Error(e.message+' | '+s.slice(0,450));}},wait=async s=>{for(let i=0;i<400;i++){if(await run(s))return;await new Promise(r=>setTimeout(r,30));}throw Error('Timeout '+s);};
 const set=(selector,value)=>run(`(()=>{const n=document.querySelector(${JSON.stringify(selector)});if(!n)throw Error('Missing '+${JSON.stringify(selector)});if(n.type==='checkbox')n.checked=${JSON.stringify(value)};else n.value=${JSON.stringify(value)};n.dispatchEvent(new Event('change',{bubbles:true}));})()`);
 async function pdf(kind,type){
  await run(`quotationDesktop.createDocumentPreview({html:quoteSettingsContext.outputHtml('${kind}'),fileName:'${type}.pdf'})`);
  const p=[...output.previews.values()].at(-1),parser=new(require('pdf-parse').PDFParse)({data:p.pdf});
  try{const result=await parser.getText(),text=result.text.normalize('NFKC');assert(text.includes('QA B COMPANY'),type+' selected company in real PDF');assert(!text.includes('QA A COMPANY'),type+' previous company absent from PDF');assert(text.includes('B SIGNER'),type+' named signatory retained for handwriting');assert.equal(result.total,1);fs.writeFileSync(path.join(dir,type+'.pdf'),p.pdf);fs.writeFileSync(path.join(dir,type+'.png'),(await parser.getScreenshot({desiredWidth:1100,imageBuffer:true,imageDataUrl:false})).pages[0].data);}finally{await parser.destroy();p.win?.destroy();output.previews.delete(p.token);}
 }
 try{
  await win.loadURL(base);await wait('!!window.foreignTradeStartupReady');await run('window.foreignTradeStartupReady');
  await run(`(async()=>{const s=structuredClone(quoteSettingsContext.settings),image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jr4kAAAAASUVORK5CYII=';const profile=letter=>({companyNameEn:'QA '+letter+' COMPANY',companyNameZh:'',companyAddressEn:letter+' Factory China',companyPhone:letter+'-PHONE',companyEmail:letter+'@example.test',contactFields:[],contactPerson:letter+' SIGNER',agencyAuthorizer:letter+' SIGNER',agencyAuthorizerTitle:letter+' DIRECTOR',invitationSignerName:letter+' SIGNER',invitationSignerTitle:letter+' DIRECTOR',companySignatures:{en:{name:letter+' SIGNER',title:letter+' DIRECTOR',transparent:image,version:1},zh:{name:letter+' SIGNER',title:letter+' DIRECTOR',transparent:image,version:1}},stampDataUrl:image,logoDataUrl:image,bankFields:[{id:'bank-number',labelZh:'银行账号',labelEn:'Account Number',value:letter+'-ACCOUNT',visible:true}],receivingAccounts:[],paymentQrFields:[]});Object.assign(s,profile('A'));s.activeCompanyId='company-a';s.companyProfiles=[{id:'company-a',data:profile('A')},{id:'company-b',data:profile('B')}];await quoteSettingsContext.save(s);})()`);
  const globalBefore=await run(`JSON.stringify(quoteSettingsContext.settings.companyProfiles)`);
  for(const type of ['quotation','invoice','commercial','contract','packing','authorization','statement','invitation']){
   const kind=type==='invitation'?'invitation':['authorization','statement'].includes(type)?'agency':'quote',host=kind==='quote'?'quote-preview':kind+'-preview';
   await run(`DocumentDraftWorkspace.activate('${type}')`);await wait(`document.querySelector('#view-${kind}').classList.contains('active')&&!!document.querySelector('#view-${kind} [data-composer-company]')`);
   if(kind==='quote')await run(`(()=>{const q=quoteSettingsContext.editingRecords.quote;q.items=[{id:'company-qa-'+q.documentType,kind:'product',values:{itemType:'设备',description:'Company switch QA machine',qty:1,unitPrice:1000,currency:'USD',billingUnit:'台'}}];q.buyer.identity='none';quoteSettingsContext.editingRefresh()})()`);
   if(kind==='agency')await run(`quoteSettingsContext.editingRecords.agency.agentName='QA RECIPIENT';quoteSettingsContext.editingRecords.agency.fixedCommission=100;quoteSettingsContext.editingRecords.agency.commissionBasis='fixed';quoteSettingsContext.authorizationChanged()`);
   if(kind==='invitation')await run(`quoteSettingsContext.editingRecords.invitation.editorStep=3;DocumentEditing.invitation(quoteSettingsContext.editingRecords.invitation)`);
   await set('#view-'+kind+' [data-composer-company]','company-b');
   assert.equal(await run(`quoteSettingsContext.settings.activeCompanyId`),'company-a','editor does not alter background active company');
   assert.equal(await run(`JSON.stringify(quoteSettingsContext.settings.companyProfiles)`),globalBefore,'company source records untouched');
   assert(await run(`document.querySelector('#${host}').textContent.includes('QA B COMPANY')`),type+' live company header');
   assert(!await run(`document.querySelector('#${host}').textContent.includes('QA A COMPANY')`),type+' no stale company header');
   await set('#signing-controls-'+kind+' [data-signature-choice]','none');
   await set('#signing-controls-'+kind+' [data-seal-visible]',false);
   assert.equal(await run(`document.querySelector('#signing-controls-${kind} [data-signature-choice]').value`),'none','manual choice stays selected');
   assert(await run(`!!document.querySelector('#${host} [data-manual-signature]')&&!!document.querySelector('#${host} [data-manual-seal]')`),type+' both handwriting spaces retained');
   assert(!await run(`!!document.querySelector('#${host} .signing-composite img')`),type+' electronic images hidden');
   assert(await run(`document.querySelector('#${host}').textContent.includes('B SIGNER')`),type+' signatory name retained');
   if(type!=='packing')await pdf(kind,type);
   if(type==='quotation'){
    assert(await run(`document.querySelector('#quote-preview').textContent.includes('B-ACCOUNT')&&!document.querySelector('#quote-preview').textContent.includes('A-ACCOUNT')`),'bank data follows selected company');
    await run(`document.querySelector('#save-quote-btn').click()`);await wait(`!!quoteSettingsContext.editingRecords.quote.savedAt`);
    const id=await run(`quoteSettingsContext.editingRecords.quote.id`);const before=await fetch(base+'/api/quotations/'+id).then(r=>r.json());
    assert.equal(before.quotation.settingsSnapshot._quoteMeta.documentExtras.companyProfileId,'company-b');
    await set('#view-quote [data-composer-company]','company-a');
    assert.deepEqual(await fetch(base+'/api/quotations/'+id).then(r=>r.json()),before,'changing editor company does not overwrite saved history');
    await run(`quoteApp.editQuote('${id}')`);await wait(`quoteSettingsContext.editingRecords.quote.companyProfileId==='company-b'`);
    assert.equal(await run(`document.querySelector('#view-quote [data-composer-company]').value`),'company-b','saved company selection reopens');
   }
  }
  await run('window.flushPendingWork()');
  await win.loadURL(base);await wait('!!window.foreignTradeStartupReady');await run('window.foreignTradeStartupReady');
  await run(`document.querySelector('#document-draft-box').click()`);await wait(`!!document.querySelector('#work-recovery-modal [data-resume]')`);
  await run(`[...document.querySelectorAll('#work-recovery-modal article')].find(n=>n.textContent.includes('形式发票')).querySelector('[data-resume]').click()`);await wait(`!document.querySelector('#work-recovery-modal')&&document.querySelector('#view-quote').classList.contains('active')`);
  assert.equal(await run(`document.querySelector('#view-quote [data-composer-company]').value`),'company-b');
  assert(await run(`!!document.querySelector('#quote-preview [data-manual-signature]')&&!document.querySelector('#quote-preview .signing-composite img')`),'company and manual signing survive reload/recovery');
  for(const width of [1672,1024]){win.setSize(width,1040);await run(`new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))`);assert(await run(`(()=>{const n=document.querySelector('#view-quote [data-composer-company]'),r=n.getBoundingClientRect();return r.width>100&&r.right<=innerWidth;})()`),'visible company selector at '+width);fs.writeFileSync(path.join(dir,'company-selector-'+width+'.png'),(await win.webContents.capturePage()).toPNG());}
  console.log('PASS eight company selectors, real PDFs, company/bank/signing isolation, retained manual signature/seal spaces, history and durable recovery; evidence '+dir);
 }catch(error){fs.writeFileSync(path.join(dir,'failure.png'),(await win.webContents.capturePage()).toPNG());throw error;}
 finally{for(const p of output.previews.values())p.win?.destroy();win.destroy();server.closeAllConnections?.();await new Promise(r=>server.close(r));app.quit();}
}).catch(error=>{console.error(error.stack);app.exit(1)});
