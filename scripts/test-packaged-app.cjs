const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {_electron:electron}=require(process.env.PLAYWRIGHT_PATH||'playwright');
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fta-installed-test-'));
 const sourceLicense=path.join(process.env.APPDATA||'', 'foreign-trade-assistant','offline-license.json');
 if(!fs.existsSync(sourceLicense))throw new Error('Packaged UI test requires this computer to have an activated local license.');
 fs.copyFileSync(sourceLicense,path.join(dir,'offline-license.json'));
 const env={...process.env,QUOTE_DATA_DIR:dir,PATH:process.env.SystemRoot+';'+process.env.SystemRoot+'/System32'};
 delete env.ELECTRON_RUN_AS_NODE;
 let app=await electron.launch({executablePath:process.env.TEST_APP_EXE||path.resolve('dist/win-unpacked/外贸助手.exe'),env,timeout:60000});
 try{
  let page=await app.firstWindow();const errors=[],external=[];
  await page.waitForTimeout(3000);
  for(const candidate of app.windows())if(await candidate.locator('#view-home').count()){page=candidate;break;}
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{const u=route.request().url();if(/^https?:/.test(u)&&!/^http:\/\/127\.0\.0\.1:/.test(u)){external.push(u);return route.abort();}return route.continue();});
  await page.waitForSelector('#view-home',{state:'attached',timeout:60000});await page.reload();await page.waitForSelector('#view-home',{state:'attached',timeout:60000});await page.waitForTimeout(1500);if(errors.length)throw Error(errors.join('\n'));console.log('PAGE',page.url(),(await page.title()));await page.waitForFunction(()=>document.querySelector('#pdf-language option[value="fr"]'));
  assert.equal(await page.locator('#overview-metrics article').count(),4);
  const info=await page.evaluate(()=>window.quotationDesktop.getAppVersion());assert.equal(info.version,require('../package.json').version);assert.equal(info.packaged,true);
  assert.equal(await page.locator('[data-view-target="freight"],#quote-business-vehicle').count(),0);
  assert.equal(await page.locator('#global-freight-calculator').count(),1);
  await page.click('.freight-fab');await page.click('[data-mode="arithmetic"]');await page.fill('[data-expression]','5500+200+300');await page.press('[data-expression]','Enter');assert.match(await page.locator('[data-arithmetic-result]').innerText(),/6000/);await page.click('[data-close]');
  assert.equal(await page.locator('#latest-quote-prices-btn,#quote-route-btn,#document-type').count(),0);
  await page.click('.desktop-rail [data-view="create"]');await page.click('[data-create-document="quotation"]');
  await page.fill('#buyer-company','OFFLINE PACKAGE TEST');await page.locator('[data-qfield="description"]').first().fill('Test machine');await page.locator('[data-qfield="unitPrice"]').first().fill('100');
  await page.click('#save-quote-btn');await page.waitForTimeout(500);
  const data=await page.evaluate(async()=>await(await fetch('/api/quotations')).json());assert.ok(data.quotations.some(x=>JSON.stringify(x).includes('OFFLINE PACKAGE TEST')));
  await page.evaluate(()=>document.fonts.ready);assert.equal(await page.evaluate(async()=>(await document.fonts.load('14px TradeOffline')).length),1,'offline font loaded');
  await page.locator('#quote-preview').screenshot({path:path.join(dir,'quotation.png')});
  await page.evaluate(()=>document.body.classList.add('printing-standard'));
  const pdf=await app.evaluate(async({BrowserWindow})=>Array.from(await BrowserWindow.getAllWindows()[0].webContents.printToPDF({printBackground:true,pageSize:'A4'})));
  fs.writeFileSync(path.join(dir,'quotation.pdf'),Buffer.from(pdf));assert.ok(pdf.length>10000);
  await page.evaluate(()=>document.body.classList.remove('printing-standard'));
  // A failed final write must keep the actual desktop window open.
  await app.evaluate(({dialog})=>{dialog.showErrorBox=()=>{global.__qaCloseError=true;};});
  await page.route('**/api/work-drafts/**',route=>route.fulfill({status:500,contentType:'application/json',body:'{"ok":false,"message":"QA disk unavailable"}'}));
  await page.fill('#buyer-company','FAILED WRITE MUST STAY OPEN');
  await app.evaluate(({BrowserWindow})=>{BrowserWindow.getAllWindows()[0].close();});
  for(let i=0;i<100&&!await app.evaluate(()=>global.__qaCloseError===true);i++)await new Promise(r=>setTimeout(r,30));
  assert(await app.evaluate(()=>global.__qaCloseError===true),'failed close reports error');
  assert.equal(await page.locator('#buyer-company').inputValue(),'FAILED WRITE MUST STAY OPEN');
  await page.unroute('**/api/work-drafts/**');
  // Actual window close/relaunch, with the same local database and a different renderer.
  await page.fill('#buyer-company','PACKAGE CLOSE RECOVERY');
  await page.locator('[data-qfield="description"]').first().fill('UNSAVED CLOSE CONTENT');
  await app.evaluate(({BrowserWindow})=>{BrowserWindow.getAllWindows()[0].close();});
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('App did not close after flushing')),20000);if(app.process().exitCode!==null){clearTimeout(timer);resolve();}else app.process().once('exit',()=>{clearTimeout(timer);resolve();});});
  app=await electron.launch({executablePath:process.env.TEST_APP_EXE,env,timeout:60000});page=await app.firstWindow();
  await page.waitForSelector('#work-recovery-modal [data-resume]',{timeout:60000});
  await page.locator('#work-recovery-modal [data-resume]').first().click();
  await page.waitForFunction(()=>document.querySelector('#buyer-company').value==='PACKAGE CLOSE RECOVERY');
  assert.equal(await page.locator('[data-qfield="description"]').first().inputValue(),'UNSAVED CLOSE CONTENT');
  // Exercise the real IPC exporter with a predetermined directory, without OS-dialog automation.
  const exportFolder=path.join(dir,'batch');fs.mkdirSync(exportFolder);
  await app.evaluate(({dialog},folder)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[folder]});dialog.showSaveDialog=async()=>({canceled:true});},exportFolder);
  const token=await page.evaluate(()=>window.quotationDesktop.selectPdfDirectory());
  await page.evaluate(()=>document.body.classList.add('printing-standard'));
  const exported=await page.evaluate(async token=>[await window.quotationDesktop.exportBatchPdf(token,'same.pdf'),await window.quotationDesktop.exportBatchPdf(token,'same.pdf')],token);
  assert.equal(exported[0],path.join(exportFolder,'same.pdf'));assert.equal(exported[1],path.join(exportFolder,'same (1).pdf'));
  assert(fs.statSync(exported[0]).size>10000);assert(fs.statSync(exported[1]).size>10000);
  assert.equal(await page.evaluate(()=>window.quotationDesktop.exportCurrentPdf('cancel.pdf')),null);
  await page.evaluate(async token=>{await window.quotationDesktop.finishPdfBatch(token);document.body.classList.remove('printing-standard');},token);
  await assert.rejects(page.evaluate(token=>window.quotationDesktop.exportBatchPdf(token,'expired.pdf'),token),/重新选择/);
  console.log('PASS actual packaged window close/relaunch recovery and real PDF IPC: batch same-name isolation, cancel, grant revocation');
  await page.click('.desktop-rail [data-view="products"]');await page.click('#library-new-product');
  await page.locator('[data-product-field="model"]').fill('PACKAGE UNSAVED PRODUCT');await page.fill('#product-smart-paste','preserve partial import');
  await app.evaluate(({BrowserWindow})=>{BrowserWindow.getAllWindows()[0].close();});
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Product window close timed out')),20000);if(app.process().exitCode!==null){clearTimeout(timer);resolve();}else app.process().once('exit',()=>{clearTimeout(timer);resolve();});});
  app=await electron.launch({executablePath:process.env.TEST_APP_EXE,env,timeout:60000});page=await app.firstWindow();
  await page.waitForSelector('#work-recovery-modal article',{timeout:60000});
  await page.locator('#work-recovery-modal article').filter({hasText:'PACKAGE UNSAVED PRODUCT'}).locator('[data-resume]').click();
  await page.waitForFunction(()=>document.querySelector('[data-product-field="model"]').value==='PACKAGE UNSAVED PRODUCT');
  assert.equal(await page.locator('#product-smart-paste').inputValue(),'preserve partial import');
  console.log('PASS actual packaged product close/relaunch and unfinished import recovery');
  await page.goto(new URL('/crm',page.url()).href);await page.waitForTimeout(500);assert.ok((await page.locator('body').innerText()).includes('客户'));
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  console.log('PASS packaged EXE without Node in PATH, offline assets, local save, PDF and CRM. '+dir);
 }finally{const processHandle=app.process();await Promise.race([app.close(),new Promise(resolve=>setTimeout(resolve,10000))]);if(processHandle.exitCode===null)processHandle.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
