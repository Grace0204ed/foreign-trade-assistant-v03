const {app,BrowserWindow}=require('electron'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
process.env.QUOTE_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'fta-options-'));
const output=path.resolve('output/iteration-qa');fs.mkdirSync(output,{recursive:true});
fs.mkdirSync(path.join(process.env.QUOTE_DATA_DIR,'electron-profile'),{recursive:true});app.setPath('userData',path.join(process.env.QUOTE_DATA_DIR,'electron-profile'));
app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 const server=await require('../server').startServer(0),base='http://127.0.0.1:'+server.address().port;
 const win=new BrowserWindow({show:false,width:1440,height:1040,webPreferences:{contextIsolation:true}}),run=s=>win.webContents.executeJavaScript(s),errors=[];
 win.webContents.on('console-message',(_e,l,m)=>{if(l===3)errors.push(m)});
 const wait=async expression=>{for(let i=0;i<100;i++){if(await run(expression))return;await new Promise(r=>setTimeout(r,50));}throw Error('Timeout: '+expression)};
 try{
 await win.loadURL(base);await wait("!!document.querySelector('#overview-metrics article')");await new Promise(r=>setTimeout(r,300));
 await run("OptionManager.mount();document.querySelector('[data-catalog=billingUnits]').click();document.querySelector('.dictionary-modal [data-add]').click()");
 await run(`(()=>{const row=document.querySelector('.dictionary-modal tbody tr:last-child');for(const [key,value] of Object.entries({value:'QA-UNIT',labelZh:'测试单位',labelEn:'QA Unit'})){const i=row.querySelector('[data-key='+key+']');i.value=value;i.dispatchEvent(new Event('input',{bubbles:true}));}document.querySelector('.dictionary-modal [data-save]').click()})()`);
 await wait("!document.querySelector('.dictionary-modal')");
 const saved=await(await fetch(base+'/api/settings')).json();assert(saved.settings.optionCatalog.billingUnits.some(r=>r.value==='QA-UNIT'));
 const invalid=structuredClone(saved.settings);invalid.optionCatalog.billingUnits[0].value='RENAMED';
 assert.equal((await fetch(base+'/api/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(invalid)})).status,400);
 // Edit and reorder a saved label, then deactivate and archive it without changing history.
 await run("document.querySelector('[data-catalog=billingUnits]').click()");
 await run(`(()=>{const rows=[...document.querySelectorAll('.dictionary-modal tbody tr')],row=rows.find(r=>r.querySelector('[data-key=value]').value==='QA-UNIT');const name=row.querySelector('[data-key=labelZh]');name.value='测试单位已编辑';name.dispatchEvent(new Event('input',{bubbles:true}));row.querySelector('[data-up]').click();document.querySelector('.dictionary-modal [data-save]').click()})()`);
 await wait("!document.querySelector('.dictionary-modal')");
 assert((await(await fetch(base+'/api/settings')).json()).settings.optionCatalog.billingUnits.some(r=>r.value==='QA-UNIT'&&r.labelZh==='测试单位已编辑'));
 // Reuse the real port manager and persistence API; test port does not touch seeded ports.
 await run("document.querySelector('[data-manage-ports]').click()");await wait("!!document.querySelector('.dictionary-modal [data-add]')");
 await run(`(()=>{document.querySelector('.dictionary-modal [data-add]').click();const row=document.querySelector('.dictionary-modal tbody tr');for(const [key,value] of Object.entries({countryName:'China',countryChineseName:'中国',portName:'QA Test Port',portChineseName:'测试港',sortOrder:'-10'})){const i=row.querySelector('[data-key='+key+']');i.value=value;i.dispatchEvent(new Event('input',{bubbles:true}));}row.querySelector('[data-key=isOriginPort]').checked=true;row.querySelector('[data-key=isOriginPort]').dispatchEvent(new Event('input',{bubbles:true}));row.querySelector('[data-save-port]').click()})()`);
 let port;for(let i=0;i<60;i++){port=(await(await fetch(base+'/api/ports')).json()).ports.find(p=>p.portName==='QA Test Port');if(port)break;await new Promise(r=>setTimeout(r,50));}assert(port&&port.sortOrder===-10&&port.isOriginPort);
 await wait("window.freightContext.ports.some(p=>p.portName==='QA Test Port')");
 await run("document.querySelector('.dictionary-modal [data-close]').click()");
 await run("document.querySelector('[data-create-document=invoice]').click()");
 assert(await run("!![...document.querySelectorAll('[data-qfield=billingUnit] option')].find(o=>o.value==='QA-UNIT')"));
 assert(await run("!![...document.querySelectorAll('#originPort-options option')].find(o=>o.value.includes('QA Test Port'))"));
 await run(`(()=>{for(const [selector,value,event] of [['#quote-number','QA-PRESENTATION','input'],['[data-qfield=description]','QA Machine long specification '.repeat(8),'input'],['[data-qfield=unitPrice]','100','input'],['#pdf-language','en','change'],['#document-table-color','#ffee00','input'],['#document-product-style','bold-black','change'],['#document-product-color','#223344','input']]){const i=document.querySelector(selector);assertElement(i,selector);i.value=value;i.dispatchEvent(new Event(event,{bubbles:true}));}function assertElement(i,s){if(!i)throw Error('Missing '+s)}})()`);
 const style=await run(`(()=>{const h=getComputedStyle(document.querySelector('#quote-preview thead th')),p=getComputedStyle(document.querySelector('#quote-preview tbody .preview-col-description'));return {background:h.backgroundColor,text:h.color,weight:p.fontWeight,color:p.color,terms:document.querySelector('#quote-preview').innerText}})()`);
 assert(await run("!!document.querySelector('.document-appearance-toolbar #pdf-language')"),'language stays at editor top');
 assert.equal(style.background,'rgb(255, 238, 0)');assert.equal(style.text,'rgb(17, 17, 17)');assert.equal(style.weight,'700');assert.equal(style.color,'rgb(34, 51, 68)');assert(style.terms.includes('Incorrect or incomplete payment details may result in the transfer being rejected or delayed.'));
 await run("document.querySelector('#save-quote-btn').click()");
 let records;for(let i=0;i<60;i++){records=(await(await fetch(base+'/api/quotations')).json()).quotations;if(records.some(q=>q.quote_number==='QA-PRESENTATION'))break;await new Promise(r=>setTimeout(r,50));}
 const record=records.find(q=>q.quote_number==='QA-PRESENTATION');assert(record);
 await win.reload();await wait("!!document.querySelector('#overview-metrics article')");await run(`window.quoteApp.editQuote('${record.id}')`);
 assert(await run("getComputedStyle(document.querySelector('#quote-preview thead th')).backgroundColor==='rgb(255, 238, 0)'"));
 assert(await run("getComputedStyle(document.querySelector('#quote-preview tbody .preview-col-description')).color==='rgb(34, 51, 68)'"));
 assert(await run("document.querySelector('#pdf-language').value==='en'"));
 await run("document.fonts.ready");fs.writeFileSync(path.join(output,'pi-preview.png'),(await win.webContents.capturePage()).toPNG());
 const expectedHeaders={};
 for(const language of ['en','zh','bilingual']){
   await run(`document.querySelector('#pdf-language').value='${language}';document.querySelector('#pdf-language').dispatchEvent(new Event('change',{bubbles:true}));document.body.classList.add('printing-standard')`);
   expectedHeaders[language]=await run("document.querySelector('#quote-preview .document-letterhead').innerText.split(/\\n+/).filter(Boolean)");
   assert(await run(`document.querySelector('#quote-preview').innerText.includes(DocumentPresentation.terms('${language}'))`),'PI paragraph differs from exact requested copy');
   fs.writeFileSync(path.join(output,'pi-'+language+'.pdf'),await win.webContents.printToPDF({printBackground:true,pageSize:'A4',marginsType:0}));
   await run("document.body.classList.remove('printing-standard')");
 }
 fs.writeFileSync(path.join(output,'expected-pi-headers.json'),JSON.stringify(expectedHeaders));
 const beforeHistory=await(await fetch(base+'/api/quotations/'+record.id)).text();
 await run(`(async()=>{const s=structuredClone(quoteSettingsContext.settings),r=s.optionCatalog.billingUnits.find(o=>o.value==='QA-UNIT');r.active=false;r.deletedAt=new Date().toISOString();await quoteSettingsContext.save({optionCatalog:s.optionCatalog});})()`);
 assert(!await run("OptionCatalog.active(quoteSettingsContext.settings,'billingUnits').some(r=>r.value==='QA-UNIT')"));
 assert.equal(await(await fetch(base+'/api/quotations/'+record.id)).text(),beforeHistory,'archival changed historical document');
 const removed=await(await fetch(base+'/api/ports/'+port.id,{method:'DELETE'})).json();assert.equal(removed.mode,'inactive');
 assert(!(await(await fetch(base+'/api/ports')).json()).ports.some(r=>r.id===port.id));
 await run(`window.quoteApp.editQuote('${record.id}')`);
 assert(await run("document.querySelector('#quote-preview').innerText.includes('QA Machine')"));
 await run("(async()=>{AppLock.configure({enabled:true,pinHash:await AppLock.hash('123456')});AppLock.lock()})()");
 assert(await run("document.querySelector('#application-lock-screen input').type==='password'"));
 for(const width of [1440,390]){win.setSize(width,900);const r=await run("(()=>{const i=document.querySelector('#application-lock-screen input').getBoundingClientRect(),e=document.querySelector('[data-lock-eye]').getBoundingClientRect();return {input:i.width,height:i.height,eye:e.x,left:i.x}})()");assert(r.input>=220&&r.height>=48&&r.eye<r.left);}
 assert(await run("(()=>{const i=document.querySelector('#application-lock-screen input');i.value='123456';document.querySelector('[data-lock-eye]').click();const shown=i.type==='text'&&i.value==='123456';document.querySelector('[data-lock-eye]').click();return shown&&i.type==='password'&&i.value==='123456'})()"));
 await run("document.querySelector('#application-lock-screen input').value='0000';document.querySelector('[data-unlock]').click()");await wait("!!document.querySelector('.app-lock-error').textContent");
 await run("document.querySelector('#application-lock-screen input').value='123456';document.querySelector('#application-lock-screen input').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}))");await wait("!AppLock.isLocked()");
 // The same managed catalog must reach the separate CRM page after reopening it.
 const crmSettings=(await(await fetch(base+'/api/settings')).json()).settings;
 crmSettings.optionCatalog.buyerTypes.push({id:'qa-buyer',value:'QA <Buyer>',labelZh:'测试买家',labelEn:'QA buyer',parentId:'',active:true,sortOrder:-10});
 assert((await fetch(base+'/api/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(crmSettings)})).ok);
 win.setSize(1440,1040);await win.loadURL(base+'/crm');await wait("!!document.querySelector('.add')");
 await run("document.querySelector('.add').click()");assert(await run("[...document.querySelector('[name=buyer_type]').options].some(o=>o.value==='QA <Buyer>')"),'managed CRM option is escaped and synchronized');
 await run("document.querySelector('[name=name]').value='QA CATALOG CUSTOMER';document.querySelector('[name=buyer_type]').value='QA <Buyer>';document.querySelector('.modal-backdrop form').requestSubmit()");
 await wait("!document.querySelector('.modal-backdrop')");
 await win.reload();await wait("!!document.querySelector('.add')");
 assert((await(await fetch(base+'/api/customers')).json()).some(c=>c.name==='QA CATALOG CUSTOMER'&&c.buyer_type==='QA <Buyer>'),'CRM selection persisted');
 assert.equal(errors.length,0,errors.join('\n'));console.log('PASS actual option manager save/reload, API rejection, live contrast/font/color, persisted PI language, three PDF exports and PIN validation; '+output);
 }finally{win.destroy();server.close();app.quit();}
}).catch(e=>{console.error(e);app.exit(1)});
