'use strict';
const {app,BrowserWindow,ipcMain,dialog}=require('electron');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const dir=process.env.QUOTE_DATA_DIR,phase=process.env.FTA_QUOTE_PRODUCT_PHASE;
if(!dir||!phase)throw Error('Use run-quote-library-factory.cjs');
app.setPath('userData',path.join(dir,'profile'));app.on('window-all-closed',()=>{});
const output=require('../electron/document-output.cjs')({app,BrowserWindow,ipcMain,dialog,getBatchDirectory:()=>dir});
for(const [name,value] of Object.entries({'get-app-version':{version:require('../package.json').version,packaged:false},'get-license-status':{licensed:true},'get-update-state':{status:'current'},'get-publisher-contact':{}}))ipcMain.handle(name,()=>value);
app.whenReady().then(async()=>{
 const server=await require('../server').startServer(0),base='http://127.0.0.1:'+server.address().port;
 const win=new BrowserWindow({show:false,width:1672,height:1040,webPreferences:{offscreen:true,backgroundThrottling:false,preload:path.resolve('electron/preload.js')}});
 const run=async s=>{try{return await win.webContents.executeJavaScript(s,true);}catch(error){throw Error(error.message+' | '+s.slice(0,600));}};
 win.webContents.on('console-message',e=>{if(e.level==='error')console.error(e.message.slice(0,700));});
 const wait=async s=>{for(let i=0;i<400;i++){if(await run(s))return;await new Promise(r=>setTimeout(r,30));}throw Error('Timeout '+s);};
 const get=route=>fetch(base+route).then(r=>r.json());
 const set=(selector,value,event='input')=>run(`(()=>{const n=document.querySelector(${JSON.stringify(selector)});if(!n)throw Error('Missing '+${JSON.stringify(selector)});n.value=${JSON.stringify(value)};n.dispatchEvent(new Event(${JSON.stringify(event)},{bubbles:true}));})()`);
 const pdf=async(name,expected,forbidden)=>{
  await run(`quotationDesktop.createDocumentPreview({html:quoteSettingsContext.outputHtml('quote'),fileName:'${name}.pdf'})`);
  const preview=[...output.previews.values()].at(-1),parser=new(require('pdf-parse').PDFParse)({data:preview.pdf});
  try{const result=await parser.getText(),text=result.text.normalize('NFKC').replace(/\s+/g,' ');for(const value of expected)assert(text.includes(value),'PDF missing '+value);assert(!forbidden.test(text),'PDF contains obsolete transport labels');assert.equal(result.total,1);fs.writeFileSync(path.join(dir,name+'.pdf'),preview.pdf);}finally{await parser.destroy();preview.win?.destroy();output.previews.delete(preview.token);}
 };
 try{
  await win.loadURL(base);await wait('!!window.foreignTradeStartupReady');await run('window.foreignTradeStartupReady');
  if(phase==='write'){
   await run(`DocumentDraftWorkspace.activate('quotation')`);
   await wait(`document.querySelector('#view-quote').classList.contains('active')&&!!quoteSettingsContext.editingRecords.quote.systemIdentity.number`);
   await run(`(()=>{const q=quoteSettingsContext.editingRecords.quote;q.items=[{id:'manual-new-machine',kind:'product',imageDataUrl:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jr4kAAAAASUVORK5CYII=',values:{itemType:'设备',description:'Factory QA New Wheel Loader',brand:'XCMG',model:'XC958-QA',condition:'new-machine',hsCode:'84295100',qty:3,unitPrice:45450,currency:'USD',remark:'Do not change quotation'}}];q.terms.shipping='EXW';q.terms.originPort='Shanghai Port';q.editingDetails={};const config=quoteSettingsContext.settings.documentConfigs.quotation;delete config.factoryDeliverySchemaVersion;for(const f of config.blocks.terms)if(f.fieldKey==='transportDeliveryPlace'){f.visible=false;f.active=false;}quoteSettingsContext.editingRefresh();DocumentComposer.setOpen(document.querySelector('#quote-standard-terms-panel'),true)})()`);
   assert.equal(await run(`document.querySelector('[data-flow-detail=deliveryPlace]').value`),'China Factory / 中国工厂');
   assert(!await run(`!!document.querySelector('[data-flow-detail=origin],[data-flow-detail=destination],[data-flow-mode]')`),'EXW has no port or transport selector without delegation');
   await set('[data-flow-detail=deliveryPlace]','中国合肥工厂');
   await pdf('exw-factory',['EXW','中国合肥工厂'],/Origin Port|Shanghai Port|起运港/);
   await set('[data-flow-term]','FOB','change');
   assert.equal(await run(`document.querySelector('[data-flow-detail=origin]').closest('label').firstChild.textContent`),'交货港');
   await set('[data-flow-detail=origin]','上海港');
   await pdf('fob-delivery',['Port of Delivery','交货港','上海港'],/Origin Port|起运港/);
   await set('[data-flow-term]','CIF','change');await set('[data-flow-mode]','container','change');
   assert.equal(await run(`document.querySelector('[data-flow-detail=origin]').closest('label').firstChild.textContent`),'起运港');
   assert.equal(await run(`document.querySelector('[data-flow-detail=destination]').getAttribute('list')`),'port-options');
   await set('[data-flow-term]','EXW','change');
   assert.equal(await run(`document.querySelector('[data-flow-detail=deliveryPlace]').value`),'中国合肥工厂','per-term factory location retained');
   await set('#buyer-identity','none','change');await run(`document.querySelector('[data-save-quote-product]').click()`);
   await wait(`document.querySelector('#product-editor-modal').open`);
   assert(await run(`document.querySelector('#product-editor-modal').getBoundingClientRect().height>100&&getComputedStyle(document.querySelector('#product-editor-modal')).display!=='none'`),'product modal must actually be visible over the quotation');
   assert.equal(await run(`document.querySelector('[data-product-field=name]').value`),'Factory QA New Wheel Loader');
   assert.equal(await run(`document.querySelector('[data-product-field=model]').value`),'XC958-QA');
   assert.equal(await run(`document.querySelector('#product-specific-price').value`),'45450','unit price, not quantity multiplied total');
   assert.equal(await run(`quoteSettingsContext.collectProduct().values.hsCode`),'84295100');
   assert.equal(await run(`quoteSettingsContext.collectProduct().values.condition`),'new-machine');
   assert(await run(`document.querySelector('#product-image-preview').dataset.image.startsWith('data:image/')`));
   await set('[data-product-field=remark]','Saved from quote after actual restart');
   await run(`new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))`);fs.writeFileSync(path.join(dir,'product-entry.png'),(await win.webContents.capturePage()).toPNG());
   await run('window.flushPendingWork()');
   const rows=(await get('/api/work-drafts')).drafts.filter(r=>!r.completedAt);
   assert(rows.some(r=>r.kind==='products'&&r.data.product.quoteSource?.itemId==='manual-new-machine'),'prefilled product is durably saved before closing');
   assert.equal((await get('/api/products')).products.length,0,'opening editor does not insert a product');
  }else{
   await run(`document.querySelector('#document-draft-box').click()`);
   await wait(`!!document.querySelector('#work-recovery-modal [data-resume]')`);
   await run(`[...document.querySelectorAll('#work-recovery-modal article')].find(n=>n.textContent.includes('产品编辑')).querySelector('[data-resume]').click()`);
   await wait(`document.querySelector('#product-editor-modal').open&&!document.querySelector('#work-recovery-modal')`);
   assert.equal(await run(`document.querySelector('[data-product-field=remark]').value`),'Saved from quote after actual restart');
   assert.equal(await run(`quoteSettingsContext.collectProduct().values.hsCode`),'84295100','hidden HS retained after real restart');
   await run(`document.querySelector('#save-product-btn').click();document.querySelector('#save-product-btn').click()`);
   await wait(`!document.querySelector('#product-editor-modal').open&&quoteSettingsContext.products.length===1`);
   let products=(await get('/api/products')).products;assert.equal(products.length,1,'double click creates one product');
   const p=products[0];assert.equal(p.values._quoteSource?.itemId,'manual-new-machine');assert.equal(p.model,'XC958-QA');assert.equal(p.currency,'USD');assert.equal(Number(p.specificPrice),45450);assert.equal(p.values.hsCode,'84295100');assert.equal(p.values.condition,'new-machine');assert(p.imagePath.startsWith('data:image/'));
   await run(`document.querySelector('#document-draft-box').click()`);await wait(`!!document.querySelector('#work-recovery-modal [data-resume]')`);
   await run(`[...document.querySelectorAll('#work-recovery-modal article')].find(n=>n.textContent.includes('报价单')).querySelector('[data-resume]').click()`);
   await wait(`document.querySelector('#view-quote').classList.contains('active')&&!document.querySelector('#work-recovery-modal')`);
   assert(await run(`document.querySelector('[data-save-quote-product]').disabled`),'recovered quote recognizes the product already saved from this row');
   const item=await run(`quoteSettingsContext.editingRecords.quote.items[0]`);assert.equal(item.values.productId,p.id);assert.equal(Number(item.values.qty),3);assert.equal(Number(item.values.unitPrice),45450);assert.equal(item.values.remark,'Do not change quotation');
   assert.equal(await run(`document.querySelector('[data-flow-detail=deliveryPlace]').value`),'中国合肥工厂','EXW survives real application restart');
   await pdf('recovered-exw',['中国合肥工厂','136,350.00'],/Origin Port|起运港/);
   assert.equal(await run(`quoteSettingsContext.editingRecords.quote.buyer.identity`),'none');await run(`document.querySelector('#quote-items .editing-sheet-scroll').scrollLeft=99999;DocumentComposer.setOpen(document.querySelector('#quote-standard-terms-panel'),true)`);await run(`new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))`);fs.writeFileSync(path.join(dir,'recovered-quote.png'),(await win.webContents.capturePage()).toPNG());
   await run(`document.querySelector('[data-save-quote-product]').click()`);assert.equal((await get('/api/products')).products.length,1);
   assert.equal((await get('/api/quotations')).quotations.length,0,'library entry never saves or changes quotation history');
  }
  console.log('PASS quote product / factory '+phase+'; evidence '+dir);
 }catch(error){fs.writeFileSync(path.join(dir,'failure-'+phase+'.png'),(await win.webContents.capturePage()).toPNG());throw error;}
 finally{for(const p of output.previews.values())p.win?.destroy();win.destroy();server.closeAllConnections?.();await new Promise(r=>server.close(r));app.quit();}
}).catch(error=>{console.error(error.stack);app.exit(1)});
