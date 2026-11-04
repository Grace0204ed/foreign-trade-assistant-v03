const {app,BrowserWindow}=require('electron');
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const out=fs.mkdtempSync(path.join(os.tmpdir(),'fta-scoped-options-'));
process.env.QUOTE_DATA_DIR=path.join(out,'data');app.setPath('userData',path.join(out,'profile'));app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 const server=await require('../server').startServer(0),base='http://127.0.0.1:'+server.address().port;
 const win=new BrowserWindow({show:false,width:1440,height:1100,webPreferences:{offscreen:true,backgroundThrottling:false}}),run=s=>win.webContents.executeJavaScript(s);
 win.webContents.on('console-message',event=>{if(event.level==='error')console.error('Renderer: '+event.message);});
 const wait=async s=>{for(let i=0;i<240;i++){if(await run(s))return;await new Promise(r=>setTimeout(r,50));}throw Error('Timeout '+s);};
 try{
  await win.loadURL(base);await wait('!!window.quoteSettingsContext && !!window.OptionManager && document.querySelectorAll("#overview-metrics article").length===4');
  await run(`document.querySelector('[data-view=settings]').click();quoteSettingsContext.openSettings('data');OptionManager.mount();OptionManager.mount()`);
  assert.equal(await run(`document.querySelectorAll('#option-catalog-manager').length`),0,'legacy global manager removed, including remount');
  assert.equal(await run(`document.querySelectorAll('[data-scoped-catalog=cryptoNetworks]').length`),0);
  await run(`quoteSettingsContext.openSettings('commission-config');document.querySelector('#settings-commission-config-host [data-block=terms]').click()`);
  assert.equal(await run(`document.querySelectorAll('[data-scoped-catalog=cryptoNetworks]').length`),1,'only commission settings can manage networks');
  await new Promise(resolve=>setTimeout(resolve,300));
  fs.writeFileSync(path.join(out,'commission-settings.png'),(await win.webContents.capturePage()).toPNG());
  await run(`document.querySelector('[data-scoped-catalog=cryptoNetworks]').click()`);
  assert(await run(`document.querySelector('.dictionary-modal').textContent.includes('TRC20') || !!document.querySelector('.dictionary-modal input[value=TRC20]')`));
  await run(`document.querySelector('.dictionary-modal [data-add]').click();const row=document.querySelector('.dictionary-modal tbody tr:last-child');for(const [key,value] of Object.entries({value:'QA-NETWORK',labelZh:'测试收款网络',labelEn:'QA Network'})){const el=row.querySelector('[data-key='+key+']');el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));}document.querySelector('.dictionary-modal [data-save]').click()`);
  await wait(`!document.querySelector('.dictionary-modal') && OptionCatalog.values(quoteSettingsContext.settings,'cryptoNetworks').includes('QA-NETWORK')`);
  await win.reload();await wait('!!window.quoteSettingsContext && !!window.OptionManager && document.querySelectorAll("#overview-metrics article").length===4');
  assert(await run(`OptionCatalog.values(quoteSettingsContext.settings,'cryptoNetworks').includes('QA-NETWORK')`),'network persisted after reload');
  await run(`document.querySelector('[data-create-document=statement]').click();document.querySelector('#agency-crypto-network').value='QA-NETWORK';document.querySelector('#agency-crypto-network').dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('#agency-payment-channel').value='crypto';document.querySelector('#agency-payment-channel').dispatchEvent(new Event('change',{bubbles:true}))`);
  assert(await run(`Array.from(document.querySelectorAll('#agency-network-options option')).some(o=>o.value==='QA-NETWORK')`),'network appears in actual settlement form');
  await run(`document.querySelector('#agency-payment-channel').dispatchEvent(new Event('input',{bubbles:true}))`);
  assert(await run(`quoteSettingsContext.outputHtml('agency').includes('QA-NETWORK')`),'network reaches final document rendering');
  for(const section of ['quotation-config','invoice-config','contract-config','commercial-config','packing-config']){
   await run(`document.querySelector('[data-view=settings]').click();quoteSettingsContext.openSettings('${section}');document.querySelector('[data-settings-panel="${section}"] [data-block=terms]').click()`);
   assert(await run(`!!document.querySelector('[data-settings-panel="${section}"] [data-scoped-ports]')`),section+' ports entry');
   assert(!await run(`!!document.querySelector('[data-settings-panel="${section}"] [data-scoped-catalog=cryptoNetworks]')`),section+' excludes networks');
  }
  assert.equal(await run(`document.querySelectorAll('#option-catalog-manager').length`),0);
  console.log('PASS scoped options: no global panel; settlement network edit/save/reload/form/output; document-specific ports. Evidence: '+out);
  win.destroy();server.close();app.exit(0);
 }catch(error){console.error(error);console.error('Evidence: '+out);win.destroy();server.close();app.exit(1);}
});
