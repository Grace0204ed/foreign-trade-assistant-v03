const {app,BrowserWindow}=require('electron');
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
process.env.QUOTE_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'fta-next-upgrade-'));
app.setPath('userData',path.join(process.env.QUOTE_DATA_DIR,'profile'));app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 const server=await require('../server').startServer(0),base='http://127.0.0.1:'+server.address().port;
 const win=new BrowserWindow({show:false,width:1440,height:1000,webPreferences:{backgroundThrottling:false}});
 const run=async s=>{try{return await win.webContents.executeJavaScript(s);}catch(error){throw Error(error.message+'\n'+s);}},wait=async s=>{for(let i=0;i<200;i++){if(await run(s))return;await new Promise(r=>setTimeout(r,40));}throw Error('Timeout '+s);};
 const errors=[];win.webContents.on('render-process-gone',(_e,d)=>errors.push(d.reason));
 try{
  const request=async(url,method='GET',body)=>{const response=await fetch(base+url,{method,headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const data=await response.json();assert(response.ok,JSON.stringify(data));return data;};
  await request('/api/agent-authorizations','POST',{id:'test-agreement',documentType:'agreement',authorizationNumber:'COM-TEST',agentName:'Test agent',country:'Zambia',language:'en',date:'2026-11-01'});
  const merged=await request('/api/history/documents?type=agreement','POST',{invitations:[]});assert.equal(merged.total,1);assert.equal(merged.quotations[0]._source,'agency');
  const invitationList=await request('/api/history/documents?type=invitation','POST',{invitations:[{id:'inv-test',number:'INV-TEST',date:'2026-11-01',contact:'Visitor',company:'Buyer',country:'Kenya'}]});assert.equal(invitationList.total,1);assert.equal(invitationList.quotations[0].buyer.company,'Buyer');
  await request('/api/agent-authorizations/test-agreement','DELETE');assert.equal((await request('/api/history/documents?type=agreement','POST',{invitations:[]})).total,0);assert.equal((await request('/api/agent-authorizations/test-agreement')).authorization.status,'Deleted');
  await win.loadURL(base);await wait('!!window.quoteSettingsContext');
  for(const type of ['quotation','invoice','contract','commercial','packing','invitation','authorization']){
   await run(`document.querySelector('[data-create-document=${type}]').click()`);
   const kind=type==='invitation'?'invitation':type==='authorization'?'agency':'quote';
   assert(await run(`(()=>{const g=document.querySelector('[data-tools-view=${kind}]');const l=g.querySelector('select');return !g.hidden&&!l.closest('label').hidden&&l.getBoundingClientRect().width>0&&g.textContent.includes('语言')&&g.textContent.includes('颜色')&&g.textContent.includes('文字样式')&&!!g.querySelector('.document-text-options input[type=color]')})()`),type+' has visible shared header tools');
  }
  await run("document.querySelector('[data-create-document=invoice]').click()");
  assert(!await run("!!document.querySelector('#quote-secondary-currency,#quote-fx-rate,#quote-currency-display')"));
  assert.equal(await run("document.querySelector('#quote-currency').closest('label').querySelector('span').textContent"),'货币');
  await run('document.fonts.ready.then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))');
  fs.writeFileSync(path.join(process.env.QUOTE_DATA_DIR,'pi-toolbar.png'),(await win.webContents.capturePage()).toPNG());
  await run("document.querySelector('[data-view=history]').click()");
  assert(!await run("!!document.querySelector('.history-kind-tabs')"));
  assert(await run("[...document.querySelector('#history-document-type').options].some(o=>o.value==='invitation')"));
  await run("document.querySelector('[data-view=settings]').click();document.querySelector('[data-settings-section=invoice-config]').click();document.querySelector('#settings-invoice-config-host [data-block=basic]').click();document.querySelector('#settings-invoice-config-host [data-refined-child]').click()");
  await wait("!!document.querySelector('.field-edit-modal [data-level]')");
  await run("const l=document.querySelector('.field-edit-modal [data-level]');l.value='1';l.dispatchEvent(new Event('change'));const n=document.querySelector('.field-edit-modal [data-field-prop=zh]');n.value='';n.focus()");
  win.webContents.sendInputEvent({type:'char',keyCode:'A'});await wait("document.querySelector('.field-edit-modal [data-field-prop=zh]').value==='A'");
  await run("document.querySelector('.field-edit-modal [data-level]').value='3';document.querySelector('.field-edit-modal [data-level]').dispatchEvent(new Event('change'));document.querySelector('.field-edit-modal [data-save]').click()");
  assert(await run("document.querySelector('.field-edit-error').textContent.includes('请选择所属字段')"));
  await run("document.querySelector('.field-edit-modal [data-close]').click();document.querySelector('#settings-invoice-config-host [data-block=terms]').click();[...document.querySelectorAll('#settings-invoice-config-host .refined-name')].find(b=>b.textContent.includes('贸易术语')).click();document.querySelector('#settings-invoice-config-host [data-refined-options]').click()");
  await run("document.querySelector('.refined-options [data-add]').click();const row=[...document.querySelectorAll('[data-option-index]')].at(-1);const input=row.querySelector('[data-o=labelZh]');input.value='删除回归测试';input.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('.refined-options [data-save]').click();document.querySelector('#settings-invoice-config-host [data-refined-options]').click()");
  const optionsBefore=await run("document.querySelectorAll('.refined-options [data-option-index]').length");
  await run("window.confirm=()=>true;document.querySelector('.refined-options [data-remove]').click()");
  assert.equal(await run("document.querySelectorAll('.refined-options [data-option-index]').length"),optionsBefore-1);
  await run("document.querySelector('.refined-options [data-save]').click();document.querySelector('#settings-invoice-config-host [data-document-save]').click()");
  await wait("!document.querySelector('.refined-options')");
  await run("document.querySelector('#settings-invoice-config-host [data-refined-options]').click()");
  assert.equal(await run("document.querySelectorAll('.refined-options [data-option-index]').length"),optionsBefore-1,'deleted option must stay hidden after reopening');
  await run("document.querySelector('.refined-options [data-close]').click()");
  await run("document.querySelector('[data-view=crm]').click()");await wait("document.querySelector('#crm-workspace-frame').contentDocument?.querySelector('.crm-table-wrap')");
  assert(await run("document.querySelector('.desktop-rail').getBoundingClientRect().width>0"));
  assert(await run("document.querySelector('#crm-workspace-frame').contentDocument.body.classList.contains('crm-embedded')"));
  await run("AppLock.hash('123456').then(pinHash=>AppLock.configure({enabled:true,pinHash,hint:'测试提示',autoLockMinutes:15})).then(()=>AppLock.lock())");
  assert.equal(await run("document.querySelector('#app-lock-heading').textContent"),'欢迎回来');
  await run("document.querySelector('[data-hint]').click()");assert.equal(await run("document.querySelector('[data-pin-hint]').textContent"),'测试提示');
  await run('document.fonts.ready.then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))');
  fs.writeFileSync(path.join(process.env.QUOTE_DATA_DIR,'lock.png'),(await win.webContents.capturePage()).toPNG());
  for(let n=0;n<5;n++){await run("document.querySelector('#application-lock-screen input').value='000000';document.querySelector('[data-unlock]').click()");await new Promise(r=>setTimeout(r,30));}
  assert(await run("document.querySelector('[data-unlock]').disabled"));
  const retry=await run("JSON.parse(localStorage.getItem('fta-app-lock-retries-v1'))");assert.equal(retry.stage,1);assert(retry.until>Date.now());
  await run("localStorage.setItem('fta-app-lock-retries-v1',JSON.stringify({failures:0,stage:1,until:0}));document.querySelector('#application-lock-screen input').value='123456';document.querySelector('#application-lock-screen input').disabled=false;document.querySelector('[data-unlock]').disabled=false;document.querySelector('[data-unlock]').click()");
  await wait("!document.querySelector('#application-lock-screen')");assert.equal(await run("localStorage.getItem('fta-app-lock-locked-v1')"),null);
  await run("document.querySelector('[data-view=settings]').click();document.querySelector('[data-settings-section=translation]').click()");
  assert.equal(await run("document.querySelectorAll('.language-template-cards [data-locale]').length"),9);
  assert.deepEqual(errors,[]);
  console.log('PASS seven header tools, single currency, unified history entry, embedded CRM, PIN hint/retry/unlock. Evidence: '+process.env.QUOTE_DATA_DIR);
 }finally{win.destroy();server.close();app.quit();}
}).catch(e=>{console.error(e);app.exit(1)});
