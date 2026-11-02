const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const locales=require('../assets/document-locales.js');
const auditLayout=require('./document-layout-audit.cjs');
process.env.QUOTE_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'fta-language-qa-'));
app.setPath('userData',path.join(process.env.QUOTE_DATA_DIR,'profile'));app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 const server=await require('../server').startServer(0),base='http://127.0.0.1:'+server.address().port;
 const win=new BrowserWindow({show:false,width:1440,height:1050,webPreferences:{backgroundThrottling:false}});
 const run=s=>win.webContents.executeJavaScript(s),output=path.resolve('output/language-qa');fs.mkdirSync(output,{recursive:true});
 const results=[],errors=[];win.webContents.on('render-process-gone',(_e,d)=>errors.push(d.reason));
 try{
  await win.loadURL(base);for(let i=0;i<200&&!await run('!!window.quoteApp&&!!window.flushPendingWork&&!!document.querySelector("#signing-controls-invitation")');i++)await new Promise(r=>setTimeout(r,40));
  const docs={quotation:'Quotation',invoice:'Proforma Invoice',contract:'Sales Contract',commercial:'Commercial Invoice',packing:'Packing List',invitation:'Invitation Letter',authorization:'Letter of Authorization',statement:'Order Commission Statement',procurement:'Personal Procurement Service Agreement'};
  for(const [type,title] of Object.entries(docs)){
   if(process.env.LANGUAGE_QA_TYPES&&!process.env.LANGUAGE_QA_TYPES.split(',').includes(type))continue;
   const standalone=['invitation','authorization','statement','procurement'].includes(type),kind=['authorization','statement','procurement'].includes(type)?'agency':type==='invitation'?'invitation':'quote';
   const select=kind==='quote'?'pdf-language':kind+'-language',host=kind+'-preview';
   await run(`window.decideCloseWork?.('discard')`);await run(`document.querySelector('[data-create-document=${type}]').click()`);
   for(const lang of Object.keys(locales.languages).filter(l=>!process.env.LANGUAGE_QA_LANGS||process.env.LANGUAGE_QA_LANGS.split(',').includes(l))){
    if(!standalone){
     const doc={id:`locale-${type}-${lang}`,quoteNumber:`QA-${type}-${lang}`,documentType:type,pdfLanguage:lang,settingsSnapshot:{companyNameEn:'QA International Trading Company',companyAddressEn:'Hefei, China'},buyer:{company:'QA Buyer 123',contact:'QA Contact',country:'Kenya',phone:'+254721747572',email:'qa@example.com',address:'QA Street 88'},terms:{shipping:'FOB',originPort:'Shanghai',port:'Mombasa',payment:'30/70'},documentExtras:{packing:{machine:{packages:'1',netWeight:'1200',grossWeight:'1300',cbm:'12',marks:'QA-123'}}},items:[{id:'machine',productSnapshot:{productName:'Dynapac CA402'},priceSnapshot:{quantity:1,unitPrice:23000,currency:'USD',values:{description:'Dynapac CA402 14-ton road roller',qty:'1',unitPrice:'23000',billingUnit:'Unit',hsCode:'84294000'}}}]};
     doc.items[0].id='machine-'+type+'-'+lang;doc.documentExtras.packing[doc.items[0].id]=doc.documentExtras.packing.machine;delete doc.documentExtras.packing.machine;
     const response=await fetch(base+'/api/quotations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(doc)});assert(response.ok);
     await run(`window.decideCloseWork('discard')`);await run(`window.quoteApp.editQuote(${JSON.stringify(doc.id)})`);
     assert.equal(await run(`document.getElementById('${select}').value`),lang,'persist/reopen language '+type);
    }else if(kind==='agency'){
     const record={id:`locale-${type}-${lang}`,documentType:type,authorizationNumber:`QA-${type}-${lang}`,language:lang,date:'2026-11-01',validUntil:'2027-11-01',agentName:'QA Recipient 456',country:'Kenya',idNumber:'QA-ID-456',phone:'+254721747572',email:'qa@example.com',address:'QA Street 88',company:'QA International Trading Company',authorizer:'QA Signer',selectedProducts:['挖掘机','装载机'],commissionMin:5,commissionMax:10,showCommission:true,markupAllowed:true,paymentChannel:'bank',commissionBasis:'fixed',fixedCommission:2000,contractAmount:30000,currency:'USD',salesContractNumber:'SC-QA-456',isTemplate:true,personalLegalName:'QA Signer',personalAlias:'QA Signer',purchaseMachine:'Dynapac CA402',purchaseAmount:23000,purchaseFee:3500,purchaseCancellation:'QA cancellation agreement'};
     const response=await fetch(base+'/api/agent-authorizations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(record)});assert(response.ok,await response.text());
     await run(`window.decideCloseWork?.('discard')`);await run(`document.querySelector('[data-create-document=${type}]').click()`);
     for(let i=0;i<100&&!await run(`!!document.querySelector('[data-agency-action="open"][data-id="${record.id}"]')`);i++)await new Promise(r=>setTimeout(r,40));
     await run(`window.decideCloseWork('discard')`);await run(`document.querySelector('[data-agency-action="open"][data-id="${record.id}"]').click()`);
     for(let i=0;i<200&&await run(`document.getElementById('${select}').value`)!==lang;i++)await new Promise(r=>setTimeout(r,25));
     assert.equal(await run(`document.getElementById('${select}').value`),lang,`persist/reopen ${type}; `+await run(`document.querySelector('#toast').textContent+' / LEAVE '+!!document.querySelector('#leave-work-modal')`));
    }else{
     await run(`(()=>{for(const [id,value] of Object.entries({'invitation-name':'QA Visitor 789','invitation-company':'QA Buyer 123','invitation-country':'Kenya','invitation-gender':'Male / 男','invitation-passport':'QA-PASS-789','invitation-arrival':'2026-11-10','invitation-departure':'2026-11-30'})){const input=document.getElementById(id);input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));}const s=document.getElementById('${select}');s.value='${lang}';s.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    }
    await run('document.fonts.ready.then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))');
    const state=await run(`(()=>{const h=document.getElementById('${host}');return {lang:h.lang,dir:h.dir,text:h.textContent,columns:[...h.querySelectorAll('tbody tr')].map(r=>r.children.length),headers:h.querySelectorAll('thead th').length}})()`);
    assert.equal(state.lang,lang,type);assert.equal(state.dir,lang==='ar'?'rtl':'ltr');
    const expectedTitle=locales.label(title,lang)||require('../assets/document-fixed-locales.js').lookup(title,lang)||title;
    const normalizeTitle=s=>s.toLocaleLowerCase().replace(/[\s’'’.-]/g,'');
    assert(normalizeTitle(state.text).includes(normalizeTitle(expectedTitle)),`${type}/${lang} title missing: ${expectedTitle}; ${state.text.slice(0,350)}`);
    assert(!/\[(?:fr|es|ja|ru|ar|it|de|ko):/.test(state.text),`${type}/${lang} unresolved translation: ${state.text.match(/\[(?:fr|es|ja|ru|ar|it|de|ko):[^\]]*\]/g)}`);
    if(kind==='agency'){assert(state.text.includes('QA Recipient 456'));if(type==='statement')assert(state.text.includes('SC-QA-456'));}
    if(type==='invitation'){assert(state.text.includes('QA-PASS-789'));assert(!state.text.includes('Male / 男'),`${lang} gender must follow output language`);if(lang!=='en')assert(state.text.includes(require('../assets/document-fixed-locales.js').lookup('Male',lang)),`${lang} localized gender`);}
    if(!standalone&&lang!=='en')assert(!state.text.includes('Port of Discharge'),`${type}/${lang} untranslated destination port label`);
    if(!standalone){assert(state.text.includes('QA Buyer 123'));if(await run(`!!document.querySelector('#${host} .preview-col-hsCode')`))assert(state.text.includes('84294000'));assert(state.text.includes('Dynapac CA402'));assert(state.columns.every(n=>n===state.headers),`${type}/${lang} columns mismatch`);}
    assert.deepEqual(await run(`(${auditLayout.toString()})('${host}')`),[],`${type}/${lang} screen layout`);
    const cls=standalone?'printing-'+kind:'printing-standard';await run(`document.body.classList.add('${cls}')`);
    win.webContents.debugger.attach('1.3');await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia',{media:'print'});
    assert.deepEqual(await run(`(${auditLayout.toString()})('${host}')`),[],`${type}/${lang} print layout`);
    if(process.env.LANGUAGE_QA_LAYOUT)fs.writeFileSync(path.join(output,`${type}-${lang}-layout.json`),JSON.stringify(await run(`(()=>{const host=document.getElementById('${host}'),nodes=[document.documentElement,document.body,...host.parentElement.parentElement.querySelectorAll('*')].filter(n=>n===host||n.contains(host)||n.parentElement===host.firstElementChild);return nodes.map(n=>{const s=getComputedStyle(n),r=n.getBoundingClientRect();return {tag:n.tagName,id:n.id,class:n.className,top:r.top,height:r.height,bg:s.background,shadow:s.boxShadow,breakAfter:s.breakAfter,breakInside:s.breakInside,margin:s.margin,padding:s.padding};});})()`),null,2));
    await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia',{media:''});win.webContents.debugger.detach();
    const file=path.join(output,`${type}-${lang}.pdf`);fs.writeFileSync(file,await (async()=>{await run('window.prepareDocumentSigningImages?.()');return win.webContents.printToPDF({printBackground:true,marginsType:0,pageSize:'A4',preferCSSPageSize:true})})());
    await run(`document.body.classList.remove('${cls}')`);results.push({type,lang,file});
   }
  }
  assert.equal(results.length,(process.env.LANGUAGE_QA_TYPES?process.env.LANGUAGE_QA_TYPES.split(',').length:9)*(process.env.LANGUAGE_QA_LANGS?process.env.LANGUAGE_QA_LANGS.split(',').length:9));assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,process.env.LANGUAGE_QA_TYPES?'manifest-subset.json':'manifest.json'),JSON.stringify(results,null,2));console.log('PASS '+results.length+' actual PDFs: stored language, titles, Arabic direction, buyer/product/HS values, table column alignment. '+output);
 }finally{win.destroy();server.close();app.quit();}
}).catch(e=>{console.error(e);app.exit(1)});
