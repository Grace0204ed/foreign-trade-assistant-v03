const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
process.env.QUOTE_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'fta-approved-ui-'));
app.setPath('userData',path.join(process.env.QUOTE_DATA_DIR,'profile'));
app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 const server=await require('../server').startServer(0),base='http://127.0.0.1:'+server.address().port;
 const win=new BrowserWindow({show:false,width:1440,height:1040});
 const run=async s=>{try{return await win.webContents.executeJavaScript(s);}catch(error){throw Error(error.message+'\n'+s);}},wait=async s=>{for(let n=0;n<150;n++){if(await run(s))return;await new Promise(r=>setTimeout(r,40));}throw Error('Timeout '+s);};
 try{
  for(let i=0;i<35;i++){
   const res=await fetch(base+'/api/quotations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:'history-ui-'+i,quoteNumber:'QA-HISTORY-'+i,documentType:i%2?'invoice':'quotation',buyer:{company:'History buyer '+i},items:[]})});assert(res.ok);
  }
  await win.loadURL(base);await wait("!!document.querySelector('#overview-metrics article')");
  const requests=[];win.webContents.session.webRequest.onBeforeRequest((details,callback)=>{requests.push(details.url);callback({});});
  await run("document.querySelector('[data-view=history]').click()");
  await wait("document.querySelector('#history-page-info').textContent.includes('共 35 份')");
  assert.equal(await run("document.querySelectorAll('.history-row-select').length"),30);
  const ids=await run("[...document.querySelectorAll('.history-row-select')].map(el=>el.dataset.id)");
  await run("document.querySelector('#history-page-next').click()");
  await wait("document.querySelector('#history-page-info').textContent.includes('第 2 / 2 页')");
  const next=await run("[...document.querySelectorAll('.history-row-select')].map(el=>el.dataset.id)");assert.equal(next.length,5);assert(!next.some(id=>ids.includes(id)));
  assert(!requests.some(url=>new URL(url).pathname==='/api/quotations'),'history must not request all snapshots');
  await run("document.querySelector('#history-document-type').value='invoice';document.querySelector('#history-document-type').dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('#history-search-btn').click()");
  await wait("document.querySelector('#history-page-info').textContent.includes('共 17 份')");
  assert.equal(await run("document.querySelectorAll('.history-row-select').length"),17);
  await run("document.querySelector('.history-more summary').click()");assert(await run("document.querySelector('.history-more').open"));
  await run("document.querySelector('#unified-history-list .history-actions > button').click()");
  await wait("document.querySelector('#view-quote').classList.contains('active')");
  assert(await run("document.querySelector('.desktop-topbar').contains(document.querySelector('#pdf-language'))"));
  assert(await run("getComputedStyle(document.querySelector('.quote-split-workspace')).display===(matchMedia('(max-width:1250px)').matches?'block':'grid')"),'wide right preview and narrow separate preview follow actual CSS viewport');
  for(const type of ['invitation','authorization']){
   await run(`document.querySelector('[data-create-document=${type}]').click()`);
   const id=type==='invitation'?'invitation-language':'agency-language';
   assert(await run(`document.querySelector('.desktop-topbar').contains(document.querySelector('#${id}'))`),type+' language stays in header');
  }
  console.log('PASS real history pagination, filters, no full-snapshot requests, editor layout and letter top tools; isolated data '+process.env.QUOTE_DATA_DIR);
 }finally{win.destroy();server.close();app.quit();}
}).catch(error=>{console.error(error);app.exit(1);});
