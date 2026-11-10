const {app,BrowserWindow}=require('electron');
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const output=fs.mkdtempSync(path.join(os.tmpdir(),'fta-field-roundtrip-'));
process.env.QUOTE_DATA_DIR=path.join(output,'data');
app.setPath('userData',path.join(output,'profile'));
app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 const server=await require('../server').startServer(0),base='http://127.0.0.1:'+server.address().port;
 const win=new BrowserWindow({show:false,width:1440,height:1000,webPreferences:{backgroundThrottling:false}});
 const errors=[],results=[],run=s=>win.webContents.executeJavaScript(s);
 win.webContents.on('console-message',(_event,level,message)=>{if(level===3)errors.push(message);});
 win.webContents.on('render-process-gone',(_event,details)=>errors.push(details.reason));
 const wait=async predicate=>{for(let i=0;i<200;i++){if(await run(predicate))return;await new Promise(resolve=>setTimeout(resolve,50));}throw Error('Timeout '+predicate);};
 const get=async url=>(await fetch(base+url)).json();
 try{
  await win.loadURL(base);await wait('!!window.quoteSettingsContext && document.querySelectorAll("#overview-metrics article").length===4');
  for(const type of ['quotation','invoice','contract','commercial','packing','invitation','agency'])await run(`document.querySelector('[data-view=settings]').click();document.querySelector('[data-settings-section=${type}-config]').click()`);
  await run(`(async()=>{const s=structuredClone(window.quoteSettingsContext.settings);for(const c of [...Object.values(s.documentConfigs),...Object.values(s.quoteTemplateConfigs||{})]){
   c.blocks.basic.push({id:'roundtrip-ref',fieldKey:'roundtrip_ref',zh:'测试邀请负责人',en:'Roundtrip Reference',fieldType:'text',visible:true,active:true,sortOrder:900,defaultValue:'DEFAULT-REF'});
   c.blocks.basic.push({id:'roundtrip-zero',fieldKey:'roundtrip_zero',zh:'零值',en:'Zero Value',fieldType:'number',visible:true,active:true,sortOrder:910,defaultValue:0});
   c.blocks.basic.push({id:'roundtrip-flag',fieldKey:'roundtrip_flag',zh:'确认开关',en:'Confirmation',fieldType:'checkbox',visible:true,active:true,sortOrder:920,defaultValue:false});
   c.blocks.customer.push({id:'roundtrip-choice',fieldKey:'roundtrip_choice',zh:'客户来源',en:'Customer Source',fieldType:'select',visible:true,active:true,sortOrder:900,defaultValue:'A',options:[{id:'A',value:'A',labelZh:'推荐',labelEn:'Referral',active:true},{id:'B',value:'B',labelZh:'展会',labelEn:'Exhibition',active:true}]});
   const customerField=c.blocks.customer.find(f=>f.fieldKey==='visitorName')||c.blocks.customer[0];customerField.zh='已改名客户';customerField.en='Renamed Customer';
  }await window.quoteSettingsContext.save(s)})()`);
  await win.reload();await wait('!!window.quoteSettingsContext && document.querySelectorAll("#overview-metrics article").length===4');
  for(const type of ['quotation','invoice','contract','commercial','packing','invitation','agency']){
   await run(`document.querySelector('[data-create-document=${type==='agency'?'authorization':type}]').click()`);
   const standalone=['invitation','agency'].includes(type),area=standalone?'view-'+type:'view-quote',preview=standalone?type+'-preview':'quote-preview';
   const ref=standalone?'data-standalone-field':'data-basic-custom',choice=standalone?'data-standalone-field':'data-buyer-custom';
   const field=key=>`#${area} [${ref}="${key}"]`;
   assert.equal(await run(`document.querySelector('${field('roundtrip_ref')}')?.value`),'DEFAULT-REF',type+' default');
   assert.equal(await run(`document.querySelector('${field('roundtrip_zero')}')?.value`),'0',type+' zero default');
   assert.equal(await run(`document.querySelector('#${area} [${choice}="roundtrip_choice"]')?.tagName`),'SELECT',type+' dropdown');
   await run(`(()=>{const i=document.querySelector('${field('roundtrip_ref')}');i.value='SAVED-${type}';i.dispatchEvent(new Event('input',{bubbles:true}));const c=document.querySelector('#${area} [${choice}="roundtrip_choice"]');c.value='B';c.dispatchEvent(new Event('change',{bubbles:true}));})()`);
   await wait(`document.getElementById('${preview}').textContent.includes('SAVED-${type}')`);
   assert(await run(`document.getElementById('${preview}').textContent.includes('${type==='invitation'?'展会':'Exhibition'}')`),type+' dropdown label in preview');
   assert(await run(`document.getElementById('${preview}').textContent.includes('${type==='invitation'?'已改名客户':'Renamed Customer'}')`),type+' renamed heading in preview');
   if(type==='agency')await run(`for(const [id,value]of Object.entries({'agency-agent-name':'Test Agent','agency-country':'Zambia','agency-id-number':'ID-TEST','agency-phone':'+260700000000','agency-email':'test@example.com'})){document.getElementById(id).value=value;}document.querySelector('#agency-product-options input').checked=true`);
   const save=type==='invitation'?'save-invitation-btn':type==='agency'?'agency-save-btn':'save-quote-btn';
   await run(`document.getElementById('${save}').click()`);
   let record;
   for(let attempt=0;attempt<120;attempt++){
    const data=await get(type==='invitation'?'/api/system/browser-state':type==='agency'?'/api/agent-authorizations':'/api/quotations');
    const rows=type==='invitation'?data.state?.invitations||[]:type==='agency'?data.authorizations||[]:data.quotations||[];
    for(const row of rows){const full=standalone?row:await get('/api/quotations/'+row.id);if(JSON.stringify(full).includes('SAVED-'+type)){record={row,full};break;}}
    if(record)break;await new Promise(resolve=>setTimeout(resolve,50));
   }
   assert(record,type+' persisted record');
   await wait(`document.querySelector('${field('roundtrip_ref')}')?.value==='SAVED-${type}'`);
   const cls=type==='invitation'?'printing-invitation':type==='agency'?'printing-agency':'printing-standard';
   await run(`document.body.classList.add('${cls}')`);
   fs.writeFileSync(path.join(output,type+'.pdf'),await win.webContents.printToPDF({printBackground:true,pageSize:'A4'}));
   await run(`document.body.classList.remove('${cls}')`);
   if(!standalone){
    await run(`window.quoteApp.editQuote('${record.row.id}')`);
    await wait(`document.querySelector('${field('roundtrip_ref')}')?.value==='SAVED-${type}'`);
    assert.equal(await run(`document.querySelector('#${area} [${choice}="roundtrip_choice"]').value`),'B',type+' reopened choice');
   }else{
    await run(`document.querySelector('[data-view=history]').click();document.getElementById('history-document-type').value='${type==='agency'?'authorization':type}';document.getElementById('history-document-type').dispatchEvent(new Event('change',{bubbles:true}))`);
    await wait(`document.querySelector('#unified-history-list tr')?.textContent.includes('${type==='agency'?record.row.authorizationNumber:'商务邀请函'}')`);
    await run(`document.querySelector('#unified-history-list .history-actions button').click()`);
    await wait(`document.querySelector('#${area}.active ${'['+ref+'="roundtrip_ref"]'}')?.value==='SAVED-${type}'`);
    await run('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    await run(`document.getElementById('${area}').scrollIntoView()`);
    fs.writeFileSync(path.join(output,type+'-editor.png'),(await win.webContents.capturePage()).toPNG());
    assert.equal(await run(`getComputedStyle(document.getElementById('${area}')).display`),'block',type+' stacked layout');
   }
   results.push({type,persisted:true,default:true,dropdown:true,livePreview:true,pdf:path.join(output,type+'.pdf')});
  }
  assert.deepEqual(errors,[],'browser errors');
  fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(results,null,2));
  console.log('PASS seven document types: defaults, editable custom fields, dropdown labels, live preview, durable storage, seven history roundtrips, and seven PDFs. '+output);
 }finally{win.destroy();server.close();app.quit();}
}).catch(error=>{console.error(error);app.exit(1);});
