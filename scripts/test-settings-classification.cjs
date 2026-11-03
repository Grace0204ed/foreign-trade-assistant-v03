const {app,BrowserWindow}=require('electron');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const hierarchy=require('../assets/product-hierarchy');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fta-settings-classification-'));
process.env.QUOTE_DATA_DIR=dir;app.setPath('userData',path.join(dir,'profile'));app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 let win,server;
 try{
  server=await require('../server').startServer(0);const base='http://127.0.0.1:'+server.address().port;
  const request=async(url,method='GET',body)=>{const r=await fetch(base+url,{method,headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});assert.equal(r.status,200);return r.json();};
  await request('/api/products','POST',{category:'TLB / Backhoe Loader',brand:'JCB / 杰西博',model:'3CX'});
  const migration=await request('/api/products/reconcile-hierarchy','POST',{});
  const products=(await request('/api/products')).products;
  assert.deepEqual(hierarchy.path(migration.settings.productHierarchy,hierarchy.resolve(migration.settings.productHierarchy,products[0])[2]).map(n=>n.label),['机械设备','TLB','JCB / 杰西博']);
  assert(fs.existsSync(migration.backupPath));assert.equal((await request('/api/products/reconcile-hierarchy','POST',{})).changed,false);
  win=new BrowserWindow({show:false,width:1400,height:1000,webPreferences:{backgroundThrottling:false,offscreen:true}});
  win.webContents.on('console-message',(_e,level,message)=>{if(level>=2)console.log('Renderer:',message);});
  const run=s=>win.webContents.executeJavaScript(s);
  const wait=async s=>{for(let i=0;i<200;i++){if(await run(s))return;await new Promise(r=>setTimeout(r,50));}throw Error('Timeout '+s);};
  await win.loadURL(base);await wait("document.querySelectorAll('#overview-metrics article').length===4");console.log('Loaded');
  await run("document.querySelector('[data-view=settings]').click();document.querySelector('[data-settings-section=translation]').click()");
  await wait("!!document.querySelector('[data-top-language]')");
  await run("(()=>{const s=document.querySelector('[data-top-language]');s.value='ja';s.dispatchEvent(new Event('change',{bubbles:true}))})()");
  assert.match(await run("document.querySelector('[data-top-preview]').textContent"),/見積/);
  const titles={en:/Quotation/,fr:/Devis/,ja:/見積/,es:/Cotizaci/,ru:/предложен/i,ar:/عرض/,it:/Preventivo/,de:/Angebot/,ko:/견적/};
  for(const [language,expected] of Object.entries(titles)){
   await run(`(()=>{const s=document.querySelector('[data-top-language]');s.value=${JSON.stringify(language)};s.dispatchEvent(new Event('change',{bubbles:true}))})()`);
   assert.match(await run("document.querySelector('[data-sample-region=title]').textContent"),expected,language);
  }
  await run("(()=>{document.querySelector('[data-top-tab=text]').click();const c=document.querySelector('[data-top-text-color]');c.value='#bc602f';c.dispatchEvent(new Event('input',{bubbles:true}));const s=document.querySelector('[data-top-size]');s.value='19';s.dispatchEvent(new Event('input',{bubbles:true}))})()");
  assert.deepEqual(await run("(()=>{const s=getComputedStyle(document.querySelector('[data-sample-region=product]'));return [s.color,s.fontSize]})()"),['rgb(188, 96, 47)','19px']);
  await run("document.querySelector('[data-top-preview]').scrollIntoView({block:'center'});document.fonts.ready");
  await new Promise(r=>setTimeout(r,500));
  fs.writeFileSync(path.join(dir,'top-settings.png'),(await win.webContents.capturePage()).toPNG());
  await run("BusinessDataStore.set('quote_assistant_v01_settings',JSON.stringify({...quoteSettingsContext.settings,quotaTest:'x'.repeat(7*1024*1024)}));BusinessDataStore.flush()");
  await win.reload();await wait('!!window.quoteSettingsContext');
  assert.equal(await run("JSON.parse(BusinessDataStore.get('quote_assistant_v01_settings')).quotaTest.length"),7*1024*1024);
  assert.equal(await run("document.getElementById('library-template-filter')"),null);
  await run("document.querySelector('[data-view=products]').click()");
  await wait("!!document.querySelector('[data-library-edit]')");
  assert.equal(await run("document.querySelectorAll('.library-compact tbody tr').length"),1);
  assert.match(await run("document.querySelector('.library-compact tbody').textContent"),/TLB.*JCB/s);
  await run("document.querySelector('[data-library-edit]').click()");
  await wait("document.querySelectorAll('[data-product-hierarchy]').length===3");
  assert.equal(await run("getComputedStyle(document.querySelector('#product-template').closest('label')).display"),'none');
  assert.deepEqual(await run("[...document.querySelectorAll('[data-product-hierarchy]')].map(s=>s.selectedOptions[0].textContent)"),['机械设备','TLB','JCB / 杰西博']);
  console.log('Visual evidence:',dir);
  console.log('PASS: migration backup/idempotency, Japanese preview, product color/size, >7MB durable storage and removed legacy filter');
 }catch(error){console.error(error);process.exitCode=1;}finally{win?.destroy();server?.close();app.exit(process.exitCode||0);}
});
