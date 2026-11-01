const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const locales=require('../assets/document-locales.js');
process.env.QUOTE_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'fta-language-qa-'));
app.setPath('userData',path.join(process.env.QUOTE_DATA_DIR,'profile'));app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 const server=await require('../server').startServer(0),base='http://127.0.0.1:'+server.address().port;
 const win=new BrowserWindow({show:false,width:1440,height:1050,webPreferences:{backgroundThrottling:false}});
 const run=s=>win.webContents.executeJavaScript(s),output=path.resolve('output/language-qa');fs.mkdirSync(output,{recursive:true});
 const results=[],errors=[];win.webContents.on('render-process-gone',(_e,d)=>errors.push(d.reason));
 try{
  await win.loadURL(base);for(let i=0;i<200&&!await run('!!window.quoteApp');i++)await new Promise(r=>setTimeout(r,40));
  const docs={quotation:'Quotation',invoice:'Proforma Invoice',contract:'Sales Contract',commercial:'Commercial Invoice',packing:'Packing List',invitation:'Invitation Letter',authorization:'Letter of Authorization'};
  for(const [type,title] of Object.entries(docs)){
   const standalone=['invitation','authorization'].includes(type),kind=type==='authorization'?'agency':type==='invitation'?'invitation':'quote';
   const select=kind==='quote'?'pdf-language':kind+'-language',host=kind+'-preview';
   await run(`document.querySelector('[data-create-document=${type}]').click()`);
   for(const lang of Object.keys(locales.languages)){
    if(!standalone){
     const doc={id:`locale-${type}-${lang}`,quoteNumber:`QA-${type}-${lang}`,documentType:type,pdfLanguage:lang,settingsSnapshot:{companyNameEn:'QA International Trading Company',companyAddressEn:'Hefei, China'},buyer:{company:'QA Buyer 123',contact:'QA Contact',country:'Kenya',phone:'+254721747572',email:'qa@example.com',address:'QA Street 88'},terms:{shipping:'FOB',originPort:'Shanghai',port:'Mombasa',payment:'30/70'},documentExtras:{packing:{machine:{packages:'1',netWeight:'1200',grossWeight:'1300',cbm:'12',marks:'QA-123'}}},items:[{id:'machine',productSnapshot:{productName:'Dynapac CA402'},priceSnapshot:{quantity:1,unitPrice:23000,currency:'USD',values:{description:'Dynapac CA402 14-ton road roller',qty:'1',unitPrice:'23000',billingUnit:'Unit',hsCode:'84294000'}}}]};
     doc.items[0].id='machine-'+type+'-'+lang;doc.documentExtras.packing[doc.items[0].id]=doc.documentExtras.packing.machine;delete doc.documentExtras.packing.machine;
     const response=await fetch(base+'/api/quotations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(doc)});assert(response.ok);
     await run(`window.quoteApp.editQuote(${JSON.stringify(doc.id)})`);
     assert.equal(await run(`document.getElementById('${select}').value`),lang,'persist/reopen language '+type);
    }else await run(`(()=>{const s=document.getElementById('${select}');s.value='${lang}';s.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    await run('document.fonts.ready.then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))');
    const state=await run(`(()=>{const h=document.getElementById('${host}');return {lang:h.lang,dir:h.dir,text:h.textContent,columns:[...h.querySelectorAll('tbody tr')].map(r=>r.children.length),headers:h.querySelectorAll('thead th').length}})()`);
    assert.equal(state.lang,lang,type);assert.equal(state.dir,lang==='ar'?'rtl':'ltr');
    if(locales.extra.includes(lang))assert(state.text.includes(locales.label(title,lang)),`${type}/${lang} title missing`);
    if(!standalone){assert(state.text.includes('QA Buyer 123'));if(await run(`!!document.querySelector('#${host} .preview-col-hsCode')`))assert(state.text.includes('84294000'));assert(state.text.includes('Dynapac CA402'));assert(state.columns.every(n=>n===state.headers),`${type}/${lang} columns mismatch`);}
    const cls=standalone?'printing-'+kind:'printing-standard';await run(`document.body.classList.add('${cls}')`);
    const file=path.join(output,`${type}-${lang}.pdf`);fs.writeFileSync(file,await win.webContents.printToPDF({printBackground:true,marginsType:0,pageSize:'A4'}));
    await run(`document.body.classList.remove('${cls}')`);results.push({type,lang,file});
   }
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(results,null,2));console.log('PASS '+results.length+' actual PDFs: seven document types x nine languages, stored language, titles, Arabic direction, buyer/product/HS values, table column alignment. '+output);
 }finally{win.destroy();server.close();app.quit();}
}).catch(e=>{console.error(e);app.exit(1)});
