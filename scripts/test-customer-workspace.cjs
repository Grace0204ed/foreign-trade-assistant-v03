const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
process.env.QUOTE_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'fta-crm-workspace-'));
app.setPath('userData',path.join(process.env.QUOTE_DATA_DIR,'profile'));app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 const server=await require('../server').startServer(0),base='http://127.0.0.1:'+server.address().port;
 const win=new BrowserWindow({show:false,width:1360,height:1000,webPreferences:{contextIsolation:true,backgroundThrottling:false}});
 win.webContents.on('console-message',(_e,...args)=>{if(args.join(' ').includes('Error'))console.log('RENDERER',...args);});
 const run=s=>win.webContents.executeJavaScript(s),wait=async s=>{for(let i=0;i<200;i++){if(await run(s))return;await new Promise(r=>setTimeout(r,50));}throw Error('Timeout '+s);};
 const request=async(url,method='GET',body)=>{const r=await fetch(base+url,{method,headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const data=await r.json();assert(r.ok,JSON.stringify(data));return data;};
 try{
  const CW=require('../assets/customer-workspace');const initial=(await request('/api/settings')).settings;
  const config=CW.normalize(initial.customerWorkspace);config.fields.push({fieldKey:'crm_test',zh:'采购内部号',fieldType:'text',active:true,visible:true,sortOrder:999});
  config.fields.find(f=>f.fieldKey==='company').zh='买方公司';config.fields.reverse().forEach((f,i)=>f.sortOrder=i*10);config.groups=['新测试分组'];config.statuses=['需求确认中','测试状态'];
  await request('/api/settings','PUT',{...initial,customerWorkspace:config});
  const {id}=await request('/api/customers','POST',{name:'OLD CONTACT',company:'ORIGINAL COMPANY',country:'Kenya',phone:'+123',stage:'测试状态',group_name:'新测试分组',labels:['保留标签'],custom_fields:{crm_test:'STABLE-KEY',hidden_archive:'PRESERVED'},equipment_tags:['挖掘机']});
  await request('/api/customers/'+id+'/followups','POST',{content:'Existing history',next_follow_up:'2026-11-10'});
  await win.loadURL(base+'/crm/');await wait("!!document.querySelector('[data-crm-select]')");
  assert(!await run("document.body.textContent.includes('全部历史报价')"));
  await run("document.querySelector('[data-crm-select]').click()");await wait("!!document.querySelector('#crm-edit')");
  assert(await run("document.querySelector('.crm-detail').textContent.includes('STABLE-KEY')"));
  await run("document.querySelector('#crm-edit').click()");
  assert.equal(await run("document.querySelector('[data-customer-key=company]').value"),'ORIGINAL COMPANY');
  await run("document.fonts.ready.then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))");
  fs.writeFileSync(path.join(process.env.QUOTE_DATA_DIR,'edit-customer.png'),await win.webContents.capturePage().then(i=>i.toPNG()));
  await run("document.querySelector('[data-customer-key=company]').value='EDITED COMPANY';document.querySelector('.modal form')?.requestSubmit?.()||document.querySelector('form.modal').requestSubmit(document.querySelector('form.modal .primary'));");
  await wait("!document.querySelector('.modal-backdrop')&&document.querySelector('.crm-detail').textContent.includes('EDITED COMPANY')");
  const updated=await request('/api/customers/'+id);assert.equal(updated.company,'EDITED COMPANY');assert.equal(updated.custom_fields.hidden_archive,'PRESERVED');assert.equal(updated.custom_fields.crm_test,'STABLE-KEY');assert.equal(updated.follow_ups.length,1);assert.deepEqual(updated.equipment_tags,['挖掘机']);
  await run("document.querySelector('#crm-follow').click()");assert(!await run("document.querySelector('form.follow-modal').checkValidity()"),'blank followup must not pass');await run("document.querySelector('[name=content]').value='NEW FOLLOWUP';document.querySelector('[name=next_follow_up]').value='2026-11-12';document.querySelector('form.follow-modal').requestSubmit(document.querySelector('form.follow-modal .primary'))");await wait("document.querySelector('#notice').textContent.includes('跟进已完成')");
  assert.equal((await request('/api/customers/'+id)).follow_ups.length,2);
  await wait("!document.querySelector('.modal-backdrop')&&document.querySelector('.crm-detail').textContent.includes('NEW FOLLOWUP')");
  const paint=()=>run("document.fonts.ready.then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))");
  await paint();
  fs.writeFileSync(path.join(process.env.QUOTE_DATA_DIR,'customers.png'),await win.webContents.capturePage().then(i=>i.toPNG()));
  assert(!await run("!!document.querySelector('#crm-settings')"),'duplicate CRM settings entry removed');
  assert.equal(await run("document.querySelectorAll('[data-crm-overview]').length"),4);
  await run("document.querySelector('[data-crm-overview=week]').click()");
  assert.equal(await run("document.querySelector('[data-crm-overview=week]').getAttribute('aria-pressed')"),'true');
  assert(await run("document.querySelector('.crm-table-wrap').textContent.includes('EDITED COMPANY')"),'weekly overview includes the saved followup');
  await run("document.querySelector('[data-crm-overview=all]').click()");
  await win.loadURL(base+'/index.html?settings=customer-config');await wait("!!document.querySelector('[data-crm-tab]')&&document.querySelector('#settings-customer-config-host').getBoundingClientRect().height>0&&document.querySelector('#view-settings').classList.contains('active')");
  assert(await run("[...document.querySelectorAll('[data-crm-name]')].some(el=>el.value==='买方公司')"),'settings loaded from persisted configuration, not defaults');
  await run("document.querySelector('[data-crm-tab=groups]').click()");assert.equal(await run("document.querySelectorAll('[data-crm-option]').length"),1);
  await run("document.querySelector('[data-crm-option]').value='保存后的分组';document.querySelector('[data-crm-option]').dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('[data-crm-save]').click()");await wait("document.querySelector('[data-crm-status]').textContent==='已保存'");
  assert.equal((await request('/api/settings')).settings.customerWorkspace.groups[0],'保存后的分组');
  await paint();fs.writeFileSync(path.join(process.env.QUOTE_DATA_DIR,'settings.png'),await win.webContents.capturePage().then(i=>i.toPNG()));
  await win.reload();await wait("!!document.querySelector('[data-crm-tab]')");await run("document.querySelector('[data-crm-tab=groups]').click()");assert.equal(await run("document.querySelector('[data-crm-option]').value"),'保存后的分组');
  // Reorder through the actual drag/drop handlers and hide a field, then reload CRM.
  await run("(()=>{document.querySelector('[data-crm-tab=fields]').click();const rows=document.querySelectorAll('[data-crm-order]');const transfer=new DataTransfer();rows[0].dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer:transfer}));rows[2].dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:transfer}));})()");
  await run("(()=>{const rows=[...document.querySelectorAll('[data-crm-name]')];const country=rows.find(el=>el.value==='国家/地区').closest('[data-crm-order]');const box=country.querySelector('[data-crm-visible]');box.checked=false;box.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('[data-crm-save]').click()})()");
  await wait("document.querySelector('[data-crm-status]').textContent==='已保存'");
  const persisted=(await request('/api/settings')).settings;assert.equal(CW.normalize(persisted.customerWorkspace).fields[2].fieldKey,'crm_test');
  await win.loadURL(base+'/crm/');await wait("!!document.querySelector('[data-crm-select]')");await run("document.querySelector('[data-crm-select]').click()");await wait("!!document.querySelector('#crm-edit')");
  assert(!await run("document.querySelector('.crm-detail dl').textContent.includes('国家/地区')"));
  await run("document.querySelector('#crm-edit').click()");assert(!await run("!!document.querySelector('[data-customer-key=country]')"));
  assert(await run("[...document.querySelector('[name=group_name]').options].some(o=>o.value==='新测试分组')"),'removed group still available for existing customer');
  await run("document.querySelector('form.modal .primary').click()");await wait("!document.querySelector('.modal-backdrop')");assert.equal((await request('/api/customers/'+id)).country,'Kenya');
  await win.loadURL(base+'/index.html?settings=customer-config');await wait("!!document.querySelector('[data-crm-tab]')");await run("document.querySelector('[data-settings-section=invoice-config]').click()");await wait("!!document.querySelector('#settings-invoice-config-host .refined-row')&&document.querySelector('#settings-invoice-config-host').getBoundingClientRect().height>0");
  assert(!await run("!!document.querySelector('#settings-invoice-config-host [data-document-fields] table')"),'document settings use demo master/detail, not legacy table');
  await run("document.querySelector('#settings-invoice-config-host [data-refined-prop=zh]').value='测试发票编号';document.querySelector('#settings-invoice-config-host [data-refined-prop=zh]').dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('#settings-invoice-config-host [data-document-save]').click()");
  await wait("window.quoteSettingsContext.settings.documentConfigs.invoice.blocks.basic[0].zh==='测试发票编号'");
  // Verify persisted server data, not just the current UI reference.
  for(let i=0;i<100;i++){if((await request('/api/settings')).settings.documentConfigs?.invoice?.blocks.basic[0].zh==='测试发票编号')break;await new Promise(r=>setTimeout(r,50));}
  assert.equal((await request('/api/settings')).settings.documentConfigs.invoice.blocks.basic[0].zh,'测试发票编号');
  await run("document.querySelector('#settings-invoice-config-host [data-block=terms]').click()");
  assert.equal(await run("document.querySelector('#settings-invoice-config-host [data-refined-prop=fieldType]').selectedOptions[0].textContent"),'多行文字');
  await paint();fs.writeFileSync(path.join(process.env.QUOTE_DATA_DIR,'document-settings.png'),await win.webContents.capturePage().then(i=>i.toPNG()));
  const termsBefore=await run("document.querySelectorAll('#settings-invoice-config-host [data-refined-id]').length");
  await run("document.querySelector('#settings-invoice-config-host [data-refined-child]').click()");
  assert.equal(await run("document.querySelector('.field-edit-modal h3').textContent"),'新增字段');
  await run("document.querySelector('.field-edit-modal [data-close]').click()");
  assert.equal(await run("document.querySelectorAll('#settings-invoice-config-host [data-refined-id]').length"),termsBefore,'cancel must not insert a phantom child');
  await run("(()=>{const host=document.querySelector('#settings-invoice-config-host');[...host.querySelectorAll('.refined-name')].find(b=>b.textContent.includes('贸易术语')).click();host.querySelector('[data-refined-options]').click();document.querySelector('.refined-options [data-add]').click();const row=[...document.querySelectorAll('[data-option-index]')].at(-1);const zh=row.querySelector('[data-o=labelZh]');zh.value='测试贸易方式';zh.dispatchEvent(new Event('input',{bubbles:true}));})()");
  assert(await run("document.querySelector('[data-option-preview]').textContent.includes('测试贸易方式')"),'live bilingual options preview');
  await paint();fs.writeFileSync(path.join(process.env.QUOTE_DATA_DIR,'options.png'),await win.webContents.capturePage().then(i=>i.toPNG()));
  await run("document.querySelector('.refined-options [data-save]').click()");assert(!await run("!!document.querySelector('.refined-options')"),'option saved without requiring internal value input');
  for(const type of ['quotation','invoice','contract','commercial','packing','invitation','agency']){
    await run(`document.querySelector('[data-settings-section=${type}-config]').click()`);
    assert(await run(`!!document.querySelector('#settings-${type}-config-host .refined-workspace')`),type+' uses approved settings layout');
  }
  await run("document.querySelector('[data-settings-section=invoice-config]').click();document.querySelector('#settings-invoice-config-host [data-block=basic]').click();[...document.querySelectorAll('#settings-invoice-config-host .refined-name')].find(b=>b.textContent.includes('PDF')).click();document.querySelector('#settings-invoice-config-host [data-refined-options]').click()");
  assert.equal(await run("document.querySelectorAll('.refined-options [data-option-index]').length"),require('../assets/document-locales.js').options().length,'all built-in PDF languages and retained bilingual modes are visible in settings');
  await run("document.querySelector('.refined-options [data-save]').click();document.querySelector('#settings-invoice-config-host [data-document-save]').click()");
  console.log('PASS customer fields/reorder/settings reload/edit/history preservation/followup/independent UI and refined document settings persistence. Evidence: '+process.env.QUOTE_DATA_DIR);
 }finally{win.destroy();await new Promise(r=>server.close(r));app.quit();}
}).catch(e=>{console.error(e);app.exit(1)});
