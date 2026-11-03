const {app,BrowserWindow}=require('electron');
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
process.env.QUOTE_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'fta-lock-search-'));
app.setPath('userData',path.join(process.env.QUOTE_DATA_DIR,'profile'));
app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 const server=await require('../server').startServer(0),base='http://127.0.0.1:'+server.address().port;
 const win=new BrowserWindow({show:false,width:1440,height:1000,webPreferences:{backgroundThrottling:false}});
 const run=s=>win.webContents.executeJavaScript(s),wait=async s=>{for(let i=0;i<150;i++){if(await run(s))return;await new Promise(r=>setTimeout(r,50));}throw Error('Timeout '+s);};
 const request=async(url,method='GET',body)=>{const r=await fetch(base+url,{method,headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const data=await r.json();assert(r.ok,JSON.stringify(data));return data;};
 try{
  const fixtures=[{category:'挖掘机',brand:'QA',model:'20',values:{name:'吉布提设备',params:'特制液压系统'}},{category:'挖掘机',brand:'QA',model:'100',values:{name:'ENGLISH Loader',params:'Steel cabin'}},{category:'叉车',brand:'OTHER',model:'20',values:{name:'QA forklift'}}];
  for(const p of fixtures)await request('/api/products','POST',{...p,currency:'USD'});
  await win.loadURL(base);await wait("!!window.quoteSettingsContext && document.querySelectorAll('#overview-metrics article').length===4");
  const results=await run(`(async()=>{
   const previous={enabled:true,pinHash:await AppLock.hash('123456'),autoLockMinutes:15};
   const before=JSON.stringify(previous),fails=[];
   for(const input of [{enabled:false,current:'999999'},{enabled:true,current:'123456',pin:'5678',confirmPin:'5679'},{enabled:true,current:'123456',pin:'abc',confirmPin:'abc'}]){
    try{await AppLock.prepareSettings(previous,input);fails.push(false);}catch{fails.push(true);}
   }
   const disabled=await AppLock.prepareSettings(previous,{enabled:false,current:'123456',pin:'ignored',confirmPin:'different'});
   const changed=await AppLock.prepareSettings(previous,{enabled:true,current:'123456',pin:'6789',confirmPin:'6789'});
   const unchanged=await AppLock.prepareSettings(previous,{enabled:true,pin:'',confirmPin:'',hint:'保持原PIN'});
   return {fails,unmutated:JSON.stringify(previous)===before,disabled,changed,unchanged,expected:await AppLock.hash('6789')};
  })()`);
  assert.deepEqual(results.fails,[true,true,true]);assert(results.unmutated);assert(!results.disabled.enabled);assert.equal(results.changed.pinHash,results.expected);assert.equal(results.unchanged.pinHash,results.disabled.pinHash);assert(!('pin' in results.changed));
  await run(`quoteSettingsContext.save({applicationLock:${JSON.stringify(results.changed)}})`);
  await run("document.querySelector('[data-view=settings]').click();document.querySelector('[data-settings-section=data]').click()");
  await wait("!!document.querySelector('[data-lock-save]')");
  await run("document.querySelector('[data-lock-current]').value='6789';document.querySelector('[data-lock-enabled]').value='false';document.querySelector('[data-lock-pin]').value='1111';document.querySelector('[data-lock-confirm]').value='2222';document.querySelector('[data-lock-save]').click()");
  await wait('quoteSettingsContext.settings.applicationLock.enabled===false');
  assert.equal((await request('/api/settings')).settings.applicationLock.enabled,false);
  await win.reload();await wait("!!window.quoteSettingsContext && document.querySelectorAll('#overview-metrics article').length===4");
  assert(!await run("!!document.querySelector('#application-lock-screen')"));
  assert.equal(await run('quoteSettingsContext.settings.applicationLock.enabled'),false);
  await run("AppLock.configure({enabled:true,pinHash:quoteSettingsContext.settings.applicationLock.pinHash});AppLock.lock();document.querySelector('#application-lock-screen input').value='6789';document.querySelector('[data-lock-eye]').click()");
  assert.equal(await run("document.querySelector('#application-lock-screen input').value"),'6789');assert.equal(await run("document.querySelector('#application-lock-screen input').type"),'text');
  await run("document.querySelector('[data-lock-eye]').click();document.querySelector('[data-unlock]').click()");try{await wait("!document.querySelector('#application-lock-screen')");}catch(e){console.error(await run("({error:document.querySelector('.app-lock-error')?.textContent,lock:quoteSettingsContext.settings.applicationLock,retry:localStorage.getItem('fta-app-lock-retries-v1')})"));throw e;}
  await run("AppLock.configure({enabled:false});document.querySelector('[data-create-document=quotation]').click();document.querySelector('#open-product-picker-btn').click();document.querySelector('#product-picker-search').value='  特制液压  ';document.querySelector('#product-picker-search').dispatchEvent(new Event('input'))");
  const cards="[...document.querySelectorAll('#product-picker-list [data-pick-product]')].map(b=>b.closest('article')?.textContent||b.parentElement.textContent)";
  assert.equal((await run(cards)).length,1,'structured specification search');
  await run("document.querySelector('#product-picker-search').value=' english ';document.querySelector('#product-picker-search').dispatchEvent(new Event('input'))");assert.equal((await run(cards)).length,1,'case and trim');
  await run("document.querySelector('#product-picker-search').value='';document.querySelector('#product-picker-category').value='挖掘机';document.querySelector('#product-picker-brand').value='QA';document.querySelector('#product-picker-category').dispatchEvent(new Event('change'))");
  const ordered=await run("[...document.querySelectorAll('#product-picker-list [data-pick-product]')].map(b=>b.dataset.pickProduct)");
  const byId=new Map((await request('/api/products')).products.map(p=>[p.id,p]));
  assert.deepEqual(ordered.map(id=>byId.get(id).model),['20','100']);
  await run("document.querySelector('#close-product-picker-btn').click();document.querySelector('#open-product-picker-btn').click()");assert.equal(await run("document.querySelector('#product-picker-category').value"),'挖掘机');
  await run("document.querySelector('#close-product-picker-btn').click();document.querySelector('[data-create-document=invoice]').click();document.querySelector('#open-product-picker-btn').click()");
  assert.equal(await run("document.querySelector('#product-picker-search').value"),'');assert.equal(await run("document.querySelector('#product-picker-category').value"),'');
  assert.equal((await request('/api/products')).products.length,fixtures.length,'source records unchanged');
  console.log('PASS isolated lock validation/atomic candidate, disable persistence and reload, original PIN unlock and eye toggle, actual product picker structured search, combined filters, natural sort, reopen policy and document isolation. '+process.env.QUOTE_DATA_DIR);
 }finally{win.destroy();server.close();app.quit();}
}).catch(e=>{console.error(e);app.exit(1)});
