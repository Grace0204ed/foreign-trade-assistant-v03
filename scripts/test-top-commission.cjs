const {app,BrowserWindow}=require('electron');
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const out=fs.mkdtempSync(path.join(os.tmpdir(),'fta-top-commission-'));
process.env.QUOTE_DATA_DIR=path.join(out,'data');app.setPath('userData',path.join(out,'profile'));app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 const server=await require('../server').startServer(0),base='http://127.0.0.1:'+server.address().port;
 const win=new BrowserWindow({show:false,width:1440,height:1100,webPreferences:{backgroundThrottling:false,offscreen:true}}),run=s=>win.webContents.executeJavaScript(s);
 win.webContents.on('console-message',(_e,level,message)=>{if(level===3)console.error('RENDERER',message);});
 const wait=async s=>{for(let i=0;i<240;i++){if(await run(s))return;await new Promise(r=>setTimeout(r,50));}throw Error('Timeout '+s);};
 try{
  await win.loadURL(base);await wait("!!window.quoteSettingsContext && document.querySelectorAll('#overview-metrics article').length===4");
  await run(`document.querySelector('[data-view=settings]').click();document.querySelector('[data-settings-section=translation]').click();window.confirm=message=>{window.qaTopConfirmation=message;return true;};document.querySelector('[data-top-language]').value='ja';document.querySelector('[data-top-color]').value='#245798';document.querySelector('[data-top-save]').click()`);
  await wait(`quoteSettingsContext.settings.documentPreferences?.defaults?.language==='ja'`);
  assert(await run(`window.qaTopConfirmation.includes('佣金结算单')`),'apply all names affected documents');
  assert.equal(await run(`document.querySelectorAll('[data-language-toggle]').length`),10);
  await run(`document.querySelector('[data-top-region]').value='body';document.querySelector('[data-top-region]').dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('[data-top-size]').value='14';document.querySelector('[data-top-text-color]').value='#193a59';document.querySelector('[data-top-save]').click()`);
  await wait(`quoteSettingsContext.settings.documentPreferences.defaults.typography.body.fontSize===14`);
  await run(`document.querySelector('[data-top-region]').value='footer';document.querySelector('[data-top-region]').dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('[data-top-size]').value='11';document.querySelector('[data-top-save]').click()`);
  await wait(`quoteSettingsContext.settings.documentPreferences.defaults.typography.footer.fontSize===11`);
  assert.equal(await run(`quoteSettingsContext.settings.documentPreferences.defaults.typography.body.fontSize`),14,'switching region preserves independent settings');
  await run(`quoteSettingsContext.save({documentPreferences:{defaults:{language:'ja',color:'#245798',typography:{product:{fontWeight:400,color:'#16324f',fontSize:14,lineHeight:1.7}}},overrides:{invitation:{language:'zh'}}},documentColorPreferences:{quotation:'#245798',statement:'#245798'}})`);
  await win.reload();await wait("!!window.quoteSettingsContext && document.querySelectorAll('#overview-metrics article').length===4");
  await run(`document.querySelector('[data-create-document=quotation]').click()`);
  assert.equal(await run(`document.querySelector('#pdf-language').value`),'ja');
  assert(await run(`(()=>{const html=quoteSettingsContext.outputHtml('quote');return html.includes('#16324f')||html.includes('rgb(22, 50, 79)')})()`),'typography reaches output');
  await run(`document.querySelector('[data-create-document=invitation]').click()`);
  assert.equal(await run(`document.querySelector('#invitation-language').value`),'zh');
  await run(`document.querySelector('[data-create-document=statement]').click()`);
  assert.equal(await run(`document.querySelector('#agency-language').value`),'ja');
  await run(`for(const [id,value] of Object.entries({'agency-agent-name':'QA 收款人','agency-sales-contract-number':'QA-CONTRACT-001','agency-contract-amount':'120000','agency-order-rate':'2.5','agency-bank-account':'QA-ACCOUNT','agency-document-notes':'保留原文 / English / Français'})){const el=document.getElementById(id);el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));}`);
  assert.equal(await run(`document.querySelector('#agency-payable').value`),'USD 3000.00');
  await run(`document.querySelector('#agency-commission-basis').value='fixed';document.querySelector('#agency-commission-basis').dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('#agency-fixed-commission').value='1234.56';document.querySelector('#agency-fixed-commission').dispatchEvent(new Event('input',{bubbles:true}))`);
  assert.equal(await run(`document.querySelector('#agency-payable').value`),'USD 1234.56');
  assert.equal(await run(`document.querySelector('#agency-country').closest('label').hidden`),true);
  const pdfwin=new BrowserWindow({show:false,width:1000,height:1200,webPreferences:{offscreen:true}}),{PDFParse}=require('pdf-parse');
  for(const lang of ['zh','en','fr','ja','es','ru','ar','it','de','ko']){
   await run(`document.querySelector('#agency-language').value='${lang}';document.querySelector('#agency-language').dispatchEvent(new Event('change',{bubbles:true}))`);
   const html=await run(`quoteSettingsContext.outputHtml('agency')`);
   assert(html.includes('QA-CONTRACT-001'));assert(!html.includes('commission-party-b'));
   if(lang==='ar')assert(html.includes('dir="rtl"'));
   await pdfwin.loadURL('data:text/html;charset=utf-8,'+encodeURIComponent(html));
   await pdfwin.webContents.executeJavaScript('document.fonts.ready.then(()=>true)');
   const pdf=await pdfwin.webContents.printToPDF({printBackground:true,preferCSSPageSize:true});fs.writeFileSync(path.join(out,lang+'.pdf'),pdf);
   const parser=new PDFParse({data:pdf});try{const text=(await parser.getText()).text;assert(text.includes('QA-CONTRACT-001'),lang);assert(text.includes('1,234.56'),lang);const pages=await parser.getScreenshot({desiredWidth:1000,imageBuffer:true,imageDataUrl:false});fs.writeFileSync(path.join(out,lang+'.png'),pages.pages[0].data);}finally{await parser.destroy();}
  }
  pdfwin.destroy();
  await run(`document.querySelector('#agency-save-btn').click()`);
  await wait(`fetch('/api/agent-authorizations').then(r=>r.json()).then(d=>d.authorizations.some(a=>a.salesContractNumber==='QA-CONTRACT-001'&&a.settlementSchema===2))`);
  console.log('PASS top defaults/reload, independent language, commission rate/fixed calculation and 10 real PDFs. Evidence: '+out);
  win.destroy();server.close();app.exit(0);
 }catch(error){console.error(error);console.error('Evidence: '+out);win.destroy();server.close();app.exit(1);}
});
