const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
process.env.QUOTE_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'fta-library-flow-'));
fs.mkdirSync(path.join(process.env.QUOTE_DATA_DIR,'electron-profile'),{recursive:true});app.setPath('userData',path.join(process.env.QUOTE_DATA_DIR,'electron-profile'));
app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 const server=await require('../server').startServer(0),base='http://127.0.0.1:'+server.address().port;
 const win=new BrowserWindow({show:false,webPreferences:{contextIsolation:true}});
 const run=async s=>{try{return await win.webContents.executeJavaScript(s);}catch(e){throw Error(s+'\n'+e.message);}};
 const wait=async s=>{for(let i=0;i<100;i++){if(await run(s))return;await new Promise(r=>setTimeout(r,50));}throw Error('Timeout '+s);};
 const records=async()=>{const r=await fetch(base+'/api/products');return (await r.json()).products;};
 const reload=async()=>{win.reload();await wait("document.querySelectorAll('#overview-metrics article').length===4");await run("window.confirm=()=>true;document.querySelector('[data-view=products]').click()");};
 try{
  await win.loadURL(base);await wait("!!document.querySelector('#pdf-language option[value=en]')");
  await run("document.querySelector('[data-view=products]').click();document.querySelector('#library-new-product').click();document.querySelector('[data-product-field=brand]').value='QA';document.querySelector('[data-product-field=model]').value='CREATED';document.querySelector('#save-product-btn').click()");
  await wait("!!document.querySelector('[data-library-row]')");
  let all=await records(),created=all.find(p=>p.model==='CREATED');assert(created,'UI create persisted');
  await reload();await run(`window.quoteApp.editProduct('${created.id}');document.querySelector('[data-product-field=model]').value='EDITED';document.querySelector('#save-product-btn').click()`);
  for(let i=0;i<100;i++){all=await records();if(all.some(p=>p.model==='EDITED'))break;await new Promise(r=>setTimeout(r,50));}assert(all.some(p=>p.model==='EDITED'),'edit persisted');
  for(let i=0;i<23;i++){const r=await fetch(base+'/api/products',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({brand:'QA',model:'PAGE-'+i,category:'工程机械',referencePrice:100,currency:'USD'})});assert(r.ok);}
  const totalCount=(await records()).length,remaining=totalCount-20;
  await reload();assert.equal(await run("document.querySelectorAll('[data-library-row]').length"),20);
  await run("document.querySelector('[data-library-select]').click();document.querySelector('[data-library-page=\"2\"]').click()");assert.equal(await run("document.querySelectorAll('[data-library-select]:checked').length"),0);
  assert.equal(await run("document.querySelectorAll('[data-library-row]').length"),remaining);
  await run("document.querySelector('#library-select-all').click()");
  const selected=await run("[...document.querySelectorAll('[data-library-select]:checked')].map(x=>x.dataset.librarySelect)");assert.equal(selected.length,remaining);
  await run("window.confirm=()=>false;document.querySelector('#library-delete-selected').click()");assert.equal((await records()).length,totalCount);
  await run("window.confirm=()=>true;document.querySelector('#library-delete-selected').click()");
  for(let i=0;i<100&&(await records()).length!==20;i++)await new Promise(r=>setTimeout(r,50));
  all=await records();assert.equal(all.length,20);assert(!all.some(p=>selected.includes(p.id)),'only selected removed');
  await reload();assert.equal(await run("document.querySelectorAll('[data-library-row]').length"),20);
  await run("document.querySelector('#library-template-filter').selectedIndex=1;document.querySelector('#library-template-filter').dispatchEvent(new Event('change',{bubbles:true}))");
  assert.equal(await run("document.querySelectorAll('[data-library-select]:checked').length"),0);
  assert(await run("[...document.querySelectorAll('.library-type-badge')].every(x=>x.textContent===document.querySelector('#library-template-filter').value)"),'category filter scope');
  await run("document.querySelector('#library-template-filter').value='';document.querySelector('#library-template-filter').dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('[data-create-document=quotation]').click();document.querySelector('[data-view=products]').click();document.querySelector('[data-library-use]').click();document.querySelector('#save-quote-btn').click()");
  await new Promise(r=>setTimeout(r,300));const q=(await(await fetch(base+'/api/quotations')).json()).quotations;assert(q.some(x=>x.items.some(i=>i.productId)),'reference persisted');
  await reload();assert.equal((await records()).length,20);
  const quoted=q.find(x=>x.items.some(i=>i.productId)),usedId=quoted.items.find(i=>i.productId).productId;
  const historyBefore=await(await fetch(base+'/api/quotations/'+quoted.id)).json();
  await run(`document.querySelector('[data-library-select="${usedId}"]').click();document.querySelector('#library-delete-selected').click()`);
  for(let i=0;i<100&&(await records()).length!==19;i++)await new Promise(r=>setTimeout(r,50));
  await reload();assert.equal((await records()).length,19);
  const inactive=(await(await fetch(base+'/api/products?includeInactive=true')).json()).products.find(p=>p.id===usedId);assert.equal(inactive.status,'Inactive');
  assert.deepEqual(await(await fetch(base+'/api/quotations/'+quoted.id)).json(),historyBefore,'referenced history retained');
  console.log('PASS library: UI create/edit and reload, pagination, selection reset, reject deletion, selected-only batch deletion, category scope, persisted reference and referenced deletion preserves history');
 }finally{win.destroy();server.close();app.quit();}
}).catch(e=>{console.error(e);app.exit(1);});
