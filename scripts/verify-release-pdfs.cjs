const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
process.env.QUOTE_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'fta-pdf-qa-'));
const output=path.resolve('output/release-qa/pdfs');fs.mkdirSync(output,{recursive:true});
app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 const server=await require('../server').startServer(0),base='http://127.0.0.1:'+server.address().port;
 const win=new BrowserWindow({show:false,width:1440,height:1050,webPreferences:{contextIsolation:true}}),errors=[];
 const run=s=>win.webContents.executeJavaScript(s);
 win.webContents.on('console-message',(_e,level,message)=>{if(level===3)errors.push(message);});
 try{
  await win.loadURL(base);for(let i=0;i<100&&!await run("!!document.querySelector('#pdf-language option[value=en]')");i++)await new Promise(r=>setTimeout(r,50));
  const asset=await run(`(()=>{const c=document.createElement('canvas');c.width=240;c.height=100;const x=c.getContext('2d');x.fillStyle='#1355a0';x.font='italic 35px serif';x.fillText('QA Sign',10,65);return c.toDataURL()})()`);
  const seal=await run(`(()=>{const c=document.createElement('canvas');c.width=120;c.height=120;const x=c.getContext('2d');x.strokeStyle='red';x.lineWidth=4;x.beginPath();x.arc(60,60,53,0,7);x.stroke();x.fillStyle='red';x.font='20px serif';x.fillText('QA SEAL',15,65);return c.toDataURL()})()`);
  const company={companyNameEn:'QA Export Company',companyAddressEn:'QA test address',agencyAuthorizer:'QA Signer',agencyAuthorizerTitle:'Manager',agencySignatureDataUrl:asset,stampDataUrl:seal};
  for(const type of ['quotation','invoice','contract','commercial','packing']){
   const items=Array.from({length:18},(_,i)=>({id:type+'-'+i,productSnapshot:{productName:'QA Machine '+i,imageDataUrl:asset},priceSnapshot:{quantity:2,unitPrice:1234,currency:'USD',values:{description:'QA Machine '+i+' — long specification with dimensions and additional export packing requirements. '.repeat(i===0?5:1),qty:'2',unitPrice:'1234',billingUnit:'Unit',hsCode:'84295100',packages:'1',netWeight:'1200',grossWeight:'1300',cbm:'12',marks:'QA-'+i}}}));
   const packing=Object.fromEntries(items.map(i=>[i.id,{packages:'1',netWeight:'1200',grossWeight:'1300',cbm:'12',marks:i.id}]));
   const response=await fetch(base+'/api/quotations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:'pdf-'+type,quoteNumber:'QA-'+type,documentType:type,settingsSnapshot:company,buyer:{company:'QA Buyer',contact:'QA Contact',address:'QA Address'},terms:{shipping:'FOB',originPort:'Shanghai',port:'Durban',payment:'30/70'},pdfLanguage:'en',documentExtras:{tableHeaderColor:'#276749',packing,outputOptions:{[type]:{signature:true}}},items})});assert(response.ok);
   await run(`window.quoteApp.editQuote('pdf-${type}')`);await run('document.fonts.ready');
   const cells=await run("[...document.querySelectorAll('#quote-preview tbody tr')].every(r=>r.children.length===document.querySelectorAll('#quote-preview thead th').length)");assert(cells,type+' columns mismatch');
   fs.writeFileSync(path.join(output,type+'-preview.png'),(await win.webContents.capturePage()).toPNG());
   await run("document.body.classList.add('printing-standard')");
   fs.writeFileSync(path.join(output,type+'.pdf'),await win.webContents.printToPDF({printBackground:true,marginsType:0,pageSize:'A4'}));
   await run("document.body.classList.remove('printing-standard')");
  }
  for(const [type,view,cls] of [['invitation','invitation','printing-invitation'],['authorization','agency','printing-agency'],['agreement','agency','printing-agency'],['statement','agency','printing-agency'],['procurement','agency','printing-agency']]){
   await run(`document.querySelector('[data-create-document=${view==='agency'?'authorization':'invitation'}]').click()`);
   if(view==='agency')await run(`document.querySelector('#agency-document-type').value='${type}';document.querySelector('#agency-document-type').dispatchEvent(new Event('change',{bubbles:true}))`);
   await run('document.fonts.ready');
   fs.writeFileSync(path.join(output,type+'-preview.png'),(await win.webContents.capturePage()).toPNG());
   await run(`document.body.classList.add('${cls}')`);
   fs.writeFileSync(path.join(output,type+'.pdf'),await win.webContents.printToPDF({printBackground:true,marginsType:0,pageSize:'A4'}));
   await run(`document.body.classList.remove('${cls}')`);
  }
  await run("window.quoteApp.editQuote('pdf-invoice')");
  await run(`window.quoteSettingsContext.save({...${JSON.stringify(company)},agencyAuthorizer:'QA NEW SIGNER'})`);
  await run("document.querySelector('#document-show-signature').click();document.querySelector('#document-show-signature').click()");
  assert(await run("document.querySelector('.document-signature-block').textContent.includes('QA NEW SIGNER')"),'signer refresh');
  await run(`window.quoteSettingsContext.save({companyNameEn:'OTHER QA COMPANY',agencyAuthorizer:'WRONG SIGNER',stampDataUrl:''})`);
  await run("document.querySelector('#document-show-signature').click();document.querySelector('#document-show-signature').click()");
  assert(!await run("document.querySelector('.document-signature-block').textContent.includes('WRONG SIGNER')"),'company isolation');
  assert.equal(errors.length,0,errors.join('\n'));console.log('PASS real Electron A4 export: nine document types, signer refresh and company isolation; '+output);
 }finally{win.destroy();server.close();app.quit();}
}).catch(e=>{console.error(e);app.exit(1);});
