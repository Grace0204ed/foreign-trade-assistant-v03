const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {_electron:electron}=require(process.env.PLAYWRIGHT_PATH||'playwright');
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fta-installed-test-'));
 const sourceLicense=path.join(process.env.APPDATA||'', 'foreign-trade-assistant','offline-license.json');
 if(!fs.existsSync(sourceLicense))throw new Error('Packaged UI test requires this computer to have an activated local license.');
 fs.copyFileSync(sourceLicense,path.join(dir,'offline-license.json'));
 const env={...process.env,QUOTE_DATA_DIR:dir,PATH:process.env.SystemRoot+';'+process.env.SystemRoot+'/System32'};
 delete env.ELECTRON_RUN_AS_NODE;
 const app=await electron.launch({executablePath:process.env.TEST_APP_EXE||path.resolve('dist/win-unpacked/外贸助手.exe'),env,timeout:60000});
 try{
  let page=await app.firstWindow();const errors=[],external=[];
  await page.waitForTimeout(3000);
  for(const candidate of app.windows())if(await candidate.locator('#view-home').count()){page=candidate;break;}
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{const u=route.request().url();if(/^https?:/.test(u)&&!/^http:\/\/127\.0\.0\.1:/.test(u)){external.push(u);return route.abort();}return route.continue();});
  await page.waitForSelector('#view-home',{state:'attached',timeout:60000});await page.reload();await page.waitForSelector('#view-home',{state:'attached',timeout:60000});await page.waitForTimeout(1500);if(errors.length)throw Error(errors.join('\n'));console.log('PAGE',page.url(),(await page.title()));await page.waitForFunction(()=>document.querySelector('#pdf-language option[value="fr"]'));
  assert.equal(await page.locator('#view-home .home-document-grid button').count(),6);
  assert.equal(await page.locator('[data-view-target="freight"],#quote-business-vehicle').count(),0);
  assert.equal(await page.locator('#global-freight-calculator').count(),1);
  await page.click('.freight-fab');await page.click('[data-mode="arithmetic"]');await page.fill('[data-expression]','5500+200+300');await page.press('[data-expression]','Enter');assert.match(await page.locator('[data-arithmetic-result]').innerText(),/6000/);await page.click('[data-close]');
  assert.equal(await page.locator('#latest-quote-prices-btn,#quote-route-btn,#document-type').count(),0);
  await page.click('[data-view-target="create"]');await page.click('[data-create-document="quotation"]');
  await page.fill('#buyer-company','OFFLINE PACKAGE TEST');await page.locator('[data-qfield="description"]').first().fill('Test machine');await page.locator('[data-qfield="unitPrice"]').first().fill('100');
  await page.click('#save-quote-btn');await page.waitForTimeout(500);
  const data=await page.evaluate(async()=>await(await fetch('/api/quotations')).json());assert.ok(data.quotations.some(x=>JSON.stringify(x).includes('OFFLINE PACKAGE TEST')));
  await page.evaluate(()=>document.fonts.ready);assert.equal(await page.evaluate(async()=>(await document.fonts.load('14px TradeOffline')).length),1,'offline font loaded');
  await page.locator('#quote-preview').screenshot({path:path.join(dir,'quotation.png')});
  await page.evaluate(()=>document.body.classList.add('printing-quote'));
  const pdf=await app.evaluate(async({BrowserWindow})=>Array.from(await BrowserWindow.getAllWindows()[0].webContents.printToPDF({printBackground:true,pageSize:'A4'})));
  fs.writeFileSync(path.join(dir,'quotation.pdf'),Buffer.from(pdf));assert.ok(pdf.length>10000);
  await page.goto(new URL('/crm',page.url()).href);await page.waitForTimeout(500);assert.ok((await page.locator('body').innerText()).includes('客户'));
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  console.log('PASS packaged EXE without Node in PATH, offline assets, local save, PDF and CRM. '+dir);
 }finally{await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
