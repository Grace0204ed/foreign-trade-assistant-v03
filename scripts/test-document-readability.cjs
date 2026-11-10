const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const P=require('../assets/document-presentation');
const auditLayout=require('./document-layout-audit.cjs');
process.env.QUOTE_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'fta-readable-'));
app.setPath('userData',path.join(process.env.QUOTE_DATA_DIR,'profile'));app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 const server=await require('../server').startServer(0),base='http://127.0.0.1:'+server.address().port;
 const win=new BrowserWindow({show:false,width:1440,height:1100,webPreferences:{backgroundThrottling:false}}),run=async s=>{try{return await win.webContents.executeJavaScript(s);}catch(e){throw Error(e.message+'\n'+s)}};
 win.webContents.on('console-message',e=>{if(e.level==='error')console.error(e.message)});
 const out=path.resolve('output/readability-qa');fs.mkdirSync(out,{recursive:true});const results=[];
 try{
  await win.loadURL(base);for(let i=0;i<200&&!await run('!!window.quoteApp&&!!window.flushPendingWork&&!!document.querySelector("#signing-controls-invitation")');i++)await new Promise(r=>setTimeout(r,40));
  assert.equal(await run("!!document.getElementById('document-color-reset')"),false);
  for(const type of (process.env.READABILITY_DENSE_ONLY?[]:['quotation','invoice','contract','commercial','packing'])){
   await run(`window.decideCloseWork?.('discard')`);await run(`document.querySelector('[data-create-document=${type}]').click()`);
   for(const lang of ['bilingual','en','fr','ja','es','ru','ar','it','de','ko']){
    const id='read-'+type+'-'+lang;
    const doc={id,quoteNumber:id,documentType:type,pdfLanguage:lang,settingsSnapshot:{companyNameEn:'QA Trading Company',companyAddressEn:'Hefei, China'},buyer:{company:'QA Buyer',country:'Kenya'},terms:{shipping:'FOB',originPort:'Shanghai',port:'Mombasa',payment:'30/70'},documentExtras:{packing:{machine:{packages:'1',netWeight:'1200',grossWeight:'1300',cbm:'12',marks:'QA-123'}}},items:[{id:'machine',productSnapshot:{productName:'Dynapac CA402'},priceSnapshot:{quantity:1,unitPrice:23000,currency:'USD',values:{description:'Dynapac CA402 road roller',qty:'1',unitPrice:'23000',currency:'USD',billingUnit:'Unit',hsCode:'84294000'}}}]};
    doc.items[0].id='machine-'+id;doc.documentExtras.packing[doc.items[0].id]=doc.documentExtras.packing.machine;delete doc.documentExtras.packing.machine;
    assert((await fetch(base+'/api/quotations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(doc)})).ok);
    await run(`window.decideCloseWork('discard')`);await run(`window.quoteApp.editQuote(${JSON.stringify(id)})`);
    for(const color of ['#2074b9','#fff2cc','#111111']){
     await run(`(()=>{const input=document.getElementById('document-table-color');input.value='${color}';input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
     await run('document.fonts.ready.then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))');
     const inspect=()=>run(`(()=>{const t=document.querySelector('#quote-preview table.document-data-table');return {width:t.clientWidth,scroll:t.scrollWidth,headers:[...t.querySelectorAll('thead th')].map(th=>({text:th.textContent,key:th.className,width:th.offsetWidth,height:th.offsetHeight,font:parseFloat(getComputedStyle(th).fontSize),color:getComputedStyle(th).color,bg:getComputedStyle(th).backgroundColor,small:[...th.querySelectorAll('small')].map(s=>({color:getComputedStyle(s).color,font:parseFloat(getComputedStyle(s).fontSize)}))})),rows:[...t.querySelectorAll('tbody tr')].map(r=>r.children.length)}})()`);
     for(const media of ['screen','print']){
      if(media==='print'){await run("document.body.classList.add('printing-standard')");await win.webContents.debugger.attach('1.3');await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia',{media:'print'});}
      const state=await inspect();
      for(const h of state.headers){assert(h.width>=18,`${type}/${lang}/${media} narrow ${h.text}: ${h.width}`);assert(h.height<=115,`${type}/${lang}/${media} tall header ${h.text}: ${h.height}`);assert(h.font>=10.5);assert(P.contrastRatio(h.color,h.bg)>=4.5,`low contrast ${h.text}`);for(const small of h.small){assert.equal(small.color,h.color);assert(small.font>=10);}}
      assert(state.rows.every(n=>n===state.headers.length));assert(state.scroll<=state.width+2,`${type}/${lang}/${media} table overflow ${state.scroll}/${state.width}`);
      results.push({type,lang,color,media,...state});
      if(media==='print'){await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia',{media:''});win.webContents.debugger.detach();await run("document.body.classList.remove('printing-standard')");}
     }
     if(color==='#2074b9'){
      await run("document.querySelector('#quote-preview table.document-data-table').scrollIntoView({block:'center'})");
      await run('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
      const rect=await run("(()=>{const r=document.querySelector('#quote-preview table.document-data-table').getBoundingClientRect();return {x:Math.floor(r.x),y:Math.floor(r.y),width:Math.ceil(r.width),height:Math.ceil(r.height)}})()");
      fs.writeFileSync(path.join(out,`${type}-${lang}.png`),(await win.webContents.capturePage(rect)).toPNG());
      await run("document.body.classList.add('printing-standard')");fs.writeFileSync(path.join(out,`${type}-${lang}.pdf`),await win.webContents.printToPDF({printBackground:true,marginsType:0,pageSize:'A4',preferCSSPageSize:true}));await run("document.body.classList.remove('printing-standard')");
     }
    }
   }
  }
  // Reproduce the dense packing-list header from the reported screenshot,
  // then check a genuinely multi-page list rather than a one-line fixture.
  await run("window.decideCloseWork?.('discard');document.querySelector('[data-view=settings]').click();document.querySelector('[data-settings-section=packing-config]').click()");
  const keys=['itemType','description','packages','netWeight','grossWeight','hsCode','qty','cbm','billingUnit','marks','unitPrice','currency','amount'];
  await run(`(async()=>{const s=structuredClone(window.quoteSettingsContext.settings),c=s.documentConfigs.packing;const labels={itemType:['条目类型','Item Type'],description:['商品说明','Product Description'],packages:['件数','Packages'],netWeight:['净重（kg）','Net Weight (kg)'],grossWeight:['毛重（kg）','Gross Weight (kg)'],hsCode:['海关编码','HS CODE'],qty:['数量','Quantity'],cbm:['体积（m³）','Volume (m³)'],billingUnit:['计费单位','Billing Unit'],marks:['唛头','Shipping Marks'],unitPrice:['单价','Unit Price'],currency:['币种','Currency'],amount:['金额','Amount']};const existing=c.blocks.items;c.blocks.items=${JSON.stringify(keys)}.map((key,i)=>({...existing.find(f=>f.fieldKey===key),id:'dense-'+key,fieldKey:key,zh:labels[key][0],en:labels[key][1],visible:true,active:true,sortOrder:i*10}));await window.quoteSettingsContext.save(s)})()`);
  for(const lang of ['bilingual','en','fr','ja','es','ru','ar','it','de','ko']){
   const id='dense-packing-'+lang,items=Array.from({length:36},(_,i)=>({id:'dense-'+lang+'-'+i,productSnapshot:{productName:'QA-MACHINE-'+String(i+1).padStart(2,'0')},priceSnapshot:{quantity:1,unitPrice:23000,currency:'USD',values:{description:'QA-MACHINE-'+String(i+1).padStart(2,'0')+' / Dynapac CA402 road roller',qty:'1',unitPrice:'23000',currency:'USD',billingUnit:'Unit',hsCode:'84294000'}}}));
   const packing=Object.fromEntries(items.map(item=>[item.id,{packages:'1',netWeight:'1200',grossWeight:'1300',cbm:'12',marks:'QA-123'}]));
   const doc={id,quoteNumber:id,documentType:'packing',pdfLanguage:lang,tableHeaderColor:'#2074b9',settingsSnapshot:{companyNameEn:'QA Trading Company',companyAddressEn:'Hefei, China'},buyer:{company:'QA Buyer',country:'Kenya'},terms:{shipping:'FOB',originPort:'Shanghai',port:'Mombasa'},documentExtras:{packing},items};
   assert((await fetch(base+'/api/quotations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(doc)})).ok);
   await run(`window.decideCloseWork('discard')`);await run(`window.quoteApp.editQuote('${id}')`);await run('document.fonts.ready');
   assert.equal(await run("document.querySelectorAll('#quote-preview thead th').length"),14,'dense packing columns');
   assert.deepEqual(await run(`(${auditLayout.toString()})('quote-preview')`),[],lang+' dense screen text bounds');
   await run("document.body.classList.add('printing-standard')");
   await win.webContents.debugger.attach('1.3');await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia',{media:'print'});
   assert.deepEqual(await run(`(${auditLayout.toString()})('quote-preview')`),[],lang+' dense print text bounds');
   await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia',{media:''});win.webContents.debugger.detach();
   fs.writeFileSync(path.join(out,id+'.pdf'),await win.webContents.printToPDF({printBackground:true,marginsType:0,pageSize:'A4',preferCSSPageSize:true}));await run("document.body.classList.remove('printing-standard')");
  }
  if(process.env.READABILITY_DENSE_ONLY){console.log('PASS dense packing layouts in ten languages. '+out);return;}
  // New documents inherit the last chosen colour for their own type. Existing
  // stored documents retain their saved snapshots rather than adopting it.
  for(const type of ['quotation','invoice','contract','commercial','packing','authorization','statement','invitation']){
   await run(`window.decideCloseWork?.('discard')`);await run(`document.querySelector('[data-create-document=${type}]').click()`);
   const input=type==='invitation'?'invitation-color':['authorization','statement','procurement'].includes(type)?'agency-color':'document-table-color';
   await run(`(()=>{const el=document.getElementById('${input}');el.value='#1f7047';el.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  }
  for(let i=0;i<200;i++){const stored=await (await fetch(base+'/api/settings')).json();if(Object.keys(stored.settings.documentColorPreferences||{}).length===8&&Object.values(stored.settings.documentColorPreferences).every(c=>c==='#1f7047'))break;await new Promise(r=>setTimeout(r,50));}
  await run('window.flushPendingWork()');
  const backed=await (await fetch(base+'/api/system/browser-state')).json();
  assert.equal(Object.keys(backed.state.settings.documentColorPreferences).length,8);
  // A fresh browser origin has no localStorage (as with a changed local port).
  await win.loadURL(base.replace('127.0.0.1','localhost'));for(let i=0;i<200&&!await run('!!window.quoteApp&&!!window.flushPendingWork&&!!document.querySelector("#signing-controls-invitation")');i++)await new Promise(r=>setTimeout(r,40));
  const colors=await run("JSON.parse(BusinessDataStore.get('quote_assistant_v01_settings')||'{}').documentColorPreferences");assert.equal(Object.keys(colors).length,8);assert(Object.values(colors).every(v=>v==='#1f7047'));
  await run("window.quoteApp.editQuote('read-packing-en')");assert.equal(await run("document.getElementById('document-table-color').value"),'#285fc1','stored old snapshot should not use last colour');
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(results,null,2));console.log('PASS '+results.length+' screen/print layouts: 5 documents, bilingual + all 9 languages, 3 colours; 50 PDFs plus 10 dense 14-column multi-page PDFs; 8 current document colour preferences survive fresh origin; history untouched. '+out);
 }finally{win.destroy();server.close();app.quit();}
}).catch(e=>{console.error(e);app.exit(1)});
