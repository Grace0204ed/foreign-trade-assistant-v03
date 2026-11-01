const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
process.env.QUOTE_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'fta-editor-demo-'));
app.setPath('userData',path.join(process.env.QUOTE_DATA_DIR,'profile'));app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 const server=await require('../server').startServer(0),base='http://127.0.0.1:'+server.address().port;
 const win=new BrowserWindow({show:false,width:1440,height:1080,webPreferences:{contextIsolation:true,backgroundThrottling:false}});
 const output=path.resolve('output/demo-editor-qa');fs.mkdirSync(output,{recursive:true});
 const run=s=>win.webContents.executeJavaScript(s);
 const wait=async s=>{for(let i=0;i<180;i++){if(await run(s))return;await new Promise(r=>setTimeout(r,50));}throw Error('Timeout '+s);};
 const shot=async name=>{await run('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');await new Promise(r=>setTimeout(r,500));fs.writeFileSync(path.join(output,name+'.png'),(await win.webContents.capturePage()).toPNG());};
 try{
  await win.loadURL(base);await wait("document.querySelector('[data-create-document=invoice]')");
  await run("document.querySelector('[data-create-document=invoice]').click()");
  await wait("document.querySelector('#view-quote.active') && document.querySelector('#quote-common-panel h3').textContent.includes('形式发票')");
  assert.match(await run("document.querySelector('#quote-number').value"),/^PI-/);
  assert.equal(await run("document.querySelectorAll('#quote-common-panel .editor-field-group-title').length"),2);
  assert(await run("getComputedStyle(document.querySelector('#quote-standard-detail-panel>.row-head')).display==='flex'"));
  assert(await run("Math.abs(document.querySelector('#quote-standard-detail-panel>.row-head>h3').getBoundingClientRect().top-document.querySelector('#quote-standard-detail-panel>.row-head>.actions').getBoundingClientRect().top)<20"),'detail title and toolbar must share a row');
  assert(await run("getComputedStyle(document.querySelector('#quote-items .demo-editor-table tr')).display==='grid'"));
  assert.equal(await run("document.querySelectorAll('#quote-items [data-qfield=hsCode]').length"),1);
  await run("document.querySelector('#buyer-company').value='Demo Buyer';document.querySelector('#buyer-company').dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('.quote-extra-fields').open=true;document.querySelector('[data-qfield=hsCode]').value='84294000';document.querySelector('[data-qfield=hsCode]').dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('[data-qfield=description]').value='Dynapac CA402 14-ton road roller';document.querySelector('[data-qfield=description]').dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('[data-qfield=unitPrice]').value='23000';document.querySelector('[data-qfield=unitPrice]').dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('#quote-common-panel').scrollIntoView()");
  await shot('pi-basic');await run("document.querySelector('#quote-standard-detail-panel').scrollIntoView()");await shot('pi-items-expanded');
  await run("document.querySelector('.quote-extra-fields').open=false;document.querySelector('#save-quote-btn').click()");
  await wait("document.querySelector('#save-quote-btn') && document.querySelector('#quote-preview').textContent.includes('Demo Buyer')");
  let saved;for(let i=0;i<100;i++){const data=await(await fetch(base+'/api/quotations')).json();saved=data.quotations.find(q=>q.buyer?.company==='Demo Buyer');if(saved)break;await new Promise(r=>setTimeout(r,50));}
  assert(saved,'save must persist');
  const detail=await(await fetch(base+'/api/quotations/'+saved.id)).json();
  assert(JSON.stringify(detail).includes('84294000'),'collapsed secondary field must persist');
  for(const [type,prefix] of [['quotation','QA'],['invoice','PI'],['contract','SC'],['commercial','CI'],['packing','PL']]){
   await run(`document.querySelector('#view-quote [data-switch-document=${type}]').click()`);
   await wait(`document.querySelector('#view-quote.active [data-switch-document=${type}].is-current-document')`);
   assert.match(await run("document.querySelector('#quote-number').value"),new RegExp('^'+prefix+'-'));
   assert(await run("!!document.querySelector('#quote-items .demo-editor-table')"));
   await run("document.querySelector('#quote-standard-detail-panel').scrollIntoView()");await shot(type+'-items');
  }
  win.setSize(1024,900);await shot('packing-1024');
  console.log('PASS approved demo editor: grouped forms, readable primary columns, expandable configurable fields, collapsed-field persistence, five shared editors and document-specific numbers. '+output);
 }finally{win.destroy();server.close();app.quit();}
}).catch(e=>{console.error(e);app.exit(1);});
