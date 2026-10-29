const {app,BrowserWindow}=require('electron'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fta-library-qa-'));process.env.QUOTE_DATA_DIR=dir;app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{const {startServer}=require('../server');const server=await startServer(0),base='http://127.0.0.1:'+server.address().port;try{
 await fetch(base+'/api/products',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({category:'工程机械',brand:'CAT',model:'320D',params:'2017年 / 标准配置',referencePrice:26500,currency:'USD',status:'Active'})});
 const win=new BrowserWindow({show:false,width:1440,height:1040,webPreferences:{contextIsolation:true}});const errors=[];win.webContents.on('console-message',(_e,level,msg)=>{if(level===3)errors.push(msg);});
 await win.loadURL(base);for(let i=0;i<100;i++){if(await win.webContents.executeJavaScript("!!document.querySelector('#overview-metrics article')"))break;await new Promise(r=>setTimeout(r,100));}
 if(!await win.webContents.executeJavaScript("document.querySelectorAll('#overview-metrics article').length===4")){console.error(errors);console.error(await win.webContents.executeJavaScript("document.body.innerText.slice(-1500)"));}
 assert(await win.webContents.executeJavaScript("document.querySelectorAll('#overview-metrics article').length===4"),'home did not render');
 await new Promise(r=>setTimeout(r,400));fs.writeFileSync(path.join(dir,'home.png'),(await win.webContents.capturePage()).toPNG());
 await win.webContents.executeJavaScript("document.querySelector('[data-view=products]').click()");
 assert(await win.webContents.executeJavaScript("!!document.querySelector('.library-table tbody tr')"),'product row missing');
 await win.webContents.executeJavaScript("document.querySelector('[data-library-select]').click()");
 assert(await win.webContents.executeJavaScript("!document.querySelector('#library-delete-selected').disabled"),'selection not working');
 await new Promise(r=>setTimeout(r,400));fs.writeFileSync(path.join(dir,'library.png'),(await win.webContents.capturePage()).toPNG());
 await win.webContents.executeJavaScript("document.querySelector('[data-library-detail]').click()");
 assert(await win.webContents.executeJavaScript("!document.querySelector('#library-detail-modal').hidden&&!!document.querySelector('#library-detail-use')"),'detail missing');
 await new Promise(r=>setTimeout(r,400));fs.writeFileSync(path.join(dir,'detail.png'),(await win.webContents.capturePage()).toPNG());
 assert.equal(errors.length,0,errors.join('\n'));console.log(JSON.stringify({passed:true,dir}));win.destroy();
 }finally{server.close();app.quit();}}).catch(e=>{console.error(e);app.exit(1);});
