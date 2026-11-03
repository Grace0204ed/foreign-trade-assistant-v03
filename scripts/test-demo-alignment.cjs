const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'fta-demo-alignment-'));
process.env.QUOTE_DATA_DIR=path.join(temp,'data');app.setPath('userData',path.join(temp,'profile'));
app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 const server=await require('../server').startServer(0);
 const win=new BrowserWindow({show:false,width:1440,height:1050,webPreferences:{offscreen:true,backgroundThrottling:false}});
 const run=s=>win.webContents.executeJavaScript(s);
 const wait=async s=>{for(let i=0;i<200;i++){if(await run(s))return;await new Promise(r=>setTimeout(r,40));}throw Error('Timeout: '+s);};
 const shot=async name=>{await new Promise(r=>setTimeout(r,180));fs.writeFileSync(path.join(temp,name+'.png'),(await win.webContents.capturePage()).toPNG());};
 try{
  await win.loadURL('http://127.0.0.1:'+server.address().port);
  await wait('!!window.quoteSettingsContext && !!document.querySelector("#overview-metrics article")');
  await run(`document.querySelector('[data-view=settings]').click();document.querySelector('[data-settings-section=product-config]').click()`);
  await shot('product-settings');
  if(process.argv.includes('--baseline')){
   await run(`document.querySelector('[data-settings-section=translation]').click()`);await shot('top-settings');
   await run(`document.querySelector('[data-settings-section=data]').click()`);await shot('admin');
   await run(`document.querySelector('.freight-fab').click()`);await shot('calculator');
   console.log('BASELINE '+temp);return;
  }
  assert(await run(`!!document.querySelector('[data-hierarchy-labels]')`),'classification labels use a dialog');
  assert.equal(await run(`document.querySelectorAll('[data-level-name]').length`),0,'no always-visible classification name fields');
  await run(`document.querySelector('[data-hierarchy-labels]').click()`);
  assert.equal(await run(`document.querySelectorAll('[data-level-name]').length`),3);
  await run(`document.querySelector('[data-hierarchy-label-cancel]').click()`);
  await run(`document.querySelector('[data-hierarchy-next]').click()`);
  const box=await run(`(()=>{const n=document.querySelector('[data-hierarchy-handle]');const r=n.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  if(box){const original=await run(`document.querySelector('[data-hierarchy-row]').dataset.hierarchyRow`);
   win.webContents.sendInputEvent({type:'mouseMove',x:Math.round(box.x),y:Math.round(box.y)});
   win.webContents.sendInputEvent({type:'mouseDown',button:'left',clickCount:1,x:Math.round(box.x),y:Math.round(box.y)});
   for(let y=box.y+5;y<box.y+135;y+=12)win.webContents.sendInputEvent({type:'mouseMove',button:'left',x:Math.round(box.x),y:Math.round(y)});
   win.webContents.sendInputEvent({type:'mouseUp',button:'left',clickCount:1,x:Math.round(box.x),y:Math.round(box.y+135)});
   await wait(`document.querySelector('[data-hierarchy-row]').dataset.hierarchyRow!==${JSON.stringify(original)}`);
  }
  await run(`document.querySelector('[data-hierarchy-save]').click()`);
  await wait(`!!quoteSettingsContext.settings.productHierarchy`);
  await run(`document.querySelector('[data-product-settings-tab=specification]').click()`);
  assert(await run(`!!document.querySelector('[data-spec-settings-edit]')`));
  await run(`document.querySelector('[data-spec-settings-edit]').click()`);
  assert(await run(`!!document.querySelector('dialog[open] [data-add]')`));
  await run(`document.querySelector('dialog[open] [data-dismiss]').click()`);
  await run(`document.querySelector('[data-settings-section=translation]').click()`);
  assert.equal(await run(`document.querySelectorAll('[data-top-tab]').length`),3);
  await run(`document.querySelector('[data-top-tab=color]').click();document.querySelector('[data-top-color]').value='#237554';document.querySelector('[data-top-color]').dispatchEvent(new Event('input',{bubbles:true}))`);
  assert.equal(await run(`document.querySelector('[data-top-preview]').style.getPropertyValue('--sample-color')`),'#237554');
  await shot('top-color');
  await run(`document.querySelector('[data-top-tab=language]').click()`);await shot('top-language');
  await run(`document.querySelector('[data-top-tab=text]').click()`);await shot('top-text');
  await run(`document.querySelector('[data-settings-section=data]').click()`);await shot('admin');
  await run(`document.querySelector('.freight-fab').click()`);await shot('calculator');
  console.log('PASS demo alignment and real pointer sorting. Evidence: '+temp);
 }catch(e){console.error(e);console.error('Evidence: '+temp);process.exitCode=1;}
 finally{win.destroy();server.close();app.exit(process.exitCode||0);}
});
