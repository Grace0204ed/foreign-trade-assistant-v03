const {app,BrowserWindow}=require('electron'),assert=require('assert/strict'),fs=require('fs'),os=require('os'),path=require('path');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fta-drafts-v4-'));process.env.QUOTE_DATA_DIR=path.join(dir,'data');app.setPath('userData',path.join(dir,'profile'));app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{const server=await require('../server').startServer(0),base='http://127.0.0.1:'+server.address().port,win=new BrowserWindow({show:false,width:1500,height:1000}),run=async s=>{try{return await win.webContents.executeJavaScript(s);}catch(error){throw Error(error.message+"\n"+s);}};
const wait=async s=>{for(let i=0;i<240;i++){if(await run(s))return;await new Promise(r=>setTimeout(r,40));}throw Error('Timeout '+s);};
 const drafts=async()=>{const r=await fetch(base+'/api/work-drafts');return (await r.json()).drafts.filter(r=>!r.completedAt);};
 const set=async(id,value)=>run(`(()=>{const e=document.getElementById('${id}');e.value=${JSON.stringify(value)};e.dispatchEvent(new Event('input',{bubbles:true}));})()`);
 try{
  await win.loadURL(base);await wait('!!document.querySelector("#document-draft-box")');await run(`document.querySelector('[data-create-document=quotation]').click()`);
  await run(`document.querySelector('[data-view=home]').click()`);assert(!await run('!!document.querySelector("#leave-work-modal")'),'blank has no prompt');assert.equal((await drafts()).length,0);
  await run(`document.querySelector('[data-create-document=quotation]').click()`);await set('buyer-company','DRAFT ONLY QA');await run(`document.querySelector('[data-view=home]').click()`);await wait('!!document.querySelector("#leave-work-modal")');
  await run(`document.querySelector('[data-leave-cancel]').click()`);assert(await run('document.querySelector("#view-quote").classList.contains("active")'));
  await run(`document.querySelector('[data-view=home]').click();document.querySelector('[data-leave-save]').click()`);await wait('document.querySelector("#view-home").classList.contains("active")');
  let list=await drafts();assert(list.some(r=>r.category==='draft'&&r.data.buyer.company==='DRAFT ONLY QA'));assert.equal((await (await fetch(base+'/api/quotations')).json()).quotations.length,0,'draft not history');
  await run(`document.querySelector('[data-create-document=invitation]').click()`);await set('invitation-name','SECOND DRAFT QA');await run(`document.querySelector('[data-view=home]').click();document.querySelector('[data-leave-save]').click()`);await wait('document.querySelector("#view-home").classList.contains("active")');
  list=await drafts();assert.equal(list.filter(r=>r.category==='draft').length,2,'two tasks independently saved');
  await new Promise(resolve=>{win.webContents.once('did-finish-load',resolve);win.reload();});await wait('!!document.querySelector("#document-draft-box")');await run(`document.querySelector('#document-draft-box').click()`);await wait('!!document.querySelector("#work-recovery-modal [data-resume]")');
  await run(`(()=>{const row=[...document.querySelectorAll('#work-recovery-modal article')].find(r=>r.textContent.includes('SECOND DRAFT QA'));row.querySelector('[data-resume]').click()})()`);await wait(`document.querySelector('#invitation-name').value==='SECOND DRAFT QA'`);
  await wait('!document.querySelector("#work-recovery-modal")');await set('invitation-name','UNSAVED MODIFICATION');await run(`document.querySelector('[data-view=home]').click()`);await wait('!!document.querySelector("[data-leave-discard]")');await run(`document.querySelector('[data-leave-discard]').click()`);await wait('document.querySelector("#view-home").classList.contains("active")');
  list=await drafts();assert(list.some(r=>r.category==='draft'&&r.data.visitorName==='SECOND DRAFT QA'));assert(!list.some(r=>r.data.visitorName==='UNSAVED MODIFICATION'));
  console.log('PASS blank/no-change navigation, cancel, save draft only, two independent drafts, reload recovery, discard retains prior draft and original history');
 }finally{win.destroy();await new Promise(r=>server.close(r));app.quit();}
}).catch(error=>{console.error(error);app.exit(1);});
