const {app,BrowserWindow}=require('electron');
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fta-language-order-'));
process.env.QUOTE_DATA_DIR=path.join(dir,'data');
app.setPath('userData',path.join(dir,'profile'));
app.on('window-all-closed',()=>{});

app.whenReady().then(async()=>{
 const server=await require('../server').startServer(0),base='http://127.0.0.1:'+server.address().port;
 let win;
 const errors=[];
 const create=async partition=>{
  win=new BrowserWindow({show:false,width:1440,height:1100,webPreferences:{offscreen:true,backgroundThrottling:false,...(partition?{partition}:{})}});
  win.webContents.on('render-process-gone',(_e,details)=>errors.push(details.reason));
  await win.loadURL(base);
  await wait("!!window.quoteSettingsContext&&document.querySelectorAll('#overview-metrics article').length===4");
 };
 const run=async source=>{try{return await win.webContents.executeJavaScript(source);}catch(error){throw Error(error.message+'\n'+source);}};
 const wait=async source=>{for(let i=0;i<250;i++){if(await run(source))return;await new Promise(resolve=>setTimeout(resolve,35));}throw Error('Timeout '+source);};
 const open=async()=>{
  await run("document.querySelector('[data-view=settings]').click();document.querySelector('[data-settings-section=translation]').click();if(!document.querySelector('link[href*=\"language-order.css\"]')){const link=document.createElement('link');link.rel='stylesheet';link.href='/assets/language-order.css';document.head.append(link);}");
  await wait("!!document.querySelector('[data-language-code=ja]')");
  await run("document.querySelector('.top-language-list').scrollIntoView({block:'center'});document.fonts.ready.then(()=>true)");
  await new Promise(resolve=>setTimeout(resolve,70));
 };
 const order=()=>run("[...document.querySelectorAll('.top-language-list [data-language-code]')].map(row=>row.dataset.languageCode)");
 const drag=async(sourceCode,targetCode,drop=true)=>{
  await run("document.querySelector('.top-language-list').scrollIntoView({block:'center'})");
  const beforeOrder=await order();
  const coordinates=await run(`(()=>{const point=code=>{const row=document.querySelector('[data-language-code="'+code+'"]'),grip=row.querySelector('.top-language-handle'),r=grip.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}};return{source:point(${JSON.stringify(sourceCode)}),target:point(${JSON.stringify(targetCode)})}})()`);
  const start=coordinates.source,end=coordinates.target;
  win.webContents.sendInputEvent({type:'mouseMove',x:Math.round(start.x),y:Math.round(start.y)});
  win.webContents.sendInputEvent({type:'mouseDown',button:'left',clickCount:1,x:Math.round(start.x),y:Math.round(start.y)});
  for(let step=1;step<=12;step++){
   win.webContents.sendInputEvent({type:'mouseMove',button:'left',x:Math.round(start.x+(end.x-start.x)*step/12),y:Math.round(start.y+(end.y-start.y)*step/12)});
   await new Promise(resolve=>setTimeout(resolve,10));
  }
  await wait("!!document.querySelector('.language-order-ghost')");
  // Input injection is asynchronous; observe the settled live order before release.
  await new Promise(resolve=>setTimeout(resolve,200));
  const preview=await order();
  assert.notDeepEqual(preview,beforeOrder,'dragged row and its neighbors follow the pointer before release');
  if(!drop){win.webContents.sendInputEvent({type:'keyDown',keyCode:'Escape'});win.webContents.sendInputEvent({type:'keyUp',keyCode:'Escape'});}
  win.webContents.sendInputEvent({type:'mouseUp',button:'left',clickCount:1,x:Math.round(end.x),y:Math.round(end.y)});
  await wait("!document.querySelector('.language-order-ghost')");
  return preview;
 };
 try{
  await create();
  await run(`(async()=>{const s=quoteSettingsContext.settings;await quoteSettingsContext.save({languageSettings:{defaultLanguage:'bilingual',qaMetadata:'preserve',languages:Object.keys({zh:1,...DocumentLocales.languages}).map((code,index)=>({code,enabled:code!=='fr',sortOrder:index*10,qaField:'keep-'+code}))},documentPreferences:{defaults:{language:'bilingual',color:'#285fc1',typography:{product:{fontSize:12,fontWeight:400,color:'#203654'}}},overrides:{invitation:{language:'zh',color:'#135724'}}},documentColorPreferences:{quotation:'#285fc1',invitation:'#135724'},qaLanguageOrderSentinel:{unchanged:true}})})()`);
  await open();
  assert.equal(await run("document.querySelectorAll('[data-language-code]').length"),10);
  assert(!await run("!!document.querySelector('[data-language-move]')"),'old up/down controls removed');
  const initial=await order();
  await run("window.qaOrderPatches=[];window.qaOrderActive=0;window.qaOrderMax=0;window.qaOrderDelay=0;window.qaOrderFail=false;window.qaOrderSave=quoteSettingsContext.save;quoteSettingsContext.save=async patch=>{qaOrderPatches.push(structuredClone(patch));qaOrderActive++;qaOrderMax=Math.max(qaOrderMax,qaOrderActive);try{if(qaOrderDelay)await new Promise(r=>setTimeout(r,qaOrderDelay));if(qaOrderFail){qaOrderFail=false;throw Error('QA simulated write failure')}return await qaOrderSave(patch)}finally{qaOrderActive--}};const color=document.querySelector('[data-top-color]');color.value='#abcdef';color.dispatchEvent(new Event('input',{bubbles:true}));const size=document.querySelector('[data-top-size]');size.value='21';size.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('[data-language-toggle=en]').click()");
  const preview=await drag('ja','zh',false);
  assert.notDeepEqual(preview,initial,'other rows make space before release');
  assert.deepEqual(await order(),initial,'Escape restores the original row order');
  assert.equal(await run('qaOrderPatches.length'),0,'cancelled drag never saves');
  const expected=await drag('ja','zh');
  await wait("document.querySelector('[data-language-order-status]').textContent.includes('已自动保存')");
  assert.deepEqual(await run("quoteSettingsContext.settings.languageSettings.languages.map(row=>row.code)"),expected);
  const patches=await run('qaOrderPatches');
  assert.equal(patches.length,1);assert.deepEqual(Object.keys(patches[0]),['languageSettings'],'automatic save only patches language settings');
  assert.equal(patches[0].languageSettings.languages.find(row=>row.code==='en').enabled,true,'unsubmitted enable toggle is not saved by sorting');
  assert.equal(patches[0].languageSettings.languages.find(row=>row.code==='fr').enabled,false,'saved disabled language stays disabled');
  assert.equal(patches[0].languageSettings.qaMetadata,'preserve');
  assert.equal(patches[0].languageSettings.languages.find(row=>row.code==='ja').qaField,'keep-ja');
  assert.equal(await run("quoteSettingsContext.settings.documentPreferences.defaults.color"),'#285fc1','sorting does not save draft PDF color');
  assert.equal(await run("quoteSettingsContext.settings.documentPreferences.defaults.typography.product.fontSize"),12,'sorting does not save draft typography');
  assert.equal(await run("quoteSettingsContext.settings.documentPreferences.overrides.invitation.color"),'#135724','independent document defaults are retained');
  assert.equal(await run("document.querySelector('[data-top-color]').value"),'#abcdef','draft color remains in editor');
  assert.equal(await run("document.querySelector('[data-top-size]').value"),'21','draft typography remains in editor');
  assert.equal(await run("document.querySelector('[data-language-toggle=en]').getAttribute('aria-pressed')"),'false','unsubmitted language toggle remains in editor');
  assert(await run('quoteSettingsContext.settings.qaLanguageOrderSentinel.unchanged'));

  await run('qaOrderDelay=280');
  await drag('ko','en');
  const queued=await drag('it','zh');
  await wait('qaOrderActive===0&&qaOrderPatches.length>=3');
  assert.equal(await run('qaOrderMax'),1,'automatic order writes are serialized');
  assert.deepEqual(await run("quoteSettingsContext.settings.languageSettings.languages.map(row=>row.code)"),queued,'latest queued order wins');

  await run('qaOrderDelay=0;qaOrderFail=true');
  const failed=await drag('de','zh');
  await wait("!document.querySelector('[data-language-order-retry]').hidden");
  assert(await run("document.querySelector('[data-language-order-status]').textContent.includes('QA simulated write failure')"));
  await run("document.querySelector('[data-language-order-retry]').click()");
  await wait("document.querySelector('[data-language-order-status]').textContent.includes('已自动保存')");
  assert.deepEqual(await run("quoteSettingsContext.settings.languageSettings.languages.map(row=>row.code)"),failed);
  assert(await run("qaOrderPatches.every(patch=>Object.keys(patch).length===1&&!!patch.languageSettings)"),'retry also saves only language order');

  const disk=(await(await fetch(base+'/api/settings')).json()).settings;
  assert.deepEqual(disk.languageSettings.languages.map(row=>row.code),failed,'original settings endpoint persisted final order');
  assert.equal(disk.languageSettings.defaultLanguage,'bilingual');
  assert.equal(disk.documentPreferences.defaults.color,'#285fc1');
  assert.equal(disk.documentPreferences.overrides.invitation.language,'zh');
  win.destroy();
  // A fresh browser session has no previous local cache and re-reads settings
  // from the isolated database, as a restarted client does.
  await create('language-order-fresh-'+Date.now());await open();
  assert.deepEqual(await order(),failed,'fresh client restores order from persisted settings');
  assert.equal(await run("document.querySelectorAll('[data-language-toggle]').length"),10,'only supported languages remain');
  assert.equal(await run("quoteSettingsContext.settings.languageSettings.languages.find(row=>row.code==='en').enabled"),true,'unsaved enable draft is absent after reopening');
  assert.equal(await run("TranslationWorkspace.defaultLanguage(quoteSettingsContext.settings,'invitation')"),'zh');
  await run("const scope=document.querySelector('[data-top-scope]');scope.value='one';scope.dispatchEvent(new Event('change',{bubbles:true}));const type=document.querySelector('[data-top-type]');type.value='invoice';type.dispatchEvent(new Event('change',{bubbles:true}));const language=document.querySelector('[data-top-language]');language.value='en';language.dispatchEvent(new Event('change',{bubbles:true}));const color=document.querySelector('[data-top-color]');color.value='#205533';color.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('[data-top-save]').click()");
  await wait("quoteSettingsContext.settings.documentPreferences.overrides.invoice?.color==='#205533'");
  assert.equal(await run("quoteSettingsContext.settings.documentPreferences.defaults.color"),'#285fc1','existing explicit Save still preserves global defaults in independent scope');
  assert.equal(await run("TranslationWorkspace.defaultLanguage(quoteSettingsContext.settings,'invoice')"),'en');
  assert.equal(await run("TranslationWorkspace.defaultLanguage(quoteSettingsContext.settings,'invitation')"),'zh','unrelated independent language remains intact');
  assert.equal(await run("quoteSettingsContext.settings.languageSettings.qaMetadata"),'preserve','explicit Save preserves language metadata too');
  assert.deepEqual(errors,[]);
  console.log('PASS real pointer language drag/row movement/cancel, automatic serialized order-only save, unchanged style/enable drafts and settings, failure retry, original endpoint persistence, fresh-client reload. Isolated data: '+dir);
 }finally{if(win&&!win.isDestroyed())win.destroy();await new Promise(resolve=>server.close(resolve));app.quit();}
}).catch(error=>{console.error(error);app.exit(1);});
